/*
 * Latchline content data. main.js renders the playbooks, product stages, customer stories, resources,
 * team, pricing and booking slots from these constants, so editing them here updates every page.
 * Every id is used in URLs and saved shortlists: keep ids lowercase, with hyphens, and unique.
 */
window.LATCHLINE = (() => {
  "use strict";

  // Labels for the playbook filters. Keys are used in ?segment= and ?motion= on playbooks.html.
  const SEGMENTS = {
    software: "Software",
    operations: "Operations",
    services: "Services",
    health: "Healthcare",
    finance: "Finance",
  };
  const MOTIONS = {
    "self-serve": "Self-serve",
    assisted: "Assisted",
    enterprise: "Enterprise",
  };

  /*
   * Onboarding playbooks (playbooks.html, the plan preview on product.html, the home page and the
   * shortlist carried into contact.html). `days` is the target number of calendar days from kickoff
   * to first value; `milestones` are spread across those days by the plan preview. `art` is the SVG
   * in assets/img/.
   */
  const PLAYBOOKS = [
    {
      id: "saas-kickoff",
      title: "B2B software kickoff",
      segment: "software",
      motion: "assisted",
      days: 21,
      tasks: 34,
      roles: ["CSM", "Solutions engineer", "Customer admin"],
      summary:
        "The everyday post-sale path for a mid-market software deal: agree the outcome, connect the data, train the champions and prove it in production.",
      firstValue: "First workflow live in production",
      milestones: [
        "Kickoff call held",
        "Admin access granted",
        "Data connected",
        "Champions trained",
        "First workflow live",
      ],
      art: "playbook-saas-kickoff.svg",
    },
    {
      id: "self-serve-activation",
      title: "Trial to first value",
      segment: "software",
      motion: "self-serve",
      days: 7,
      tasks: 12,
      roles: ["Growth lead", "Trial user"],
      summary:
        "A light, nudge-driven path for self-serve trials. Each step unlocks the next, and a person only steps in when a trial stalls.",
      firstValue: "Second teammate invited",
      milestones: ["Account created", "Sample data imported", "First project shared", "Teammate invited"],
      art: "playbook-self-serve-activation.svg",
    },
    {
      id: "data-migration",
      title: "Data migration with sign-off",
      segment: "operations",
      motion: "enterprise",
      days: 45,
      tasks: 58,
      roles: ["Implementation lead", "Data engineer", "Customer IT", "Executive sponsor"],
      summary:
        "Field mapping, two test loads and a formal sign-off before cutover. Every decision has an owner and every load has evidence attached.",
      firstValue: "Cutover signed off by the customer",
      milestones: [
        "Source systems audited",
        "Field map agreed",
        "Test load one",
        "Test load two",
        "Cutover signed off",
      ],
      art: "playbook-data-migration.svg",
    },
    {
      id: "multi-site",
      title: "Multi-site rollout",
      segment: "operations",
      motion: "enterprise",
      days: 60,
      tasks: 72,
      roles: ["Program manager", "Site leads", "Trainer", "Customer operations"],
      summary:
        "One readiness definition for every location, with waves, site leads and a go-live checklist that local teams can adapt without losing the standard.",
      firstValue: "Pilot site live with local team trained",
      milestones: ["Readiness criteria set", "Pilot site ready", "Pilot live", "Wave one live", "All sites live"],
      art: "playbook-multi-site.svg",
    },
    {
      id: "security-review",
      title: "Security review fast lane",
      segment: "software",
      motion: "enterprise",
      days: 14,
      tasks: 19,
      roles: ["Account executive", "Security engineer", "Customer InfoSec"],
      summary:
        "Questionnaires, pen-test summaries and DPAs in one tracked lane, so procurement stops being the longest part of onboarding.",
      firstValue: "Security approval in writing",
      milestones: [
        "Questionnaire received",
        "Standard answers attached",
        "Open questions resolved",
        "Approval received",
      ],
      art: "playbook-security-review.svg",
    },
    {
      id: "agency-client",
      title: "Agency client onboarding",
      segment: "services",
      motion: "assisted",
      days: 10,
      tasks: 22,
      roles: ["Account director", "Producer", "Client marketing lead"],
      summary:
        "Brand assets, access to ad accounts and a signed brief, collected through the client portal instead of eleven email threads.",
      firstValue: "First deliverable approved",
      milestones: ["Brief signed", "Assets and logins collected", "Kickoff workshop", "First deliverable approved"],
      art: "playbook-agency-client.svg",
    },
    {
      id: "clinic-go-live",
      title: "Clinic go-live",
      segment: "health",
      motion: "assisted",
      days: 30,
      tasks: 41,
      roles: ["Implementation specialist", "Practice manager", "Clinical champion"],
      summary:
        "Scheduling templates, staff accounts and a supported first clinic day for practice software, with a clear route for anything clinical.",
      firstValue: "First full day of appointments booked in the new system",
      milestones: [
        "Practice profile complete",
        "Templates built",
        "Staff accounts live",
        "Dress rehearsal",
        "First clinic day",
      ],
      art: "playbook-clinic-go-live.svg",
    },
    {
      id: "payroll-switch",
      title: "Payroll provider switch",
      segment: "finance",
      motion: "assisted",
      days: 28,
      tasks: 37,
      roles: ["Payroll specialist", "Customer HR", "Customer finance"],
      summary:
        "Built around the pay calendar: employee records, tax setup and a parallel run, timed so the first live payroll is never the test.",
      firstValue: "First live payroll paid on time",
      milestones: [
        "Pay calendar confirmed",
        "Employee records loaded",
        "Tax setup verified",
        "Parallel run",
        "First live payroll",
      ],
      art: "playbook-payroll-switch.svg",
    },
    {
      id: "merchant-kyc",
      title: "Merchant onboarding and KYC",
      segment: "finance",
      motion: "self-serve",
      days: 5,
      tasks: 14,
      roles: ["Risk analyst", "Merchant owner"],
      summary:
        "A guided application with document checks and clear reasons when something is missing, so good merchants are taking payments within the week.",
      firstValue: "First payment processed",
      milestones: ["Application submitted", "Documents verified", "Account approved", "First payment"],
      art: "playbook-merchant-kyc.svg",
    },
    {
      id: "partner-handoff",
      title: "Implementation partner handoff",
      segment: "services",
      motion: "enterprise",
      days: 35,
      tasks: 46,
      roles: ["Partner manager", "Partner consultant", "CSM", "Customer sponsor"],
      summary:
        "When a partner delivers the implementation, everyone still sees one plan. Partner tasks, your checkpoints and the customer's view stay in step.",
      firstValue: "Partner hands over a working configuration",
      milestones: ["Partner assigned", "Scope agreed", "Configuration built", "Joint review", "Handover accepted"],
      art: "playbook-partner-handoff.svg",
    },
    {
      id: "carrier-setup",
      title: "Carrier and lane setup",
      segment: "operations",
      motion: "assisted",
      days: 18,
      tasks: 26,
      roles: ["Onboarding manager", "Carrier relations", "Customer dispatcher"],
      summary:
        "For freight and logistics platforms: carriers invited, lanes priced and the first load tendered, with a daily view of who is still missing paperwork.",
      firstValue: "First load tendered and accepted",
      milestones: ["Lanes imported", "Carriers invited", "Insurance on file", "First load tendered"],
      art: "playbook-carrier-setup.svg",
    },
    {
      id: "training-cohort",
      title: "Customer training cohort",
      segment: "services",
      motion: "self-serve",
      days: 12,
      tasks: 16,
      roles: ["Education lead", "Customer learners"],
      summary:
        "Group several new customers into one live cohort: shared sessions, short assignments and a certificate when each learner completes the path.",
      firstValue: "Every learner completes module one",
      milestones: ["Cohort enrolled", "Session one", "Assignments submitted", "Certificates issued"],
      art: "playbook-training-cohort.svg",
    },
    {
      id: "enterprise-pilot",
      title: "Enterprise pilot to contract",
      segment: "software",
      motion: "enterprise",
      days: 40,
      tasks: 44,
      roles: ["Account executive", "Solutions engineer", "Customer pilot team", "Executive sponsor"],
      summary:
        "Success criteria written down on day one, weekly check-ins and a read-out that maps each criterion to evidence before the contract conversation.",
      firstValue: "Pilot read-out accepted by the sponsor",
      milestones: [
        "Success criteria signed",
        "Pilot users live",
        "Midpoint check-in",
        "Read-out delivered",
        "Decision recorded",
      ],
      art: "playbook-enterprise-pilot.svg",
    },
    {
      id: "renewal-reset",
      title: "Renewal reset",
      segment: "software",
      motion: "assisted",
      days: 20,
      tasks: 18,
      roles: ["CSM", "Account manager", "Customer admin"],
      summary:
        "Re-onboard an account that drifted: new owners mapped, unused features retired and one fresh outcome agreed well before the renewal date.",
      firstValue: "New outcome agreed with the current owner",
      milestones: ["Health review", "New owners mapped", "Reset workshop", "Outcome agreed"],
      art: "playbook-renewal-reset.svg",
    },
    {
      id: "lab-integration",
      title: "Lab integration onboarding",
      segment: "health",
      motion: "enterprise",
      days: 50,
      tasks: 53,
      roles: ["Integration engineer", "Customer IT", "Lab director", "Compliance lead"],
      summary:
        "Interface specs, test messages and validation records for connecting a lab or health system, with the compliance trail kept beside the work.",
      firstValue: "First validated result received in production",
      milestones: [
        "Interface spec agreed",
        "Test environment connected",
        "Test messages passed",
        "Validation signed",
        "Production live",
      ],
      art: "playbook-lab-integration.svg",
    },
  ];

  /*
   * The six stages of the Latchline board (product.html). Each has what the customer sees, what your
   * team sees, the automations that run and a small board: tasks in the customer lane and the team lane.
   * Task status is one of "done", "doing", "blocked" or "next".
   */
  const STAGES = [
    {
      id: "outcome",
      name: "Outcome agreed",
      days: "Days 1–3",
      summary: "Write the first-value promise in the customer's own words, with a named sponsor and a review date.",
      customer:
        "A welcome page with their goal in their own words, who is on each side and the date you will check it together.",
      team: "The deal notes from your CRM, the promised outcome and a sponsor field that cannot be left blank.",
      automations: [
        "Board created when the deal closes",
        "Kickoff invite sent to the customer sponsor",
        "Sales notes attached",
      ],
      signal: "No sponsor named by day 3",
      tasks: [
        { lane: "customer", label: "Confirm goal", status: "done" },
        { lane: "customer", label: "Name sponsor", status: "doing" },
        { lane: "team", label: "Kickoff call", status: "done" },
        { lane: "team", label: "Review date set", status: "next" },
      ],
    },
    {
      id: "people",
      name: "People ready",
      days: "Days 2–6",
      summary: "Map customer and delivery roles before a missed handoff turns into an urgent meeting.",
      customer:
        "A short list of the people Latchline needs from them, with why each one matters and what they will be asked.",
      team: "A role map showing gaps, out-of-office dates and who is covering, so nobody owns a task by accident.",
      automations: [
        "Invite links for each customer role",
        "Reminder after two quiet days",
        "Coverage swap when someone is away",
      ],
      signal: "A required role still unfilled",
      tasks: [
        { lane: "customer", label: "IT contact", status: "done" },
        { lane: "customer", label: "Billing contact", status: "blocked" },
        { lane: "team", label: "Assign trainer", status: "done" },
        { lane: "team", label: "Cover leave", status: "doing" },
      ],
    },
    {
      id: "access",
      name: "Access cleared",
      days: "Days 4–10",
      summary: "Track data, security and environment prerequisites with evidence and visible blockers.",
      customer:
        "A checklist of what to grant, with screenshots of where to find each setting and a place to upload proof.",
      team: "Every prerequisite with its evidence, its age and the person on the customer side who can unblock it.",
      automations: [
        "Security answers pulled from your library",
        "Blocker escalates after 48 hours",
        "Credentials never stored in tasks",
      ],
      signal: "A blocker older than two business days",
      tasks: [
        { lane: "customer", label: "SSO configured", status: "doing" },
        { lane: "customer", label: "Data export", status: "blocked" },
        { lane: "team", label: "Sandbox ready", status: "done" },
        { lane: "team", label: "DPA filed", status: "done" },
      ],
    },
    {
      id: "build",
      name: "Build underway",
      days: "Days 8–18",
      summary: "Give every workstream an owner, a next move and a customer-facing explanation.",
      customer: "Plain-language progress on each workstream, and only the decisions that need them this week.",
      team: "Workstreams with owners, dependencies and effort, plus a forecast of the first-value date as tasks move.",
      automations: [
        "Forecast date recalculated on every change",
        "Weekly summary drafted for the sponsor",
        "Dependencies unlock the next task",
      ],
      signal: "Forecast slips more than five days",
      tasks: [
        { lane: "customer", label: "Approve fields", status: "done" },
        { lane: "customer", label: "Test import", status: "doing" },
        { lane: "team", label: "Configure rules", status: "doing" },
        { lane: "team", label: "Build reports", status: "next" },
      ],
    },
    {
      id: "value",
      name: "First value seen",
      days: "Days 15–21",
      summary: "Capture the moment the customer reaches the agreed outcome, not just the launch date.",
      customer: "A clear marker that they have reached the goal they set on day one, and a two-question check-in.",
      team: "The time to first value against the plan and the playbook median, with the check-in answers beside it.",
      automations: [
        "Usage event marks first value",
        "Check-in sent to the sponsor",
        "Time to value logged per playbook",
      ],
      signal: "Live, but the outcome event has not fired",
      tasks: [
        { lane: "customer", label: "First live run", status: "done" },
        { lane: "customer", label: "Check-in", status: "next" },
        { lane: "team", label: "Confirm outcome", status: "doing" },
        { lane: "team", label: "Share result", status: "next" },
      ],
    },
    {
      id: "handover",
      name: "Handover complete",
      days: "Days 20–28",
      summary: "Move decisions, open questions and success measures into the long-term customer plan.",
      customer: "A one-page record of what was set up, who to ask now and what the next ninety days look like.",
      team: "A handover note to the account owner, open items with owners, and the board archived with its history.",
      automations: [
        "Handover note drafted from the board",
        "Open items moved to the account plan",
        "Board archived, history kept",
      ],
      signal: "Open items without an owner",
      tasks: [
        { lane: "customer", label: "Sign handover", status: "next" },
        { lane: "customer", label: "Meet account lead", status: "next" },
        { lane: "team", label: "Write note", status: "doing" },
        { lane: "team", label: "Archive board", status: "next" },
      ],
    },
  ];

  /*
   * Customer stories (customers.html). Each metric has a before and after value; `better` says which
   * direction is an improvement ("lower" or "higher") so the chart and the change label read correctly.
   * `mark` picks the shape of the company's wordmark glyph.
   */
  const INDUSTRIES = {
    software: "Software",
    data: "Data platforms",
    care: "Home care",
    payroll: "Payroll",
    logistics: "Logistics",
    insurance: "Insurance",
  };
  const STORIES = [
    {
      id: "kindred-desk",
      company: "Kindred Desk",
      industry: "software",
      size: "140 employees",
      playbook: "saas-kickoff",
      mark: "circle",
      headline: "Seven kickoff documents became one customer-facing path.",
      person: "Asha Ferreby",
      role: "VP of Customer Success",
      quote: "The customer knew where we were, our team knew what mattered, and nobody needed a status meeting.",
      body: [
        "Kindred Desk sells help desk software to support teams of 20 to 300 agents. Every new account got a slide deck, a spreadsheet tracker, three onboarding emails and two shared folders, and every CSM kept them up to date a little differently.",
        "They rebuilt onboarding as one Latchline playbook with five milestones. Customers now open a single portal page, and CSMs work from the same board their manager reviews on Mondays.",
      ],
      metrics: [
        { label: "Days to first value", before: 41, after: 18, unit: "days", better: "lower" },
        { label: "Kickoff documents per account", before: 7, after: 1, unit: "", better: "lower" },
        { label: "Day-30 satisfaction", before: 82, after: 94, unit: "%", better: "higher" },
      ],
    },
    {
      id: "northmill-systems",
      company: "Northmill Systems",
      industry: "data",
      size: "380 employees",
      playbook: "data-migration",
      mark: "stack",
      headline: "Naming decision owners on day one cut stalled migrations by a third.",
      person: "Declan Dunleavy",
      role: "Director of Implementation",
      quote: "Most stalls were a decision nobody knew was theirs. Now the board tells them, politely, every morning.",
      body: [
        "Northmill moves warehouse and pipeline data for finance teams. Migrations stalled when a field-mapping question sat with the wrong person for a week.",
        "With the data migration playbook, every decision is a task with an owner on the customer side, and blockers escalate after two business days instead of at the next steering call.",
      ],
      metrics: [
        { label: "Stalled migrations per quarter", before: 16, after: 11, unit: "", better: "lower" },
        { label: "Average migration length", before: 63, after: 44, unit: "days", better: "lower" },
        { label: "Executive escalations per quarter", before: 9, after: 2, unit: "", better: "lower" },
      ],
    },
    {
      id: "goodfield-care",
      company: "Goodfield Care",
      industry: "care",
      size: "38 sites in 4 regions",
      playbook: "multi-site",
      mark: "leaf",
      headline: "Thirty-eight care sites, one definition of ready.",
      person: "Tovah Wexler",
      role: "Head of Rollouts",
      quote: "Regional teams kept their own way of working, and I could finally see which sites were truly ready.",
      body: [
        "Goodfield Care rolled its scheduling software out to home care sites across four regions. Each region had its own checklist, and go-live dates moved whenever a site discovered a missing step.",
        "The multi-site rollout playbook gave every site the same readiness criteria, with local tasks added underneath. Waves now go live on the date they were planned for.",
      ],
      metrics: [
        { label: "Days from kickoff to site go-live", before: 52, after: 29, unit: "days", better: "lower" },
        { label: "Readiness checks missed at go-live", before: 23, after: 4, unit: "%", better: "lower" },
        { label: "Sites live per month", before: 3, after: 7, unit: "", better: "higher" },
      ],
    },
    {
      id: "sablecrest-payroll",
      company: "Sablecrest Payroll",
      industry: "payroll",
      size: "95 employees",
      playbook: "payroll-switch",
      mark: "diamond",
      headline: "The first live payroll stopped being the test.",
      person: "Prue Haldane",
      role: "Chief Operating Officer",
      quote:
        "We plan backwards from the pay date now. The parallel run is on the board before the contract is countersigned.",
      body: [
        "Sablecrest moves small businesses onto its payroll service. A late tax setup or one missing bank detail meant a nervous first payday for the customer and a weekend for the team.",
        "They plan every switch from the customer's pay calendar with the payroll provider switch playbook, and a parallel run is a required milestone before any live payroll.",
      ],
      metrics: [
        { label: "First payrolls paid on time", before: 81, after: 98, unit: "%", better: "higher" },
        { label: "Days to switch provider", before: 35, after: 24, unit: "days", better: "lower" },
        { label: "Support tickets in month one", before: 14, after: 6, unit: "", better: "lower" },
      ],
    },
    {
      id: "ironpine-freight",
      company: "Ironpine Freight",
      industry: "logistics",
      size: "210 employees",
      playbook: "carrier-setup",
      mark: "chevron",
      headline: "Carriers live in the first week, not the fourth.",
      person: "Zubair Rizzo",
      role: "Onboarding Manager",
      quote: "Every morning I can see exactly which carrier is missing an insurance certificate, and so can they.",
      body: [
        "Ironpine runs a freight platform for regional shippers. Lane setup and carrier paperwork were handled by email, so new shippers waited weeks before tendering a load.",
        "Carriers now upload certificates straight to their task, lanes import from the shipper's spreadsheet and the first tendered load is the milestone everyone works toward.",
      ],
      metrics: [
        { label: "Days to first tendered load", before: 26, after: 11, unit: "days", better: "lower" },
        { label: "Carriers live in week one", before: 3, after: 9, unit: "", better: "higher" },
        { label: "Paperwork chasers per shipper", before: 22, after: 5, unit: "", better: "lower" },
      ],
    },
    {
      id: "quarrystone-mutual",
      company: "Quarrystone Mutual",
      industry: "insurance",
      size: "1,200 employees",
      playbook: "security-review",
      mark: "square",
      headline: "Security reviews in sixteen days, with answers reused.",
      person: "Briar Cuthbert",
      role: "Customer Programs Lead",
      quote: "Procurement used to be the longest part of onboarding. Now it runs alongside everything else.",
      body: [
        "Quarrystone Mutual buys software for claims and underwriting teams and onboards vendors the same way it onboards its own business customers: carefully.",
        "Its customer programs team adopted the security review fast lane. Standard answers come from a shared library, and only new questions reach a security engineer.",
      ],
      metrics: [
        { label: "Days for a security review", before: 38, after: 16, unit: "days", better: "lower" },
        { label: "Questionnaire answers reused", before: 30, after: 85, unit: "%", better: "higher" },
        { label: "Engineer hours per review", before: 21, after: 6, unit: "h", better: "lower" },
      ],
    },
  ];

  /*
   * Resource library (resources.html). Dates are when each piece was published: they are past dates
   * and stay as written.
   */
  const RESOURCE_TYPES = {
    guide: "Guide",
    template: "Template",
    checklist: "Checklist",
    benchmark: "Benchmark",
    recording: "Recording",
  };
  const TOPICS = {
    kickoff: "Kickoff",
    handoff: "Sales handoff",
    adoption: "Adoption",
    metrics: "Metrics",
    security: "Security and IT",
  };
  const RESOURCES = [
    {
      id: "handoff-audit",
      type: "checklist",
      topic: "handoff",
      title: "The post-sale handoff audit",
      summary:
        "Find the promises, owners and assumptions that disappear between the signed contract and the kickoff call.",
      minutes: 12,
      published: "2026-09-29",
      author: "nkechi",
    },
    {
      id: "define-first-value",
      type: "guide",
      topic: "metrics",
      title: "Define first value with your customer",
      summary: "Turn a broad implementation goal into a moment the customer and the delivery team can both recognize.",
      minutes: 18,
      published: "2026-09-15",
      author: "ines",
    },
    {
      id: "readiness-map",
      type: "template",
      topic: "kickoff",
      title: "Customer readiness map",
      summary: "Separate real prerequisites from internal habits and agree how each item will be evidenced.",
      minutes: 20,
      published: "2026-08-27",
      author: "elodie",
    },
    {
      id: "ttv-benchmark-2026",
      type: "benchmark",
      topic: "metrics",
      title: "Time-to-value benchmark, 2026 edition",
      summary: "Median days to first value across 2,400 onboardings, by segment, deal size and playbook length.",
      minutes: 25,
      published: "2026-06-10",
      author: "calder",
    },
    {
      id: "kickoff-agenda",
      type: "template",
      topic: "kickoff",
      title: "A 45-minute kickoff agenda",
      summary:
        "The agenda our implementation team uses, with timings, who speaks when and the three questions to end on.",
      minutes: 8,
      published: "2026-07-22",
      author: "elodie",
    },
    {
      id: "sponsor-email",
      type: "template",
      topic: "kickoff",
      title: "Sponsor update email",
      summary: "A weekly note your executive sponsor will actually read: one outcome, one risk, one decision needed.",
      minutes: 5,
      published: "2026-05-14",
      author: "laszlo",
    },
    {
      id: "security-library",
      type: "guide",
      topic: "security",
      title: "Build a reusable security answer library",
      summary:
        "How to stop answering the same 140 questionnaire questions from scratch, and who should own each answer.",
      minutes: 16,
      published: "2026-08-05",
      author: "rutger",
    },
    {
      id: "sso-checklist",
      type: "checklist",
      topic: "security",
      title: "SSO and provisioning checklist",
      summary: "What to ask the customer's IT team for, in the order they will need it, for SAML, OIDC and SCIM.",
      minutes: 10,
      published: "2026-04-21",
      author: "rutger",
    },
    {
      id: "stalled-accounts",
      type: "recording",
      topic: "adoption",
      title: "Rescuing a stalled onboarding",
      summary: "A recorded clinic with Goodfield Care on spotting stalls early and restarting them without blame.",
      minutes: 42,
      published: "2026-09-03",
      author: "nkechi",
    },
    {
      id: "adoption-signals",
      type: "guide",
      topic: "adoption",
      title: "Adoption signals worth tracking",
      summary: "Six usage events that predict a healthy account at day 90, and three popular ones that don't.",
      minutes: 14,
      published: "2026-07-08",
      author: "calder",
    },
    {
      id: "handoff-form",
      type: "template",
      topic: "handoff",
      title: "Sales-to-onboarding handoff form",
      summary: "Twelve fields sales fills in before a deal closes, so onboarding never starts with a discovery call.",
      minutes: 6,
      published: "2026-03-18",
      author: "laszlo",
    },
    {
      id: "portal-copy",
      type: "guide",
      topic: "adoption",
      title: "Writing a customer portal people read",
      summary: "Plain-language patterns for tasks, reminders and progress updates, with before and after examples.",
      minutes: 11,
      published: "2026-06-24",
      author: "rania",
    },
    {
      id: "capacity-benchmark",
      type: "benchmark",
      topic: "metrics",
      title: "How many onboardings per CSM?",
      summary: "Active onboardings per person by motion and complexity, and where quality drops off.",
      minutes: 15,
      published: "2026-02-11",
      author: "nkechi",
    },
    {
      id: "handoff-clinic",
      type: "recording",
      topic: "handoff",
      title: "Clinic: the handoff call",
      summary: "Laszlo and Elodie role-play the internal handoff call, and take questions from implementation leads.",
      minutes: 38,
      published: "2026-05-28",
      author: "laszlo",
    },
    {
      id: "go-live-checklist",
      type: "checklist",
      topic: "kickoff",
      title: "Go-live day checklist",
      summary: "Who is on call, what is frozen and how the customer reports a problem on the first live day.",
      minutes: 7,
      published: "2026-01-27",
      author: "nolan",
    },
    {
      id: "it-intake",
      type: "template",
      topic: "security",
      title: "Customer IT intake sheet",
      summary: "Environments, allow-lists, data residency and contacts, collected once and reused across the project.",
      minutes: 9,
      published: "2026-10-06",
      author: "rutger",
    },
  ];

  /*
   * Team (company.html). Portraits are drawn by main.js from these colors and shapes:
   * hair is "short", "long", "curly", "bun", "crop" or "wave".
   */
  const TEAM = [
    {
      id: "ines",
      name: "Inés Arroyave",
      role: "Co-founder and CEO",
      bio: "Ran implementation for a scheduling platform through three hundred enterprise rollouts before starting Latchline.",
      skin: "#c98f68",
      hair: "long",
      hairColor: "#2b1d16",
      shirt: "#1f45d6",
      glasses: false,
    },
    {
      id: "calder",
      name: "Calder Ostrow",
      role: "Co-founder and CTO",
      bio: "Builds calm software for complicated operational work. Writes the time-to-value benchmark every June.",
      skin: "#f0c7a6",
      hair: "short",
      hairColor: "#8a5a32",
      shirt: "#0c1427",
      glasses: true,
    },
    {
      id: "nkechi",
      name: "Nkechi Amankwah",
      role: "Head of Customer Practice",
      bio: "Turns patterns from hundreds of customer boards into playbooks teams can adapt without consultants.",
      skin: "#6b4128",
      hair: "curly",
      hairColor: "#1a1210",
      shirt: "#186b48",
      glasses: false,
    },
    {
      id: "rutger",
      name: "Rutger Feldner",
      role: "Principal Engineer, Security",
      bio: "Keeps the security answer library honest and walks customer IT teams through SSO, SCIM and data residency.",
      skin: "#e8b48f",
      hair: "crop",
      hairColor: "#c9b28f",
      shirt: "#56607a",
      glasses: true,
    },
    {
      id: "rania",
      name: "Rania Ekdahl",
      role: "Design Lead",
      bio: "Designs the customer portal and rewrites any task description that would confuse her grandmother.",
      skin: "#d9a17b",
      hair: "bun",
      hairColor: "#3a2418",
      shirt: "#ffcf3f",
      glasses: false,
    },
    {
      id: "laszlo",
      name: "Laszlo Tenney",
      role: "Head of Sales",
      bio: "Sold onboarding software to operations leaders for a decade, and still answers the sales line himself on Fridays.",
      skin: "#f2cbb0",
      hair: "wave",
      hairColor: "#5a5048",
      shirt: "#b83218",
      glasses: false,
    },
    {
      id: "elodie",
      name: "Elodie Reiss",
      role: "Implementation Lead",
      bio: "Leads every customer's own Latchline setup, usually in under three weeks, using the kickoff playbook.",
      skin: "#f5d3bc",
      hair: "long",
      hairColor: "#b5562a",
      shirt: "#8fb0ff",
      glasses: true,
    },
    {
      id: "nolan",
      name: "Nolan Purcell",
      role: "Support Lead",
      bio: "Runs the support desk from 7 a.m. Pacific, and keeps the median first reply under an hour.",
      skin: "#8d5a3b",
      hair: "short",
      hairColor: "#16110e",
      shirt: "#3b4660",
      glasses: false,
    },
  ];

  /*
   * Pricing (pricing.html). Prices are USD per month on monthly billing. `included` active onboardings
   * are in the platform fee; each one above that costs `extra` up to `max`. Annual billing takes
   * ANNUAL_DISCOUNT off everything recurring. Add-ons listed in a plan's `bundled` are included free.
   */
  const ANNUAL_DISCOUNT = 0.15;
  const PLANS = {
    team: {
      name: "Team",
      fee: 290,
      included: 15,
      extra: 16,
      max: 40,
      blurb: "For a first onboarding team with one or two playbooks.",
      bundled: [],
      points: ["Unlimited playbooks", "Customer portal", "Board and timeline views", "Email and chat support"],
    },
    growth: {
      name: "Growth",
      fee: 790,
      included: 50,
      extra: 11,
      max: 200,
      blurb: "For several teams sharing playbooks, forecasts and reporting.",
      bundled: [],
      points: ["Everything in Team", "First-value forecasting", "Time-to-value reporting", "Automation rules"],
    },
    enterprise: {
      name: "Enterprise",
      fee: 2400,
      included: 200,
      extra: 7,
      max: 1000,
      blurb: "For large programs with security review, SSO and many workspaces.",
      bundled: ["portal", "sso"],
      points: ["Everything in Growth", "Branded portal and SSO included", "Audit log and data residency", "Named CSM"],
    },
  };
  const ADDONS = {
    portal: { name: "Branded customer portal", price: 90, recurring: true, note: "Your domain, logo and colors" },
    sso: { name: "SSO and SCIM provisioning", price: 150, recurring: true, note: "SAML or OIDC, plus user sync" },
    crm: {
      name: "Two-way CRM sync",
      price: 120,
      recurring: true,
      note: "Deals open boards, milestones update the CRM",
    },
    sandbox: {
      name: "Sandbox workspace",
      price: 60,
      recurring: true,
      note: "Test playbooks without touching live boards",
    },
    launch: {
      name: "Guided launch",
      price: 1800,
      recurring: false,
      note: "One-time: three weeks with an implementation lead",
    },
  };

  /*
   * Office and booking (company.html and contact.html), in America/Los_Angeles.
   * HOURS: day of week (0 = Sunday) to [open, close] in 24-hour "HH:MM"; days not listed are closed.
   * Holidays are worked out by rule in main.js (usHolidays); add one-off closures to CLOSED_DATES.
   * DEMO_SLOTS are the start times offered for a 30-minute demo on each business day.
   */
  const HOURS = {
    1: ["07:00", "17:00"],
    2: ["07:00", "17:00"],
    3: ["07:00", "17:00"],
    4: ["07:00", "17:00"],
    5: ["07:00", "17:00"],
  };
  const CLOSED_DATES = [];
  const DEMO_SLOTS = ["08:00", "08:30", "09:30", "10:00", "11:00", "13:00", "13:30", "14:30", "15:30"];

  return {
    SEGMENTS,
    MOTIONS,
    PLAYBOOKS,
    STAGES,
    INDUSTRIES,
    STORIES,
    RESOURCE_TYPES,
    TOPICS,
    RESOURCES,
    TEAM,
    ANNUAL_DISCOUNT,
    PLANS,
    ADDONS,
    HOURS,
    CLOSED_DATES,
    DEMO_SLOTS,
  };
})();
