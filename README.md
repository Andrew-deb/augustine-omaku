# Augustine Omaku — Portfolio

A modern, full-stack portfolio website for **Augustine Omaku**, a Microsoft-certified Data & Cloud Professional with 10+ years of experience in Power BI, Azure, and data analytics.

🌐 **Live:** [augustineomaku.com](https://augustineomaku.com)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS 4 |
| Backend | FastAPI, SQLAlchemy 2.0 (async) |
| Database | PostgreSQL (Supabase) |
| Auth | Supabase Auth |
| Email | SendGrid |
| Image CDN | ImageKit.io |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Features

- **Animated Landing Page** — Hero section with smooth transitions and scroll effects
- **About & Certifications** — Career highlights, Microsoft certifications (PL-300, AZ-900, DP-900), tools showcase
- **YouTube Integration** — Live playlist data and subscriber/view counts from YouTube Data API v3
- **Live Sessions** — Browse training sessions, register with email confirmation, seat tracking, and waitlisting
- **Contact Form** — SendGrid-powered email delivery with HTML templates
- **Admin Dashboard** — Full management panel for sessions, bookings, analytics, notifications, and image uploads
- **SWR Caching** — Instant page loads using stale-while-revalidate pattern with localStorage

---

## Project Structure

```
bros-austine-portfolio/
│
├── portfolio-refresh-pro-1/        # ── Frontend (React + Vite) ──
│   ├── src/
│   │   ├── components/             # Navbar, Hero, Footer, StatsCounter, etc.
│   │   ├── pages/                  # Home, About, YouTube, LiveSessions, Contact
│   │   │   └── admin/              # Admin dashboard pages
│   │   ├── hooks/                  # useCachedFetch (SWR hook)
│   │   ├── config/                 # API URL, Supabase client
│   │   ├── context/                # Auth context provider
│   │   ├── assets/                 # Images and media
│   │   ├── App.jsx                 # Root component + routing
│   │   └── main.jsx                # Entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/                        # ── Backend (FastAPI) ──
│   ├── app/
│   │   ├── api/v1/routes/          # All API endpoints
│   │   ├── core/                   # DB, security, rate limiting, exceptions
│   │   ├── models/                 # SQLAlchemy models (Session, Booking, Notification)
│   │   ├── schemas/                # Pydantic request/response schemas
│   │   ├── services/               # Business logic (email, YouTube, ImageKit, etc.)
│   │   ├── app.py                  # FastAPI app factory
│   │   └── configs.py              # Settings (reads .env)
│   ├── alembic/                    # Database migrations
│   ├── requirements.txt            # Python dependencies
│   └── seed_sessions.py            # Database seeder
│
└── README.md
```

---

## Running Locally

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL database (or a [Supabase](https://supabase.com) project)

---

### 1. Backend

```bash
cd backend

# Create & activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env (see Environment Variables below)

# Run database migrations
python -m alembic upgrade head

# Start the server
uvicorn app.app:app --reload
```

API available at `http://localhost:8000` — Swagger docs at `http://localhost:8000/docs`

---

### 2. Frontend

```bash
cd portfolio-refresh-pro-1

# Install dependencies
npm install

# Create .env (see Environment Variables below)

# Start dev server
npm run dev
```

Site available at `http://localhost:5173`

---

## Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql://user:password@host:port/database
SENDGRID_API_KEY=SG.xxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
CONTACT_EMAIL=hello@yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
YOUTUBE_API_KEY=your-youtube-api-key
YOUTUBE_CHANNEL_ID=your-channel-id
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_JWT_SECRET=your-jwt-secret
IMAGEKIT_PRIVATE_KEY=your-private-key
IMAGEKIT_PUBLIC_KEY=your-public-key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-id
```

### Frontend (`portfolio-refresh-pro-1/.env`)

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## API Endpoints

### Public

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/sessions` | List active sessions |
| `GET` | `/api/v1/sessions/{code}` | Get session by code |
| `POST` | `/api/v1/bookings/{code}` | Register for a session |
| `GET` | `/api/v1/bookings/ref/{reference}` | Look up a booking |
| `POST` | `/api/v1/contact` | Submit contact form |
| `GET` | `/api/v1/youtube/playlists` | YouTube playlists + videos |
| `GET` | `/api/v1/youtube/channel-stats` | Channel statistics |

### Admin (Bearer token required)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/admin/analytics/overview` | Dashboard KPIs |
| `GET/POST/PUT/DELETE` | `/api/v1/admin/sessions` | Session CRUD |
| `GET` | `/api/v1/admin/bookings` | List/filter bookings |
| `GET` | `/api/v1/admin/bookings/export/csv` | Export as CSV |
| `GET` | `/api/v1/admin/bookings/export/excel` | Export as Excel |
| `GET/PATCH` | `/api/v1/admin/notifications` | Notification feed |
| `POST` | `/api/v1/admin/upload/image` | Upload session image |

---

## Deployment

| Service | Platform | Config |
|---|---|---|
| Frontend | Vercel | Framework: Vite, Build: `npm run build`, Output: `dist`, Root: `portfolio-refresh-pro-1` |
| Backend | Render | Runtime: Python 3, Start: `uvicorn app.app:app --host 0.0.0.0 --port $PORT`, Root: `backend` |

---

## License

This project is private and built for Augustine Omaku.
