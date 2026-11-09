/* Notebook — the index of posts and series.
   Read by assets/js/main.js to build the archive, the tag browser, search, and each post's
   series box and previous/next links. Add a post: copy an entry, newest first.

   slug     a unique id (also used to find the current post on a post page: data-post="…")
   title    the post's title
   excerpt  one sentence shown in lists and searched
   date     YYYY-MM-DD (shown as written, never converted to a time zone)
   tags     lower-case tag names, in alphabetical order (see tags.html)
   series   the slug of a series below, or "" for a standalone post
   part     its part number in the series (0 when standalone)
   minutes  reading time
   url      the post's page */
window.NOTEBOOK_SERIES = [
  { slug: 'postgres-from-the-inside', name: 'Postgres from the inside' },
  { slug: 'build-system-in-200-lines', name: 'A build system in 200 lines' },
  { slug: 'css-for-backend-people', name: 'CSS for backend people' }
];

window.NOTEBOOK_POSTS = [
  { slug: 'vacuum-seen-from-the-page', title: 'Vacuum, seen from the page', excerpt: 'Dead tuples, the free space map and why VACUUM almost never gives disk space back.', date: '2026-10-05', tags: ['databases', 'postgres'], series: 'postgres-from-the-inside', part: 3, minutes: 10, url: 'post.html' },
  { slug: 'reading-a-b-tree-page-by-hand', title: 'Reading a B-tree page by hand', excerpt: 'Open an index with pageinspect, walk from the root to a single row and see what an index actually promises.', date: '2026-09-28', tags: ['databases', 'debugging', 'postgres'], series: 'postgres-from-the-inside', part: 2, minutes: 5, url: 'post.html' },
  { slug: 'the-flaky-test-was-a-time-zone', title: 'The flaky test was a time zone', excerpt: 'A test that only failed after 5 pm, and the one-line date parse behind it.', date: '2026-09-09', tags: ['debugging', 'javascript', 'testing'], series: '', part: 0, minutes: 6, url: 'post.html' },
  { slug: 'what-actually-happens-on-insert', title: 'What actually happens on INSERT', excerpt: 'From the parser to the write-ahead log: following one row into a Postgres table.', date: '2026-08-17', tags: ['databases', 'postgres'], series: 'postgres-from-the-inside', part: 1, minutes: 12, url: 'post.html' },
  { slug: 'a-build-system-in-200-lines-the-graph', title: 'A build system in 200 lines: the graph', excerpt: 'Topological order, cycles that explain themselves and running independent steps in parallel.', date: '2026-07-30', tags: ['rust', 'tooling'], series: 'build-system-in-200-lines', part: 3, minutes: 10, url: 'post.html' },
  { slug: 'make-your-errors-boring', title: 'Make your errors boring', excerpt: 'A good error says what happened, where, and what to do next. Everything else is decoration.', date: '2026-06-22', tags: ['api-design', 'rust'], series: '', part: 0, minutes: 7, url: 'post.html' },
  { slug: 'a-build-system-in-200-lines-hashing-inputs', title: 'A build system in 200 lines: hashing inputs', excerpt: 'Timestamps lie and content hashes don’t. Deciding when a step is really out of date.', date: '2026-05-11', tags: ['rust', 'tooling'], series: 'build-system-in-200-lines', part: 2, minutes: 8, url: 'post.html' },
  { slug: 'a-build-system-in-200-lines-why-bother', title: 'A build system in 200 lines: why bother', excerpt: 'Writing a tiny build tool is the fastest way to understand the big ones.', date: '2026-03-03', tags: ['tooling'], series: 'build-system-in-200-lines', part: 1, minutes: 5, url: 'post.html' },
  { slug: 'notes-from-a-year-of-on-call', title: 'Notes from a year of on-call', excerpt: 'What forty-one pages at 3 am taught me about alerts, runbooks and sleep.', date: '2025-12-14', tags: ['career', 'devops'], series: '', part: 0, minutes: 8, url: 'post.html' },
  { slug: 'sqlite-is-my-favourite-queue', title: 'SQLite is my favorite queue', excerpt: 'For most side projects, a table and a transaction beat a message broker.', date: '2025-10-02', tags: ['databases', 'sqlite'], series: '', part: 0, minutes: 6, url: 'post.html' },
  { slug: 'css-for-backend-people-layout', title: 'CSS for backend people: layout without tears', excerpt: 'Flexbox for one dimension, grid for two, and the three properties behind most layouts.', date: '2025-07-19', tags: ['css'], series: 'css-for-backend-people', part: 2, minutes: 9, url: 'post.html' },
  { slug: 'css-for-backend-people-the-cascade', title: 'CSS for backend people: the cascade', excerpt: 'Specificity, order and inheritance, explained as a merge conflict.', date: '2025-05-06', tags: ['css'], series: 'css-for-backend-people', part: 1, minutes: 7, url: 'post.html' },
  { slug: 'profiling-a-slow-endpoint-with-logs', title: 'Profiling a slow endpoint with nothing but logs', excerpt: 'No tracing, no flame graphs: timestamps, awk and a hunch.', date: '2024-11-21', tags: ['debugging', 'performance'], series: '', part: 0, minutes: 6, url: 'post.html' },
  { slug: 'hello-notebook', title: 'Hello, notebook', excerpt: 'Why I started writing things down in public, and what to expect here.', date: '2024-06-03', tags: ['meta'], series: '', part: 0, minutes: 2, url: 'post.html' }
];
