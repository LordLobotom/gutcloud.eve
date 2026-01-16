const demoRoutes = [
  {
    id: "jita-amarr",
    from: "Jita",
    to: "Amarr",
    jumps: 9,
    profit: 128000000,
    volume: 9200,
    risk: 0.06,
    demand: 88,
    security: "Highsec",
    commodities: ["Fuel Blocks", "Components"]
  },
  {
    id: "jita-dodixie",
    from: "Jita",
    to: "Dodixie",
    jumps: 15,
    profit: 92000000,
    volume: 7800,
    risk: 0.08,
    demand: 74,
    security: "Highsec",
    commodities: ["Construction Blocks", "Nanite Repair"]
  },
  {
    id: "perimeter-jita",
    from: "Perimeter",
    to: "Jita",
    jumps: 1,
    profit: 24000000,
    volume: 4200,
    risk: 0.03,
    demand: 91,
    security: "Highsec",
    commodities: ["Ship Hulls", "Rig Packs"]
  },
  {
    id: "amarr-ashab",
    from: "Amarr",
    to: "Ashab",
    jumps: 2,
    profit: 32000000,
    volume: 3000,
    risk: 0.05,
    demand: 63,
    security: "Highsec",
    commodities: ["Implants", "Ammo"]
  },
  {
    id: "amarr-penirgman",
    from: "Amarr",
    to: "Penirgman",
    jumps: 6,
    profit: 79000000,
    volume: 6400,
    risk: 0.12,
    demand: 70,
    security: "Lowsec",
    commodities: ["Moon Materials", "Navy Modules"]
  },
  {
    id: "rens-hek",
    from: "Rens",
    to: "Hek",
    jumps: 1,
    profit: 14000000,
    volume: 2100,
    risk: 0.04,
    demand: 58,
    security: "Highsec",
    commodities: ["Missile Stacks", "Drones"]
  },
  {
    id: "hek-amamake",
    from: "Hek",
    to: "Amamake",
    jumps: 2,
    profit: 68000000,
    volume: 2600,
    risk: 0.42,
    demand: 66,
    security: "Lowsec",
    commodities: ["Cap Boosters", "Skill Injectors"]
  },
  {
    id: "dodixie-osea",
    from: "Dodixie",
    to: "Osaen",
    jumps: 3,
    profit: 36000000,
    volume: 3100,
    risk: 0.09,
    demand: 52,
    security: "Highsec",
    commodities: ["Minerals", "Armor Plates"]
  },
  {
    id: "dodixie-amsen",
    from: "Dodixie",
    to: "Amsen",
    jumps: 7,
    profit: 99000000,
    volume: 5200,
    risk: 0.18,
    demand: 69,
    security: "Lowsec",
    commodities: ["Blueprints", "Data Cores"]
  },
  {
    id: "jita-perimeter",
    from: "Jita",
    to: "Perimeter",
    jumps: 1,
    profit: 18000000,
    volume: 3900,
    risk: 0.03,
    demand: 77,
    security: "Highsec",
    commodities: ["Shields", "Subsystems"]
  },
  {
    id: "amarr-tash",
    from: "Amarr",
    to: "Tash-Murkon Prime",
    jumps: 8,
    profit: 118000000,
    volume: 8400,
    risk: 0.1,
    demand: 86,
    security: "Highsec",
    commodities: ["Planetary Goods", "Industrial Parts"]
  },
  {
    id: "rens-eram",
    from: "Rens",
    to: "Eram",
    jumps: 4,
    profit: 44000000,
    volume: 2800,
    risk: 0.15,
    demand: 61,
    security: "Lowsec",
    commodities: ["Faction Ammo", "Salvage"]
  },
  {
    id: "amarr-misaba",
    from: "Amarr",
    to: "Misaba",
    jumps: 5,
    profit: 51000000,
    volume: 3600,
    risk: 0.08,
    demand: 57,
    security: "Highsec",
    commodities: ["Cap Charges", "Laser Crystals"]
  },
  {
    id: "jita-new-caldari",
    from: "Jita",
    to: "New Caldari",
    jumps: 2,
    profit: 27000000,
    volume: 4100,
    risk: 0.05,
    demand: 64,
    security: "Highsec",
    commodities: ["Navy Drones", "Hybrid Charges"]
  }
];

