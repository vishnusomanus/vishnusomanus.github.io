/* Fernley Whitcomb CPAs (Accrue template) — content and settings. Edit here; assets/js/main.js reads
 * window.ACCRUE. Keys used in URLs (?s=, ?a=, ?type=, ?entity=…) must stay lowercase words with hyphens.
 *
 *  FIRM            name, contact details, time zone
 *  SERVICES        the services (services.html, service.html?s=<slug>, the booking form)
 *  DEADLINE_RULES  the tax calendar as rules (deadlines.html, the home teaser, the top bar)
 *  TAXPAYER_TYPES  filters on the calendar (?type=)
 *  CHECKLISTS      the tax-season document checklist (ticks are saved)
 *  ESTIMATOR       the fee estimator on pricing.html
 *  BOOKING         consultation slots on contact.html
 *  CATEGORIES, ARTICLES   insights.html and article.html?a=<slug>
 */
window.ACCRUE = (function () {
  'use strict';

  const FIRM = {
    name: 'Fernley Whitcomb CPAs',
    phone: '(423) 555-0138',
    phoneHref: '+14235550138',
    email: 'hello@fernleywhitcomb.example',
    // Every date and time on the site is worked out in this time zone.
    timeZone: 'America/New_York',
    // Prefix for consultation request references (FW-7K2QD).
    refPrefix: 'FW'
  };

  /* ---------------------------------------------------------------- Services
   * slug: used in service.html?s=<slug> and contact.html?service=<slug>.
   * art: SVG in assets/img/services/. from: the price line shown on cards.
   */
  const SERVICES = {
    'individual-tax': {
      name: 'Individual tax returns',
      short: 'Federal returns, Georgia and Alabama nonresident returns, and year-round planning for households.',
      from: 'From $325 a return',
      art: 'assets/img/services/individual-tax.svg',
      intro: 'Your federal return prepared and reviewed by a CPA, plus the Georgia or Alabama return if you work across the state line. We ask the questions that find the deductions and credits you qualify for, explain what changed from last year, and stay on call when a letter arrives in July.',
      included: [
        'A planning call before we prepare anything, so nothing is a surprise',
        'Federal Form 1040 with every schedule you need (C, D, E and more)',
        'Georgia and Alabama nonresident or part-year returns for state-line commuters',
        'A second review by a different CPA before you sign',
        'E-filing and direct deposit or scheduled payment',
        'Next year’s estimated payment vouchers worked out for you',
        'Answers to IRS and state letters about the return, at no extra charge'
      ],
      forWho: [
        'Families with W-2 income, a mortgage, childcare costs or college tuition',
        'Chattanooga residents who work in Georgia or Alabama',
        'Freelancers, creators and gig workers with 1099 income',
        'Landlords with one to a handful of rental properties',
        'Anyone who sold a house, inherited money or retired this year'
      ],
      timeline: [
        { when: 'January', step: 'You get your personal checklist and a secure upload link.' },
        { when: 'Within 10 business days of a complete upload', step: 'We prepare the return and send questions, if any.' },
        { when: 'A few days later', step: 'Review call, e-signature and e-filing.' },
        { when: 'Year-round', step: 'Planning check-in in the fall; letters handled when they come.' }
      ],
      faq: [
        { q: 'Do I need to file a Tennessee income tax return?', a: 'No. Tennessee has no income tax on wages, and the Hall tax on interest and dividends was repealed for 2021 onward. You still file a federal return, and a Georgia or Alabama return if you earned wages there.' },
        { q: 'What if I can’t get my documents together by April?', a: 'We file an extension (Form 4868) so you have until October to file. An extension gives you more time to file, not to pay, so we estimate what you owe and schedule a payment with it.' },
        { q: 'Can you guarantee a refund?', a: 'No one honestly can. We make sure you claim everything you’re entitled to and nothing you aren’t, and we tell you what to expect before you sign.' },
        { q: 'How do I send my documents?', a: 'Through the client portal: you upload, we see it right away, and nothing sits in an email inbox. Paper is fine too: drop it at the Cherry Street office.' }
      ],
      related: ['irs-notices', 'bookkeeping', 'advisory']
    },
    'business-tax': {
      name: 'Business tax & Tennessee F&E',
      short: 'Partnership, S corporation and C corporation returns, Tennessee franchise & excise, and business tax.',
      from: 'From $1,440 a year',
      art: 'assets/img/services/business-tax.svg',
      intro: 'Federal business returns and the Tennessee filings that come with them: franchise & excise tax, the state business tax and the city and county versions, plus K-1s that reach owners in time for their own returns. Quarterly estimates are worked out, not guessed.',
      included: [
        'Federal Form 1065, 1120-S or 1120, with K-1s for every owner',
        'Tennessee franchise & excise return (FAE 170) and quarterly estimates when they’re required',
        'Tennessee business tax returns for the state, Hamilton County and the city',
        'Returns in other states where you have employees, property or sales',
        'Extensions filed on time when the books aren’t ready',
        'A year-end planning meeting in November or December'
      ],
      forWho: [
        'LLCs, partnerships and S corporations with two to fifty employees',
        'Contractors and trades businesses working on both sides of the state line',
        'Healthcare practices organized as professional corporations',
        'Owners deciding whether an S corporation election makes sense'
      ],
      timeline: [
        { when: 'January', step: 'Year-end close and the documents we need from you.' },
        { when: 'By March 15', step: 'Partnership and S corporation returns, or an extension and estimated K-1s.' },
        { when: 'By April 15', step: 'C corporation returns and the Tennessee F&E return.' },
        { when: 'Quarterly', step: 'Estimate review so payments match the year you’re actually having.' }
      ],
      faq: [
        { q: 'Does my LLC owe Tennessee franchise & excise tax?', a: 'Usually, yes. Most LLCs, corporations and limited partnerships file F&E, even when they are taxed as a sole proprietorship or partnership federally. Sole proprietors and most general partnerships of individuals don’t.' },
        { q: 'We’re a calendar-year S corporation. When are we due?', a: 'The federal return is due March 15 and the Tennessee F&E return April 15, each moved to the next business day when it falls on a weekend or holiday. Our deadline calendar works the dates out for this year and next.' },
        { q: 'Do you need our books to be with you?', a: 'No. We prepare returns from books kept in-house or by another firm. If they need cleanup first, we quote that separately before we start.' }
      ],
      related: ['bookkeeping', 'payroll', 'advisory']
    },
    bookkeeping: {
      name: 'Monthly bookkeeping',
      short: 'Reconciled books every month, a close by the 15th and reports you can actually read.',
      from: 'From $350 a month',
      art: 'assets/img/services/bookkeeping.svg',
      intro: 'A named bookkeeper reconciles every bank, card and loan account each month, codes the transactions you don’t want to think about and closes the month by the 15th. You get a profit and loss, a balance sheet and three sentences on what changed.',
      included: [
        'Bank, credit card, loan and merchant account reconciliations every month',
        'Month-end close by the 15th, with a short written summary',
        'Sales tax returns for Tennessee (and Georgia or Alabama if you collect there)',
        'Bill and receipt capture, with questions batched into one weekly email',
        '1099 tracking all year, so January is a formality',
        'Catch-up and cleanup for books that have fallen behind (quoted separately)'
      ],
      forWho: [
        'Restaurants reconciling POS deposits, tips and delivery-app payouts',
        'Trades and contractors tracking job costs and retainage',
        'Practices and studios that want clean books before tax season',
        'Anyone more than three months behind on their books'
      ],
      timeline: [
        { when: 'Week 1', step: 'Kickoff call, account access and a review of your chart of accounts.' },
        { when: 'Weeks 2–4', step: 'Cleanup of any months behind, oldest first.' },
        { when: 'Every month', step: 'Reconcile, close by the 15th, send reports and questions.' },
        { when: 'Every quarter', step: 'A review call with your bookkeeper and a CPA.' }
      ],
      faq: [
        { q: 'Which software do you use?', a: 'We work in the major cloud accounting packages and can move you from spreadsheets or desktop software. We recommend one based on your business, not a referral fee.' },
        { q: 'How is the monthly fee set?', a: 'Mainly by the number of transactions a month, plus payroll, states and entity type. The estimator on our pricing page shows the same math we use for a quote.' },
        { q: 'We’re a year behind. Can you help?', a: 'Yes. Cleanup is billed once, per month of catch-up, and we start with the months the next tax return depends on.' }
      ],
      related: ['payroll', 'business-tax', 'advisory']
    },
    payroll: {
      name: 'Payroll',
      short: 'Pay runs, direct deposit, quarterly payroll returns and year-end W-2s, done by people who answer the phone.',
      from: 'From $65 a month + $9 per employee',
      art: 'assets/img/services/payroll.svg',
      intro: 'Weekly, biweekly or semimonthly pay runs with direct deposit, federal and state withholding, Tennessee unemployment and the quarterly Form 941, and W-2s and 1099s on time in January. For crews working in Georgia or Alabama, we withhold for the right state.',
      included: [
        'Pay runs on your schedule, with direct deposit and pay stubs in an employee portal',
        'Federal deposits, quarterly Form 941 and annual Form 940',
        'Tennessee unemployment reports, and Georgia or Alabama withholding when it applies',
        'New-hire reporting and onboarding paperwork',
        'W-2s, W-3 and 1099-NEC forms filed by January 31',
        'Tip reporting for restaurants, and job costing for contractors'
      ],
      forWho: [
        'Businesses with one to fifty employees',
        'S corporation owners paying themselves a reasonable salary',
        'Restaurants with tipped staff',
        'Contractors with crews on both sides of the state line'
      ],
      timeline: [
        { when: 'Week 1', step: 'Setup call, employee details and prior payroll history.' },
        { when: 'Week 2', step: 'A parallel test run alongside your current payroll.' },
        { when: 'From week 3', step: 'Live pay runs, with approval by email or text before each one.' },
        { when: 'Each quarter and January', step: 'Payroll returns and year-end forms filed for you.' }
      ],
      faq: [
        { q: 'Can we switch partway through the year?', a: 'Yes. Quarter starts are easiest, but we bring over year-to-date totals so W-2s are right either way.' },
        { q: 'Who pays penalties if a deposit is late?', a: 'If we miss a deposit we were given the money and approval for, we pay the penalty. That’s in the engagement letter.' },
        { q: 'Do you handle 1099 contractors too?', a: 'Yes: we collect W-9s as you onboard contractors and file the 1099-NEC forms by January 31.' }
      ],
      related: ['bookkeeping', 'business-tax', 'advisory']
    },
    advisory: {
      name: 'Advisory & fractional CFO',
      short: 'Budgets, cash forecasts, pricing and the numbers behind big decisions, without a full-time CFO.',
      from: 'From $1,250 a month',
      art: 'assets/img/services/advisory.svg',
      intro: 'A CPA in your corner every month: a rolling 13-week cash forecast, a budget you actually use, and someone to pressure-test a hire, a lease, a loan or a price change before you commit. Built for owners who have outgrown “we’ll see at tax time”.',
      included: [
        'A monthly meeting with Odell or Lavonne, with a written agenda and notes',
        'A rolling 13-week cash flow forecast',
        'An annual budget and a monthly budget-to-actual report',
        'KPIs picked for your business: food cost, job margin, collections, utilization',
        'Lender and investor packages when you borrow or raise',
        'Tax planning woven in, so year-end has no surprises'
      ],
      forWho: [
        'Businesses with about $1 million to $15 million in revenue',
        'Owners planning a second location, a big hire or a sale',
        'Practices and nonprofits that report to a board',
        'Anyone who has been surprised by a cash crunch'
      ],
      timeline: [
        { when: 'First month', step: 'A diagnostic: where the money goes, and what to fix first.' },
        { when: 'Month two', step: 'Forecast, budget and KPI dashboard in place.' },
        { when: 'Monthly', step: 'Review meeting, updated forecast, decisions and next steps.' },
        { when: 'Year-end', step: 'Tax planning and next year’s budget.' }
      ],
      faq: [
        { q: 'Do we need you to keep our books too?', a: 'It helps, because advisory is only as good as the numbers, but it isn’t required. We’ll tell you up front if your books need work first.' },
        { q: 'Is there a long contract?', a: 'Three months to start, then month to month. Most clients stay because the forecast pays for itself.' }
      ],
      related: ['bookkeeping', 'business-tax', 'payroll']
    },
    nonprofit: {
      name: 'Nonprofits & audit readiness',
      short: 'Form 990s, fund accounting, grant tracking and books that are ready when the auditor arrives.',
      from: 'From $1,680 a year',
      art: 'assets/img/services/nonprofit.svg',
      intro: 'Form 990 preparation, restricted-fund and grant tracking, and the policies, schedules and reconciliations an auditor asks for. We prepare you for an audit; we don’t perform it, so your auditor stays independent.',
      included: [
        'Form 990, 990-EZ or 990-N, with Schedule A, B and the rest',
        'Net asset tracking with and without donor restrictions',
        'Grant budgets, drawdowns and reports to funders',
        'An audit-readiness review: the schedules, reconciliations and policies auditors request',
        'Board-ready financial statements every quarter',
        'Help with state charitable registration renewals'
      ],
      forWho: [
        'Charities and foundations with $250,000 to $10 million in revenue',
        'Organizations facing their first audit or review',
        'Nonprofits with federal grants and Single Audit questions',
        'Boards that want clearer monthly reporting'
      ],
      timeline: [
        { when: 'Month 1', step: 'Readiness review of books, grants and policies.' },
        { when: 'Months 2–3', step: 'Fix list worked through, schedules built.' },
        { when: 'Before fieldwork', step: 'Prepared-by-client list delivered to your auditor.' },
        { when: 'By May 15', step: 'Form 990 filed for calendar-year organizations, or extended to November 15.' }
      ],
      faq: [
        { q: 'Can you do our audit?', a: 'No. A CPA firm can’t audit books it helps prepare, so we get you ready and work alongside the independent auditor you choose.' },
        { q: 'Do small nonprofits have to file anything?', a: 'Almost every tax-exempt organization files something each year. Very small ones file the online 990-N postcard; we’ll tell you which form applies.' }
      ],
      related: ['bookkeeping', 'advisory', 'payroll']
    },
    'irs-notices': {
      name: 'IRS notices & representation',
      short: 'Letters read, answered and resolved by an enrolled agent, from a CP2000 to a full examination.',
      from: 'From $250 per notice',
      art: 'assets/img/services/irs-notices.svg',
      intro: 'Send us a photo of the letter. An enrolled agent reads it, tells you what it means and what it will likely cost, and answers it before the response date. With your power of attorney, the IRS talks to us instead of you.',
      included: [
        'A plain-English read of the notice within one business day',
        'Responses to CP2000 underreported-income notices and balance-due letters',
        'Penalty relief requests, including first-time abatement',
        'Payment plans and installment agreements',
        'Representation in correspondence and office examinations (Form 2848)',
        'Tennessee Department of Revenue notices for F&E and sales tax'
      ],
      forWho: [
        'Anyone holding an IRS letter with a deadline on it',
        'Business owners behind on payroll or sales tax filings',
        'People with years of unfiled returns who want to get current',
        'Clients of other firms who need help with one problem'
      ],
      timeline: [
        { when: 'Day 1', step: 'You upload the notice; we confirm the response date.' },
        { when: 'Within 1 business day', step: 'What it means, what it may cost, and the plan.' },
        { when: 'Before the response date', step: 'We file the response, with your approval.' },
        { when: 'Until it’s closed', step: 'We follow up with the IRS and keep you posted.' }
      ],
      faq: [
        { q: 'Is a letter from the IRS a scam?', a: 'Real IRS contact almost always starts with a letter in the mail, never a demand for payment by gift card or a threat of arrest by phone. If in doubt, send it to us or check your IRS online account.' },
        { q: 'What is an enrolled agent?', a: 'A tax professional licensed by the IRS with unlimited rights to represent taxpayers before it. Etta Mabry, EA, leads our notice work.' },
        { q: 'The deadline on my letter has passed. Is it too late?', a: 'Usually not. Call us today; most notices can still be answered, though some options narrow over time.' }
      ],
      related: ['individual-tax', 'business-tax', 'payroll']
    }
  };
  const SERVICE_ORDER = ['individual-tax', 'business-tax', 'bookkeeping', 'payroll', 'advisory', 'nonprofit', 'irs-notices'];
  // The service shown when ?s= is missing or doesn't match a slug.
  const DEFAULT_SERVICE = 'individual-tax';

  /* ---------------------------------------------------------------- Deadline calendar
   * Each rule is a date in every calendar year (month 1–12, day). The site moves it to the next business
   * day when it falls on a weekend or a legal holiday:
   *   federal rules: Saturdays, Sundays, federal holidays and DC Emancipation Day (April 16)
   *   tn rules:      Saturdays, Sundays, federal holidays (not Emancipation Day) and Good Friday
   * {prev} and {year} in titles become the year before and the calendar year.
   * who: which TAXPAYER_TYPES the deadline applies to. short: the label in the top bar and the home page teaser.
   */
  const TAXPAYER_TYPES = {
    all: 'Everyone',
    individual: 'Individuals & self-employed',
    employer: 'Employers',
    passthrough: 'S corps & partnerships',
    ccorp: 'C corporations',
    nonprofit: 'Nonprofits'
  };
  const DEADLINE_RULES = [
    { id: 'q4-estimate', short: 'Q4 estimated tax', month: 1, day: 15, rule: 'federal', who: ['individual'], title: 'Fourth-quarter estimated tax for {prev}', forms: 'Form 1040-ES' },
    { id: 'w2-1099', short: 'W-2s and 1099-NECs', month: 1, day: 31, rule: 'federal', who: ['employer'], title: 'W-2s to employees and 1099-NEC forms to contractors, filed with the government', forms: 'W-2, W-3, 1099-NEC' },
    { id: 'payroll-q4', short: 'Form 941 (Q4) and 940', month: 1, day: 31, rule: 'federal', who: ['employer'], title: 'Fourth-quarter payroll return and the annual unemployment (FUTA) return', forms: 'Form 941, Form 940' },
    { id: 'passthrough', short: 'S corp and partnership returns', month: 3, day: 15, rule: 'federal', who: ['passthrough'], title: 'S corporation and partnership returns for {prev}, or an extension', forms: 'Form 1120-S, Form 1065, Form 7004' },
    { id: 'individual', short: 'Individual returns', month: 4, day: 15, rule: 'federal', who: ['individual'], title: 'Individual returns for {prev}, or an extension; last day for {prev} IRA and HSA contributions', forms: 'Form 1040, Form 4868' },
    { id: 'q1-estimate', short: 'Q1 estimated tax', month: 4, day: 15, rule: 'federal', who: ['individual', 'ccorp'], title: 'First-quarter estimated tax for {year}', forms: 'Form 1040-ES, corporate estimate' },
    { id: 'ccorp', short: 'C corp returns', month: 4, day: 15, rule: 'federal', who: ['ccorp'], title: 'C corporation returns for {prev}, or an extension', forms: 'Form 1120, Form 7004' },
    { id: 'tn-fae', short: 'Tennessee F&E return', month: 4, day: 15, rule: 'tn', who: ['passthrough', 'ccorp'], title: 'Tennessee franchise & excise tax return for {prev}, or an extension', forms: 'FAE 170' },
    { id: 'tn-est-1', short: 'Tennessee F&E estimate', month: 4, day: 15, rule: 'tn', who: ['passthrough', 'ccorp'], title: 'Tennessee F&E first estimate for {year}, when the year’s tax is $5,000 or more', forms: 'F&E estimate' },
    { id: 'payroll-q1', short: 'Form 941 (Q1)', month: 4, day: 30, rule: 'federal', who: ['employer'], title: 'First-quarter payroll return', forms: 'Form 941' },
    { id: 'nonprofit', short: 'Nonprofit returns', month: 5, day: 15, rule: 'federal', who: ['nonprofit'], title: 'Nonprofit information returns for {prev}, or an extension', forms: 'Form 990, 990-EZ, 990-N, Form 8868' },
    { id: 'q2-estimate', short: 'Q2 estimated tax', month: 6, day: 15, rule: 'federal', who: ['individual', 'ccorp'], title: 'Second-quarter estimated tax for {year}', forms: 'Form 1040-ES, corporate estimate' },
    { id: 'tn-est-2', short: 'Tennessee F&E estimate', month: 6, day: 15, rule: 'tn', who: ['passthrough', 'ccorp'], title: 'Tennessee F&E second estimate for {year}', forms: 'F&E estimate' },
    { id: 'payroll-q2', short: 'Form 941 (Q2)', month: 7, day: 31, rule: 'federal', who: ['employer'], title: 'Second-quarter payroll return', forms: 'Form 941' },
    { id: 'q3-estimate', short: 'Q3 estimated tax', month: 9, day: 15, rule: 'federal', who: ['individual', 'ccorp'], title: 'Third-quarter estimated tax for {year}', forms: 'Form 1040-ES, corporate estimate' },
    { id: 'passthrough-ext', short: 'Extended S corp and partnership returns', month: 9, day: 15, rule: 'federal', who: ['passthrough'], title: 'Extended S corporation and partnership returns for {prev}', forms: 'Form 1120-S, Form 1065' },
    { id: 'tn-est-3', short: 'Tennessee F&E estimate', month: 9, day: 15, rule: 'tn', who: ['passthrough', 'ccorp'], title: 'Tennessee F&E third estimate for {year}', forms: 'F&E estimate' },
    { id: 'individual-ext', short: 'Extended individual returns', month: 10, day: 15, rule: 'federal', who: ['individual'], title: 'Extended individual returns for {prev}', forms: 'Form 1040' },
    { id: 'ccorp-ext', short: 'Extended C corp returns', month: 10, day: 15, rule: 'federal', who: ['ccorp'], title: 'Extended C corporation returns for {prev}', forms: 'Form 1120' },
    { id: 'tn-fae-ext', short: 'Extended Tennessee F&E returns', month: 10, day: 15, rule: 'tn', who: ['passthrough', 'ccorp'], title: 'Extended Tennessee franchise & excise returns for {prev}', forms: 'FAE 170' },
    { id: 'payroll-q3', short: 'Form 941 (Q3)', month: 10, day: 31, rule: 'federal', who: ['employer'], title: 'Third-quarter payroll return', forms: 'Form 941' },
    { id: 'nonprofit-ext', short: 'Extended nonprofit returns', month: 11, day: 15, rule: 'federal', who: ['nonprofit'], title: 'Extended nonprofit information returns for {prev}', forms: 'Form 990' },
    { id: 'corp-q4', short: 'Q4 corporate estimate', month: 12, day: 15, rule: 'federal', who: ['ccorp'], title: 'Fourth-quarter corporate estimated tax for {year}', forms: 'Corporate estimate' },
    { id: 'tn-est-4', short: 'Tennessee F&E estimate', month: 12, day: 15, rule: 'tn', who: ['passthrough', 'ccorp'], title: 'Tennessee F&E fourth estimate for {year}', forms: 'F&E estimate' }
  ];

  /* ---------------------------------------------------------------- Document checklist
   * Checks are saved per list in localStorage under "accrue:checklist" (see DOCS.md). Item ids must be unique.
   */
  const CHECKLISTS = {
    individual: {
      label: 'Individuals & families',
      items: [
        { id: 'i-id', t: 'Photo ID, plus Social Security numbers and birth dates for everyone on the return' },
        { id: 'i-prior', t: 'Last year’s federal return, and any Georgia or Alabama return' },
        { id: 'i-w2', t: 'W-2s from every employer' },
        { id: 'i-1099', t: '1099-INT, 1099-DIV and 1099-B forms from banks and brokerages' },
        { id: 'i-1098', t: 'Form 1098 mortgage interest statement and property tax bills' },
        { id: 'i-childcare', t: 'Childcare provider names, tax ID numbers and amounts paid' },
        { id: 'i-education', t: '1098-T tuition and 1098-E student loan interest statements' },
        { id: 'i-health', t: 'Form 1095-A for Marketplace insurance; 5498-SA and 1099-SA for an HSA' },
        { id: 'i-giving', t: 'Receipts for charitable gifts, with written acknowledgments for gifts of $250 or more' },
        { id: 'i-estimates', t: 'Dates and amounts of any estimated tax payments' },
        { id: 'i-bank', t: 'Bank routing and account number for a refund or payment' }
      ]
    },
    selfemployed: {
      label: 'Freelancers & creators',
      items: [
        { id: 's-1099', t: '1099-NEC and 1099-K forms from clients and platforms' },
        { id: 's-income', t: 'A full income record (invoices or payouts), including income with no 1099' },
        { id: 's-expenses', t: 'Business expenses by category: software, equipment, travel, contractors' },
        { id: 's-home', t: 'Home office square footage and your home’s total square footage' },
        { id: 's-miles', t: 'Business mileage log, with odometer readings at the start and end of the year' },
        { id: 's-health', t: 'Health insurance premiums you paid yourself' },
        { id: 's-retire', t: 'SEP-IRA or solo 401(k) contributions' },
        { id: 's-estimates', t: 'Federal estimated payments made: dates and amounts' },
        { id: 's-w9', t: 'W-9s for contractors you paid $600 or more' },
        { id: 's-assets', t: 'Receipts for equipment bought or sold during the year' },
        { id: 's-tn', t: 'Tennessee business tax returns or your minimal activity license, if you have one' }
      ]
    },
    business: {
      label: 'S corps & partnerships',
      items: [
        { id: 'b-books', t: 'Year-end profit and loss and balance sheet (we pull these if we keep your books)' },
        { id: 'b-statements', t: 'December statements for every bank, card and loan account' },
        { id: 'b-payroll', t: 'Payroll year-end reports, W-2s, W-3 and the fourth-quarter Form 941' },
        { id: 'b-1099', t: '1099-NEC forms you issued, with contractor W-9s' },
        { id: 'b-assets', t: 'Equipment, vehicles or property bought or sold' },
        { id: 'b-loans', t: 'Loan statements showing year-end balances and interest paid' },
        { id: 'b-owners', t: 'Owner contributions, distributions and shareholder loans' },
        { id: 'b-fae', t: 'Last year’s Tennessee franchise & excise return' },
        { id: 'b-sales', t: 'Tennessee sales tax returns for the year' },
        { id: 'b-states', t: 'Other states where you have employees, property or sales' },
        { id: 'b-ownership', t: 'Ownership percentages, and any changes during the year' }
      ]
    },
    nonprofit: {
      label: 'Nonprofits',
      items: [
        { id: 'n-990', t: 'Last year’s Form 990 and your state charitable registration' },
        { id: 'n-statements', t: 'Year-end financial statements and bank reconciliations' },
        { id: 'n-grants', t: 'Grant award letters, with any restrictions' },
        { id: 'n-donors', t: 'Donors who gave $5,000 or more (for Schedule B)' },
        { id: 'n-board', t: 'Officers and directors, with average hours per week' },
        { id: 'n-comp', t: 'Compensation for officers and key employees' },
        { id: 'n-events', t: 'Fundraising event income and expenses' },
        { id: 'n-policies', t: 'Conflict of interest, whistleblower and document retention policies' },
        { id: 'n-inkind', t: 'In-kind donations received, with values' }
      ]
    }
  };
  const CHECKLIST_ORDER = ['individual', 'selfemployed', 'business', 'nonprofit'];

  /* ---------------------------------------------------------------- Fee estimator (pricing.html)
   * Monthly estimate = bookkeeping tier + payroll + extra states + entity extra + annual return fee / 12.
   * Cleanup is a one-time fee. All amounts in US dollars.
   */
  const ESTIMATOR = {
    entities: {
      sole: { label: 'Sole proprietor or single-member LLC', returnFee: 0, extra: 0, note: 'Your Schedule C is priced with your personal return.' },
      partnership: { label: 'Partnership or multi-member LLC', returnFee: 1440, extra: 0, note: 'Includes Form 1065, K-1s and the Tennessee F&E return.' },
      scorp: { label: 'S corporation', returnFee: 1560, extra: 40, extraLabel: 'Shareholder basis and reasonable-salary tracking', note: 'Includes Form 1120-S, K-1s and the Tennessee F&E return.' },
      ccorp: { label: 'C corporation', returnFee: 1800, extra: 0, note: 'Includes Form 1120 and the Tennessee F&E return.' },
      nonprofit: { label: 'Nonprofit', returnFee: 1680, extra: 100, extraLabel: 'Restricted fund and grant tracking', note: 'Includes Form 990 and its schedules.' }
    },
    entityOrder: ['sole', 'partnership', 'scorp', 'ccorp', 'nonprofit'],
    // Bookkeeping by transactions a month: the first tier whose max covers the count.
    tiers: [
      { id: 'foundation', name: 'Foundation', max: 100, fee: 350 },
      { id: 'standard', name: 'Standard', max: 250, fee: 525 },
      { id: 'expanded', name: 'Expanded', max: 500, fee: 775 },
      { id: 'full-charge', name: 'Full-charge', max: 1000, fee: 1150 }
    ],
    // Above the last tier: this much for each extra block of transactions (or part of one).
    overBlock: 250,
    overBlockFee: 95,
    payrollBase: 65,
    payrollPerEmployee: 9,
    // Tennessee is included; each additional state costs this a month.
    extraStateFee: 45,
    cleanupPerMonth: 175,
    limits: { tx: [0, 2000, 25], emp: [0, 60], states: [1, 6], cleanup: [0, 24] },
    defaults: { entity: 'scorp', tx: 200, emp: 4, states: 1, cleanup: 0 }
  };

  /* ---------------------------------------------------------------- Consultations (contact.html)
   * Times are "HH:MM" in FIRM.timeZone. Weekday indexes: 0 = Sunday … 6 = Saturday.
   * Lunch (12:00–1:00pm) is never offered. Tax-season Saturdays run from TAX_SEASON start to April 15.
   */
  const BOOKING = {
    slots: {
      1: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
      2: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
      3: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
      4: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
      5: ['09:00', '10:00', '11:00', '13:00', '14:00'],
      6: ['09:00', '10:00', '11:00'] // tax-season Saturdays only
    },
    taxSeason: { from: '02-01', to: '04-15' },
    minutes: 30,
    // How many open days the picker shows, starting tomorrow.
    days: 10,
    // Demo availability: the share (0–100) of slots shown as already booked, stable for each date.
    demoTaken: 45,
    // Office closures, worked out every year (see officeClosure() in main.js).
    closures: ['newYear', 'memorial', 'juneteenth', 'independence', 'labor', 'thanksgiving', 'dayAfterThanksgiving', 'christmasEve', 'christmas'],
    meetings: {
      office: { label: 'At our Cherry Street office', short: 'In person' },
      video: { label: 'Video call', short: 'Video call' },
      phone: { label: 'Phone call', short: 'Phone call' }
    }
  };

  /* ---------------------------------------------------------------- Insights
   * Past articles keep their real dates. body: blocks of { p }, { h2 }, { ul: [] } or { quote }.
   */
  const CATEGORIES = {
    all: 'All',
    tennessee: 'Tennessee',
    individuals: 'Individuals',
    'self-employed': 'Self-employed',
    'small-business': 'Small business',
    nonprofits: 'Nonprofits',
    'irs-notices': 'IRS notices'
  };
  const ARTICLES = [
    {
      slug: 'when-an-s-corp-election-makes-sense',
      title: 'When an S Corporation Election Makes Sense (and When It Doesn’t)',
      date: '2026-10-19', cat: 'small-business', author: 'Odell Whitcomb, CPA', mins: 6,
      art: 'assets/img/articles/s-corp.svg',
      dek: 'Saving self-employment tax is real, but so are payroll, a second return and Tennessee franchise & excise tax. Here is how we run the numbers.',
      body: [
        { p: 'Every fall, a few business owners ask the same question: “Should I be an S corp?” The pitch they’ve heard is simple. Instead of paying self-employment tax on all of your profit, you pay yourself a salary, and the rest comes out as a distribution that isn’t subject to Social Security and Medicare tax.' },
        { p: 'That part is true. What the pitch leaves out is what it costs to get there, and in Tennessee some of those costs are bigger than people expect.' },
        { h2: 'What changes when you elect' },
        { ul: [
          'You must pay yourself a reasonable salary through payroll, with withholding, quarterly payroll returns and a W-2.',
          'The business files its own federal return, Form 1120-S, by March 15 for a calendar year.',
          'If you were a sole proprietor, the business now typically needs to be an LLC or corporation, which means Tennessee franchise & excise tax applies.',
          'Health insurance and retirement contributions for owners are handled differently and need care.'
        ] },
        { h2: 'The reasonable salary question' },
        { p: 'The IRS expects an owner who works in the business to be paid what the work is worth. A salary set unrealistically low to maximize distributions is the most common S corporation problem we see in IRS letters. We look at what you do, the hours you work and what similar roles pay locally, and we write down how we got there.' },
        { quote: 'If the savings only work with a salary you couldn’t defend, they aren’t savings.' },
        { h2: 'A rough way to think about break-even' },
        { p: 'An election rarely pays before your net profit is consistently well above a defensible salary for your role. Below that, the extra return, payroll costs and franchise & excise tax tend to eat the self-employment tax you save. Above it, the savings can be meaningful year after year.' },
        { p: 'Timing matters too. For an election to apply to a calendar year, Form 2553 is generally due within two months and 15 days of the start of the year, which is March 15. Late-election relief exists, but it’s better not to need it.' },
        { h2: 'What we do in a planning meeting' },
        { p: 'We bring two side-by-side projections for next year: one as you are, one as an S corporation, with salary, payroll costs, both returns and Tennessee taxes included. If the difference doesn’t clearly justify the extra work, we say so.' },
        { p: 'This article is general information, not advice for your situation. Book a planning meeting before you make an election.' }
      ]
    },
    {
      slug: 'restaurant-bookkeeping-tips-sales-tax-food-cost',
      title: 'Restaurant Bookkeeping: Tips, Sales Tax and Food Cost',
      date: '2026-09-21', cat: 'small-business', author: 'Royce Thibodeaux', mins: 7,
      art: 'assets/img/articles/restaurant.svg',
      dek: 'Three places restaurant books go wrong, and the weekly habits that keep them right.',
      body: [
        { p: 'Restaurants run on thin margins and a lot of transactions, which is a hard combination for bookkeeping. A slow week and a mis-coded week look the same on a profit and loss. Here are the three areas where we find the most problems when a restaurant comes to us.' },
        { h2: '1. Daily sales that don’t match deposits' },
        { p: 'Your point-of-sale report, your card processor’s deposits and your delivery-app payouts each tell a slightly different story because of fees, refunds, tips and timing. Reconcile them daily or at least weekly, while the shift is still fresh, rather than at month-end.' },
        { h2: '2. Tips' },
        { p: 'Tips are wages. Card tips paid out to staff, cash tips employees report to you, and tip pools all need to flow through payroll so withholding and the quarterly Form 941 are right. Employers may also be able to claim a federal credit for part of the Social Security and Medicare tax paid on certain tips, which is easy to miss when tip records are messy.' },
        { h2: '3. Sales tax' },
        { p: 'In Tennessee, prepared food is taxed at the full state rate plus the local rate, which together come to 9.25% in Chattanooga at the time of writing. Most restaurants file monthly, with returns due on the 20th of the following month. Late filing penalties add up quickly, so the return should be on a calendar, not in someone’s head.' },
        { quote: 'A restaurant P&L is only useful if it’s closed fast enough to act on.' },
        { h2: 'The numbers to watch weekly' },
        { ul: [
          'Food cost and beverage cost as a percentage of their sales',
          'Labor cost, including payroll taxes, as a percentage of sales',
          'Prime cost (food, beverage and labor together); many full-service restaurants aim for roughly 60–65% of sales',
          'Cash on hand against the next two weeks of payroll and vendor bills'
        ] },
        { p: 'We close restaurant books by the 15th of the following month and send these numbers with three sentences on what moved. This article is general information, not advice for your restaurant.' }
      ]
    },
    {
      slug: 'getting-your-nonprofit-audit-ready',
      title: 'Getting Your Nonprofit Audit-Ready',
      date: '2026-08-24', cat: 'nonprofits', author: 'Grier Haskell, CPA', mins: 6,
      art: 'assets/img/articles/nonprofit-audit.svg',
      dek: 'An audit goes faster, costs less and finds fewer surprises when the books were ready before the auditor arrived.',
      body: [
        { p: 'A first audit usually happens for one of three reasons: a funder requires it, the state requires reviewed or audited statements at your revenue level, or you’ve spent enough federal grant money to trigger a Single Audit. Whatever the reason, the work you do before fieldwork decides how the audit goes.' },
        { h2: 'What auditors ask for first' },
        { ul: [
          'Bank reconciliations for every month, tied to the general ledger',
          'A schedule of net assets with and without donor restrictions, and when restrictions were released',
          'Grant agreements, budgets and the reports you sent funders',
          'A fixed asset list with depreciation',
          'Board minutes, and the policies the board adopted',
          'Expenses split by function: program, management and general, and fundraising'
        ] },
        { h2: 'Restricted money is where audits stall' },
        { p: 'If a donor gave $40,000 for a summer program, your books need to show the gift, what was spent on the program and the balance still restricted at year-end. Many organizations track this in a spreadsheet that never quite matches the ledger. Fixing that before the audit is the single biggest time-saver.' },
        { h2: 'Federal grants and the Single Audit' },
        { p: 'For fiscal years beginning on or after October 1, 2024, organizations that spend $1,000,000 or more in federal awards in a year generally need a Single Audit. If you’re close to that line, track federal spending by grant and by year now.' },
        { quote: 'We get you ready; your independent auditor does the audit. Keeping those roles separate protects the opinion your funders rely on.' },
        { p: 'This article is general information. Your auditor and your funders’ agreements are the final word on what your organization needs.' }
      ]
    },
    {
      slug: 'what-to-do-when-an-irs-letter-arrives',
      title: 'What to Do When an IRS Letter Arrives',
      date: '2026-07-13', cat: 'irs-notices', author: 'Etta Mabry, EA', mins: 5,
      art: 'assets/img/articles/irs-letter.svg',
      dek: 'Most IRS letters are routine and fixable. The worst thing you can do is put one in a drawer.',
      body: [
        { p: 'An envelope from the IRS can ruin a perfectly good afternoon. The good news is that most letters are about something specific and fixable: a 1099 that didn’t make it onto a return, a payment applied to the wrong year, a credit the IRS wants to check.' },
        { h2: 'Read the corner first' },
        { p: 'The notice number is in the top or bottom right corner: CP2000, CP14, LTR 525 and so on. It tells you what kind of letter it is. Next to it you’ll find the date of the notice and, inside, a response date. That date is the one that matters.' },
        { ul: [
          'CP2000: income reported to the IRS doesn’t match your return, and they propose a change',
          'CP14: a balance is due',
          'CP501, CP503, CP504: reminders about an unpaid balance, getting more urgent',
          'Letter 525: an examination by mail, with a proposed change'
        ] },
        { h2: 'Check it’s real' },
        { p: 'The IRS starts almost every contact with a letter. It does not demand payment by gift card or wire transfer, and it does not threaten arrest by phone. If anything feels off, sign in to your IRS online account, where real notices and balances appear, or send us a photo.' },
        { h2: 'Agree, disagree, or ask for time' },
        { p: 'If the IRS is right, you can pay, or set up a payment plan if you can’t pay in full. If it’s wrong, respond in writing by the response date with documents that show why. If you need more time, ask before the date passes. Keep a copy of everything you send.' },
        { quote: 'An unanswered CP2000 becomes a tax bill. An answered one is often resolved by mail.' },
        { p: 'With a signed Form 2848, an enrolled agent or CPA can speak to the IRS for you. This article is general information, not advice for your situation.' }
      ]
    },
    {
      slug: 'quarterly-estimated-taxes-for-freelancers',
      title: 'Quarterly Estimated Taxes for Freelancers: A Plain Guide',
      date: '2026-05-04', cat: 'self-employed', author: 'Etta Mabry, EA', mins: 5,
      art: 'assets/img/articles/estimated-taxes.svg',
      dek: 'No employer is withholding for you, so the IRS expects payments during the year. Here’s how much and when.',
      body: [
        { p: 'When you work for yourself, nobody withholds tax from your pay. The IRS expects you to pay as you go through quarterly estimated payments, and charges an underpayment penalty, essentially interest, when you don’t.' },
        { h2: 'The four dates (they aren’t even quarters)' },
        { ul: [
          'April 15, for income earned January through March',
          'June 15, for April and May',
          'September 15, for June through August',
          'January 15 of the next year, for September through December'
        ] },
        { p: 'When a date falls on a weekend or a legal holiday, it moves to the next business day. Our deadline calendar works out the exact dates for this year and next.' },
        { h2: 'How much to pay' },
        { p: 'You generally avoid the penalty if your payments and withholding cover the smaller of 90% of this year’s tax or 100% of last year’s tax. If last year’s adjusted gross income was over $150,000, the second number becomes 110%. Paying last year’s tax in four equal parts is the simplest safe route when income is rising.' },
        { h2: 'Don’t forget self-employment tax' },
        { p: 'On top of income tax, self-employed people pay Social Security and Medicare tax on net earnings: 15.3% in total, with the Social Security part stopping at that year’s wage base. It surprises almost every first-year freelancer.' },
        { quote: 'Move a fixed share of every payment you receive into a separate account the day it lands.' },
        { p: 'You can pay through IRS Direct Pay, your IRS online account or EFTPS. Tennessee doesn’t tax wages or self-employment income, so these are federal payments only, unless you work in Georgia or Alabama too. This article is general information, not advice for your situation.' }
      ]
    },
    {
      slug: 'working-across-the-state-line',
      title: 'Working Across the State Line: Georgia and Alabama Returns for Chattanooga Commuters',
      date: '2026-03-16', cat: 'individuals', author: 'Lavonne Fernley, CPA', mins: 6,
      art: 'assets/img/articles/state-line.svg',
      dek: 'Tennessee doesn’t tax your wages, but the state you drive to every morning might.',
      body: [
        { p: 'Chattanooga sits a few minutes from both Georgia and Alabama, and plenty of our clients live in Tennessee and work across the line. Because Tennessee has no income tax on wages, people are often surprised to learn they owe a state return at all.' },
        { h2: 'The basic rule' },
        { p: 'Georgia and Alabama tax nonresidents on income earned in their state, which generally means wages for work physically done there. A Tennessee resident who works in Georgia files a Georgia nonresident return; one who works in Alabama files an Alabama nonresident return.' },
        { p: 'There’s no offsetting credit back home, because Tennessee has no income tax to credit against. The Georgia or Alabama tax is simply part of what you owe.' },
        { h2: 'Check your withholding' },
        { p: 'Your employer should withhold for the state where you work. If you changed jobs, started working across the line mid-year, or your employer is based in Tennessee but sends you to job sites in Georgia, look at your pay stub. Missing state withholding turns into a bill in April.' },
        { h2: 'Remote and hybrid days' },
        { p: 'Because wages are generally sourced to where the work is done, days you work from home in Tennessee may not count as Georgia or Alabama income. Keep a simple log of where you worked each day; it’s the evidence that supports splitting your wages.' },
        { quote: 'A calendar with “home” or “office” on each workday is often all the proof you need.' },
        { h2: 'Moving across the line' },
        { p: 'If you moved from Georgia to Tennessee during the year, or the other way, you’ll usually file a part-year resident return for the months you lived in Georgia. Bring your moving date and any closing documents.' },
        { p: 'This article is general information, not advice for your situation.' }
      ]
    },
    {
      slug: 'tennessee-no-income-tax-what-you-still-file',
      title: 'Tennessee Has No Income Tax on Wages. Here’s What You Still File',
      date: '2026-02-09', cat: 'tennessee', author: 'Odell Whitcomb, CPA', mins: 6,
      art: 'assets/img/articles/tennessee.svg',
      dek: 'No state income tax doesn’t mean no state paperwork, especially if you own a business.',
      body: [
        { p: 'Tennessee doesn’t tax wages, and the Hall income tax on interest and dividends was repealed for tax years beginning in 2021. For most households here, that means one income tax return a year: the federal one.' },
        { p: 'Businesses are a different story. Tennessee raises much of its revenue from businesses and from sales tax, and the filings come with deadlines of their own.' },
        { h2: 'For individuals' },
        { ul: [
          'Your federal Form 1040, due April 15 (moved when it falls on a weekend or holiday)',
          'A Georgia or Alabama nonresident return if you earned wages there',
          'Nothing to Tennessee for wages, interest or dividends'
        ] },
        { h2: 'Franchise & excise tax' },
        { p: 'Corporations, LLCs, limited partnerships and most other entities with liability protection file Tennessee franchise & excise tax, even when the IRS treats them as a sole proprietorship or partnership. Excise tax is 6.5% of net earnings; franchise tax is based on net worth, with a $100 minimum. For calendar-year businesses the return is due April 15.' },
        { h2: 'Business tax' },
        { p: 'Tennessee’s business tax is a tax on gross receipts, with a state portion and city and county portions. Rates depend on your business classification. Very small businesses can qualify for a minimal activity license instead of filing returns.' },
        { h2: 'Sales and use tax' },
        { p: 'The state rate is 7% (4% on most grocery food), plus a local rate; in Chattanooga the combined rate is 9.25% at the time of writing. If you sell taxable goods or services, you collect it and file, usually monthly, by the 20th of the following month.' },
        { quote: 'If your business is an LLC, assume you owe Tennessee franchise & excise tax until someone shows you otherwise.' },
        { p: 'This article is general information. Rates and thresholds change, so check current figures before you rely on them, or ask us.' }
      ]
    }
  ];

  return { FIRM, SERVICES, SERVICE_ORDER, DEFAULT_SERVICE, TAXPAYER_TYPES, DEADLINE_RULES, CHECKLISTS, CHECKLIST_ORDER, ESTIMATOR, BOOKING, CATEGORIES, ARTICLES };
})();
