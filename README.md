# Fire Map

A web application for tracking and managing fire-related events and resources.

## Project Overview

Fire Map is a full-stack application that helps emergency services track and respond to fire incidents. The application consists of:

- **Backend**: FastAPI-based Python service with PostgreSQL/PostGIS for geospatial data
- **Frontend**: React application with Material UI and Leaflet for interactive maps
- **Database**: PostgreSQL with PostGIS extension for geospatial capabilities

## Development Setup with Docker

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd fire_map
   ```

2. Start the development environment:
   ```bash
   docker-compose up
   ```

   This will:
   - Build and start the backend service on port 8000
   - Build and start the frontend service on port 5173
   - Start a PostgreSQL database with PostGIS extension on port 5432

3. Access the services:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Development Workflow

The Docker setup includes volume mounts for both frontend and backend code, enabling hot-reloading:

- Changes to frontend code in `./frontend/src` will automatically reload in the browser
- Changes to backend code in `./backend/src` will automatically reload the API server


### Running Migrations

To run database migrations:

```bash
docker-compose exec backend alembic upgrade head
```

### Running Tests

To run backend tests:

```bash
docker-compose exec backend pytest
```

## Project Structure

```
fire_map/
├── backend/                # Python FastAPI backend
│   ├── src/                # Source code
│   ├── tests/              # Test files
│   ├── alembic/            # Database migrations
│   ├── Dockerfile          # Backend Docker configuration
│   └── pyproject.toml      # Python dependencies
├── frontend/               # React frontend
│   ├── src/                # Source code
│   ├── public/             # Static assets
│   ├── Dockerfile          # Frontend Docker configuration
│   └── package.json        # JavaScript dependencies
└── docker-compose.yaml     # Docker Compose configuration
```

## Tech Stack

### Backend
- FastAPI
- SQLAlchemy
- Alembic
- PostgreSQL with PostGIS
- Pydantic

### Frontend
- React
- TypeScript
- Material UI
- Leaflet for maps

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues:

1. Ensure the PostgreSQL container is running:
   ```bash
   docker-compose ps
   ```

2. Check the database logs:
   ```bash
   docker-compose logs postgres
   ```

### Container Build Issues

If you need to rebuild the containers:

```bash
docker-compose build --no-cache
```

### Resetting the Database

To reset the database:

```bash
docker-compose down -v
docker-compose up
```

## License


