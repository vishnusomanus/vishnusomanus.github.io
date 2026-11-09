/* Vows — content for the interactive parts (RSVP guest list, schedule, registry, gallery).
   keepDemoCurrent: demo only. Once the wedding weekend in `events` is over, every date on the site moves on
   to the same weekend of the next year (by whole weeks, so weekdays stay the same). Set it to false for real dates.
   Edit these values to make the site yours. In a real site, keep the guest list on a server. */
window.VOWS = {
  "keepDemoCurrent": true,
  "couple": {
    "a": "Amara",
    "b": "Theo",
    "names": "Amara & Theo",
    "date_long": "Saturday, June 19, 2027",
    "date_short": "06.19.27",
    "venue": "Hollowridge House",
    "place": "Rhinebeck, New York",
    "ceremony_iso": "2027-06-19T15:00:00-04:00",
    "rsvp_by": "April 1, 2027",
    "hashtag": "#AmaraAndTheoSayIDo",
    "email": "hello@example.com"
  },
  "events": [
    {
      "id": "welcome-drinks",
      "day": "fri",
      "title": "Welcome drinks",
      "start": "2027-06-18T19:00:00-04:00",
      "end": "2027-06-18T22:30:00-04:00",
      "place": "The Swan Inn, Rhinebeck",
      "address": "The Swan Inn, Market Street, Rhinebeck, NY",
      "dress": "Relaxed",
      "body": "Arrive whenever works for you. Pizzas from the wood oven, local hard cider and a first hello before the big day. Everyone is welcome, including little ones."
    },
    {
      "id": "ceremony",
      "day": "sat",
      "title": "The ceremony",
      "start": "2027-06-19T15:00:00-04:00",
      "end": "2027-06-19T15:45:00-04:00",
      "place": "The Walled Garden, Hollowridge House",
      "address": "Hollowridge House, Mill Road, Rhinebeck, NY",
      "dress": "Garden formal",
      "body": "Please take your seats by 2:40pm. The ceremony is outdoors on the lawn; in rain we move into the Orangery next door."
    },
    {
      "id": "drinks",
      "day": "sat",
      "title": "Drinks & canapés",
      "start": "2027-06-19T15:45:00-04:00",
      "end": "2027-06-19T17:30:00-04:00",
      "place": "The Orchard, Hollowridge House",
      "address": "Hollowridge House, Mill Road, Rhinebeck, NY",
      "dress": "Garden formal",
      "body": "Elderflower spritz, lawn games and a string trio under the apple trees while we steal away for photos."
    },
    {
      "id": "dinner",
      "day": "sat",
      "title": "Wedding dinner",
      "start": "2027-06-19T17:30:00-04:00",
      "end": "2027-06-19T20:00:00-04:00",
      "place": "The Long Barn, Hollowridge House",
      "address": "Hollowridge House, Mill Road, Rhinebeck, NY",
      "dress": "Garden formal",
      "body": "Three courses from the kitchen garden, speeches (short ones, we promise) and the cutting of a very tall lemon cake."
    },
    {
      "id": "dancing",
      "day": "sat",
      "title": "Dancing",
      "start": "2027-06-19T20:00:00-04:00",
      "end": "2027-06-20T00:30:00-04:00",
      "place": "The Long Barn, Hollowridge House",
      "address": "Hollowridge House, Mill Road, Rhinebeck, NY",
      "dress": "Bring flats",
      "body": "First dance at 8pm, then a live band until 11 and a DJ playing your song requests until the last song at 12:30am."
    },
    {
      "id": "brunch",
      "day": "sun",
      "title": "Farewell brunch",
      "start": "2027-06-20T11:00:00-04:00",
      "end": "2027-06-20T14:00:00-04:00",
      "place": "The Orangery, Hollowridge House",
      "address": "Hollowridge House, Mill Road, Rhinebeck, NY",
      "dress": "Whatever you slept in",
      "body": "Bacon, egg and cheese rolls, pastries, strong coffee and tired, happy faces before everyone heads home."
    }
  ],
  "days": [
    {
      "id": "fri",
      "label": "Friday",
      "date": "June 18",
      "title": "Arrive & unwind"
    },
    {
      "id": "sat",
      "label": "Saturday",
      "date": "June 19",
      "title": "The wedding day"
    },
    {
      "id": "sun",
      "label": "Sunday",
      "date": "June 20",
      "title": "Slow morning"
    }
  ],
  "meals": [
    {
      "id": "chicken",
      "label": "Herb-roasted chicken",
      "note": "Spring greens, crushed new potatoes, tarragon jus"
    },
    {
      "id": "hake",
      "label": "Pan-roasted hake",
      "note": "Sea beans, brown butter, capers"
    },
    {
      "id": "risotto",
      "label": "Wild mushroom risotto",
      "note": "Vegetarian · aged parmesan, tarragon oil"
    },
    {
      "id": "garden",
      "label": "Garden plate",
      "note": "Vegan · chickpeas, charred leeks, salsa verde"
    }
  ],
  "kidsMeal": {
    "id": "kids",
    "label": "Little ones' plate",
    "note": "Chicken tenders or buttered pasta, garden vegetables"
  },
  "invites": [
    {
      "code": "ROSE-24",
      "label": "The Shah household",
      "plusOne": false,
      "guests": [
        {
          "id": "priya",
          "name": "Priya Shah"
        },
        {
          "id": "daniel",
          "name": "Daniel Shah"
        }
      ]
    },
    {
      "code": "FERN-18",
      "label": "Marcus Bell",
      "plusOne": true,
      "guests": [
        {
          "id": "marcus",
          "name": "Marcus Bell"
        }
      ]
    },
    {
      "code": "IVY-07",
      "label": "The Rossi family",
      "plusOne": false,
      "guests": [
        {
          "id": "elena",
          "name": "Elena Rossi"
        },
        {
          "id": "luca",
          "name": "Luca Rossi"
        },
        {
          "id": "sofia",
          "name": "Sofia Rossi",
          "child": true
        }
      ]
    },
    {
      "code": "MOSS-31",
      "label": "Hannah Okoye",
      "plusOne": true,
      "guests": [
        {
          "id": "hannah",
          "name": "Hannah Okoye"
        }
      ]
    },
    {
      "code": "SAGE-12",
      "label": "Inês & Tom Whitaker",
      "plusOne": false,
      "guests": [
        {
          "id": "ines",
          "name": "Inês Whitaker"
        },
        {
          "id": "tom",
          "name": "Tom Whitaker"
        }
      ]
    }
  ],
  "registry": [
    {
      "id": "casserole",
      "name": "Cast-iron casserole",
      "category": "Kitchen",
      "price": 285,
      "needed": 1,
      "reserved": 0,
      "icon": "pot",
      "note": "For Sunday stews and the occasional ambitious cassoulet."
    },
    {
      "id": "plates",
      "name": "Hand-thrown dinner plates (set of 6)",
      "category": "Kitchen",
      "price": 120,
      "needed": 2,
      "reserved": 1,
      "icon": "plate",
      "note": "From a potter in the next town; ours are all chipped."
    },
    {
      "id": "knife",
      "name": "Chef's knife",
      "category": "Kitchen",
      "price": 150,
      "needed": 1,
      "reserved": 0,
      "icon": "knife",
      "note": "Theo has been using a bread knife for everything. Please help."
    },
    {
      "id": "linen",
      "name": "Washed linen bedding",
      "category": "Home",
      "price": 220,
      "needed": 1,
      "reserved": 0,
      "icon": "bed",
      "note": "Queen, in a color called \"oat\". We are those people now."
    },
    {
      "id": "throw",
      "name": "Wool throw",
      "category": "Home",
      "price": 95,
      "needed": 2,
      "reserved": 0,
      "icon": "throw",
      "note": "For the sofa, and for Rosie, who will claim it immediately."
    },
    {
      "id": "records",
      "name": "Record player",
      "category": "Home",
      "price": 300,
      "needed": 1,
      "reserved": 1,
      "icon": "record",
      "note": "So our first-dance song can play at every anniversary."
    },
    {
      "id": "apple-tree",
      "name": "Apple tree for the garden",
      "category": "Garden",
      "price": 60,
      "needed": 3,
      "reserved": 1,
      "icon": "tree",
      "note": "Heirloom varieties. We'll name each one after its giver."
    },
    {
      "id": "bench",
      "name": "Oak garden bench",
      "category": "Garden",
      "price": 350,
      "needed": 1,
      "reserved": 0,
      "icon": "bench",
      "note": "For morning coffee and watching the apple trees not grow."
    },
    {
      "id": "herbs",
      "name": "Herb planter & tools",
      "category": "Garden",
      "price": 45,
      "needed": 2,
      "reserved": 0,
      "icon": "sprout",
      "note": "Basil, thyme, and whatever survives Rosie."
    },
    {
      "id": "cooking-class",
      "name": "Pasta class for two",
      "category": "Experiences",
      "price": 180,
      "needed": 1,
      "reserved": 0,
      "icon": "class",
      "note": "Hand-rolled pici and a long lunch afterward."
    },
    {
      "id": "observatory",
      "name": "Night at the observatory",
      "category": "Experiences",
      "price": 120,
      "needed": 1,
      "reserved": 0,
      "icon": "star",
      "note": "A real telescope this time, and somewhere warm to sit."
    },
    {
      "id": "hamper",
      "name": "Picnic basket for walks",
      "category": "Experiences",
      "price": 95,
      "needed": 1,
      "reserved": 0,
      "icon": "basket",
      "note": "Plates, thermos and a blanket for the oak tree walk."
    }
  ],
  "categories": [
    "Kitchen",
    "Home",
    "Garden",
    "Experiences"
  ],
  "fund": {
    "title": "Honeymoon fund",
    "destination": "the Amalfi Coast",
    "goal": 5000,
    "raised": 3100,
    "amounts": [
      {
        "value": 25,
        "label": "Gelato in Positano for two"
      },
      {
        "value": 50,
        "label": "A ferry along the coast to Amalfi"
      },
      {
        "value": 100,
        "label": "Dinner at a cliffside trattoria"
      },
      {
        "value": 250,
        "label": "A night in a hotel in Ravello"
      }
    ]
  },
  "gallery": [
    {
      "slug": "golden-hour",
      "title": "Golden hour",
      "caption": "The Hollowridge fields, the evening we came to see the venue.",
      "shape": "tall"
    },
    {
      "slug": "the-oak",
      "title": "The old oak",
      "caption": "Where Theo asked, and Amara said yes before he finished the question.",
      "shape": "wide"
    },
    {
      "slug": "market",
      "title": "Market Saturday",
      "caption": "Our weekly ritual: flowers, bread and too many tomatoes.",
      "shape": "wide"
    },
    {
      "slug": "lake",
      "title": "The lake",
      "caption": "Lake swimming, one cold toe at a time.",
      "shape": "tall"
    },
    {
      "slug": "first-flat",
      "title": "Our first apartment",
      "caption": "Fourth floor, no elevator, eleven plants and counting.",
      "shape": "wide"
    },
    {
      "slug": "observatory",
      "title": "Under the stars",
      "caption": "Our first trip together: a borrowed telescope and a cold hillside.",
      "shape": "wide"
    },
    {
      "slug": "rosie",
      "title": "Rosie",
      "caption": "Our scruffy matchmaker, guarding the picnic.",
      "shape": "tall"
    },
    {
      "slug": "picnic",
      "title": "The engagement picnic",
      "caption": "Champagne in a thermos and Rosie stealing the strawberries.",
      "shape": "wide"
    },
    {
      "slug": "bakery",
      "title": "The bakery",
      "caption": "Where we met, arguing over the last cinnamon bun.",
      "shape": "wide"
    }
  ],
  "giftIcons": {
    "pot": "<path d=\"M4 10h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Z\"/><path d=\"M2 10h20M9 6h6M12 6V4\"/>",
    "plate": "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><circle cx=\"12\" cy=\"12\" r=\"4.5\"/>",
    "knife": "<path d=\"M4 20 17.5 6.5a2.5 2.5 0 0 1 3 3.5L8 19\"/><path d=\"m4 20 4-1\"/>",
    "bed": "<path d=\"M3 19V7M3 15h18v4M21 19v-6a2 2 0 0 0-2-2h-8v4\"/><circle cx=\"7\" cy=\"12\" r=\"1.8\"/>",
    "throw": "<path d=\"M4 5h16v11l-2 2-2-2-2 2-2-2-2 2-2-2-2 2-2-2Z\"/><path d=\"M4 9h16\"/>",
    "record": "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/><path d=\"M12 3.5A8.5 8.5 0 0 1 20.5 12\"/>",
    "tree": "<circle cx=\"12\" cy=\"9\" r=\"6\"/><path d=\"M12 15v6M9 21h6M10 10l2 2 2-3\"/>",
    "bench": "<path d=\"M3 11h18M4 15h16M6 15v5M18 15v5M5 11V6h14v5\"/>",
    "sprout": "<path d=\"M12 20v-8\"/><path d=\"M12 12c0-4 3-6 7-6 0 4-3 6-7 6ZM12 14c0-3-2-5-6-5 0 3 2 5 6 5Z\"/><path d=\"M8 20h8\"/>",
    "class": "<path d=\"M4 12h16\"/><path d=\"M6 12a6 6 0 0 0 12 0\"/><path d=\"M9 4c0 2 2 2 2 4M13 4c0 2 2 2 2 4\"/>",
    "star": "<path d=\"m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9Z\"/>",
    "basket": "<path d=\"M3 10h18l-2 9H5Z\"/><path d=\"M8 10 11 4M16 10l-3-6M9 14v2M12 14v2M15 14v2\"/>"
  }
};
