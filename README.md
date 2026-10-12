# UniSwap SA — Full-Stack University Student Marketplace
### Sol Plaatje University (SPU) Campus Wardrobe Collective & Circular Economy

UniSwap SA is a complete, production-ready full-stack web application built for **Sol Plaatje University (SPU)** in Kimberley, South Africa. It enables university students to exchange garments via **Direct Peer Swaps** or give away academic items via **Free Campus Donations**, completely cash-free (no commercial selling, no prices), and coordinate handovers within monitored **SPU Safe Meetup Zones**.

---

## 🚀 Quick Start (One-Click Launch)

### Option 1: Zero-Dependency Launch (Recommended for Classmates / Evaluators)
Double-click:
```cmd
run.bat
```
*(Or in terminal: `python run.py`)*

- **Requires ONLY Python** (no Node.js or npm needed!).
- Automatically starts Django and serves the **complete React application + REST API** on **`http://127.0.0.1:8000/`**.
- Automatically creates virtual environment, seeds 24 campus listings, and opens your browser.

---

### Option 2: Full Developer Mode (Vite Hot-Reload)
Double-click:
```cmd
start_all.bat
```
- Starts Django REST API on `http://127.0.0.1:8000`
- Starts Vite React development server on `http://127.0.0.1:5173`
- Opens your browser to `http://127.0.0.1:5173/`

---

## 🛠️ Manual Terminal Setup

### 1. Backend (Django REST Framework + SQLite/PostgreSQL)
```bash
cd backend

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies (if needed)
pip install -r requirements.txt

# Run migrations and seed real campus data
python manage.py migrate
python seed_data.py

# Start Django server
python manage.py runserver 127.0.0.1:8000
```
API Root: `http://127.0.0.1:8000/api/`  
Django Admin: `http://127.0.0.1:8000/admin/`

---

### 2. Frontend (React + TypeScript + Vite + Tailwind CSS)
```bash
cd frontend

# Install dependencies (if needed)
npm install

# Run automated test suite
npm test

# Build production bundle
npm run build

# Start development server
npm run dev
```
Application URL: `http://127.0.0.1:5173/`

---

## 🎓 Verified SPU Test Accounts

All accounts use the password: **`password123`**

| Student Name | Email | Faculty | Role / Status |
| :--- | :--- | :--- | :--- |
| **Katlego M.** | `katlego.m@spu.ac.za` | Faculty of Humanities | Student (Moroka Res) |
| **Nandi K.** | `nandi.k@spu.ac.za` | Faculty of Education | Student (Moroka Res) |
| **Sipho D.** | `sipho.d@spu.ac.za` | 3rd Year Education | Student (Luka Jantjie Hall) |
| **Lerato B.** | `lerato.b@spu.ac.za` | Graduating Student | Student (Moroka Res) |
| **Thabo M.** | `thabo.m@spu.ac.za` | SPU ICT Dept | Student (SPU North) |
| **Ayesha M.** | `ayesha.m@spu.ac.za` | Faculty of Science | Student (Central Campus) |
| **Kagiso P.** | `kagiso.p@spu.ac.za` | Faculty of Humanities | Student (Moroka Res) |
| **Zola N.** | `zola.n@spu.ac.za` | SPU Alum | Student (Off-Campus) |
| **Campus Admin** | `admin@spu.ac.za` | Student Affairs | **SPU Staff / Admin (`is_staff`)** |

---

## 🛡️ SPU Safe Exchange Zones

All peer-to-peer exchanges and handovers take place in verified campus meeting zones:
* **Zone A: Central Campus Library Atrium** (Ground floor adjacent to study hall; 08:30 – 17:00)
* **Zone B: Luka Jantjie Wing Security Desk** (Main entrance foyer near campus security; 08:00 – 18:00)
* **Zone C: Moroka Residence Front Desk** (Turnstile entrance lobby; 09:00 – 19:00)

---

## 📡 API Contract Overview

### Accounts (`/api/accounts/`)
* `GET /universities/`: List participating universities
* `POST /register/`: Register student account with `@spu.ac.za` validation
* `POST /login/`: Obtain JWT access and refresh tokens
* `POST /login/refresh/`: Renew expired access token
* `GET/PATCH /me/`: View and update authenticated student profile

### Listings (`/api/listings/`)
* `GET /categories/`: List 9 academic categories
* `GET /`: Marketplace feed (supports `listing_type`, `category`, `condition`, `search`, `ordering`, `page`)
* `POST /`: Create listing (`SWAP`, `DONATE` — 100% Cash-Free)
* `GET/PATCH/DELETE /<id>/`: Listing detail, owner update, and deletion
* `POST /<id>/images/`: Multipart photo upload (5MB max)
* `POST /<id>/reserve/`: Mark listing reserved for campus meetup
* `POST /<id>/complete_trade/`: Confirm completed handover & update sustainability score

### Messaging (`/api/messaging/`)
* `GET /threads/`: Active conversation threads summary
* `GET /?with=<user_id>`: Thread history with specific peer
* `POST /`: Send message with optional listing context
* `POST /<id>/mark_read/`: Mark incoming message read

### Favourites (`/api/favourites/`)
* `GET /`: List saved wishlist items
* `POST /toggle/`: Toggle save state for `{ "listing": <id> }`
* `DELETE /<id>/`: Delete saved item

### Notifications (`/api/notifications/`)
* `GET /`: In-app notification queue
* `POST /<id>/mark_read/`: Mark notification read
* `POST /mark_all_read/`: Mark all read

### Moderation (`/api/moderation/`)
* `GET /listings/stats/`: Live dashboard metrics (active, pending, flagged, open reports)
* `GET/POST /reports/`: Student report submission & admin queue
* `POST /listings/<id>/approve/`: Approve listing
* `POST /listings/<id>/flag/`: Flag listing with reason
* `POST /listings/<id>/remove/`: Remove listing with reason
* `GET /logs/`: Moderation audit log trail

---

## 🧪 Automated Test Results

Run `npm test` in the `frontend` directory:
* 16/16 Vitest unit and integration tests passing:
  * Formula injection & CSV sanitization
  * South African Rand (ZAR) currency formatting
  * Relative timestamps & date parsing
  * JWT storage lifecycle & error normalization
  * Listing price rules (mandatory price for sale, null for swap/donate)
  * Email domain matching (`@spu.ac.za`)
  * Dynamic filter parameter builder