const translations = {
  en: {
    header: {
      sub: "Live market signals for capsuleer traders"
    },
    controls: {
      langAria: "Switch language",
      themeAria: "Toggle light/dark",
      themeLight: "Light",
      themeDark: "Dark"
    },
    hero: {
      title: "Find high-yield trade routes before the market shifts.",
      subtitle: "Tune jumps and earnings, scan the latest market gaps, and launch with confidence.",
      quickScan: "Quick scan",
      reset: "Reset filters"
    },
    stats: {
      volume: "Tracked volume",
      volumeFoot: "ISK in last 30 min",
      routes: "Active routes",
      routesFoot: "Across 5 regions",
      signal: "Signal strength",
      signalFoot: "Demand-weighted"
    },
    panel: {
      title: "Route search",
      subtitle: "Choose a hub, set your max jumps, and filter by profit floor.",
      updated: "Updated"
    },
    filters: {
      start: "Start location",
      jumps: "Max jumps",
      earnings: "Minimum earnings (ISK)",
      sort: "Sort by",
      sortScore: "Signal score",
      sortProfit: "Highest earnings",
      sortJumps: "Fewest jumps",
      search: "Search routes",
      searching: "Scanning...",
      any: "Any hub"
    },
    results: {
      title: "Trade options",
      empty: "No routes match your filters.",
      count: (count) => `${count} routes match your scan`,
      loading: "Scanning live markets...",
      sourceLive: "Live ESI feed",
      sourceCached: "Cached ESI feed",
      sourceDemo: "Demo data",
      sourceError: "Live feed unavailable"
    },
    analysis: {
      title: "Signal analysis",
      summary: (route, profitPerJump, cargo) =>
        `Top signal: ${route.from} -> ${route.to} with ${route.jumps} jumps. Carry ${cargo} for ${profitPerJump} per jump.`
    },
    summary: {
      avgProfit: (value) => `Avg profit/run: ${value}`,
      avgJumps: (value) => `Avg jumps: ${value}`
    },
    riskLevels: {
      low: "Low",
      medium: "Medium",
      high: "High"
    },
    badges: {
      demand: (value) => `Demand ${value}%`,
      risk: (value) => `Risk ${value}`,
      security: (value) => value,
      jumps: (value) => `${value} ${value === 1 ? "jump" : "jumps"}`,
      instant: "Instant",
      list: "List"
    },
    card: {
      profit: "Profit",
      volume: "Cargo",
      eta: "ETA",
      score: "Signal",
      jumps: "Jumps",
      profitPerJump: "Profit/jump",
      demand: "Demand",
      risk: "Risk",
      perJump: "per jump",
      spread: "Spread",
      carry: "Carry"
    },
    footer: {
      note: "Data is simulated for demo use. Connect to live market feeds for production."
    }
  },
  cs: {
    header: {
      sub: "Živé tržní signály pro obchodníky v New Eden"
    },
    controls: {
      langAria: "Přepnout jazyk",
      themeAria: "Přepnout světlý/tmavý režim",
      themeLight: "Světlý",
      themeDark: "Tmavý"
    },
    hero: {
      title: "Najdi výdělečné obchodní trasy dřív než se trh pohne.",
      subtitle: "Nastav skoky a zisk, proskenuj tržní mezery a vyraz s jistotou.",
      quickScan: "Rychlý scan",
      reset: "Reset filtrů"
    },
    stats: {
      volume: "Sledovaný objem",
      volumeFoot: "ISK za posledních 30 min",
      routes: "Aktivní trasy",
      routesFoot: "Napříč 5 regiony",
      signal: "Síla signálu",
      signalFoot: "Váženo poptávkou"
    },
    panel: {
      title: "Hledání tras",
      subtitle: "Vyber hub, nastav max. skoky a minimální zisk.",
      updated: "Aktualizováno"
    },
    filters: {
      start: "Startovní lokace",
      jumps: "Max. skoků",
      earnings: "Minimální zisk (ISK)",
      sort: "Řazení",
      sortScore: "Síla signálu",
      sortProfit: "Nejvyšší zisk",
      sortJumps: "Nejméně skoků",
      search: "Hledat trasy",
      searching: "Skenuji...",
      any: "Libovolný hub"
    },
    results: {
      title: "Možnosti obchodu",
      empty: "Žádné trasy neodpovídají filtrům.",
      count: (count) => `${count} tras odpovídá filtru`,
      loading: "Skenuji live trhy...",
      sourceLive: "Live ESI feed",
      sourceCached: "Cache ESI feed",
      sourceDemo: "Demo data",
      sourceError: "Live feed nedostupný"
    },
    analysis: {
      title: "Analýza signálu",
      summary: (route, profitPerJump, cargo) =>
        `Nejsilnější signál: ${route.from} -> ${route.to} s ${route.jumps} skoky. Vez ${cargo} pro ${profitPerJump} na skok.`
    },
    summary: {
      avgProfit: (value) => `Průměrný zisk/run: ${value}`,
      avgJumps: (value) => `Průměrný počet skoků: ${value}`
    },
    riskLevels: {
      low: "Nízké",
      medium: "Střední",
      high: "Vysoké"
    },
    badges: {
      demand: (value) => `Poptávka ${value}%`,
      risk: (value) => `Riziko ${value}`,
      security: (value) => value,
      jumps: (value) => {
        if (value === 1) {
          return `${value} skok`;
        }
        if (value < 5) {
          return `${value} skoky`;
        }
        return `${value} skoků`;
      },
      instant: "Okamžitě",
      list: "Nabídka"
    },
    card: {
      profit: "Zisk",
      volume: "Náklad",
      eta: "ETA",
      score: "Signál",
      jumps: "Skoky",
      profitPerJump: "Zisk/skok",
      demand: "Poptávka",
      risk: "Riziko",
      perJump: "na skok",
      spread: "Spread",
      carry: "Vézt"
    },
    footer: {
      note: "Data jsou simulovaná pro demo. Pro provoz napojte live market feed."
    }
  }
};

