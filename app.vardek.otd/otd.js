(function () {
  const CATEGORY_ORDER = ["events", "births", "deaths", "holidays"];

  const CATEGORY_LABEL = {
    events: "EVENT",
    births: "BIRTH",
    deaths: "DEATH",
    holidays: "HOLIDAY",
  };

  function sanitizeLang(lang) {
    if (typeof lang === "string" && /^[a-z]{2,3}(-[a-z]+)?$/i.test(lang)) {
      return lang.toLowerCase();
    }
    return "en";
  }

  // ponytail: two-digit zero-pad, no Intl — this is just MM/DD for a URL path
  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function datePath(date) {
    return pad2(date.getUTCMonth() + 1) + "/" + pad2(date.getUTCDate());
  }

  function parseCategory(json, type) {
    const list = json && Array.isArray(json[type]) ? json[type] : [];
    return list
      .map((entry) => {
        const page = entry.pages && entry.pages[0];
        if (!page || !page.title) return null;
        const desktop = page.content_urls && page.content_urls.desktop;
        const url = desktop ? desktop.page : null;
        if (!entry.text || !url) return null;
        return {
          type,
          year: typeof entry.year === "number" ? entry.year : null,
          text: entry.text,
          url,
          thumb: page.thumbnail ? page.thumbnail.source : null,
          description: page.description || null,
        };
      })
      .filter(Boolean);
  }

  // Round-robins the enabled categories in a fixed order, capping each so one
  // prolific category (births regularly returns 250+) can't drown out the rest.
  function buildRotation(dataByType, enabledTypes, capPerType) {
    const cap = capPerType || 8;
    const queues = CATEGORY_ORDER.filter((t) => enabledTypes.includes(t)).map((t) =>
      (dataByType[t] || []).slice(0, cap)
    );
    const rotation = [];
    let more = true;
    while (more) {
      more = false;
      for (const q of queues) {
        const item = q.shift();
        if (item) {
          rotation.push(item);
          more = true;
        }
      }
    }
    return rotation;
  }

  function categoryLabel(type) {
    return CATEGORY_LABEL[type] || type.toUpperCase();
  }

  function paginate(items, pageSize) {
    const size = pageSize || 8;
    const pages = [];
    for (let i = 0; i < items.length; i += size) pages.push(items.slice(i, i + size));
    return pages.length ? pages : [[]];
  }

  globalThis.Otd = {
    CATEGORY_ORDER,
    sanitizeLang,
    datePath,
    parseCategory,
    buildRotation,
    categoryLabel,
    paginate,
  };
})();
