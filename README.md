# CollegeKhoj

CollegeKhoj is a college-discovery platform that helps students explore colleges, browse courses, compare options, and make better education decisions. The project brings the main information students need into one simple experience, including colleges, courses, admissions, and search.

<p align="center">
  <img src="assets/collegekhoj-live-site.png" alt="CollegeKhoj home page" width="100%" />
</p>

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

<p align="center">
  <img src="assets/project-structure.png" alt="CollegeKhoj repository structure" width="100%" />
</p>

The repository contains:

- `frontend/` — the client-side application, pages, components, API layer, and styles
- `backend/` — server code, routes, controllers, services, middleware, and validation
- `database/` — SQL schema and demo seed data
- `docs/` — local development documentation
- `Docker-compose.yml` — configuration for running the services together
- `Jenkinsfile` — CI/CD pipeline configuration

<p align="center">
  <img src="assets/github-repository.png" alt="CollegeKhoj GitHub repository" width="100%" />
</p>

## Containerized deployment

The frontend, backend, and MySQL database run as separate Docker containers. Docker Compose coordinates the services so they can run together as one application environment.

<p align="center">
  <img src="assets/docker-containers.png" alt="Running CollegeKhoj frontend, backend, and MySQL Docker containers" width="100%" />
</p>

This approach makes the project easier to run consistently across environments and provides hands-on practice with containerized application delivery.

## CI/CD with Jenkins

Jenkins is used to automate the build and delivery workflow for CollegeKhoj. The pipeline helps make deployments repeatable instead of relying on manual steps.

<p align="center">
  <img src="assets/jenkins-pipeline.png" alt="Jenkins dashboard with the CollegeKhoj pipeline" width="100%" />
</p>

## AWS infrastructure

The project is deployed using AWS infrastructure. The environment includes an EC2 instance for running the application and a VPC for the networking layer.

<p align="center">
  <img src="assets/aws-ec2-instance.png" alt="AWS EC2 instance used for CollegeKhoj deployment" width="100%" />
</p>

<p align="center">
  <img src="assets/aws-vpc-resource-map.png" alt="AWS VPC resource map used for CollegeKhoj" width="100%" />
</p>

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
