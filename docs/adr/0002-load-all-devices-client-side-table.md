# Devices list: load the whole collection, sort/filter/paginate client-side

The brief requires a sortable/filterable devices table, but the mock API is static JSON
with no server-side query: no filter, sort, or page parameters. Conveniently,
`devices/index.json` returns the **entire 120-item collection** in one response (the
`page-1..5.json` files are an alternative paginated view we don't need).

**Decision:** Fetch `devices/index.json` once into a single TanStack Query entry, then do
filtering, sorting, and pagination entirely client-side. Page size is a persisted
preference (localStorage); filter/sort/page live in the URL. The `page-N.json` endpoints
are deliberately unused.

**Why, beyond "the API can't do it":** a user-configurable page size is incompatible with
the server's fixed 25/page files (a size of 50 straddles two files, 10 is a third of
one), so an honest page-size pref *requires* holding the full set. At 120 rows this is
trivial; the moment the dataset grew large or the API gained real query params, this would
flip to server-driven querying.

**Consequence:** page changes are synchronous client-side slices with no network
round-trip.
