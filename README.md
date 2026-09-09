Team Task Management System

A full-stack, role-based task management application for organizations
to manage teams, assign work, track progress, collaborate through
comments, and receive task-related notifications.

Features

Authentication & Authorization

User registration and login

JWT-based authentication

Secure password hashing with BCrypt

Role-based access control

Admin, Manager, and User roles

Active/inactive user status

JWT expiration and validation

Protected API endpoints and frontend routes

Task Management

Create and assign tasks

Statuses: To Do, In Progress, Done

Priority and due dates

Task filtering

Task details and editing

Role-based task access

Team Management

Create teams

View team details

Add members to teams

Manager/Admin team management

Team-based task assignment

Collaboration & Notifications

Add, edit, and delete permitted task comments

In-app notifications

Task assignment notifications

Task status update notifications

Unread notifications

Mark one or all notifications as read

Dashboard & UI

Task statistics and status overview

Filtering by status, priority, and deadline

Responsive React interface

Desktop sidebar and mobile navigation

Admin-only Users management

Settings page

Consistent light theme

Tech Stack

Backend - ASP.NET Core Web API - .NET 10 - Entity Framework Core -
SQL Server - JWT Bearer Authentication - BCrypt.Net - Swagger / OpenAPI

Frontend - React 19 - Vite - React Router - Axios - Lucide React -
Nginx

DevOps - Docker - Docker Compose - SQL Server container -
Multi-stage Docker builds

Architecture

Team Task Management/
├── Backend/
│   ├── TeamTaskManagement.slnx
│   └── TeamTaskManagement.API/
│       ├── Controllers/
│       ├── DTOs/
│       ├── Data/
│       ├── Helpers/
│       ├── Interfaces/
│       ├── Migrations/
│       ├── Models/
│       ├── Services/
│       ├── Program.cs
│       ├── appsettings.json
│       └── Dockerfile
├── Frontend/
│   ├── src/
│   │   ├── Api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── routes/
│   │   └── Utils/
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
├── .env.example
├── .gitignore
└── docker-compose.yml

Role Permissions

Capability                      Admin   Manager    User

Login/Register                   Yes      Yes       Yes
Dashboard                        Yes      Yes       Yes
View tasks                       Yes      Yes       Yes
Create/assign tasks              Yes      Yes     Limited
Update permitted task status     Yes      Yes       Yes
Create teams                     Yes      Yes       No
Manage team members              Yes      Yes       No
Comments                         Yes      Yes       Yes
Notifications                    Yes      Yes       Yes
Manage users                     Yes      No        No
Change user roles                Yes      No        No
Activate/deactivate users        Yes      No        No

Backend authorization is authoritative; frontend restrictions primarily
control navigation and user experience.

API

The backend exposes REST endpoints under:

/api

Core areas:

/api/Auth
/api/Users
/api/Teams
/api/Tasks
/api/Comments
/api/Notifications
/api/Dashboard

Swagger:

http://localhost:5138/swagger

Run with Docker Compose

Prerequisites

Install Docker Desktop and Git.

1. Clone

git clone https://github.com/mukulparmar0110/team-task-management.git
cd team-task-management

2. Configure environment

cp .env.example .env

Update .env:

MSSQL_SA_PASSWORD=your-secure-sql-server-password
JWT_SECRET_KEY=your-secure-jwt-secret

Never commit .env.

3. Start

docker compose up --build

4. Open

Frontend:

http://localhost:5173

Backend:

http://localhost:5138

Swagger:

http://localhost:5138/swagger

5. Stop

Press Ctrl+C, or run:

docker compose down

Do not use docker compose down -v unless you intentionally want to
delete the persistent SQL Server volume.

Run Backend Locally

cd Backend/TeamTaskManagement.API
dotnet restore
dotnet build
dotnet run

Local secrets should be configured with User Secrets:

dotnet user-secrets set "ConnectionStrings:DefaultConnection" "YOUR_CONNECTION_STRING"
dotnet user-secrets set "Jwt:SecretKey" "YOUR_JWT_SECRET"

Run Frontend Locally

cd Frontend
npm install
npm run dev

The frontend uses:

VITE_API_URL

Example:

VITE_API_URL=http://localhost:5138/api

Database

The application uses SQL Server with Entity Framework Core migrations.

Database initialization applies available migrations during startup.
Docker Compose persists SQL Server data using the sqlserver_data named
volume.

Sample Assessment Accounts

Role      Email                    Password

Admin     admin@teamtask.com     Admin@12345
Manager   manager@teamtask.com   Manager@12345
User      user@teamtask.com      User@12345

These accounts are intended for local development and assessment
demonstrations. For a real production deployment, replace fixed demo
credentials with a secure administrator bootstrap process.

Security

The project includes: - BCrypt password hashing - JWT authentication -
JWT issuer, audience, and lifetime validation - Role-based
authorization - Backend authorization checks - Active-status checks
during login - Protected frontend routes - Admin-only user management -
Environment-based secret configuration - .env Git protection - EF Core
relational constraints and indexes - Persistent SQL Server storage

Git & Secrets

The repository tracks .env.example but ignores .env.

Verify locally:

git check-ignore -v .env

Review changes before pushing:

git status
git diff --cached

Typical workflow:

git add .
git commit -m "Describe your change"
git push

Project Status

Core assessment requirements are implemented:

Authentication and registration

JWT authorization

Admin, Manager, and User roles

User management

Team management

Task creation and assignment

Task status tracking

Task filtering

Comments

In-app notifications

Dashboard

Responsive frontend

Swagger/OpenAPI

SQL Server + EF Core

Dockerized backend

Dockerized frontend

Docker Compose full-stack setup

Persistent database volume

Git/GitHub integration

Repository

https://github.com/mukulparmar0110/team-task-management

License

This project is provided for development, assessment, and portfolio
purposes.