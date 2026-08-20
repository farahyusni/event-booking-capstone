# Event Booking System — Capstone Project

Full-stack Event Booking System built for the Java Full-Stack AI Capstone brief, using **React**, **Spring Boot**, **MongoDB**, and **JWT authentication**.

Users can browse events and book seats. Admins can create/edit/deactivate events, view every booking across all customers, and view booking/revenue reports built with a MongoDB aggregation pipeline.

## Tech Stack

| Layer          | Technology |
|----------------|------------|
| Frontend       | React 19, React Router 7, Vite |
| Backend        | Spring Boot 4 (Java 21) |
| Database       | MongoDB |
| Authentication | JWT (HS256), Spring Security OAuth2 Resource Server |
| Password hashing | BCrypt |

## Project Structure

```
backend/    Spring Boot API (controllers, services, repositories, models, DTOs, security)
frontend/   React app (pages, components, contexts, API client)
```

Key backend packages (`backend/src/main/java/com/eventbooking/`):

```
model/        User, Event, Booking
repository/   Spring Data MongoDB repositories
service/      AuthService, EventService, BookingService, ReportService, JwtService
controller/   AuthController, EventController, BookingController, ReportController
security/     SecurityConfig (JWT filter chain, role-based access), AppUserDetailsService
config/       AdminSeeder (seeds a default admin account on startup)
dto/          Request/response payloads
exception/    GlobalExceptionHandler
```

Key frontend folders (`frontend/src/`):

```
pages/            Login, Register, Home, Events, EventDetails, MyBookings
pages/admin/      AdminEvents, AdminEventForm, AdminBookings, AdminReports
components/       AppShell, ProtectedRoute, AdminRoute, and shared UI pieces
context/          AuthContext (JWT/session), EventDataContext (event list state)
services/         api.js (backend calls), httpClient.js (fetch wrapper)
```

## Prerequisites

- **Java 21**
- **Node.js 18+** and npm
- **MongoDB** running locally on the default port `27017`

## Getting Started

### 1. Database

The backend expects a MongoDB user with access to an `eventbooking` database. The default connection string in [`backend/src/main/resources/application.properties`](backend/src/main/resources/application.properties) is:

```
mongodb://eventbooking_user:abc123@localhost:27017/eventbooking
```

If you don't already have that user, create it in `mongosh`:

```js
use eventbooking
db.createUser({
  user: "eventbooking_user",
  pwd: "abc123",
  roles: [{ role: "readWrite", db: "eventbooking" }]
})
```

Or point `spring.mongodb.uri` at any MongoDB instance/user you already have — no schema migration is needed, Spring Data MongoDB creates collections and indexes automatically on first run (`spring.data.mongodb.auto-index-creation=true`).

### 2. Backend

```bash
cd backend
./mvnw spring-boot:run
```

(Windows: `.\mvnw.cmd spring-boot:run`)

The API starts on **http://localhost:8080**. On first startup, `AdminSeeder` automatically creates a default admin account if one doesn't already exist — see [Default Admin Login](#default-admin-login) below.

Optional environment variables (all have working defaults for local dev):

| Variable | Default | Purpose |
|---|---|---|
| `JWT_SECRET` | `eventbooking-demo-secret-key-change-me-min-32-chars` | HMAC signing key for JWTs |
| `JWT_EXPIRATION_MINUTES` | `60` | Token lifetime |
| `ADMIN_NAME` | `System Admin` | Seeded admin's display name |
| `ADMIN_EMAIL` | `admin@eventbooking.com` | Seeded admin's login email |
| `ADMIN_PASSWORD` | `Admin@12345` | Seeded admin's login password |

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app starts on **http://localhost:5173**. `vite.config.js` proxies any `/api/*` request to `http://localhost:8080`, so the backend must be running for the frontend to work.

## Default Admin Login

A default admin user is seeded automatically the first time the backend starts (see [`AdminSeeder.java`](backend/src/main/java/com/eventbooking/config/AdminSeeder.java)) — no manual database editing required.

| Field | Value |
|---|---|
| Email | `admin@eventbooking.com` |
| Password | `Admin@12345` |

Log in with these credentials to reach the admin-only pages (Manage Events, All Bookings, Reports). Change `ADMIN_PASSWORD` before any real deployment — this default is for local development only.

Any other account created through **Register** is a normal `CUSTOMER`.

