# Helpdesk Ticket Management

A helpdesk app where customers create support tickets and the company staff manage them.
Backend: Django REST Framework. Frontend: React (Vite).

## Features

- Register, login and current user (`/me`) with JWT authentication
- Create tickets, view ticket details, add comments
- Search (debounced), filter by status and priority, pagination
- Each customer sees only their own tickets; staff see all tickets
- Django admin panel for the company to view all data

## Setup

### Backend

Run these from the project root (the folder that contains `backend` and `frontend`).

```bash
python -m venv venv
venv\Scripts\activate
cd backend
pip install -r requirements.txt
```

Create a `.env` file in `backend/` using `.env.example` as a guide:

```
SECRET_KEY=your-secret-key
DEBUG=True
```

Then:

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

The API runs at http://127.0.0.1:8000/api/ and the admin panel at http://127.0.0.1:8000/admin/.

### Frontend

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:

```
VITE_API_URL=http://127.0.0.1:8000/api
```

Then:

```bash
npm run dev
```

Open http://localhost:5173.

## API summary

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | Create an account |
| POST | `/api/auth/login/` | Get a JWT access and refresh token |
| POST | `/api/auth/refresh/` | Get a new access token |
| GET | `/api/auth/me/` | Current user |
| GET, POST | `/api/tickets/` | List (paginated, filter, search, order) and create tickets |
| GET, PUT, PATCH, DELETE | `/api/tickets/{id}/` | Ticket detail, update, delete |
| GET, POST | `/api/tickets/{id}/comments/` | List and add comments |

List query parameters: `status`, `priority`, `assigned_to`, `search`, `ordering`, `page`.

## Design decisions

- **JWT authentication (SimpleJWT):** stateless, works well with a separate React app. The access token expires after 30 minutes.
- **Data privacy:** `get_queryset` filters tickets by the logged-in user on the server. A customer cannot read or edit another customer's ticket (they get a 404). Staff users can see all tickets.
- **Query optimisation:** `select_related("created_by", "assigned_to")` on the ticket list, and `select_related("author")` on comments, to avoid N+1 queries.
- **Validation:** a closed ticket cannot be moved back to open (returns a 400 with a clear message). Passwords are hashed by Django and checked by Django's password validators.
- **Security settings:** secrets are in `.env` (not committed), CORS allows only the React app, and request throttling slows down password guessing.
- **Frontend structure:** API calls are separated from components (`src/api/client.js` and `src/api/services.js`). An Axios interceptor adds the token to each request and logs the user out if it expires. Search uses a debounce hook. Every page has loading and error states.

## Assumptions

- Staff status is set in the Django admin panel.
- The token is stored in `localStorage`, which is simple but readable by scripts. A production app should use httpOnly cookies.
- Ordering by `priority` sorts alphabetically (high, low, medium), not by importance.

## Not finished

I focused on the frontend and kept the backend small. Not done:

- Automated tests (backend and frontend)
- Edit and delete ticket screens in React (the API already supports them)
- A screen for staff to change ticket status or assign tickets (staff can do it in the admin panel)
- Refresh-token handling in React (the user logs in again after the token expires)
- Bonus items (Docker, Swagger docs, CI)