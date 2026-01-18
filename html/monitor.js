const translations = {
  en: {
    header: {
      sub: "Live market signals for capsuleer traders"
    },
    nav: {
      home: "Route scan",
      monitor: "Cron monitor"
    },
    controls: {
      langAria: "Switch language",
      themeAria: "Toggle light/dark",
      themeLight: "Light",
      themeDark: "Dark"
    },
    monitor: {
      title: "Prewarm pulse monitor",
      subtitle: "Track when the cron refreshes hub scans and watch the cache windows.",
      refresh: "Refresh now",
      autoOn: "Auto refresh: On",
      autoOff: "Auto refresh: Off",
      footer: "Status is read from the latest prewarm payloads.",
      empty: "No systems configured.",
      error: "Monitor unavailable. Check API connectivity.",
      meta: {
        lastRun: "Last run",
        nextExpiry: "Next expiry",
        fresh: "Fresh",
        stale: "Stale",
        missing: "Missing",
        freshFoot: "systems",
        staleFoot: "needs refresh",
        missingFoot: "no cache yet"
      },
      labels: {
        updated: "Updated at",
        age: "Age",
        expires: "Expires at"
      },
      status: {
        fresh: "Fresh",
        stale: "Stale",
        missing: "Missing",
        error: "Error",
        loading: "Checking"
      }
    }
  },
  cs: {
    header: {
      sub: "Živé tržní signály pro obchodníky v New Eden"
    },
    nav: {
      home: "Sken tras",
      monitor: "Monitor aktualizace"
    },
    controls: {
      langAria: "Přepnout jazyk",
      themeAria: "Přepnout světlý/tmavý režim",
      themeLight: "Světlý",
      themeDark: "Tmavý"
    },
    monitor: {
      title: "Monitor předohřevu",
      subtitle: "Sleduj, kdy cron obnovuje scany hubů a kdy vyprší cache.",
      refresh: "Obnovit teď",
      autoOn: "Automatický refresh: Zapnuto",
      autoOff: "Automatický refresh: Vypnuto",
      footer: "Stav se bere z posledních prewarm payloadů.",
      empty: "Žádné systémy nejsou nastaveny.",
      error: "Monitor není dostupný. Zkontroluj API.",
      meta: {
        lastRun: "Poslední běh",
        nextExpiry: "Další expirace",
        fresh: "Aktuální",
        stale: "Zastaralé",
        missing: "Chybí",
        freshFoot: "systémy",
        staleFoot: "čekají na refresh",
        missingFoot: "zatím bez cache"
      },
      labels: {
        updated: "Aktualizováno",
        age: "Stáří",
        expires: "Vyprší"
      },
      status: {
        fresh: "Aktuální",
        stale: "Zastaralé",
        missing: "Chybí",
        error: "Chyba",
        loading: "Kontrola"
      }
    }
  }
};

const localeMap = {
  en: "en-US",
  cs: "cs-CZ"
};

const elements = {
  themeToggle: document.getElementById("themeToggle"),
  themeLabel: document.getElementById("themeLabel"),
  langToggle: document.getElementById("langToggle"),
  refreshButton: document.getElementById("refreshButton"),
  autoToggle: document.getElementById("autoToggle"),
  monitorGrid: document.getElementById("monitorGrid"),
  monitorEmpty: document.getElementById("monitorEmpty"),
  summaryLastRun: document.getElementById("summaryLastRun"),
  summaryLastRunAge: document.getElementById("summaryLastRunAge"),
  summaryNextExpiry: document.getElementById("summaryNextExpiry"),
  summaryNextExpiryAge: document.getElementById("summaryNextExpiryAge"),
  summaryFresh: document.getElementById("summaryFresh"),
  summaryStale: document.getElementById("summaryStale"),
  summaryMissing: document.getElementById("summaryMissing")
};

const DEFAULT_SYSTEMS = ["Jita", "Amarr", "Dodixie", "Rens", "Hek"];
const AUTO_REFRESH_MS = 60000;

let activeLocale = localStorage.getItem("locale") || "en";
let autoRefresh = true;
let autoTimer = null;

const getTranslation = (key) => {
  const segments = key.split(".");
  let current = translations[activeLocale];
  for (const segment of segments) {
    if (!current || typeof current !== "object") {
      return null;
    }
    current = current[segment];
  }
  return current;
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

  updateAutoToggle();
};

const updateLanguageToggle = () => {
  const active = elements.langToggle.querySelector(`[data-lang="${activeLocale}"]`);
  elements.langToggle.querySelectorAll("[data-lang]").forEach((span) => {
    span.classList.toggle("active", span === active);
  });
};