const localeMap = {
  en: "en-US",
  cs: "cs-CZ"
};

const elements = {
  startLocation: document.getElementById("startLocation"),
  maxJumps: document.getElementById("maxJumps"),
  maxJumpsValue: document.getElementById("maxJumpsValue"),
  minProfit: document.getElementById("minProfit"),
  sortBy: document.getElementById("sortBy"),
  resultsList: document.getElementById("resultsList"),
  resultsEmpty: document.getElementById("resultsEmpty"),
  resultsCount: document.getElementById("resultsCount"),
  resultsSummary: document.getElementById("resultsSummary"),
  resultsSource: document.getElementById("resultsSource"),
  resultsLoading: document.getElementById("resultsLoading"),
  analysisText: document.getElementById("analysisText"),
  statVolume: document.getElementById("statVolume"),
  statRoutes: document.getElementById("statRoutes"),
  statSignal: document.getElementById("statSignal"),
  lastUpdated: document.getElementById("lastUpdated"),
  themeToggle: document.getElementById("themeToggle"),
  themeLabel: document.getElementById("themeLabel"),
  langToggle: document.getElementById("langToggle"),
  quickScan: document.getElementById("quickScan"),
  resetFilters: document.getElementById("resetFilters"),
  searchButton: document.getElementById("searchButton")
};

const START_LOCATIONS = ["Jita", "Perimeter", "Amarr", "Dodixie", "Rens", "Hek"];
const LIVE_DEFAULTS = {
  budget: 10000000,
  minSecurity: 0.5,
  minMargin: 8,
  sampleSize: 160,
  orderPages: 3,
  mode: "both",
  limit: 40
};

let activeLocale = "en";
let activeRoutes = [...demoRoutes];
let activeSource = "demo";
let isLoading = false;

const formatters = {
  number: (locale) => new Intl.NumberFormat(locale),
  compact: (locale) =>
    new Intl.NumberFormat(locale, {
      notation: "compact",
      maximumFractionDigits: 1
    })
};

const calc = {
  profitPerJump: (route) => route.profit / route.jumps,
  score: (route) => {
    const efficiency = calc.profitPerJump(route);
    return efficiency * (1 - route.risk) * (1 + route.demand / 200);
  },
  eta: (route) => `${Math.round(route.jumps * 2.5)} min`
};

const getTranslation = (key) => {
  const parts = key.split(".");
  let current = translations[activeLocale];
  for (const part of parts) {
    if (!current || typeof current !== "object") {
      return null;
    }
    current = current[part];
  }
  return current;
};

