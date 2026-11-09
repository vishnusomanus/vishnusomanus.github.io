/*
 * Tessel: the content that drives the interactive parts of the site. Edit these lists and the pages
 * follow; main.js reads everything from window.TESSEL. Prices are US dollars.
 */
window.TESSEL = {
  /* ---------- Home: the mini form builder ---------- */

  // Field types visitors can add in the hero builder. `accent` colors the field's tab in the editor.
  FIELD_TYPES: {
    short: { name: "Short answer", label: "Your name", accent: "tomato", placeholder: "Type your answer" },
    email: { name: "Email", label: "Email address", accent: "peri", placeholder: "name@company.example" },
    phone: { name: "Phone", label: "Phone number", accent: "bubble", placeholder: "(402) 555-0131" },
    choice: {
      name: "Multiple choice",
      label: "Pick one",
      accent: "butter",
      options: ["Saturday morning", "Saturday afternoon", "Sunday"],
    },
    rating: { name: "Rating", label: "How did we do?", accent: "mint" },
    date: { name: "Date", label: "Preferred date", accent: "peri" },
    long: { name: "Paragraph", label: "Anything else?", accent: "butter", placeholder: "Tell us more" },
    consent: { name: "Checkbox", label: "Send me the monthly newsletter", accent: "mint" },
  },
  // The order of the "Add a field" buttons.
  FIELD_ORDER: ["short", "email", "choice", "rating", "date", "phone", "long", "consent"],
  MAX_FIELDS: 8,
  // What the builder shows on a first visit (and after Reset).
  BUILDER_DEFAULT: {
    title: "Fall cleanup volunteers",
    fields: [
      { type: "short", label: "Your name", required: true },
      { type: "email", label: "Email address", required: true },
      { type: "choice", label: "Which shift works best?", required: false },
    ],
  },

  /* ---------- Features: the conditional logic demo ---------- */

  // Ticket prices for the event registration demo, in dollars.
  TICKETS: {
    general: { name: "General admission", price: 40 },
    student: { name: "Student", price: 15 },
    supporter: { name: "Supporter", price: 75 },
  },
  ADDON_TSHIRT: 18,

  /* ---------- Templates gallery ---------- */

  TEMPLATE_CATEGORIES: {
    events: "Events",
    feedback: "Feedback",
    hr: "HR & hiring",
    education: "Education",
    leads: "Sales & leads",
    orders: "Orders & payments",
    nonprofit: "Nonprofit",
  },
  // Each template: id (used in URLs), category key, description, the fields it starts with,
  // how many teams use it, and the accent color of its thumbnail.
  TEMPLATES: [
    { id: "volunteer-signup", name: "Volunteer sign-up", cat: "nonprofit", uses: 4210, accent: "mint", desc: "Collect shifts, T-shirt sizes and emergency contacts for your next workday.", fields: ["Full name", "Email", "Shift (choice)", "T-shirt size (choice)", "Emergency contact", "Waiver (checkbox)"] },
    { id: "event-rsvp", name: "Event RSVP", cat: "events", uses: 9830, accent: "tomato", desc: "Yes, no or maybe, plus guests and dietary needs that only appear when someone says yes.", fields: ["Name", "Email", "Attending? (choice)", "Number of guests", "Dietary needs (if yes)", "Message to the host"] },
    { id: "conference-registration", name: "Conference registration", cat: "events", uses: 3120, accent: "peri", desc: "Ticket tiers with payment, session picks and badge details in one tidy flow.", fields: ["Name for badge", "Company", "Ticket (payment)", "Workshops (multi-choice)", "Accessibility needs", "Invoice email"] },
    { id: "nps-survey", name: "NPS survey", cat: "feedback", uses: 12450, accent: "butter", desc: "The classic 0–10 question with a follow-up that changes for promoters and detractors.", fields: ["How likely are you to recommend us? (0–10)", "What's the main reason? (logic)", "May we follow up? (checkbox)"] },
    { id: "product-feedback", name: "Product feedback", cat: "feedback", uses: 6020, accent: "peri", desc: "Find out what to build next, with screenshots attached and a priority slider.", fields: ["Which feature?", "What were you trying to do?", "How important is this? (rating)", "Screenshot (upload)", "Email"] },
    { id: "customer-satisfaction", name: "Customer satisfaction", cat: "feedback", uses: 7740, accent: "mint", desc: "Five quick ratings after a support case closes, with an optional comment.", fields: ["Speed (rating)", "Friendliness (rating)", "Was it solved? (choice)", "Comments"] },
    { id: "job-application", name: "Job application", cat: "hr", uses: 5390, accent: "tomato", desc: "Résumé upload, portfolio link and screening questions that route to the right hiring manager.", fields: ["Full name", "Email", "Role (choice)", "Résumé (upload)", "Portfolio link", "Earliest start date"] },
    { id: "time-off-request", name: "Time-off request", cat: "hr", uses: 2880, accent: "butter", desc: "Dates, coverage and manager approval in a form people can fill in from their phones.", fields: ["Name", "Team (choice)", "First day off (date)", "Last day off (date)", "Who's covering?", "Notes"] },
    { id: "onboarding-checklist", name: "New hire onboarding", cat: "hr", uses: 1960, accent: "peri", desc: "Payroll details, laptop preferences and a first-week checklist for new starters.", fields: ["Legal name", "Preferred name", "Laptop (choice)", "Shirt size", "Allergies", "I've read the handbook (checkbox)"] },
    { id: "course-evaluation", name: "Course evaluation", cat: "education", uses: 3470, accent: "mint", desc: "End-of-term feedback with anonymous answers and a rating for each unit.", fields: ["Course (choice)", "Pace (rating)", "Clarity (rating)", "Best part", "What should change?"] },
    { id: "field-trip-permission", name: "Field trip permission", cat: "education", uses: 2210, accent: "tomato", desc: "Parent signature, medical notes and a payment for the bus, all on one page.", fields: ["Student name", "Grade (choice)", "Parent signature", "Medical notes", "Trip fee (payment)"] },
    { id: "class-signup", name: "Class sign-up", cat: "education", uses: 1640, accent: "butter", desc: "Let students pick a section, with seats that close when a class fills.", fields: ["Name", "Email", "Section (limited choice)", "Experience level (choice)"] },
    { id: "lead-capture", name: "Lead capture", cat: "leads", uses: 8890, accent: "peri", desc: "Short and friendly, with company size routing hot leads straight to your CRM.", fields: ["Work email", "Company", "Team size (choice)", "What brings you here?"] },
    { id: "quote-request", name: "Quote request", cat: "leads", uses: 4350, accent: "mint", desc: "Project scope, budget range and photo uploads for service businesses.", fields: ["Name", "Phone", "Service (choice)", "Budget range (choice)", "Photos (upload)", "Address"] },
    { id: "demo-booking", name: "Demo booking", cat: "leads", uses: 2730, accent: "tomato", desc: "Qualify the meeting before it hits the calendar, with a time picker at the end.", fields: ["Work email", "Role (choice)", "Current tool", "Preferred time (date)"] },
    { id: "order-form", name: "Order form", cat: "orders", uses: 6610, accent: "butter", desc: "Products, quantities and card payment with totals that update as people choose.", fields: ["Product (choice + quantity)", "Size (choice)", "Delivery or pickup? (logic)", "Address (if delivery)", "Payment"] },
    { id: "donation-form", name: "Donation form", cat: "nonprofit", uses: 3980, accent: "tomato", desc: "Suggested amounts, monthly giving and a tribute message, with card payments built in.", fields: ["Amount (choice)", "Give monthly? (checkbox)", "In honor of", "Name", "Email", "Payment"] },
    { id: "membership-renewal", name: "Membership renewal", cat: "nonprofit", uses: 1420, accent: "peri", desc: "Renew, update details and pick a membership level in under a minute.", fields: ["Member number", "Level (choice)", "Updated address", "Payment"] },
  ],

  /* ---------- Pricing ---------- */

  // Response-volume slider stops (responses per month).
  VOLUME_STEPS: [100, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000],
  DEFAULT_VOLUME: 1000,
  ANNUAL_DISCOUNT: 0.2, // 20% off when billed yearly
  // base: monthly price; included: responses per month; extra: price per block of `block` responses above
  // `included`; max: the most responses the plan can take (null = no limit).
  PLANS: {
    free: { name: "Free", base: 0, included: 100, block: 0, extra: 0, max: 100 },
    maker: { name: "Maker", base: 24, included: 1000, block: 1000, extra: 8, max: 10000 },
    team: { name: "Team", base: 59, included: 10000, block: 5000, extra: 15, max: 100000 },
  },

  /* ---------- Integrations ---------- */

  INTEGRATION_CATEGORIES: {
    payments: "Payments",
    crm: "CRM",
    email: "Email & marketing",
    sheets: "Sheets & storage",
    chat: "Team chat",
    automation: "Automation",
    analytics: "Analytics",
  },
  // glyph: the shape drawn in the integration's logo tile (see `glyph()` in main.js).
  INTEGRATIONS: [
    { id: "tidepay", name: "Tidepay", cat: "payments", glyph: "wave", accent: "peri", desc: "Take card and wallet payments inside any form. Refunds sync back to the response.", syncs: ["Payment status on every response", "Receipts from your own domain", "Refunds and disputes"] },
    { id: "ferncard", name: "Ferncard", cat: "payments", glyph: "leaf", accent: "mint", desc: "Recurring donations and memberships with saved cards and dunning emails.", syncs: ["Monthly and yearly plans", "Failed payment retries", "Donor records"] },
    { id: "coinlatch", name: "Coinlatch", cat: "payments", glyph: "coin", accent: "butter", desc: "Send invoices from a form submission and mark them paid automatically.", syncs: ["Invoices from responses", "Paid and overdue status", "PDF receipts"] },
    { id: "pipewren", name: "Pipewren", cat: "crm", glyph: "bird", accent: "tomato", desc: "Create or update contacts and deals the moment someone submits.", syncs: ["Contacts by email", "Deals with amount and stage", "Owner by territory"] },
    { id: "brindle", name: "Brindle CRM", cat: "crm", glyph: "stripes", accent: "butter", desc: "Map any field to a Brindle property, including custom objects.", syncs: ["Custom objects", "Lead source and campaign", "Two-way field mapping"] },
    { id: "mailcairn", name: "Mailcairn", cat: "email", glyph: "stack", accent: "peri", desc: "Add people to lists and tag them by their answers, with double opt-in.", syncs: ["Lists and tags", "Consent timestamp", "Merge fields"] },
    { id: "postmill", name: "Postmill", cat: "email", glyph: "envelope", accent: "bubble", desc: "Trigger a drip sequence from a quiz result or a sign-up form.", syncs: ["Sequence enrollment", "Quiz scores as fields", "Unsubscribes"] },
    { id: "slatebook", name: "Slatebook", cat: "sheets", glyph: "grid", accent: "mint", desc: "Every response becomes a row. Edit a column name and Tessel keeps up.", syncs: ["One row per response", "New columns for new fields", "Backfill old responses"] },
    { id: "sheetfold", name: "Sheetfold", cat: "sheets", glyph: "fold", accent: "butter", desc: "Send responses to a shared workbook, one tab per form.", syncs: ["A tab per form", "Formulas left alone", "Hourly or instant sync"] },
    { id: "dockyard", name: "Dockyard Drive", cat: "sheets", glyph: "box", accent: "peri", desc: "File uploads land in tidy folders named after the form and the date.", syncs: ["Uploads by folder", "Signed PDFs of responses", "Retention rules"] },
    { id: "quaychat", name: "Quaychat", cat: "chat", glyph: "bubble", accent: "tomato", desc: "Post new responses to a channel, with buttons to assign or reply.", syncs: ["Channel per form", "Mentions by answer", "Daily digest"] },
    { id: "chimewell", name: "Chimewell", cat: "chat", glyph: "bell", accent: "butter", desc: "Ping the right person when an answer needs attention, like a low rating.", syncs: ["Alerts by rule", "Direct messages", "Quiet hours"] },
    { id: "zipcrest", name: "Zipcrest", cat: "automation", glyph: "bolt", accent: "butter", desc: "Connect Tessel to thousands of apps with no code. Triggers and actions both ways.", syncs: ["New response trigger", "Create response action", "Field-level filters"] },
    { id: "hookwire", name: "Webhooks", cat: "automation", glyph: "hook", accent: "mint", desc: "Signed JSON to any URL within a second of a submit, with retries.", syncs: ["HMAC signatures", "Automatic retries", "Delivery log"] },
    { id: "lanternly", name: "Lanternly", cat: "analytics", glyph: "lantern", accent: "tomato", desc: "Send form views, starts and completions as events to your dashboards.", syncs: ["View, start, finish events", "UTM parameters", "Drop-off by field"] },
    { id: "calquay", name: "Calquay", cat: "automation", glyph: "calendar", accent: "peri", desc: "Book a meeting right after the last question, on the right person's calendar.", syncs: ["Round-robin booking", "Time zone detection", "Reschedule links"] },
    { id: "notchboard", name: "Notchboard", cat: "automation", glyph: "board", accent: "mint", desc: "Turn bug reports and requests into cards on the right board and column.", syncs: ["Cards by answer", "Labels and assignees", "Attachments"] },
    { id: "signbird", name: "Signbird", cat: "crm", glyph: "pen", accent: "bubble", desc: "Collect a legally binding signature as the last step of a form.", syncs: ["Signed PDFs", "Audit trail", "Countersigning"] },
    { id: "sumbridge", name: "Sumbridge", cat: "analytics", glyph: "bars", accent: "butter", desc: "Pipe responses into your warehouse every hour for proper reporting.", syncs: ["Hourly loads", "Schema changes handled", "Deleted responses"] },
    { id: "deskwhistle", name: "Deskwhistle", cat: "chat", glyph: "whistle", accent: "peri", desc: "Open a support ticket from a contact form, with the customer's history attached.", syncs: ["Tickets with priority", "Customer matching", "Replies back to Tessel"] },
  ],

  /* ---------- Changelog ---------- */

  // Real release dates. While KEEP_DEMO_CURRENT is on (main.js), they move forward by whole weeks
  // so the newest entry always reads as recent. tag: new | improved | fixed.
  CHANGES: [
    { date: "2026-10-22", tag: "new", title: "Payment fields on every plan", body: ["Take card and wallet payments on the Free plan too, with a 2.9% fee instead of a monthly price.", "Totals update live as people pick quantities and add-ons."] },
    { date: "2026-10-14", tag: "improved", title: "Logic editor, now with groups", body: ["Combine conditions with AND and OR groups, and see every rule that touches a field in one place.", "Rules that can never fire are flagged in yellow."] },
    { date: "2026-10-06", tag: "fixed", title: "Date fields respect the respondent's locale", body: ["Dates are typed and shown the way respondents expect, while your exports stay in ISO format."] },
    { date: "2026-09-29", tag: "new", title: "Slatebook backfill", body: ["Connect a form that already has answers and choose to send every past response as rows."] },
    { date: "2026-09-17", tag: "improved", title: "Faster forms on slow phones", body: ["Forms load 38% faster on 3G by sending only the fields on the first page.", "Images in forms are resized for the screen they're on."] },
    { date: "2026-09-08", tag: "new", title: "Response limits and closing dates", body: ["Close a form after a number of responses or at a date and time, with your own closed message."] },
    { date: "2026-08-26", tag: "fixed", title: "Rating fields with screen readers", body: ["Every star now announces its value and the total, and arrow keys move between them."] },
    { date: "2026-08-13", tag: "improved", title: "Drop-off chart by field", body: ["See where people stop. Hover any field to see the share of starts that reached it."] },
    { date: "2026-07-30", tag: "new", title: "Brutally simple themes", body: ["Pick a theme, a font and a corner radius. Tessel checks contrast before you publish."] },
    { date: "2026-07-16", tag: "fixed", title: "Duplicate submissions on double taps", body: ["A second tap on Submit within two seconds no longer creates a second response."] },
  ],
  CHANGE_TAGS: { new: "New", improved: "Improved", fixed: "Fixed" },

  /* ---------- Customers ---------- */

  INDUSTRIES: { education: "Education", health: "Healthcare", retail: "Retail", nonprofit: "Nonprofit", finance: "Finance" },
  STORIES: [
    { id: "bramblecourt", company: "Bramblecourt Schools", industry: "education", place: "Council Bluffs, Iowa", accent: "butter", person: "Lavinia Plaskett", role: "Director of operations", quote: "We replaced 140 paper permission slips a week. Parents fill them in at the bus stop.", metric: "140", metricLabel: "paper forms retired every week", before: 31, after: 92, chartLabel: "Permission slips back on time", forms: "Field trips, enrollment, lunch accounts" },
    { id: "hobnail", company: "Hobnail Brewing", industry: "retail", place: "Grand Island, Nebraska", accent: "tomato", person: "Thelonious Yoder", role: "Co-owner", quote: "Our taproom events sell out through a Tessel form now. The payment field paid for itself in a weekend.", metric: "$48k", metricLabel: "in event tickets sold in year one", before: 0, after: 48, chartLabel: "Ticket revenue ($k)", forms: "Event tickets, private bookings, mug club" },
    { id: "quillfern", company: "Quillfern Health", industry: "health", place: "Sioux Falls, South Dakota", accent: "mint", person: "Zuri Venkataraman", role: "Patient experience manager", quote: "Intake used to take twelve minutes at the front desk. Now patients finish it at home in four.", metric: "8 min", metricLabel: "saved on every check-in", before: 12, after: 4, chartLabel: "Minutes per intake", forms: "Patient intake, satisfaction surveys, referrals" },
    { id: "kettlerun", company: "Kettlerun Outfitters", industry: "retail", place: "Fargo, North Dakota", accent: "peri", person: "Mateus Wojcik", role: "Marketing lead", quote: "The quiz finds people the right tent. Completion went from a third to almost everyone.", metric: "2.4×", metricLabel: "more quiz completions", before: 34, after: 81, chartLabel: "Quiz completion rate (%)", forms: "Gear quiz, repair requests, warranty claims" },
    { id: "sandhill", company: "Sandhill Co-op", industry: "nonprofit", place: "Kearney, Nebraska", accent: "bubble", person: "Calla Szymanski", role: "Membership coordinator", quote: "Renewals happen while people are standing at the register. We stopped mailing reminder cards.", metric: "3,900", metricLabel: "member renewals collected online", before: 46, after: 88, chartLabel: "Members renewed on time (%)", forms: "Renewals, volunteer shifts, board elections" },
    { id: "wickerline", company: "Wickerline Insurance", industry: "finance", place: "Des Moines, Iowa", accent: "butter", person: "Ignatius Hightower", role: "Claims operations manager", quote: "Logic means a renter never sees homeowner questions. Claims arrive complete the first time.", metric: "61%", metricLabel: "fewer back-and-forth emails per claim", before: 5.2, after: 2, chartLabel: "Emails per claim", forms: "First notice of loss, policy changes, feedback" },
  ],
};
