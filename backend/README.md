# UniSwap — Backend (Phase 3)

Django + Django REST Framework backend for **UniSwap**, the campus-only
marketplace where students buy, sell, swap, and donate items using their
university email. Built to the ERD and Phase 3 System Design Specification
for the "Backend Developer & Database Admin" role.

## Stack
- Django 6.1 + Django REST Framework
- PostgreSQL (SQLite supported for a zero-install local demo)
- JWT auth (djangorestframework-simplejwt), login by **university email**
- django-cors-headers (for a separate React/Vue frontend)
- django-filter (marketplace search/filter, incl. price range)

## Apps → ERD mapping
| App             | Models                              | ERD entity                     |
|------------------|---------------------------------------|-----------------------------------|
| `accounts`       | `University`, `User`, `AdminProfile`  | University, User, Admin          |
| `listings`       | `Category`, `Listing`, `ListingImage` | Category, Listing                |
| `messaging`      | `Message`                              | Message                          |
| `favourites`     | `Favourite`                            | Favourite (junction table)       |
| `notifications`  | `Notification`                         | Notification                     |
| `moderation`      | `Report`, `ModerationLog`              | Report                           |

Primary keys are named to match the ERD exactly (`university_id`, `user_id`,
`listing_id`, `message_id`, `favourite_id`, `report_id`, `category_id`,
`admin_id`) so the database schema can be read directly against the diagram.

## Setup

```bash
python -m venv venv
source venv/bin/activate        # venv\Scripts\activate on Windows
pip install -r requirements.txt

cp .env.example .env            # then edit with your DB credentials
# For a quick local run without installing Postgres, set USE_SQLITE=True in .env

python manage.py migrate
python manage.py shell < seed_data.py   # optional: loads demo data matching the mock-ups
python manage.py createsuperuser        # your own admin login for /admin/
python manage.py runserver
```

Visit:
- `http://127.0.0.1:8000/admin/` — Django admin (also works as a moderation UI)
- `http://127.0.0.1:8000/api/...` — API (see below)

## PostgreSQL setup

```sql
CREATE DATABASE uniswap;
CREATE USER uniswap_user WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE uniswap TO uniswap_user;
```

Fill in `.env` with matching `DB_NAME` / `DB_USER` / `DB_PASSWORD`.

## Key business rules implemented

- **University-restricted registration** — a student's email domain must
  match their selected `University.email_domain` (e.g. `@spu.ac.za`).
  Registering with a non-matching domain (e.g. Gmail) returns a 400 with a
  clear error — this directly fixes the gap User 01 flagged in testing
  ("I almost typed my Gmail, there's no hint it must be .ac.za"). The
  frontend should surface this same validation message inline.
- **Listing types** (`FOR_SALE` / `SWAP` / `DONATE`) match the "All Feed /
  For Sale / Swaps / Donations" tabs in the mock-up. For-sale items require
  a price > 0; swap and donation items always have `price = null`.
- **Price filtering** (`?min_price=&max_price=`) — added per User 03's
  feedback ("I'm on a budget, I need to filter by price").
- **Listing statuses**: `PENDING → LIVE` (admin-approved), `FLAGGED`,
  `REMOVED` — matches the Moderator Overview mock-up's status column.
- **Reports** feed the "Pending Flags" count and "Urgent Attention" queue
  shown on the admin dashboard, via `/api/moderation/listings/stats/`.
- **Automatic notifications** (via Django signals, not manual calls in
  views) fire on: new message, listing favourited, listing approved/flagged/
  removed, and report received — matching the ERD's notification-trigger
  list exactly.

## API Overview

### Accounts (`/api/accounts/`)
| Method | Endpoint         | Description                                  |
|--------|--------------------|-------------------------------------------------|
| GET    | `universities/`    | List universities (populates signup dropdown)     |
| POST   | `register/`         | Create account — email domain must match university |
| POST   | `login/`             | Obtain JWT (`{"email": ..., "password": ...}`)      |
| POST   | `login/refresh/`     | Refresh access token                                |
| GET/PATCH | `me/`             | View/update own profile                             |
| GET    | `<user_id>/`         | Public profile (e.g. before messaging a seller)    |