const setLocale = (locale) => {
  activeLocale = locale;
  document.documentElement.lang = locale;
  localStorage.setItem("locale", locale);
  applyTranslations();
  updateLanguageToggle();
  const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
  setTheme(currentTheme);
  refresh();
};

const setTheme = (theme) => {
  document.documentElement.setAttribute("data-theme", theme);
  const themeKey = theme === "dark" ? "controls.themeDark" : "controls.themeLight";
  elements.themeLabel.textContent = getTranslation(themeKey) || "Theme";
  localStorage.setItem("theme", theme);
};

const applyTranslations = () => {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    const value = getTranslation(key);
    if (typeof value === "string") {
      el.textContent = value;
    }
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const key = el.dataset.i18nAria;
    const value = getTranslation(key);
    if (typeof value === "string") {
      el.setAttribute("aria-label", value);
    }
  });

  updateSearchButton();
  updateResultsSource();
};

const updateLanguageToggle = () => {
  const active = elements.langToggle.querySelector(`[data-lang="${activeLocale}"]`);
  elements.langToggle.querySelectorAll("[data-lang]").forEach((span) => {
    span.classList.toggle("active", span === active);
  });
};

const populateLocations = () => {
  const locations = Array.from(
    new Set([...START_LOCATIONS, ...demoRoutes.map((route) => route.from)])
  ).sort();
  const previousValue = elements.startLocation.value || "any";
  elements.startLocation.innerHTML = "";
  const anyOption = document.createElement("option");
  anyOption.value = "any";
  anyOption.textContent = getTranslation("filters.any") || "Any";
  elements.startLocation.appendChild(anyOption);

  locations.forEach((location) => {
    const option = document.createElement("option");
    option.value = location;
    option.textContent = location;
    elements.startLocation.appendChild(option);
  });

  const nextValue =
    previousValue === "any" || locations.includes(previousValue) ? previousValue : "any";
  elements.startLocation.value = nextValue;
};

const formatISK = (value) => {
  const locale = localeMap[activeLocale] || "en-US";
  return `${formatters.compact(locale).format(value)} ISK`;
};

const formatNumber = (value) => {
  const locale = localeMap[activeLocale] || "en-US";
  return formatters.number(locale).format(value);
};

const formatScore = (value) => {
  const locale = localeMap[activeLocale] || "en-US";
  return formatters.number(locale).format(Math.round(value));
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const updateSearchButton = () => {
  const key = isLoading ? "filters.searching" : "filters.search";
  const label = getTranslation(key);
  if (label) {
    elements.searchButton.textContent = label;
  }
};

const updateResultsSource = () => {
  const keyMap = {
    live: "results.sourceLive",
    cached: "results.sourceCached",
    demo: "results.sourceDemo",
    error: "results.sourceError"
  };
  const key = keyMap[activeSource] || keyMap.demo;
  const label = getTranslation(key);
  elements.resultsSource.textContent = label || "";
};

const setLoadingState = (loading) => {
  isLoading = loading;
  elements.resultsLoading.style.display = loading ? "block" : "none";
  elements.searchButton.disabled = loading;
  updateSearchButton();
};

const getStartSystem = () => {
  const selected = elements.startLocation.value;
  if (selected && selected !== "any") {
    return selected;
  }
  return START_LOCATIONS[0] || "Jita";
};

const toSecurityLabel = (security) => {
  if (security >= 0.5) {
    return "Highsec";
  }
  if (security >= 0.1) {
    return "Lowsec";
  }
  return "Nullsec";
};

const mapLiveResults = (payload) => {
  const instant = (payload.results && payload.results.instant) || [];
  const list = (payload.results && payload.results.list) || [];
  const startSystem = payload.start_system_name || getStartSystem();

  return [...instant, ...list].map((row, index) => {
    const securityValue = typeof row.security === "number" ? row.security : 0;
    const risk = clamp(0.6 - securityValue * 0.5, 0.05, 0.6);
    const demand = clamp(Math.round((row.margin_pct || 0) + 45), 35, 95);
    const toSystem = row.best_buy_system || row.best_sell_system || "Unknown";
    const typeName = row.type_name || "Unknown";
    const volume = row.max_units_trade || row.max_units_budget || 0;

    return {
      id: `${row.mode || "scan"}-${row.type_id}-${index}`,
      from: startSystem,
      to: toSystem,
      jumps: row.jumps || 0,
      profit: row.est_profit_budget || 0,
      volume,
      risk,
      demand,
      security: toSecurityLabel(securityValue),
      commodities: [typeName],
      primary: typeName,
      mode: row.mode || "instant"
    };
  });
};

const fetchLiveRoutes = async () => {
  const params = new URLSearchParams({
    start_system: getStartSystem(),
    budget: String(LIVE_DEFAULTS.budget),
    max_jumps: String(elements.maxJumps.value),
    min_security: String(LIVE_DEFAULTS.minSecurity),
    min_margin_pct: String(LIVE_DEFAULTS.minMargin),
    sample_size: String(LIVE_DEFAULTS.sampleSize),
    order_pages: String(LIVE_DEFAULTS.orderPages),
    mode: LIVE_DEFAULTS.mode,
    limit: String(LIVE_DEFAULTS.limit)
  });

  const response = await fetch(`/api/scan?${params.toString()}`, {
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error("Scan failed");
  }

  return response.json();
};

const runLiveScan = async () => {
  setLoadingState(true);
  try {
    const payload = await fetchLiveRoutes();
    const mapped = mapLiveResults(payload);
    activeRoutes = mapped;
    activeSource = payload.cached ? "cached" : "live";
  } catch (error) {
    activeRoutes = [...demoRoutes];
    activeSource = "error";
  } finally {
    updateResultsSource();
    setLoadingState(false);
    filterRoutes();
  }
};

const updateStats = (filtered) => {
  const count = filtered.length;
  const totalProfit = filtered.reduce((sum, route) => sum + route.profit, 0);
  const avgDemand = count ? filtered.reduce((sum, route) => sum + route.demand, 0) / count : 0;
  const avgRisk = count ? filtered.reduce((sum, route) => sum + route.risk, 0) / count : 0;
  const signal = count
    ? Math.round(clamp(avgDemand * (1 - avgRisk * 0.7) + 8, 35, 98))
    : 0;

  elements.statVolume.textContent = formatISK(totalProfit);
  elements.statRoutes.textContent = formatNumber(count);
  elements.statSignal.textContent = `${signal}%`;
};

const updateTimestamp = () => {
  const locale = localeMap[activeLocale] || "en-US";
  elements.lastUpdated.textContent = new Date().toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit"
  });
};

