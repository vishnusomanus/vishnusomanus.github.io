/*
 * Loftwing: menus, reveals and every interactive feature. Content lives in data.js (window.LOFTWING).
 * Each init function looks for its own markup and returns early on pages that don't have it.
 */
(() => {
  "use strict";

  const { DEMO, WAITLIST, TOOLS, SUBJECT, PRICING, MIGRATION, ROADMAP, JOURNAL, AUTOMATIONS, SEGMENTS, ANALYTICS } =
    window.LOFTWING;

  const STORAGE_KEYS = {
    waitlist: "loftwing:waitlist:v1",
    pendingRef: "loftwing:ref:v1",
    votes: "loftwing:votes:v1",
    migrate: "loftwing:migrate:v1",
    pricing: "loftwing:pricing:v1",
  };

  /* ---------- Small helpers ---------- */

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const own = (object, key) => typeof key === "string" && Object.prototype.hasOwnProperty.call(object, key);
  const esc = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
    );
  const number = (value) => Number(value).toLocaleString("en-US");
  const plural = (count, word, other = word + "s") => `${number(count)} ${count === 1 ? word : other}`;
  const params = new URLSearchParams(window.location.search);
  const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const normalizeEmail = (value) =>
    String(value || "")
      .trim()
      .toLowerCase();

  /*
   * Storage can be unavailable (sandboxed demos, strict privacy settings). Every read and write goes
   * through this object, which falls back to memory for the page view.
   */
  const safeStorage = (() => {
    const memory = new Map();
    let store = null;
    try {
      store = window.localStorage;
      store.getItem("loftwing:probe");
    } catch {
      store = null;
    }
    return {
      getItem(key) {
        // A value that couldn't be written (storage full, for example) is only in memory, and is the newest.
        if (memory.has(key)) return memory.get(key);
        if (store) {
          try {
            return store.getItem(key);
          } catch {
            /* fall through to memory */
          }
        }
        return memory.has(key) ? memory.get(key) : null;
      },
      setItem(key, value) {
        if (store) {
          try {
            store.setItem(key, value);
            memory.delete(key);
            return;
          } catch {
            /* fall through to memory */
          }
        }
        memory.set(key, value);
      },
      removeItem(key) {
        memory.delete(key);
        if (store) {
          try {
            store.removeItem(key);
          } catch {
            /* nothing to remove */
          }
        }
      },
    };
  })();
  const readJson = (key) => {
    try {
      return JSON.parse(safeStorage.getItem(key));
    } catch {
      return null;
    }
  };
  const writeJson = (key, value) => safeStorage.setItem(key, JSON.stringify(value));

  /* ---------- The clock and the launch date ---------- */

  const TIME_ZONE = DEMO.TIME_ZONE;

  // Wall-clock parts of an instant in Spokane.
  const zoneParts = (date) => {
    const parts = {};
    new Intl.DateTimeFormat("en-US", {
      timeZone: TIME_ZONE,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    })
      .formatToParts(date)
      .forEach((part) => {
        parts[part.type] = Number(part.value);
      });
    return parts;
  };
  // The instant of a wall-clock time in Spokane, daylight saving included.
  const zonedInstant = (year, month, day, hour, minute) => {
    const wanted = Date.UTC(year, month - 1, day, hour, minute);
    let guess = wanted;
    for (let i = 0; i < 2; i += 1) {
      const p = zoneParts(new Date(guess));
      guess += wanted - Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
    }
    return new Date(guess);
  };
  // ?now=YYYY-MM-DDTHH:MM previews the site at that Pacific time. The clock keeps ticking from there.
  const clockOffset = (() => {
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(params.get("now") || "");
    if (!match) return 0;
    const [, year, month, day, hour, minute] = match.map(Number);
    const instant = zonedInstant(year, month, day, hour, minute);
    return Number.isNaN(instant.getTime()) ? 0 : instant.getTime() - Date.now();
  })();
  const now = () => new Date(Date.now() + clockOffset);

  const DAY = 86400000;
  // Calendar dates are kept as UTC midnights and formatted in UTC, so they never shift a day.
  const secondTuesday = (year, monthIndex) => {
    const firstDay = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
    return new Date(Date.UTC(year, monthIndex, 1 + ((2 - firstDay + 7) % 7) + 7));
  };
  // The second Tuesday of the first month that falls at least MIN_WEEKS away.
  const rollingLaunchDay = (today) => {
    const p = zoneParts(today);
    const earliest = Date.UTC(p.year, p.month - 1, p.day) + DEMO.MIN_WEEKS * 7 * DAY;
    const start = new Date(earliest);
    for (let i = 0; i < 3; i += 1) {
      const candidate = secondTuesday(start.getUTCFullYear(), start.getUTCMonth() + i);
      if (candidate.getTime() >= earliest) return candidate;
    }
    return secondTuesday(start.getUTCFullYear(), start.getUTCMonth() + 3);
  };
  const launchDay = (() => {
    if (DEMO.KEEP_DEMO_CURRENT) return rollingLaunchDay(now());
    const [year, month, day] = DEMO.FIXED_LAUNCH.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  })();
  const launchInstant = zonedInstant(
    launchDay.getUTCFullYear(),
    launchDay.getUTCMonth() + 1,
    launchDay.getUTCDate(),
    DEMO.LAUNCH_HOUR,
    0,
  );
  const weeksBefore = (weeks) => new Date(launchDay.getTime() - weeks * 7 * DAY);
  const DATES = {
    launch: launchDay,
    foundingEnd: new Date(launchDay.getTime() - DEMO.FOUNDING_DAYS_BEFORE * DAY),
    cohort5: weeksBefore(DEMO.COHORT_WEEKS.cohort5),
    cohort6: weeksBefore(DEMO.COHORT_WEEKS.cohort6),
    cohort7: weeksBefore(DEMO.COHORT_WEEKS.cohort7),
  };
  const DATE_FORMATS = {
    long: { weekday: "long", month: "long", day: "numeric", year: "numeric" },
    medium: { month: "short", day: "numeric", year: "numeric" },
    short: { month: "short", day: "numeric" },
    monthDay: { month: "long", day: "numeric" },
    year: { year: "numeric" },
  };
  const formatDate = (date, style = "medium") =>
    new Intl.DateTimeFormat("en-US", { ...DATE_FORMATS[style], timeZone: "UTC" }).format(date);
  const isoDay = (date) => date.toISOString().slice(0, 10);
  // Today's calendar date in Spokane, as YYYY-MM-DD.
  const todayIso = () => {
    const p = zoneParts(now());
    return isoDay(new Date(Date.UTC(p.year, p.month - 1, p.day)));
  };

  function initDates() {
    $$("[data-date]").forEach((element) => {
      const key = element.dataset.date;
      if (!own(DATES, key)) return;
      const style = own(DATE_FORMATS, element.dataset.format) ? element.dataset.format : "medium";
      element.textContent = formatDate(DATES[key], style);
      if (element.tagName === "TIME") element.dateTime = isoDay(DATES[key]);
    });
    $$("[data-year]").forEach((element) => {
      element.textContent = String(zoneParts(now()).year);
    });
  }

  function initCountdown() {
    const boxes = $$("[data-countdown]");
    if (!boxes.length) return;
    const pad = (value) => String(value).padStart(2, "0");
    const tick = () => {
      const left = launchInstant.getTime() - now().getTime();
      boxes.forEach((box) => {
        const live = $("[data-cd-live]", box);
        const cells = $("[data-cd-cells]", box);
        if (left <= 0) {
          if (live) live.hidden = false;
          if (cells) cells.hidden = true;
          return;
        }
        const seconds = Math.floor(left / 1000);
        const values = {
          days: String(Math.floor(seconds / 86400)),
          hours: pad(Math.floor(seconds / 3600) % 24),
          minutes: pad(Math.floor(seconds / 60) % 60),
          seconds: pad(seconds % 60),
        };
        Object.keys(values).forEach((unit) => {
          const cell = $(`[data-cd="${unit}"]`, box);
          if (cell && cell.textContent !== values[unit]) cell.textContent = values[unit];
        });
      });
      return left;
    };
    tick();
    window.setInterval(tick, 1000);
  }

  /* ---------- Menu and reveals ---------- */

  function initMenu() {
    const button = $("[data-menu-button]");
    const menu = $("#mobile-menu");
    if (!button || !menu) return;
    const setOpen = (open) => {
      menu.hidden = !open;
      button.setAttribute("aria-expanded", String(open));
      button.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      $("[data-menu-open]", button).toggleAttribute("hidden", open);
      $("[data-menu-close]", button).toggleAttribute("hidden", !open);
    };
    button.addEventListener("click", () => setOpen(menu.hidden));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !menu.hidden) {
        setOpen(false);
        button.focus();
      }
    });
    $$("a", menu).forEach((link) => link.addEventListener("click", () => setOpen(false)));
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 1024 && !menu.hidden) setOpen(false);
    });
  }

  function initReveal() {
    const items = $$(".reveal");
    if (!items.length) return;
    const showAll = () => items.forEach((item) => item.classList.add("is-visible"));
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      showAll();
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          // Everything above a revealed element shows too, so a fast jump never leaves gaps behind.
          const index = items.indexOf(entry.target);
          items.slice(0, index + 1).forEach((item) => {
            item.classList.add("is-visible");
            observer.unobserve(item);
          });
        });
      },
      { rootMargin: "0px 0px -6% 0px" },
    );
    items.forEach((item) => observer.observe(item));
  }

  /* ---------- Waitlist state ---------- */

  const REF_PATTERN = /^LW[A-Z2-9]{6}$/;
  const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const hash = (text) => {
    let value = 0x811c9dc5;
    for (let i = 0; i < text.length; i += 1) {
      value ^= text.charCodeAt(i);
      value = Math.imul(value, 0x01000193) >>> 0;
    }
    return value >>> 0;
  };
  const encodeHash = (value, length) => {
    let rest = value;
    let out = "";
    for (let i = 0; i < length; i += 1) {
      out += CODE_ALPHABET[rest % 32];
      rest = Math.floor(rest / 32);
    }
    return out;
  };
  const referralCode = (email) => `LW${encodeHash(hash(email), 6)}`;

  // Everything read back from storage is checked, field by field; anything odd is dropped.
  function loadWaitlist() {
    const raw = readJson(STORAGE_KEYS.waitlist);
    const state = { seq: 0, current: null, spots: new Map() };
    if (!isObject(raw)) return state;
    if (Number.isInteger(raw.seq) && raw.seq >= 0 && raw.seq < 1e6) state.seq = raw.seq;
    if (isObject(raw.spots)) {
      Object.keys(raw.spots).forEach((email) => {
        const spot = raw.spots[email];
        if (!EMAIL_PATTERN.test(email) || !isObject(spot)) return;
        if (!Number.isInteger(spot.start) || spot.start < 1 || spot.start > 1e8) return;
        if (typeof spot.code !== "string" || !REF_PATTERN.test(spot.code)) return;
        const referrals = Array.isArray(spot.referrals)
          ? spot.referrals
              .filter((item) => isObject(item) && typeof item.email === "string" && EMAIL_PATTERN.test(item.email))
              .slice(0, 500)
              .map((item) => ({
                email: item.email,
                at: typeof item.at === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item.at) ? item.at : "",
                via: item.via === "link" ? "link" : "claim",
              }))
          : [];
        state.spots.set(email, {
          start: spot.start,
          code: spot.code,
          publication: typeof spot.publication === "string" ? spot.publication.slice(0, 80) : "",
          size: own(WAITLIST.LIST_SIZES, spot.size) ? spot.size : "",
          tool: own(TOOLS, spot.tool) ? spot.tool : "",
          joined: typeof spot.joined === "string" && /^\d{4}-\d{2}-\d{2}$/.test(spot.joined) ? spot.joined : "",
          referrals,
        });
      });
    }
    if (typeof raw.current === "string" && state.spots.has(raw.current)) state.current = raw.current;
    return state;
  }
  function saveWaitlist(state) {
    writeJson(STORAGE_KEYS.waitlist, {
      seq: state.seq,
      current: state.current,
      spots: Object.fromEntries(state.spots),
    });
  }
  // Tiers a number of accepted invites has reached, lowest first.
  const reachedTiers = (count) => WAITLIST.TIERS.filter((tier) => count >= tier.at);
  // A spot's place in line: where it started, less the places its invites and tiers earned.
  const spotPosition = (spot) => {
    const count = spot.referrals.length;
    const jumps = reachedTiers(count).reduce((sum, tier) => sum + tier.jump, 0);
    return Math.max(1, spot.start - count * WAITLIST.PER_REFERRAL - jumps);
  };
  const extraDiscount = (spot) =>
    spot ? reachedTiers(spot.referrals.length).reduce((most, tier) => Math.max(most, tier.extraDiscount), 0) : 0;
  const currentSpot = () => {
    const state = loadWaitlist();
    return state.current ? state.spots.get(state.current) : null;
  };
  const waveFor = (position) => {
    const wave = WAITLIST.WAVES.find((item) => position <= item.upTo);
    return wave ? { name: wave.name, date: DATES[wave.date] } : { name: "Public launch day", date: DATES.launch };
  };
  const maskEmail = (email) => {
    const [name, domain] = email.split("@");
    return `${name.slice(0, 2)}•••@${domain}`;
  };

  function refreshSpotCallouts() {
    const state = loadWaitlist();
    const spot = state.current ? state.spots.get(state.current) : null;
    $$("[data-spot-cta]").forEach((link) => {
      link.textContent = spot ? `Your spot: No. ${number(spotPosition(spot))}` : "Join the waitlist";
    });
    $$("[data-line-count]").forEach((element) => {
      element.textContent = number(WAITLIST.BASE + state.seq);
    });
    $$("[data-quick-join]").forEach((form) => {
      const joined = form.parentElement && $("[data-quick-spot]", form.parentElement);
      form.hidden = Boolean(spot);
      if (joined) {
        joined.hidden = !spot;
        const place = $("[data-quick-position]", joined);
        if (place && spot) place.textContent = number(spotPosition(spot));
      }
    });
  }

  // A valid ?ref= on any page is remembered until the visitor joins.
  const pendingRef = () => {
    const fromUrl = params.get("ref");
    if (fromUrl && REF_PATTERN.test(fromUrl)) {
      safeStorage.setItem(STORAGE_KEYS.pendingRef, fromUrl);
      return fromUrl;
    }
    const stored = safeStorage.getItem(STORAGE_KEYS.pendingRef);
    return typeof stored === "string" && REF_PATTERN.test(stored) ? stored : null;
  };

  // Once used, an invite is forgotten and leaves the address, so a reload shows the visitor's spot.
  const clearInvite = () => {
    safeStorage.removeItem(STORAGE_KEYS.pendingRef);
    if (!params.has("ref")) return;
    params.delete("ref");
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("ref");
      window.history.replaceState(null, "", url);
    } catch {
      /* a sandboxed page can't change its address */
    }
  };

  function initQuickJoin() {
    $$("[data-quick-join]").forEach((form) => {
      const input = $('input[name="email"]', form);
      const error = $("[data-error]", form.parentElement || form);
      const clear = () => {
        input.removeAttribute("aria-invalid");
        if (error) error.textContent = "";
      };
      input.addEventListener("input", clear);
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const email = normalizeEmail(input.value);
        if (!EMAIL_PATTERN.test(email)) {
          input.setAttribute("aria-invalid", "true");
          if (error) error.textContent = "Enter an email address like you@yourpublication.example.";
          input.focus();
          return;
        }
        clear();
        const query = new URLSearchParams({ email });
        const ref = pendingRef();
        if (ref) query.set("ref", ref);
        window.location.href = `waitlist.html?${query}`;
      });
    });
  }

  /* ---------- Subject-line tester ---------- */

  function scoreSubject(rawSubject) {
    const subject = rawSubject.trim();
    const characters = Array.from(subject);
    const length = characters.length;
    if (!length) return null;
    let score = SUBJECT.BASE_SCORE;
    const flags = [];
    const add = (points, level, text) => {
      score += points;
      flags.push({ level, text });
    };

    const rule = SUBJECT.LENGTH_RULES.find(
      ([shortest, longest]) => length >= shortest && (longest === null || length <= longest),
    );
    add(rule[2], rule[2] > 0 ? "good" : "warn", `${plural(length, "character")}. ${rule[3]}`);

    const lower = subject.toLowerCase();
    const spam = SUBJECT.SPAM_WORDS.filter((word) => {
      const safe = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`(^|[^a-z0-9])${safe}(?=$|[^a-z0-9])`).test(lower);
    });
    if (spam.length) {
      add(
        -Math.min(spam.length * SUBJECT.SPAM_PENALTY, SUBJECT.SPAM_PENALTY_MAX),
        "bad",
        `Spam filter ${spam.length === 1 ? "word" : "words"}: ${spam.map((word) => `"${word}"`).join(", ")}.`,
      );
    } else {
      flags.push({ level: "good", text: "No common spam filter words." });
    }

    const letters = subject.replace(/[^\p{L}]/gu, "");
    const allCaps = letters.length >= 6 && letters === letters.toUpperCase() && /\s/.test(subject);
    const shouted = subject.match(/\b[A-Z]{4,}\b/g) || [];
    if (allCaps) add(-SUBJECT.ALL_CAPS_PENALTY, "bad", "The whole line is in capitals. It reads as shouting.");
    else if (shouted.length)
      add(
        -Math.min(shouted.length * SUBJECT.CAPS_PENALTY, SUBJECT.CAPS_PENALTY_MAX),
        "warn",
        `Shouted ${shouted.length === 1 ? "word" : "words"}: ${shouted.join(", ")}.`,
      );

    const bangs = (subject.match(/!/g) || []).length;
    if (bangs >= 2) add(-SUBJECT.MANY_BANGS_PENALTY, "bad", `${number(bangs)} exclamation marks. One at most.`);
    else if (bangs === 1) add(-SUBJECT.ONE_BANG_PENALTY, "warn", "An exclamation mark. Often fine, rarely needed.");

    if (/\$\$|\?\?/.test(subject))
      add(-SUBJECT.SYMBOL_RUN_PENALTY, "bad", "Repeated symbols, like $$ or ??, trip filters.");
    if (/^(re|fwd?)\s*:/i.test(subject))
      add(-SUBJECT.FAKE_REPLY_PENALTY, "bad", "Starts like a reply or a forward, which isn't honest unless it is one.");

    const emoji = subject.match(/\p{Extended_Pictographic}/gu) || [];
    if (emoji.length >= 2) add(-SUBJECT.MANY_EMOJI_PENALTY, "warn", `${number(emoji.length)} emoji. One is plenty.`);

    if (/\d/.test(subject)) add(SUBJECT.DIGIT_BONUS, "good", "A number gives the eye something to catch.");
    if (/\{\{\s*[\w.]+\s*\}\}/.test(subject)) add(SUBJECT.TOKEN_BONUS, "good", "A merge tag makes it personal.");

    score = Math.max(0, Math.min(100, score));
    const grade = SUBJECT.GRADES.find((item) => score >= item.min);
    const cut = (limit) =>
      length > limit
        ? { text: `${characters.slice(0, limit).join("").trimEnd()}…`, cut: true }
        : { text: subject, cut: false };
    return {
      score,
      grade: grade.label,
      length,
      flags,
      mobile: cut(SUBJECT.MOBILE_LIMIT),
      desktop: cut(SUBJECT.DESKTOP_LIMIT),
    };
  }

  function initSubjectTester() {
    const form = $("[data-subject-form]");
    if (!form) return;
    const input = $('input[name="subject"]', form);
    const scoreOut = $("[data-subject-score]");
    const gradeOut = $("[data-subject-grade]");
    const gauge = $("[data-subject-gauge]");
    const flagList = $("[data-subject-flags]");
    const mobile = $("[data-subject-mobile]");
    const desktop = $("[data-subject-desktop]");
    const cutNote = $("[data-subject-cut]");
    const counter = $("[data-subject-count]");
    const CIRCUMFERENCE = 2 * Math.PI * 52;
    const MARKS = { good: "OK", warn: "Check", bad: "Fix" };
    const MARK_CLASS = { good: "text-leaf", warn: "text-honey", bad: "text-rose" };
    gauge.style.strokeDasharray = String(CIRCUMFERENCE);

    const render = () => {
      const result = scoreSubject(input.value);
      if (!result) {
        scoreOut.textContent = "–";
        gradeOut.textContent = "Type a subject line to score it";
        gauge.style.strokeDashoffset = String(CIRCUMFERENCE);
        flagList.innerHTML = "";
        mobile.textContent = "Your subject line appears here";
        desktop.textContent = "Your subject line appears here";
        cutNote.textContent = "";
        counter.textContent = "0 characters";
        return;
      }
      scoreOut.textContent = String(result.score);
      gradeOut.textContent = result.grade;
      gauge.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - result.score / 100));
      flagList.innerHTML = result.flags
        .map(
          (flag) =>
            `<li class="flex items-start gap-2.5"><span class="mt-0.5 w-11 shrink-0 font-mono text-xs font-bold uppercase ${MARK_CLASS[flag.level]}">${MARKS[flag.level]}</span><span class="min-w-0 text-[0.95rem] break-words text-haze">${esc(flag.text)}</span></li>`,
        )
        .join("");
      mobile.textContent = result.mobile.text;
      desktop.textContent = result.desktop.text;
      counter.textContent = plural(result.length, "character");
      cutNote.textContent = result.mobile.cut
        ? `Phones cut this after ${SUBJECT.MOBILE_LIMIT} characters${result.desktop.cut ? `, desktops after ${SUBJECT.DESKTOP_LIMIT}` : ""}.`
        : "Fits on a phone without being cut.";
    };
    input.addEventListener("input", render);
    form.addEventListener("submit", (event) => event.preventDefault());
    $$("[data-subject-sample]").forEach((button) => {
      button.addEventListener("click", () => {
        input.value = button.dataset.subjectSample;
        render();
        input.focus();
      });
    });
    render();
  }

  /* ---------- Product tour ---------- */

  function initTabs() {
    $$("[data-tabs]").forEach((list) => {
      const tabs = $$('[role="tab"]', list);
      const select = (tab, focus) => {
        tabs.forEach((other) => {
          const on = other === tab;
          other.setAttribute("aria-selected", String(on));
          other.tabIndex = on ? 0 : -1;
          document.getElementById(other.getAttribute("aria-controls")).hidden = !on;
        });
        if (focus) {
          tab.focus();
          tab.scrollIntoView({ block: "nearest", inline: "nearest" });
        }
      };
      tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => {
          select(tab, false);
          try {
            const url = new URL(window.location.href);
            url.searchParams.set("tab", tab.dataset.tab);
            window.history.replaceState(null, "", url);
          } catch {
            /* a sandboxed page can't change its URL; the tab still works */
          }
        });
        tab.addEventListener("keydown", (event) => {
          const moves = {
            ArrowRight: (index + 1) % tabs.length,
            ArrowLeft: (index - 1 + tabs.length) % tabs.length,
            Home: 0,
            End: tabs.length - 1,
          };
          if (!own(moves, event.key)) return;
          event.preventDefault();
          select(tabs[moves[event.key]], true);
        });
      });
      const wanted = tabs.find((tab) => tab.dataset.tab === params.get("tab"));
      select(wanted || tabs[0], false);
    });
  }

  function initDevicePreview() {
    const frame = $("[data-device-frame]");
    if (!frame) return;
    const buttons = $$("[data-device]");
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        buttons.forEach((other) => other.setAttribute("aria-pressed", String(other === button)));
        const phone = button.dataset.device === "phone";
        frame.classList.toggle("max-w-[19rem]", phone);
        frame.classList.toggle("max-w-full", !phone);
        $("[data-device-label]").textContent = phone ? "Phone preview, 340 pixels wide" : "Desktop preview";
      });
    });
  }

  function initFlowViewer() {
    const out = $("[data-flow-nodes]");
    if (!out) return;
    const summary = $("[data-flow-summary]");
    const KIND_CLASS = {
      Trigger: "bg-apricot text-night",
      Email: "bg-iris text-night",
      Wait: "bg-dusk text-mist",
      Branch: "bg-coral text-night",
      Stop: "bg-haze text-night",
    };
    const render = (id) => {
      if (!own(AUTOMATIONS, id)) return;
      summary.textContent = AUTOMATIONS[id].summary;
      out.innerHTML = AUTOMATIONS[id].nodes
        .map(
          (node, index, all) => `<li class="relative flex gap-3 ${index < all.length - 1 ? "pb-3" : ""}">
            ${index < all.length - 1 ? '<span class="absolute top-8 bottom-0 left-[1.65rem] w-px bg-wire" aria-hidden="true"></span>' : ""}
            <span class="relative z-10 inline-flex h-7 w-[3.4rem] shrink-0 items-center justify-center rounded-full font-mono text-[0.68rem] font-bold uppercase ${KIND_CLASS[node.kind]}">${esc(node.kind)}</span>
            <span class="min-w-0"><strong class="block text-[0.97rem] leading-tight font-semibold">${esc(node.title)}</strong><span class="mt-0.5 block text-sm text-fog">${esc(node.meta)}</span></span>
          </li>`,
        )
        .join("");
    };
    $$('input[name="flow"]').forEach((input) => {
      input.addEventListener("change", () => render(input.value));
    });
    render($('input[name="flow"]:checked').value);
  }

  function initSegmentBuilder() {
    const form = $("[data-segment-form]");
    if (!form) return;
    const countOut = $("[data-seg-count]");
    const shareOut = $("[data-seg-share]");
    const bar = $("[data-seg-bar]");
    const render = () => {
      const rules = $$('input[name="rule"]:checked', form)
        .map((input) => input.value)
        .filter((id) => own(SEGMENTS.RULES, id));
      const match = $('input[name="match"]:checked', form).value;
      let share = 1;
      if (rules.length) {
        share =
          match === "any"
            ? 1 - rules.reduce((rest, id) => rest * (1 - SEGMENTS.RULES[id].share), 1)
            : rules.reduce((rest, id) => rest * SEGMENTS.RULES[id].share, 1);
      }
      const count = Math.round(SEGMENTS.LIST_SIZE * share);
      countOut.textContent = number(count);
      const percent = Math.round((count / SEGMENTS.LIST_SIZE) * 100);
      shareOut.textContent = rules.length
        ? `${percent}% of your ${number(SEGMENTS.LIST_SIZE)} subscribers`
        : `Your whole list of ${number(SEGMENTS.LIST_SIZE)} subscribers`;
      bar.style.width = `${Math.max(percent, count ? 1 : 0)}%`;
    };
    form.addEventListener("change", render);
    form.addEventListener("submit", (event) => event.preventDefault());
    render();
  }

  const warmupDays = (size) => MIGRATION.WARMUP.find((row) => row.upTo === null || size <= row.upTo).days;

  function initWarmupPlanner() {
    const chart = $("[data-warm-chart]");
    if (!chart) return;
    const note = $("[data-warm-note]");
    const render = (size) => {
      const days = warmupDays(size);
      const plan = Array.from({ length: days }, (_, index) => {
        const day = index + 1;
        return { day, volume: day === days ? size : Math.round(size * (day / days) ** 2) };
      });
      note.textContent = `${number(size)} subscribers warm up over ${plural(days, "day")}, starting with ${number(plan[0].volume)} of your most engaged readers.`;
      chart.innerHTML = plan
        .map(
          (row) =>
            `<li class="flex min-w-0 flex-1 flex-col justify-end" title="Day ${row.day}: ${number(row.volume)} emails"><span class="block rounded-t bg-coral" style="height:${Math.max(4, (row.volume / size) * 100)}%"></span><span class="sr-only">Day ${row.day}: ${number(row.volume)} emails</span></li>`,
        )
        .join("");
    };
    $$('input[name="warm"]').forEach((input) => {
      input.addEventListener("change", () => render(Number(input.value)));
    });
    render(Number($('input[name="warm"]:checked').value));
  }

  function initAnalyticsChart() {
    const svg = $("[data-analytics-chart]");
    if (!svg) return;
    const latest = $("[data-analytics-latest]");
    const change = $("[data-analytics-change]");
    const summary = $("[data-analytics-summary]");
    const render = (id) => {
      if (!own(ANALYTICS.METRICS, id)) return;
      const metric = ANALYTICS.METRICS[id];
      const values = metric.values;
      const show = (value) => `${metric.prefix || ""}${number(value)}${metric.suffix || ""}`;
      const W = 600;
      const H = 220;
      const PAD = { top: 16, right: 16, bottom: 30, left: 16 };
      const low = Math.min(...values) * 0.9;
      const high = Math.max(...values) * 1.05;
      const x = (index) => PAD.left + (index / (values.length - 1)) * (W - PAD.left - PAD.right);
      const y = (value) => PAD.top + (1 - (value - low) / (high - low)) * (H - PAD.top - PAD.bottom);
      const points = values.map((value, index) => `${x(index).toFixed(1)},${y(value).toFixed(1)}`);
      const labels = ANALYTICS.CAMPAIGNS.map((name, index) =>
        index % 3 === 0
          ? `<text x="${x(index)}" y="${H - 8}" text-anchor="${index === 0 ? "start" : index === values.length - 1 ? "end" : "middle"}" fill="#b8abc9" font-size="16" font-family="Overpass Mono, monospace">${name}</text>`
          : "",
      ).join("");
      svg.innerHTML = `
        <defs><linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff8f70" stop-opacity=".45"/><stop offset="1" stop-color="#ff8f70" stop-opacity="0"/></linearGradient></defs>
        ${[0.25, 0.5, 0.75].map((f) => `<line x1="${PAD.left}" x2="${W - PAD.right}" y1="${PAD.top + f * (H - PAD.top - PAD.bottom)}" y2="${PAD.top + f * (H - PAD.top - PAD.bottom)}" stroke="#fff" stroke-opacity=".1"/>`).join("")}
        <path d="M${x(0)},${H - PAD.bottom} L${points.join(" L")} L${x(values.length - 1)},${H - PAD.bottom} Z" fill="url(#chart-fill)"/>
        <polyline points="${points.join(" ")}" fill="none" stroke="#ffcb9e" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
        ${values.map((value, index) => `<circle cx="${x(index)}" cy="${y(value)}" r="${index === values.length - 1 ? 6 : 3.5}" fill="${index === values.length - 1 ? "#ff8f70" : "#ffcb9e"}"/>`).join("")}
        ${labels}`;
      svg.setAttribute(
        "aria-label",
        `${metric.label} for the last ${values.length} campaigns, from ${show(values[0])} to ${show(values[values.length - 1])}.`,
      );
      latest.textContent = show(values[values.length - 1]);
      const delta = Math.round((values[values.length - 1] / values[0] - 1) * 100);
      change.textContent = `${delta >= 0 ? "Up" : "Down"} ${Math.abs(delta)}% over ${values.length} campaigns`;
      summary.textContent = metric.label;
    };
    $$('input[name="metric"]').forEach((input) => {
      input.addEventListener("change", () => render(input.value));
    });
    render($('input[name="metric"]:checked').value);
  }

  /* ---------- Waitlist page ---------- */

  function initWaitlist() {
    const root = $("[data-waitlist]");
    if (!root) return;
    const joinView = $("[data-join-view]");
    const spotView = $("[data-spot-view]");
    const form = $("[data-join-form]");
    const banner = $("[data-invite-banner]");
    const backButton = $("[data-back-to-spot]");
    const claimForm = $("[data-claim-form]");
    const claimInput = $('input[name="claim"]', claimForm);
    const claimError = $("[data-claim-error]");
    const leaveConfirm = $("[data-leave-confirm]");
    const FIELDS = {
      email: "Enter an email address like you@yourpublication.example.",
      publication: "Tell us the name of your publication or shop, at least 2 characters.",
      size: "Choose your list size.",
      tool: "Choose what you use today.",
    };

    // Options come from data.js, so the waitlist and the migration estimator share one list.
    const fill = (select, map) => {
      Object.keys(map).forEach((key) => {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = map[key];
        select.append(option);
      });
    };
    fill($('select[name="size"]', form), WAITLIST.LIST_SIZES);
    fill($('select[name="tool"]', form), TOOLS);

    const field = (name) => form.elements[name];
    const setError = (name, message) => {
      const input = field(name);
      const out = $(`[data-error-for="${name}"]`, form);
      if (message) input.setAttribute("aria-invalid", "true");
      else input.removeAttribute("aria-invalid");
      out.textContent = message || "";
    };
    const clearErrors = () => Object.keys(FIELDS).forEach((name) => setError(name, ""));
    Object.keys(FIELDS).forEach((name) => {
      const clear = () => setError(name, "");
      field(name).addEventListener("input", clear);
      field(name).addEventListener("change", clear);
    });

    const showForm = (ref) => {
      clearErrors();
      joinView.hidden = false;
      spotView.hidden = true;
      const state = loadWaitlist();
      backButton.hidden = !state.current;
      if (banner) {
        banner.hidden = !ref;
        if (ref) {
          const inviter = [...state.spots.values()].find((spot) => spot.code === ref);
          $("[data-inviter]", banner).textContent =
            inviter && inviter.publication ? inviter.publication : "A Loftwing member";
        }
      }
      refreshSpotCallouts();
    };

    const renderTiers = (count) => {
      const out = $("[data-tier-list]");
      out.innerHTML = WAITLIST.TIERS.map((tier) => {
        const reached = count >= tier.at;
        const left = tier.at - count;
        return `<li class="pane flex items-start gap-3 p-3.5" data-tier="${tier.id}" data-reached="${reached}">
          <span class="inline-flex size-9 shrink-0 items-center justify-center rounded-full font-mono text-sm font-bold ${reached ? "bg-leaf text-night" : "bg-dusk text-mist"}">${tier.at}</span>
          <span class="min-w-0"><strong class="block font-display font-bold">${esc(tier.name)} <span class="ml-1 text-sm font-semibold ${reached ? "text-leaf" : "text-fog"}">${reached ? "Reached" : `${plural(left, "more invite")} to go`}</span></strong><span class="mt-0.5 block text-sm text-haze">${esc(tier.perk)}</span></span>
        </li>`;
      }).join("");
    };

    const renderSpot = (notice) => {
      const state = loadWaitlist();
      const spot = state.current ? state.spots.get(state.current) : null;
      if (!spot) return false;
      const position = spotPosition(spot);
      const count = spot.referrals.length;
      const wave = waveFor(position);
      $$("[data-spot-position]").forEach((element) => {
        element.textContent = number(position);
      });
      $("[data-spot-publication]").textContent = spot.publication || "Your publication";
      $("[data-spot-email]").textContent = state.current;
      $("[data-spot-code]").textContent = spot.code;
      $("[data-spot-wave]").textContent = wave.name;
      const waveDate = $("[data-spot-wave-date]");
      waveDate.textContent = formatDate(wave.date, "long");
      waveDate.dateTime = isoDay(wave.date);
      const link = new URL(`waitlist.html?ref=${spot.code}`, window.location.href);
      $("[data-ref-link]").value = link.href;
      $("[data-copy-status]").textContent = "";

      const noticeOut = $("[data-spot-notice]");
      noticeOut.textContent = notice || "";
      noticeOut.hidden = !notice;

      const next = WAITLIST.TIERS.find((tier) => count < tier.at);
      $("[data-ref-count]").textContent = plural(count, "invite") + " accepted";
      $("[data-ref-next]").textContent = next
        ? `${plural(next.at - count, "more invite")} to reach ${next.name}.`
        : "You've reached every tier. Thank you for bringing the flock.";
      // Three equal segments: 0 to 3, 3 to 10, 10 to 25 invites.
      const marks = [0, ...WAITLIST.TIERS.map((tier) => tier.at)];
      const segment = marks.findIndex((mark, index) => count < (marks[index + 1] ?? Infinity));
      const width =
        segment >= marks.length - 1
          ? 100
          : ((segment + (count - marks[segment]) / (marks[segment + 1] - marks[segment])) / (marks.length - 1)) * 100;
      const progress = $("[data-ref-progress]");
      progress.setAttribute("aria-valuenow", String(Math.min(count, marks[marks.length - 1])));
      progress.setAttribute("aria-valuetext", `${plural(count, "invite")} accepted`);
      $("[data-ref-bar]").style.width = `${width}%`;
      renderTiers(count);

      const accepted = $("[data-accepted-list]");
      accepted.innerHTML = spot.referrals
        .slice()
        .reverse()
        .map(
          (item) =>
            `<li class="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 border-t border-white/10 py-2 text-sm first:border-t-0"><span class="min-w-0 break-all">${esc(maskEmail(item.email))}</span><span class="text-fog">${item.via === "link" ? "Joined from your link" : "Matched to your invite"}${item.at ? `, ${esc(formatDate(new Date(`${item.at}T00:00:00Z`), "short"))}` : ""}</span></li>`,
        )
        .join("");
      $("[data-accepted-empty]").hidden = count > 0;

      joinView.hidden = true;
      spotView.hidden = false;
      if (banner) banner.hidden = true;
      leaveConfirm.hidden = true;
      refreshSpotCallouts();
      return true;
    };

    const focusSpot = () => {
      const heading = $("[data-spot-heading]");
      heading.focus({ preventScroll: true });
      spotView.scrollIntoView({ block: "start" });
    };

    /*
     * Joining happens in the browser only. To connect a real list, POST the fields to your backend here
     * (Formspree, your own API) and render the spot from its answer: the position and code should come from
     * the server, and the spot should show only when it answers OK. See DOCS.md, "Connect the waitlist".
     */
    const addReferral = (spot, email, via) => {
      if (spot.referrals.some((item) => item.email === email)) return false;
      spot.referrals.push({ email, at: todayIso(), via });
      return true;
    };
    const join = (fields, ref) => {
      const state = loadWaitlist();
      const email = fields.email;
      if (state.spots.has(email)) {
        state.current = email;
        saveWaitlist(state);
        return { existing: true, credited: false };
      }
      state.seq += 1;
      const code = referralCode(email);
      const spot = {
        start: WAITLIST.BASE + state.seq,
        code,
        publication: fields.publication,
        size: fields.size,
        tool: fields.tool,
        joined: todayIso(),
        referrals: [],
      };
      let credited = false;
      if (ref && ref !== code) {
        const inviter = [...state.spots.values()].find((other) => other.code === ref);
        if (inviter) credited = addReferral(inviter, email, "link");
      }
      state.spots.set(email, spot);
      state.current = email;
      saveWaitlist(state);
      return { existing: false, credited };
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const email = normalizeEmail(field("email").value);
      const publication = field("publication").value.trim();
      const size = field("size").value;
      const tool = field("tool").value;
      const errors = {};
      if (!EMAIL_PATTERN.test(email)) errors.email = FIELDS.email;
      // A known address gets its existing spot straight away, whatever else is on the form.
      if (!errors.email && loadWaitlist().spots.has(email)) {
        join({ email }, null);
        clearInvite();
        form.reset();
        renderSpot("This address is already on the list, so here's the spot it already holds.");
        focusSpot();
        return;
      }
      if (publication.length < 2) errors.publication = FIELDS.publication;
      if (!own(WAITLIST.LIST_SIZES, size)) errors.size = FIELDS.size;
      if (!own(TOOLS, tool)) errors.tool = FIELDS.tool;
      Object.keys(FIELDS).forEach((name) => setError(name, errors[name] || ""));
      const first = Object.keys(FIELDS).find((name) => errors[name]);
      if (first) {
        field(first).focus();
        return;
      }
      const ref = pendingRef();
      join({ email, publication, size, tool }, ref);
      clearInvite();
      form.reset();
      renderSpot("You're on the list. Your spot is saved on this device, so it'll be here when you come back.");
      focusSpot();
    });

    backButton.addEventListener("click", () => {
      form.reset();
      clearErrors();
      renderSpot();
      focusSpot();
    });
    $("[data-other-address]").addEventListener("click", () => {
      form.reset();
      showForm(pendingRef());
      field("email").focus();
    });

    $("[data-copy]").addEventListener("click", async () => {
      const input = $("[data-ref-link]");
      const status = $("[data-copy-status]");
      let copied = false;
      try {
        await navigator.clipboard.writeText(input.value);
        copied = true;
      } catch {
        input.focus();
        input.select();
        try {
          copied = document.execCommand("copy");
        } catch {
          copied = false;
        }
      }
      status.textContent = copied ? "Link copied." : "Press Ctrl or Command + C to copy the selected link.";
    });

    claimInput.addEventListener("input", () => {
      claimInput.removeAttribute("aria-invalid");
      claimError.textContent = "";
    });
    claimForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const state = loadWaitlist();
      const spot = state.current ? state.spots.get(state.current) : null;
      if (!spot) return;
      const email = normalizeEmail(claimInput.value);
      const fail = (message) => {
        claimInput.setAttribute("aria-invalid", "true");
        claimError.textContent = message;
        claimInput.focus();
      };
      if (!EMAIL_PATTERN.test(email)) return fail("Enter the address they joined with.");
      if (email === state.current) return fail("That's your own address. Invites need to come from someone else.");
      if (spot.referrals.some((item) => item.email === email)) return fail("That invite is already on your list.");
      const before = reachedTiers(spot.referrals.length).length;
      addReferral(spot, email, "claim");
      saveWaitlist(state);
      claimForm.reset();
      const tiers = reachedTiers(spot.referrals.length);
      const message =
        tiers.length > before
          ? `Invite matched. You've reached ${tiers[tiers.length - 1].name}.`
          : "Invite matched. You moved up the line.";
      renderSpot(message);
      claimInput.focus();
      return undefined;
    });

    $("[data-leave]").addEventListener("click", () => {
      leaveConfirm.hidden = false;
      $("[data-leave-no]").focus();
    });
    $("[data-leave-no]").addEventListener("click", () => {
      leaveConfirm.hidden = true;
      $("[data-leave]").focus();
    });
    $("[data-leave-yes]").addEventListener("click", () => {
      const state = loadWaitlist();
      if (state.current) state.spots.delete(state.current);
      state.current = null;
      saveWaitlist(state);
      form.reset();
      showForm(null);
      field("email").focus();
    });

    /* Where the visitor lands: a link from someone else, an address from the home page, or their saved spot. */
    const ref = pendingRef();
    const emailParam = normalizeEmail(params.get("email"));
    const state = loadWaitlist();
    const clearUrl = () => {
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete("email");
        window.history.replaceState(null, "", url);
      } catch {
        /* a sandboxed page can't change its URL */
      }
    };
    if (EMAIL_PATTERN.test(emailParam) && state.spots.has(emailParam)) {
      join({ email: emailParam }, null);
      clearInvite();
      clearUrl();
      renderSpot("This address is already on the list, so here's the spot it already holds.");
      return;
    }
    if (EMAIL_PATTERN.test(emailParam)) {
      clearUrl();
      showForm(ref);
      field("email").value = emailParam;
      return;
    }
    const current = state.current ? state.spots.get(state.current) : null;
    if (current && ref === current.code) {
      // Their own link: nothing to credit, but a second address joined from here still counts as an invite.
      renderSpot(
        params.get("ref") === ref
          ? "That's your own invite link. Share it with someone else and it'll count here."
          : "",
      );
      return;
    }
    if (ref && params.get("ref") === ref) {
      showForm(ref);
      return;
    }
    if (!renderSpot()) showForm(ref);
  }

  /* ---------- Pricing calculator ---------- */

  // Whole-dollar monthly list price of a plan for a list size, or null when the list needs a quote.
  const listPrice = (plan, subscribers) => {
    const band = PRICING.BANDS.find((row) => subscribers <= row.upTo);
    return band ? Math.round(band.base * plan.factor) : null;
  };
  // Everything is worked out in whole cents so rounding happens once, at the end.
  function planQuote(plan, subscribers, sends, annual, foundingPercent) {
    const list = listPrice(plan, subscribers);
    if (list === null) return null;
    const keep = 100 - foundingPercent;
    const monthlyCents = Math.round(list * keep);
    const yearCents = Math.round((list * 12 * (100 - PRICING.ANNUAL_DISCOUNT) * keep) / 100);
    const subscriptionCents = annual ? Math.round(yearCents / 12) : monthlyCents;
    const extraEmails = Math.max(0, subscribers * (sends - plan.includedSends));
    const overageCents = Math.ceil(extraEmails / 1000) * PRICING.OVERAGE_PER_THOUSAND_CENTS;
    return {
      list,
      subscriptionCents,
      yearCents,
      overageCents,
      extraEmails,
      totalCents: subscriptionCents + overageCents,
      savedPerYearCents: list * 1200 - (annual ? yearCents : monthlyCents * 12),
    };
  }
  const money = (cents) => {
    const dollars = cents / 100;
    return `$${dollars.toLocaleString("en-US", {
      minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    })}`;
  };

  function initPricing() {
    const form = $("[data-price-form]");
    if (!form) return;
    const subscribersInput = form.elements.subscribers;
    const subscribersRange = form.elements.subscribersRange;
    const sendsInput = form.elements.sends;
    const foundingInput = form.elements.founding;
    const errorOut = $("[data-price-error]");
    const sendsOut = $("[data-sends-output]");
    const cardsOut = $("[data-plan-cards]");
    const customOut = $("[data-custom-quote]");
    const summaryOut = $("[data-price-summary]");
    const memberNote = $("[data-member-note]");
    const headCells = $$("[data-compare-price]");
    const spot = currentSpot();
    const extra = extraDiscount(spot);

    const stored = readJson(STORAGE_KEYS.pricing);
    const state = { ...PRICING.DEFAULTS };
    if (isObject(stored)) {
      if (Number.isInteger(stored.subscribers) && stored.subscribers >= 1 && stored.subscribers <= PRICING.MAX_INPUT)
        state.subscribers = stored.subscribers;
      if (Number.isInteger(stored.sends) && stored.sends >= 1 && stored.sends <= 30) state.sends = stored.sends;
      if (stored.billing === "monthly" || stored.billing === "annual") state.billing = stored.billing;
      if (typeof stored.founding === "boolean") state.founding = stored.founding;
    }

    const setError = (message) => {
      errorOut.textContent = message || "";
      if (message) subscribersInput.setAttribute("aria-invalid", "true");
      else subscribersInput.removeAttribute("aria-invalid");
    };
    const syncInputs = () => {
      subscribersInput.value = String(state.subscribers);
      subscribersRange.value = String(Math.min(state.subscribers, Number(subscribersRange.max)));
      sendsInput.value = String(state.sends);
      foundingInput.checked = state.founding;
      $$('input[name="billing"]', form).forEach((input) => {
        input.checked = input.value === state.billing;
      });
    };
    const recommended = () =>
      PRICING.PLANS.find((plan) => state.sends <= plan.includedSends) || PRICING.PLANS[PRICING.PLANS.length - 1];

    const render = () => {
      const annual = state.billing === "annual";
      const percent = state.founding ? PRICING.FOUNDING_DISCOUNT + extra : 0;
      sendsOut.textContent = `${plural(state.sends, "email")} per subscriber, per month (${number(state.subscribers * state.sends)} emails)`;
      memberNote.textContent = spot
        ? `Your spot, No. ${number(spotPosition(spot))}, unlocks ${PRICING.FOUNDING_DISCOUNT + extra}% off for as long as you stay.`
        : `Join the waitlist to lock in ${PRICING.FOUNDING_DISCOUNT}% off for as long as you stay.`;
      writeJson(STORAGE_KEYS.pricing, state);

      const custom = state.subscribers > PRICING.CUSTOM_ABOVE;
      customOut.hidden = !custom;
      cardsOut.hidden = custom;
      headCells.forEach((cell) => {
        const plan = PRICING.PLANS.find((item) => item.id === cell.dataset.comparePrice);
        const quote = planQuote(plan, state.subscribers, state.sends, annual, percent);
        cell.textContent = quote ? `${money(quote.totalCents)}/mo` : "Custom";
      });
      if (custom) {
        summaryOut.textContent = `${number(state.subscribers)} subscribers is above our published prices. We'll send you a quote.`;
        return;
      }
      const best = recommended();
      const cards = PRICING.PLANS.map((plan) => {
        const quote = planQuote(plan, state.subscribers, state.sends, annual, percent);
        const isBest = plan === best;
        const discounted = quote.subscriptionCents !== quote.list * 100;
        return `<article class="glass relative flex flex-col p-6 ${isBest ? "ring-2 ring-apricot" : ""}" data-plan="${plan.id}">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h3 class="text-2xl font-extrabold">${esc(plan.name)}</h3>
            ${isBest ? '<span class="rounded-full bg-apricot px-3 py-0.5 text-sm font-bold text-night" data-plan-best>Best fit</span>' : ""}
          </div>
          <p class="mt-1 text-[0.95rem] text-haze">${esc(plan.pitch)}</p>
          <p class="mt-5 flex flex-wrap items-baseline gap-x-2"><span class="font-display text-[2.6rem] leading-none font-extrabold" data-plan-total>${money(quote.totalCents)}</span><span class="text-haze">/month</span></p>
          ${discounted ? `<p class="mt-1 text-sm text-fog">List price <s data-plan-list>$${number(quote.list)}</s> a month</p>` : `<p class="mt-1 text-sm text-fog">List price, with no founding discount</p>`}
          <dl class="mt-4 space-y-1.5 border-t border-white/15 pt-4 text-sm">
            <div class="flex justify-between gap-3"><dt class="text-haze">Subscription</dt><dd data-plan-sub>${money(quote.subscriptionCents)}/mo</dd></div>
            ${annual ? `<div class="flex justify-between gap-3"><dt class="text-haze">Billed yearly</dt><dd data-plan-year>${money(quote.yearCents)}</dd></div>` : ""}
            <div class="flex justify-between gap-3"><dt class="text-haze">${number(plan.includedSends * state.subscribers)} emails included</dt><dd data-plan-over>${quote.overageCents ? `+${money(quote.overageCents)}/mo` : "No extras"}</dd></div>
            ${quote.savedPerYearCents > 0 ? `<div class="flex justify-between gap-3 font-semibold text-leaf"><dt>You save</dt><dd data-plan-save>${money(quote.savedPerYearCents)}/yr</dd></div>` : ""}
          </dl>
          <a class="btn ${isBest ? "" : "btn-ghost"} mt-5 w-full" href="waitlist.html">${spot ? "See your spot" : "Join to lock this in"}</a>
        </article>`;
      }).join("");
      cardsOut.innerHTML = cards;
      const bestQuote = planQuote(best, state.subscribers, state.sends, annual, percent);
      summaryOut.textContent = `${best.name} fits best: ${money(bestQuote.totalCents)} a month for ${plural(state.subscribers, "subscriber")}${annual ? ", billed yearly" : ""}.`;
    };

    // Typing an invalid number shows an error and keeps the last good estimate until it's fixed.
    subscribersInput.addEventListener("input", () => {
      const raw = subscribersInput.value.trim();
      const value = Number(raw);
      if (!raw || !Number.isInteger(value) || value < 1 || value > PRICING.MAX_INPUT) {
        setError(`Enter a whole number from 1 to ${number(PRICING.MAX_INPUT)}.`);
        return;
      }
      setError("");
      state.subscribers = value;
      subscribersRange.value = String(Math.min(value, Number(subscribersRange.max)));
      render();
    });
    subscribersRange.addEventListener("input", () => {
      setError("");
      state.subscribers = Number(subscribersRange.value);
      subscribersInput.value = subscribersRange.value;
      render();
    });
    sendsInput.addEventListener("input", () => {
      state.sends = Number(sendsInput.value);
      render();
    });
    foundingInput.addEventListener("change", () => {
      state.founding = foundingInput.checked;
      render();
    });
    $$('input[name="billing"]', form).forEach((input) => {
      input.addEventListener("change", () => {
        state.billing = input.value;
        render();
      });
    });
    form.addEventListener("submit", (event) => event.preventDefault());
    $("[data-price-reset]").addEventListener("click", () => {
      Object.assign(state, PRICING.DEFAULTS);
      setError("");
      syncInputs();
      render();
    });

    // The comparison table comes from data.js.
    const body = $("[data-compare-body]");
    const CHECK =
      '<svg viewBox="0 0 20 20" class="mx-auto size-5 text-leaf" aria-hidden="true"><path d="M4 10.5 8.2 15 16 5.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="sr-only">Included</span>';
    const DASH = '<span class="text-fog" aria-hidden="true">–</span><span class="sr-only">Not included</span>';
    body.innerHTML = PRICING.COMPARE.map((row) => {
      if (row.group) {
        return `<tr><th colspan="4" scope="colgroup" class="bg-plum/70 px-4 py-2 text-left font-mono text-xs font-medium tracking-wide text-apricot uppercase">${esc(row.group)}</th></tr>`;
      }
      const cell = (value) =>
        `<td class="border-t border-white/10 px-3 py-3 text-center">${value === true ? CHECK : value === false ? DASH : esc(value)}</td>`;
      return `<tr><th scope="row" class="border-t border-white/10 px-4 py-3 text-left font-normal text-haze">${esc(row.label)}</th>${cell(row.solo)}${cell(row.shop)}${cell(row.press)}</tr>`;
    }).join("");

    syncInputs();
    render();
  }

  /* ---------- Migration estimator ---------- */

  const formatMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    if (!hours) return `${rest} min`;
    return rest ? `${hours} hr ${rest} min` : `${hours} hr`;
  };
  const stepMinutes = (step, size) =>
    step.minutes + (step.scale ? step.scale.add * Math.ceil(size / step.scale.per) : 0);

  function initMigration() {
    const form = $("[data-migrate-form]");
    if (!form) return;
    const sourceInput = form.elements.source;
    const sizeInput = form.elements.size;
    const autoInput = form.elements.automations;
    const sizeField = $("[data-size-field]");
    const autoField = $("[data-auto-field]");
    const error = $("[data-size-error]");
    const results = $("[data-m-results]");
    const placeholder = $("[data-m-placeholder]");
    const stepsOut = $("[data-m-steps]");

    Object.keys(TOOLS).forEach((key) => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = TOOLS[key];
      sourceInput.append(option);
    });

    const state = { ...MIGRATION.DEFAULTS, done: [] };
    const stored = readJson(STORAGE_KEYS.migrate);
    if (isObject(stored)) {
      if (own(MIGRATION.SOURCES, stored.source)) state.source = stored.source;
      if (Number.isInteger(stored.size) && stored.size >= 1 && stored.size <= MIGRATION.MAX_SIZE)
        state.size = stored.size;
      if (typeof stored.automations === "boolean") state.automations = stored.automations;
      if (Array.isArray(stored.done)) state.done = stored.done.filter((id) => own(MIGRATION.STEPS, id));
    }
    const fromUrl = params.get("from");
    if (own(MIGRATION.SOURCES, fromUrl)) state.source = fromUrl;

    const save = () => writeJson(STORAGE_KEYS.migrate, state);
    const activeSteps = () => MIGRATION.SOURCES[state.source].filter((id) => id !== "rebuild" || state.automations);
    const sizeUsed = () => (state.source === "none" ? 1 : state.size);

    const renderProgress = () => {
      const steps = activeSteps();
      const size = sizeUsed();
      const done = steps.filter((id) => state.done.includes(id));
      const total = steps.reduce((sum, id) => sum + stepMinutes(MIGRATION.STEPS[id], size), 0);
      const left = steps
        .filter((id) => !state.done.includes(id))
        .reduce((sum, id) => sum + stepMinutes(MIGRATION.STEPS[id], size), 0);
      $("[data-m-total]").textContent = formatMinutes(total);
      $("[data-m-done]").textContent = `${number(done.length)} of ${plural(steps.length, "step")} done`;
      $("[data-m-left]").textContent = left
        ? `${formatMinutes(left)} of hands-on time left`
        : "All done. Welcome home.";
      $("[data-m-bar]").style.width = `${steps.length ? (done.length / steps.length) * 100 : 0}%`;
    };
    const render = () => {
      const fresh = state.source === "none";
      sizeField.hidden = fresh;
      autoField.hidden = fresh;
      const sizeOk = !sizeInput.hasAttribute("aria-invalid");
      results.hidden = !sizeOk;
      placeholder.hidden = sizeOk;
      save();
      if (!sizeOk) return;
      const size = sizeUsed();
      const steps = activeSteps();
      const days = warmupDays(size);
      $("[data-m-note]").textContent = MIGRATION.SOURCE_NOTES[state.source];
      $("[data-m-days]").textContent = plural(days, "day");
      $("[data-m-scope]").textContent = fresh
        ? "Starting fresh, with an empty list"
        : `${plural(state.size, "subscriber")} from ${TOOLS[state.source].charAt(0).toLowerCase()}${TOOLS[state.source].slice(1)}`;
      stepsOut.innerHTML = steps
        .map((id, index) => {
          const step = MIGRATION.STEPS[id];
          const checked = state.done.includes(id);
          return `<li class="pane p-4" data-step="${id}">
            <label class="flex items-start gap-3">
              <input type="checkbox" class="mt-1 size-5 shrink-0 accent-coral" data-m-check value="${id}" ${checked ? "checked" : ""} />
              <span class="min-w-0 flex-1">
                <span class="flex flex-wrap items-baseline justify-between gap-x-3">
                  <strong class="font-display text-lg font-bold">${index + 1}. ${esc(step.title)}</strong>
                  <span class="font-mono text-sm text-apricot" data-step-minutes>${formatMinutes(stepMinutes(step, size))}</span>
                </span>
                <span class="mt-1 block text-[0.95rem] text-haze">${esc(step.body)}</span>
              </span>
            </label>
          </li>`;
        })
        .join("");
      renderProgress();
    };
    const sync = () => {
      sourceInput.value = state.source;
      sizeInput.value = String(state.size);
      autoInput.checked = state.automations;
    };
    sourceInput.addEventListener("change", () => {
      if (own(MIGRATION.SOURCES, sourceInput.value)) state.source = sourceInput.value;
      if (state.source === "none") {
        sizeInput.removeAttribute("aria-invalid");
        error.textContent = "";
        sizeInput.value = String(state.size);
      }
      render();
    });
    sizeInput.addEventListener("input", () => {
      const raw = sizeInput.value.trim();
      const value = Number(raw);
      if (!raw || !Number.isInteger(value) || value < 1 || value > MIGRATION.MAX_SIZE) {
        sizeInput.setAttribute("aria-invalid", "true");
        error.textContent = `Enter a whole number from 1 to ${number(MIGRATION.MAX_SIZE)}.`;
      } else {
        sizeInput.removeAttribute("aria-invalid");
        error.textContent = "";
        state.size = value;
      }
      render();
    });
    autoInput.addEventListener("change", () => {
      state.automations = autoInput.checked;
      render();
    });
    stepsOut.addEventListener("change", (event) => {
      if (!event.target.matches("[data-m-check]")) return;
      const id = event.target.value;
      state.done = state.done.filter((other) => other !== id);
      if (event.target.checked) state.done.push(id);
      save();
      renderProgress();
    });
    form.addEventListener("submit", (event) => event.preventDefault());
    $("[data-m-reset]").addEventListener("click", () => {
      Object.assign(state, MIGRATION.DEFAULTS, { done: [] });
      sizeInput.removeAttribute("aria-invalid");
      error.textContent = "";
      sync();
      render();
    });
    sync();
    render();
  }

  /* ---------- Roadmap ---------- */

  function initRoadmap() {
    const root = $("[data-roadmap]");
    if (!root) return;
    const statuses = Object.keys(ROADMAP.STATUSES);
    const validIds = new Set(ROADMAP.ITEMS.map((item) => item.id));
    const stored = readJson(STORAGE_KEYS.votes);
    const votes = new Set(
      Array.isArray(stored) ? stored.filter((id) => typeof id === "string" && validIds.has(id)) : [],
    );
    const fromUrl = params.get("status");
    let filter = own(ROADMAP.STATUSES, fromUrl) ? fromUrl : "all";
    let sort = "votes";
    const count = (item) => item.votes + (votes.has(item.id) ? 1 : 0);
    const SORTS = {
      votes: (a, b) => count(b) - count(a) || a.title.localeCompare(b.title),
      fewest: (a, b) => count(a) - count(b) || a.title.localeCompare(b.title),
      title: (a, b) => a.title.localeCompare(b.title),
    };
    const countOut = $("[data-rm-count]");
    const live = $("[data-rm-live]");
    const grid = $("[data-rm-grid]");
    const filters = $$("[data-rm-filter]");
    const sortInput = $("[data-rm-sort]");
    const STATUS_DOT = { shipped: "bg-leaf", beta: "bg-apricot", next: "bg-iris" };

    const render = (focusId) => {
      filters.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.rmFilter === filter)));
      const shown = filter === "all" ? statuses : [filter];
      grid.classList.toggle("lg:grid-cols-3", filter === "all");
      const single = filter !== "all";
      statuses.forEach((status) => {
        const column = $(`[data-rm-column="${status}"]`);
        column.hidden = !shown.includes(status);
        const items = ROADMAP.ITEMS.filter((item) => item.status === status).sort(SORTS[sort]);
        $("[data-rm-column-count]", column).textContent = plural(items.length, "item");
        const list = $("ul", column);
        list.classList.toggle("sm:grid-cols-2", single);
        list.classList.toggle("lg:grid-cols-3", single);
        list.innerHTML = items
          .map((item) => {
            const voted = votes.has(item.id);
            return `<li class="glass flex flex-col gap-3 p-4" data-item="${item.id}">
              <div class="flex items-start gap-3">
                <button type="button" class="inline-flex min-h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border px-1 py-1 font-mono text-sm font-bold ${voted ? "border-apricot bg-apricot text-night" : "border-white/30 bg-night/40 text-mist hover:bg-white/15"}" data-vote="${item.id}" aria-pressed="${voted}" aria-label="${voted ? "Remove your vote for" : "Upvote"} ${esc(item.title)}, ${plural(count(item), "vote")}">
                  <svg viewBox="0 0 16 16" class="size-3.5" aria-hidden="true"><path d="M8 3 14 11H2Z" fill="currentColor"/></svg>
                  <span data-vote-count>${number(count(item))}</span>
                </button>
                <div class="min-w-0">
                  <h3 class="text-lg leading-snug font-bold">${esc(item.title)}</h3>
                  <p class="mt-1 text-[0.95rem] text-haze">${esc(item.body)}</p>
                  <p class="mt-2 flex items-center gap-1.5 font-mono text-xs text-fog"><span class="size-1.5 rounded-full ${STATUS_DOT[item.status]}" aria-hidden="true"></span>${esc(item.area)}</p>
                </div>
              </div>
            </li>`;
          })
          .join("");
      });
      const visible = ROADMAP.ITEMS.filter((item) => shown.includes(item.status)).length;
      countOut.textContent = `${plural(visible, "item")}, ${plural(votes.size, "vote")} from you`;
      if (focusId) {
        const button = $(`[data-vote="${focusId}"]`);
        if (button) button.focus();
      }
    };

    filters.forEach((button) => {
      button.addEventListener("click", () => {
        filter = button.dataset.rmFilter;
        render();
      });
    });
    sortInput.addEventListener("change", () => {
      if (own(SORTS, sortInput.value)) sort = sortInput.value;
      render();
    });
    root.addEventListener("click", (event) => {
      const button = event.target.closest("[data-vote]");
      if (!button) return;
      const id = button.dataset.vote;
      if (!validIds.has(id)) return;
      const adding = !votes.has(id);
      if (adding) votes.add(id);
      else votes.delete(id);
      writeJson(STORAGE_KEYS.votes, [...votes]);
      const item = ROADMAP.ITEMS.find((other) => other.id === id);
      live.textContent = `${adding ? "Vote added to" : "Vote removed from"} ${item.title}. ${plural(count(item), "vote")}.`;
      render(id);
    });
    render();
  }

  /* ---------- Journal ---------- */

  const TOPIC_ART = {
    story:
      '<path d="M6 40V20L24 7l18 13v20Z" fill="#3a1d52" stroke="#ffcb9e" stroke-width="2" stroke-linejoin="round"/><path d="M19 40V28h10v12" fill="#ff8f70"/><circle cx="24" cy="19" r="3.5" fill="#ffcb9e"/>',
    deliverability:
      '<rect x="6" y="14" width="36" height="24" rx="4" fill="#3a1d52" stroke="#b9b1ff" stroke-width="2"/><path d="m7 16 17 13 17-13" fill="none" stroke="#b9b1ff" stroke-width="2"/><circle cx="38" cy="13" r="6" fill="#9be8c2"/><path d="m35.5 13 2 2 3.5-4" fill="none" stroke="#0f0a1e" stroke-width="1.8"/>',
    product:
      '<rect x="6" y="9" width="36" height="30" rx="4" fill="#3a1d52" stroke="#ffcb9e" stroke-width="2"/><path d="M12 18h24M12 25h16M12 32h20" stroke="#ffcb9e" stroke-width="2.4" stroke-linecap="round"/><path d="M36 22 44 14" stroke="#ff8f70" stroke-width="3.5" stroke-linecap="round"/>',
    business:
      '<circle cx="24" cy="24" r="17" fill="#3a1d52" stroke="#ff8f70" stroke-width="2"/><path d="M30 17.5c-1.5-2-3.5-2.8-6-2.8-3.6 0-6 1.9-6 4.6 0 6.3 12.4 3 12.4 9.5 0 2.8-2.7 4.700-6.400 4.700-2.800 0-5.1-1-6.600-3M24 11v26" fill="none" stroke="#ffcb9e" stroke-width="2.2" stroke-linecap="round"/>',
    migration:
      '<path d="M5 34c8-16 22-22 38-22" fill="none" stroke="#b9b1ff" stroke-width="2" stroke-dasharray="3 5" stroke-linecap="round"/><rect x="4" y="30" width="15" height="11" rx="2" fill="#3a1d52" stroke="#ffcb9e" stroke-width="2"/><path d="M37 6v12l-7-6Zm0 0 7 6-7 6" fill="#ff8f70"/>',
  };

  function initJournal() {
    const list = $("[data-journal-list]");
    if (!list) return;
    const countOut = $("[data-journal-count]");
    const filters = $$("[data-journal-filter]");
    const fromUrl = params.get("topic");
    let topic = own(JOURNAL.TOPICS, fromUrl) ? fromUrl : "all";
    const entries = JOURNAL.ENTRIES.slice().sort((a, b) => b.date.localeCompare(a.date));
    filters.forEach((button) => {
      const key = button.dataset.journalFilter;
      const total = key === "all" ? entries.length : entries.filter((entry) => entry.topic === key).length;
      $("[data-count]", button).textContent = String(total);
    });
    const render = () => {
      filters.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.journalFilter === topic)));
      const shown = topic === "all" ? entries : entries.filter((entry) => entry.topic === topic);
      countOut.textContent = plural(shown.length, "entry", "entries");
      list.innerHTML = shown
        .map((entry) => {
          const date = new Date(`${entry.date}T00:00:00Z`);
          return `<li><article class="glass grid gap-x-5 gap-y-3 p-5 sm:grid-cols-[3.5rem_minmax(0,1fr)] sm:p-6" data-entry="${entry.id}">
            <svg viewBox="0 0 48 48" class="size-12 sm:size-14" aria-hidden="true">${TOPIC_ART[entry.topic]}</svg>
            <div class="min-w-0">
              <p class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-fog"><time datetime="${entry.date}" class="font-mono">${formatDate(date, "medium")}</time><span class="font-semibold text-apricot">${esc(JOURNAL.TOPICS[entry.topic])}</span><span>${esc(entry.author)}</span></p>
              <h2 class="mt-1.5 text-2xl leading-tight font-bold">${esc(entry.title)}</h2>
              <p class="mt-2 text-haze">${esc(entry.summary)}</p>
              <details class="group mt-3">
                <summary class="text-link inline-block py-1"><span class="group-open:hidden">Read the entry</span><span class="hidden group-open:inline">Close the entry</span><span class="sr-only">: ${esc(entry.title)}</span></summary>
                <div class="mt-2 space-y-3 text-haze">${entry.body.map((paragraph) => `<p>${esc(paragraph)}</p>`).join("")}</div>
              </details>
              <p class="mono-label mt-3">${esc(entry.stat)}</p>
            </div>
          </article></li>`;
        })
        .join("");
    };
    filters.forEach((button) => {
      button.addEventListener("click", () => {
        topic = button.dataset.journalFilter;
        render();
      });
    });
    render();
  }

  /* ---------- Contact form ---------- */

  function initContact() {
    const form = $("[data-contact-form]");
    if (!form) return;
    const success = $("[data-contact-success]");
    const RULES = {
      name: (value) => (value.trim().length >= 2 ? "" : "Tell us your name."),
      email: (value) =>
        EMAIL_PATTERN.test(normalizeEmail(value)) ? "" : "Enter an email address like you@yourpublication.example.",
      topic: (value) => (value ? "" : "Choose what this is about."),
      message: (value) =>
        value.trim().length >= 20 ? "" : "Write a little more, at least 20 characters, so we can help.",
    };
    const setError = (name, message) => {
      const input = form.elements[name];
      if (message) input.setAttribute("aria-invalid", "true");
      else input.removeAttribute("aria-invalid");
      $(`[data-error-for="${name}"]`, form).textContent = message;
    };
    Object.keys(RULES).forEach((name) => {
      form.elements[name].addEventListener("input", () => setError(name, ""));
      form.elements[name].addEventListener("change", () => setError(name, ""));
    });
    /*
     * To connect a real endpoint (for example Formspree), send new FormData(form) with fetch here and show the
     * success state only when the response is OK. See DOCS.md, "Forms".
     */
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const failed = Object.keys(RULES).filter((name) => {
        const message = RULES[name](form.elements[name].value);
        setError(name, message);
        return Boolean(message);
      });
      if (failed.length) {
        form.elements[failed[0]].focus();
        return;
      }
      const seed = `${normalizeEmail(form.elements.email.value)}|${form.elements.message.value}|${Date.now()}`;
      $("[data-contact-ref]").textContent = `LW-${encodeHash(hash(seed), 5)}`;
      $("[data-contact-name]").textContent = form.elements.name.value.trim().split(/\s+/)[0];
      form.hidden = true;
      success.hidden = false;
      success.focus();
    });
    $("[data-contact-again]").addEventListener("click", () => {
      form.reset();
      Object.keys(RULES).forEach((name) => setError(name, ""));
      form.hidden = false;
      success.hidden = true;
      form.elements.name.focus();
    });
  }

  /* ---------- Start ---------- */

  initDates();
  initCountdown();
  initMenu();
  initReveal();
  pendingRef();
  initWaitlist();
  refreshSpotCallouts();
  initQuickJoin();
  initSubjectTester();
  initTabs();
  initDevicePreview();
  initFlowViewer();
  initSegmentBuilder();
  initWarmupPlanner();
  initAnalyticsChart();
  initPricing();
  initMigration();
  initRoadmap();
  initJournal();
  initContact();
})();
