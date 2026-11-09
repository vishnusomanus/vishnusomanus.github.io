/* Weftiq — workflow catalog, local rule processing and saved plans. */
(() => {
  "use strict";
  const TIME_ZONE = "America/Chicago";
  const KEEP_CLINICS_CURRENT = true;
  const FIXED_CLINIC_DATES = ["2026-10-27", "2026-10-29", "2026-11-03", "2026-11-05"];
  // Workflow hours pause from December 24 to January 2 (month-day keys, inclusive) and on US federal holidays,
  // which bankHolidays(year) works out by rule. Add one-off closures as "YYYY-MM-DD" strings.
  const WINTER_BREAK = ["12-24", "01-02"];
  const CLOSED_DATES = [];
  const STORAGE_KEYS = {
    favourites: "weftiq:favourites:v1",
    draft: "weftiq:draft:v1",
    flows: "weftiq:flows:v1",
    pricing: "weftiq:pricing:v1",
  };
  const RECIPES = [
    {
      id: "inbox-sort",
      title: "Sort the support inbox",
      team: "support",
      trigger: "email",
      condition: "urgency",
      value: "4",
      actions: ["classify", "tag", "task", "notify"],
      minutes: 4,
      summary: "Bring the urgent messages into view without losing the quieter questions.",
      story:
        "A new message reaches a shared inbox. The rule checks urgency before the team receives a clear, categorized handoff.",
      care: "Keep the first category broad. Let the support lead correct it before using it to drive a more sensitive decision.",
      art: "recipe-1.svg",
    },
    {
      id: "meeting-follow",
      title: "Keep a meeting moving",
      team: "operations",
      trigger: "calendar",
      condition: "always",
      value: "",
      actions: ["summarise", "task", "notify"],
      minutes: 9,
      summary: "Turn a meeting note into a concise handoff and a visible next action.",
      story:
        "When a meeting ends, a short summary gives the next person enough context to begin. A named task keeps the decision from disappearing into a chat.",
      care: "Ask the meeting owner to check dates, names and commitments in the summary before sharing it more widely.",
      art: "recipe-2.svg",
    },
    {
      id: "document-check",
      title: "Give a document a careful check",
      team: "operations",
      trigger: "document",
      condition: "contains",
      value: "review",
      actions: ["classify", "tag", "route"],
      minutes: 6,
      summary: "Put documents asking for a review into a place the right person can see.",
      story:
        "The title or text is checked for a review request. Matching items receive a category, a useful label and a route to the operations team.",
      care: "Keep the original document available. A label is a routing aid, not approval of the content.",
      art: "recipe-3.svg",
    },
    {
      id: "welcome-week",
      title: "A calmer first week",
      team: "people",
      trigger: "form",
      condition: "always",
      value: "",
      actions: ["task", "notify", "wait"],
      minutes: 12,
      summary: "Give a new hire a clear sequence and the team a shared checklist.",
      story:
        "A new-hire form starts three small actions: make a preparation task, notify the owner and note the planned waiting step.",
      care: "Only collect information the process needs. Keep personal employment records in the system designed to hold them.",
      art: "recipe-4.svg",
    },
    {
      id: "order-handover",
      title: "Tidy the order handoff",
      team: "operations",
      trigger: "store",
      condition: "amount",
      value: "100",
      actions: ["classify", "task", "route"],
      minutes: 7,
      summary: "Keep higher-value order questions together for a considered handoff.",
      story:
        "Orders above the chosen amount are categorized and routed to the team responsible for checking the detail.",
      care: "Check the threshold against your real process. Do not treat an automated category as a fraud or credit decision.",
      art: "recipe-5.svg",
    },
    {
      id: "dispatch-note",
      title: "Follow a shipment",
      team: "operations",
      trigger: "store",
      condition: "always",
      value: "",
      actions: ["tag", "notify"],
      minutes: 3,
      summary: "Add a clear internal label and tell the person waiting for the next step.",
      story:
        "A store event receives a consistent shipment label. The named team sees the handoff in one place instead of another copied message.",
      care: "Keep customer-facing delivery promises separate from an internal event. A shipment note is not proof of arrival.",
      art: "recipe-6.svg",
    },
    {
      id: "raised-flag",
      title: "Catch a raised flag",
      team: "operations",
      trigger: "form",
      condition: "urgency",
      value: "4",
      actions: ["classify", "task", "notify"],
      minutes: 5,
      summary: "Make an important exception visible without turning every update into an alert.",
      story:
        "The rule checks the urgency value first. Only a matching event creates the follow-up task and a team notification.",
      care: "Agree on what the urgency scale means before using the flow. The person reporting an issue needs a clear route for emergencies.",
      art: "recipe-7.svg",
    },
    {
      id: "access-check",
      title: "Review access before it drifts",
      team: "people",
      trigger: "calendar",
      condition: "weekday",
      value: "",
      actions: ["task", "notify", "archive"],
      minutes: 8,
      summary: "Give access reviews an owner, a reminder and a tidy record of the request.",
      story:
        "A weekday calendar event creates a review task, tells the owner and records the original event for the audit trail.",
      care: "The flow does not grant or revoke access. Keep those decisions with an authorized person in the relevant account.",
      art: "recipe-8.svg",
    },
    {
      id: "conversation-note",
      title: "Turn a conversation into a note",
      team: "support",
      trigger: "email",
      condition: "contains",
      value: "help",
      actions: ["summarise", "tag", "route"],
      minutes: 6,
      summary: "Help the next person start with the context, rather than a long copied thread.",
      story:
        "Messages asking for help receive a short first-pass summary, a consistent label and a clear route to the support team.",
      care: "Summaries can miss nuance. Keep the source conversation close to the note and ask the owner to review important details.",
      art: "recipe-9.svg",
    },
    {
      id: "invoice-query",
      title: "Keep invoice questions together",
      team: "finance",
      trigger: "email",
      condition: "amount",
      value: "100",
      actions: ["classify", "tag", "task"],
      minutes: 8,
      summary: "Bring invoice questions above a chosen amount into a single review queue.",
      story:
        "The amount rule decides whether an event needs the finance handoff. A task makes responsibility visible without changing the invoice itself.",
      care: "This flow organizes questions. It does not approve invoices, move money or replace a financial control.",
      art: "recipe-10.svg",
    },
    {
      id: "reading-list",
      title: "Build a weekly reading list",
      team: "marketing",
      trigger: "document",
      condition: "always",
      value: "",
      actions: ["summarise", "tag", "notify"],
      minutes: 10,
      summary: "Make a short, readable first pass through the documents your team wants to revisit.",
      story:
        "A new document is summarized, labeled and routed into the team reading list. The original remains the source of record.",
      care: "Check licensing and privacy before sharing documents. A short summary does not remove those responsibilities.",
      art: "recipe-11.svg",
    },
    {
      id: "feedback-route",
      title: "Give feedback a place to go",
      team: "marketing",
      trigger: "form",
      condition: "urgency",
      value: "3",
      actions: ["classify", "route", "notify"],
      minutes: 5,
      summary: "Send useful feedback toward a person who can do something with it.",
      story:
        "Feedback that meets the rule is categorized, routed and brought to the named team. Lower-urgency items remain outside this sequence.",
      care: "Listen for the context behind a category. Keep an easy way for a person to change the route or add a note.",
      art: "recipe-12.svg",
    },
  ];
  const INTEGRATIONS = [
    {
      id: "mailquill",
      name: "Mailquill",
      kind: "messages",
      summary: "A shared inbox with clear conversation ownership.",
      events: ["New message", "Thread labeled"],
      actions: ["Add a label", "Create a reply draft"],
      access: "Read message metadata; write labels only when selected.",
      symbol: "shared-inbox",
      steps: [
        "Choose the shared inbox, rather than a personal mailbox.",
        "Confirm the label names with the support owner.",
        "Run one low-impact conversation through the rule.",
      ],
      caution: "Keep account passwords and recovery details in the inbox provider, not in a workflow note.",
    },
    {
      id: "tablune",
      name: "Tablune",
      kind: "documents",
      summary: "A structured table for the details people need to agree.",
      events: ["Row added", "Status changed"],
      actions: ["Append a row", "Update a field"],
      access: "Read the selected table; write only the mapped columns.",
      symbol: "table",
      steps: [
        "Choose one table and name the columns used by the flow.",
        "Map a stable row identifier before updating a field.",
        "Check how blank and repeated values should be handled.",
      ],
      caution: "Avoid using row position as an identifier: sorting the table changes positions.",
    },
    {
      id: "docwisp",
      name: "Docwisp",
      kind: "documents",
      summary: "Documents and notes that keep the original context close.",
      events: ["Document added", "Review requested"],
      actions: ["Add a note", "Apply a category"],
      access: "Read the chosen folder; add comments without broad edit access.",
      symbol: "document",
      steps: [
        "Choose the smallest folder that contains the relevant work.",
        "Decide which text is appropriate to summarize.",
        "Keep the source link beside the resulting note.",
      ],
      caution: "Do not summarize sensitive records unless your team has approved that processing.",
    },
    {
      id: "meetfern",
      name: "Meetfern",
      kind: "operations",
      summary: "A calendar built around useful meetings and their follow-through.",
      events: ["Meeting ended", "Meeting updated"],
      actions: ["Create a follow-up", "Add an agenda note"],
      access: "Read event title and timing; write follow-up notes when selected.",
      symbol: "calendar",
      steps: [
        "Use a team calendar with an agreed owner.",
        "Check the calendar time zone before creating time rules.",
        "Review the first follow-up with the meeting owner.",
      ],
      caution: "A changed meeting time may require a new waiting step; review the flow after rescheduling.",
    },
    {
      id: "talkbarrow",
      name: "Talkbarrow",
      kind: "messages",
      summary: "Team conversations with a place for decisions to land.",
      events: ["Channel message", "Thread marked"],
      actions: ["Post an internal update", "Route a thread"],
      access: "Read the chosen channel; post only into the approved destination.",
      symbol: "chat",
      steps: [
        "Choose one channel for the trigger.",
        "Name the destination team and the type of update.",
        "Agree on a quiet period and an escalation route.",
      ],
      caution: "Avoid a notification for every event. Use a condition to keep important updates visible.",
    },
    {
      id: "formgrove",
      name: "Formgrove",
      kind: "operations",
      summary: "Forms that begin a process with the right amount of information.",
      events: ["Response received", "Response updated"],
      actions: ["Tag a response", "Start a handoff"],
      access: "Read the named form and the fields explicitly mapped to the flow.",
      symbol: "form",
      steps: [
        "Keep the form fields short and specific.",
        "Define the meaning of any urgency or amount field.",
        "Check the consent wording with the process owner.",
      ],
      caution: "Do not collect account credentials or payment details in general workflow forms.",
    },
    {
      id: "taskwren",
      name: "Taskwren",
      kind: "operations",
      summary: "Tasks with an owner, a next step and a visible finish.",
      events: ["Task created", "Stage changed"],
      actions: ["Create a task", "Set a team queue"],
      access: "Read the selected board; create tasks in one named project.",
      symbol: "task",
      steps: [
        "Choose the board and the default owner.",
        "Use a short task title and link to the source event.",
        "Check what should happen when a task already exists.",
      ],
      caution: "A repeated event should not create an unbounded number of duplicate tasks.",
    },
    {
      id: "storebloom",
      name: "Storebloom",
      kind: "commerce",
      summary: "An order workspace for careful internal handoffs.",
      events: ["Order updated", "Shipment recorded"],
      actions: ["Add an internal note", "Route an exception"],
      access: "Read order metadata; write internal notes only.",
      symbol: "store",
      steps: [
        "Choose which order changes should start a flow.",
        "Exclude private payment details from the mapping.",
        "Confirm the review threshold with the operations lead.",
      ],
      caution: "A workflow label is not a payment, shipping or fraud decision.",
    },
    {
      id: "paycairn",
      name: "Paycairn",
      kind: "commerce",
      summary: "An invoice ledger that keeps questions near the record.",
      events: ["Invoice question", "Invoice status changed"],
      actions: ["Add a review note", "Create a question task"],
      access: "Read invoice totals and references; add internal review notes.",
      symbol: "receipt",
      steps: [
        "Map the invoice reference rather than a customer name.",
        "Agree on which questions belong in the review queue.",
        "Have the finance owner check the first set of tasks.",
      ],
      caution: "This connection organizes invoice questions; it does not authorize payments.",
    },
    {
      id: "cloudsprig",
      name: "Cloudsprig",
      kind: "documents",
      summary: "Files and folders with a small, deliberate access boundary.",
      events: ["File added", "Folder changed"],
      actions: ["Add a label", "Create a linked note"],
      access: "Read a selected folder and write labels where approved.",
      symbol: "cloud",
      steps: [
        "Choose a folder with a clear purpose and owner.",
        "Keep file links instead of copying whole documents.",
        "Review access whenever the folder membership changes.",
      ],
      caution: "Do not assume a shared link means a document is suitable for wider processing.",
    },
    {
      id: "pagekestrel",
      name: "Pagekestrel",
      kind: "documents",
      summary: "Published pages with clear review and release steps.",
      events: ["Page review requested", "Page published"],
      actions: ["Create a review task", "Add a publication note"],
      access: "Read page metadata; write review notes into the selected space.",
      symbol: "page",
      steps: [
        "Choose the page space and the review trigger.",
        "Keep approval separate from the notification action.",
        "Make the owner of the publishing decision explicit.",
      ],
      caution: "A successful workflow action must not be treated as editorial or legal approval.",
    },
    {
      id: "notevane",
      name: "Notevane",
      kind: "messages",
      summary: "Short notes that help a team pick up the thread.",
      events: ["Note added", "Note marked ready"],
      actions: ["Create a summary", "Route a note"],
      access: "Read the chosen notebook and create linked notes.",
      symbol: "note",
      steps: [
        "Choose a notebook that contains work suitable for the flow.",
        "Set the naming convention for short summaries.",
        "Keep the original note one click away.",
      ],
      caution: "Summaries are a first pass. Important decisions need the original context and a person.",
    },
  ];
  const TEAM = [
    {
      name: "Devraj Ravikumar",
      role: "Product & process",
      quote:
        "Devraj turns a long process into a few useful questions. He cares about the moment a person picks the work up again.",
      tone: "#d8e1c2",
      hair: "M66 100c-9-75 97-88 107-10-22-10-42-26-49-43-9 27-32 42-58 53Z",
    },
    {
      name: "Thuy Delacruz",
      role: "Engineering & connections",
      quote:
        "Thuy makes the connections readable, predictable and easy to pause. She likes a run log that explains itself.",
      tone: "#e7c0af",
      hair: "M63 151V88c2-66 115-76 115 10v61l-19-17-2-51c-30 5-50-17-51-28-2 22-18 42-34 43v48Z",
    },
    {
      name: "Ngozi Beaumont",
      role: "Customer workflows",
      quote:
        "Ngozi starts with the work a team already understands. She helps people choose a small, reversible first step.",
      tone: "#d1dbed",
      hair: "M68 104C56 6 186 6 174 104c-12-14-22-30-26-46-18 18-46 28-80 46Z",
    },
  ];
  const TEAMS = {
    support: "Customer support",
    operations: "Operations",
    finance: "Finance",
    people: "People",
    marketing: "Marketing",
  };
  const TRIGGERS = {
    email: { label: "A message arrives", channel: "email", note: "A new message begins the sequence." },
    calendar: { label: "A meeting ends", channel: "calendar", note: "A calendar event begins the follow-through." },
    form: { label: "A form is completed", channel: "form", note: "A response begins the handoff." },
    store: { label: "An order changes", channel: "store", note: "A store event begins the internal review." },
    document: { label: "A document is added", channel: "document", note: "A document event begins the review." },
  };
  const CONDITIONS = {
    always: {
      label: "Every event",
      help: "No additional condition. Every event from the selected channel continues.",
      mode: "none",
    },
    urgency: {
      label: "Urgency reaches a level",
      help: "Use a whole number from 1 to 5. Events at or above that level continue.",
      mode: "number",
    },
    amount: {
      label: "Amount reaches a value",
      help: "Use a whole-dollar amount from 0 to 1,000,000. Events at or above it continue.",
      mode: "number",
    },
    contains: {
      label: "Message contains a phrase",
      help: "Use a short phrase. Matching ignores letter case.",
      mode: "text",
    },
    weekday: {
      label: "It is a weekday",
      help: "Monday through Friday in Central time. No calendar or holiday lookup is involved.",
      mode: "none",
    },
  };
  const ACTIONS = {
    classify: {
      label: "Find a useful category",
      ai: true,
      description: "Make a first-pass category from the message. Keep final judgment with a person.",
    },
    summarise: {
      label: "Make a short summary",
      ai: true,
      description: "Keep the first eighteen words beside a link to the original context.",
    },
    tag: {
      label: "Add a clear label",
      ai: false,
      description: "Give the event a consistent label based on the selected team.",
    },
    task: {
      label: "Create a next-action task",
      ai: false,
      description: "Write a short, visible next step for the person picking up the work.",
    },
    notify: {
      label: "Notify the right team",
      ai: false,
      description: "Make a concise internal handoff for the chosen queue.",
    },
    route: {
      label: "Route into a team queue",
      ai: false,
      description: "Choose the team responsible for the next part of the process.",
    },
    wait: {
      label: "Add a waiting checkpoint",
      ai: false,
      description: "Record a planned pause before continuing the process.",
    },
    archive: {
      label: "Keep a linked record",
      ai: false,
      description: "Record a short trace of the event for later review.",
    },
  };
  const QUEUES = {
    operations: "Operations",
    support: "Support",
    finance: "Finance",
    people: "People",
    marketing: "Marketing",
  };
  const PLANS = {
    starter: {
      name: "A useful start",
      base: 2400,
      tasks: 2000,
      editors: 1,
      copy: "For a small team connecting its first few processes.",
    },
    team: {
      name: "Room for the team",
      base: 5900,
      tasks: 8000,
      editors: 5,
      copy: "For shared processes with a few people shaping the flow.",
    },
    studio: {
      name: "A connected studio",
      base: 12900,
      tasks: 20000,
      editors: 15,
      copy: "For several teams keeping their handoffs in view.",
    },
  };
  const PRICING = { taskBlock: 1000, taskPrice: 500, aiBlock: 1000, aiPrice: 300, extraEditor: 600, annualFactor: 0.8 };
  const DEFAULT_PRICE = { plan: "starter", billing: "monthly", runs: 1000, actions: 3, ai: 1, editors: 2 };
  const SYMBOLS = {
    "shared-inbox":
      '<rect x="10" y="17" width="44" height="33" rx="3"/><path d="m10 18 22 17 22-17M10 48l15-15m29 15L40 33"/>',
    table: '<rect x="10" y="11" width="44" height="43" rx="3"/><path d="M10 24h44M10 38h44M25 24v30m15-30v30"/>',
    document: '<path d="M17 7h23l9 10v39H17zM40 7v12h9M25 28h16m-16 9h16m-16 9h10"/>',
    calendar:
      '<rect x="10" y="14" width="44" height="41" rx="4"/><path d="M10 28h44M21 7v15m22-15v15m-22 17h9m7 0h8m-24 9h9"/>',
    chat: '<path d="M8 11h48v35H27L13 56V46H8zM18 24h28m-28 10h19"/>',
    form: '<rect x="15" y="8" width="36" height="49" rx="3"/><path d="M25 20h16M24 31h4m7 0h9m-20 10h4m7 0h9m-20 9h17"/>',
    task: '<path d="M14 10h39v46H14zM24 8h18v8H24zM23 32l6 6 14-16M24 47h19"/>',
    store: '<path d="M9 26h46v30H9zM6 26l7-17h38l7 17M18 27V9m13 18V9m14 18V9M20 56V38h24v18"/>',
    receipt: '<path d="M15 7h34v50l-8-5-8 5-8-5-10 5zM24 21h16m-16 9h16m-16 9h9"/>',
    cloud: '<path d="M17 47C1 46 6 24 20 25 19 3 52 4 51 25c17 0 16 23 0 23H17Z"/><path d="m24 34 8-9 8 9m-8-9v28"/>',
    page: '<rect x="8" y="10" width="48" height="44" rx="3"/><path d="M8 23h48M16 17h1m6 0h1m6 0h1M17 32h11v12H17zM35 32h13m-13 9h13"/>',
    note: '<path d="M12 9h41v35L40 57H12zM40 57V43h13M22 21h21m-21 10h21m-21 10h11"/>',
  };
  const own = (map, key) => typeof key === "string" && Object.prototype.hasOwnProperty.call(map, key);
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
    );
  const cleanText = (value, max = 100) =>
    typeof value === "string"
      ? value
          .replace(/[\u0000-\u001f\u007f]/g, "")
          .trim()
          .slice(0, max)
      : "";
  const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  const clamp = (raw, min, max, fallback = min) => {
    if (typeof raw !== "string" && typeof raw !== "number") return fallback;
    const number = Number(raw);
    return Number.isFinite(number) ? Math.min(max, Math.max(min, Math.floor(number))) : fallback;
  };
  const money = (pence) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: pence % 100 ? 2 : 0,
      maximumFractionDigits: 2,
    }).format(pence / 100);
  const plural = (count, word, other = word + "s") => `${count} ${count === 1 ? word : other}`;
  const RECIPE_MAP = Object.fromEntries(RECIPES.map((recipe) => [recipe.id, recipe]));
  const params = new URLSearchParams(location.search);
  function validParam(name, map, fallback) {
    const value = params.get(name);
    return value !== null && own(map, value) ? value : fallback;
  }
  function icon(symbol) {
    return `<svg viewBox="0 0 64 64" class="size-16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${own(SYMBOLS, symbol) ? SYMBOLS[symbol] : SYMBOLS.task}</svg>`;
  }
  const safeStorage = (() => {
    const memory = new Map();
    let available = true;
    return {
      getItem(key) {
        if (available) {
          try {
            const value = window.localStorage.getItem(key);
            if (value !== null) memory.set(key, value);
            return value;
          } catch {
            available = false;
          }
        }
        return memory.has(key) ? memory.get(key) : null;
      },
      setItem(key, value) {
        memory.set(key, String(value));
        if (available) {
          try {
            window.localStorage.setItem(key, String(value));
          } catch {
            available = false;
          }
        }
      },
      removeItem(key) {
        memory.delete(key);
        if (available) {
          try {
            window.localStorage.removeItem(key);
          } catch {
            available = false;
          }
        }
      },
    };
  })();
  function readJSON(key) {
    const value = safeStorage.getItem(key);
    if (value === null) return null;
    try {
      const parsed = JSON.parse(value);
      if (parsed === null) safeStorage.removeItem(key);
      return parsed;
    } catch {
      safeStorage.removeItem(key);
      return null;
    }
  }
  function writeJSON(key, value) {
    safeStorage.setItem(key, JSON.stringify(value));
  }
  function favourites() {
    const raw = readJSON(STORAGE_KEYS.favourites);
    const clean = Array.isArray(raw)
      ? [...new Set(raw.filter((id) => typeof id === "string" && own(RECIPE_MAP, id)))].slice(0, 12)
      : [];
    if (raw !== null) writeJSON(STORAGE_KEYS.favourites, clean);
    return clean;
  }
  function recipeFlow(recipe) {
    return {
      name: recipe.title,
      trigger: recipe.trigger,
      condition: recipe.condition,
      value: recipe.value,
      actions: recipe.actions.map((type) => ({ type, team: own(QUEUES, recipe.team) ? recipe.team : "operations" })),
    };
  }
  function defaultFlow() {
    return recipeFlow(RECIPES[0]);
  }
  function cleanFlow(raw) {
    const fallback = defaultFlow();
    if (!isRecord(raw)) return fallback;
    const trigger = own(TRIGGERS, raw.trigger) ? raw.trigger : fallback.trigger;
    const condition = own(CONDITIONS, raw.condition) ? raw.condition : "always";
    let value = cleanText(raw.value, 80);
    if (condition === "urgency") value = String(clamp(value, 1, 5, 3));
    if (condition === "amount") value = String(clamp(value, 0, 1000000, 100));
    if (CONDITIONS[condition].mode === "none") value = "";
    const actions = Array.isArray(raw.actions)
      ? raw.actions
          .filter((action) => isRecord(action) && own(ACTIONS, action.type))
          .slice(0, 6)
          .map((action) => ({ type: action.type, team: own(QUEUES, action.team) ? action.team : "operations" }))
      : fallback.actions;
    return { name: cleanText(raw.name, 60) || "My useful flow", trigger, condition, value, actions };
  }
  function readDraft() {
    const raw = readJSON(STORAGE_KEYS.draft);
    const clean = cleanFlow(raw);
    if (raw !== null) writeJSON(STORAGE_KEYS.draft, clean);
    return clean;
  }
  function readFlows() {
    const raw = readJSON(STORAGE_KEYS.flows),
      rows = [];
    if (Array.isArray(raw))
      raw.slice(0, 12).forEach((item) => {
        // A record without a usable flow (wrong shape or no valid action) is dropped, not filled with defaults.
        if (
          !isRecord(item) ||
          typeof item.id !== "string" ||
          !/^wf-[a-z0-9-]{6,40}$/.test(item.id) ||
          rows.some((row) => row.id === item.id) ||
          !isRecord(item.flow) ||
          !Array.isArray(item.flow.actions) ||
          !item.flow.actions.some((action) => isRecord(action) && own(ACTIONS, action.type))
        )
          return;
        rows.push({ id: item.id, flow: cleanFlow(item.flow) });
      });
    const clean = rows.slice(0, 8);
    if (raw !== null) writeJSON(STORAGE_KEYS.flows, clean);
    return clean;
  }
  function cleanPricing(raw) {
    raw = isRecord(raw) ? raw : DEFAULT_PRICE;
    const actions = clamp(raw.actions, 1, 6, 3);
    return {
      plan: own(PLANS, raw.plan) ? raw.plan : "starter",
      billing: raw.billing === "annual" ? "annual" : "monthly",
      runs: clamp(raw.runs, 0, 1000000, 1000),
      actions,
      ai: clamp(raw.ai, 0, actions, 1),
      editors: clamp(raw.editors, 1, 100, 2),
    };
  }
  let noticeTimer;
  function announce(message) {
    const notice = $("#notice");
    clearTimeout(noticeTimer);
    notice.textContent = message;
    notice.hidden = false;
    noticeTimer = setTimeout(() => {
      notice.hidden = true;
    }, 4500);
  }
  function saveButton(recipe) {
    const saved = favourites().includes(recipe.id);
    return `<button type="button" data-save-recipe="${recipe.id}" aria-pressed="${saved}" aria-label="${saved ? "Saved" : "Save"}: ${esc(recipe.title)}" class="save-button">${saved ? "Saved" : "Save"}</button>`;
  }
  function recipeCard(recipe, heading = "h3", darkLabel = false) {
    const ai = recipe.actions.filter((type) => ACTIONS[type].ai).length;
    return `<article class="recipe-card" data-recipe-card="${recipe.id}"><a href="recipe.html?recipe=${recipe.id}" class="block overflow-hidden border border-ink"><img src="assets/img/${recipe.art}" width="420" height="260" alt="Drawn process diagram for ${esc(recipe.title)}" class="w-full transition duration-300 hover:scale-[1.025] motion-reduce:transition-none"></a><div class="mt-4 flex items-center justify-between gap-3"><p class="eyebrow ${darkLabel ? "text-ink" : "text-coral"}">${esc(TEAMS[recipe.team])}</p><p class="text-xs text-muted">${plural(recipe.actions.length, "action")}${ai ? " / " + plural(ai, "AI step") : " / Rules only"}</p></div><${heading} class="mt-3 font-display text-2xl leading-tight"><a href="recipe.html?recipe=${recipe.id}" class="hover:underline underline-offset-4">${esc(recipe.title)}</a></${heading}><p class="mt-4 text-sm leading-relaxed text-muted">${esc(recipe.summary)}</p><div class="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-ink pt-4"><a href="recipe.html?recipe=${recipe.id}" class="text-link text-sm">Read the recipe</a>${saveButton(recipe)}</div></article>`;
  }
  function refreshSaveButtons() {
    const ids = favourites();
    $$("[data-save-recipe]").forEach((button) => {
      const id = button.dataset.saveRecipe;
      if (!own(RECIPE_MAP, id)) return;
      const saved = ids.includes(id);
      button.textContent = saved ? "Saved" : "Save";
      button.setAttribute("aria-pressed", String(saved));
      button.setAttribute("aria-label", `${saved ? "Saved" : "Save"}: ${RECIPE_MAP[id].title}`);
    });
  }
  function initRecipeSaves() {
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-save-recipe]");
      if (!button || !own(RECIPE_MAP, button.dataset.saveRecipe)) return;
      const id = button.dataset.saveRecipe,
        ids = favourites();
      writeJSON(STORAGE_KEYS.favourites, ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);
      refreshSaveButtons();
      document.dispatchEvent(new CustomEvent("weftiq:saved"));
      announce(favourites().includes(id) ? "Recipe saved for another look." : "Recipe removed from your saved list.");
    });
  }
  function initRecipes() {
    const form = $("[data-recipe-filters]");
    if (!form) return;
    form.elements.team.value = validParam("team", TEAMS, "all");
    const query = cleanText(params.get("q"), 100);
    form.elements.q.value = query;
    function render() {
      const search = form.elements.q.value.trim().toLowerCase(),
        team = form.elements.team.value,
        view = form.elements.view.value,
        saved = favourites();
      const items = RECIPES.filter((recipe) => {
        const match = `${recipe.title} ${recipe.summary} ${TEAMS[recipe.team]}`.toLowerCase().includes(search);
        return (
          match &&
          (team === "all" || recipe.team === team) &&
          (view !== "saved" || saved.includes(recipe.id)) &&
          (view !== "ai" || recipe.actions.some((type) => ACTIONS[type].ai)) &&
          (view !== "rules" || recipe.actions.every((type) => !ACTIONS[type].ai))
        );
      });
      $("[data-recipe-grid]").innerHTML = items.map((recipe) => recipeCard(recipe, "h2")).join("");
      $("[data-recipe-count]").textContent =
        `${plural(items.length, "recipe")} to consider${view === "saved" ? " from your saved list" : ""}.`;
      $("[data-recipe-empty]").hidden = items.length > 0;
    }
    form.addEventListener("submit", (event) => event.preventDefault());
    // Selects also emit input; avoid rebuilding results on a search field's blur.
    form.addEventListener("input", render);
    document.addEventListener("weftiq:saved", () => {
      if (form.elements.view.value === "saved") {
        render();
        form.elements.view.focus();
      }
    });
    $("[data-reset-recipes]").addEventListener("click", () => {
      form.reset();
      render();
      form.elements.q.focus();
    });
    render();
  }
  function initRecipeDetail() {
    const root = $("[data-recipe-detail]");
    if (!root) return;
    const id = validParam("recipe", RECIPE_MAP, RECIPES[0].id),
      recipe = RECIPE_MAP[id];
    document.title = recipe.title + " — Weftiq";
    root.innerHTML = `<div class="grid gap-10 lg:grid-cols-2"><div><img src="assets/img/${recipe.art}" width="420" height="260" class="w-full border border-ink" alt="Drawn workflow for ${esc(recipe.title)}"><div class="mt-6 border-y border-ink py-5"><p class="eyebrow">A PERSON STILL MATTERS</p><p class="mt-3 text-sm leading-relaxed">${esc(recipe.care)}</p></div></div><div><p class="eyebrow text-coral">${esc(TEAMS[recipe.team])} / A SMALL CONNECTION</p><h1 class="mt-5 font-display text-4xl leading-tight sm:text-5xl">${esc(recipe.title)}</h1><p class="mt-5 text-lg leading-relaxed text-muted">${esc(recipe.summary)}</p><p class="mt-5 leading-relaxed">${esc(recipe.story)}</p><div class="mt-7 flex flex-wrap gap-3"><a href="builder.html?recipe=${recipe.id}" class="btn">Make this flow your own</a>${saveButton(recipe)}</div><p class="mt-5 text-xs text-muted">${plural(recipe.actions.length, "action")} / ${plural(recipe.actions.filter((type) => ACTIONS[type].ai).length, "AI step")}</p></div></div><section class="mt-12" aria-labelledby="recipe-steps"><h2 id="recipe-steps" class="font-display text-4xl">Follow the thread.</h2><ol class="mt-7 grid gap-5 md:grid-cols-2"><li class="border border-ink bg-white p-6"><p class="eyebrow">THE TRIGGER</p><h3 class="mt-3 font-display text-2xl">${esc(TRIGGERS[recipe.trigger].label)}</h3><p class="mt-3 text-sm">${esc(TRIGGERS[recipe.trigger].note)}</p></li><li class="border border-ink bg-lemon p-6"><p class="eyebrow">THE CONDITION</p><h3 class="mt-3 font-display text-2xl">${esc(CONDITIONS[recipe.condition].label)}</h3><p class="mt-3 text-sm">${recipe.value ? "Rule value: " + esc(recipe.value) + ". " : ""}${esc(CONDITIONS[recipe.condition].help)}</p></li>${recipe.actions.map((type, index) => `<li class="border border-ink p-6"><p class="eyebrow">ACTION ${index + 1} / ${ACTIONS[type].ai ? "AI FIRST PASS" : "A CLEAR RULE"}</p><h3 class="mt-3 font-display text-2xl">${esc(ACTIONS[type].label)}</h3><p class="mt-3 text-sm leading-relaxed">${esc(ACTIONS[type].description)}</p></li>`).join("")}</ol></section>`;
    $("[data-related-recipes]").innerHTML = RECIPES.filter((item) => item.id !== id)
      .slice(0, 3)
      .map((item) => recipeCard(item, "h3", true))
      .join("");
  }
  function options(map, value) {
    return Object.entries(map)
      .map(
        ([id, item]) =>
          `<option value="${id}"${value === id ? " selected" : ""}>${esc(typeof item === "string" ? item : item.label)}</option>`,
      )
      .join("");
  }
  function runCondition(flow, event) {
    if (event.channel !== TRIGGERS[flow.trigger].channel)
      return {
        matched: false,
        reason: `The ${event.channel} event does not match this ${TRIGGERS[flow.trigger].channel} trigger.`,
      };
    if (flow.condition === "always") return { matched: true, reason: "Every event from this channel continues." };
    if (flow.condition === "urgency")
      return {
        matched: event.urgency >= Number(flow.value),
        reason: `Urgency ${event.urgency} checked against level ${flow.value}.`,
      };
    if (flow.condition === "amount")
      return {
        matched: event.amount >= Number(flow.value),
        reason: `Amount ${money(event.amount * 100)} checked against ${money(Number(flow.value) * 100)}.`,
      };
    if (flow.condition === "contains")
      return {
        matched: flow.value.length > 0 && event.message.toLowerCase().includes(flow.value.toLowerCase()),
        reason: flow.value
          ? `Message checked for “${flow.value}”, ignoring letter case.`
          : "The phrase is empty; add a rule value before continuing.",
      };
    const day = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, weekday: "short" }).format(new Date());
    return { matched: !["Sat", "Sun"].includes(day), reason: `${day} checked against Monday–Friday in Central time.` };
  }
  function categoryFor(message) {
    const text = message.toLowerCase();
    if (/invoice|payment|bill|refund/.test(text)) return "Finance question";
    if (/help|support|broken|problem/.test(text)) return "Support request";
    if (/join|starter|hire|access|people/.test(text)) return "People process";
    if (/order|dispatch|shipment|delivery/.test(text)) return "Operations handoff";
    if (/feedback|read|publish|campaign/.test(text)) return "Marketing note";
    return "General team work";
  }
  // Shortens text on a word boundary and marks the cut with an ellipsis.
  function excerpt(text, max) {
    const clean = text.replace(/\s+/g, " ").trim();
    if (clean.length <= max) return clean;
    const cut = clean.slice(0, max + 1),
      space = cut.lastIndexOf(" ");
    return (space > max * 0.5 ? cut.slice(0, space) : clean.slice(0, max)).replace(/[\s,.;:!?–—-]+$/, "") + "…";
  }
  function actionOutput(action, event, index) {
    const team = QUEUES[action.team],
      category = categoryFor(event.message);
    if (action.type === "classify")
      return `First-pass category: ${category}. Review the source before a sensitive decision.`;
    if (action.type === "summarise") return `Summary: ${excerpt(event.message, 120)}`;
    if (action.type === "tag") return `Label: ${action.team}-review. Category context: ${category}.`;
    if (action.type === "task") return `Task for ${team}: follow up “${excerpt(event.message, 56)}”`;
    if (action.type === "notify")
      return `Internal handoff for ${team}: ${category.toLowerCase()}, urgency ${event.urgency}.`;
    if (action.type === "route") return `Destination queue: ${team}. Keep the source event attached.`;
    if (action.type === "wait")
      return `Waiting checkpoint recorded after action ${index + 1}. A person decides when the process continues.`;
    return `Filed with a link back: ${event.channel} / ${category} / ${team}.`;
  }
  function initBuilder() {
    if (!$("[data-flow-nodes]")) return;
    let flow = own(RECIPE_MAP, params.get("recipe")) ? recipeFlow(RECIPE_MAP[params.get("recipe")]) : readDraft();
    // The recipe is applied once: drop ?recipe= so a reload keeps the edited draft.
    if (params.has("recipe")) {
      const rest = new URLSearchParams(location.search);
      rest.delete("recipe");
      try {
        history.replaceState(history.state, "", location.pathname + (rest.size ? "?" + rest : "") + location.hash);
      } catch {
        /* Some sandboxed frames refuse URL changes; the draft is still saved. */
      }
    }
    const name = $("[data-flow-name]"),
      trigger = $("[data-trigger]"),
      condition = $("[data-condition]"),
      value = $("[data-rule-value]"),
      root = $("[data-flow-nodes]");
    function persist() {
      writeJSON(STORAGE_KEYS.draft, cleanFlow(flow));
    }
    function ruleInput() {
      const setting = CONDITIONS[flow.condition];
      $("[data-rule-value-label]").hidden = setting.mode === "none";
      $("[data-rule-help]").textContent = setting.help;
      value.type = setting.mode === "number" ? "number" : "text";
      value.min = flow.condition === "urgency" ? "1" : "0";
      value.max = flow.condition === "urgency" ? "5" : "1000000";
      value.value = flow.value;
    }
    function renderNodes() {
      root.innerHTML = flow.actions.length
        ? flow.actions
            .map(
              (action, index) =>
                `<article class="node-line border border-ink bg-white p-5" data-node="${index}"><div class="flex flex-wrap items-center justify-between gap-3"><h3 class="font-display text-2xl">${String(index + 1).padStart(2, "0")} / ${ACTIONS[action.type].ai ? "A little AI help" : "A clear action"}</h3><div class="flex gap-2"><button type="button" data-move-node="${index}" data-direction="up" class="save-button"${index === 0 ? " disabled" : ""} aria-label="Up: move action ${index + 1} earlier">Up</button><button type="button" data-move-node="${index}" data-direction="down" class="save-button"${index === flow.actions.length - 1 ? " disabled" : ""} aria-label="Down: move action ${index + 1} later">Down</button><button type="button" data-remove-node="${index}" class="save-button" aria-label="Remove: action ${index + 1}">Remove</button></div></div><div class="mt-5 grid gap-4 sm:grid-cols-2"><label class="label" for="action-${index}">The action<select id="action-${index}" data-node-type="${index}" class="field">${options(ACTIONS, action.type)}</select></label><label class="label" for="team-${index}">The team<select id="team-${index}" data-node-team="${index}" class="field">${options(QUEUES, action.team)}</select></label></div><p class="mt-4 text-sm leading-relaxed text-muted">${esc(ACTIONS[action.type].description)}</p></article>`,
            )
            .join("")
        : '<div class="border border-ink bg-white p-7"><h3 class="font-display text-2xl">Leave room for an action.</h3><p class="mt-4 text-sm">Choose a useful next step below. A flow needs at least one action before it can run.</p></div>';
      $("[data-node-count]").textContent =
        `${plural(flow.actions.length, "action")} / ${plural(flow.actions.filter((action) => ACTIONS[action.type].ai).length, "AI step")}`;
      $("[data-add-node] button").disabled = flow.actions.length >= 6;
    }
    function renderSaved() {
      const rows = readFlows();
      $("[data-saved-flows]").innerHTML = rows.length
        ? rows
            .map(
              (row) =>
                `<div class="flex flex-wrap items-center justify-between gap-4 border-t border-ink pt-4"><div class="min-w-0 flex-1"><p class="font-semibold break-words">${esc(row.flow.name)}</p><p class="mt-1 text-xs text-muted">${plural(row.flow.actions.length, "action")} / ${esc(TRIGGERS[row.flow.trigger].label)}</p></div><div class="flex gap-3"><button data-load-flow="${row.id}" type="button" class="save-button" aria-label="Load: ${esc(row.flow.name)}">Load</button><button data-delete-flow="${row.id}" type="button" class="save-button" aria-label="Remove: ${esc(row.flow.name)}">Remove</button></div></div>`,
            )
            .join("")
        : '<p class="text-sm">Save a named flow to keep it here. You can keep up to eight.</p>';
    }
    function syncFields() {
      name.value = flow.name;
      trigger.innerHTML = options(TRIGGERS, flow.trigger);
      condition.innerHTML = options(CONDITIONS, flow.condition);
      $("[data-new-action]").innerHTML = options(ACTIONS, "task");
      $("[data-run-form]").elements.channel.value = TRIGGERS[flow.trigger].channel;
      ruleInput();
      renderNodes();
      renderSaved();
      persist();
    }
    name.addEventListener("input", () => {
      flow.name = cleanText(name.value, 60) || "My useful flow";
      persist();
    });
    trigger.addEventListener("change", () => {
      if (!own(TRIGGERS, trigger.value)) return;
      flow.trigger = trigger.value;
      $("[data-run-form]").elements.channel.value = TRIGGERS[flow.trigger].channel;
      persist();
    });
    condition.addEventListener("change", () => {
      if (!own(CONDITIONS, condition.value)) return;
      flow.condition = condition.value;
      flow.value =
        condition.value === "urgency"
          ? "3"
          : condition.value === "amount"
            ? "100"
            : condition.value === "contains"
              ? "help"
              : "";
      ruleInput();
      persist();
    });
    value.addEventListener("change", () => {
      flow.value = value.value;
      flow = cleanFlow(flow);
      value.value = flow.value;
      persist();
    });
    $("[data-add-node]").addEventListener("submit", (event) => {
      event.preventDefault();
      const type = $("[data-new-action]").value;
      if (flow.actions.length >= 6 || !own(ACTIONS, type)) return;
      flow.actions.push({ type, team: "operations" });
      persist();
      renderNodes();
      $(`[data-node-type="${flow.actions.length - 1}"]`).focus();
      announce("Action added to your flow.");
    });
    root.addEventListener("change", (event) => {
      if (own(event.target.dataset, "nodeType")) {
        const index = clamp(event.target.dataset.nodeType, 0, 5);
        if (!flow.actions[index] || !own(ACTIONS, event.target.value)) return;
        flow.actions[index].type = event.target.value;
        persist();
        renderNodes();
        $(`[data-node-type="${index}"]`).focus();
      }
      if (own(event.target.dataset, "nodeTeam")) {
        const index = clamp(event.target.dataset.nodeTeam, 0, 5);
        if (!flow.actions[index] || !own(QUEUES, event.target.value)) return;
        flow.actions[index].team = event.target.value;
        persist();
      }
    });
    root.addEventListener("click", (event) => {
      const remove = event.target.closest("[data-remove-node]"),
        move = event.target.closest("[data-move-node]");
      if (remove) {
        const index = clamp(remove.dataset.removeNode, 0, 5);
        flow.actions.splice(index, 1);
        persist();
        renderNodes();
        ($(`[data-remove-node="${Math.min(index, flow.actions.length - 1)}"]`) || $("[data-new-action]")).focus();
        announce("Action removed from your flow.");
      }
      if (move) {
        const index = clamp(move.dataset.moveNode, 0, 5),
          next = index + (move.dataset.direction === "up" ? -1 : 1);
        if (!flow.actions[index] || next < 0 || next >= flow.actions.length) return;
        [flow.actions[index], flow.actions[next]] = [flow.actions[next], flow.actions[index]];
        persist();
        renderNodes();
        $(`[data-node-type="${next}"]`).focus();
        announce("Action moved in the sequence.");
      }
    });
    $("[data-save-flow]").addEventListener("click", () => {
      if (!flow.actions.length) {
        announce("Add at least one action before saving your flow.");
        return;
      }
      flow = cleanFlow(flow);
      name.value = flow.name;
      const rows = readFlows(),
        index = rows.findIndex((row) => row.flow.name.toLowerCase() === flow.name.toLowerCase());
      const row = {
        id: index >= 0 ? rows[index].id : `wf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
        flow: cleanFlow(flow),
      };
      if (index >= 0) rows[index] = row;
      else if (rows.length < 8) rows.push(row);
      else {
        announce("There are eight saved flows. Remove one before saving another name.");
        return;
      }
      writeJSON(STORAGE_KEYS.flows, rows);
      persist();
      renderSaved();
      $("[data-save-flow-status]").textContent =
        `${flow.name} is saved. ${plural(readFlows().length, "named flow")} ready to return to.`;
    });
    $("[data-saved-flows]").addEventListener("click", (event) => {
      const load = event.target.closest("[data-load-flow]"),
        remove = event.target.closest("[data-delete-flow]");
      if (load) {
        const item = readFlows().find((row) => row.id === load.dataset.loadFlow);
        if (!item) return;
        flow = cleanFlow(item.flow);
        syncFields();
        name.focus();
        announce(`${flow.name} loaded into the workbench.`);
      }
      if (remove) {
        writeJSON(
          STORAGE_KEYS.flows,
          readFlows().filter((row) => row.id !== remove.dataset.deleteFlow),
        );
        renderSaved();
        ($("[data-delete-flow]") || $("[data-save-flow]")).focus();
        announce("Named flow removed.");
      }
    });
    $("[data-new-flow]").addEventListener("click", () => {
      flow = {
        name: "My next useful flow",
        trigger: "form",
        condition: "always",
        value: "",
        actions: [{ type: "task", team: "operations" }],
      };
      syncFields();
      name.focus();
      announce("A fresh flow is ready.");
    });
    $("[data-run-form]").addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget,
        message = form.elements.message.value.trim(),
        amount = Number(form.elements.amount.value),
        channel = form.elements.channel.value;
      const error = $("[data-run-error]");
      error.textContent = "";
      if (message.length < 5 || message.length > 1000) {
        error.textContent = "Add a message of 5–1,000 characters to follow through the flow.";
        form.elements.message.focus();
        return;
      }
      if (!Number.isFinite(amount) || amount < 0 || amount > 1000000) {
        error.textContent = "Use an amount from $0 to $1,000,000.";
        form.elements.amount.focus();
        return;
      }
      if (!flow.actions.length) {
        error.textContent = "Add at least one action before running the event.";
        $("[data-new-action]").focus();
        return;
      }
      if (!["email", "form", "calendar", "store", "document"].includes(channel)) return;
      const input = { message, amount, channel, urgency: clamp(form.elements.urgency.value, 1, 5, 3) },
        match = runCondition(flow, input);
      const tasks = match.matched ? flow.actions.length : 0,
        credits = match.matched ? flow.actions.filter((action) => ACTIONS[action.type].ai).length : 0;
      $("[data-run-output]").innerHTML =
        `<p class="eyebrow">THE RUN LOG</p><h2 class="mt-4 font-display text-3xl">${match.matched ? "A clear route through." : "A useful place to pause."}</h2><p class="mt-4 text-sm" data-run-summary>${plural(tasks, "task")} / ${plural(credits, "AI step")} / ${match.matched ? "Rule matched" : "Rule did not match"}</p><div class="mt-5 border-y border-ink py-4"><h3 class="font-semibold">The condition</h3><p class="mt-2 break-words text-sm">${esc(match.reason)}</p></div><ol class="mt-4 space-y-4">${flow.actions.map((action, index) => `<li class="border-b border-rule pb-4"><div class="flex flex-wrap justify-between gap-3"><h3 class="font-semibold">${index + 1}. ${esc(ACTIONS[action.type].label)}</h3><span class="text-xs font-semibold">${match.matched ? "Completed" : "Skipped"}</span></div><p class="mt-3 break-words text-sm leading-relaxed">${match.matched ? esc(actionOutput(action, input, index)) : "The condition did not match, so this action did not run."}</p></li>`).join("")}</ol><p class="mt-5 text-xs leading-relaxed text-muted">Test run in the sandbox: your tools weren’t touched.</p>`;
      $("[data-run-output]").focus();
    });
    syncFields();
  }
  function priceFor(settings) {
    const plan = PLANS[settings.plan],
      tasks = settings.runs * settings.actions,
      credits = settings.runs * settings.ai;
    const planFee = Math.round(plan.base * (settings.billing === "annual" ? PRICING.annualFactor : 1));
    const extraTasks = Math.max(0, tasks - plan.tasks),
      taskBlocks = Math.ceil(extraTasks / PRICING.taskBlock),
      aiBlocks = Math.ceil(credits / PRICING.aiBlock),
      extraEditors = Math.max(0, settings.editors - plan.editors);
    const taskFee = taskBlocks * PRICING.taskPrice,
      aiFee = aiBlocks * PRICING.aiPrice,
      editorFee = extraEditors * PRICING.extraEditor;
    return {
      tasks,
      credits,
      planFee,
      extraTasks,
      taskBlocks,
      aiBlocks,
      extraEditors,
      taskFee,
      aiFee,
      editorFee,
      total: planFee + taskFee + aiFee + editorFee,
    };
  }
  // The pricing assumptions travel to contact.html as plain, validated query parameters.
  function estimateQuery(settings) {
    const query = new URLSearchParams({ topic: "plan" });
    Object.keys(DEFAULT_PRICE).forEach((key) => query.set(key, String(settings[key])));
    return query.toString();
  }
  function estimateFromParams() {
    if (!own(PLANS, params.get("plan"))) return null;
    const raw = {};
    Object.keys(DEFAULT_PRICE).forEach((key) => {
      if (params.has(key)) raw[key] = params.get(key);
    });
    return cleanPricing({ ...DEFAULT_PRICE, ...raw });
  }
  function estimateText(settings) {
    const cost = priceFor(settings);
    return `${PLANS[settings.plan].name}, ${settings.billing} billing: ${settings.runs.toLocaleString("en-US")} ${settings.runs === 1 ? "run" : "runs"} a month, ${plural(settings.actions, "action")} per run (${settings.ai} using AI), ${plural(settings.editors, "editor")}. Estimated ${money(cost.total)} a month, excluding sales tax.`;
  }
  function initPricing() {
    const cards = $("[data-plan-cards]");
    if (!cards) return;
    cards.innerHTML = Object.entries(PLANS)
      .map(
        ([id, plan], index) =>
          `<article class="border border-ink ${index === 1 ? "bg-peach" : "bg-white"} p-7"><p class="eyebrow">${index === 0 ? "A SMALL BEGINNING" : index === 1 ? "SHARED WORK" : "MORE CONNECTIONS"}</p><h2 class="mt-5 font-display text-3xl">${esc(plan.name)}</h2><p class="mt-4 min-h-14 text-sm leading-relaxed">${esc(plan.copy)}</p><p class="mt-6 font-display text-5xl">${money(plan.base)}<span class="ml-1 font-sans text-sm">/ month</span></p><p class="mt-2 text-xs text-muted">Excluding sales tax</p><ul class="mt-6 space-y-3 border-t border-ink pt-5 text-sm"><li>${plan.tasks.toLocaleString("en-US")} included tasks</li><li>${plural(plan.editors, "flow editor")}</li><li>All twelve workflow recipes</li><li>AI credits priced separately</li></ul><button data-pick-plan="${id}" class="btn btn-outline mt-7 w-full" type="button">Calculate this plan</button></article>`,
      )
      .join("");
    const form = $("[data-price-form]");
    const raw = readJSON(STORAGE_KEYS.pricing);
    let settings = cleanPricing(raw);
    if (raw !== null) writeJSON(STORAGE_KEYS.pricing, settings);
    form.elements.plan.innerHTML = Object.entries(PLANS)
      .map(([id, plan]) => `<option value="${id}">${esc(plan.name)}</option>`)
      .join("");
    function fields() {
      Object.entries(settings).forEach(([key, val]) => {
        form.elements[key].value = val;
      });
    }
    function render() {
      const cost = priceFor(settings),
        plan = PLANS[settings.plan];
      $("[data-price-breakdown]").innerHTML =
        `<dl class="space-y-4"><div class="flex justify-between gap-4"><dt>Plan fee</dt><dd>${money(cost.planFee)}</dd></div><div class="flex justify-between gap-4"><dt>${cost.tasks.toLocaleString("en-US")} tasks / ${plan.tasks.toLocaleString("en-US")} included</dt><dd>${money(cost.taskFee)}</dd></div><div class="flex justify-between gap-4"><dt>${cost.credits.toLocaleString("en-US")} AI credits</dt><dd>${money(cost.aiFee)}</dd></div><div class="flex justify-between gap-4"><dt>${plural(cost.extraEditors, "extra editor")}</dt><dd>${money(cost.editorFee)}</dd></div><div class="flex justify-between gap-4 border-t border-ink pt-5 text-xl font-semibold"><dt>Estimated month<span class="block text-xs font-normal">Excluding sales tax</span></dt><dd data-price-total>${money(cost.total)}</dd></div></dl>`;
      $("[data-annual-cost]").textContent =
        settings.billing === "annual"
          ? `The plan portion is paid annually: ${money(cost.planFee * 12)}. This monthly usage estimate is ${money(cost.total * 12)} across a full year if assumptions stay the same.`
          : "Monthly billing. Switch to annual billing to compare a 20% reduction on the plan fee.";
      $("[data-plan-enquiry]").href = `contact.html?${estimateQuery(settings)}`;
    }
    form.addEventListener("submit", (event) => event.preventDefault());
    // While a number field is empty or half typed, keep the last good estimate instead of treating it as 0.
    const unfinished = () =>
      ["runs", "actions", "ai", "editors"].some(
        (key) => form.elements[key].value.trim() === "" || !Number.isFinite(Number(form.elements[key].value)),
      );
    form.addEventListener("input", () => {
      if (unfinished()) return;
      settings = cleanPricing(Object.fromEntries(new FormData(form)));
      form.elements.ai.max = settings.actions;
      if (Number(form.elements.ai.value) > settings.actions) form.elements.ai.value = settings.ai;
      writeJSON(STORAGE_KEYS.pricing, settings);
      render();
    });
    form.addEventListener("change", () => {
      if (!unfinished()) settings = cleanPricing(Object.fromEntries(new FormData(form)));
      fields();
      writeJSON(STORAGE_KEYS.pricing, settings);
      render();
    });
    $$("[data-pick-plan]").forEach((button) =>
      button.addEventListener("click", () => {
        settings.plan = button.dataset.pickPlan;
        fields();
        writeJSON(STORAGE_KEYS.pricing, settings);
        render();
        form.elements.plan.focus();
      }),
    );
    $("[data-reset-price]").addEventListener("click", () => {
      settings = { ...DEFAULT_PRICE };
      fields();
      writeJSON(STORAGE_KEYS.pricing, settings);
      render();
      form.elements.runs.focus();
    });
    fields();
    render();
  }
  function integrationCard(item) {
    return `<article class="border border-ink bg-white p-6"><div class="flex items-start justify-between gap-5">${icon(item.symbol)}<span class="eyebrow text-coral">${esc(item.kind)}</span></div><h2 class="mt-5 font-display text-3xl">${esc(item.name)}</h2><p class="mt-4 text-sm leading-relaxed text-muted">${esc(item.summary)}</p><details class="mt-6 border-t border-ink pt-4"><summary class="text-sm font-semibold">Connection details</summary><div class="mt-5"><h3 class="font-semibold">Events</h3><ul class="mt-2 list-disc space-y-1 pl-5 text-sm">${item.events.map((event) => `<li>${esc(event)}</li>`).join("")}</ul><h3 class="mt-5 font-semibold">Actions</h3><ul class="mt-2 list-disc space-y-1 pl-5 text-sm">${item.actions.map((action) => `<li>${esc(action)}</li>`).join("")}</ul><h3 class="mt-5 font-semibold">Access required</h3><p class="mt-2 text-sm leading-relaxed">${esc(item.access)}</p><h3 class="mt-5 font-semibold">Set it up carefully</h3><ol class="mt-2 list-decimal space-y-2 pl-5 text-sm leading-relaxed">${item.steps.map((step) => `<li>${esc(step)}</li>`).join("")}</ol><p class="mt-5 border-t border-rule pt-4 text-sm leading-relaxed">${esc(item.caution)}</p></div></details></article>`;
  }
  function initIntegrations() {
    const form = $("[data-integration-filters]");
    if (!form) return;
    function render() {
      const query = form.elements.q.value.trim().toLowerCase(),
        kind = form.elements.kind.value;
      const items = INTEGRATIONS.filter(
        (item) =>
          (kind === "all" || item.kind === kind) &&
          `${item.name} ${item.summary} ${item.events.join(" ")} ${item.actions.join(" ")}`
            .toLowerCase()
            .includes(query),
      );
      $("[data-integration-grid]").innerHTML = items.map(integrationCard).join("");
      $("[data-integration-count]").textContent = `${plural(items.length, "connection")} to explore.`;
      $("[data-integration-empty]").hidden = items.length > 0;
    }
    form.addEventListener("submit", (event) => event.preventDefault());
    // Selects also emit input; avoid rebuilding results on a search field's blur.
    form.addEventListener("input", render);
    render();
  }
  function todayKey() {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  }
  const dayKey = (date) => date.toISOString().slice(0, 10);
  const utcDay = (year, month, day) => new Date(Date.UTC(year, month - 1, day, 12));
  function bankHolidays(year) {
    const shift = (date, days) => new Date(date.getTime() + days * 86400000);
    const nthMonday = (month, n) => {
      const date = utcDay(year, month, 1);
      return shift(date, ((8 - date.getUTCDay()) % 7) + (n - 1) * 7);
    };
    const lastMonday = (month) => {
      const date = utcDay(year, month + 1, 0);
      return shift(date, -((date.getUTCDay() + 6) % 7));
    };
    const thanksgiving = () => {
      const date = utcDay(year, 11, 1);
      return shift(date, ((11 - date.getUTCDay()) % 7) + 21);
    };
    // A fixed holiday on a Saturday is observed on the Friday before, and on a Sunday on the Monday after.
    const observed = (date) => shift(date, date.getUTCDay() === 6 ? -1 : date.getUTCDay() === 0 ? 1 : 0);
    return [
      observed(utcDay(year, 1, 1)),
      nthMonday(1, 3),
      nthMonday(2, 3),
      lastMonday(5),
      observed(utcDay(year, 6, 19)),
      observed(utcDay(year, 7, 4)),
      nthMonday(9, 1),
      nthMonday(10, 2),
      observed(utcDay(year, 11, 11)),
      thanksgiving(),
      observed(utcDay(year, 12, 25)),
      // Next New Year's Day can be observed on December 31 of this year.
      observed(utcDay(year + 1, 1, 1)),
    ].map(dayKey);
  }
  function clinicClosed(key) {
    const monthDay = key.slice(5);
    const winter = monthDay >= WINTER_BREAK[0] || monthDay <= WINTER_BREAK[1];
    return winter || CLOSED_DATES.includes(key) || bankHolidays(Number(key.slice(0, 4))).includes(key);
  }
  function clinicDates() {
    const today = new Date(todayKey() + "T12:00:00Z");
    if (!KEEP_CLINICS_CURRENT) return FIXED_CLINIC_DATES.filter((key) => key >= todayKey());
    const dates = [];
    for (let offset = 3; offset <= 60 && dates.length < 4; offset++) {
      const date = new Date(today);
      date.setUTCDate(date.getUTCDate() + offset);
      const key = dayKey(date);
      if ([2, 4].includes(date.getUTCDay()) && !clinicClosed(key)) dates.push(key);
    }
    return dates;
  }
  const clinicFormat = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  function portrait(person, index) {
    const shirts = ["#74805c", "#b7462d", "#566d87"];
    return `<svg viewBox="0 0 240 230" class="w-full" role="img" aria-label="Illustration of ${esc(person.name)}"><rect width="240" height="230" fill="${person.tone}"/><path d="M40 230v-46c0-64 160-64 160 0v46" fill="${shirts[index]}"/><path d="M76 82c0-59 90-59 90 0v39c-3 57-86 57-90 0z" fill="#dba47f"/><path d="${person.hair}" fill="#42362c"/><path d="M95 105h8m34 0h8m-33 33q10 8 20 0" stroke="#28251f" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;
  }
  function initCompany() {
    const root = $("[data-team]");
    if (!root) return;
    root.innerHTML = TEAM.map(
      (person, index) =>
        `<article>${portrait(person, index)}<p class="eyebrow mt-5 text-coral">${esc(person.role)}</p><h2 class="mt-3 font-display text-3xl">${esc(person.name)}</h2><p class="mt-4 text-sm leading-relaxed text-muted">${esc(person.quote)}</p></article>`,
    ).join("");
    $("[data-clinic-dates]").innerHTML =
      clinicDates()
        .map(
          (key) =>
            `<article class="border border-ink bg-white p-6"><p class="eyebrow text-coral">OPEN WORKFLOW HOUR</p><h3 class="mt-4 font-display text-2xl">${esc(clinicFormat.format(new Date(key + "T12:00:00Z")))}</h3><p class="mt-4 text-sm">2:00–2:45 p.m. / Central time</p><p class="mt-3 text-sm leading-relaxed text-muted">One task, a small group and a useful place to begin.</p><a href="contact.html?topic=clinic&amp;date=${key}" class="text-link mt-5 inline-block text-sm" aria-label="Ask for a spot on ${esc(clinicFormat.format(new Date(key + "T12:00:00Z")))}">Ask for a spot</a></article>`,
        )
        .join("") ||
      '<p class="border border-ink p-6">Please contact the team to arrange the next workflow conversation.</p>';
  }
  function initContact() {
    const form = $("[data-contact-form]");
    if (!form) return;
    const topics = { workflow: true, plan: true, clinic: true, connection: true };
    form.elements.topic.value = validParam("topic", topics, "workflow");
    // A workflow-hour date (only one of the dates on offer) or a pricing estimate can arrive in the URL.
    let context = "";
    const date = params.get("date");
    if (date !== null && clinicDates().includes(date)) {
      form.elements.topic.value = "clinic";
      context = `Workflow hour: ${clinicFormat.format(new Date(date + "T12:00:00Z"))}, 2:00–2:45 p.m. Central time.`;
      $("[data-context-label]").textContent = "Your workflow hour";
    } else if (form.elements.topic.value === "plan" && estimateFromParams()) {
      context = estimateText(estimateFromParams());
      $("[data-context-label]").textContent = "Your estimate";
    }
    function showContext() {
      const keep = context && form.elements.topic.value === (context.startsWith("Workflow hour") ? "clinic" : "plan");
      form.elements.context.value = keep ? context : "";
      $("[data-context-text]").textContent = context;
      $("[data-contact-context]").hidden = !keep;
    }
    form.elements.topic.addEventListener("change", showContext);
    showContext();
    function resetErrors() {
      $$("[data-error]", form).forEach((element) => (element.textContent = ""));
      $$("[aria-invalid]", form).forEach((element) => element.removeAttribute("aria-invalid"));
      $("[data-form-errors]").hidden = true;
    }
    function error(name, message) {
      form.elements[name].setAttribute("aria-invalid", "true");
      $(`[data-error="${name}"]`, form).textContent = message;
    }
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      resetErrors();
      const name = form.elements.name.value.trim(),
        email = form.elements.email.value.trim(),
        message = form.elements.message.value.trim();
      let count = 0;
      if (name.length < 2 || name.length > 100) {
        error("name", "Please enter your name, using 2–100 characters.");
        count++;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 180) {
        error("email", "Please enter a complete work email address.");
        count++;
      }
      if (message.length < 15 || message.length > 2000) {
        error("message", "Give us a little context, using 15–2,000 characters.");
        count++;
      }
      if (!form.elements.consent.checked) {
        error("consent", "Please let us know we may reply about this request.");
        count++;
      }
      if (count) {
        $("[data-form-errors]").textContent = `Please check ${plural(count, "highlighted field")}.`;
        $("[data-form-errors]").hidden = false;
        $("[aria-invalid='true']", form).focus();
        return;
      }
      // Connect your endpoint here using fetch(form.action,{method:'POST',body:new FormData(form)}).
      // In production, show the success state below only after a response with response.ok.
      // The standalone template validates locally and presents the completed business form state.
      const reference =
        "WQ-" + todayKey().replaceAll("-", "").slice(2) + "-" + String(Math.floor(1000 + Math.random() * 9000));
      $("[data-success-title]").textContent =
        `Thanks, ${name.split(/\s+/)[0]}. Your request is with our workflow team.`;
      $("[data-success-reference]").textContent = reference;
      $("[data-success-context]").textContent = form.elements.context.value
        ? `We’ll start from this: ${form.elements.context.value}`
        : "";
      $("[data-success-context]").hidden = !form.elements.context.value;
      form.hidden = true;
      $("[data-contact-success]").hidden = false;
      $("[data-contact-success]").focus();
    });
    $("[data-another-message]").addEventListener("click", () => {
      form.reset();
      resetErrors();
      context = "";
      showContext();
      form.hidden = false;
      $("[data-contact-success]").hidden = true;
      form.elements.name.focus();
    });
  }
  function initMenu() {
    const toggle = $("#menu-toggle"),
      menu = $("#mobile-menu");
    function close(returnFocus = false) {
      menu.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      if (returnFocus) toggle.focus();
    }
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      menu.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
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
    if (matchMedia("(prefers-reduced-motion:reduce)").matches || !("IntersectionObserver" in window)) {
      $$(".reveal").forEach((element) => element.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting || entry.boundingClientRect.top < innerHeight) {
            $$(".reveal").forEach((element) => {
              if (element.getBoundingClientRect().top <= entry.boundingClientRect.bottom)
                element.classList.add("is-visible");
            });
            observer.unobserve(entry.target);
          }
        }),
      { rootMargin: "0px 0px 70px 0px" },
    );
    $$(".reveal").forEach((element) => observer.observe(element));
  }
  const featured = $("[data-featured-recipes]");
  if (featured) featured.innerHTML = [RECIPES[0], RECIPES[1], RECIPES[9]].map((recipe) => recipeCard(recipe)).join("");
  initMenu();
  initRecipeSaves();
  initRecipes();
  initRecipeDetail();
  initBuilder();
  initPricing();
  initIntegrations();
  initCompany();
  initContact();
  initReveals();
  $$("[data-year]").forEach(
    (element) =>
      (element.textContent = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, year: "numeric" }).format(
        new Date(),
      )),
  );
})();