const filterRoutes = () => {
  const start = elements.startLocation.value;
  const maxJumps = parseInt(elements.maxJumps.value, 10);
  const minProfit = parseInt(elements.minProfit.value || "0", 10);

  let filtered = activeRoutes.filter((route) => {
    const matchesStart = start === "any" || route.from === start;
    return matchesStart && route.jumps <= maxJumps && route.profit >= minProfit;
  });

  const sortBy = elements.sortBy.value;
  if (sortBy === "profit") {
    filtered = filtered.sort((a, b) => b.profit - a.profit);
  } else if (sortBy === "jumps") {
    filtered = filtered.sort((a, b) => a.jumps - b.jumps);
  } else {
    filtered = filtered.sort((a, b) => calc.score(b) - calc.score(a));
  }

  renderResults(filtered);
  updateTimestamp();
};

const renderResults = (filtered) => {
  elements.resultsList.innerHTML = "";
  elements.resultsEmpty.style.display = filtered.length ? "none" : "block";
  updateStats(filtered);

  const countText = translations[activeLocale].results.count(filtered.length);
  elements.resultsCount.textContent = countText;

  if (!filtered.length) {
    elements.resultsSummary.textContent = "";
    elements.analysisText.textContent = "";
    return;
  }

  const avgProfit = filtered.reduce((sum, route) => sum + route.profit, 0) / filtered.length;
  const avgJumps = filtered.reduce((sum, route) => sum + route.jumps, 0) / filtered.length;
  const summaryText = `${translations[activeLocale].summary.avgProfit(formatISK(avgProfit))} | ${translations[activeLocale].summary.avgJumps(formatNumber(avgJumps.toFixed(1)))}`;
  elements.resultsSummary.textContent = summaryText;

  const topRoute = filtered[0];
  const profitPerJump = formatISK(calc.profitPerJump(topRoute));
  const topCargo = topRoute.primary || topRoute.commodities[0] || "";
  elements.analysisText.textContent = translations[activeLocale].analysis.summary(
    topRoute,
    profitPerJump,
    topCargo
  );

  filtered.forEach((route) => {
    const card = document.createElement("div");
    card.className = "route-card";

    const primaryCommodity = route.primary || route.commodities[0] || "";
    const riskLabel = route.risk >= 0.3 ? "high" : route.risk >= 0.15 ? "medium" : "low";
    const riskText = translations[activeLocale].riskLevels[riskLabel];
    const modeKey = route.mode === "list" ? "list" : route.mode === "instant" ? "instant" : null;
    const modeLabel = modeKey ? translations[activeLocale].badges[modeKey] : null;
    const securityTag = route.security ? `<span class="tag">${route.security}</span>` : "";
    const modeTag = modeLabel ? `<span class="tag tag-mode">${modeLabel}</span>` : "";
    const cargoLine = primaryCommodity
      ? `<div class="route-cargo"><span>${translations[activeLocale].card.carry}</span>${primaryCommodity}</div>`
      : "";
    const profitPerJump = formatISK(calc.profitPerJump(route));
    const demandValue = `${route.demand}%`;
    const spreadValue = `+${Math.round((route.demand / 100) * 12)}%`;

    card.innerHTML = `
      <div class="route-top">
        <div class="route-path">
          <div class="route-title">${route.from} -> ${route.to}</div>
          ${cargoLine}
          <div class="route-tags">
            ${securityTag}
            ${modeTag}
          </div>
        </div>
        <div class="route-profit-block">
          <div class="route-profit-label">${translations[activeLocale].card.profit}</div>
          <div class="route-profit-value">${formatISK(route.profit)}</div>
        </div>
      </div>
      <div class="route-metrics">
        <div class="metric">
          <div class="metric-label">${translations[activeLocale].card.jumps}</div>
          <div class="metric-value">${route.jumps}</div>
        </div>
        <div class="metric">
          <div class="metric-label">${translations[activeLocale].card.profitPerJump}</div>
          <div class="metric-value">${profitPerJump}</div>
        </div>
        <div class="metric">
          <div class="metric-label">${translations[activeLocale].card.volume}</div>
          <div class="metric-value">${formatNumber(route.volume)} m3</div>
        </div>
        <div class="metric">
          <div class="metric-label">${translations[activeLocale].card.eta}</div>
          <div class="metric-value">${calc.eta(route)}</div>
        </div>
      </div>
      <div class="route-signal">
        <div class="signal-item">
          <span>${translations[activeLocale].card.score}</span>
          <strong>${formatScore(calc.score(route))}</strong>
        </div>
        <div class="signal-item">
          <span>${translations[activeLocale].card.demand}</span>
          <strong>${demandValue}</strong>
        </div>
        <div class="signal-item">
          <span>${translations[activeLocale].card.risk}</span>
          <strong>${riskText}</strong>
        </div>
        <div class="signal-item">
          <span>${translations[activeLocale].card.spread}</span>
          <strong>${spreadValue}</strong>
        </div>
      </div>
    `;

    elements.resultsList.appendChild(card);
  });
};

