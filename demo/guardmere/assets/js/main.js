/* Guardmere — independent security practice. No external scripts or telemetry. */
(() => {
  "use strict";
  const TIME_ZONE = "America/Chicago";
  const DAY_RATE_PENCE = 180000;
  const PRIORITY_MULTIPLIER = 1.15;
  const STORAGE_KEYS = { assessment: "guardmere.assessment.v1", readiness: "guardmere.readiness.v1" };
  const SIZE_BANDS = {
    small: { label: "Up to 50 people", multiplier: 1 },
    growing: { label: "51–150 people", multiplier: 1.35 },
    distributed: { label: "151–500 people", multiplier: 1.7 },
  };
  const TIMINGS = { standard: "Planned engagement", priority: "Priority start" };
  const CATEGORIES = {
    systems: "Systems & access",
    operations: "Operations & resilience",
    people: "People & governance",
  };
  // Add ISO dates here for exceptional closures. An empty array enables normal business days.
  const EXTRA_CLOSURES = [];
  const CONSULTATION_DAYS = 10;
  const CONSULTATIONS_ENABLED = true;
  const SERVICES = [
    {
      id: "identity",
      name: "Identity & access",
      category: "systems",
      days: 1.5,
      strap: "Who can reach what, and why.",
      intro: "Review privileged access, onboarding and offboarding, and authentication across the systems that matter.",
      deliverables: [
        "Access map and account ownership",
        "Privileged account review",
        "Practical authentication priorities",
      ],
      evidence: ["An up-to-date user list", "A list of administrators", "Onboarding and offboarding procedures"],
      question: "Can you explain who has privileged access and when it was last reviewed?",
      next: "Start with account ownership and remove access no longer required.",
    },
    {
      id: "endpoint",
      name: "Device foundations",
      category: "systems",
      days: 1,
      strap: "Know the devices doing the work.",
      intro: "Examine device ownership, update coverage and local administration without disrupting everyday work.",
      deliverables: ["Device coverage summary", "Update and configuration gaps", "Ownership and exception register"],
      evidence: ["Device inventory", "Update reports", "Local administrator policy"],
      question: "Do you know which devices are in use and who maintains them?",
      next: "Name an owner for the device inventory and review update exceptions.",
    },
    {
      id: "cloud",
      name: "Cloud configuration",
      category: "systems",
      days: 1.5,
      strap: "A clear view above the surface.",
      intro:
        "Review configuration and responsibilities across hosted workloads, including identity, logging and exposure.",
      deliverables: ["Configuration review", "Shared responsibility map", "Prioritized change list"],
      evidence: ["Cloud account inventory", "Architecture diagrams", "Configuration exports"],
      question: "Are your cloud workloads documented with clear responsibility for security?",
      next: "Identify the owner and business purpose of each workload first.",
    },
    {
      id: "email",
      name: "Email resilience",
      category: "systems",
      days: 0.75,
      strap: "Protect the daily conversation.",
      intro: "Understand mailbox administration, domain controls and how suspicious messages reach the right people.",
      deliverables: ["Domain control review", "Mailbox access findings", "Reporting process recommendations"],
      evidence: ["Domain records", "Mailbox security settings", "Suspicious message reporting process"],
      question: "Can staff report suspicious messages through a clear, tested route?",
      next: "Make the reporting route visible and check that somebody responds.",
    },
    {
      id: "recovery",
      name: "Recovery confidence",
      category: "operations",
      days: 1.25,
      strap: "A backup is only the beginning.",
      intro:
        "Compare recovery arrangements with the time your organization can afford to be without critical services.",
      deliverables: ["Recovery dependency map", "Restore evidence review", "Exercise and improvement plan"],
      evidence: ["Backup schedules", "Recent restoration evidence", "Recovery priorities"],
      question: "Have you restored a critical service and recorded what happened?",
      next: "Choose a low-risk restoration exercise with an owner and success criteria.",
    },
    {
      id: "network",
      name: "Network boundaries",
      category: "systems",
      days: 1.25,
      strap: "Understand the routes in between.",
      intro: "Review network separation, remote access and the boundaries around sensitive services.",
      deliverables: ["Boundary diagram", "Remote access observations", "Segmentation priorities"],
      evidence: ["Network diagram", "Remote access settings", "Firewall change process"],
      question: "Are remote access routes and important network boundaries documented?",
      next: "Draw the main access routes and identify who approves changes.",
    },
    {
      id: "suppliers",
      name: "Vendor assurance",
      category: "people",
      days: 1,
      strap: "Ask useful questions of others.",
      intro:
        "Identify services you rely on and assess the evidence available for their access, continuity and incident support.",
      deliverables: ["Vendor dependency register", "Evidence request set", "Review and escalation cadence"],
      evidence: ["Critical vendor list", "Relevant contracts", "Vendor access register"],
      question: "Do critical vendors have named owners and a current review?",
      next: "Rank vendors by business dependency before requesting more paperwork.",
    },
    {
      id: "people",
      name: "People & response",
      category: "people",
      days: 0.75,
      strap: "Useful habits, shared widely.",
      intro:
        "Explore how colleagues recognize concerns, report mistakes and practice common decisions in a supportive setting.",
      deliverables: ["Role-based learning priorities", "Reporting route review", "Short scenario exercise"],
      evidence: ["Onboarding materials", "Reporting contacts", "Previous exercise notes"],
      question: "Can colleagues describe what to do when something feels wrong?",
      next: "Test the reporting route with a simple scenario and a named responder.",
    },
    {
      id: "policy",
      name: "Policy into practice",
      category: "people",
      days: 1,
      strap: "Make the written rules usable.",
      intro:
        "Check whether policies describe the way work happens and whether people can find the decisions they need.",
      deliverables: ["Policy gap summary", "Ownership and review dates", "Plain-language improvement list"],
      evidence: ["Current policy set", "Named document owners", "Exception records"],
      question: "Are policies owned, current and easy for colleagues to find?",
      next: "Retire superseded documents and give each remaining policy an owner.",
    },
    {
      id: "web",
      name: "Web service review",
      category: "systems",
      days: 1.5,
      strap: "Examine what you put online.",
      intro:
        "An authorized review of public service configuration and application controls, scoped to your business context.",
      deliverables: ["Agreed testing boundary", "Evidence-led findings", "Remediation verification plan"],
      evidence: ["Service inventory", "Written testing authority", "Change and deployment process"],
      question: "Do you have an owner and an agreed review boundary for public services?",
      next: "List public services and confirm ownership before authorizing any testing.",
    },
    {
      id: "monitoring",
      name: "Monitoring & triage",
      category: "operations",
      days: 1.25,
      strap: "Turn signals into decisions.",
      intro: "Examine which events are visible, who reviews them and how meaningful concerns are escalated.",
      deliverables: ["Logging coverage map", "Triage responsibilities", "Alert improvement priorities"],
      evidence: ["Logging inventory", "Escalation contacts", "Recent alert records"],
      question: "Are important alerts reviewed by a named person or team?",
      next: "Choose a small set of important signals and agree on a realistic review cadence.",
    },
    {
      id: "incident",
      name: "Incident preparation",
      category: "operations",
      days: 1,
      strap: "Practice before the pressure.",
      intro:
        "Build a practical response structure with decision owners, communication routes and a manageable exercise.",
      deliverables: ["Response role map", "First-hour checklist", "Tabletop exercise findings"],
      evidence: ["Response plan", "Emergency contact list", "Business service priorities"],
      question: "Have you rehearsed a security incident with decision-makers?",
      next: "Run a short tabletop and record decisions, gaps and the next exercise date.",
    },
  ];
  const CASES = [
    {
      id: "professional-access",
      sector: "professional",
      title: "One view of access across a growing practice",
      service: "identity",
      scale: "85 people · three offices",
      problem:
        "A professional practice had grown through several small teams. Access decisions lived in separate spreadsheets and nobody could explain the full picture.",
      work: [
        "Mapped identity systems and interviewed each service owner.",
        "Compared the current account list with HR records.",
        "Agreed on a repeatable review with a clear exception owner.",
      ],
      evidence: "The practice left with a reconciled access register and a recorded review of privileged accounts.",
      next: "The internal operations lead now owns a quarterly access review and a checklist for role changes.",
    },
    {
      id: "operations-recovery",
      sector: "operations",
      title: "A recovery plan grounded in a real restore",
      service: "recovery",
      scale: "60 people · dispatch operations",
      problem:
        "Backup reports were green, but there was no recent evidence that the critical dispatch service could be recovered in a useful time.",
      work: [
        "Mapped the dependencies behind the service.",
        "Observed an isolated restore with the technology provider.",
        "Recorded the steps, elapsed time and missing decisions.",
      ],
      evidence: "A witnessed restoration record replaced assumptions about recovery time.",
      next: "The team scheduled a repeat exercise and agreed which dependencies needed a second recovery route.",
    },
    {
      id: "digital-cloud",
      sector: "digital",
      title: "Making cloud ownership visible",
      service: "cloud",
      scale: "120 people · four workloads",
      problem:
        "A digital service team could explain application delivery well, but responsibility for cloud configuration crossed several teams.",
      work: [
        "Reviewed workload ownership and administration routes.",
        "Examined configuration evidence against the agreed scope.",
        "Grouped findings by owner and business consequence.",
      ],
      evidence: "A responsibility map and a prioritized configuration register gave the teams a shared working view.",
      next: "Engineering leads review exceptions alongside normal delivery planning.",
    },
    {
      id: "professional-suppliers",
      sector: "professional",
      title: "Vendor assurance without a wall of paperwork",
      service: "suppliers",
      scale: "40 people · outsourced IT",
      problem:
        "A small consulting firm had inherited lengthy questionnaires that did not reflect which vendors were essential to client work.",
      work: [
        "Ranked vendors by operational dependency and data access.",
        "Matched evidence requests to actual exposure.",
        "Agreed on a short renewal review and escalation route.",
      ],
      evidence: "Critical vendors each received a named owner and a proportionate review record.",
      next: "The practice reviews high-dependency vendors before renewal and after a material service change.",
    },
    {
      id: "operations-incident",
      sector: "operations",
      title: "A first-hour plan the whole team could use",
      service: "incident",
      scale: "150 people · distributed sites",
      problem:
        "An incident document existed, but site managers were unsure who could pause operations or contact external support.",
      work: [
        "Mapped the decisions needed in the first hour.",
        "Ran a facilitated scenario with operational leaders.",
        "Rewrote the contact and decision pages after the exercise.",
      ],
      evidence: "The exercise produced named decision owners and an accessible contact tree.",
      next: "A short follow-up exercise will check that the revised escalation route works outside normal hours.",
    },
    {
      id: "digital-monitoring",
      sector: "digital",
      title: "Fewer unattended alerts, clearer decisions",
      service: "monitoring",
      scale: "70 people · online services",
      problem: "Alerts arrived in several inboxes, with no common definition of a signal that required action.",
      work: [
        "Mapped event sources and existing response expectations.",
        "Reviewed a small selection of historical alerts.",
        "Agreed on severity criteria and an escalation handoff.",
      ],
      evidence: "An owner and expected response were recorded for each retained alert type.",
      next: "The team measures whether alerts lead to useful action before extending coverage.",
    },
  ];
  const RESOURCES = [
    {
      id: "access-review",
      title: "A useful access review",
      topic: "foundations",
      service: "identity",
      intro: "A short review should lead to clear decisions about access, rather than another list of accounts.",
      steps: [
        "Start with the systems that hold important data.",
        "Ask each service owner to explain privileged roles.",
        "Record removals, exceptions and the next review date.",
      ],
      caution: "A spreadsheet alone does not prove that permissions have changed.",
    },
    {
      id: "device-register",
      title: "Build a device register you can maintain",
      topic: "foundations",
      service: "endpoint",
      intro: "A complete-enough inventory helps you put responsibility in the right place.",
      steps: [
        "Agree on what counts as a managed device.",
        "Record owner, purpose and update responsibility.",
        "Compare the register with a second reliable source.",
      ],
      caution: "Do not publish serial numbers or user details in a public register.",
    },
    {
      id: "cloud-responsibility",
      title: "The cloud responsibility conversation",
      topic: "governance",
      service: "cloud",
      intro: "Hosted infrastructure still needs people who own decisions.",
      steps: [
        "List services and the teams using them.",
        "Agree on who owns access, updates and backup.",
        "Document how responsibility changes at handoff.",
      ],
      caution: "Provider assurances do not replace a review of your own configuration.",
    },
    {
      id: "suspicious-email",
      title: "Make suspicious email easy to report",
      topic: "foundations",
      service: "email",
      intro: "A clear route is useful only when somebody watches the other end.",
      steps: [
        "Choose one obvious reporting route.",
        "Explain what colleagues should include.",
        "Acknowledge reports and share a short lesson afterwards.",
      ],
      caution: "Ask people to report concerns without opening suspicious attachments.",
    },
    {
      id: "restore-evidence",
      title: "What good restore evidence looks like",
      topic: "resilience",
      service: "recovery",
      intro: "The best record explains what was restored, what was needed and what happened.",
      steps: [
        "Set a safe and authorized exercise boundary.",
        "Record dependencies and elapsed time.",
        "Give each gap an owner and a due date.",
      ],
      caution: "Keep tests isolated and protect live data from accidental overwrite.",
    },
    {
      id: "network-map",
      title: "Draw the network before changing it",
      topic: "foundations",
      service: "network",
      intro: "A simple diagram can reveal unanswered questions before an expensive project begins.",
      steps: [
        "Mark offices, hosted services and remote access.",
        "Label the boundaries around important services.",
        "Review the picture with the people who maintain it.",
      ],
      caution: "Treat detailed network diagrams as sensitive operational information.",
    },
    {
      id: "supplier-review",
      title: "A proportionate vendor review",
      topic: "governance",
      service: "suppliers",
      intro: "Focus the questions on the service you depend on.",
      steps: [
        "Rank dependencies and access to information.",
        "Request evidence that relates to those dependencies.",
        "Record a renewal date and escalation contact.",
      ],
      caution: "A completed questionnaire is evidence to consider, not a promise of security.",
    },
    {
      id: "reporting-culture",
      title: "Practice a supportive reporting response",
      topic: "governance",
      service: "people",
      intro: "How the first report is handled influences whether colleagues report the next concern.",
      steps: [
        "Thank the person for raising the concern.",
        "Explain the immediate next step.",
        "Share learning without naming individuals.",
      ],
      caution: "Keep personal information out of general training records.",
    },
    {
      id: "policy-ownership",
      title: "Give every policy an owner",
      topic: "governance",
      service: "policy",
      intro: "Useful documents have a decision-maker, an audience and a review trigger.",
      steps: [
        "Remove duplicate and superseded copies.",
        "Name an owner and record the last review.",
        "Check the wording against an everyday scenario.",
      ],
      caution: "Legal and regulatory obligations may need advice from an attorney.",
    },
    {
      id: "testing-authority",
      title: "Agree on the boundary before security testing",
      topic: "foundations",
      service: "web",
      intro: "Clear written authority protects people, services and the quality of the review.",
      steps: [
        "List systems, owners and permitted techniques.",
        "Agree on stop conditions and contact routes.",
        "Record how findings and data will be handled.",
      ],
      caution: "Do not test third-party services without their written permission.",
    },
    {
      id: "alert-triage",
      title: "Ask three questions of each alert",
      topic: "resilience",
      service: "monitoring",
      intro: "Coverage is valuable when an event leads to an informed decision.",
      steps: [
        "What behavior does this signal describe?",
        "Who is expected to review it and when?",
        "What action can that person take?",
      ],
      caution: "Avoid collecting more personal data than the review requires.",
    },
    {
      id: "tabletop",
      title: "Run a focused incident tabletop",
      topic: "resilience",
      service: "incident",
      intro: "One hour around a realistic scenario can uncover decisions a document misses.",
      steps: [
        "Choose a scenario and a small decision-making group.",
        "Pause at key moments and ask who decides.",
        "Record a short, owned improvement list.",
      ],
      caution: "An exercise helps identify gaps; it cannot guarantee a future response.",
    },
  ];
  const TEAM = [
    {
      name: "Aveline Tolbert",
      role: "Principal consultant",
      image: "aveline",
      copy: "Aveline connects technical findings with business decisions. She leads assessments, defines practical priorities and keeps the report useful to the people who will act on it.",
      focus: "Assessment strategy · governance · board conversations",
    },
    {
      name: "Garrett Blevins",
      role: "Technical assessment lead",
      image: "godric",
      copy: "Garrett examines the configuration and evidence behind everyday services. His work covers identity, cloud foundations and the boundaries around public-facing systems.",
      focus: "Identity · cloud configuration · service reviews",
    },
    {
      name: "Nesta Hollingworth",
      role: "Resilience & readiness consultant",
      image: "nesta",
      copy: "Nesta helps teams turn a plan into a rehearsed response. She leads recovery reviews, evidence preparation and incident exercises with operational decision-makers.",
      focus: "Recovery · readiness · incident exercises",
    },
  ];
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const has = (object, key) => typeof key === "string" && Object.prototype.hasOwnProperty.call(object, key);
  const SERVICE_MAP = Object.fromEntries(SERVICES.map((service) => [service.id, service]));
  const CASE_MAP = Object.fromEntries(CASES.map((item) => [item.id, item]));
  const escape = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character],
    );
  const money = (pence) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: pence % 100 ? 2 : 0,
      maximumFractionDigits: 2,
    }).format(pence / 100);
  const count = (n, singular, plural = singular + "s") => `${n} ${n === 1 ? singular : plural}`;
  const cleanText = (value, limit = 240) =>
    typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, limit) : "";
  function clamp(value, min, max, fallback) {
    if (typeof value !== "string" && typeof value !== "number") return fallback;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? Math.min(max, Math.max(min, Math.trunc(numeric))) : fallback;
  }
  const memory = new Map();
  const safeStorage = {
    get(key) {
      if (memory.has(key)) return memory.get(key);
      try {
        const value = localStorage.getItem(key);
        memory.set(key, value);
        return value;
      } catch {
        return null;
      }
    },
    set(key, value) {
      memory.set(key, value);
      try {
        localStorage.setItem(key, value);
      } catch {
        /* Keep same-page read-after-write working in private/opaque contexts. */
      }
    },
    remove(key) {
      memory.set(key, null);
      try {
        localStorage.removeItem(key);
      } catch {
        /* Memory remains authoritative. */
      }
    },
  };
  function readJSON(key, normalise, fallback) {
    const raw = safeStorage.get(key);
    if (raw === null) return fallback();
    try {
      const result = normalise(JSON.parse(raw));
      if (!result) {
        safeStorage.remove(key);
        return fallback();
      }
      safeStorage.set(key, JSON.stringify(result));
      return result;
    } catch {
      safeStorage.remove(key);
      return fallback();
    }
  }
  const defaultPlan = () => ({
    size: "small",
    locations: 1,
    cloud: 2,
    timing: "standard",
    services: ["identity", "email", "recovery"],
  });
  function normalisePlan(value) {
    if (!value || typeof value !== "object" || Array.isArray(value) || !Array.isArray(value.services)) return null;
    return {
      size: has(SIZE_BANDS, value.size) ? value.size : "small",
      locations: clamp(value.locations, 1, 5, 1),
      cloud: clamp(value.cloud, 0, 12, 2),
      timing: has(TIMINGS, value.timing) ? value.timing : "standard",
      services: [...new Set(value.services.filter((id) => has(SERVICE_MAP, id)))].slice(0, SERVICES.length),
    };
  }
  const loadPlan = () => readJSON(STORAGE_KEYS.assessment, normalisePlan, defaultPlan);
  function normaliseReadiness(value) {
    if (!value || typeof value !== "object" || Array.isArray(value) || !Array.isArray(value.done)) return null;
    const notes = {};
    if (value.notes && typeof value.notes === "object" && !Array.isArray(value.notes)) {
      SERVICES.forEach((service) => {
        if (has(value.notes, service.id)) notes[service.id] = cleanText(value.notes[service.id]);
      });
    }
    return { done: [...new Set(value.done.filter((id) => has(SERVICE_MAP, id)))], notes };
  }
  const emptyReadiness = () => ({ done: [], notes: {} });
  const loadReadiness = () => readJSON(STORAGE_KEYS.readiness, normaliseReadiness, emptyReadiness);
  let toastTimer;
  function announce(message) {
    const toast = $("[data-toast]");
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.hidden = true;
    }, 5000);
  }
  function planSummary(plan) {
    return `${count(plan.services.length, "area")} · ${SIZE_BANDS[plan.size].label} · ${count(plan.locations, "location")} · ${count(plan.cloud, "cloud workload")} · ${TIMINGS[plan.timing]}`;
  }
  function estimate(plan) {
    if (!plan.services.length) return { base: 0, coordination: 0, complexity: 0, days: 0, fees: 0 };
    const base = plan.services.reduce((sum, id) => sum + SERVICE_MAP[id].days, 0) * SIZE_BANDS[plan.size].multiplier;
    const coordination = 0.5;
    const complexity = (plan.locations - 1) * 0.25 + plan.cloud * 0.25;
    const days = Math.ceil((base + coordination + complexity) * 4) / 4;
    const fees = Math.round(days * DAY_RATE_PENCE * (plan.timing === "priority" ? PRIORITY_MULTIPLIER : 1));
    return { base, coordination, complexity, days, fees };
  }
  function scopeButton(id, selected, extra = "btn-outline text-xs") {
    return `<button type="button" class="${extra} scope-toggle" data-add-scope="${id}" aria-pressed="${selected}">Include <span class="sr-only">${escape(SERVICE_MAP[id].name.toLowerCase())} </span>in scope</button>`;
  }
  function toggleScope(id) {
    if (!has(SERVICE_MAP, id)) return;
    const plan = loadPlan();
    const adding = !plan.services.includes(id);
    plan.services = adding ? [...plan.services, id] : plan.services.filter((item) => item !== id);
    safeStorage.set(STORAGE_KEYS.assessment, JSON.stringify(plan));
    const saved = loadPlan();
    const inScope = saved.services.includes(id);
    const target = $("[data-scope-count]");
    if (target) target.textContent = String(saved.services.length);
    $$("[data-add-scope]")
      .filter((button) => button.dataset.addScope === id)
      .forEach((button) => button.setAttribute("aria-pressed", String(inScope)));
    announce(
      `${SERVICE_MAP[id].name} ${inScope ? "is in" : "has been removed from"} your saved scope. ${count(saved.services.length, "area")} selected.`,
    );
  }
  function serviceCard(service, compact = false) {
    const selected = loadPlan().services.includes(service.id);
    const heading = compact ? "h3" : "h2";
    return `<article class="service-card"><img src="assets/img/${service.id}.svg" width="600" height="420" class="w-full border border-rule bg-wash" alt="" loading="lazy"><p class="eyebrow mt-5 text-oxblood">${escape(CATEGORIES[service.category])}</p><${heading} class="mt-3 font-display text-2xl">${escape(service.name)}</${heading}><p class="mt-3 leading-relaxed text-muted">${escape(service.intro)}</p><div class="mt-5 flex flex-wrap items-center gap-4"><button type="button" class="text-link text-sm" data-open-service="${service.id}">Explore ${escape(service.name.toLowerCase())}</button>${compact ? "" : scopeButton(service.id, selected)}</div></article>`;
  }
  function setupServices() {
    const home = $("[data-home-services]");
    if (home)
      home.innerHTML = ["identity", "recovery", "incident"].map((id) => serviceCard(SERVICE_MAP[id], true)).join("");
    const grid = $("[data-service-grid]");
    if (!grid) return;
    const form = $("[data-service-filter]");
    $("[data-scope-count]").textContent = String(loadPlan().services.length);
    function render() {
      const query = form.elements.search.value.trim().toLowerCase();
      const category = form.elements.category.value;
      const matches = SERVICES.filter(
        (item) =>
          (category === "all" || item.category === category) &&
          `${item.name} ${item.intro} ${item.deliverables.join(" ")}`.toLowerCase().includes(query),
      );
      grid.innerHTML = matches.map((item) => serviceCard(item)).join("");
      $("[data-service-count]").textContent = `${count(matches.length, "service")} in view`;
      $("[data-service-empty]").hidden = matches.length > 0;
    }
    form.addEventListener("input", render);
    form.addEventListener("submit", (event) => event.preventDefault());
    $("[data-reset-service-filter]").addEventListener("click", () => {
      form.reset();
      render();
      form.elements.search.focus();
    });
    render();
  }
  function setupDialogs() {
    let opener;
    const serviceDialog = $("[data-service-dialog]");
    const caseDialog = $("[data-case-dialog]");
    const close = (dialog) => {
      dialog.close();
      if (opener?.isConnected) opener.focus();
    };
    document.addEventListener("click", (event) => {
      const openService = event.target.closest("[data-open-service]");
      const add = event.target.closest("[data-add-scope]");
      const openCase = event.target.closest("[data-open-case]");
      if (add) toggleScope(add.dataset.addScope);
      if (openService && has(SERVICE_MAP, openService.dataset.openService)) {
        const item = SERVICE_MAP[openService.dataset.openService];
        opener = openService;
        $("[data-service-detail]").innerHTML =
          `<p class="eyebrow text-oxblood">${escape(CATEGORIES[item.category])}</p><h2 id="service-dialog-title" class="mt-4 font-display text-3xl sm:text-4xl">${escape(item.name)}</h2><p class="mt-5 text-lg leading-relaxed">${escape(item.intro)}</p><div class="mt-7 grid gap-7 sm:grid-cols-2"><section><h3 class="font-display text-xl">What you receive</h3><ul class="mt-4 list-disc space-y-3 pl-5 text-muted">${item.deliverables.map((text) => `<li>${escape(text)}</li>`).join("")}</ul></section><section><h3 class="font-display text-xl">Evidence to gather</h3><ul class="mt-4 list-disc space-y-3 pl-5 text-muted">${item.evidence.map((text) => `<li>${escape(text)}</li>`).join("")}</ul></section></div><p class="mt-7 border-t border-rule pt-5 leading-relaxed text-muted">${escape(item.next)}</p>${scopeButton(item.id, loadPlan().services.includes(item.id), "btn-outline mt-6")}`;
        serviceDialog.showModal();
      }
      if (openCase && has(CASE_MAP, openCase.dataset.openCase)) {
        const item = CASE_MAP[openCase.dataset.openCase];
        opener = openCase;
        $("[data-case-detail]").innerHTML =
          `<p class="eyebrow text-oxblood">${escape(item.scale)}</p><h2 id="case-dialog-title" class="mt-4 font-display text-3xl">${escape(item.title)}</h2><h3 class="mt-7 font-display text-xl">The starting point</h3><p class="mt-3 leading-relaxed text-muted">${escape(item.problem)}</p><h3 class="mt-6 font-display text-xl">The work</h3><ol class="mt-3 list-decimal space-y-3 pl-5 text-muted">${item.work.map((text) => `<li>${escape(text)}</li>`).join("")}</ol><h3 class="mt-6 font-display text-xl">The evidence</h3><p class="mt-3 leading-relaxed text-muted">${escape(item.evidence)}</p><h3 class="mt-6 font-display text-xl">The next step</h3><p class="mt-3 leading-relaxed text-muted">${escape(item.next)}</p><p class="mt-6 text-xs text-muted">Every engagement has its own scope. These accounts describe an approach, rather than a promised outcome.</p>`;
        caseDialog.showModal();
      }
    });
    $("[data-close-service]").addEventListener("click", () => close(serviceDialog));
    $("[data-close-case]").addEventListener("click", () => close(caseDialog));
    [serviceDialog, caseDialog].forEach((dialog) => {
      dialog.addEventListener("cancel", (event) => {
        event.preventDefault();
        close(dialog);
      });
      dialog.addEventListener("click", (event) => {
        if (event.target === dialog) {
          const rect = dialog.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            close(dialog);
        }
      });
    });
  }
  function setupAssessment() {
    const form = $("[data-assessment-form]");
    if (!form) return;
    let plan = loadPlan();
    const parameter = new URLSearchParams(location.search).get("service");
    if (has(SERVICE_MAP, parameter) && !plan.services.includes(parameter)) plan.services.push(parameter);
    $("[data-scope-options]").innerHTML = SERVICES.map(
      (item) =>
        `<label class="flex items-start gap-3 border border-rule bg-card p-4 text-sm"><input class="control-check scroll-mb-28" type="checkbox" name="services" value="${item.id}"><span><strong class="block">${escape(item.name)}</strong><span class="mt-1 block text-muted">${item.days} base consultant days</span></span></label>`,
    ).join("");
    function fill() {
      ["size", "locations", "cloud", "timing"].forEach((key) => {
        form.elements[key].value = plan[key];
      });
      $$('[name="services"]', form).forEach((input) => {
        input.checked = plan.services.includes(input.value);
      });
    }
    function read() {
      return normalisePlan({
        size: form.elements.size.value,
        locations: form.elements.locations.value,
        cloud: form.elements.cloud.value,
        timing: form.elements.timing.value,
        services: $$('[name="services"]:checked', form).map((input) => input.value),
      });
    }
    function renderSaved() {
      const raw = safeStorage.get(STORAGE_KEYS.assessment);
      $("[data-saved-assessment]").hidden = raw === null;
      if (raw !== null) $("[data-saved-scope]").textContent = planSummary(loadPlan());
    }
    function update() {
      plan = read();
      const result = estimate(plan);
      $("[data-assessment-breakdown]").innerHTML = [
        ["Selected areas", count(plan.services.length, "area")],
        ["Team-size-adjusted review", `${result.base.toFixed(2)} days`],
        ["Coordination", `${result.coordination} days`],
        ["Location & cloud complexity", `${result.complexity} days`],
        ["Daily rate", money(DAY_RATE_PENCE)],
        ["Timing adjustment", plan.timing === "priority" ? "+15%, subject to availability" : "Standard rate"],
      ]
        .map(
          ([label, value]) =>
            `<div class="flex justify-between gap-5 border-b border-rule pb-3"><dt class="text-muted">${label}</dt><dd class="text-right font-semibold">${value}</dd></div>`,
        )
        .join("");
      $("[data-assessment-total]").textContent = money(result.fees);
      $("[data-sticky-total]").textContent = money(result.fees);
      $("[data-sticky-summary]").textContent = plan.services.length
        ? `${count(plan.services.length, "area")} · ${result.days} consultant days`
        : "Check an area to start your estimate";
      $("[data-assessment-days]").textContent = `${result.days} consultant days, rounded up to a quarter day.`;
      const missing = ["identity", "email", "recovery"].filter((id) => !plan.services.includes(id));
      $("[data-assessment-advice]").textContent = !plan.services.length
        ? "Choose at least one area to build a useful assessment."
        : missing.length
          ? `Consider adding ${missing.map((id) => SERVICE_MAP[id].name.toLowerCase()).join(", ")} as a foundation. Begin with ownership and access, then examine recovery and response.`
          : "Your scope covers access, email and recovery foundations. Start by mapping ownership and dependencies, then examine the evidence and agree on the next practical changes.";
      if (plan.services.length) {
        const coordination = [];
        if (plan.locations > 1) coordination.push(`Name a local contact at each of your ${plan.locations} locations.`);
        if (plan.cloud >= 4)
          coordination.push(`Map ownership across your ${plan.cloud} cloud workloads before configuration review.`);
        if (plan.size !== "small") coordination.push("Include team leads in the evidence and decision workshops.");
        if (plan.timing === "priority")
          coordination.push("Confirm evidence and stakeholder availability before requesting a priority start.");
        if (coordination.length) $("[data-assessment-advice]").textContent += " " + coordination.join(" ");
      }
    }
    form.addEventListener("input", update);
    form.addEventListener("change", () => {
      ["locations", "cloud"].forEach((key) => {
        form.elements[key].value = plan[key];
      });
      update();
    });
    form.addEventListener("submit", (event) => event.preventDefault());
    $("[data-save-assessment]").addEventListener("click", () => {
      update();
      safeStorage.set(STORAGE_KEYS.assessment, JSON.stringify(plan));
      renderSaved();
      $("[data-assessment-status]").textContent = `Scope saved. ${planSummary(loadPlan())}.`;
    });
    $("[data-reset-assessment]").addEventListener("click", () => {
      plan = defaultPlan();
      fill();
      update();
      $("[data-assessment-status]").textContent = "Fresh scope loaded. Save it to replace your saved starting point.";
      form.elements.size.focus();
    });
    $("[data-delete-assessment]").addEventListener("click", () => {
      safeStorage.remove(STORAGE_KEYS.assessment);
      renderSaved();
      $("[data-assessment-status]").textContent =
        "Saved scope removed. Your current estimate is still available above.";
      $("[data-save-assessment]").focus();
    });
    fill();
    update();
    renderSaved();
  }
  function setupReadiness() {
    const list = $("[data-readiness-list]");
    if (!list) return;
    let state = loadReadiness();
    const form = $("[data-readiness-filter]");
    function save() {
      safeStorage.set(STORAGE_KEYS.readiness, JSON.stringify(state));
      state = loadReadiness();
    }
    function progress() {
      const percentage = Math.round((state.done.length / SERVICES.length) * 100);
      $("[data-readiness-progress]").textContent = `${state.done.length} / ${SERVICES.length}`;
      $("[data-readiness-meter]").setAttribute("aria-valuenow", String(percentage));
      $("[data-readiness-bar]").style.width = `${percentage}%`;
      const next = SERVICES.find((item) => !state.done.includes(item.id));
      $("[data-readiness-priority]").textContent = next
        ? `Next useful question: ${next.question}`
        : "All twelve areas have evidence marked ready. Revisit after a change, an exercise or your next review date.";
    }
    function render() {
      const query = form.elements.search.value.trim().toLowerCase();
      const category = form.elements.category.value;
      const status = form.elements.state.value;
      const matches = SERVICES.filter(
        (item) =>
          (category === "all" || item.category === category) &&
          (status === "all" || (status === "ready") === state.done.includes(item.id)) &&
          `${item.name} ${item.question} ${item.evidence.join(" ")}`.toLowerCase().includes(query),
      );
      list.innerHTML = matches
        .map(
          (item) =>
            `<article class="border border-rule bg-card p-5 sm:p-7" data-control="${item.id}"><div class="flex items-start gap-4"><input id="ready-${item.id}" type="checkbox" class="control-check" data-ready="${item.id}" ${state.done.includes(item.id) ? "checked" : ""}><div class="min-w-0 flex-1"><p class="eyebrow text-oxblood">${escape(CATEGORIES[item.category])}</p><h3 class="mt-2 font-display text-xl"><label for="ready-${item.id}">${escape(item.name)}</label></h3><p class="mt-3 leading-relaxed">${escape(item.question)}</p><p class="mt-3 text-sm leading-relaxed text-muted">Gather: ${item.evidence.map(escape).join("; ")}.</p><label class="label mt-5" for="note-${item.id}">Evidence note for ${escape(item.name.toLowerCase())}</label><textarea id="note-${item.id}" data-note="${item.id}" maxlength="240" rows="2" class="field" placeholder="Record an owner or a non-sensitive evidence location">${escape(state.notes[item.id] || "")}</textarea><p class="mt-2 text-xs text-muted">Keep passwords, personal information and confidential evidence elsewhere.</p></div></div></article>`,
        )
        .join("");
      $("[data-readiness-count]").textContent = `${count(matches.length, "area")} in view`;
      $("[data-readiness-empty]").hidden = matches.length > 0;
      progress();
    }
    list.addEventListener("change", (event) => {
      const id = event.target.dataset.ready;
      if (!has(SERVICE_MAP, id)) return;
      state.done = event.target.checked ? [...new Set([...state.done, id])] : state.done.filter((key) => key !== id);
      save();
      progress();
      announce(`${SERVICE_MAP[id].name} marked ${event.target.checked ? "ready" : "still to gather"}.`);
      if (form.elements.state.value !== "all") {
        render();
        form.elements.state.focus();
      }
    });
    list.addEventListener("input", (event) => {
      const id = event.target.dataset.note;
      if (has(SERVICE_MAP, id)) {
        state.notes[id] = cleanText(event.target.value);
        save();
      }
    });
    form.addEventListener("input", render);
    form.addEventListener("submit", (event) => event.preventDefault());
    const panel = $("[data-reset-readiness-panel]");
    $("[data-reset-readiness]").addEventListener("click", () => {
      panel.hidden = false;
      $("[data-cancel-readiness-reset]").focus();
    });
    $("[data-cancel-readiness-reset]").addEventListener("click", () => {
      panel.hidden = true;
      $("[data-reset-readiness]").focus();
    });
    $("[data-confirm-readiness-reset]").addEventListener("click", () => {
      state = emptyReadiness();
      safeStorage.remove(STORAGE_KEYS.readiness);
      panel.hidden = true;
      render();
      $("[data-reset-readiness]").focus();
      announce("All readiness checkmarks and evidence notes cleared.");
    });
    render();
  }
  function setupCases() {
    const grid = $("[data-case-grid]");
    if (!grid) return;
    const form = $("[data-case-filter]");
    function render() {
      const query = form.elements.search.value.trim().toLowerCase();
      const sector = form.elements.sector.value;
      const matches = CASES.filter(
        (item) =>
          (sector === "all" || item.sector === sector) &&
          `${item.title} ${item.problem} ${item.evidence}`.toLowerCase().includes(query),
      );
      grid.innerHTML = matches
        .map(
          (item, index) =>
            `<article class="border border-rule bg-card"><img src="assets/img/case-${item.id}.svg" width="600" height="420" class="w-full" alt="" loading="lazy"><div class="p-6"><p class="eyebrow text-oxblood">${escape(item.scale)}</p><h2 class="mt-4 font-display text-2xl">${escape(item.title)}</h2><p class="mt-4 leading-relaxed text-muted">${escape(item.problem)}</p><button type="button" data-open-case="${item.id}" class="text-link mt-5 text-sm">Read the engagement: ${escape(item.title.toLowerCase())}</button></div></article>`,
        )
        .join("");
      $("[data-case-count]").textContent = `${count(matches.length, "engagement")} in view`;
      $("[data-case-empty]").hidden = matches.length > 0;
    }
    form.addEventListener("input", render);
    form.addEventListener("submit", (event) => event.preventDefault());
    render();
  }
  function setupResources() {
    const grid = $("[data-resource-grid]");
    if (!grid) return;
    const form = $("[data-resource-filter]");
    function render() {
      const query = form.elements.search.value.trim().toLowerCase();
      const topic = form.elements.topic.value;
      const matches = RESOURCES.filter(
        (item) =>
          (topic === "all" || item.topic === topic) &&
          `${item.title} ${item.intro} ${item.steps.join(" ")}`.toLowerCase().includes(query),
      );
      grid.innerHTML = matches
        .map(
          (item) =>
            `<article class="border-t border-rule pt-5"><div class="flex items-center gap-4"><img src="assets/img/note-${item.id}.svg" width="160" height="160" class="w-20 shrink-0 border border-rule" alt="" loading="lazy"><p class="eyebrow text-oxblood">${escape(item.topic)}<br><span class="mt-2 block font-normal normal-case tracking-normal text-muted">3 minute field note</span></p></div><h2 class="mt-5 font-display text-2xl">${escape(item.title)}</h2><p class="mt-4 leading-relaxed text-muted">${escape(item.intro)}</p><details class="mt-5 border border-rule bg-card p-4"><summary class="text-sm font-semibold">Practical steps: ${escape(item.title.toLowerCase())}</summary><ol class="mt-5 list-decimal space-y-3 pl-5 text-sm leading-relaxed">${item.steps.map((step) => `<li>${escape(step)}</li>`).join("")}</ol><p class="mt-5 border-t border-rule pt-4 text-sm leading-relaxed text-muted">${escape(item.caution)}</p></details></article>`,
        )
        .join("");
      $("[data-resource-count]").textContent = `${count(matches.length, "field note")} in view`;
      $("[data-resource-empty]").hidden = matches.length > 0;
    }
    form.addEventListener("input", render);
    form.addEventListener("submit", (event) => event.preventDefault());
    render();
  }
  function setupTeam() {
    const grid = $("[data-team-grid]");
    if (grid)
      grid.innerHTML = TEAM.map(
        (person) =>
          `<article class="min-w-0"><img src="assets/img/${person.image}.svg" width="560" height="440" class="w-full border border-rule" alt="Illustrated portrait of ${escape(person.name)}" loading="lazy"><p class="eyebrow mt-6 text-oxblood">${escape(person.role)}</p><h3 class="mt-3 font-display text-2xl">${escape(person.name)}</h3><p class="mt-4 leading-relaxed text-muted">${escape(person.copy)}</p><p class="mt-5 border-t border-rule pt-4 text-sm font-semibold">${escape(person.focus)}</p></article>`,
      ).join("");
  }
  function londonToday() {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return new Date(Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day), 12));
  }
  const dateKey = (date) => date.toISOString().slice(0, 10);
  const addDays = (date, amount) => new Date(date.getTime() + amount * 86400000);
  function monday(year, month, last = false) {
    const date = new Date(Date.UTC(year, month, last ? 0 : 1, 12));
    return addDays(date, last ? -((date.getUTCDay() + 6) % 7) : (8 - date.getUTCDay()) % 7);
  }
  function nthWeekday(year, month, weekday, nth) {
    const first = new Date(Date.UTC(year, month, 1, 12));
    return addDays(first, ((weekday - first.getUTCDay() + 7) % 7) + (nth - 1) * 7);
  }
  // A fixed-date holiday on a Saturday is observed on Friday, and on a Sunday on Monday.
  function observed(date) {
    const day = date.getUTCDay();
    return day === 6 ? addDays(date, -1) : day === 0 ? addDays(date, 1) : date;
  }
  // US federal holidays, worked out by rule for any year.
  function bankHolidays(year) {
    const days = new Set();
    const add = (date) => days.add(dateKey(date));
    const fixed = (y, month, day) => add(observed(new Date(Date.UTC(y, month, day, 12))));
    fixed(year, 0, 1); // New Year's Day
    fixed(year + 1, 0, 1); // Next New Year's Day can be observed on December 31 of this year.
    add(nthWeekday(year, 0, 1, 3)); // Martin Luther King Jr. Day
    add(nthWeekday(year, 1, 1, 3)); // Washington's Birthday
    add(monday(year, 5, true)); // Memorial Day, the last Monday in May
    fixed(year, 5, 19); // Juneteenth
    fixed(year, 6, 4); // Independence Day
    add(monday(year, 8)); // Labor Day, the first Monday in September
    add(nthWeekday(year, 9, 1, 2)); // Columbus Day
    fixed(year, 10, 11); // Veterans Day
    add(nthWeekday(year, 10, 4, 4)); // Thanksgiving
    fixed(year, 11, 25); // Christmas Day
    EXTRA_CLOSURES.filter((value) => /^\d{4}-\d{2}-\d{2}$/.test(value)).forEach((value) => days.add(value));
    return days;
  }
  function consultationDates() {
    if (!CONSULTATIONS_ENABLED) return [];
    const result = [];
    let date = addDays(londonToday(), 1);
    for (let scanned = 0; result.length < CONSULTATION_DAYS && scanned < 370; scanned++, date = addDays(date, 1)) {
      if (![0, 6].includes(date.getUTCDay()) && !bankHolidays(date.getUTCFullYear()).has(dateKey(date)))
        result.push(date);
    }
    return result;
  }
  const formatDate = (date) =>
    new Intl.DateTimeFormat("en-US", {
      timeZone: TIME_ZONE,
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  function setupContact() {
    const next = $("[data-next-consultation]");
    if (next)
      next.textContent = consultationDates().length
        ? formatDate(consultationDates()[0])
        : "Please contact the practice";
    const form = $("[data-contact-form]");
    if (!form) return;
    const TOPICS = { assessment: true, readiness: true, review: true, conversation: true };
    const topic = new URLSearchParams(location.search).get("topic");
    if (has(TOPICS, topic)) form.elements.topic.value = topic;
    const dates = consultationDates();
    const select = $("[data-consultation-date]");
    select.innerHTML =
      '<option value="">Choose a business day</option>' +
      dates.map((date) => `<option value="${dateKey(date)}">${formatDate(date)}</option>`).join("");
    const plan = loadPlan();
    $("[data-contact-scope]").textContent =
      safeStorage.get(STORAGE_KEYS.assessment) !== null
        ? `Your saved assessment: ${planSummary(plan)}. Planning estimate ${money(estimate(plan).fees)} excluding any sales tax.`
        : "No assessment saved yet. Your message is enough for a first conversation.";
    const toggle = $("[data-call-toggle]");
    if (!CONSULTATIONS_ENABLED) {
      toggle.closest("label").hidden = true;
      toggle.disabled = true;
    }
    const fields = $("[data-call-fields]");
    toggle.addEventListener("change", () => {
      fields.hidden = !toggle.checked;
      fields.disabled = !toggle.checked;
    });
    function clearErrors() {
      $$("[data-error]", form).forEach((element) => {
        element.textContent = "";
      });
      $$("[aria-invalid]", form).forEach((element) => element.removeAttribute("aria-invalid"));
      $("[data-form-errors]").hidden = true;
    }
    function fail(name, message) {
      $(`[data-error="${name}"]`, form).textContent = message;
      form.elements[name].setAttribute("aria-invalid", "true");
    }
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearErrors();
      const name = form.elements.name.value.trim();
      const email = form.elements.email.value.trim();
      const message = form.elements.message.value.trim();
      if (name.length < 2 || name.length > 100) fail("name", "Enter your name, using 2–100 characters.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200)
        fail("email", "Enter an email address we can reply to.");
      if (message.length < 20 || message.length > 2000)
        fail("message", "Tell us a little more, using 20–2,000 characters.");
      if (toggle.checked && !consultationDates().some((date) => dateKey(date) === select.value))
        fail("date", "Choose an available business day for your call preference.");
      const invalid = $('[aria-invalid="true"]', form);
      if (invalid) {
        $("[data-form-errors]").textContent = "Please check the highlighted details before continuing.";
        $("[data-form-errors]").hidden = false;
        invalid.focus();
        return;
      }
      // Production integration: POST new FormData(form) to your own endpoint or form service.
      // Await fetch(...), check response.ok, and show this success state ONLY after the endpoint accepts it.
      // This standalone front-end has no network submission; replace this branch before accepting real inquiries.
      const referenceBytes = new Uint32Array(1);
      crypto.getRandomValues(referenceBytes);
      const reference = `GM-${String(referenceBytes[0] % 1000000).padStart(6, "0")}`;
      $("[data-success-heading]").textContent = `Thanks, ${name.split(/\s+/)[0]}.`;
      $("[data-success-message]").textContent = toggle.checked
        ? `Your conversation request includes a preference for ${form.elements.time.value} on ${formatDate(new Date(select.value + "T12:00:00Z"))}. We will confirm availability when we reply.`
        : "Your conversation request has reached the practice. We will reply within one business day.";
      $("[data-success-reference]").textContent = reference;
      form.hidden = true;
      const success = $("[data-contact-success]");
      success.hidden = false;
      success.focus();
    });
    $("[data-new-enquiry]").addEventListener("click", () => {
      form.reset();
      clearErrors();
      fields.hidden = true;
      fields.disabled = true;
      $("[data-contact-success]").hidden = true;
      form.hidden = false;
      form.elements.name.focus();
    });
  }
  function setupNavigation() {
    const button = $("[data-menu-toggle]");
    const menu = $("#mobile-menu");
    function setOpen(open, restore = false) {
      menu.hidden = !open;
      button.setAttribute("aria-expanded", String(open));
      button.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (restore) button.focus();
    }
    button.addEventListener("click", () => setOpen(menu.hidden));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !menu.hidden) setOpen(false, true);
    });
    matchMedia("(min-width: 1280px)").addEventListener("change", (event) => {
      if (event.matches) setOpen(false);
    });
    const tabs = $$("[data-process]");
    function selectTab(tab) {
      tabs.forEach((item) => {
        const active = item === tab;
        item.setAttribute("aria-selected", String(active));
        item.tabIndex = active ? 0 : -1;
        $("#" + item.getAttribute("aria-controls")).hidden = !active;
      });
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => selectTab(tab));
      tab.addEventListener("keydown", (event) => {
        let next;
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = tabs.length - 1;
        if (next !== undefined) {
          event.preventDefault();
          selectTab(tabs[next]);
          tabs[next].focus();
        }
      });
    });
    $$("[data-year]").forEach((element) => {
      element.textContent = String(londonToday().getUTCFullYear());
    });
    const reveals = $$(".reveal");
    if ("IntersectionObserver" in window && reveals.length) {
      const pending = new Set(reveals);
      const revealPassedContent = () => {
        pending.forEach((element) => {
          if (element.getBoundingClientRect().top < window.innerHeight) {
            element.classList.add("is-visible");
            observer.unobserve(element);
            pending.delete(element);
          }
        });
        if (!pending.size) window.removeEventListener("scroll", revealPassedContent);
      };
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight))
            revealPassedContent();
        },
        { threshold: 0.05 },
      );
      reveals.forEach((element) => observer.observe(element));
      // A fast End/anchor jump may cross an entire element without an intersection transition.
      // Reveal everything above the new viewport as well as its currently intersecting content.
      window.addEventListener("scroll", revealPassedContent, { passive: true });
      requestAnimationFrame(revealPassedContent);
    } else reveals.forEach((element) => element.classList.add("is-visible"));
  }
  setupNavigation();
  setupDialogs();
  setupServices();
  setupAssessment();
  setupReadiness();
  setupCases();
  setupResources();
  setupTeam();
  setupContact();
})();
