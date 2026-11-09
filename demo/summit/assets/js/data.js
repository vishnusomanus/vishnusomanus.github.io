// Summit content: speakers, sessions and ticket prices.
// Edit here to update the speaker modal, speaker pages, schedule stars, and ticket prices and totals
// (`tickets`: price and early-bird price per ticket id; tickets.html cards use the same ids).
// Times are local event time (Bellevue, UTC-7 in April).
// keepDemoCurrent: demo only. Once the edition in `days` is over, every date on the site moves on to the same
// week of the next year (by whole weeks, so weekdays stay the same) and the edition year follows, so the demo
// never shows a conference that has passed. Set it to false when you enter your real dates.
window.SUMMIT = {
  "keepDemoCurrent": true,
  "tracks": {
    "design": "Design",
    "engineering": "Engineering",
    "ai": "AI",
    "leadership": "Leadership",
    "general": "General"
  },
  "days": [
    {
      "id": "wed",
      "date": "2027-04-14",
      "label": "Wed, Apr 14",
      "title": "Workshop day"
    },
    {
      "id": "thu",
      "date": "2027-04-15",
      "label": "Thu, Apr 15",
      "title": "Conference day 1"
    },
    {
      "id": "fri",
      "date": "2027-04-16",
      "label": "Fri, Apr 16",
      "title": "Conference day 2"
    }
  ],
  "speakers": [
    {
      "id": "amara-osei",
      "name": "Amara Osei",
      "role": "Head of Design",
      "company": "Northwind Labs",
      "city": "London",
      "track": "design",
      "bio": "Amara leads a 60-person design org shipping tools used by four million people a day. She writes about calm software and teaches interaction design at the Royal College of Art.",
      "twitter": "amaraosei",
      "site": "amaraosei.example"
    },
    {
      "id": "lukas-brandt",
      "name": "Lukas Brandt",
      "role": "Staff Engineer",
      "company": "Ferro Systems",
      "city": "Berlin",
      "track": "engineering",
      "bio": "Lukas builds edge infrastructure in Rust and maintains two popular open-source HTTP libraries. He believes most outages are really naming problems.",
      "twitter": "lukasbrandt",
      "site": "brandt.example"
    },
    {
      "id": "mei-tanaka",
      "name": "Mei Tanaka",
      "role": "AI Research Lead",
      "company": "Kumo AI",
      "city": "Tokyo",
      "track": "ai",
      "bio": "Mei's team trains small, efficient language models for on-device use. Before Kumo she spent six years in academic NLP research and still reviews for ACL.",
      "twitter": "meitanaka",
      "site": "meitanaka.example"
    },
    {
      "id": "sofia-reyes",
      "name": "Sofia Reyes",
      "role": "VP of Product",
      "company": "Atlas Maps",
      "city": "Mexico City",
      "track": "leadership",
      "bio": "Sofia scaled Atlas from a two-city pilot to 40 countries. She is known for roadmaps that fit on one page and product reviews that end on time.",
      "twitter": "sofiareyes",
      "site": "sofiareyes.example"
    },
    {
      "id": "jonas-lind",
      "name": "Jonas Lind",
      "role": "Creative Technologist",
      "company": "Studio Fjord",
      "city": "Bergen",
      "track": "design",
      "bio": "Jonas sits between design and code, building prototypes and motion systems for Nordic brands. His interactive installations have been shown in Oslo, Seoul and São Paulo.",
      "twitter": "jonaslind",
      "site": "jonaslind.example"
    },
    {
      "id": "priya-nair",
      "name": "Priya Nair",
      "role": "Principal Engineer",
      "company": "Tidal Banking",
      "city": "Bengaluru",
      "track": "engineering",
      "bio": "Priya designed the payments core that now handles 10,000 requests a second at Tidal. She cares about type systems, boring architecture and good incident write-ups.",
      "twitter": "priyanair",
      "site": "priyanair.example"
    },
    {
      "id": "elena-volkova",
      "name": "Elena Volkova",
      "role": "ML Engineer",
      "company": "Verde",
      "city": "Amsterdam",
      "track": "ai",
      "bio": "Elena builds evaluation pipelines that keep LLM features honest in production. She previously worked on search ranking and has opinions about test sets.",
      "twitter": "elenavolkova",
      "site": "volkova.example"
    },
    {
      "id": "david-okafor",
      "name": "David Okafor",
      "role": "CTO",
      "company": "Pulse Health",
      "city": "Lagos",
      "track": "leadership",
      "bio": "David co-founded Pulse Health, which brings affordable diagnostics to clinics across West Africa. He has hired and grown engineering teams on three continents.",
      "twitter": "davidokafor",
      "site": "pulsehealth.example"
    },
    {
      "id": "hana-kim",
      "name": "Hana Kim",
      "role": "Design Systems Lead",
      "company": "Globex",
      "city": "Seoul",
      "track": "design",
      "bio": "Hana runs the design system behind 30 Globex products and an accessibility guild of 200 volunteers. She speaks often about tokens, documentation and governance.",
      "twitter": "hanakim",
      "site": "hanakim.example"
    },
    {
      "id": "marco-bellini",
      "name": "Marco Bellini",
      "role": "Web Performance Engineer",
      "company": "Initech",
      "city": "Milan",
      "track": "engineering",
      "bio": "Marco has shaved seconds off some of Europe's busiest shopping sites. He maintains a popular performance budget tool and runs a monthly web-vitals clinic.",
      "twitter": "marcobellini",
      "site": "bellini.example"
    },
    {
      "id": "nora-hansen",
      "name": "Nora Hansen",
      "role": "Founder & CEO",
      "company": "Halcyon",
      "city": "Oslo",
      "track": "leadership",
      "bio": "Nora founded Halcyon, a calendar app for teams that hate meetings, after a decade in product leadership. She mentors first-time founders through Nordic Founders Network.",
      "twitter": "norahansen",
      "site": "halcyon.example"
    },
    {
      "id": "sam-wu",
      "name": "Sam Wu",
      "role": "Applied AI Designer",
      "company": "Lumen Studio",
      "city": "San Francisco",
      "track": "ai",
      "bio": "Sam designs interfaces for AI products, from first prompt to failure states. Their work on explainable recommendations has been adopted by three major streaming apps.",
      "twitter": "samwu",
      "site": "samwu.example"
    }
  ],
  "sessions": [
    {
      "id": "s1",
      "day": "wed",
      "start": "08:30",
      "end": "09:15",
      "title": "Registration & coffee",
      "speakers": [],
      "track": "general",
      "room": "Foyer",
      "level": "",
      "kind": "break"
    },
    {
      "id": "s2",
      "day": "wed",
      "start": "09:30",
      "end": "12:30",
      "title": "Workshop: Design systems that scale",
      "speakers": [
        "hana-kim"
      ],
      "track": "design",
      "room": "Workshop Lab",
      "level": "Intermediate",
      "kind": "workshop"
    },
    {
      "id": "s3",
      "day": "wed",
      "start": "09:30",
      "end": "12:30",
      "title": "Workshop: Shipping LLM features responsibly",
      "speakers": [
        "elena-volkova"
      ],
      "track": "ai",
      "room": "Studio",
      "level": "Intermediate",
      "kind": "workshop"
    },
    {
      "id": "s4",
      "day": "wed",
      "start": "09:30",
      "end": "12:30",
      "title": "Workshop: The web performance clinic",
      "speakers": [
        "marco-bellini"
      ],
      "track": "engineering",
      "room": "Hall B",
      "level": "Advanced",
      "kind": "workshop"
    },
    {
      "id": "s5",
      "day": "wed",
      "start": "12:30",
      "end": "13:30",
      "title": "Lunch",
      "speakers": [],
      "track": "general",
      "room": "Foyer",
      "level": "",
      "kind": "break"
    },
    {
      "id": "s6",
      "day": "wed",
      "start": "13:30",
      "end": "16:30",
      "title": "Workshop: Prototyping in code for designers",
      "speakers": [
        "jonas-lind"
      ],
      "track": "design",
      "room": "Workshop Lab",
      "level": "Beginner",
      "kind": "workshop"
    },
    {
      "id": "s7",
      "day": "wed",
      "start": "13:30",
      "end": "16:30",
      "title": "Workshop: Leading teams through change",
      "speakers": [
        "nora-hansen"
      ],
      "track": "leadership",
      "room": "Studio",
      "level": "Beginner",
      "kind": "workshop"
    },
    {
      "id": "s8",
      "day": "wed",
      "start": "17:30",
      "end": "20:00",
      "title": "Welcome drinks on the bay",
      "speakers": [],
      "track": "general",
      "room": "Bay Terrace",
      "level": "",
      "kind": "social"
    },
    {
      "id": "s9",
      "day": "thu",
      "start": "08:30",
      "end": "09:30",
      "title": "Doors open & breakfast",
      "speakers": [],
      "track": "general",
      "room": "Foyer",
      "level": "",
      "kind": "break"
    },
    {
      "id": "s10",
      "day": "thu",
      "start": "09:30",
      "end": "10:15",
      "title": "Keynote: The next decade of interfaces",
      "speakers": [
        "amara-osei"
      ],
      "track": "design",
      "room": "Main Stage",
      "level": "All levels",
      "kind": "keynote"
    },
    {
      "id": "s11",
      "day": "thu",
      "start": "10:30",
      "end": "11:10",
      "title": "Rust at the edge, without the drama",
      "speakers": [
        "lukas-brandt"
      ],
      "track": "engineering",
      "room": "Main Stage",
      "level": "Advanced",
      "kind": "talk"
    },
    {
      "id": "s12",
      "day": "thu",
      "start": "10:30",
      "end": "11:10",
      "title": "Designing for trust in AI products",
      "speakers": [
        "sam-wu"
      ],
      "track": "ai",
      "room": "Hall B",
      "level": "Intermediate",
      "kind": "talk"
    },
    {
      "id": "s13",
      "day": "thu",
      "start": "10:30",
      "end": "11:10",
      "title": "Roadmaps nobody hates",
      "speakers": [
        "sofia-reyes"
      ],
      "track": "leadership",
      "room": "Studio",
      "level": "Beginner",
      "kind": "talk"
    },
    {
      "id": "s14",
      "day": "thu",
      "start": "11:10",
      "end": "11:40",
      "title": "Coffee break",
      "speakers": [],
      "track": "general",
      "room": "Foyer",
      "level": "",
      "kind": "break"
    },
    {
      "id": "s15",
      "day": "thu",
      "start": "11:40",
      "end": "12:20",
      "title": "Small models, big wins",
      "speakers": [
        "mei-tanaka"
      ],
      "track": "ai",
      "room": "Main Stage",
      "level": "Advanced",
      "kind": "talk"
    },
    {
      "id": "s16",
      "day": "thu",
      "start": "11:40",
      "end": "12:20",
      "title": "Accessibility is a design system problem",
      "speakers": [
        "hana-kim"
      ],
      "track": "design",
      "room": "Hall B",
      "level": "Intermediate",
      "kind": "talk"
    },
    {
      "id": "s17",
      "day": "thu",
      "start": "12:20",
      "end": "13:30",
      "title": "Lunch",
      "speakers": [],
      "track": "general",
      "room": "Foyer",
      "level": "",
      "kind": "break"
    },
    {
      "id": "s18",
      "day": "thu",
      "start": "13:30",
      "end": "14:10",
      "title": "Payments at 10,000 requests a second",
      "speakers": [
        "priya-nair"
      ],
      "track": "engineering",
      "room": "Main Stage",
      "level": "Advanced",
      "kind": "talk"
    },
    {
      "id": "s19",
      "day": "thu",
      "start": "13:30",
      "end": "14:10",
      "title": "Panel: Hiring in 2027",
      "speakers": [
        "david-okafor",
        "nora-hansen",
        "sofia-reyes"
      ],
      "track": "leadership",
      "room": "Hall B",
      "level": "All levels",
      "kind": "panel"
    },
    {
      "id": "s20",
      "day": "thu",
      "start": "14:20",
      "end": "15:00",
      "title": "Motion with meaning",
      "speakers": [
        "jonas-lind"
      ],
      "track": "design",
      "room": "Main Stage",
      "level": "Beginner",
      "kind": "talk"
    },
    {
      "id": "s21",
      "day": "thu",
      "start": "14:20",
      "end": "15:00",
      "title": "Evaluating LLM apps in production",
      "speakers": [
        "elena-volkova"
      ],
      "track": "ai",
      "room": "Hall B",
      "level": "Intermediate",
      "kind": "talk"
    },
    {
      "id": "s22",
      "day": "thu",
      "start": "15:00",
      "end": "15:30",
      "title": "Afternoon break",
      "speakers": [],
      "track": "general",
      "room": "Foyer",
      "level": "",
      "kind": "break"
    },
    {
      "id": "s23",
      "day": "thu",
      "start": "15:30",
      "end": "16:15",
      "title": "Keynote: Healthcare for a billion people",
      "speakers": [
        "david-okafor"
      ],
      "track": "leadership",
      "room": "Main Stage",
      "level": "All levels",
      "kind": "keynote"
    },
    {
      "id": "s24",
      "day": "thu",
      "start": "19:00",
      "end": "23:00",
      "title": "The Summit Party",
      "speakers": [],
      "track": "general",
      "room": "Bel-Red Warehouse",
      "level": "",
      "kind": "social"
    },
    {
      "id": "s25",
      "day": "fri",
      "start": "09:00",
      "end": "09:30",
      "title": "Breakfast",
      "speakers": [],
      "track": "general",
      "room": "Foyer",
      "level": "",
      "kind": "break"
    },
    {
      "id": "s26",
      "day": "fri",
      "start": "09:30",
      "end": "10:15",
      "title": "Keynote: Research to product in 90 days",
      "speakers": [
        "mei-tanaka"
      ],
      "track": "ai",
      "room": "Main Stage",
      "level": "All levels",
      "kind": "keynote"
    },
    {
      "id": "s27",
      "day": "fri",
      "start": "10:30",
      "end": "11:10",
      "title": "The 100-millisecond web",
      "speakers": [
        "marco-bellini"
      ],
      "track": "engineering",
      "room": "Main Stage",
      "level": "Intermediate",
      "kind": "talk"
    },
    {
      "id": "s28",
      "day": "fri",
      "start": "10:30",
      "end": "11:10",
      "title": "Design leadership without the title",
      "speakers": [
        "amara-osei"
      ],
      "track": "leadership",
      "room": "Hall B",
      "level": "Beginner",
      "kind": "talk"
    },
    {
      "id": "s29",
      "day": "fri",
      "start": "11:20",
      "end": "12:00",
      "title": "Type-safe everything",
      "speakers": [
        "priya-nair"
      ],
      "track": "engineering",
      "room": "Main Stage",
      "level": "Intermediate",
      "kind": "talk"
    },
    {
      "id": "s30",
      "day": "fri",
      "start": "11:20",
      "end": "12:00",
      "title": "Generative UI: hype versus craft",
      "speakers": [
        "sam-wu"
      ],
      "track": "design",
      "room": "Hall B",
      "level": "Intermediate",
      "kind": "talk"
    },
    {
      "id": "s31",
      "day": "fri",
      "start": "12:00",
      "end": "13:00",
      "title": "Lunch",
      "speakers": [],
      "track": "general",
      "room": "Foyer",
      "level": "",
      "kind": "break"
    },
    {
      "id": "s32",
      "day": "fri",
      "start": "13:00",
      "end": "13:40",
      "title": "Lightning talks: eight ideas in forty minutes",
      "speakers": [],
      "track": "general",
      "room": "Main Stage",
      "level": "All levels",
      "kind": "talk"
    },
    {
      "id": "s33",
      "day": "fri",
      "start": "13:50",
      "end": "14:30",
      "title": "From Postgres to planet scale",
      "speakers": [
        "lukas-brandt"
      ],
      "track": "engineering",
      "room": "Hall B",
      "level": "Advanced",
      "kind": "talk"
    },
    {
      "id": "s34",
      "day": "fri",
      "start": "13:50",
      "end": "14:30",
      "title": "Founders' fireside chat",
      "speakers": [
        "nora-hansen",
        "sofia-reyes"
      ],
      "track": "leadership",
      "room": "Main Stage",
      "level": "All levels",
      "kind": "panel"
    },
    {
      "id": "s35",
      "day": "fri",
      "start": "14:45",
      "end": "15:30",
      "title": "Closing keynote: Make it calm",
      "speakers": [
        "amara-osei",
        "jonas-lind"
      ],
      "track": "design",
      "room": "Main Stage",
      "level": "All levels",
      "kind": "keynote"
    }
  ],
  "earlyBirdEnds": "2026-12-31T23:59:59-08:00",
  "teamDiscount": {
    "minTickets": 5,
    "percent": 15
  },
  "tickets": [
    {
      "id": "workshop",
      "name": "Workshop day",
      "price": 349,
      "early": 299
    },
    {
      "id": "conference",
      "name": "Conference pass",
      "price": 799,
      "early": 599
    },
    {
      "id": "full",
      "name": "Full pass",
      "price": 999,
      "early": 799
    },
    {
      "id": "student",
      "name": "Student pass",
      "price": 199,
      "early": 199
    }
  ]
};
