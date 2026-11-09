/*
 * Wardline content: frameworks, the common control library, integrations, pricing, the readiness
 * assessment, the trust center and demo booking. main.js reads everything from window.WARDLINE.
 * Edit the data here; the pages render from it.
 */
window.WARDLINE = (() => {
  "use strict";

  /*
   * Frameworks. `code` is the letter used in CONTROLS[].map. `seal` picks the drawn badge shape in main.js.
   * `issuer` says plainly who issues the report or certificate: Wardline never does.
   */
  const FRAMEWORKS = [
    {
      id: "soc2",
      code: "S",
      name: "SOC 2",
      full: "SOC 2 (Trust Services Criteria)",
      seal: "hex",
      region: "United States, recognized worldwide",
      issuer: "An attestation report issued by a licensed CPA firm after its own audit.",
      summary:
        "The report most US buyers ask for. Type I looks at control design on one date; Type II tests how controls operated over an observation period of usually 3 to 12 months.",
      prep: "6–12 weeks to prepare, then the observation period and audit fieldwork for Type II.",
    },
    {
      id: "iso27001",
      code: "I",
      name: "ISO 27001",
      full: "ISO/IEC 27001:2022",
      seal: "round",
      region: "International",
      issuer: "A certificate issued by an accredited certification body after Stage 1 and Stage 2 audits.",
      summary:
        "An information security management system (ISMS) standard. Certificates run for three years, with surveillance audits in years two and three.",
      prep: "3–6 months to build the ISMS, run an internal audit and a management review before Stage 1.",
    },
    {
      id: "hipaa",
      code: "H",
      name: "HIPAA",
      full: "HIPAA Security and Privacy Rules",
      seal: "cross",
      region: "United States, health data",
      issuer:
        "There is no official HIPAA certification. Covered entities and business associates assess themselves, often with an independent assessor.",
      summary:
        "Required for organizations that create, receive or store protected health information for US health care customers, including the business associate agreements that go with it.",
      prep: "6–10 weeks for a risk analysis, safeguards, policies and business associate agreements.",
    },
    {
      id: "gdpr",
      code: "G",
      name: "GDPR",
      full: "EU General Data Protection Regulation",
      seal: "ring",
      region: "European Union and EEA",
      issuer:
        "A regulation, not a certificate. Supervisory authorities enforce it; Wardline helps you keep the records that show how you comply.",
      summary:
        "Applies when you process personal data of people in the EU. Focuses on lawful basis, transparency, data subject rights, processors and international transfers.",
      prep: "6–10 weeks for records of processing, notices, a rights process and processor agreements.",
    },
    {
      id: "pci",
      code: "P",
      name: "PCI DSS",
      full: "PCI DSS v4.0.1",
      seal: "card",
      region: "Worldwide, card payments",
      issuer:
        "A Report on Compliance from a Qualified Security Assessor, or a Self-Assessment Questionnaire, depending on your merchant or service provider level.",
      summary:
        "Applies when you store, process or transmit cardholder data, or can affect its security. Scoping the cardholder data environment is the first and biggest decision.",
      prep: "2–4 months, most of it spent reducing scope and evidencing network and logging controls.",
    },
    {
      id: "nist",
      code: "N",
      name: "NIST CSF",
      full: "NIST Cybersecurity Framework 2.0",
      seal: "tier",
      region: "United States, voluntary",
      issuer:
        "A voluntary framework with no certificate. Organizations self-assess or ask an outside firm to review them.",
      summary:
        "Six functions (Govern, Identify, Protect, Detect, Respond, Recover) that many security teams use to describe their program to leadership and customers.",
      prep: "4–8 weeks to profile current and target tiers and plan the gaps.",
    },
  ];

  const FAMILIES = [
    { id: "AC", name: "Access control" },
    { id: "AM", name: "Asset management" },
    { id: "BC", name: "Business continuity" },
    { id: "CM", name: "Change management" },
    { id: "CR", name: "Cryptography" },
    { id: "DP", name: "Data privacy" },
    { id: "GV", name: "Governance and policies" },
    { id: "HR", name: "People security" },
    { id: "IR", name: "Incident response" },
    { id: "LM", name: "Logging and monitoring" },
    { id: "NS", name: "Network security" },
    { id: "PS", name: "Physical security" },
    { id: "RM", name: "Risk management" },
    { id: "VD", name: "Vendor management" },
    { id: "VL", name: "Vulnerability management" },
  ];

  /*
   * The Wardline common control library: one control, many frameworks. [id, title, frameworks].
   * The framework letters come from FRAMEWORKS[].code. Overlap counts on frameworks.html are computed from this.
   */
  const CONTROLS = [
    ["AC-01", "Unique user accounts for every person", "SIHPN"],
    ["AC-02", "Multi-factor authentication on workforce accounts", "SIHPN"],
    ["AC-03", "Single sign-on for production and admin tools", "SIN"],
    ["AC-04", "Role-based access with least privilege", "SIHGPN"],
    ["AC-05", "Quarterly user access reviews", "SIHPN"],
    ["AC-06", "Access removed within one business day of departure", "SIHPN"],
    ["AC-07", "Privileged access approved and time-limited", "SIPN"],
    ["AC-08", "Password and passphrase standard", "SIHP"],
    ["AC-09", "Shared and service accounts inventoried", "SIPN"],
    ["AM-01", "Inventory of hardware and cloud assets", "SIHPN"],
    ["AM-02", "Data classification scheme", "SIGN"],
    ["AM-03", "Records of processing activities", "G"],
    ["AM-04", "Acceptable use policy acknowledged", "SIH"],
    ["AM-05", "Media and device disposal", "SIHP"],
    ["AM-06", "Owners assigned for critical assets", "SIN"],
    ["BC-01", "Business continuity plan", "SIHN"],
    ["BC-02", "Encrypted backups with restore tests", "SIHPN"],
    ["BC-03", "Disaster recovery test each year", "SIHN"],
    ["BC-04", "Recovery time and point objectives", "SIN"],
    ["CM-01", "Peer review before production changes", "SIPN"],
    ["CM-02", "Separate development, test and production", "SIP"],
    ["CM-03", "Infrastructure changes tracked in code", "SIN"],
    ["CM-04", "Emergency change procedure", "SIP"],
    ["CM-05", "Secure development lifecycle", "SIPN"],
    ["CR-01", "Data encrypted at rest", "SIHGPN"],
    ["CR-02", "Data encrypted in transit (TLS 1.2 or later)", "SIHGPN"],
    ["CR-03", "Key management and rotation", "SIPN"],
    ["CR-04", "Stored card numbers rendered unreadable", "P"],
    ["DP-01", "Privacy notice published and current", "SG"],
    ["DP-02", "Lawful basis recorded for each processing activity", "G"],
    ["DP-03", "Data subject request process", "G"],
    ["DP-04", "Data protection impact assessments", "G"],
    ["DP-05", "Retention schedule and secure deletion", "SIHGP"],
    ["DP-06", "Breach notification within required timelines", "HG"],
    ["DP-07", "Business associate agreements in place", "H"],
    ["DP-08", "Safeguards for international transfers", "G"],
    ["DP-09", "Minimum necessary use of health information", "H"],
    ["GV-01", "Information security policy approved yearly", "SIHPN"],
    ["GV-02", "Security roles and responsibilities assigned", "SIHPN"],
    ["GV-03", "Leadership oversight of the security program", "SIN"],
    ["GV-04", "Internal audit of the management system", "I"],
    ["GV-05", "Register of legal and contractual requirements", "IG"],
    ["GV-06", "Statement of applicability", "I"],
    ["HR-01", "Background checks where lawful", "SIP"],
    ["HR-02", "Security awareness training at hire and yearly", "SIHPN"],
    ["HR-03", "Confidentiality agreements signed", "SIH"],
    ["HR-04", "Disciplinary process for policy violations", "SIH"],
    ["HR-05", "Secure coding training for engineers", "IPN"],
    ["IR-01", "Incident response plan", "SIHGPN"],
    ["IR-02", "Incident response exercise each year", "SIHPN"],
    ["IR-03", "Security incidents logged and reviewed", "SIHPN"],
    ["IR-04", "Lessons learned after major incidents", "SIN"],
    ["LM-01", "Centralized audit logging", "SIHPN"],
    ["LM-02", "Alerts on suspicious activity", "SIPN"],
    ["LM-03", "Log retention for at least twelve months", "SIHP"],
    ["LM-04", "File integrity monitoring on key systems", "P"],
    ["LM-05", "Time synchronization across systems", "IP"],
    ["LM-06", "Uptime and capacity monitoring", "SN"],
    ["NS-01", "Firewall and security group rules reviewed", "SIPN"],
    ["NS-02", "Network segmentation of production", "SIP"],
    ["NS-03", "Web application firewall for public apps", "PN"],
    ["NS-04", "Remote access over encrypted channels", "SIHP"],
    ["PS-01", "Data center physical security (inherited from the cloud provider)", "SIHP"],
    ["PS-02", "Office badge access and visitor log", "SIP"],
    ["PS-03", "Clean desk and screen lock", "IH"],
    ["RM-01", "Annual risk assessment", "SIHPN"],
    ["RM-02", "Risk register with owners and treatments", "SIN"],
    ["RM-03", "Fraud risk considered in the risk assessment", "S"],
    ["RM-04", "Security objectives set by leadership", "SIN"],
    ["VD-01", "Vendor inventory with risk tiers", "SIGN"],
    ["VD-02", "Security review before onboarding a vendor", "SIHGPN"],
    ["VD-03", "Yearly review of critical vendors", "SIPN"],
    ["VD-04", "Data processing agreements with processors", "G"],
    ["VD-05", "Service provider responsibility matrix", "P"],
    ["VL-01", "Vulnerability scanning of infrastructure", "SIPN"],
    ["VL-02", "Annual penetration test by an independent firm", "SIP"],
    ["VL-03", "Patch timelines by severity", "SIHPN"],
    ["VL-04", "Endpoint protection on company devices", "SIHPN"],
    ["VL-05", "Disk encryption on laptops", "SIHN"],
    ["VL-06", "Quarterly external scans by an approved vendor", "P"],
    ["VL-07", "Dependency scanning in code repositories", "SPN"],
  ];

  /* Integrations directory. `checks` is the number of automated tests the connection runs. */
  const INTEGRATION_CATEGORIES = {
    cloud: "Cloud infrastructure",
    identity: "Identity and SSO",
    hr: "HR and people",
    ticketing: "Ticketing",
    code: "Code and CI",
    endpoint: "Endpoint and devices",
  };
  const INTEGRATIONS = [
    {
      id: "cirrova",
      name: "Cirrova",
      category: "cloud",
      checks: 48,
      summary: "Accounts, storage buckets, encryption settings, security groups and audit trails across every region.",
      access: "Read-only audit role",
      minutes: 10,
    },
    {
      id: "altastack",
      name: "Altastack",
      category: "cloud",
      checks: 41,
      summary: "Projects, service accounts, key rotation and logging sinks, checked every hour.",
      access: "Viewer role on the organization",
      minutes: 12,
    },
    {
      id: "nimbara",
      name: "Nimbara",
      category: "cloud",
      checks: 36,
      summary: "Subscriptions, databases, backup policies and network rules, with drift alerts.",
      access: "Reader role plus security reader",
      minutes: 15,
    },
    {
      id: "vaporline",
      name: "Vaporline",
      category: "cloud",
      checks: 19,
      summary: "Container clusters and serverless functions: images, secrets handling and public endpoints.",
      access: "Read-only cluster token",
      minutes: 8,
    },
    {
      id: "passgrove",
      name: "Passgrove",
      category: "identity",
      checks: 22,
      summary: "Users, groups, MFA enrollment and sign-in policies from your identity provider.",
      access: "Read-only admin API scope",
      minutes: 6,
    },
    {
      id: "idlattice",
      name: "Idlattice",
      category: "identity",
      checks: 18,
      summary: "SSO app assignments and access reviews, with removals traced back to HR events.",
      access: "Directory read scope",
      minutes: 7,
    },
    {
      id: "gatemere",
      name: "Gatemere",
      category: "identity",
      checks: 14,
      summary: "Privileged access sessions, approvals and time-limited elevation records.",
      access: "Audit log reader",
      minutes: 9,
    },
    {
      id: "sesamo",
      name: "Sesamo",
      category: "identity",
      checks: 11,
      summary: "Password manager vaults: shared credential ownership and MFA on every seat.",
      access: "Reporting API key",
      minutes: 5,
    },
    {
      id: "staffloom",
      name: "Staffloom",
      category: "hr",
      checks: 12,
      summary: "Hires, departures and managers, so onboarding and offboarding checks start on the right day.",
      access: "Employee directory read",
      minutes: 6,
    },
    {
      id: "rollquill",
      name: "Rollquill",
      category: "hr",
      checks: 9,
      summary: "Payroll-linked employment status and contractor end dates for access removal.",
      access: "Read-only report token",
      minutes: 8,
    },
    {
      id: "humanara",
      name: "Humanara",
      category: "hr",
      checks: 10,
      summary: "Policy acknowledgments and background-check status from your HR suite.",
      access: "Read scope on people records",
      minutes: 7,
    },
    {
      id: "peoplecairn",
      name: "Peoplecairn",
      category: "hr",
      checks: 8,
      summary: "Org chart and job titles for role-based access and training assignments.",
      access: "Org chart read",
      minutes: 5,
    },
    {
      id: "tickbarrow",
      name: "Tickbarrow",
      category: "ticketing",
      checks: 7,
      summary: "Opens a ticket for every failing control and closes the loop when the fix lands.",
      access: "Create and read issues in one project",
      minutes: 5,
    },
    {
      id: "issuewright",
      name: "Issuewright",
      category: "ticketing",
      checks: 6,
      summary: "Change approvals and incident records pulled in as evidence, with links kept intact.",
      access: "Read issues, write comments",
      minutes: 6,
    },
    {
      id: "queuefern",
      name: "Queuefern",
      category: "ticketing",
      checks: 5,
      summary: "Service desk requests for access grants, matched against the access review.",
      access: "Read requests",
      minutes: 6,
    },
    {
      id: "taskmoor",
      name: "Taskmoor",
      category: "ticketing",
      checks: 4,
      summary: "Remediation tasks assigned to owners with due dates that follow your patch policy.",
      access: "Create tasks in one board",
      minutes: 4,
    },
    {
      id: "commitry",
      name: "Commitry",
      category: "code",
      checks: 16,
      summary: "Branch protection, required reviews and who can merge to the default branch.",
      access: "Read-only organization app",
      minutes: 6,
    },
    {
      id: "branchwell",
      name: "Branchwell",
      category: "code",
      checks: 13,
      summary: "Pipeline runs, deployment approvals and environment separation as change evidence.",
      access: "Pipeline read token",
      minutes: 8,
    },
    {
      id: "repoharbor",
      name: "Repoharbor",
      category: "code",
      checks: 12,
      summary: "Repository settings and secret scanning results for self-hosted code.",
      access: "Admin read scope",
      minutes: 10,
    },
    {
      id: "buildmoss",
      name: "Buildmoss",
      category: "code",
      checks: 9,
      summary: "Dependency and container image scans with fix deadlines by severity.",
      access: "Scan results read",
      minutes: 5,
    },
    {
      id: "devicefold",
      name: "Devicefold",
      category: "endpoint",
      checks: 15,
      summary: "Disk encryption, screen lock and OS versions on every company laptop.",
      access: "Device inventory read",
      minutes: 7,
    },
    {
      id: "fleetlantern",
      name: "Fleetlantern",
      category: "endpoint",
      checks: 12,
      summary: "Endpoint protection status and alerts from your security agent.",
      access: "Read-only console role",
      minutes: 6,
    },
    {
      id: "endpost",
      name: "Endpost",
      category: "endpoint",
      checks: 8,
      summary: "Mobile devices: passcodes, encryption and remote-wipe readiness.",
      access: "Device reports API",
      minutes: 6,
    },
    {
      id: "laptrail",
      name: "Laptrail",
      category: "endpoint",
      checks: 6,
      summary: "A lightweight agent for teams without device management: encryption, updates and lock settings.",
      access: "Agent installed per device",
      minutes: 3,
    },
  ];

  /*
   * Pricing (US dollars per month, billed monthly). The plan follows the employee count.
   * Monthly total = base + extra employees x perEmployee + extra frameworks x extraFramework + add-ons.
   * Annual billing takes ANNUAL_DISCOUNT percent off and rounds to whole dollars per month.
   */
  const ANNUAL_DISCOUNT = 20;
  const PLANS = [
    {
      id: "essentials",
      name: "Essentials",
      maxEmployees: 100,
      base: 690,
      includedEmployees: 25,
      perEmployee: 8,
      includedFrameworks: 1,
      extraFramework: 240,
      includes: [],
    },
    {
      id: "growth",
      name: "Growth",
      maxEmployees: 500,
      base: 1450,
      includedEmployees: 100,
      perEmployee: 6,
      includedFrameworks: 2,
      extraFramework: 200,
      includes: ["trust"],
    },
    {
      id: "scale",
      name: "Scale",
      maxEmployees: 2000,
      base: 3200,
      includedEmployees: 500,
      perEmployee: 4,
      includedFrameworks: 3,
      extraFramework: 160,
      includes: ["trust", "vendor"],
    },
  ];
  const ADDONS = [
    {
      id: "vendor",
      name: "Vendor risk management",
      unit: "flat",
      price: 260,
      note: "Questionnaires, risk tiers and yearly reviews",
    },
    {
      id: "pentest",
      name: "Penetration test coordination",
      unit: "flat",
      price: 350,
      note: "Scoping, scheduling and findings tracked to closure",
    },
    {
      id: "training",
      name: "Security awareness training",
      unit: "employee",
      price: 2,
      note: "Per employee, with completion evidence",
    },
    {
      id: "trust",
      name: "Trust center with NDA workflow",
      unit: "flat",
      price: 120,
      note: "Custom domain, gated documents and access requests",
    },
  ];

  /*
   * Readiness assessment. Each answer scores up to 20 points (five scored questions, 100 in all) and
   * adds weeks of work. Gaps are ranked by points missing; ties keep question order.
   */
  const ASSESSMENT = {
    sizes: {
      s1: { label: "1–50 people", factor: 1 },
      s2: { label: "51–200 people", factor: 1.15 },
      s3: { label: "201–1,000 people", factor: 1.35 },
      s4: { label: "More than 1,000 people", factor: 1.6 },
    },
    questions: [
      {
        id: "cloud",
        title: "Where does your product run?",
        gap: "Cloud configuration evidence",
        options: {
          iac: { label: "One cloud provider, defined in code", points: 20, weeks: 0, fix: "" },
          single: {
            label: "One cloud provider, mostly set up by hand",
            points: 15,
            weeks: 1,
            fix: "Capture console-made resources in code or document them, so changes leave a trail.",
          },
          multi: {
            label: "Two or more cloud providers",
            points: 10,
            weeks: 2,
            fix: "Connect every account and agree one baseline for encryption, logging and network rules.",
          },
          hybrid: {
            label: "Cloud plus our own servers",
            points: 6,
            weeks: 3,
            fix: "Inventory on-premises systems and decide which are in scope before choosing controls.",
          },
        },
      },
      {
        id: "policies",
        title: "Do you have written security policies?",
        gap: "Security policies",
        options: {
          approved: { label: "Yes, approved and reviewed every year", points: 20, weeks: 0, fix: "" },
          drafts: {
            label: "Some drafts, not formally approved",
            points: 10,
            weeks: 2,
            fix: "Finish the core set from templates, get leadership approval and collect acknowledgments.",
          },
          none: {
            label: "Not yet",
            points: 0,
            weeks: 4,
            fix: "Start with the information security, access, incident response and vendor policies.",
          },
        },
      },
      {
        id: "identity",
        title: "How do people sign in to work tools?",
        gap: "Identity, SSO and MFA",
        options: {
          sso: { label: "Single sign-on with MFA everywhere", points: 20, weeks: 0, fix: "" },
          most: {
            label: "MFA on most tools, no single sign-on",
            points: 12,
            weeks: 1,
            fix: "Turn on MFA everywhere and put production and admin tools behind single sign-on.",
          },
          patchy: {
            label: "Mostly passwords, MFA here and there",
            points: 4,
            weeks: 3,
            fix: "Enforce MFA for every workforce account first; it is the most common early audit finding.",
          },
        },
      },
      {
        id: "logging",
        title: "How do you handle logs?",
        gap: "Logging and alerting",
        options: {
          central: { label: "Central logging, alerts and a year's retention", points: 20, weeks: 0, fix: "" },
          partial: {
            label: "Some logs collected, few alerts",
            points: 10,
            weeks: 2,
            fix: "Send audit logs to one place, keep them for twelve months and alert on risky events.",
          },
          adhoc: {
            label: "We look at logs when something breaks",
            points: 3,
            weeks: 3,
            fix: "Turn on cloud audit trails and centralize them before the observation period starts.",
          },
        },
      },
      {
        id: "vendors",
        title: "Do you review vendors' security?",
        gap: "Vendor risk reviews",
        options: {
          formal: { label: "Yes, with risk tiers and yearly reviews", points: 20, weeks: 0, fix: "" },
          informal: {
            label: "Informally, for the big ones",
            points: 9,
            weeks: 1,
            fix: "List every vendor that touches customer data, tier them and keep the review records.",
          },
          none: {
            label: "Not yet",
            points: 0,
            weeks: 2,
            fix: "Build a vendor inventory and collect reports or questionnaires from critical vendors.",
          },
        },
      },
    ],
    // Preparation weeks before an audit (or assessment) could start, for an organization with no gaps.
    targets: {
      soc2t1: {
        label: "SOC 2 Type I",
        weeks: [4, 6],
        after: "Your CPA firm then tests control design as of one date.",
      },
      soc2t2: {
        label: "SOC 2 Type II",
        weeks: [6, 9],
        after: "Then an observation period (often 3–6 months for a first report) before audit fieldwork.",
      },
      iso27001: {
        label: "ISO 27001",
        weeks: [10, 14],
        after: "Then Stage 1 and Stage 2 audits with an accredited certification body.",
      },
      hipaa: {
        label: "HIPAA",
        weeks: [5, 8],
        after: "Then a risk analysis review, often with an independent assessor.",
      },
      pci: {
        label: "PCI DSS",
        weeks: [8, 12],
        after: "Then an assessment by a Qualified Security Assessor or a Self-Assessment Questionnaire.",
      },
      gdpr: {
        label: "GDPR",
        weeks: [5, 8],
        after: "GDPR has no certificate; the work continues as your processing changes.",
      },
    },
    deadlines: {
      d3: { label: "Within 3 months", weeks: 13 },
      d6: { label: "In 3–6 months", weeks: 26 },
      d12: { label: "In 6–12 months", weeks: 52 },
      none: { label: "No fixed date", weeks: null },
    },
    bands: [
      { min: 80, label: "Well prepared" },
      { min: 55, label: "Solid foundation" },
      { min: 30, label: "Early stage" },
      { min: 0, label: "Starting out" },
    ],
  };

  /* Trust center: the page Wardline publishes about its own security program. */
  const TRUST_CATEGORIES = [
    {
      id: "infra",
      name: "Infrastructure",
      controls: [
        ["Production data encrypted at rest", "pass"],
        ["Encryption in transit with TLS 1.2 or later", "pass"],
        ["Production network segmented from corporate", "pass"],
        ["Encrypted backups restored and tested monthly", "pass"],
        ["Infrastructure defined in code with peer review", "pass"],
      ],
    },
    {
      id: "access",
      name: "Access and identity",
      controls: [
        ["Single sign-on and MFA for all employees", "pass"],
        ["Quarterly access reviews for production", "pass"],
        ["Access removed within one business day of departure", "pass"],
        ["Privileged access time-limited and approved", "pass"],
      ],
    },
    {
      id: "app",
      name: "Application security",
      controls: [
        ["Required code review before merge", "pass"],
        ["Dependency scanning on every build", "pass"],
        ["Annual third-party penetration test", "pass"],
        ["Medium-severity findings fixed within 30 days", "attn"],
      ],
    },
    {
      id: "people",
      name: "People and endpoints",
      controls: [
        ["Security awareness training at hire and yearly", "pass"],
        ["Background checks for new hires where lawful", "pass"],
        ["Disk encryption on every company laptop", "pass"],
        ["Endpoint protection on every company laptop", "pass"],
      ],
    },
    {
      id: "ops",
      name: "Operations and resilience",
      controls: [
        ["Incident response plan tested every year", "pass"],
        ["Business continuity plan with defined RTO and RPO", "pass"],
        ["Centralized logging with twelve-month retention", "pass"],
        ["Vendor reviews for every critical subprocessor", "pass"],
      ],
    },
  ];
  const SUBPROCESSORS = [
    { name: "Cirrova", purpose: "Cloud hosting and storage", location: "United States", data: "All customer data" },
    { name: "Altastack", purpose: "Disaster recovery region", location: "United States", data: "Encrypted backups" },
    {
      name: "Mailcrest Relay",
      purpose: "Transactional email",
      location: "United States",
      data: "Names, email addresses",
    },
    {
      name: "Tickbarrow",
      purpose: "Customer support tickets",
      location: "United States",
      data: "Support conversations",
    },
    {
      name: "Ledgerfin Billing",
      purpose: "Subscription billing",
      location: "United States",
      data: "Billing contacts, invoices",
    },
    {
      name: "Northvane Analytics",
      purpose: "Product usage analytics",
      location: "United States",
      data: "Pseudonymous usage events",
    },
  ];
  // Documents on the trust center. `gated` documents need a request and, for most, an NDA.
  const DOCUMENTS = [
    { id: "soc2", name: "SOC 2 Type II report", gated: true, nda: true, kind: "report" },
    { id: "iso", name: "ISO 27001 certificate", gated: false, nda: false, kind: "certificate" },
    { id: "pentest", name: "Penetration test summary", gated: true, nda: true, kind: "pentest" },
    { id: "bridge", name: "Bridge letter", gated: true, nda: false, kind: "letter" },
    { id: "policies", name: "Security policy overview", gated: false, nda: false, kind: "policy" },
    { id: "caiq", name: "Completed security questionnaire", gated: true, nda: true, kind: "questionnaire" },
  ];
  // Addresses from these domains are personal, not work, emails.
  const PERSONAL_DOMAINS = [
    "gmail.com",
    "googlemail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "live.com",
    "icloud.com",
    "me.com",
    "aol.com",
    "proton.me",
    "protonmail.com",
    "gmx.com",
  ];

  /* Book a demo. Slot times are Eastern (the Richmond office); the page shows them in the visitor's zone too. */
  const DEMO = {
    roles: {
      security: "Security or IT",
      engineering: "Engineering",
      founder: "Founder or executive",
      compliance: "Compliance, risk or legal",
      other: "Something else",
    },
    sizes: { s1: "1–50", s2: "51–200", s3: "201–1,000", s4: "More than 1,000" },
    timelines: {
      t3: "Within 3 months",
      t6: "In 3–6 months",
      t12: "In 6–12 months",
      exploring: "Just exploring",
    },
    times: ["10:00", "11:30", "13:00", "14:30", "16:00"],
    days: 5,
  };
  // Solutions engineers. The first rule that matches a request decides who joins the call.
  const SPECIALISTS = [
    { id: "soledad", name: "Soledad Ilunga", role: "Solutions engineer, health care", rule: "hipaa" },
    { id: "evander", name: "Evander Lachance", role: "Solutions engineer, payments", rule: "pci" },
    { id: "ravindra", name: "Ravindra Satterwhite", role: "Enterprise solutions lead", rule: "large" },
    { id: "leontyne", name: "Leontyne Fairbairn", role: "Solutions engineer", rule: "default" },
  ];

  /* Customer stories. Metrics are before and after, with lower or higher better as noted. */
  const STORIES = [
    {
      id: "kelvara",
      name: "Kelvara",
      industry: "Payments API",
      size: "140 employees",
      frameworks: ["soc2", "pci"],
      quote:
        "Our auditors still did their job, and they were thorough. The difference was that every evidence request already had an answer with a date and an owner.",
      person: "Folasade Okwuosa",
      title: "Head of Security",
      outcome:
        "Received its first SOC 2 Type II report from its CPA firm after a six-month observation period, alongside its PCI DSS assessment.",
      metrics: [
        { label: "Hours a month collecting evidence", before: 62, after: 14, unit: "h", better: "lower" },
        { label: "Days to answer a security questionnaire", before: 9, after: 2, unit: " days", better: "lower" },
        { label: "Controls tested automatically", before: 0, after: 71, unit: "%", better: "higher" },
      ],
    },
    {
      id: "mendwell",
      name: "Mendwell",
      industry: "Virtual physical therapy",
      size: "85 employees",
      frameworks: ["hipaa", "soc2"],
      quote:
        "We sell to health systems, and every one of them sends a questionnaire. Now we send a trust center link and a business associate agreement the same afternoon.",
      person: "Darnell Quarles",
      title: "Chief Technology Officer",
      outcome:
        "Completed a HIPAA risk analysis with an independent assessor and received a SOC 2 Type I report from its CPA firm.",
      metrics: [
        { label: "Hours for a quarterly access review", before: 24, after: 4, unit: "h", better: "lower" },
        { label: "Vendors with a signed BAA on file", before: 11, after: 38, unit: "", better: "higher" },
        { label: "Open policy gaps", before: 27, after: 3, unit: "", better: "lower" },
      ],
    },
    {
      id: "hirebeam",
      name: "Hirebeam",
      industry: "Hiring platform",
      size: "320 employees",
      frameworks: ["iso27001", "gdpr", "soc2"],
      quote:
        "ISO 27001 made us write the management system down. Wardline is where it lives now, so the surveillance audit felt like a normal week.",
      person: "Valentina Ruelas",
      title: "Director of Security and IT",
      outcome:
        "Certified to ISO 27001 by an accredited certification body with two minor nonconformities, both closed before the deadline.",
      metrics: [
        { label: "Questionnaire answers reused from the library", before: 0, after: 64, unit: "%", better: "higher" },
        { label: "Days to close an audit finding", before: 41, after: 12, unit: " days", better: "lower" },
        { label: "Data processing agreements tracked", before: 9, after: 57, unit: "", better: "higher" },
      ],
    },
  ];

  return {
    FRAMEWORKS,
    FAMILIES,
    CONTROLS,
    INTEGRATION_CATEGORIES,
    INTEGRATIONS,
    ANNUAL_DISCOUNT,
    PLANS,
    ADDONS,
    ASSESSMENT,
    TRUST_CATEGORIES,
    SUBPROCESSORS,
    DOCUMENTS,
    PERSONAL_DOMAINS,
    DEMO,
    SPECIALISTS,
    STORIES,
  };
})();
