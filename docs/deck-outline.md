# Event Booking System — Presentation Outline

10 minutes · 12 slides · Audience: instructor + panel (know the stack; testing understanding)

## Slide 1 — Event Booking System
- Full-stack capstone: React + Spring Boot + MongoDB + JWT
- Domain 3.1 from the brief: browse events, book seats, admin reports
- Name: Nurfarah Izzati Binti Yusni, course: Certified Full Stack Java with AI, date: 23/8/2026
- Visual: title slide, one screenshot as background ([SCREENSHOT: events list page, logged in])
- Notes: This is the Event Booking System from the approved domain list. Users browse and book events; admins manage events and see booking/revenue reports. I'll cover the architecture, the main flows, and three technical decisions worth a closer look.

## Slide 2 — What the brief requires
- 3 entities: User, Event, Booking · 2 roles: Admin, Customer
- Auth + protected routes, CRUD, business rules, search/filter/sort/pagination
- At least one MongoDB aggregation report — "must not be skipped"
- Visual: small table mapping brief requirement → where it lives in my app
- Notes: The brief fixes the technical standard regardless of domain. This slide is my checklist — everything on it exists in the app, and the rest of the talk shows the most interesting parts of how.

## Slide 3 — Architecture
- React 19 SPA (Vite) → REST `/api/*` → Spring Boot 4 → MongoDB
- Stateless backend: every request carries a JWT, no server sessions
- Layered backend: controller → service → repository, DTOs in/out
- Visual: architecture diagram (boxes: browser/React, Spring Boot layers, MongoDB; arrow labelled "Authorization: Bearer JWT")
- Notes: Standard three-tier setup. The Vite dev server proxies `/api` to Spring Boot on 8080. All business logic lives in the service layer — controllers stay thin, which is where I'd point the panel for any code question.

## Slide 4 — MongoDB data model
- 3 collections: `users`, `events`, `bookings` — referenced by ID, not embedded
- Why reference: bookings are queried on their own (My Bookings, admin list) and aggregated by `eventId`
- Indexes: unique `email`, `category` (filtering), `userId` + `eventId` on bookings
- Visual: diagram of the 3 documents with key fields and arrows for the ID references
- Notes: Embedding bookings inside events would make "my bookings across all events" and the aggregation awkward, so I reference instead. The unique email index is my explainable index choice — it enforces the uniqueness rule at the database level, not just in code.

## Slide 5 — Authentication flow
- Register/login → BCrypt-hashed password → JWT (HS256) with `userId`, `name`, `role` claims
- Spring Security OAuth2 Resource Server validates the token — no hand-rolled filter
- 60-min expiry; frontend auto-logs-out on a 401
- Visual: sequence diagram (login → token issued → token on every request → decoder validates)
- Notes: I used Spring's built-in resource-server support with a Nimbus encoder/decoder instead of writing a custom JWT filter, so validation, expiry, and signature checks are handled by well-tested framework code. The token carries the role claim, which drives authorisation next.

## Slide 6 — Role-based access: two layers, one real gate
- Backend: `SecurityConfig` route rules — e.g. `POST /api/events` → `hasRole("ADMIN")`
- Token's `role` claim mapped to `ROLE_*` authority via a converter
- Frontend `ProtectedRoute` / `AdminRoute` redirect — UX only, not security
- Visual: code snippet of the `authorizeHttpRequests` block from SecurityConfig.java
- Notes: The React route guards just keep non-admins out of admin screens for usability; the real enforcement is server-side. Even with a hand-crafted request, a customer token hits the role check and gets a 403.

## Slide 7 — Demo: customer flow
- Register → browse events with search, category filter, sort, pagination
- Event details → book seats → My Bookings → cancel (seats return)
- Loading / error / empty states throughout
- Visual: live demo; backup [SCREENSHOT: event details page with booking form] + existing docs/screenshots/my-bookings.png
- Notes: I'll run this live in about 90 seconds: search for an event, book two seats, show it in My Bookings, cancel it, and show the seat count going back up on the event page. If the demo fails, the screenshots cover the same path.

## Slide 8 — Business rule deep dive: no overselling seats
- Naive check-then-save has a race: two users can both "see" the last seat
- Fix: MongoDB `findAndModify` — check `seatsAvailable >= n` and decrement in one atomic operation
- Booking is only created if the reservation succeeded
- Visual: code snippet of `reserveSeats()` in EventService.java
- Notes: This is the rule I'd want to be questioned on. The query matches the event only if it's not cancelled and has enough seats, and the decrement happens in the same atomic operation — so concurrent bookings can't both take the last seat. Cancelling a booking increments the count back.

## Slide 9 — Demo: admin flow
- Create / edit / deactivate events (soft-cancel, not hard delete)
- Guard: capacity can't be reduced below seats already booked
- All Bookings view across every customer
- Visual: live demo; backup docs/screenshots/admin-events.png + admin-bookings.png
- Notes: The admin is seeded on first startup so the app is demo-ready without manual database edits. Deactivation is a soft-cancel flag — bookings and history stay intact, matching the brief's deactivate pattern.

## Slide 10 — Aggregation reports
- Pipeline: `$match` CONFIRMED → `$group` by `eventId` → count bookings, sum seats
- Powers two admin reports: bookings per event, revenue per event (seats × price)
- Written with Spring Data's `Aggregation` API on `MongoTemplate`
- Visual: the pipeline snippet from ReportService.java side-by-side with docs/screenshots/admin-reports.png
- Notes: One pipeline feeds both reports — revenue is derived by joining the grouped totals with each event's price in the service layer. Cancelled bookings are excluded at the match stage so refunded seats never inflate revenue.

## Slide 11 — Challenges & limitations
- Hardest problem: the booking race condition → solved with atomic findAndModify
- Getting Spring Security's resource server + role converter wired correctly
- Known limits: price as `double`, no reactivate endpoint, single seeded admin — all deliberate scope control (brief §16)
- Visual: none
- Notes: The race condition was the moment this stopped being CRUD and became a real system — I'll briefly tell that story. The limitations are conscious trade-offs, not gaps: the brief explicitly rewards a smaller, complete, explainable project.

## Slide 12 — Wrap-up & questions
- Every core requirement implemented: auth, roles, CRUD, rules, search/sort/pagination, aggregation
- README covers setup, seeding, full API endpoint list
- Happy to walk through any part of the code
- Visual: requirements checklist with all boxes ticked
- Notes: The system is complete against the brief and demo-ready from a fresh clone. I'll close by inviting questions — the areas I expect are the auth flow, the aggregation, and the seat-reservation logic, which slides 5, 8 and 10 set up.
