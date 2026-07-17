/**
 * Single source of truth for portfolio projects.
 * Home shows featuredOnly; projects.html shows all.
 */
window.PORTFOLIO_PROJECTS = [
  {
    id: "eveara",
    title: "Music Distribution Platform",
    url: "https://eveara.com/",
    host: "eveara.com",
    image: "assets/projects/eveara.jpg",
    alt: "Stylized simulation of a music distribution SaaS platform",
    description:
      "EVEARA — a B2B enterprise white-label SaaS for DIY music distribution. Empowers brands to run their own creator tools and distribute to major DSPs worldwide, with analytics, fingerprinting, payouts, and reporting.",
    role: "ColdFusion developer — Reports and Payment integration",
    tags: ["COLDFUSION", "GOLANG", "NODE.JS", "MSSQL", "AWS EC2"],
    accentTags: ["AWS EC2"],
    featured: true,
  },
  {
    id: "nana",
    title: "Film News Portal",
    url: "https://nanaonline.in/",
    host: "nanaonline.in",
    image: "assets/projects/nana.jpg",
    alt: "Stylized simulation of a film news portal",
    description:
      "Nana Online — digital portal for the film weekly magazine with cinema news, exclusives, interviews, galleries, and ebook subscription flows with integrated payments.",
    role: "Full stack developer — Client interaction and information gathering",
    tags: ["PHP", "MYSQL", "LINUX", "AWS"],
    accentTags: ["AWS"],
    featured: true,
  },
  {
    id: "kerala",
    title: "Government E-Commerce Portal",
    url: "https://www.keralaemarket.com/",
    host: "keralaemarket.com",
    image: "assets/projects/kerala.png",
    alt: "Stylized simulation of a Kerala produce marketplace",
    description:
      "Kerala eMarket — a B2B marketplace for produce and industries of Kerala. Product discovery, industry listings, GI products, and enquiry flows that help local entrepreneurs sell online.",
    role: "Full stack developer — DB Design, Team coordination, UI design",
    tags: ["PHP", "MYSQL", "LINUX", "AWS"],
    accentTags: ["AWS"],
    featured: false,
  },
  {
    id: "bizooza",
    title: "Multi-Site Web Platform",
    url: "https://bizooza.com/trm/",
    host: "bizooza.com",
    image: "assets/projects/bizooza.jpg",
    alt: "Stylized simulation of a multi-site forms admin platform",
    description:
      "Bizooza — multi-site platform with online forms, progressive web apps, payments, subscriptions, and static/dynamic pages delivered as a unified client experience.",
    role: "Full stack developer — Team coordination, Page UI design",
    tags: ["PHP", "MYSQL", "LINUX", "AWS", "PWA"],
    accentTags: ["AWS"],
    featured: false,
  },
  {
    id: "adrenaline",
    title: "Adventure Experiences Platform",
    url: "https://www.adrenaline365.com/",
    host: "adrenaline365.com",
    image: "assets/projects/adrenaline.jpg",
    alt: "Stylized simulation of an adventure experiences marketplace",
    description:
      "Adrenaline — USA adventure gifts and experiences marketplace (skydiving, helicopter tours, driving experiences, and more). Worked as Senior Developer on payments, ColdFusion library development, API integrations, SQL query work, and server & SSL certificate related tasks.",
    role: "Senior Developer — Payments, CF libraries, APIs, SQL, server & certificates",
    tags: ["COLDFUSION", "PAYMENTS", "CF LIBRARIES", "API INTEGRATIONS", "SQL", "SERVER / SSL"],
    accentTags: ["SERVER / SSL"],
    featured: false,
  },
  {
    id: "immerse",
    title: "Immersive Learning Platform",
    url: "https://immerse2learn.com/",
    host: "immerse2learn.com",
    image: "assets/projects/immerse.jpg",
    alt: "Stylized simulation of an immersive e-learning platform",
    description:
      "Immerse2learn — industry e-learning for CAD, CAM, CNC inspection, machining, and core manufacturing skills with train, assess, and certify workflows. Led the ColdFusion team delivering learning content systems, assessments, and certification-aligned features.",
    role: "Team Lead — ColdFusion",
    tags: ["TEAM LEAD", "COLDFUSION", "E-LEARNING", "ASSESSMENTS", "SQL"],
    accentTags: ["TEAM LEAD"],
    featured: false,
  },
  {
    id: "beautify",
    title: "Beauty & Wellness Platform",
    url: "https://beautify.me/",
    host: "beautify.me",
    image: "assets/projects/beautify.jpg",
    alt: "Stylized simulation of a beauty and wellness platform",
    description:
      "Beautify.me — beauty and wellness platform. Led PHP development covering application architecture, feature delivery, integrations, and team coordination for a consumer-facing product experience.",
    role: "PHP Lead",
    tags: ["PHP LEAD", "PHP", "MYSQL", "API INTEGRATIONS"],
    accentTags: ["PHP LEAD"],
    featured: false,
  },
  {
    id: "spip",
    title: "SPIP — Gold Investment Platform",
    url: "https://play.google.com/store/apps/details?id=com.candlestick.spip",
    host: "play.google.com",
    image: "assets/projects/spip.jpg",
    alt: "Stylized simulation of a gold investment fintech platform",
    description:
      "SPIP (Smart Investment Pools) — backend for a gold/token investment platform with REST APIs, authentication, Aadhaar KYC, wallet management, token purchase, Cashfree payments, referrals, and notifications on Laravel and PostgreSQL.",
    role: "Backend — Laravel APIs, KYC, wallet, Cashfree payments",
    tags: [
      "LARAVEL",
      "POSTGRESQL",
      "REST APIS",
      "AUTH",
      "KYC",
      "WALLET",
      "CASHFREE",
      "NOTIFICATIONS",
    ],
    accentTags: ["LARAVEL", "CASHFREE"],
    featured: false,
  },
  {
    id: "eti",
    title: "ETI — Stock Recommendations",
    url: "https://play.google.com/store/apps/details?id=com.candlestick.eti",
    host: "play.google.com",
    image: "assets/projects/eti.jpg",
    alt: "Stylized simulation of a stock recommendations trading advisory app",
    description:
      "ETI Advisory — mobile app for daily stock recommendations and market insights at Candlestick Solutions. Subscriptions for premium picks, plus an admin portal to manage recommendations, users, and content.",
    role: "Mobile app & admin portal — recommendations, subscriptions, content",
    tags: [
      "MOBILE APP",
      "STOCK ADVISORY",
      "SUBSCRIPTIONS",
      "ADMIN PORTAL",
      "OTP LOGIN",
      "OPTIONS / FUTURES",
      "FOREX",
    ],
    accentTags: ["MOBILE APP", "ADMIN PORTAL"],
    featured: false,
  },
  {
    id: "mahimiyam",
    title: "Mahimiyam — Digital Gold & Silver",
    url: "https://play.google.com/store/apps/details?id=com.candlestick.Mahimiyam",
    host: "play.google.com",
    image: "assets/projects/mahimiyam.jpg",
    alt: "Stylized simulation of a digital gold and silver investment app",
    description:
      "Mahimiyam (formerly SPIP Gold) — smart gateway to 24K digital gold and silver investing. Live spot prices, savings plans, reward-based investment pools, secure wallet & withdrawals, KYC, and digital purity certificates.",
    role: "Mobile app — digital gold/silver, pools, wallet, KYC",
    tags: [
      "MOBILE APP",
      "DIGITAL GOLD",
      "SILVER",
      "INVESTMENT POOLS",
      "WALLET",
      "KYC",
      "LIVE RATES",
    ],
    accentTags: ["DIGITAL GOLD", "MOBILE APP"],
    featured: false,
  },
];

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderProjectCard(project, index) {
  const delay = index * 80;
  const tags = project.tags
    .map((tag) => {
      const accent = (project.accentTags || []).includes(tag);
      const cls = accent
        ? "skill-tag font-mono text-[10px] px-2 py-1 bg-electric-blue/10 text-electric-blue border border-electric-blue/20 rounded"
        : "skill-tag font-mono text-[10px] px-2 py-1 bg-slate-800 border border-white/10 rounded";
      return `<span class="${cls}">${escapeHtml(tag)}</span>`;
    })
    .join("\n              ");

  const hasUrl = Boolean(project.url);
  const media = hasUrl
    ? `<a href="${escapeHtml(project.url)}" target="_blank" rel="noopener noreferrer" class="project-card-media aspect-[16/10] bg-slate-900 relative overflow-hidden border-b border-white/5 block">
        <img
          src="${escapeHtml(project.image)}"
          alt="${escapeHtml(project.alt)}"
          class="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          width="1200"
          height="750"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none"></div>
      </a>`
    : `<div class="project-card-media aspect-[16/10] bg-slate-900 relative overflow-hidden border-b border-white/5">
        <img
          src="${escapeHtml(project.image)}"
          alt="${escapeHtml(project.alt)}"
          class="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          width="1200"
          height="750"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none"></div>
      </div>`;

  const hostLine = hasUrl
    ? `<a href="${escapeHtml(project.url)}" target="_blank" rel="noopener noreferrer" class="font-mono text-label-caps text-electric-blue hover:underline inline-flex items-center gap-1">
            ${escapeHtml(project.host)} <span class="material-symbols-outlined text-sm">open_in_new</span>
          </a>`
    : `<span class="font-mono text-label-caps text-on-secondary-container">${escapeHtml(project.host)}</span>`;

  const visitBtn = hasUrl
    ? `<a href="${escapeHtml(project.url)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-1 border border-white/10 hover:border-electric-blue px-4 py-2 rounded font-mono text-label-caps transition-all shrink-0">
            VISIT SITE <span class="material-symbols-outlined text-sm">arrow_outward</span>
          </a>`
    : "";

  return `
    <article class="project-card group glass-card rounded-xl overflow-hidden flex flex-col reveal-scale" style="--delay: ${delay}ms" data-project="${escapeHtml(project.id)}">
      ${media}
      <div class="p-6 flex flex-col flex-1 gap-3">
        <div>
          <h3 class="text-headline-sm mb-2">${escapeHtml(project.title)}</h3>
          ${hostLine}
        </div>
        <p class="text-on-surface-variant text-body-md leading-relaxed flex-1">
          ${escapeHtml(project.description)}
        </p>
        <div class="flex flex-wrap gap-2">
          ${tags}
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1 border-t border-white/5 mt-1">
          <p class="font-mono text-code-md text-on-secondary-container italic">${escapeHtml(project.role)}</p>
          ${visitBtn}
        </div>
      </div>
    </article>`;
}

/**
 * @param {string} containerSelector
 * @param {{ featuredOnly?: boolean }} [options]
 */
window.renderPortfolioProjects = function renderPortfolioProjects(containerSelector, options = {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  let list = window.PORTFOLIO_PROJECTS.slice();
  if (options.featuredOnly) {
    list = list.filter((p) => p.featured);
  }

  // Deduplicate by id just in case
  const seen = new Set();
  list = list.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });

  container.innerHTML = list.map((p, i) => renderProjectCard(p, i)).join("\n");

  // Re-observe reveals if page already set up IntersectionObserver later
  container.querySelectorAll(".reveal-scale").forEach((el) => {
    el.classList.remove("is-visible");
  });
};
