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

## Deployment (free demo)

The repository includes a Vercel frontend and a Render Django/PostgreSQL Blueprint. The Vercel rewrites proxy `/api/*` and `/media/*` to the Render API while keeping browser requests on the Vercel origin. This lets the admin session use same-origin cookies.

### 1. Deploy the frontend on Vercel

1. Push this repository to GitHub and import it in Vercel.
2. Use the repository root, the Vite preset, build command `npm run build`, and output directory `dist`.
3. Do not set `VITE_API_URL`; production API requests use the proxy in `vercel.json`.
4. Note the final production domain, for example `https://your-project.vercel.app`.

### 2. Deploy the API and database on Render

1. In Render, create a Blueprint and connect this repository. Render reads `render.yaml` from the repository root.
2. The Blueprint creates a free Django web service in Singapore and a free PostgreSQL database. When prompted for `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS`, use the exact Vercel origin from step 1 (include `https://`, no trailing slash).
3. Enter a username, email, and strong initial password for `DJANGO_SUPERUSER_USERNAME`, `DJANGO_SUPERUSER_EMAIL`, and `DJANGO_SUPERUSER_PASSWORD`.
4. Wait for the Render service to become healthy, then remove `DJANGO_SUPERUSER_PASSWORD` from its environment and deploy the change. The existing account stays in the database; the bootstrap command won't reset it.
5. Visit the Vercel URL, check the portfolio and `/admin-panel/`, then upload a replacement resume from the Resume section if needed.

The seed command adds starter portfolio content only when records are missing. Review the profile, project, experience, education, and certification details in the dashboard before sharing the site.

### Free-plan limits

This is a demo setup. Render's free web service sleeps after 15 minutes without requests and can take about a minute to wake up. Free Render Postgres expires after 30 days; data can be upgraded during the following 14-day grace period before deletion. The free web service has no persistent disk, so files uploaded through the dashboard can disappear after a restart or redeploy. The included `public/Atuldubey.pdf` is served from Vercel as the default resume, so the resume download still works if no CMS resume is available. Upgrade the Render database and web service and configure persistent media storage before relying on the site long-term.

See [Render's free service limits](https://render.com/docs/free), [Render's Django deployment guide](https://render.com/docs/deploy-django), and [Vercel rewrites](https://vercel.com/docs/routing/rewrites).
