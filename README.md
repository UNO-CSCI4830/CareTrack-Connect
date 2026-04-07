# CareTrack-Connect

A simple digital application.​  Keeps track of user's health.​  User answers a wellness questionnaire.​  Responses can be reviewed before appointments by the patient.​  Responses can be reviewed before and after appointments by the doctor.

# Group Roles and Responsibilities​
| Name                     | Role                              |
|:------------------------:|:---------------------------------:|
| Salah Aldyn Khair Allah  | Architect; Back-End               |
| Charles Dougherty        | Team Leader; Front-End            |
| Jessica Miller           | Software Developer; Full-Stack    |
| Charlie Henningsen       | Software Developer; Front-End     |
| Mohammed Njie            | Software Developer; Full Stack    |
| Robert Lake              | Quality Assurance; Back-End       |
| Zerin Shaima Meem        | Tech Support; Back-End            |

## Getting Started
Clone the repository, then install dependencies and run the frontend and backend separately.

```bash
cd CareTrack-Connect
```

### 1. Install frontend dependencies

```bash
cd frontend
npm install
```

### 2. Install backend dependencies

```bash
cd ../backend
npm install
```

### 3. Run the frontend

Open a terminal in the `frontend` folder and run:

```bash
cd frontend
npm run dev
```

The frontend runs with Vite, typically at `http://localhost:5173`.

### 4. Run the backend

Open a second terminal in the `backend` folder and run:

```bash
cd backend
npm run dev
```

The backend API runs with Nodemon.

## Documentation
- [API Reference](docs/api-reference.md) — Supabase client API, authentication, and all table operations
- [Database Schema](docs/database-schema.md) — Full SQL schema for all tables

## Notes
- Run frontend and backend in separate terminals.
- Make sure any required environment variables are configured before starting the backend.
