/* Tracewick — service workloads, saved investigations and local tools. */
(() => {
  "use strict";
  const TIME_ZONE = "America/New_York";
  const KEEP_MAINTENANCE_CURRENT = true;
  const FIXED_MAINTENANCE_ANCHOR = "2026-10-28";
  const STORAGE_KEYS = {
    watch: "tracewick.watch.v1",
    budgets: "tracewick.budgets.v1",
    estimate: "tracewick.estimate.v1",
  };
  const SERVICES = [
    {
      id: "gateway",
      name: "Edge gateway",
      group: "edge",
      owner: "Wallace Pendergrass",
      route: "/v1/*",
      requests: 820000,
      latency: 112,
      errors: 0.14,
      slo: 99.9,
      summary: "The first hop applies routing, propagation and request size limits.",
      role: "ingress",
    },
    {
      id: "checkout",
      name: "Checkout API",
      group: "commerce",
      owner: "Inez Culver",
      route: "/checkout",
      requests: 268000,
      latency: 348,
      errors: 1.25,
      slo: 99.9,
      summary: "Coordinates the order path and keeps a trace across payment and inventory checks.",
      role: "order",
    },
    {
      id: "identity",
      name: "Identity broker",
      group: "platform",
      owner: "Corrine Hatley",
      route: "/identity/token",
      requests: 650000,
      latency: 86,
      errors: 0.08,
      slo: 99.95,
      summary: "Exchanges short-lived identity claims without attaching sensitive token bodies to spans.",
      role: "auth",
    },
    {
      id: "ledger",
      name: "Order ledger",
      group: "commerce",
      owner: "Inez Culver",
      route: "/orders/write",
      requests: 194000,
      latency: 219,
      errors: 0.44,
      slo: 99.9,
      summary: "Writes the durable order record and returns the accepted order identifier.",
      role: "storage",
    },
    {
      id: "search",
      name: "Search index",
      group: "commerce",
      owner: "Wallace Pendergrass",
      route: "/search",
      requests: 423000,
      latency: 476,
      errors: 0.83,
      slo: 99.5,
      summary: "Answers catalog searches with bounded result sets and explicit timeouts.",
      role: "index",
    },
    {
      id: "media",
      name: "Media worker",
      group: "workers",
      owner: "Corrine Hatley",
      route: "queue:media",
      requests: 78000,
      latency: 842,
      errors: 2.1,
      slo: 99.5,
      summary: "Processes asynchronous renditions; queue wait and processing time remain separate.",
      role: "worker",
    },
    {
      id: "notify",
      name: "Notification queue",
      group: "workers",
      owner: "Inez Culver",
      route: "queue:notice",
      requests: 315000,
      latency: 173,
      errors: 0.27,
      slo: 99.5,
      summary: "Dispatches notification jobs with retry identifiers that connect attempts.",
      role: "queue",
    },
    {
      id: "cache",
      name: "Session cache",
      group: "platform",
      owner: "Wallace Pendergrass",
      route: "/session/read",
      requests: 945000,
      latency: 24,
      errors: 0.04,
      slo: 99.95,
      summary: "Returns short-lived session context and tracks cache misses independently.",
      role: "cache",
    },
    {
      id: "usage",
      name: "Usage meter",
      group: "platform",
      owner: "Corrine Hatley",
      route: "/usage/record",
      requests: 436000,
      latency: 128,
      errors: 0.36,
      slo: 99.9,
      summary: "Aggregates usage records with deduplication keys and a visible acceptance boundary.",
      role: "meter",
    },
    {
      id: "inventory",
      name: "Inventory read",
      group: "commerce",
      owner: "Inez Culver",
      route: "/stock/read",
      requests: 392000,
      latency: 184,
      errors: 0.61,
      slo: 99.9,
      summary: "Reads available quantities while preserving the source version in the trace.",
      role: "stock",
    },
    {
      id: "route",
      name: "Route resolver",
      group: "edge",
      owner: "Wallace Pendergrass",
      route: "/route/resolve",
      requests: 710000,
      latency: 65,
      errors: 0.09,
      slo: 99.95,
      summary: "Maps requests to a service group and records routing decisions as small attributes.",
      role: "routing",
    },
    {
      id: "upload",
      name: "Upload processor",
      group: "workers",
      owner: "Corrine Hatley",
      route: "queue:upload",
      requests: 61000,
      latency: 619,
      errors: 1.7,
      slo: 99.5,
      summary: "Checks incoming uploads and records validation outcomes before processing starts.",
      role: "upload",
    },
    {
      id: "webhook",
      name: "Webhook dispatcher",
      group: "workers",
      owner: "Inez Culver",
      route: "queue:webhook",
      requests: 227000,
      latency: 529,
      errors: 1.1,
      slo: 99.5,
      summary: "Separates delivery attempts from logical events so retries can be understood.",
      role: "dispatch",
    },
    {
      id: "audit",
      name: "Audit stream",
      group: "platform",
      owner: "Wallace Pendergrass",
      route: "/audit/append",
      requests: 354000,
      latency: 97,
      errors: 0.12,
      slo: 99.9,
      summary: "Accepts structured audit events with strict field allowlists and immutable identifiers.",
      role: "audit",
    },
  ];
  const GUIDES = [
    {
      id: "first-span",
      title: "Your first useful span",
      topic: "start",
      summary:
        "Start with one route and a stable service name. Give the operation a short name that describes the work, then attach environment and release tags.",
      body: "Choose one customer journey. Measure its start and finish before adding nested spans. Keep the service name stable across releases so comparisons retain their meaning.",
      code: 'service.name = "checkout"\nspan.name = "POST /checkout"\nspan.attributes["deployment.environment"] = "production"',
    },
    {
      id: "propagation",
      title: "Carry context across a boundary",
      topic: "start",
      summary:
        "A trace identifier is useful only when the next service receives it. Propagate the parent context through HTTP headers and queue metadata.",
      body: "Extract the incoming context at the service boundary, create a child span and inject that child context into the next request. Do not generate a new root identifier for each internal call.",
      code: 'const parent = context.extract(request.headers);\nconst span = tracer.startSpan("inventory.read", { parent });\ncontext.inject(span.context(), nextRequest.headers);',
    },
    {
      id: "service-names",
      title: "Names that stay useful",
      topic: "start",
      summary:
        "Use a stable service name, an environment and a release identifier. Keep instance names in a separate field.",
      body: "A service name identifies a responsibility rather than a host. Avoid putting an ephemeral container identifier in the name; instance attributes can carry that detail.",
      code: 'service.name = "inventory"\nservice.version = "2.4.1"\nservice.instance.id = "worker-07"',
    },
    {
      id: "sampling",
      title: "Choose what to keep",
      topic: "collect",
      summary:
        "Sampling is a collection decision, not a cure for missing context. Preserve error traces and decide how healthy traffic is represented.",
      body: "Begin with the journeys needed for engineering decisions. Keep a larger proportion of rare routes and errors, then measure whether healthy traffic remains representative after sampling.",
      code: "sampling.defaultRatio = 0.10\nsampling.keepErrors = true\nsampling.rareRouteRatio = 1.00",
    },
    {
      id: "redaction",
      title: "Remove sensitive fields early",
      topic: "collect",
      summary:
        "Collection rules should discard credentials, personal records and full request bodies before they leave the service.",
      body: "Build an explicit allowlist of useful attributes. Review headers, query strings and exception messages. Redaction at the source reduces the chance that sensitive fields reach another system.",
      code: 'attributes.allow = ["http.method", "http.route", "http.status_code"]\nattributes.drop = ["authorization", "cookie", "request.body"]',
    },
    {
      id: "queues",
      title: "Keep queue wait visible",
      topic: "collect",
      summary:
        "Queue wait and processing duration answer different questions. Record both, and link attempts to the original logical job.",
      body: "Attach an enqueue time and job identifier to metadata. Start a consumer span when a worker accepts the job, then record attempts separately so retry volume does not look like new work.",
      code: 'job.logical_id = "order-4821"\njob.attempt = 2\nspan.attributes["queue.wait_ms"] = 145',
    },
    {
      id: "batching",
      title: "Batch without hiding failures",
      topic: "collect",
      summary: "Group records to reduce collection overhead, but keep a bounded batch size and a clear retry policy.",
      body: "A failed batch needs a retry identity and an upper size bound. Avoid retrying an ever-growing payload; split rejected records from transient failures and preserve a local failure count.",
      code: "collector.batch.maxRecords = 500\ncollector.batch.flushAfterMs = 2000\ncollector.retry.maxAttempts = 4",
    },
    {
      id: "trace-queries",
      title: "Ask a narrower question",
      topic: "query",
      summary:
        "Use the smallest useful set of conditions. The console workbench recognizes service, duration and outcome filters.",
      body: "Begin with a specific service or a threshold you can explain. Compare the returned request count, p95 duration and error outcomes before adding more conditions.",
      code: "service:checkout duration>200\noutcome:error\nservice:search outcome:ok",
    },
    {
      id: "latency",
      title: "Read p95 with its context",
      topic: "query",
      summary:
        "A percentile describes a distribution in a chosen window. Keep the request count and route mix beside it.",
      body: "A high p95 can reflect a small tail or a changed workload. Compare like routes, check the count and look for deployment or dependency changes before deciding on a limit.",
      code: 'query.groupBy = ["service.name", "http.route"]\nquery.measure = "duration.p95"\nquery.include = ["request.count", "error.rate"]',
    },
    {
      id: "error-budget",
      title: "Make a budget explicit",
      topic: "query",
      summary:
        "A budget states what a service can tolerate. Put the owner, latency limit and error threshold in the same working view.",
      body: "Choose thresholds from the service responsibility and customer impact. Record the reasoning, review at release time and change it when the workload changes. A threshold is an operating choice, not a universal score.",
      code: 'budget.service = "checkout"\nbudget.p95LatencyMs = 250\nbudget.errorRatePercent = 1.0',
    },
    {
      id: "alert-routes",
      title: "Route an interruption to a person",
      topic: "query",
      summary:
        "An alert should name the affected service, the reason it matters and the first useful evidence to inspect.",
      body: "Attach a service owner and a short runbook. Separate urgent user-impacting failures from capacity work that belongs in a business-hours queue. Review noisy rules with the people they interrupt.",
      code: 'alert.labels = ["service", "environment", "owner"]\nalert.context = ["traceId", "budget", "runbook"]\nalert.groupingWindowMinutes = 5',
    },
    {
      id: "retention",
      title: "Give retention a purpose",
      topic: "operate",
      summary:
        "Keep data for the decisions your team needs to make. Retention should be a visible choice rather than an inherited default.",
      body: "Shorter windows can be sufficient for high-volume routine signals. Longer windows may help release comparisons or audits, subject to your data policy and contract. Export the evidence you need before expiry.",
      code: "retention.traces.days = 14\nretention.metrics.days = 30\nretention.logs.days = 7",
    },
    {
      id: "release-compare",
      title: "Compare a release fairly",
      topic: "operate",
      summary:
        "Tag the deployment and compare equivalent routes over similar traffic windows. Include request volume and error outcomes.",
      body: "Start with a few important journeys and a comparable window. A change in route mix can move a percentile without a code regression; make that distinction before rolling back.",
      code: 'compare.by = "service.version"\ncompare.routes = ["POST /checkout", "GET /search"]\ncompare.windowMinutes = 60',
    },
    {
      id: "incident-notes",
      title: "Write the next useful incident note",
      topic: "operate",
      summary: "A good note states user impact, the evidence, the mitigation and the next update time.",
      body: "Keep a short timeline with named owners. State what is known and what remains uncertain. After recovery, preserve the useful queries and record practical follow-up work rather than a blame narrative.",
      code: "impact: checkout requests exceed the agreed latency budget\nmitigation: route traffic away from the affected worker pool\nnext_update: in 20 minutes",
    },
    {
      id: "export",
      title: "Take the evidence with you",
      topic: "operate",
      summary: "Use an open record format and include the query conditions, time window and units beside an export.",
      body: "An exported chart alone can lose context. Include the service and release filters, request count and units. Apply the same data handling policy to exports that applies to the source.",
      code: 'export.format = "jsonl"\nexport.includeQuery = true\nexport.includeUnits = true',
    },
    {
      id: "collector-health",
      title: "Observe the collector too",
      topic: "operate",
      summary:
        "Track queue depth, rejected records and retry volume in the collection path. A missing signal may be a collection problem.",
      body: "Keep collector health separate from application health. A healthy service with a full collector queue still has an evidence gap. Bound local buffers and surface dropped record counts.",
      code: 'collector.metrics = ["queue.depth", "records.rejected", "retry.count"]\ncollector.buffer.maxMegabytes = 64',
    },
  ];
  const GROUPS = { edge: "Edge", commerce: "Commerce", platform: "Platform", workers: "Workers" };
  const SORTS = { requests: "Request volume", latency: "Latency", errors: "Error rate", name: "Name" };
  const TOPICS = {
    onboarding: "Plan an onboarding",
    pricing: "Talk through pricing",
    collection: "Discuss collection & privacy",
    partnership: "Work with us",
  };
  const COMPONENT_LABELS = {
    ingestion: "Ingestion",
    query: "Query",
    console: "Console",
    alerts: "Alert delivery",
    exports: "Exports",
  };
  const DOC_TOPICS = {
    start: "Getting started",
    collect: "Collection",
    query: "Queries & alerts",
    operate: "Operating well",
  };
  const PLANS = {
    team: {
      name: "Team",
      base: 39,
      ingestion: 50,
      seats: 3,
      retention: 7,
      extraGB: 0.18,
      note: "One engineering team bringing critical routes into focus.",
    },
    scale: {
      name: "Scale",
      base: 129,
      ingestion: 300,
      seats: 10,
      retention: 14,
      extraGB: 0.12,
      note: "Several service groups with shared engineering context.",
    },
    organisation: {
      name: "Organization",
      base: 359,
      ingestion: 1000,
      seats: 30,
      retention: 30,
      extraGB: 0.08,
      note: "A wider service portfolio with agreed operating practices.",
    },
  };
  const RETENTION_DAYS = [7, 14, 30, 90];
  const EXTRA_SEAT_PRICE = 8;
  const RETENTION_GB_DAY_PRICE = 0.015;
  const ANNUAL_DISCOUNT = 0.1;
  const DEFAULT_ESTIMATE = { plan: "team", ingestion: 120, seats: 6, retention: 14, billing: "monthly" };
  const DEFAULT_BUDGET = { latency: 250, errors: 1 };
  const CAPABILITIES = [
    {
      id: "gateway",
      title: "Trace context",
      text: "Carry a request identifier from entry point to the final response, including queue boundaries.",
    },
    {
      id: "usage",
      title: "Useful metrics",
      text: "Keep the unit, the request count and the chosen measurement window beside every comparison.",
    },
    {
      id: "audit",
      title: "Structured events",
      text: "Use a small field allowlist and meaningful event names, rather than an unbounded payload dump.",
    },
    {
      id: "route",
      title: "Service ownership",
      text: "Keep the people responsible and the runbook close to the service boundary.",
    },
    {
      id: "notify",
      title: "Alert budgets",
      text: "Write down the latency and error limits a service can tolerate, then compare the current workload.",
    },
    {
      id: "upload",
      title: "Open exports",
      text: "Keep the useful evidence in an open format with its query conditions and units intact.",
    },
  ];
  const TEAM = [
    {
      id: "ismeria",
      name: "Inez Culver",
      role: "Service experience",
      text: "Inez works with engineering teams to identify the route they need to understand and the smallest useful first step.",
    },
    {
      id: "corisande",
      name: "Corrine Hatley",
      role: "Collection & data",
      text: "Corrine looks after collection rules, retention boundaries and the details that keep a signal useful without collecting everything.",
    },
    {
      id: "wulfric",
      name: "Wallace Pendergrass",
      role: "Platform engineering",
      text: "Wallace builds the query and service-map tools, with a particular interest in clear operating limits and a quiet pager.",
    },
  ];
  const MAINTENANCE = [
    {
      id: "collector",
      component: "ingestion",
      title: "Collector capacity work",
      day: 0,
      hour: 21,
      duration: 45,
      impact: "Collectors buffer accepted records during a short handoff. Query access remains available.",
      owner: "Corrine Hatley",
    },
    {
      id: "query-index",
      component: "query",
      title: "Query index rotation",
      day: 7,
      hour: 21,
      duration: 30,
      impact:
        "Some long-range queries may take longer while index replicas rotate. Recent trace lookup remains available.",
      owner: "Wallace Pendergrass",
    },
    {
      id: "console-release",
      component: "console",
      title: "Console release window",
      day: 14,
      hour: 20,
      duration: 20,
      impact: "An open console tab may need a refresh. Collection and stored records are not affected by this release.",
      owner: "Inez Culver",
    },
  ];
  const COMMITMENTS = [
    {
      title: "Ingestion acceptance",
      text: "Accepted records have passed validation and entered the durable collection queue. Rejected records return a clear reason.",
    },
    {
      title: "Query availability",
      text: "Query response targets are measured by the route and time range agreed for the workload, rather than one number for every request.",
    },
    {
      title: "Planned change",
      text: "Published maintenance windows state scope, impact and a responsible owner, with changes recorded when the scope changes.",
    },
  ];
  /* Status page. Components are operational unless (a) a planned window from MAINTENANCE is running now
     (Eastern time): the query index rotation shows "Degraded performance" because long-range queries slow
     down, other windows show "Under maintenance"; or (b) you list a live issue in CURRENT_ISSUES, e.g.
     { component: "query", level: "degraded", note: "Long-range queries are slower than usual." }.
     Past incidents are dated relative to today (daysAgo, Eastern time) so the history never looks old; set
     KEEP_INCIDENTS_RELATIVE = false and give each incident a fixed "date" ("YYYY-MM-DD") for a real site. */
  const STATUS_COMPONENTS = [
    { id: "ingestion", text: "Collector endpoints and the durable acceptance queue." },
    { id: "query", text: "Trace lookup, workbench queries and long-range search." },
    { id: "console", text: "The web console, service explorer and saved views." },
    { id: "alerts", text: "Budget evaluation and notification routing." },
    { id: "exports", text: "Scheduled and on-demand record exports." },
  ];
  const CURRENT_ISSUES = [];
  const KEEP_INCIDENTS_RELATIVE = true;
  const UPTIME_DAYS = 90;
  const INCIDENTS = [
    {
      id: "query-long-range",
      daysAgo: 4,
      date: "2026-10-16",
      component: "query",
      level: "degraded",
      start: "2:12 p.m.",
      minutes: 38,
      title: "Slow long-range trace queries",
      summary:
        "Queries covering more than seven days took up to four times longer than usual after one index replica fell behind. Recent trace lookup was not affected.",
      steps: [
        ["2:12 p.m.", "Investigating", "Query p95 above its budget for ranges over seven days."],
        ["2:31 p.m.", "Mitigated", "The lagging replica was removed from the query pool."],
        ["2:50 p.m.", "Resolved", "Long-range queries back within budget; the replica was rebuilt overnight."],
      ],
    },
    {
      id: "alerts-delay",
      daysAgo: 12,
      date: "2026-10-08",
      component: "alerts",
      level: "degraded",
      start: "7:40 a.m.",
      minutes: 22,
      title: "Delayed alert budget notifications",
      summary:
        "Budget breaches were evaluated on time, but notifications reached on-call routes up to nine minutes late while a delivery worker restarted repeatedly.",
      steps: [
        ["7:40 a.m.", "Investigating", "Notification queue depth rising; deliveries delayed."],
        ["7:52 a.m.", "Mitigated", "Traffic moved to the standby delivery pool."],
        ["8:02 a.m.", "Resolved", "Queue drained; the worker’s memory limit was raised and a check added."],
      ],
    },
    {
      id: "collector-zone",
      daysAgo: 27,
      date: "2026-09-23",
      component: "ingestion",
      level: "outage",
      start: "11:05 a.m.",
      minutes: 9,
      title: "Collector endpoint rejecting records in one zone",
      summary:
        "One collector zone returned errors for nine minutes after a certificate rotation. Collectors with retries enabled resent their buffered records once the zone recovered.",
      steps: [
        ["11:05 a.m.", "Investigating", "Rejected-record rate rising in one collector zone."],
        ["11:09 a.m.", "Identified", "A rotated certificate had not reached every collector instance."],
        ["11:14 a.m.", "Resolved", "Certificate redeployed; rotation now verifies every instance first."],
      ],
    },
    {
      id: "console-map",
      daysAgo: 41,
      date: "2026-09-09",
      component: "console",
      level: "degraded",
      start: "4:20 p.m.",
      minutes: 46,
      title: "Service map failing to load for some accounts",
      summary:
        "Accounts with more than forty services saw an empty service map after a console release. The service explorer and queries kept working.",
      steps: [
        ["4:20 p.m.", "Investigating", "Reports of an empty service map on larger accounts."],
        ["4:48 p.m.", "Identified", "A layout change exceeded a size limit for large maps."],
        ["5:06 p.m.", "Resolved", "The release was rolled back and the limit fixed before re-release."],
      ],
    },
    {
      id: "exports-late",
      daysAgo: 58,
      date: "2026-08-23",
      component: "exports",
      level: "degraded",
      start: "2:10 a.m.",
      minutes: 95,
      title: "Scheduled exports finishing late",
      summary:
        "Overnight exports finished up to ninety minutes after their usual time because a storage compaction ran in the same window. No records were lost.",
      steps: [
        ["2:10 a.m.", "Investigating", "Export jobs queued behind storage compaction."],
        ["3:05 a.m.", "Mitigated", "Compaction paused until exports completed."],
        ["3:45 a.m.", "Resolved", "All exports delivered; compaction moved to a separate window."],
      ],
    },
    {
      id: "acceptance-latency",
      daysAgo: 76,
      date: "2026-08-05",
      component: "ingestion",
      level: "degraded",
      start: "9:30 a.m.",
      minutes: 17,
      title: "Elevated acceptance latency after a collector release",
      summary:
        "Record acceptance took up to 900 ms instead of the usual 120 ms after a collector release changed batch sizes. Records were accepted, only more slowly.",
      steps: [
        ["9:30 a.m.", "Investigating", "Acceptance latency above budget across collectors."],
        ["9:41 a.m.", "Mitigated", "The previous collector release was restored."],
        ["9:47 a.m.", "Resolved", "Latency normal; batch limits now covered by a release check."],
      ],
    },
  ];
  const STATUS_LEVELS = {
    operational: { label: "Operational", text: "text-cyan", bar: "bg-cyan" },
    maintenance: { label: "Under maintenance", text: "text-amber", bar: "bg-amber" },
    degraded: { label: "Degraded performance", text: "text-amber", bar: "bg-amber" },
    outage: { label: "Outage", text: "text-rose", bar: "bg-rose" },
  };
  const own = (map, key) => typeof key === "string" && Object.prototype.hasOwnProperty.call(map, key);
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char],
    );
  const SERVICE_MAP = Object.fromEntries(SERVICES.map((service) => [service.id, service]));
  const GUIDE_MAP = Object.fromEntries(GUIDES.map((guide) => [guide.id, guide]));
  const params = new URLSearchParams(location.search);
  const formatNumber = (value) => new Intl.NumberFormat("en-US").format(value);
  const money = (value) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(value);
  const clockLabel = (minutes) => {
    const hour = Math.floor(minutes / 60) % 24,
      minute = minutes % 60;
    return `${hour % 12 || 12}${minute ? `:${String(minute).padStart(2, "0")}` : ""} ${hour < 12 ? "a.m." : "p.m."}`;
  };
  const clamp = (value, min, max, step = 1) => {
    const number = typeof value === "number" || typeof value === "string" ? Number(value) : NaN;
    if (!Number.isFinite(number)) return min;
    return Math.round(Math.min(max, Math.max(min, number)) / step) * step;
  };
  const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  const count = (n, word, plural = word + "s") => `${n} ${n === 1 ? word : plural}`;
  function cleanString(value, max = 160) {
    return typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, max) : "";
  }
  function safeParam(key, map, fallback) {
    const value = params.get(key);
    return own(map, value) ? value : fallback;
  }
  const safeStorage = (() => {
    const memory = new Map();
    let blocked = false;
    return {
      getItem(key) {
        if (!blocked) {
          try {
            const value = window.localStorage.getItem(key);
            if (value !== null) memory.set(key, value);
            return value;
          } catch {
            blocked = true;
          }
        }
        return memory.has(key) ? memory.get(key) : null;
      },
      setItem(key, value) {
        memory.set(key, String(value));
        if (!blocked) {
          try {
            window.localStorage.setItem(key, String(value));
          } catch {
            blocked = true;
          }
        }
      },
      removeItem(key) {
        memory.delete(key);
        if (!blocked) {
          try {
            window.localStorage.removeItem(key);
          } catch {
            blocked = true;
          }
        }
      },
    };
  })();
  function readJSON(key) {
    const raw = safeStorage.getItem(key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw);
    } catch {
      safeStorage.removeItem(key);
      return null;
    }
  }
  function writeJSON(key, value) {
    safeStorage.setItem(key, JSON.stringify(value));
  }
  function readWatchlist() {
    const raw = readJSON(STORAGE_KEYS.watch);
    const clean = Array.isArray(raw)
      ? [...new Set(raw.filter((id) => own(SERVICE_MAP, id)))].slice(0, SERVICES.length)
      : [];
    if (raw !== null && JSON.stringify(raw) !== JSON.stringify(clean)) writeJSON(STORAGE_KEYS.watch, clean);
    return clean;
  }
  function readBudgets() {
    const raw = readJSON(STORAGE_KEYS.budgets),
      clean = {};
    if (isRecord(raw))
      Object.keys(raw).forEach((id) => {
        if (!own(SERVICE_MAP, id) || !isRecord(raw[id])) return;
        clean[id] = { latency: clamp(raw[id].latency, 10, 10000), errors: clamp(raw[id].errors, 0.1, 20, 0.1) };
      });
    if (raw !== null && JSON.stringify(raw) !== JSON.stringify(clean)) writeJSON(STORAGE_KEYS.budgets, clean);
    return clean;
  }
  function cleanEstimate(raw) {
    const value = isRecord(raw) ? raw : {};
    return {
      plan: own(PLANS, value.plan) ? value.plan : DEFAULT_ESTIMATE.plan,
      ingestion: clamp(value.ingestion ?? DEFAULT_ESTIMATE.ingestion, 1, 5000),
      seats: clamp(value.seats ?? DEFAULT_ESTIMATE.seats, 1, 250),
      retention:
        (typeof value.retention === "number" || typeof value.retention === "string") &&
        RETENTION_DAYS.includes(Number(value.retention))
          ? Number(value.retention)
          : DEFAULT_ESTIMATE.retention,
      billing: value.billing === "annual" ? "annual" : "monthly",
    };
  }
  function readEstimate() {
    const raw = readJSON(STORAGE_KEYS.estimate),
      clean = cleanEstimate(raw);
    if (raw !== null && JSON.stringify(raw) !== JSON.stringify(clean)) writeJSON(STORAGE_KEYS.estimate, clean);
    return clean;
  }
  let toastTimer;
  function announce(message) {
    const node = $("[data-toast]");
    if (!node) return;
    clearTimeout(toastTimer);
    node.textContent = message;
    node.hidden = false;
    toastTimer = setTimeout(() => {
      node.hidden = true;
    }, 4500);
  }
  function budgetFor(id) {
    const budgets = readBudgets();
    return own(budgets, id) ? budgets[id] : { ...DEFAULT_BUDGET };
  }
  function budgetState(service) {
    const budget = budgetFor(service.id);
    return {
      budget,
      latencyRatio: service.latency / budget.latency,
      errorRatio: service.errors / budget.errors,
      breached: service.latency > budget.latency || service.errors > budget.errors,
    };
  }
  /* Hourly p95 latency and error rate for the last 24 hours, derived from each service's own figures:
     the daily traffic peak depends on the group, the size of the daily swing on request volume, and the
     number and height of tail spikes on the error rate. The series is scaled so its p95 is the service's
     p95 and its mean error rate is the service's error rate. Same input, same series (no randomness). */
  const PEAK_HOUR = { edge: 13, commerce: 19, platform: 10, workers: 3 };
  function seeded(text) {
    let hash = 2166136261;
    for (const char of text) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
    return () => {
      hash ^= hash << 13;
      hash ^= hash >>> 17;
      hash ^= hash << 5;
      return ((hash >>> 0) % 10000) / 10000;
    };
  }
  const SERIES_CACHE = {};
  function serviceSeries(service) {
    if (SERIES_CACHE[service.id]) return SERIES_CACHE[service.id];
    const rand = seeded(service.id + service.route),
      peak = PEAK_HOUR[service.group] ?? 12,
      swing = 0.1 + Math.min(0.32, service.requests / 2600000),
      spikeCount = Math.min(6, Math.max(1, Math.round(service.errors * 2.4))),
      spikes = new Set();
    while (spikes.size < spikeCount) spikes.add(1 + Math.floor(rand() * 22));
    const raw = Array.from({ length: 24 }, (_, index) => {
      const hour = (index + 10) % 24,
        daily = 1 + swing * Math.cos(((hour - peak) / 24) * Math.PI * 2),
        noise = 1 + (rand() - 0.5) * 0.16,
        spike = spikes.has(index) ? 1 + 0.35 + service.errors * 0.22 + rand() * 0.2 : 1;
      return {
        latency: daily * noise * spike,
        errors: daily * (0.6 + rand() * 0.5) * (spikes.has(index) ? 2.4 + service.errors : 1),
      };
    });
    const latencyScale = service.latency / percentile(
        raw.map((point) => point.latency),
        0.95,
      ),
      errorScale = service.errors / (raw.reduce((sum, point) => sum + point.errors, 0) / raw.length);
    SERIES_CACHE[service.id] = raw.map((point) => ({
      latency: Math.max(1, Math.round(point.latency * latencyScale)),
      errors: Math.round(point.errors * errorScale * 100) / 100,
    }));
    return SERIES_CACHE[service.id];
  }
  function seriesSummary(service) {
    const values = serviceSeries(service).map((point) => point.latency);
    return { low: Math.min(...values), high: Math.max(...values), values };
  }
  function linePoints(values, width, height, max, inset = 4) {
    return values
      .map(
        (value, index) =>
          `${Math.round((index * width) / (values.length - 1))},${Math.round(height - inset - (value / max) * (height - inset * 2))}`,
      )
      .join(" ");
  }
  function sparkline(service) {
    const { low, high, values } = seriesSummary(service),
      width = 240,
      height = 48;
    return `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" class="h-12 w-full" role="img" aria-label="p95 latency by hour for ${esc(service.name)}, last 24 hours: ${low}–${high} ms"><path d="M0 ${height - 1}h${width}" stroke="#35515e" vector-effect="non-scaling-stroke"/><polyline points="${linePoints(values, width, height, high * 1.08)}" fill="none" stroke="#6ce9e0" stroke-width="2" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`;
  }
  function serviceChart(service, budget) {
    const series = serviceSeries(service),
      { low, high, values } = seriesSummary(service),
      max = Math.max(high, budget.latency) * 1.1,
      width = 600,
      height = 140,
      line = linePoints(values, width, height, max),
      budgetY = Math.round(height - 4 - (budget.latency / max) * (height - 8)),
      errMax = Math.max(...series.map((point) => point.errors), budget.errors) * 1.1,
      bars = series
        .map((point, index) => {
          const h = Math.max(1, Math.round((point.errors / errMax) * 36)),
            x = Math.round((index * width) / 24) + 3;
          return `<rect x="${x}" y="${40 - h}" width="${Math.round(width / 24) - 6}" height="${h}" fill="${point.errors > budget.errors ? "#ffadaf" : "#35515e"}"/>`;
        })
        .join(""),
      errHigh = Math.max(...series.map((point) => point.errors));
    return `<figure class="min-w-0 border border-line bg-deep p-4 sm:p-5"><figcaption class="flex flex-wrap justify-between gap-2 text-xs text-muted"><span class="eyebrow text-cyan">p95 latency by hour · last 24 hours</span><span>Low ${low} ms · high ${high} ms · <span class="text-amber">budget ${budget.latency} ms</span></span></figcaption><svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" class="mt-4 block h-32 w-full" role="img" aria-label="p95 latency for ${esc(service.name)} by hour over the last 24 hours, from ${low} to ${high} ms, against a ${budget.latency} ms budget"><path d="M0 ${height / 2}h${width}M0 ${height - 1}h${width}" stroke="#35515e" vector-effect="non-scaling-stroke"/><path d="M0 ${budgetY}h${width}" stroke="#f8ce88" stroke-dasharray="6 5" vector-effect="non-scaling-stroke"/><polygon points="0,${height} ${line} ${width},${height}" fill="#6ce9e0" fill-opacity=".12"/><polyline points="${line}" fill="none" stroke="#6ce9e0" stroke-width="2.5" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg><p class="mt-4 flex flex-wrap justify-between gap-2 text-xs text-muted"><span>Error rate by hour</span><span>Peak ${errHigh.toFixed(2)}% · <span class="text-rose">above ${budget.errors.toFixed(1)}% budget</span> in rose</span></p><svg viewBox="0 0 ${width} 40" preserveAspectRatio="none" class="mt-2 block h-10 w-full" role="img" aria-label="Error rate for ${esc(service.name)} by hour, peaking at ${errHigh.toFixed(2)}%">${bars}</svg><div class="mt-2 flex justify-between text-xs text-muted"><span>24 h ago</span><span>12 h ago</span><span>Now</span></div></figure>`;
  }
  function serviceCard(service, compact = false) {
    const saved = readWatchlist().includes(service.id),
      state = budgetState(service);
    return `<article class="min-w-0 border border-line bg-panel p-5" data-service-card="${service.id}"><div class="flex items-start justify-between gap-4"><img src="assets/img/${service.id}.svg" width="70" height="65" class="w-16" alt=""><span class="border border-line px-2 py-1 text-xs text-muted">${esc(GROUPS[service.group])}</span></div><h3 class="mt-4 font-display text-2xl font-semibold">${esc(service.name)}</h3><p class="mt-2 text-xs text-muted">${esc(service.route)}</p><div class="mt-5">${sparkline(service)}</div><dl class="mt-4 grid grid-cols-3 gap-3"><div><dt class="text-xs text-muted">Requests</dt><dd class="mt-1 font-display text-xl">${formatNumber(service.requests)}</dd></div><div><dt class="text-xs text-muted">p95</dt><dd class="mt-1 font-display text-xl">${service.latency} ms</dd></div><div><dt class="text-xs text-muted">Errors</dt><dd class="mt-1 font-display text-xl">${service.errors.toFixed(2)}%</dd></div></dl>${compact ? `<a href="console.html?service=${service.id}" class="text-link mt-5 inline-block text-sm">Explore service</a>` : `<p class="mt-4 text-xs ${state.breached ? "text-amber" : "text-cyan"}">${state.breached ? "Above your alert budget" : "Within your alert budget"}</p><div class="mt-5 flex flex-wrap justify-between gap-3 border-t border-line pt-4"><button type="button" data-open-service="${service.id}" class="text-link text-sm" aria-label="Inspect service: ${esc(service.name)}">Inspect service</button><button type="button" data-watch="${service.id}" aria-pressed="${saved}" class="border border-line px-3 py-2 text-xs ${saved ? "text-cyan" : "text-ice"}" aria-label="${saved ? "Remove from watchlist" : "Save to watchlist"}: ${esc(service.name)}">${saved ? "Remove from watchlist" : "Save to watchlist"}</button></div>`}</article>`;
  }
  function updateWatchButtons() {
    const saved = readWatchlist();
    $$("[data-watch]").forEach((button) => {
      const id = button.dataset.watch;
      if (!own(SERVICE_MAP, id)) return;
      const active = saved.includes(id),
        label = active ? "Remove from watchlist" : "Save to watchlist";
      button.setAttribute("aria-pressed", String(active));
      button.textContent = label;
      button.setAttribute("aria-label", `${label}: ${SERVICE_MAP[id].name}`);
    });
  }
  function renderWatchlist() {
    const root = $("[data-watchlist]");
    if (!root) return;
    const ids = readWatchlist();
    root.innerHTML = ids.length
      ? ids
          .map((id) => {
            const service = SERVICE_MAP[id],
              state = budgetState(service);
            return `<article class="flex flex-wrap items-center justify-between gap-3 border border-line p-4" data-watch-row="${id}"><div><h3 class="font-display text-xl font-semibold">${esc(service.name)}</h3><p class="mt-1 text-xs text-muted">${state.budget.latency} ms / ${state.budget.errors.toFixed(1)}% budget</p></div><div class="flex gap-4"><button type="button" data-open-service="${id}" class="text-link text-sm" aria-label="Inspect: ${esc(service.name)}">Inspect</button><button type="button" data-remove-watch="${id}" class="text-link text-sm" aria-label="Remove: ${esc(service.name)}">Remove</button></div></article>`;
          })
          .join("")
      : '<p class="border border-line p-5 text-sm text-muted">No services saved yet. Start with a critical request path, then add only the services worth keeping in view.</p>';
    $("[data-clear-watchlist]").disabled = !ids.length;
  }
  function toggleWatch(id) {
    if (!own(SERVICE_MAP, id)) return;
    const ids = readWatchlist(),
      index = ids.indexOf(id);
    if (index === -1) ids.push(id);
    else ids.splice(index, 1);
    writeJSON(STORAGE_KEYS.watch, ids);
    updateWatchButtons();
    renderWatchlist();
    announce(`${SERVICE_MAP[id].name} ${index === -1 ? "saved to" : "removed from"} your watchlist.`);
  }
  function initWatchlist() {
    document.addEventListener("click", (event) => {
      const toggle = event.target.closest("[data-watch]");
      if (toggle) {
        toggleWatch(toggle.dataset.watch);
        return;
      }
      const remove = event.target.closest("[data-remove-watch]");
      if (!remove) return;
      const previous = $$("[data-remove-watch]").indexOf(remove),
        id = remove.dataset.removeWatch;
      writeJSON(
        STORAGE_KEYS.watch,
        readWatchlist().filter((value) => value !== id),
      );
      updateWatchButtons();
      renderWatchlist();
      ($$("[data-remove-watch]")[Math.min(previous, readWatchlist().length - 1)] || $("[data-reset-filters]")).focus();
      announce(`${SERVICE_MAP[id].name} removed from your watchlist.`);
    });
    const clear = $("[data-clear-watchlist]");
    if (clear)
      clear.addEventListener("click", () => {
        writeJSON(STORAGE_KEYS.watch, []);
        updateWatchButtons();
        renderWatchlist();
        $("[data-reset-filters]").focus();
        announce("Your watchlist is clear.");
      });
    renderWatchlist();
  }
  let renderConsoleView = () => {};
  function initConsole() {
    const form = $("[data-console-filters]");
    if (!form) return;
    const search = form.elements.search,
      group = form.elements.group,
      sort = form.elements.sort,
      saved = form.elements.saved;
    group.value = safeParam("group", GROUPS, "all");
    if (!own(GROUPS, group.value)) group.value = "all";
    search.value = cleanString(params.get("search"));
    function render() {
      const term = search.value.trim().toLowerCase(),
        watch = readWatchlist();
      let rows = SERVICES.filter(
        (service) =>
          (group.value === "all" || service.group === group.value) &&
          (!saved.checked || watch.includes(service.id)) &&
          [service.name, service.owner, service.route, service.summary].some((value) =>
            value.toLowerCase().includes(term),
          ),
      );
      const sorting = own(SORTS, sort.value) ? sort.value : "requests";
      rows.sort((a, b) => (sorting === "name" ? a.name.localeCompare(b.name) : b[sorting] - a[sorting]));
      $("[data-service-grid]").innerHTML = rows.map((service) => serviceCard(service)).join("");
      $("[data-console-count]").textContent =
        `${count(rows.length, "service")} shown${saved.checked ? " from your watchlist" : ""}. Reference workloads; budgets are your own working limits.`;
      $("[data-console-empty]").hidden = rows.length > 0;
    }
    renderConsoleView = render;
    form.addEventListener("submit", (event) => event.preventDefault());
    form.addEventListener("input", (event) => {
      if (event.target.name === "search") render();
    });
    form.addEventListener("change", (event) => {
      if (event.target.name !== "search") render();
    });
    $("[data-reset-filters]").addEventListener("click", () => {
      form.reset();
      render();
      search.focus();
    });
    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-watch],[data-remove-watch],[data-clear-watchlist]") && saved.checked) render();
    });
    render();
    const initial = safeParam("service", SERVICE_MAP, null);
    if (initial) openService(initial);
  }
  let lastServiceTrigger = null;
  function openService(id, trigger = null) {
    const dialog = $("[data-service-dialog]");
    if (!dialog || !own(SERVICE_MAP, id)) return;
    const service = SERVICE_MAP[id],
      state = budgetState(service);
    lastServiceTrigger = trigger;
    $("[data-service-detail]").innerHTML =
      `<div class="grid gap-6 sm:grid-cols-[150px_1fr]"><img src="assets/img/${service.id}.svg" width="260" height="240" alt="" class="w-32"><div><p class="eyebrow text-cyan">${esc(GROUPS[service.group])} / ${esc(service.route)}</p><h2 id="service-dialog-title" class="mt-3 font-display text-4xl font-semibold">${esc(service.name)}</h2><p class="mt-4 text-muted">${esc(service.summary)}</p><p class="mt-3 text-sm text-muted">Owner: ${esc(service.owner)}</p></div></div><div class="mt-7">${serviceChart(service, state.budget)}</div><dl class="mt-7 grid grid-cols-2 gap-5 sm:grid-cols-4"><div><dt class="text-xs text-muted">Requests</dt><dd class="metric mt-2">${formatNumber(service.requests)}</dd></div><div><dt class="text-xs text-muted">p95 duration</dt><dd class="metric mt-2">${service.latency} ms</dd></div><div><dt class="text-xs text-muted">Error rate</dt><dd class="metric mt-2">${service.errors.toFixed(2)}%</dd></div><div><dt class="text-xs text-muted">Service target</dt><dd class="metric mt-2">${service.slo}%</dd></div></dl><div class="mt-7 border border-line bg-panel p-5"><h3 class="font-display text-2xl font-semibold">Your alert budget</h3><p class="mt-3 text-muted">Latency ${state.budget.latency} ms · errors ${state.budget.errors.toFixed(1)}%. ${state.breached ? "This workload is above at least one chosen limit." : "This workload is within both chosen limits."}</p><button data-choose-budget="${id}" type="button" class="btn mt-5">Adjust this service budget</button></div>${recentTraces(service)}`;
    if (!dialog.open) dialog.showModal();
    $("[data-close-service]").focus();
  }
  function initServiceDialog() {
    const dialog = $("[data-service-dialog]");
    if (!dialog) return;
    document.addEventListener("click", (event) => {
      const open = event.target.closest("[data-open-service]");
      if (open) openService(open.dataset.openService, open);
      const budget = event.target.closest("[data-choose-budget]");
      if (budget) {
        const select = $("[data-budget-service]");
        select.value = budget.dataset.chooseBudget;
        select.dispatchEvent(new Event("change"));
        lastServiceTrigger = null;
        dialog.close();
        select.focus();
      }
    });
    $("[data-close-service]").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", () => {
      if (lastServiceTrigger && lastServiceTrigger.isConnected) lastServiceTrigger.focus();
      lastServiceTrigger = null;
    });
  }
  function initBudget() {
    const form = $("[data-budget-form]");
    if (!form) return;
    form.elements.service.innerHTML = SERVICES.map(
      (service) => `<option value="${service.id}">${esc(service.name)}</option>`,
    ).join("");
    function load() {
      const value = budgetFor(form.elements.service.value);
      form.elements.latency.value = value.latency;
      form.elements.errors.value = value.errors;
      $("[data-budget-error]").textContent = "";
      showBudget();
    }
    function showBudget() {
      const id = form.elements.service.value;
      if (!own(SERVICE_MAP, id)) return;
      const state = budgetState(SERVICE_MAP[id]);
      $("[data-budget-status]").textContent =
        `${SERVICE_MAP[id].name}: ${state.budget.latency} ms latency / ${state.budget.errors.toFixed(1)}% errors. ${state.breached ? "The reference workload exceeds this budget." : "The reference workload is within this budget."}`;
    }
    form.elements.service.addEventListener("change", load);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const id = form.elements.service.value,
        latency = Number(form.elements.latency.value),
        errors = Number(form.elements.errors.value);
      if (
        !own(SERVICE_MAP, id) ||
        !Number.isInteger(latency) ||
        latency < 10 ||
        latency > 10000 ||
        !Number.isFinite(errors) ||
        errors < 0.1 ||
        errors > 20
      ) {
        $("[data-budget-error]").textContent = "Use a latency limit from 10–10,000 ms and an error limit from 0.1–20%.";
        form.elements.latency.focus();
        return;
      }
      const budgets = readBudgets();
      budgets[id] = { latency, errors: Math.round(errors * 10) / 10 };
      writeJSON(STORAGE_KEYS.budgets, budgets);
      showBudget();
      renderConsoleView();
      renderWatchlist();
      announce(`Alert budget saved for ${SERVICE_MAP[id].name}.`);
    });
    $("[data-reset-budget]").addEventListener("click", () => {
      const budgets = readBudgets();
      delete budgets[form.elements.service.value];
      writeJSON(STORAGE_KEYS.budgets, budgets);
      load();
      renderConsoleView();
      renderWatchlist();
      announce("The service budget is reset.");
    });
    load();
  }
  const TRACES = SERVICES.flatMap((service, index) =>
    [0.42, 0.65, 0.92, 1.15, 1.55, 2.1].map((factor, n) => ({
      id: `TW-${String(index + 1).padStart(2, "0")}${String(n + 1).padStart(3, "0")}`,
      service: service.id,
      duration: Math.round(service.latency * factor),
      outcome: (index + n) % 7 === 0 ? "error" : "ok",
    })),
  );
  const TRACE_MAP = Object.fromEntries(TRACES.map((row) => [row.id, row]));
  /* Each trace is expanded into spans from this call graph: the services a service calls (in order) and the
     internal steps it runs first. Durations are shared out by each service's p95, so a trace's waterfall
     always adds up to its duration. In a slow trace (longer than the service's p95) the heaviest call takes
     the extra time; in a failed trace the call with the highest error rate fails and later calls never run. */
  const CALLS = {
    gateway: ["route", "identity"],
    checkout: ["identity", "inventory", "ledger", "notify"],
    identity: ["cache"],
    ledger: ["audit"],
    search: ["cache", "inventory"],
    media: ["audit"],
    notify: ["webhook"],
    cache: [],
    usage: ["audit"],
    inventory: ["cache"],
    route: [],
    upload: ["media"],
    webhook: ["audit"],
    audit: [],
  };
  const STEPS = {
    gateway: ["limits.check"],
    checkout: ["basket.validate"],
    identity: ["claims.verify"],
    ledger: ["order.serialize", "db.commit"],
    search: ["query.parse", "index.scan"],
    media: ["rendition.resize", "object.write"],
    notify: ["template.render"],
    cache: ["session.lookup", "payload.decode"],
    usage: ["dedupe.check", "counter.increment"],
    inventory: ["version.read"],
    route: ["rules.match", "pool.select"],
    upload: ["file.scan", "metadata.extract"],
    webhook: ["payload.sign"],
    audit: ["schema.validate", "stream.append"],
  };
  const ERROR_TYPES = {
    ingress: ["503", "upstream_unavailable"],
    order: ["500", "order_rejected"],
    auth: ["401", "token_rejected"],
    storage: ["500", "lock_timeout"],
    index: ["504", "deadline_exceeded"],
    worker: ["", "retry_exhausted"],
    queue: ["", "broker_unavailable"],
    cache: ["503", "connection_reset"],
    meter: ["409", "duplicate_key"],
    stock: ["409", "version_conflict"],
    routing: ["503", "no_healthy_pool"],
    upload: ["", "validation_failed"],
    dispatch: ["", "endpoint_timeout"],
    audit: ["503", "append_rejected"],
  };
  const isQueue = (service) => service.route.startsWith("queue:");
  function operationName(service) {
    if (isQueue(service)) return `process ${service.route.slice(6)}`;
    const reads = ["index", "cache", "stock", "routing"];
    return `${reads.includes(service.role) ? "GET" : "POST"} ${service.route}`;
  }
  function hexId(text, length) {
    const rand = seeded(text);
    return Array.from({ length }, () => Math.floor(rand() * 16).toString(16)).join("");
  }
  const TRACE_CACHE = {};
  function buildTrace(row) {
    if (TRACE_CACHE[row.id]) return TRACE_CACHE[row.id];
    const root = SERVICE_MAP[row.service],
      total = row.duration,
      slow = row.outcome === "ok" && row.duration > root.latency,
      failed = row.outcome === "error",
      spans = [];
    const add = (service, name, start, duration, parent, kind) => {
      const span = {
        index: spans.length,
        service,
        name,
        start,
        duration: Math.max(0.2, duration),
        depth: parent ? parent.depth + 1 : 0,
        parent,
        kind,
        status: "ok",
        mark: "",
      };
      spans.push(span);
      return span;
    };
    function culpritFor(service, ids) {
      if (!ids.length) return null;
      const key = failed ? "errors" : "latency";
      return ids.reduce((best, id) => (SERVICE_MAP[id][key] > SERVICE_MAP[best][key] ? id : best), ids[0]);
    }
    let stop = false;
    function nest(parent, service, ancestors, level) {
      const calls = (CALLS[service.id] || []).filter((id) => !ancestors.includes(id)),
        steps = STEPS[service.id] || [],
        items = [
          ...steps.map((name) => ({ type: "step", name, weight: service.latency * 0.18 })),
          ...calls.map((id) => ({ type: "call", id, weight: SERVICE_MAP[id].latency })),
        ],
        culprit = level === 0 ? culpritFor(service, calls) : null,
        lastStep = steps.length - 1;
      if (level === 0 && (slow || failed))
        items.forEach((item, i) => {
          if ((culprit && item.id === culprit) || (!culprit && item.type === "step" && i === lastStep)) {
            item.culprit = true;
            if (slow) item.weight *= 1 + (row.duration / root.latency) * 2.5;
          }
        });
      const room = parent.duration * (level === 0 ? 0.84 : 0.76),
        gap = Math.min(room * 0.025, 3),
        sum = items.reduce((total, item) => total + item.weight, 0);
      let cursor = parent.start + parent.duration * (level === 0 ? 0.06 : 0.1);
      for (const item of items) {
        if (stop) break;
        const duration = (room * item.weight) / sum - gap;
        const span =
          item.type === "step"
            ? add(service, item.name, cursor, duration, parent, "internal")
            : add(SERVICE_MAP[item.id], operationName(SERVICE_MAP[item.id]), cursor, duration, parent, "client");
        cursor += duration + gap;
        if (item.culprit) {
          span.mark = failed ? "failed" : "slow";
          if (failed) {
            span.status = "error";
            span.duration *= 0.7;
            for (let up = span.parent; up; up = up.parent) up.status = "error";
          }
        }
        if (item.type === "call") nest(span, SERVICE_MAP[item.id], [...ancestors, item.id], level + 1);
        if (item.culprit && failed) stop = true;
      }
    }
    let handler;
    if (isQueue(root)) {
      const top = add(root, `receive ${root.route.slice(6)}`, 0, total, null, "consumer"),
        wait = total * (slow ? 0.12 : 0.18);
      add(root, "queue.wait", 0, wait, top, "internal");
      handler = add(root, operationName(root), wait, total - wait, top, "internal");
    } else if (root.id === "gateway") {
      handler = add(root, `${operationName(root)}`, 0, total, null, "server");
    } else {
      const top = add(SERVICE_MAP.gateway, `POST ${root.route}`, 0, total, null, "server");
      let start = total * 0.03;
      if (root.id !== "route") {
        add(SERVICE_MAP.route, operationName(SERVICE_MAP.route), start, total * 0.05, top, "client");
        start = total * 0.1;
      }
      handler = add(root, operationName(root), start, total - start - total * 0.03, top, "server");
    }
    nest(handler, root, [root.id, ...(isQueue(root) || root.id === "gateway" ? [] : ["gateway", "route"])], 0);
    if (failed && !spans.some((span) => span.mark === "failed")) {
      handler.mark = "failed";
      handler.status = "error";
    }
    if (slow && !spans.some((span) => span.mark === "slow")) handler.mark = "slow";
    if (failed) for (let up = handler.parent; up; up = up.parent) up.status = "error";
    spans.forEach((span) => {
      span.id = hexId(`${row.id}:${span.index}`, 16);
    });
    TRACE_CACHE[row.id] = {
      row,
      root,
      spans,
      traceId: hexId(row.id, 32),
      services: new Set(spans.map((span) => span.service.id)).size,
      focus: spans.find((span) => span.mark) || spans[0],
    };
    return TRACE_CACHE[row.id];
  }
  const ms = (value) => (value < 10 ? `${value.toFixed(1)} ms` : `${Math.round(value)} ms`);
  function spanAttributes(trace, span) {
    const service = span.service,
      index = SERVICES.indexOf(service),
      attrs = [
        ["service.name", service.id],
        ["service.version", `${2 + (index % 3)}.${(index * 7) % 10}.${(index * 3) % 8}`],
        ["span.name", span.name],
        ["span.kind", span.kind],
        ["span.id", span.id],
        ["parent.span.id", span.parent ? span.parent.id : "none (root span)"],
        ["start", `+${ms(span.start)}`],
        ["duration", ms(span.duration)],
        ["status", span.status === "error" ? "error" : "ok"],
      ];
    if (isQueue(service)) attrs.push(["messaging.destination", service.route.slice(6)]);
    else attrs.push(["http.route", service.route]);
    if (span.kind !== "internal" && !isQueue(service)) {
      const code = span.status === "error" ? ERROR_TYPES[service.role][0] || "500" : "200";
      attrs.push(["http.status_code", code]);
    }
    if (span.mark === "failed") attrs.push(["error.type", ERROR_TYPES[service.role][1]]);
    if (span.mark === "slow") attrs.push(["note", `${Math.round((span.duration / trace.row.duration) * 100)}% of the trace`]);
    attrs.push(["owner", service.owner], ["deployment.environment", "production"], ["trace.id", trace.traceId]);
    return attrs;
  }
  function recentTraces(service) {
    const rows = TRACES.filter((row) => row.service === service.id),
      picks = [rows[rows.length - 1], rows.find((row) => row.outcome === "error"), rows[2]].filter(
        (row, i, list) => row && list.indexOf(row) === i,
      );
    return `<div class="mt-7"><h3 class="font-display text-2xl font-semibold">Recent traces</h3><ul class="mt-4 divide-y divide-line border border-line">${picks
      .map(
        (row) =>
          `<li class="flex flex-wrap items-center justify-between gap-3 p-4"><span><button type="button" data-open-trace="${row.id}" class="text-link font-display text-lg" aria-label="Open trace ${row.id}: ${esc(service.name)}, ${row.duration} ms, ${row.outcome === "error" ? "error" : "OK"}">${row.id}</button><span class="ml-3 text-sm text-muted">${count(buildTrace(row).spans.length, "span")}</span></span><span class="text-sm ${row.outcome === "error" ? "text-rose" : row.duration > service.latency ? "text-amber" : "text-cyan"}">${row.duration} ms · ${row.outcome === "error" ? "Error" : row.duration > service.latency ? "Slow" : "OK"}</span></li>`,
      )
      .join("")}</ul></div>`;
  }
  let lastTraceTrigger = null,
    currentTrace = null;
  function selectSpan(index, focus = false) {
    if (!currentTrace || !currentTrace.spans[index]) return;
    const span = currentTrace.spans[index];
    $$("[data-span]").forEach((button) => {
      const active = Number(button.dataset.span) === index;
      button.setAttribute("aria-pressed", String(active));
      button.tabIndex = active ? 0 : -1;
      button.classList.toggle("bg-panel", active);
    });
    $("[data-span-detail]").innerHTML =
      `<p class="eyebrow ${span.mark === "failed" ? "text-rose" : span.mark === "slow" ? "text-amber" : "text-cyan"}">${span.mark === "failed" ? "Failed span" : span.mark === "slow" ? "Slowest span" : "Selected span"}</p><h3 class="mt-3 font-display text-2xl font-semibold" style="overflow-wrap:anywhere">${esc(span.name)}</h3><p class="mt-1 text-sm text-muted">${esc(span.service.name)}</p><dl class="mt-5 space-y-2 text-sm">${spanAttributes(
        currentTrace,
        span,
      )
        .map(
          ([key, value]) =>
            `<div class="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)] gap-3 border-b border-line pb-2"><dt class="text-muted" style="overflow-wrap:anywhere">${esc(key)}</dt><dd class="${key === "error.type" ? "text-rose" : "text-ice"}" style="overflow-wrap:anywhere">${esc(value)}</dd></div>`,
        )
        .join("")}</dl>`;
    if (focus) $(`[data-span="${index}"]`).focus();
  }
  function openTrace(id, trigger = null) {
    const dialog = $("[data-trace-dialog]");
    if (!dialog || !own(TRACE_MAP, id)) return;
    const trace = buildTrace(TRACE_MAP[id]),
      row = trace.row,
      total = row.duration,
      ticks = [0, 0.25, 0.5, 0.75, 1],
      failed = trace.spans.find((span) => span.mark === "failed"),
      slowSpan = trace.spans.find((span) => span.mark === "slow");
    currentTrace = trace;
    lastTraceTrigger = trigger;
    const outcome =
      row.outcome === "error"
        ? `<span class="text-rose">Error</span>`
        : row.duration > trace.root.latency
          ? `<span class="text-amber">Slow</span>`
          : `<span class="text-cyan">OK</span>`;
    const finding = failed
      ? `${esc(failed.name)} in ${esc(failed.service.name)} failed after ${ms(failed.duration)} (${esc(ERROR_TYPES[failed.service.role][1])}); the calls after it never ran.`
      : slowSpan
        ? `${esc(slowSpan.name)} in ${esc(slowSpan.service.name)} took ${ms(slowSpan.duration)}, ${Math.round((slowSpan.duration / total) * 100)}% of this trace, which is above the ${trace.root.latency} ms p95 for ${esc(trace.root.name)}.`
        : `Every span finished within the usual range for ${esc(trace.root.name)}.`;
    $("[data-trace-detail]").innerHTML =
      `<p class="eyebrow text-cyan">${esc(trace.root.name)} · ${esc(GROUPS[trace.root.group])}</p><h2 id="trace-dialog-title" class="mt-3 font-display text-4xl font-semibold" style="overflow-wrap:anywhere">${row.id} · ${esc(trace.spans[0].name)}</h2><p class="mt-2 text-xs text-muted" style="overflow-wrap:anywhere">Trace ID ${trace.traceId}</p><dl class="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-4"><div><dt class="text-xs text-muted">Duration</dt><dd class="metric mt-2">${total} ms</dd></div><div><dt class="text-xs text-muted">Spans</dt><dd class="metric mt-2">${trace.spans.length}</dd></div><div><dt class="text-xs text-muted">Services</dt><dd class="metric mt-2">${trace.services}</dd></div><div><dt class="text-xs text-muted">Outcome</dt><dd class="metric mt-2">${outcome}</dd></div></dl><p class="mt-6 border-l-2 ${failed ? "border-rose" : slowSpan ? "border-amber" : "border-cyan"} pl-4 text-muted">${finding}</p><div class="mt-7 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]"><div class="min-w-0"><div class="flex flex-wrap justify-between gap-2 text-xs text-muted"><span>Select a span to see its attributes. Arrow keys move between spans.</span><span><span class="text-amber">■</span> slowest · <span class="text-rose">■</span> failed</span></div><div class="mt-3 hidden grid-cols-[minmax(0,15rem)_minmax(0,1fr)] gap-4 text-xs text-muted sm:grid" aria-hidden="true"><span>Span</span><span class="relative h-4">${ticks
        .map(
          (tick) =>
            `<span class="absolute top-0 whitespace-nowrap ${tick === 1 ? "-translate-x-full" : tick === 0 ? "" : "-translate-x-1/2"}" style="left:${tick * 100}%">${Math.round(total * tick)} ms</span>`,
        )
        .join(
          "",
        )}</span></div><ol class="mt-2 border-t border-line" data-span-list aria-label="Spans in trace ${row.id}, in start order">${trace.spans
        .map((span) => {
          const left = (span.start / total) * 100,
            width = Math.max(0.8, (span.duration / total) * 100),
            colour = span.mark === "failed" ? "bg-rose" : span.mark === "slow" ? "bg-amber" : span.status === "error" ? "bg-cyan/50" : "bg-cyan";
          return `<li class="border-b border-line"><button type="button" data-span="${span.index}" aria-pressed="false" tabindex="-1" class="grid w-full gap-2 px-2 py-2 text-left hover:bg-panel sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] sm:items-center sm:gap-4" aria-label="${esc(span.name)}, ${esc(span.service.name)}, starts at ${ms(span.start)}, lasts ${ms(span.duration)}${span.mark === "failed" ? ", failed span" : span.mark === "slow" ? ", slowest span" : ""}"><span class="block min-w-0" style="padding-left:${span.depth * 0.85}rem"><span class="block truncate text-sm ${span.mark === "failed" ? "text-rose" : span.mark === "slow" ? "text-amber" : "text-ice"}">${esc(span.name)}</span><span class="block truncate text-xs text-muted">${esc(span.service.name)} · ${ms(span.duration)}</span></span><span class="relative block h-5 bg-[repeating-linear-gradient(90deg,#35515e_0_1px,transparent_1px_25%)]"><span class="absolute inset-y-0 ${colour}" style="left:${left.toFixed(2)}%;width:${Math.min(width, 100 - left).toFixed(2)}%"></span></span></button></li>`;
        })
        .join("")}</ol></div><aside data-span-detail class="min-w-0 border border-line bg-panel p-5" aria-live="polite"></aside></div>`;
    if (!dialog.open) dialog.showModal();
    selectSpan(trace.focus.index);
    $(`[data-span="${trace.focus.index}"]`).focus();
  }
  function initTraceDialog() {
    const dialog = $("[data-trace-dialog]");
    if (!dialog) return;
    document.addEventListener("click", (event) => {
      const open = event.target.closest("[data-open-trace]");
      if (open) {
        const service = $("[data-service-dialog]");
        let trigger = open;
        if (service && service.open && service.contains(open)) {
          trigger = lastServiceTrigger;
          lastServiceTrigger = null;
          service.close();
        }
        openTrace(open.dataset.openTrace, trigger);
        return;
      }
      const row = event.target.closest("[data-trace-row]");
      if (row && !event.target.closest("button")) openTrace(row.dataset.traceRow, $("[data-open-trace]", row));
    });
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) {
        dialog.close();
        return;
      }
      const span = event.target.closest("[data-span]");
      if (span) selectSpan(Number(span.dataset.span));
    });
    dialog.addEventListener("keydown", (event) => {
      const span = event.target.closest("[data-span]");
      if (!span || !currentTrace) return;
      const index = Number(span.dataset.span),
        last = currentTrace.spans.length - 1,
        next = { ArrowDown: index + 1, ArrowUp: index - 1, Home: 0, End: last }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      selectSpan(Math.max(0, Math.min(last, next)), true);
    });
    $("[data-close-trace]").addEventListener("click", () => dialog.close());
    dialog.addEventListener("close", () => {
      if (lastTraceTrigger && lastTraceTrigger.isConnected) lastTraceTrigger.focus();
      lastTraceTrigger = null;
    });
  }
  function parseQuery(query) {
    const tokens = cleanString(query, 160).trim().split(/\s+/).filter(Boolean),
      rules = [],
      unknown = [];
    tokens.forEach((token) => {
      if (token.startsWith("service:")) {
        const id = token.slice(8);
        if (own(SERVICE_MAP, id)) rules.push((row) => row.service === id);
        else unknown.push(token);
      } else if (/^duration[<>]\d+$/.test(token)) {
        const value = Number(token.slice(9)),
          greater = token[8] === ">";
        rules.push((row) => (greater ? row.duration > value : row.duration < value));
      } else if (token === "outcome:error" || token === "outcome:ok") {
        const outcome = token.slice(8);
        rules.push((row) => row.outcome === outcome);
      } else unknown.push(token);
    });
    return { rules, unknown };
  }
  function percentile(values, p) {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.max(0, Math.ceil(sorted.length * p) - 1)];
  }
  function initQuery() {
    const form = $("[data-query-form]");
    if (!form) return;
    function render() {
      const { rules, unknown } = parseQuery(form.elements.query.value);
      const rows = unknown.length ? [] : TRACES.filter((row) => rules.every((rule) => rule(row)));
      $("[data-query-results]").innerHTML =
        rows
          .slice(0, 24)
          .map(
            (row) =>
              `<tr class="cursor-pointer border-b border-line hover:bg-ink" data-trace-row="${row.id}"><td class="p-3"><button type="button" data-open-trace="${row.id}" class="text-link font-display text-base" aria-label="Open trace ${row.id}: ${esc(SERVICE_MAP[row.service].name)}, ${row.duration} ms, ${row.outcome === "error" ? "error" : "OK"}">${row.id}</button></td><td class="p-3">${esc(SERVICE_MAP[row.service].name)}</td><td class="p-3">${count(buildTrace(row).spans.length, "span")}</td><td class="p-3">${row.duration} ms</td><td class="p-3 ${row.outcome === "error" ? "text-rose" : "text-cyan"}">${row.outcome === "error" ? "Error" : "OK"}</td></tr>`,
          )
          .join("") ||
        '<tr><td colspan="5" class="p-5 text-muted">No matching traces. Try a smaller set of conditions.</td></tr>';
      const status = unknown.length
        ? `Unrecognized condition: ${unknown.join(", ")}. Use service:id, duration>number, duration<number or outcome:error.`
        : `${count(rows.length, "trace")} matched · p95 ${percentile(
            rows.map((row) => row.duration),
            0.95,
          )} ms · ${count(rows.filter((row) => row.outcome === "error").length, "error outcome")}${rows.length > 24 ? " · first 24 shown" : ""}.`;
      $("[data-query-status]").textContent = status;
    }
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      render();
    });
    render();
    const initial = params.get("trace");
    if (own(TRACE_MAP, initial)) openTrace(initial);
  }
  function priceFor(raw) {
    const estimate = cleanEstimate(raw),
      plan = PLANS[estimate.plan];
    const overage = Math.max(0, estimate.ingestion - plan.ingestion) * plan.extraGB;
    const seats = Math.max(0, estimate.seats - plan.seats) * EXTRA_SEAT_PRICE;
    const retention = estimate.ingestion * Math.max(0, estimate.retention - plan.retention) * RETENTION_GB_DAY_PRICE;
    const subtotal = plan.base + overage + seats + retention;
    const discount = estimate.billing === "annual" ? subtotal * ANNUAL_DISCOUNT : 0;
    return {
      estimate,
      plan,
      overage,
      seats,
      retention,
      subtotal,
      discount,
      total: Math.round((subtotal - discount) * 100) / 100,
    };
  }
  function initPricing() {
    const grid = $("[data-plan-grid]");
    if (grid)
      grid.innerHTML = Object.entries(PLANS)
        .map(
          ([id, plan]) =>
            `<article class="border border-line bg-panel p-6"><p class="eyebrow text-cyan">${esc(plan.name)}</p><h2 class="mt-4 font-display text-5xl font-semibold">$${plan.base}<span class="text-lg text-muted"> / month</span></h2><p class="mt-5 text-muted">${esc(plan.note)}</p><ul class="mt-5 space-y-3 text-sm"><li>${plan.ingestion} GB monthly ingestion included</li><li>${count(plan.seats, "engineering seat")}</li><li>${plan.retention}-day retention included</li></ul><button type="button" data-select-plan="${id}" class="btn btn-line mt-6 w-full">Choose ${esc(plan.name)}</button></article>`,
        )
        .join("");
    const form = $("[data-pricing-form]");
    if (!form) return;
    const value = readEstimate();
    Object.entries(value).forEach(([key, item]) => {
      if (key === "billing") form.querySelector(`[name="billing"][value="${item}"]`).checked = true;
      else form.elements[key].value = item;
    });
    function fromForm() {
      return cleanEstimate(Object.fromEntries(new FormData(form)));
    }
    function render(normalise = false) {
      const result = priceFor(fromForm()),
        estimate = result.estimate;
      if (normalise) {
        form.elements.ingestion.value = estimate.ingestion;
        form.elements.seats.value = estimate.seats;
      }
      $("[data-price-total]").textContent = money(result.total);
      $("[data-price-period]").textContent =
        estimate.billing === "annual"
          ? `${money(result.total * 12)} billed annually. Monthly equivalent shown.`
          : "Billed monthly. Change the workload as your team grows.";
      $("[data-price-lines]").innerHTML = [
        ["Plan base", result.plan.base],
        ["Additional ingestion", result.overage],
        ["Additional engineering seats", result.seats],
        ["Additional retention", result.retention],
        ["Annual billing reduction", -result.discount],
      ]
        .map(
          ([label, price]) =>
            `<div class="flex justify-between gap-5"><dt class="text-muted">${label}</dt><dd>${money(price)}</dd></div>`,
        )
        .join("");
      $("[data-price-allowance]").textContent =
        `${result.plan.ingestion} GB, ${count(result.plan.seats, "seat")} and ${result.plan.retention} days of retention are included in ${result.plan.name}. Your selected workload is ${estimate.ingestion} GB / ${count(estimate.seats, "seat")} / ${estimate.retention} days.`;
    }
    form.addEventListener("submit", (event) => event.preventDefault());
    form.addEventListener("input", () => render());
    form.addEventListener("change", () => render(true));
    $("[data-save-pricing]").addEventListener("click", () => {
      writeJSON(STORAGE_KEYS.estimate, fromForm());
      const clean = readEstimate();
      $("[data-pricing-save-status]").textContent =
        `Saved: ${PLANS[clean.plan].name}, ${clean.ingestion} GB, ${count(clean.seats, "seat")}, ${clean.retention} days, ${clean.billing} billing.`;
      announce("Your workload estimate is saved.");
    });
    $("[data-reset-pricing]").addEventListener("click", () => {
      safeStorage.removeItem(STORAGE_KEYS.estimate);
      form.reset();
      render(true);
      $("[data-pricing-save-status]").textContent = "Estimate reset to the starting workload.";
    });
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-select-plan]");
      if (!button || !own(PLANS, button.dataset.selectPlan)) return;
      form.elements.plan.value = button.dataset.selectPlan;
      render();
      form.elements.plan.focus();
      form.scrollIntoView({ block: "start", behavior: "instant" });
    });
    render();
  }
  function initGuides() {
    const form = $("[data-doc-filters]");
    if (!form) return;
    form.elements.search.value = cleanString(params.get("search"));
    let current = safeParam("guide", GUIDE_MAP, GUIDES[0].id);
    function renderDetail(id, focus = false) {
      if (!own(GUIDE_MAP, id)) return;
      current = id;
      const guide = GUIDE_MAP[id];
      $("[data-doc-detail]").innerHTML =
        `<p class="eyebrow text-cyan">${esc(DOC_TOPICS[guide.topic])}</p><h2 class="mt-4 font-display text-4xl font-semibold" tabindex="-1" data-guide-heading>${esc(guide.title)}</h2><p class="mt-5 text-lg text-muted">${esc(guide.summary)}</p><p class="mt-5 leading-relaxed text-muted">${esc(guide.body)}</p><div class="mt-7 border border-line bg-deep p-5"><div class="mb-4 flex justify-between gap-4"><p class="eyebrow text-muted">Working configuration</p><button type="button" data-copy-guide class="text-link text-sm">Copy snippet</button></div><pre class="text-sm leading-relaxed text-cyan"><code data-guide-code>${esc(guide.code)}</code></pre></div><div class="mt-7 border-t border-line pt-5"><h3 class="font-display text-2xl font-semibold">Before you widen the scope</h3><p class="mt-3 text-muted">Verify the result on one route. Record the units and the chosen window, check the fields being collected, then share the useful query with the service owner.</p></div>`;
      $$("[data-guide]").forEach((button) => {
        const active = button.dataset.guide === id;
        if (active) button.setAttribute("aria-current", "true");
        else button.removeAttribute("aria-current");
      });
      if (focus) $("[data-guide-heading]").focus();
    }
    function render() {
      const term = form.elements.search.value.trim().toLowerCase(),
        topic = form.elements.topic.value;
      const rows = GUIDES.filter(
        (guide) =>
          (topic === "all" || guide.topic === topic) &&
          [guide.title, guide.summary, guide.body].some((text) => text.toLowerCase().includes(term)),
      );
      $("[data-doc-list]").innerHTML =
        rows
          .map(
            (guide) =>
              `<button type="button" data-guide="${guide.id}" class="block w-full border border-line bg-panel p-4 text-left hover:border-cyan"><span class="eyebrow text-cyan">${esc(DOC_TOPICS[guide.topic])}</span><span class="mt-2 block font-display text-xl font-semibold">${esc(guide.title)}</span></button>`,
          )
          .join("") ||
        '<p class="border border-line p-5 text-muted">No guides match. Try a shorter phrase or another topic.</p>';
      $("[data-doc-count]").textContent = `${count(rows.length, "guide")} found.`;
      if (rows.length && !rows.some((guide) => guide.id === current)) current = rows[0].id;
      if (rows.length) renderDetail(current);
      else
        $("[data-doc-detail]").innerHTML =
          '<h2 class="font-display text-3xl font-semibold">Try another route.</h2><p class="mt-4 text-muted">Search for a signal, a service boundary or a decision your team needs to make.</p>';
    }
    form.addEventListener("submit", (event) => event.preventDefault());
    form.addEventListener("input", (event) => {
      if (event.target.name === "search") render();
    });
    form.addEventListener("change", (event) => {
      if (event.target.name !== "search") render();
    });
    $("[data-doc-list]").addEventListener("click", (event) => {
      const button = event.target.closest("[data-guide]");
      if (button) renderDetail(button.dataset.guide, true);
    });
    document.addEventListener("click", async (event) => {
      if (!event.target.closest("[data-copy-guide]")) return;
      const text = $("[data-guide-code]").textContent;
      try {
        await navigator.clipboard.writeText(text);
        announce("Snippet copied.");
      } catch {
        const area = document.createElement("textarea");
        area.value = text;
        area.className = "field mt-5";
        area.setAttribute("aria-label", "Snippet to copy");
        $("[data-doc-detail]").append(area);
        area.focus();
        area.select();
        announce("Select and copy the snippet from this field.");
      }
    });
    render();
  }
  function londonToday() {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());
    const get = (type) => parts.find((part) => part.type === type).value;
    return new Date(`${get("year")}-${get("month")}-${get("day")}T12:00:00Z`);
  }
  function addDays(date, number) {
    const value = new Date(date);
    value.setUTCDate(value.getUTCDate() + number);
    return value;
  }
  function maintenanceAnchor() {
    if (!KEEP_MAINTENANCE_CURRENT) return new Date(FIXED_MAINTENANCE_ANCHOR + "T12:00:00Z");
    const today = londonToday();
    let delta = (3 - today.getUTCDay() + 7) % 7;
    if (delta < 7) delta += 7;
    return addDays(today, delta);
  }
  function maintenanceDates() {
    const anchor = maintenanceAnchor();
    return MAINTENANCE.map((item) => ({ ...item, date: addDays(anchor, item.day) }));
  }
  function dateLabel(date) {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  }
  function initMaintenance() {
    const root = $("[data-maintenance-list]");
    if (!root) return;
    function render() {
      const component = $("[data-maintenance-filter]").value,
        rows = maintenanceDates().filter((item) => component === "all" || item.component === component);
      root.innerHTML = rows
        .map(
          (item) =>
            `<article class="border border-line bg-panel p-6"><p class="eyebrow text-cyan">${esc(COMPONENT_LABELS[item.component])}</p><h3 class="mt-4 font-display text-3xl font-semibold">${esc(item.title)}</h3><p class="mt-4 font-semibold">${dateLabel(item.date)}</p><p class="mt-1 text-sm text-muted">${clockLabel(item.hour * 60)}–${clockLabel(item.hour * 60 + item.duration)} · Eastern time</p><p class="mt-5 leading-relaxed text-muted">${esc(item.impact)}</p><p class="mt-5 border-t border-line pt-4 text-xs text-muted">Owner: ${esc(item.owner)}</p></article>`,
        )
        .join("");
      $("[data-maintenance-count]").textContent = `${count(rows.length, "planned window")} shown.`;
    }
    $("[data-maintenance-filter]").addEventListener("change", render);
    render();
    $("[data-commitments]").innerHTML = COMMITMENTS.map(
      (item) =>
        `<article class="border border-line p-5"><h3 class="font-display text-2xl font-semibold">${esc(item.title)}</h3><p class="mt-3 text-muted">${esc(item.text)}</p></article>`,
    ).join("");
  }
  function londonNow() {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: TIME_ZONE,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date());
    const get = (type) => Number(parts.find((part) => part.type === type).value);
    return { day: londonToday(), minutes: get("hour") * 60 + get("minute") };
  }
  function incidentDate(incident) {
    if (!KEEP_INCIDENTS_RELATIVE && /^\d{4}-\d{2}-\d{2}$/.test(incident.date))
      return new Date(incident.date + "T12:00:00Z");
    return addDays(londonToday(), -incident.daysAgo);
  }
  function currentStatus() {
    const now = londonNow(),
      status = {};
    STATUS_COMPONENTS.forEach((component) => {
      status[component.id] = { level: "operational", note: "" };
    });
    maintenanceDates().forEach((item) => {
      const from = item.hour * 60;
      if (item.date.getTime() === now.day.getTime() && now.minutes >= from && now.minutes < from + item.duration)
        status[item.component] = {
          level: item.component === "query" ? "degraded" : "maintenance",
          note: `${item.title}, until ${clockLabel(from + item.duration)} Eastern time.`,
        };
    });
    CURRENT_ISSUES.forEach((issue) => {
      if (isRecord(issue) && own(status, issue.component) && own(STATUS_LEVELS, issue.level))
        status[issue.component] = { level: issue.level, note: cleanString(issue.note) };
    });
    return status;
  }
  function uptimeDays(componentId) {
    const today = londonToday(),
      byDay = {};
    INCIDENTS.forEach((incident) => {
      if (incident.component !== componentId) return;
      const days = Math.round((today - incidentDate(incident)) / 86400000);
      if (days >= 0 && days < UPTIME_DAYS) (byDay[days] = byDay[days] || []).push(incident);
    });
    return Array.from({ length: UPTIME_DAYS }, (_, i) => {
      const ago = UPTIME_DAYS - 1 - i,
        hits = byDay[ago] || [],
        level = hits.some((hit) => hit.level === "outage") ? "outage" : hits.length ? "degraded" : "operational",
        lost = hits.reduce((sum, hit) => sum + hit.minutes * (hit.level === "outage" ? 1 : 0.5), 0);
      return { ago, date: addDays(today, -ago), level, uptime: 100 - (lost / 1440) * 100, incidents: hits };
    });
  }
  function shortDate(date) {
    return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "short", month: "short", day: "numeric" }).format(
      date,
    );
  }
  function dayDetail(component, day) {
    return `${shortDate(day.date)}: ${day.uptime.toFixed(2)}% uptime${day.incidents.length ? ` · ${day.incidents.map((hit) => `${hit.title} (${count(hit.minutes, "minute")})`).join("; ")}` : " · no incidents"}`;
  }
  function initStatus() {
    const root = $("[data-status-components]");
    if (!root) return;
    const status = currentStatus(),
      issues = STATUS_COMPONENTS.filter((component) => status[component.id].level !== "operational"),
      data = {};
    $("[data-status-summary]").innerHTML = issues.length
      ? `<span class="size-3 shrink-0 bg-amber" aria-hidden="true"></span><p><strong class="font-display text-2xl font-semibold">${count(issues.length, "component")} affected.</strong> <span class="text-muted">${issues.map((component) => `${COMPONENT_LABELS[component.id]}: ${STATUS_LEVELS[status[component.id].level].label.toLowerCase()}`).join(" · ")}</span></p>`
      : `<span class="size-3 shrink-0 bg-cyan" aria-hidden="true"></span><p><strong class="font-display text-2xl font-semibold">All components operational.</strong> <span class="text-muted">No open incidents.</span></p>`;
    if (issues.length) $("[data-status-summary]").classList.replace("border-cyan", "border-amber");
    const time = clockLabel(londonNow().minutes);
    $("[data-status-checked]").textContent = `Checked today at ${time} Eastern time`;
    root.innerHTML = STATUS_COMPONENTS.map((component) => {
      const days = uptimeDays(component.id),
        current = status[component.id],
        level = STATUS_LEVELS[current.level],
        average = days.reduce((sum, day) => sum + day.uptime, 0) / days.length,
        name = COMPONENT_LABELS[component.id];
      data[component.id] = days;
      return `<article class="p-5 sm:p-6" data-status-component="${component.id}"><div class="flex flex-wrap items-start justify-between gap-3"><div><h3 class="font-display text-2xl font-semibold">${esc(name)}</h3><p class="mt-1 text-sm text-muted">${esc(component.text)}</p></div><p class="flex items-center gap-2 text-sm ${level.text}"><span class="size-2.5 ${level.bar}" aria-hidden="true"></span>${level.label}</p></div>${current.note ? `<p class="mt-3 text-sm text-amber">${esc(current.note)}</p>` : ""}<div class="mt-4 flex h-9 gap-[2px]" role="group" aria-label="${esc(name)}, daily uptime for the last ${UPTIME_DAYS} days">${days
        .map(
          (day, i) =>
            `<button type="button" data-uptime-day="${i}" tabindex="${i === days.length - 1 ? 0 : -1}" class="min-w-0 flex-1 ${STATUS_LEVELS[day.level].bar} ${day.level === "operational" ? "opacity-70 hover:opacity-100" : ""} ${i < UPTIME_DAYS - 30 ? "max-sm:hidden" : ""}" aria-label="${esc(dayDetail(component, day))}"></button>`,
        )
        .join(
          "",
        )}</div><div class="mt-2 flex justify-between text-xs text-muted"><span><span class="sm:hidden">30 days ago</span><span class="max-sm:hidden">${UPTIME_DAYS} days ago</span></span><span>${average.toFixed(3)}% uptime</span><span>Today</span></div><p class="mt-2 min-h-5 text-xs text-muted" data-uptime-detail>${esc(dayDetail(component, days[days.length - 1]))}</p></article>`;
    }).join("");
    function show(button) {
      const row = button.closest("[data-status-component]"),
        day = data[row.dataset.statusComponent][Number(button.dataset.uptimeDay)];
      $("[data-uptime-detail]", row).textContent = dayDetail(row.dataset.statusComponent, day);
    }
    root.addEventListener("mouseover", (event) => {
      const button = event.target.closest("[data-uptime-day]");
      if (button) show(button);
    });
    root.addEventListener("focusin", (event) => {
      const button = event.target.closest("[data-uptime-day]");
      if (button) show(button);
    });
    root.addEventListener("click", (event) => {
      const button = event.target.closest("[data-uptime-day]");
      if (button) show(button);
    });
    root.addEventListener("keydown", (event) => {
      const button = event.target.closest("[data-uptime-day]");
      if (!button) return;
      const bars = $$("[data-uptime-day]", button.parentElement).filter((bar) => bar.offsetParent !== null),
        i = bars.indexOf(button),
        next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: bars.length - 1 }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      const target = bars[Math.max(0, Math.min(bars.length - 1, next))];
      button.tabIndex = -1;
      target.tabIndex = 0;
      target.focus();
    });
    const list = $("[data-incident-list]");
    if (list)
      list.innerHTML = [...INCIDENTS]
        .sort((a, b) => incidentDate(b) - incidentDate(a))
        .map((incident) => {
          const level = STATUS_LEVELS[incident.level];
          return `<li class="border border-line bg-panel p-5 sm:p-6"><div class="flex flex-wrap items-baseline justify-between gap-3"><p class="font-semibold">${dateLabel(incidentDate(incident))}</p><p class="text-sm ${level.text}">${level.label} · ${esc(COMPONENT_LABELS[incident.component])} · ${count(incident.minutes, "minute")}</p></div><h3 class="mt-3 font-display text-2xl font-semibold">${esc(incident.title)}</h3><p class="mt-3 text-muted">${esc(incident.summary)}</p><ol class="mt-4 space-y-2 border-t border-line pt-4 text-sm">${incident.steps
            .map(
              ([time, stage, text]) =>
                `<li class="grid gap-1 sm:grid-cols-[5rem_7rem_1fr] sm:gap-3"><span class="text-muted">${esc(time)}</span><strong class="${stage === "Resolved" ? "text-cyan" : "text-ice"}">${esc(stage)}</strong><span class="text-muted">${esc(text)}</span></li>`,
            )
            .join("")}</ol></li>`;
        })
        .join("");
  }
  function reference(prefix) {
    return `${prefix}-${String(Date.now()).slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
  }
  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value).trim()) && String(value).length <= 254;
  }
  function showErrors(form, errors) {
    $$("[data-form-error]", form).forEach((node) => (node.textContent = ""));
    $$("[aria-invalid]", form).forEach((node) => node.removeAttribute("aria-invalid"));
    Object.entries(errors).forEach(([name, message]) => {
      const target = $(`[data-form-error="${name}"]`, form);
      if (target) target.textContent = message;
      const input = form.elements[name];
      if (input && input.setAttribute) input.setAttribute("aria-invalid", "true");
      else if (input && input.length)
        Array.from(input).forEach((control) => control.setAttribute("aria-invalid", "true"));
    });
    const first = $('[aria-invalid="true"]', form);
    if (first) first.focus();
    return Object.keys(errors).length === 0;
  }
  function initContact() {
    const form = $("[data-contact-form]");
    if (!form) return;
    form.elements.topic.value = safeParam("topic", TOPICS, "onboarding");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(form)),
        errors = {};
      if (cleanString(values.name, 100).trim().length < 2)
        errors.name = "Please enter your name, using at least two characters.";
      if (!validEmail(values.email)) errors.email = "Please enter a complete work email address.";
      if (cleanString(values.company, 100).trim().length < 2) errors.company = "Please add your company or team name.";
      if (cleanString(values.message, 2000).trim().length < 15)
        errors.message = "Please add at least fifteen characters of context.";
      if (!values.reply) errors.reply = "Please let us know the team may reply about your request.";
      if (!showErrors(form, errors)) return;
      // Production integration: await fetch(form.action,{method:'POST',body:new FormData(form)}).
      // Only call the business success branch after response.ok; handle failures inline and retain fields.
      const target = $("[data-contact-success]"),
        name = cleanString(values.name, 100).trim(),
        topic = own(TOPICS, values.topic) ? TOPICS[values.topic] : TOPICS.onboarding;
      target.innerHTML = `<p class="eyebrow text-cyan">Request received</p><h2 class="mt-4 font-display text-3xl font-semibold">Thanks, ${esc(name)}.</h2><p class="mt-4 text-muted">Your request reference is <strong class="text-ice">${reference("TW")}</strong>. It’s with the engineering team as <strong class="text-ice">${esc(topic)}</strong> for ${esc(cleanString(values.company, 100).trim())}, and we’ll reply to <strong class="text-ice">${esc(cleanString(values.email, 254).trim())}</strong> within one business day.</p><h3 class="mt-6 font-display text-2xl font-semibold">What happens next</h3><ol class="mt-3 list-decimal space-y-2 pl-5 text-muted"><li>An engineer reads your note and replies with a few questions or a first answer.</li><li>If a call helps, we suggest a 30-minute slot during US business hours.</li><li>Keep a rough service map and an approximate monthly ingestion volume handy; mention your reference if you write again.</li></ol>`;
      form.hidden = true;
      target.hidden = false;
      target.focus();
      target.scrollIntoView({ block: "start", behavior: "instant" });
    });
  }
  function initUpdates() {
    const form = $("[data-updates-form]");
    if (!form) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form),
        errors = {};
      if (!validEmail(data.get("email"))) errors.email = "Please enter a complete work email address.";
      const choices = data.getAll("components").filter((value) => own(COMPONENT_LABELS, value));
      if (!choices.length) errors.components = "Choose at least one component for your updates.";
      if (!showErrors(form, errors)) return;
      // Production: POST this form to your subscription endpoint. Show this state only after response.ok.
      const target = $("[data-updates-success]"),
        labels = choices.map((value) => COMPONENT_LABELS[value]),
        list = labels.length > 1 ? `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}` : labels[0];
      target.innerHTML = `<p class="eyebrow text-cyan">Preferences recorded</p><h3 class="mt-4 font-display text-3xl font-semibold">You’re on the update list.</h3><p class="mt-4 text-muted">Reference <strong class="text-ice">${reference("TU")}</strong>. We’ll email <strong class="text-ice">${esc(String(data.get("email")).trim())}</strong> before planned maintenance on ${esc(list)}, and with each update during an incident that affects ${labels.length === 1 ? "it" : "them"}.</p><p class="mt-4 text-sm text-muted">Every update has an unsubscribe link; mention your reference to change the components you follow.</p>`;
      form.hidden = true;
      target.hidden = false;
      target.focus();
    });
  }
  function initMenu() {
    const button = $("[data-menu-button]"),
      menu = $("#mobile-menu");
    if (!button || !menu) return;
    function close(focus = false) {
      menu.hidden = true;
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-label", "Open menu");
      if (focus) button.focus();
    }
    button.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") !== "true";
      menu.hidden = !open;
      button.setAttribute("aria-expanded", String(open));
      button.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (open) $("a", menu).focus();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !menu.hidden) close(true);
    });
    matchMedia("(min-width:1024px)").addEventListener("change", (event) => {
      if (event.matches) close();
    });
  }
  function initReveals() {
    const nodes = $$(".reveal");
    if (matchMedia("(prefers-reduced-motion:reduce)").matches || !("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting || entry.boundingClientRect.top < innerHeight) {
            nodes.forEach((node) => {
              if (node.getBoundingClientRect().top <= entry.boundingClientRect.bottom) node.classList.add("is-visible");
            });
            observer.unobserve(entry.target);
          }
        }),
      { rootMargin: "0px 0px 80px 0px" },
    );
    nodes.forEach((node) => observer.observe(node));
  }
  function initStaticData() {
    const home = $("[data-home-services]");
    if (home)
      home.innerHTML = SERVICES.slice(0, 4)
        .map((service) => serviceCard(service, true))
        .join("");
    const capabilities = $("[data-capabilities]");
    if (capabilities)
      capabilities.innerHTML = CAPABILITIES.map(
        (item) =>
          `<article class="border border-line bg-panel p-5"><img src="assets/img/${item.id}.svg" alt="" width="70" height="65" class="w-16"><h3 class="mt-4 font-display text-2xl font-semibold">${esc(item.title)}</h3><p class="mt-3 text-sm leading-relaxed text-muted">${esc(item.text)}</p></article>`,
      ).join("");
    const team = $("[data-team-grid]");
    if (team)
      team.innerHTML = TEAM.map(
        (person) =>
          `<article class="min-w-0"><img src="assets/img/${person.id}.svg" width="260" height="240" class="w-full" alt="Illustration of ${esc(person.name)}"><p class="eyebrow mt-5 text-cyan">${esc(person.role)}</p><h3 class="mt-2 font-display text-3xl font-semibold">${esc(person.name)}</h3><p class="mt-4 text-muted">${esc(person.text)}</p></article>`,
      ).join("");
    $$("[data-year]").forEach((node) => {
      node.textContent = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, year: "numeric" }).format(new Date());
    });
  }
  initStaticData();
  initMenu();
  initWatchlist();
  initServiceDialog();
  initTraceDialog();
  initConsole();
  initBudget();
  initQuery();
  initPricing();
  initGuides();
  initMaintenance();
  initStatus();
  initContact();
  initUpdates();
  initReveals();
})();
