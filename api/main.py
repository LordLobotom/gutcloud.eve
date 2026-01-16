import json
import os
import random
import time
from collections import deque
from datetime import datetime, timezone
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from fastapi import FastAPI, HTTPException, Query

BASE = "https://esi.evetech.net/latest"
USER_AGENT = "gutcloud-eve-scan/0.1"
DEFAULT_START_SYSTEM = 30000142

CACHE_DIR = os.getenv("CACHE_DIR", "/data")
CACHE_TTL = int(os.getenv("SCAN_CACHE_TTL", "300"))
ESI_SLEEP = float(os.getenv("ESI_SLEEP", "0.05"))
ESI_RETRIES = int(os.getenv("ESI_RETRIES", "2"))
ESI_TIMEOUT = int(os.getenv("ESI_TIMEOUT", "30"))

app = FastAPI()

scan_cache = {}


def utc_now():
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


class EsiClient:
    def __init__(self, cache_path, sleep_seconds=0.05, retries=2, timeout=30):
        self.cache_path = cache_path
        self.sleep_seconds = sleep_seconds
        self.retries = retries
        self.timeout = timeout
        self.cache = self._load_cache()

    def _load_cache(self):
        if not self.cache_path or not os.path.exists(self.cache_path):
            return {
                "systems": {},
                "constellations": {},
                "stargates": {},
                "names": {},
            }
        with open(self.cache_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        data.setdefault("systems", {})
        data.setdefault("constellations", {})
        data.setdefault("stargates", {})
        data.setdefault("names", {})
        return data

    def save_cache(self):
        if not self.cache_path:
            return
        os.makedirs(os.path.dirname(self.cache_path), exist_ok=True)
        with open(self.cache_path, "w", encoding="utf-8") as f:
            json.dump(self.cache, f, indent=2, sort_keys=True)

    def _fetch_json(self, path, params=None, method="GET", body=None):
        if params:
            url = f"{BASE}{path}?{urlencode(params)}"
        else:
            url = f"{BASE}{path}"
        headers = {"User-Agent": USER_AGENT}
        if method == "POST":
            headers["Content-Type"] = "application/json"
        for attempt in range(self.retries + 1):
            try:
                req = Request(url, data=body, headers=headers, method=method)
                with urlopen(req, timeout=self.timeout) as resp:
                    payload = json.loads(resp.read().decode("utf-8"))
                    resp_headers = dict(resp.headers)
                time.sleep(self.sleep_seconds)
                return payload, resp_headers
            except Exception:
                if attempt >= self.retries:
                    raise
                time.sleep(self.sleep_seconds * (attempt + 1))
        return None, {}

    def get_json(self, path, params=None):
        return self._fetch_json(path, params=params, method="GET")

    def post_json(self, path, body):
        data = json.dumps(body).encode("utf-8")
        return self._fetch_json(path, method="POST", body=data)

    def get_system(self, system_id):
        key = str(system_id)
        if key in self.cache["systems"]:
            return self.cache["systems"][key]
        data, _ = self.get_json(f"/universe/systems/{system_id}/")
        self.cache["systems"][key] = data
        return data

    def get_constellation(self, constellation_id):
        key = str(constellation_id)
        if key in self.cache["constellations"]:
            return self.cache["constellations"][key]
        data, _ = self.get_json(f"/universe/constellations/{constellation_id}/")
        self.cache["constellations"][key] = data
        return data

    def get_stargate(self, stargate_id):
        key = str(stargate_id)
        if key in self.cache["stargates"]:
            return self.cache["stargates"][key]
        data, _ = self.get_json(f"/universe/stargates/{stargate_id}/")
        self.cache["stargates"][key] = data
        return data

    def resolve_names(self, ids):
        missing = [i for i in ids if str(i) not in self.cache["names"]]
        if missing:
            payload, _ = self.post_json("/universe/names/", missing)
            for entry in payload:
                if "id" in entry and "name" in entry:
                    self.cache["names"][str(entry["id"])] = entry["name"]
        return {i: self.cache["names"].get(str(i)) for i in ids}

    def resolve_system_id(self, name):
        if not name:
            return None
        payload, _ = self.get_json(
            "/search/",
            {"categories": "system", "search": name, "strict": "true"},
        )
        systems = payload.get("systems") if isinstance(payload, dict) else None
        if systems:
            return systems[0]
        return None


client = EsiClient(
    cache_path=os.path.join(CACHE_DIR, "esi_cache.json"),
    sleep_seconds=ESI_SLEEP,
    retries=ESI_RETRIES,
    timeout=ESI_TIMEOUT,
)


def build_nearby_systems(client_ref, start_system_id, max_jumps, min_security):
    visited = {start_system_id: 0}
    queue = deque([start_system_id])

    while queue:
        system_id = queue.popleft()
        depth = visited[system_id]
        if depth >= max_jumps:
            continue
        sys_data = client_ref.get_system(system_id)
        for gate_id in sys_data.get("stargates", []) or []:
            gate = client_ref.get_stargate(gate_id)
            dest = gate.get("destination", {}).get("system_id")
            if dest is None:
                continue
            if dest not in visited:
                visited[dest] = depth + 1
                queue.append(dest)

    systems = {}
    region_to_systems = {}
    for system_id, jumps in visited.items():
        sys_data = client_ref.get_system(system_id)
        sec = sys_data.get("security_status", 0.0)
        if sec < min_security:
            continue
        const_id = sys_data.get("constellation_id")
        reg_id = None
        if const_id is not None:
            reg_id = client_ref.get_constellation(const_id).get("region_id")
        systems[system_id] = {
            "name": sys_data.get("name"),
            "security": sec,
            "region_id": reg_id,
            "jumps": jumps,
        }
        if reg_id is not None:
            region_to_systems.setdefault(reg_id, set()).add(system_id)

    return systems, region_to_systems


def load_nearby_cache(path, start_system_id, max_jumps, min_security):
    if not path or not os.path.exists(path):
        return None
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    if (
        data.get("start_system_id") != start_system_id
        or data.get("max_jumps") != max_jumps
        or data.get("min_security") != min_security
    ):
        return None
    systems = {int(k): v for k, v in data.get("systems", {}).items()}
    region_to_systems = {}
    for region_id, system_ids in data.get("region_to_systems", {}).items():
        region_to_systems[int(region_id)] = set(system_ids)
    return systems, region_to_systems


def save_nearby_cache(path, start_system_id, max_jumps, min_security, systems, region_to_systems):
    if not path:
        return
    payload = {
        "generated_at": utc_now(),
        "start_system_id": start_system_id,
        "max_jumps": max_jumps,
        "min_security": min_security,
        "systems": {str(k): v for k, v in systems.items()},
        "region_to_systems": {
            str(region_id): sorted(list(system_ids))
            for region_id, system_ids in region_to_systems.items()
        },
    }
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, sort_keys=True)