## Sample Data / Seeding Instructions

Only the admin account is seeded automatically. Events and bookings start empty — to populate the system for a demo:

1. Log in as the seeded admin (above).
2. Go to **Manage Events → Create Event** and add a few events (title, category, venue, date/time, capacity, price).
3. Log out, then **Register** a normal customer account (or log in as one you already created).
4. Browse **Events**, open one, and book some seats — this creates `Booking` documents.
5. Log back in as admin and open **All Bookings** and **Reports** to see the booked data and the MongoDB aggregation reports (bookings per event, revenue per event) reflect real numbers.

Repeating steps 3–4 with a couple of different customer accounts and events gives the reports something more interesting to aggregate.

## API Endpoints

All endpoints are prefixed with `/api`. "Auth" = requires a valid `Authorization: Bearer <token>` header. "Admin" = also requires the token's role to be `ADMIN` (enforced in [`SecurityConfig.java`](backend/src/main/java/com/eventbooking/security/SecurityConfig.java)).

### Auth — `/api/auth` (public)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create a new `CUSTOMER` account, returns a JWT |
| POST | `/api/auth/login` | Authenticate, returns a JWT |

### Events — `/api/events`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/events` | Auth | Paginated list; query params `category`, `keyword`, `page`, `size`, `sortBy`, `direction` |
| GET | `/api/events/{id}` | Auth | Single event details |
| POST | `/api/events` | Admin | Create an event |
| PUT | `/api/events/{id}` | Admin | Update an event |
| DELETE | `/api/events/{id}` | Admin | Deactivate (soft-cancel) an event |

### Bookings — `/api/bookings`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/bookings` | Auth | Book seats on an event |
| GET | `/api/bookings/mine` | Auth | The logged-in user's own bookings |
| GET | `/api/bookings` | Admin | Every booking, across all customers |
| DELETE | `/api/bookings/{id}` | Auth (owner only) | Cancel your own booking; releases the seats back to the event |

### Reports — `/api/reports` (Admin, MongoDB aggregation)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/reports/bookings-per-event` | Total bookings and seats booked per event |
| GET | `/api/reports/revenue-per-event` | Total seats booked and revenue (seats × price) per event |

## User Roles

| Role | Capabilities |
|---|---|
| `CUSTOMER` | Register/login, browse/search/filter events, book seats, view and cancel their own bookings |
| `ADMIN` | Everything a customer can do, plus: create/edit/deactivate events, view all bookings, view reports |

## Business Rules Implemented

- A user cannot book more seats than are currently available (checked atomically with MongoDB `findAndModify` to avoid race conditions between concurrent bookings).
- A user cannot book a past or cancelled event.
- Cancelling a booking returns the seats to the event's available count.
- An admin cannot reduce an event's capacity below the number of seats already booked.
- Email must be unique at registration.
- A user can only cancel their own booking (`403` if attempting to cancel someone else's).

## Screenshots

Add screenshots of the running app here before final submission, e.g. saved under `docs/screenshots/` and referenced like:

```md
![Login page](docs/screenshots/login.png)
![Events list](docs/screenshots/events-list.png)
![Event details + booking](docs/screenshots/event-details.png)
![My Bookings](docs/screenshots/my-bookings.png)
![Admin — Manage Events](docs/screenshots/admin-events.png)
![Admin — All Bookings](docs/screenshots/admin-bookings.png)
![Admin — Reports](docs/screenshots/admin-reports.png)
```

Suggested pages to capture: login, register, events list (with a filter/sort applied), event details with a booking made, my bookings, and all three admin pages.

## Assumptions, Limitations & Notes

- Prices are in RM (Malaysian Ringgit), stored as a plain `double` — fine at capstone scale, not suitable for real currency handling.
- Deactivating an event is one-way — there's no "reactivate" endpoint, matching the brief's "deactivate" (soft-delete) pattern rather than a full status workflow.
- No payment gateway, email notifications, or QR ticketing — intentionally out of scope per the project brief's scope control guidance (§16).
- The admin account is a single seeded account; there's no admin user-management UI, since only the main entity (events) and transaction entity (bookings) are required to have full CRUD/admin management per the brief.
- JWTs expire after 60 minutes by default (`JWT_EXPIRATION_MINUTES`); the frontend detects an expired/invalid token on any API call and automatically clears the session and redirects to `/login`.
