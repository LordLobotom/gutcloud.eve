import json
import os
import time
from datetime import datetime, timezone

import fcntl

from main import CACHE_TTL, scan_market, tune_scan_params


def ts_to_utc(ts):
    return datetime.fromtimestamp(ts, tz=timezone.utc).isoformat().replace("+00:00", "Z")


def normalize_mode(value):
    value = str(value or "").strip().lower()
    return value if value in ("instant", "list", "both") else "both"


def prewarm_key(value):
    cleaned = "".join(ch.lower() if ch.isalnum() else "_" for ch in str(value))
    cleaned = cleaned.strip("_")
    return cleaned or "unknown"


def prewarm_path(output_dir, key):
    return os.path.join(output_dir, f"{key}.json")


def is_fresh(path, now, ttl):
    return os.path.exists(path) and (now - os.path.getmtime(path) < ttl)


def write_payload(path, payload):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    temp_path = f"{path}.tmp"
    with open(temp_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, sort_keys=True)
    os.replace(temp_path, path)


def parse_start_systems(raw_value):
    return [name.strip() for name in raw_value.split(",") if name.strip()]


def acquire_lock(path):
    fd = os.open(path, os.O_CREAT | os.O_RDWR, 0o644)
    try:
        fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        return fd
    except OSError:
        os.close(fd)
        return None


def write_status(path, payload):
    temp_path = f"{path}.tmp"
    with open(temp_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, sort_keys=True)
    os.replace(temp_path, path)