const refresh = () => {
  populateLocations();
  filterRoutes();
};

const init = () => {
  const storedLocale = localStorage.getItem("locale");
  const browserLocale = navigator.language.startsWith("cs") ? "cs" : "en";
  setLocale(storedLocale || browserLocale);

  const storedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  setTheme(storedTheme || (prefersDark ? "dark" : "light"));

  elements.maxJumpsValue.textContent = elements.maxJumps.value;

  elements.maxJumps.addEventListener("input", () => {
    elements.maxJumpsValue.textContent = elements.maxJumps.value;
  });

  elements.searchButton.addEventListener("click", runLiveScan);

  elements.quickScan.addEventListener("click", () => {
    elements.startLocation.value = "any";
    elements.maxJumps.value = "4";
    elements.maxJumpsValue.textContent = "4";
    elements.minProfit.value = "50000000";
    elements.sortBy.value = "score";
  });

  elements.resetFilters.addEventListener("click", () => {
    elements.startLocation.value = "any";
    elements.maxJumps.value = "6";
    elements.maxJumpsValue.textContent = "6";
    elements.minProfit.value = "15000000";
    elements.sortBy.value = "score";
  });

  elements.themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    setTheme(current === "dark" ? "light" : "dark");
  });

  elements.langToggle.addEventListener("click", () => {
    setLocale(activeLocale === "en" ? "cs" : "en");
  });
};

init();