### Listings (`/api/listings/`)
| Method | Endpoint                     | Description                                 |
|--------|---------------------------------|-------------------------------------------------|
| GET    | `categories/`                    | List categories (sidebar filter)                 |
| GET    | `/`                               | Marketplace feed — only `LIVE` listings by default |
| GET    | `/?listing_type=SWAP`             | Filter by type: `FOR_SALE`, `SWAP`, `DONATE`     |
| GET    | `/?min_price=&max_price=`         | Price range filter                                |
| GET    | `/?category=1&condition=NEW`      | Category / condition filter                      |
| GET    | `/?mine=true`                      | My own listings, any status                       |
| POST   | `/`                               | Create listing → status `PENDING`                 |
| GET/PATCH/DELETE | `/<id>/`                 | Detail / edit / delete (owner only)              |
| POST   | `/<id>/images/`                   | Upload a photo                                    |

### Messaging (`/api/messaging/`)
| Method | Endpoint            | Description                                |
|--------|-----------------------|-------------------------------------------------|
| GET    | `/`                    | All my messages (sent + received)                |
| GET    | `/?with=<user_id>`     | Full thread with one specific user               |
| GET    | `threads/`             | One row per conversation partner (inbox view)   |
| POST   | `/`                    | Send `{"receiver": id, "listing": id, "message_text": "..."}` |
| POST   | `/<id>/mark_read/`     | Mark a received message read                      |

### Favourites (`/api/favourites/`)
| Method | Endpoint | Description             |
|--------|------------|----------------------------|
| GET/POST | `/`      | List / save `{"listing": id}` |
| DELETE | `/<id>/`   | Un-save                    |

### Notifications (`/api/notifications/`)
| Method | Endpoint          | Description         |
|--------|---------------------|-------------------------|
| GET    | `/`                  | My notifications          |
| POST   | `/<id>/mark_read/`   | Mark one read              |
| POST   | `mark_all_read/`     | Mark all read               |

### Moderation (`/api/moderation/`) — admin-only unless noted
| Method | Endpoint                    | Description                              |
|--------|--------------------------------|----------------------------------------------|
| POST   | `reports/`                       | Any student reports a listing (auth required)  |
| GET    | `reports/`                       | Admin: view the report queue                    |
| GET    | `logs/`                          | Audit trail of moderation actions               |
| POST   | `listings/<id>/approve/`         | `PENDING → LIVE`                                |
| POST   | `listings/<id>/flag/`            | Body: `{"reason": "..."}`                       |
| POST   | `listings/<id>/remove/`          | Body: `{"reason": "..."}`                       |
| GET    | `listings/stats/`                | Dashboard counts (active/pending/flagged/reports) |

## Auth
Protected endpoints expect `Authorization: Bearer <access_token>`. Get a
token from `/api/accounts/login/` (email + password) or `/api/accounts/register/`.

## Deployment (Heroku / PythonAnywhere / local demo)
1. Set `DEBUG=False` and a real random `SECRET_KEY` in production config vars.
2. Set `ALLOWED_HOSTS` to your actual domain.
3. Add `gunicorn` to requirements and a `Procfile`: `web: gunicorn config.wsgi`.
4. Run `python manage.py collectstatic`; serve static files via whitenoise or
   the host's static file handling.
5. Point `DATABASES` at the platform's managed Postgres instance (Heroku
   injects `DATABASE_URL` — add `dj-database-url` if using Heroku Postgres).
6. For a local demo instead of the cloud, `USE_SQLITE=True` + `runserver`
   is enough — no Postgres install required.

## Error handling & code style notes
- DRF serializers validate all input and return structured 400 errors
  (e.g. wrong email domain, missing price on a for-sale listing).
- `IsOwnerOrReadOnly` gates edits/deletes to the listing's owner or staff.
- `IsAdminUser` gates all moderation actions to `is_staff` accounts.
- Notifications are generated by Django **signals**, not scattered
  `notify()` calls inside every view — keeps each app's views focused on
  their own responsibility.
- Every app is self-contained (`models.py` / `serializers.py` / `views.py`
  / `urls.py`), so team members can work on separate features (e.g.
  Messaging vs. Moderation) without merge conflicts.

## Tested end-to-end (see conversation for full smoke-test output)
- ✅ Registration rejects non-university email domains
- ✅ For-sale listings require a price; swap/donate force `price = null`
- ✅ Admin approve/flag/remove transitions + audit log entries
- ✅ Favouriting, messaging, and reporting all auto-generate notifications
- ✅ Price range filtering (`min_price` / `max_price`)
- ✅ Unauthenticated write attempts correctly return 401