const setTheme = (theme) => {
  document.documentElement.setAttribute("data-theme", theme);
  const themeKey = theme === "dark" ? "controls.themeDark" : "controls.themeLight";
  const label = getTranslation(themeKey) || "Theme";
  elements.themeLabel.textContent = label;
  localStorage.setItem("theme", theme);
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

const formatTime = (value) => {
  if (!value) {
    return "--";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }
  return new Intl.DateTimeFormat(localeMap[activeLocale], {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
};

const formatRelative = (value) => {
  if (!value) {
    return "--";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }
  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const absSeconds = Math.abs(diffSeconds);
  const rtf = new Intl.RelativeTimeFormat(localeMap[activeLocale], { numeric: "auto" });
  if (absSeconds < 60) {
    return rtf.format(diffSeconds, "second");
  }
  if (absSeconds < 3600) {
    return rtf.format(Math.round(diffSeconds / 60), "minute");
  }
  if (absSeconds < 86400) {
    return rtf.format(Math.round(diffSeconds / 3600), "hour");
  }
  return rtf.format(Math.round(diffSeconds / 86400), "day");
};

const getSystemsParam = () => {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("systems");
  return raw ? raw.trim() : "";
};

const statusMeta = {
  fresh: {
    className: "status-ok",
    labelKey: "monitor.status.fresh"
  },
  stale: {
    className: "status-stale",
    labelKey: "monitor.status.stale"
  },
  missing: {
    className: "status-missing",
    labelKey: "monitor.status.missing"
  },
  error: {
    className: "status-error",
    labelKey: "monitor.status.error"
  },
  loading: {
    className: "status-loading",
    labelKey: "monitor.status.loading"
  }
};

const fetchStatus = async (systemsParam) => {
  try {
    const url = systemsParam
      ? `/api/prewarm/status?systems=${encodeURIComponent(systemsParam)}`
      : "/api/prewarm/status";
    const response = await fetch(url);
    if (!response.ok) {
      return { systems: [], summary: null, last_run: null };
    }
    return await response.json();
  } catch (error) {
    return { systems: [], summary: null, last_run: null };
  }
};

const renderCards = (items) => {
  elements.monitorGrid.innerHTML = "";
  if (!items.length) {
    elements.monitorEmpty.style.display = "block";
    return;
  }
  elements.monitorEmpty.style.display = "none";

  items.forEach((item) => {
    const meta = statusMeta[item.status] || statusMeta.error;
    const statusLabel = getTranslation(meta.labelKey) || item.status;
    const card = document.createElement("div");
    card.className = "monitor-card";
    const systemName = item.start_system_name || item.system;
    const systemSub = item.start_system_id ? `${item.system} · ${item.start_system_id}` : item.system;
    const updatedAt = item.generated_at || null;
    const expiresAt = item.cache_expires_at || null;

    card.innerHTML = `
      <div class="monitor-card-head">
        <div>
          <div class="monitor-system">${systemName}</div>
          <div class="monitor-sub">${systemSub}</div>
        </div>
        <span class="status-pill ${meta.className}">${statusLabel}</span>
      </div>
      <div class="monitor-items">
        <div class="monitor-item">
          <span class="monitor-label">${getTranslation("monitor.labels.updated") || "Updated at"}</span>
          <span class="monitor-value">${formatTime(updatedAt)}</span>
        </div>
        <div class="monitor-item">
          <span class="monitor-label">${getTranslation("monitor.labels.age") || "Age"}</span>
          <span class="monitor-value">${formatRelative(updatedAt)}</span>
        </div>
        <div class="monitor-item">
          <span class="monitor-label">${getTranslation("monitor.labels.expires") || "Expires at"}</span>
          <span class="monitor-value">${formatTime(expiresAt)}</span>
        </div>
      </div>
    `;

    elements.monitorGrid.appendChild(card);
  });
};

const updateSummary = (status) => {
  const summary = status?.summary || {};
  const lastRun = status?.last_run || null;
  const lastRunTime = lastRun?.finished_at || lastRun?.started_at || summary.latest_generated_at;
  const nextExpiry = summary.next_expiry_at || null;

  elements.summaryFresh.textContent = summary.fresh ?? "--";
  elements.summaryStale.textContent = summary.stale ?? "--";
  elements.summaryMissing.textContent = summary.missing ?? "--";
  elements.summaryLastRun.textContent = lastRunTime ? formatTime(lastRunTime) : "--";
  elements.summaryLastRunAge.textContent = lastRunTime ? formatRelative(lastRunTime) : "--";
  elements.summaryNextExpiry.textContent = nextExpiry ? formatTime(nextExpiry) : "--";
  elements.summaryNextExpiryAge.textContent = nextExpiry ? formatRelative(nextExpiry) : "--";
};

const refresh = async () => {
  const systemsParam = getSystemsParam();
  const loadingSystems = systemsParam
    ? systemsParam.split(",").map((item) => item.trim()).filter(Boolean)
    : DEFAULT_SYSTEMS;
  const loadingItems = loadingSystems.map((system) => ({
    system,
    status: "loading",
    start_system_name: system
  }));
  renderCards(loadingItems);
  updateSummary(null);

  const status = await fetchStatus(systemsParam);
  if (!status.summary && (!status.systems || status.systems.length === 0)) {
    elements.monitorGrid.innerHTML = "";
    elements.monitorEmpty.textContent =
      getTranslation("monitor.error") || "Monitor unavailable.";
    elements.monitorEmpty.style.display = "block";
    updateSummary(null);
    return;
  }
  elements.monitorEmpty.textContent =
    getTranslation("monitor.empty") || "No systems configured.";
  renderCards(status.systems || []);
  updateSummary(status);
};

const updateAutoToggle = () => {
  const labelKey = autoRefresh ? "monitor.autoOn" : "monitor.autoOff";
  const label = getTranslation(labelKey) || "Auto refresh";
  elements.autoToggle.textContent = label;
};

const setAutoRefresh = (enabled) => {
  autoRefresh = enabled;
  updateAutoToggle();
  if (autoTimer) {
    clearInterval(autoTimer);
    autoTimer = null;
  }
  if (autoRefresh) {
    autoTimer = setInterval(refresh, AUTO_REFRESH_MS);
  }
};

const bootstrap = () => {
  const savedTheme = localStorage.getItem("theme") || "light";
  setTheme(savedTheme);
  applyTranslations();
  updateLanguageToggle();
  setAutoRefresh(true);

  elements.themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    const next = current === "dark" ? "light" : "dark";
    setTheme(next);
  });

  elements.langToggle.addEventListener("click", () => {
    const next = activeLocale === "en" ? "cs" : "en";
    setLocale(next);
  });

  elements.refreshButton.addEventListener("click", () => {
    refresh();
  });

  elements.autoToggle.addEventListener("click", () => {
    setAutoRefresh(!autoRefresh);
  });

  refresh();
};

bootstrap();