def get_region_types(client_ref, region_id, max_pages=0, cache_path=None, refresh=False):
    if cache_path and os.path.exists(cache_path) and not refresh:
        with open(cache_path, "r", encoding="utf-8") as f:
            cached = json.load(f)
            if cached.get("region_id") == region_id:
                return cached.get("types", [])

    types = []
    page = 1
    while True:
        payload, headers = client_ref.get_json(f"/markets/{region_id}/types/", {"page": page})
        types.extend(payload)
        total_pages = int(headers.get("X-Pages", page))
        if max_pages and page >= max_pages:
            break
        if page >= total_pages:
            break
        page += 1

    if cache_path:
        os.makedirs(os.path.dirname(cache_path), exist_ok=True)
        with open(cache_path, "w", encoding="utf-8") as f:
            json.dump({
                "region_id": region_id,
                "fetched_at": utc_now(),
                "types": types,
            }, f, indent=2, sort_keys=True)

    return types


def iter_region_orders(client_ref, region_id, order_type, type_id, max_pages=0):
    page = 1
    while True:
        payload, headers = client_ref.get_json(
            f"/markets/{region_id}/orders/",
            {"order_type": order_type, "type_id": type_id, "page": page},
        )
        if not payload:
            break
        for order in payload:
            yield order
        total_pages = int(headers.get("X-Pages", page))
        if max_pages and page >= max_pages:
            break
        if page >= total_pages:
            break
        page += 1


def find_best_home_sell(client_ref, region_id, system_id, type_id, max_pages=0):
    best_price = None
    best_vol = 0
    for order in iter_region_orders(client_ref, region_id, "sell", type_id, max_pages=max_pages):
        if order.get("system_id") != system_id:
            continue
        price = order.get("price")
        if price is None:
            continue
        if best_price is None or price < best_price:
            best_price = price
            best_vol = order.get("volume_remain", 0)
    return best_price, best_vol


def find_best_order_in_systems(client_ref, region_to_systems, order_type, type_id, max_pages=0, want_highest=False):
    best_price = None
    best_order = None
    for region_id, system_ids in region_to_systems.items():
        for order in iter_region_orders(client_ref, region_id, order_type, type_id, max_pages=max_pages):
            if order.get("system_id") not in system_ids:
                continue
            price = order.get("price")
            if price is None:
                continue
            if best_price is None:
                best_price = price
                best_order = order
            else:
                if want_highest and price > best_price:
                    best_price = price
                    best_order = order
                if not want_highest and price < best_price:
                    best_price = price
                    best_order = order
    return best_price, best_order


