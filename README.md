# CollegeKhoj

CollegeKhoj is a college-discovery platform that helps students explore colleges, browse courses, compare options, and make better education decisions. The project brings the main information students need into one simple experience, including colleges, courses, admissions, and search.

 <img width="1895" height="965" alt="Screenshot 2026-09-06 180427" src="https://github.com/user-attachments/assets/709a9f52-b992-4517-862c-29bf294f0dcf" />


## What the project does

CollegeKhoj is designed to make college research easier. A student can use the platform to:

- Search for a college, course, or city
- Browse popular courses such as BBA, BCA, MBA, B.Tech, MBBS, and Law
- Explore college information and admissions
- Compare options before making an education decision
- See verified information rather than unexplained rankings

The home page focuses on a straightforward search experience and presents clear information for students looking for their next college.

## Application structure

The application is separated into a frontend, backend, and database. This keeps the user interface, server-side logic, and data layer organized and easier to deploy.

```text
Browser
   │
   ▼
Frontend (Vite / React)
   │
   ▼
Backend (Node.js)
   │
   ▼
MySQL Database
```

<img width="1826" height="942" alt="Screenshot 2026-09-09 210500" src="https://github.com/user-attachments/assets/b90ee8d8-01e2-411e-a9cd-5bb49a7185e9" />


The repository contains:

- `frontend/` — the client-side application, pages, components, API layer, and styles
- `backend/` — server code, routes, controllers, services, middleware, and validation
- `database/` — SQL schema and demo seed data
- `docs/` — local development documentation
- `Docker-compose.yml` — configuration for running the services together
- `Jenkinsfile` — CI/CD pipeline configuration

<img width="1885" height="857" alt="Screenshot 2026-09-09 205954" src="https://github.com/user-attachments/assets/1aaca4c8-d8c4-4641-8162-cc6d84ff169f" />


## Containerized deployment

The frontend, backend, and MySQL database run as separate Docker containers. Docker Compose coordinates the services so they can run together as one application environment.

<img width="1907" height="867" alt="Screenshot 2026-09-09 205654" src="https://github.com/user-attachments/assets/459aa9fa-92a6-45bf-b505-44aa5ccc192f" />


This approach makes the project easier to run consistently across environments and provides hands-on practice with containerized application delivery.

## CI/CD with Jenkins

Jenkins is used to automate the build and delivery workflow for CollegeKhoj. The pipeline helps make deployments repeatable instead of relying on manual steps.

<img width="1916" height="827" alt="Screenshot 2026-09-06 173940" src="https://github.com/user-attachments/assets/d14c65de-0a8d-4d03-b6be-74c976438dff" />


## AWS infrastructure

The project is deployed using AWS infrastructure. The environment includes an EC2 instance for running the application and a VPC for the networking layer.

<img width="1897" height="816" alt="Screenshot 2026-09-09 205842" src="https://github.com/user-attachments/assets/2d8fe75c-fc5e-4d9b-af39-03dc6eed0dea" />

<img width="1910" height="856" alt="Screenshot 2026-09-06 162822" src="https://github.com/user-attachments/assets/a662041f-41d8-4b55-872f-a6feaf5a9ac7" />

## Technologies used

- React and Vite
- Node.js
- MySQL
- Docker and Docker Compose
- Jenkins
- AWS EC2
- AWS VPC
- Git and GitHub

---

<p align="center">Built as a practical full-stack and DevOps learning project.</p>
