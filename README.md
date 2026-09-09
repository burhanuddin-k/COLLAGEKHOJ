# CollegeKhoj

**Find. Compare. Decide.**

CollegeKhoj is an India-wide college discovery, comparison and admission
information platform. Students can search colleges by name, course, city
or state, compare shortlists side by side, explore courses, track
admission deadlines, read moderated reviews, and manage their whole
college-decision journey in one dashboard — with every fee, date and
facility carrying a verification status instead of an invented number.

🔗 **Live demo:** [http://3.236.120.65:5173](http://3.236.120.65:5173)
📦 **Repository:** [github.com/burhanuddin-k/COLLAGEKHOJ](https://github.com/burhanuddin-k/COLLAGEKHOJ)

![CollegeKhoj homepage](docs/screenshots/live-app-homepage.png)

---

## Table of contents

1. [Tech stack](#tech-stack)
2. [Architecture](#architecture)
3. [Project structure](#project-structure)
4. [Getting started (local development)](#getting-started-local-development)
5. [Running with Docker](#running-with-docker)
6. [CI/CD with Jenkins](#cicd-with-jenkins)
7. [AWS infrastructure](#aws-infrastructure)
8. [Environment variables](#environment-variables)
9. [Roadmap](#roadmap)

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, React Router |
| Backend | Node.js, Express.js, JWT auth, bcrypt |
| Database | MySQL 8 |
| Containers | Docker, Docker Compose |
| CI/CD | Jenkins |
| Cloud | AWS (VPC, EC2) |
| Source control | Git, GitHub |

---

## Architecture

```
 Developer
    │  git push (main)
    ▼
 GitHub  ───────────────►  Jenkins (build/test/deploy pipeline)
                                  │
                                  ▼
                       Docker images built on the
                       EC2 host and started via
                       docker-compose
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        ▼                         ▼                          ▼
 collagekhoj-frontend     collagekhoj-backend          collagekhoj-mysql
   (Vite build, :5173)      (Express API, :4000)          (MySQL 8, internal)
        │                         │                          │
        └───────────────┬─────────┘◄─────────────────────────┘
                         ▼
                AWS EC2 instance "COLLAGEKHOJ"
                inside VPC "Burhan-VPC" (10.0.0.0/16)
                        us-east-1 (N. Virginia)
```

The frontend and backend are shipped as separate containers and talk to
each other over HTTP; MySQL is only reachable from inside the Docker
network, not exposed to the internet.

---

## Project structure

```
COLLAGEKHOJ/
├── Docker-compose.yml
├── Jenkinsfile
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       ├── services/
│       ├── utils/
│       └── validators/
├── database/
│   ├── schema.sql
│   └── seed_demo.sql
├── docs/
│   └── LOCAL_DEV.md
└── frontend/
    ├── Dockerfile
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── api/
        ├── components/
        ├── context/
        ├── pages/
        └── styles/
```

![Project structure tree](docs/screenshots/project-structure-tree.png)

---

## Getting started (local development)

### Prerequisites

- Node.js 20+
- MySQL 8.x (local install, or a container)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/burhanuddin-k/COLLAGEKHOJ.git
cd COLLAGEKHOJ
```

### 2. Set up the database

```bash
mysql -u root -p < database/schema.sql
# optional — adds one clearly-labelled demo college for local testing
mysql -u root -p < database/seed_demo.sql
```

### 3. Start the backend

```bash
cd backend
cp .env.example .env      # fill in DB_HOST, DB_USER, DB_PASSWORD, JWT_SECRET
npm install
npm run dev
```

The API starts on `http://localhost:4000` — check `http://localhost:4000/api/health`.

### 4. Start the frontend

```bash
cd frontend
cp .env.example .env      # set VITE_API_BASE_URL=http://localhost:4000/api
npm install
npm run dev
```

The site runs on `http://localhost:5173`.

More detail (creating an admin account, etc.) is in [`docs/LOCAL_DEV.md`](docs/LOCAL_DEV.md).

---

## Running with Docker

The whole stack — frontend, backend and MySQL — can be brought up with a
single command using the root `Docker-compose.yml`:

```bash
docker compose -f Docker-compose.yml up --build -d
```

This is exactly what's running on the production EC2 instance today:

![Docker containers running on EC2](docs/screenshots/docker-containers-running.png)

| Container | Image | Port mapping | Status |
|---|---|---|---|
| `collagekhoj-frontend` | `collagekhoj-frontend` | `5173 → 80` | Up |
| `collagekhoj-backend` | `collagekhoj-backend` | `4000 → 4000` | Up (healthy) |
| `collagekhoj-mysql` | `mysql:8.0` | internal only (`3306`, `33060`) | Up (healthy) |

Check container status at any time with:

```bash
docker ps
docker compose logs -f backend
```

---

## CI/CD with Jenkins

Every push to `main` triggers the Jenkins job **COLLAGEKHOJ**, which
builds fresh Docker images and redeploys the stack on the EC2 host via
the repository's `Jenkinsfile`.

![Jenkins pipeline history](docs/screenshots/jenkins-pipeline.png)

Typical pipeline flow:

1. **Checkout** — pull the latest `main` from GitHub.
2. **Install & build** — install frontend/backend dependencies and build
   the Vite production bundle.
3. **Docker build** — build the `collagekhoj-frontend` and
   `collagekhoj-backend` images.
4. **Deploy** — stop the running containers and bring the stack back up
   with `docker compose`, so the running site always matches `main`.

Build history and duration are visible directly on the Jenkins
dashboard, so a broken build is caught the same time it lands on `main`.

---

## AWS infrastructure

The app is deployed on a single EC2 instance for now, inside its own VPC:

![AWS VPC dashboard](docs/screenshots/aws-vpc-dashboard.png)

| Resource | Value |
|---|---|
| VPC | `vpc-0bbced1c744650bf6` ("Burhan-VPC") |
| VPC CIDR | `10.0.0.0/16` |
| Region | `us-east-1` (N. Virginia) |
| Subnet | `subnet-0b452588c99dbc31c` ("Subnet-Pub") |

![EC2 instance details](docs/screenshots/aws-ec2-instance.png)

| Resource | Value |
|---|---|
| Instance name | COLLAGEKHOJ |
| Instance ID | `i-0b50b1268370b217a` |
| Instance type | `c7i-flex.large` |
| Public IPv4 | `100.54.105.246` |
| Private IPv4 | `10.0.6.251` |
| IMDSv2 | Required |

> The frontend and backend ports (`5173`, `4000`) are currently exposed
> directly from the EC2 security group. Fronting them with Nginx (or an
> Application Load Balancer + ACM certificate) for HTTPS is on the
> [roadmap](#roadmap) below.

### GitHub repository

![GitHub repository](docs/screenshots/github-repository.png)

---

## Environment variables

**`backend/.env`**

```
NODE_ENV=production
PORT=4000
DB_HOST=mysql
DB_PORT=3306
DB_NAME=collegekhoj
DB_USER=collegekhoj_app
DB_PASSWORD=change_me
JWT_SECRET=change_me_to_a_long_random_string
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://3.236.120.65:5173
```

**`frontend/.env`**

```
VITE_API_BASE_URL=http://3.236.120.65:4000/api
```

Never commit real secrets — `.env` is gitignored, and `.env.example`
files in both `backend/` and `frontend/` document the required keys
without values.

---

## Roadmap

- [ ] Put Nginx (or an ALB) in front of the containers for HTTPS and a
      single public port instead of exposing `5173`/`4000` directly.
- [ ] Move MySQL off the EC2 host onto RDS for backups and easier scaling.
- [ ] Add Prometheus + Grafana for container and API monitoring.
- [ ] Route 53 + a real domain instead of the raw EC2 IP.
- [ ] Admin "Add/Edit College" and Manage Users/Reports/Analytics screens.
- [ ] S3-backed gallery uploads and email/browser notification delivery.

---

## License

This project is currently unlicensed (all rights reserved by the
repository owner). Add a `LICENSE` file if you intend to open-source it.