def run():
    output_dir = os.getenv("PREWARM_OUTPUT_DIR", "/data/prewarm")
    status_path = os.getenv("PREWARM_STATUS_FILE", os.path.join(output_dir, "last_run.json"))
    lock_path = os.getenv("PREWARM_LOCK_FILE", os.path.join(output_dir, "prewarm.lock"))
    os.makedirs(output_dir, exist_ok=True)

    start_systems = parse_start_systems(
        os.getenv("PREWARM_START_SYSTEMS", "Jita,Amarr,Dodixie,Rens,Hek")
    )
    started_at = time.time()

    if not start_systems:
        status_payload = {
            "started_at": ts_to_utc(started_at),
            "finished_at": ts_to_utc(started_at),
            "duration_sec": 0.0,
            "status": "skipped",
            "reason": "no systems configured",
            "systems": [],
        }
        write_status(status_path, status_payload)
        return

    lock_fd = acquire_lock(lock_path)
    if lock_fd is None:
        status_payload = {
            "started_at": ts_to_utc(started_at),
            "finished_at": ts_to_utc(started_at),
            "duration_sec": 0.0,
            "status": "locked",
            "reason": "prewarm already running",
            "systems": start_systems,
        }
        write_status(status_path, status_payload)
        return

    try:
        max_jumps_default = int(os.getenv("PREWARM_MAX_JUMPS", "5"))
        sample_size_default = int(os.getenv("PREWARM_SAMPLE_SIZE", "40"))
        types_pages_default = int(os.getenv("PREWARM_TYPES_PAGES", "1"))
        order_pages_default = int(os.getenv("PREWARM_ORDER_PAGES", "1"))
        limit_default = int(os.getenv("PREWARM_LIMIT", "10"))
        min_security = float(os.getenv("PREWARM_MIN_SECURITY", "0.5"))
        min_margin = float(os.getenv("PREWARM_MIN_MARGIN", "8"))
        max_runtime = int(os.getenv("PREWARM_MAX_RUNTIME", "12"))
        budget = float(os.getenv("PREWARM_BUDGET", "10000000"))
        mode = normalize_mode(os.getenv("PREWARM_MODE", "instant"))
        cargo_m3 = float(os.getenv("PREWARM_CARGO_M3", "12000"))
        min_profit_per_jump = float(os.getenv("PREWARM_MIN_PROFIT_PER_JUMP", "200000"))
        min_results = int(os.getenv("PREWARM_MIN_RESULTS", "3"))
        fallback_max_jumps = int(os.getenv("PREWARM_FALLBACK_MAX_JUMPS", str(max_jumps_default)))
        fallback_min_security = float(os.getenv("PREWARM_FALLBACK_MIN_SECURITY", str(min_security)))
        sample_seed = os.getenv("PREWARM_SAMPLE_SEED")
        if sample_seed is not None:
            sample_seed = sample_seed.strip()
            if not sample_seed:
                sample_seed = None
        home_order_pages_raw = os.getenv("PREWARM_HOME_ORDER_PAGES", "")
        home_order_pages = int(home_order_pages_raw) if home_order_pages_raw else None
        force = os.getenv("PREWARM_FORCE", "0").lower() in ("1", "true", "yes")
        retry_empty = os.getenv("PREWARM_RETRY_EMPTY", "0").lower() in ("1", "true", "yes")

        tune_enabled = os.getenv("PREWARM_TUNE", "1").lower() in ("1", "true", "yes")

        failures = 0
        successes = 0
        skipped = 0
        total_opportunities = 0
        errors = {}
        now = time.time()

        for system in start_systems:
            name_key = prewarm_key(system)
            name_path = prewarm_path(output_dir, name_key)
            if is_fresh(name_path, now, CACHE_TTL) and not force:
                if retry_empty:
                    try:
                        with open(name_path, "r", encoding="utf-8") as f:
                            existing = json.load(f)
                        existing_results = existing.get("results", {})
                        existing_count = len(existing_results.get("instant", [])) + len(
                            existing_results.get("list", [])
                        )
                        if existing_count > 0:
                            skipped += 1
                            continue
                    except Exception:
                        pass
                else:
                    skipped += 1
                    continue

            try:
                if tune_enabled:
                    max_jumps, sample_size, types_pages, order_pages, tuned = tune_scan_params(
                        max_jumps_default,
                        sample_size_default,
                        types_pages_default,
                        order_pages_default,
                    )
                else:
                    max_jumps = max_jumps_default
                    sample_size = sample_size_default
                    types_pages = types_pages_default
                    order_pages = order_pages_default
                    tuned = False
                data = scan_market(
                    system,
                    budget,
                    max_jumps,
                    min_security,
                    min_margin,
                    sample_size,
                    types_pages,
                    order_pages,
                    0.0,
                    mode,
                    2.0,
                    3.0,
                    limit_default,
                    False,
                    False,
                    False,
                    max_runtime,
                    sample_seed,
                    home_order_pages,
                    cargo_m3,
                    min_profit_per_jump,
                    min_results,
                )
                results = data.get("results", {})
                opportunity_count = len(results.get("instant", [])) + len(results.get("list", []))
                fallback_used = False
                if opportunity_count < min_results and (
                    fallback_max_jumps > max_jumps or fallback_min_security < min_security
                ):
                    data = scan_market(
                        system,
                        budget,
                        fallback_max_jumps,
                        fallback_min_security,
                        min_margin,
                        sample_size,
                        types_pages,
                        order_pages,
                        0.0,
                        mode,
                        2.0,
                        3.0,
                        limit_default,
                        False,
                        False,
                        False,
                        max_runtime,
                        sample_seed,
                        home_order_pages,
                        cargo_m3,
                        min_profit_per_jump,
                        min_results,
                    )
                    results = data.get("results", {})
                    opportunity_count = len(results.get("instant", [])) + len(results.get("list", []))
                    fallback_used = True
                data["tuned"] = tuned
                data["max_jumps_requested"] = fallback_max_jumps if fallback_used else max_jumps
                data["fallback_used"] = fallback_used
                stamp = time.time()
                data["cached"] = True
                data["prewarmed"] = True
                data["cache_expires_at"] = ts_to_utc(stamp + CACHE_TTL)
                data["expires_ts"] = stamp + CACHE_TTL
                total_opportunities += opportunity_count
                write_payload(name_path, data)
                if data.get("start_system_id"):
                    id_path = prewarm_path(output_dir, data["start_system_id"])
                    write_payload(id_path, data)
                successes += 1
            except Exception as exc:
                failures += 1
                errors[system] = str(exc)
                print(f"Prewarm failed for {system}: {exc}", flush=True)

        finished_at = time.time()
        if failures and successes:
            status = "partial"
        elif failures and not successes:
            status = "failed"
        elif successes:
            status = "ok"
        else:
            status = "skipped"

        status_payload = {
            "started_at": ts_to_utc(started_at),
            "finished_at": ts_to_utc(finished_at),
            "duration_sec": round(finished_at - started_at, 2),
            "status": status,
            "systems": start_systems,
            "successes": successes,
            "failures": failures,
            "skipped_fresh": skipped,
            "cache_ttl_sec": CACHE_TTL,
            "total_opportunities": total_opportunities,
            "tuned": tune_enabled,
            "errors": errors,
        }
        write_status(status_path, status_payload)
        history_path = os.getenv(
            "PREWARM_HISTORY_FILE", os.path.join(output_dir, "history.jsonl")
        )
        with open(history_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(status_payload, sort_keys=True))
            f.write("\n")

        if failures:
            raise SystemExit(1)
    except Exception as exc:
        finished_at = time.time()
        tuned_value = tune_enabled if "tune_enabled" in locals() else None
        status_payload = {
            "started_at": ts_to_utc(started_at),
            "finished_at": ts_to_utc(finished_at),
            "duration_sec": round(finished_at - started_at, 2),
            "status": "failed",
            "systems": start_systems,
            "successes": 0,
            "failures": 1,
            "skipped_fresh": 0,
            "cache_ttl_sec": CACHE_TTL,
            "total_opportunities": total_opportunities,
            "tuned": tuned_value,
            "errors": {"__run__": str(exc)},
        }
        write_status(status_path, status_payload)
        history_path = os.getenv(
            "PREWARM_HISTORY_FILE", os.path.join(output_dir, "history.jsonl")
        )
        with open(history_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(status_payload, sort_keys=True))
            f.write("\n")
        raise
    finally:
        fcntl.flock(lock_fd, fcntl.LOCK_UN)
        os.close(lock_fd)


if __name__ == "__main__":
    run()
