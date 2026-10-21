# Atul Kumar Dubey — Dynamic Portfolio CMS

Responsive public portfolio and a separate `/admin-panel/` dashboard. Public content is read from Django REST APIs and stored in SQLite locally or PostgreSQL in production. Admin edits are protected by Django staff authentication and server-side permissions.

## Project structure

```text
.
├── backend/
│   ├── config/                 # Django settings, URLs, WSGI/ASGI
│   ├── portfolio/              # Models, API serializers/views, validators
│   │   ├── management/commands/ # Starter content command
│   │   └── migrations/          # Database schema history
│   ├── .env.example
│   ├── manage.py
│   └── requirements.txt
├── public/                     # Vite static assets
├── src/
│   ├── lib/api.js               # CSRF-aware API client
│   ├── pages/PortfolioApp.jsx   # Public site and project detail route
│   ├── pages/AdminApp.jsx       # Secure dashboard UI
│   ├── main.jsx
│   └── *.css                    # Responsive styling and Tailwind entry
├── .env.example                # Vite API URL placeholder
├── index.html                  # SEO metadata and Vite entry
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── vercel.json
```

### Architecture

React/Vite serves the public portfolio and the admin UI. The public site calls read-only Django REST endpoints for profile, skills, projects, experience, education, certifications, resume, and website settings. The contact form submits to a write-only public endpoint with validation, a honeypot, and rate limiting.

The dashboard uses Django session authentication with CSRF protection. All editing APIs check staff permissions on the server; contact messages are staff-only. Django stores portfolio records in SQLite locally, or PostgreSQL through `DATABASE_URL`. Images and PDFs use local Django media storage in development and can use a private S3 bucket in production; S3 URLs are signed. Do not put credentials in React or commit `.env` files.

## Run locally on Windows PowerShell

Install Node.js 18+ and Python 3.11+ first. Open two PowerShell terminals in the project folder.

### 1. Backend terminal

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
Copy-Item .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py seed_portfolio
python manage.py runserver 127.0.0.1:8000
```

Edit `backend\.env` if needed. The defaults are for local development. `seed_portfolio` creates starter records only when they do not already exist; review and edit all profile facts in the dashboard before publishing.

### 2. Frontend terminal

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev -- --host 127.0.0.1
```

Open the Vite URL printed in the terminal. Visit `/admin-panel/` and sign in using the Django superuser or another staff account. Use `/django-admin/` for Django's built-in administration site.

If PowerShell blocks activation, run `Set-ExecutionPolicy -Scope Process Bypass` in that terminal, then activate the virtual environment again.

## API overview

Public read endpoints:

- `GET /api/profile/`
- `GET /api/skills/`, `/api/projects/`, `/api/experience/`, `/api/education/`, `/api/certifications/`
- `GET /api/resume/`, `/api/settings/`
- `POST /api/contact/` (creates a private message; no public message-list API)

Staff-only operations use the same collection routes with `POST`, `PATCH`, and `DELETE`; contact messages are available only through staff-authorized `/api/messages/`. Session endpoints are `/api/auth/csrf/`, `/api/auth/login/`, `/api/auth/me/`, and `/api/auth/logout/`.

## Uploading portfolio content

Sign in at `/admin-panel/`. Use Profile and About for text and profile photo, Skills and Projects for portfolio cards, and Experience, Education, and Certifications for timeline entries. Project images accept JPG, PNG, or WebP up to 5 MB. Resume accepts PDF up to 10 MB. Server-side validators check file extension, size, and image/PDF signatures. The latest uploaded resume appears as a public download on the portfolio.

The public frontend does not contain portfolio data arrays. Use `python manage.py seed_portfolio` once for starter entries, then manage them through the dashboard. Remove or correct starter content that does not match your current resume.

## Run checks

```powershell
# Frontend production compilation
npm run build

# Backend automated API/security tests
cd backend
python manage.py test
```

The backend tests cover public reads, staff-only writes/messages, and contact validation. Also manually try a profile edit, project create/edit/publish/delete, image upload, resume download, contact submission, and mobile layout before deployment.

## Deployment

Deploy the Django API on Render and attach a managed PostgreSQL database. Set backend environment variables in the Render dashboard:

- `DJANGO_SECRET_KEY`: generate a unique random secret.
- `DJANGO_DEBUG=False`
- `DJANGO_ALLOWED_HOSTS`: API host only.
- `DATABASE_URL`: Render PostgreSQL connection string.
- `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS`: exact HTTPS frontend origin.
- `SESSION_COOKIE_SAMESITE=None` and `CSRF_COOKIE_SAMESITE=None` when frontend and API are on separate sites; production cookies are Secure.
- `AWS_STORAGE_BUCKET_NAME`, `AWS_S3_REGION_NAME`, `AWS_ACCESS_KEY_ID`, and `AWS_SECRET_ACCESS_KEY` for persistent media storage. Keep the bucket private; Django returns signed media URLs.

Set the Render service root directory to `backend`; use `pip install -r requirements.txt && python manage.py collectstatic --noinput` as the build command and `python manage.py migrate && gunicorn config.wsgi:application` as the start command. Create a superuser with a one-off shell/console command after deploying. Configure CORS/CSRF origins before testing login.

Deploy the frontend to Vercel. Set `VITE_API_URL` to the HTTPS Django API URL, then deploy. `vercel.json` routes project detail URLs and `/admin-panel/` through the React app. Configure the backend's CORS and trusted CSRF origins to match the deployed Vercel domain exactly. Verify admin login, a content edit, image/resume downloads, and a contact submission against production.

The app is not deployed by this repository setup. Production media storage and a real database must be configured before deploying.