def calc_profit(buy_price, target_price, tax_pct, broker_pct):
    fee_pct = tax_pct + broker_pct
    net_sell = target_price * (1.0 - fee_pct / 100.0)
    return net_sell - buy_price


def scan_market(
    start_system,
    budget,
    max_jumps,
    min_security,
    min_margin_pct,
    sample_size,
    types_pages,
    order_pages,
    max_price,
    mode,
    tax_pct,
    broker_pct,
    limit,
    refresh_cache,
    refresh_nearby,
    refresh_types,
):
    if refresh_cache and os.path.exists(client.cache_path):
        os.remove(client.cache_path)
        client.cache = client._load_cache()

    start_system_arg = str(start_system).strip()
    if start_system_arg.isdigit():
        start_system_id = int(start_system_arg)
    elif start_system_arg:
        start_system_id = client.resolve_system_id(start_system_arg)
    else:
        start_system_id = DEFAULT_START_SYSTEM
    if not start_system_id:
        raise ValueError(f"Unknown start system: {start_system}")

    start_system_data = client.get_system(start_system_id)
    start_system_name = start_system_data.get("name") or str(start_system_id)
    const_id = start_system_data.get("constellation_id")
    if const_id is None:
        raise ValueError("Could not resolve start system constellation")
    start_region_id = client.get_constellation(const_id).get("region_id")
    if start_region_id is None:
        raise ValueError("Could not resolve start system region")

    nearby_cache_path = os.path.join(CACHE_DIR, "nearby_systems.json")
    cached_nearby = None
    if not refresh_nearby:
        cached_nearby = load_nearby_cache(
            nearby_cache_path,
            start_system_id,
            max_jumps,
            min_security,
        )
    if cached_nearby:
        systems, region_to_systems = cached_nearby
    else:
        systems, region_to_systems = build_nearby_systems(
            client,
            start_system_id,
            max_jumps,
            min_security,
        )
        save_nearby_cache(
            nearby_cache_path,
            start_system_id,
            max_jumps,
            min_security,
            systems,
            region_to_systems,
        )
    if not region_to_systems:
        return {
            "generated_at": utc_now(),
            "start_system_id": start_system_id,
            "start_system_name": start_system_name,
            "results": {"instant": [], "list": []},
        }

    types_cache_path = os.path.join(CACHE_DIR, "types_region.json")
    types = get_region_types(
        client,
        start_region_id,
        max_pages=types_pages,
        cache_path=types_cache_path,
        refresh=refresh_types,
    )
    if not types:
        raise ValueError("No market types found.")

    if sample_size <= 0 or sample_size >= len(types):
        sample_types = list(types)
    else:
        random.seed(23)
        sample_types = random.sample(types, sample_size)

    budget = float(budget)
    max_price = max_price or budget

    instant_results = []
    list_results = []

    for type_id in sample_types:
        home_sell, home_sell_vol = find_best_home_sell(
            client,
            start_region_id,
            start_system_id,
            type_id,
            max_pages=order_pages,
        )
        if home_sell is None or home_sell > max_price:
            continue

        if mode in ("instant", "both"):
            best_buy, best_order = find_best_order_in_systems(
                client,
                region_to_systems,
                "buy",
                type_id,
                max_pages=order_pages,
                want_highest=True,
            )
            if best_buy and best_buy > home_sell:
                net_profit = calc_profit(home_sell, best_buy, tax_pct, 0.0)
                pct = (net_profit / home_sell) * 100.0 if home_sell else 0.0
                if pct >= min_margin_pct:
                    sys_id = best_order.get("system_id")
                    sys_info = systems.get(sys_id, {})
                    max_units_budget = int(budget // home_sell)
                    max_units = max_units_budget
                    buy_vol = best_order.get("volume_remain", 0)
                    if buy_vol:
                        max_units = min(max_units, int(buy_vol))
                    instant_results.append({
                        "mode": "instant",
                        "type_id": type_id,
                        "home_sell": round(home_sell, 2),
                        "home_sell_vol": home_sell_vol,
                        "best_buy": round(best_buy, 2),
                        "best_buy_system": sys_info.get("name"),
                        "jumps": sys_info.get("jumps"),
                        "security": round(sys_info.get("security", 0.0), 2),
                        "profit_per_unit": round(net_profit, 2),
                        "margin_pct": round(pct, 2),
                        "max_units_budget": max_units_budget,
                        "max_units_trade": max_units,
                        "est_profit_budget": round(net_profit * max_units, 2),
                    })

        if mode in ("list", "both"):
            best_sell, best_order = find_best_order_in_systems(
                client,
                region_to_systems,
                "sell",
                type_id,
                max_pages=order_pages,
                want_highest=False,
            )
            if best_sell and best_sell > home_sell:
                net_profit = calc_profit(home_sell, best_sell, tax_pct, broker_pct)
                pct = (net_profit / home_sell) * 100.0 if home_sell else 0.0
                if pct >= min_margin_pct:
                    sys_id = best_order.get("system_id")
                    sys_info = systems.get(sys_id, {})
                    max_units_budget = int(budget // home_sell)
                    list_results.append({
                        "mode": "list",
                        "type_id": type_id,
                        "home_sell": round(home_sell, 2),
                        "home_sell_vol": home_sell_vol,
                        "best_sell": round(best_sell, 2),
                        "best_sell_system": sys_info.get("name"),
                        "jumps": sys_info.get("jumps"),
                        "security": round(sys_info.get("security", 0.0), 2),
                        "profit_per_unit": round(net_profit, 2),
                        "margin_pct": round(pct, 2),
                        "max_units_budget": max_units_budget,
                        "est_profit_budget": round(net_profit * max_units_budget, 2),
                    })

    all_type_ids = {row["type_id"] for row in instant_results + list_results}
    name_map = client.resolve_names(sorted(all_type_ids)) if all_type_ids else {}
    for row in instant_results + list_results:
        row["type_name"] = name_map.get(row["type_id"], str(row["type_id"]))

    instant_results.sort(key=lambda r: r["est_profit_budget"], reverse=True)
    list_results.sort(key=lambda r: r["est_profit_budget"], reverse=True)

    if limit > 0:
        instant_results = instant_results[:limit]
        list_results = list_results[:limit]

    client.save_cache()

    return {
        "generated_at": utc_now(),
        "start_system_id": start_system_id,
        "start_system_name": start_system_name,
        "start_region_id": start_region_id,
        "max_jumps": max_jumps,
        "min_security": min_security,
        "min_margin_pct": min_margin_pct,
        "sample_size": len(sample_types),
        "results": {
            "instant": instant_results,
            "list": list_results,
        },
    }


@app.get("/api/scan")
def scan(
    start_system: str = Query("Jita"),
    budget: float = Query(10_000_000, ge=1),
    max_jumps: int = Query(10, ge=1, le=30),
    min_security: float = Query(0.5, ge=0.0, le=1.0),
    min_margin_pct: float = Query(8.0, ge=0.0, le=500.0),
    sample_size: int = Query(160, ge=0, le=1000),
    types_pages: int = Query(0, ge=0, le=20),
    order_pages: int = Query(3, ge=0, le=50),
    max_price: float = Query(0.0, ge=0.0),
    mode: str = Query("both"),
    tax_pct: float = Query(2.0, ge=0.0, le=20.0),
    broker_pct: float = Query(3.0, ge=0.0, le=20.0),
    limit: int = Query(40, ge=0, le=200),
    refresh_cache: bool = Query(False),
    refresh_nearby: bool = Query(False),
    refresh_types: bool = Query(False),
):
    mode = mode.lower().strip()
    if mode not in ("instant", "list", "both"):
        raise HTTPException(status_code=400, detail="mode must be instant, list, or both")

    cache_key = json.dumps({
        "start_system": start_system,
        "budget": budget,
        "max_jumps": max_jumps,
        "min_security": min_security,
        "min_margin_pct": min_margin_pct,
        "sample_size": sample_size,
        "types_pages": types_pages,
        "order_pages": order_pages,
        "max_price": max_price,
        "mode": mode,
        "tax_pct": tax_pct,
        "broker_pct": broker_pct,
        "limit": limit,
    }, sort_keys=True)

    now = time.time()
    cached = scan_cache.get(cache_key)
    if cached and now - cached["ts"] < CACHE_TTL:
        data = dict(cached["data"])
        data["cached"] = True
        return data

    try:
        data = scan_market(
            start_system,
            budget,
            max_jumps,
            min_security,
            min_margin_pct,
            sample_size,
            types_pages,
            order_pages,
            max_price,
            mode,
            tax_pct,
            broker_pct,
            limit,
            refresh_cache,
            refresh_nearby,
            refresh_types,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="ESI scan failed") from exc

    data["cached"] = False
    scan_cache[cache_key] = {"ts": now, "data": data}
    return data
