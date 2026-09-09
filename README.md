# Team Task Management System

A full-stack, role-based task management application for organizations to manage teams, assign tasks, track progress, collaborate through comments, and receive task-related notifications.

---

## 🚀 Features

### 🔐 Authentication & Authorization

- User registration and login
- JWT-based authentication
- Secure password hashing using BCrypt
- Role-based access control
- Three user roles:
  - Admin
  - Manager
  - User
- Active/inactive user status
- JWT expiration and lifetime validation
- Protected API endpoints
- Protected frontend routes

### 📋 Task Management

- Create tasks
- Assign tasks to users
- Task statuses:
  - To Do
  - In Progress
  - Done
- Task priorities
- Due dates
- Task filtering
- Task details
- Edit tasks
- Role-based task authorization

### 👥 Team Management

- Create teams
- View team details
- Add members to teams
- Manager/Admin team management
- Team-based task assignment

### 💬 Collaboration

- Add comments to tasks
- Edit permitted comments
- Delete permitted comments
- Backend authorization prevents users from modifying other users' comments

### 🔔 Notifications

- In-app notifications
- Task assignment notifications
- Task status update notifications
- Unread notification count
- Mark individual notifications as read
- Mark all notifications as read

### 📊 Dashboard

- Task statistics
- Task status overview
- User-oriented task information
- Filtering by:
  - Status
  - Priority
  - Deadline

### 📱 Responsive UI

- Responsive React interface
- Desktop sidebar navigation
- Mobile bottom navigation
- Mobile "More" menu
- Admin-only Users management
- Settings page
- Consistent light theme

---

## 🛠️ Tech Stack

### Backend

- ASP.NET Core Web API
- .NET 10
- Entity Framework Core
- PostgreSQL
- Npgsql Entity Framework Core Provider
- JWT Bearer Authentication
- BCrypt.Net
- Swagger / OpenAPI

### Frontend

- React 19
- Vite
- React Router
- Axios
- Lucide React

### DevOps & Deployment

- Docker
- Docker Compose
- Multi-stage Docker builds
- Neon PostgreSQL
- Render
- Vercel
- Nginx

---

## 🏗️ Project Architecture

```text
Team Task Management/
│
├── Backend/
│   ├── TeamTaskManagement.slnx
│   │
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
│
├── Frontend/
│   ├── src/
│   │   ├── Api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── routes/
│   │   └── Utils/
│   │
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
│
├── .env.example
├── .gitignore
├── docker-compose.yml
└── README.md
## 👤 Role Permissions

| Capability | Admin | Manager | User |

|---|:---:|:---:|:---:|

| Login / Register | ✅ | ✅ | ✅ |

| View Dashboard | ✅ | ✅ | ✅ |

| View Tasks | ✅ | ✅ | ✅ |

| Create Tasks | ✅ | ✅ | Limited |

| Assign Tasks | ✅ | ✅ | Limited |

| Update Permitted Task Status | ✅ | ✅ | ✅ |

| Create Teams | ✅ | ✅ | ❌ |

| Manage Team Members | ✅ | ✅ | ❌ |

| Comments | ✅ | ✅ | ✅ |

| Notifications | ✅ | ✅ | ✅ |

| Manage Users | ✅ | ❌ | ❌ |

| Change User Roles | ✅ | ❌ | ❌ |

| Activate / Deactivate Users | ✅ | ❌ | ❌ |

> Backend authorization is authoritative. Frontend role restrictions are primarily used for navigation and user experience.

🔌 API

The backend exposes REST API endpoints under:

/api
Main API Areas
/api/Auth
/api/Users
/api/Teams
/api/Tasks
/api/Comments
/api/Notifications
/api/Dashboard
Swagger

When running the API in Development mode:

http://localhost:5138/swagger

Swagger is enabled for Development environments.

🌐 Live Deployment

The application is deployed using a separate frontend, backend, and database architecture.

Frontend

Vercel

https://team-task-management-frontend.vercel.app
Backend

Render

https://team-task-management-api.onrender.com

API base URL:

https://team-task-management-api.onrender.com/api
Database

Neon PostgreSQL

The production backend uses PostgreSQL hosted on Neon.

The database connection string is provided to the backend through environment variables and is never committed to source control.

Production Architecture
                         ┌─────────────────────┐
                         │       Vercel        │
                         │   React + Vite      │
                         └──────────┬──────────┘
                                    │
                                    │ HTTPS
                                    ▼
                         ┌─────────────────────┐
                         │       Render        │
                         │ ASP.NET Core Web API│
                         └──────────┬──────────┘
                                    │
                                    │ PostgreSQL
                                    ▼
                         ┌─────────────────────┐
                         │   Neon PostgreSQL   │
                         │     Production DB   │
                         └─────────────────────┘
🐳 Running with Docker Compose

Docker Compose can be used to run the complete application locally.

Prerequisites

Install:

Docker Desktop
Git
.NET SDK 10
Node.js
1. Clone the Repository
git clone https://github.com/mukulparmar0110/team-task-management.git

cd team-task-management
2. Create Environment File
cp .env.example .env

Update .env with your own secure local development values:

MSSQL_SA_PASSWORD=your-secure-sql-server-password
JWT_SECRET_KEY=your-secure-jwt-secret

.env must never be committed to Git.

3. Start the Application
docker compose up --build
4. Open the Application
Frontend
http://localhost:5173
Backend
http://localhost:5138
Swagger
http://localhost:5138/swagger
5. Stop the Application

Press:

Ctrl+C

Or run:

docker compose down

Do not use docker compose down -v unless you intentionally want to delete the persistent local SQL Server volume.

💻 Running the Backend Locally

From the project root:

cd Backend/TeamTaskManagement.API

Restore dependencies:

dotnet restore

Build:

dotnet build

Run:

dotnet run

The local API runs on:

http://localhost:5138
Local Secrets

The backend uses .NET User Secrets for local development.

Set the database connection string:

dotnet user-secrets set "ConnectionStrings:DefaultConnection" "YOUR_CONNECTION_STRING"

Set the JWT secret:

dotnet user-secrets set "Jwt:SecretKey" "YOUR_JWT_SECRET"

Secrets should never be committed to source control.

🎨 Running the Frontend Locally

From the project root:

cd Frontend

Install dependencies:

npm install

Start the development server:

npm run dev

The frontend uses:

VITE_API_URL

Example:

VITE_API_URL=http://localhost:5138/api
🗄️ Database

The project supports different database environments.

Production

Production uses:

PostgreSQL
Neon
Entity Framework Core
EF Core Migrations

The production database connection is supplied through the backend environment configuration.

Local Docker Development

Docker Compose uses:

SQL Server
SQL Server Docker Container
EF Core
Persistent Docker Volume

This allows the project to be developed and tested locally using SQL Server while the deployed application uses PostgreSQL.

Database migrations are applied by the backend during application startup when required.

🔑 Sample Assessment Accounts

The application includes seeded accounts for development and assessment purposes.

Role	Email	Password
Admin	admin@teamtask.com	Admin@12345
Manager	manager@teamtask.com	Manager@12345
User	user@teamtask.com	User@12345

These credentials are intended for local development and assessment demonstrations only.

Production deployments should use a secure administrator bootstrap process and should not rely on publicly documented fixed credentials.

🔒 Security

The project includes:

BCrypt password hashing
JWT authentication
JWT issuer validation
JWT audience validation
JWT lifetime validation
Role-based authorization
Backend authorization checks
Active-user validation during login
Protected frontend routes
Admin-only user management
Environment-based secret configuration
.env protection through .gitignore
EF Core relational constraints
Database indexes
Environment-specific database configuration
HTTPS for deployed frontend and backend communication
🔐 Git & Secrets

The repository intentionally tracks:

.env.example

The actual environment file is ignored:

.env

Verify that .env is ignored:

git check-ignore -v .env

Before committing changes:

git status

Review staged changes:

git diff --cached

Typical Git workflow:

git add .
git commit -m "Describe your change"
git push
🧪 Build Verification
Backend
cd Backend/TeamTaskManagement.API

dotnet restore
dotnet build
Frontend
cd Frontend

npm install
npm run build
Docker

From the project root:

docker compose build
📈 Project Status

The current implementation covers the core assessment requirements:

✅ Authentication
✅ Registration and Login
✅ JWT Authentication
✅ Role-Based Authorization
✅ Admin Role
✅ Manager Role
✅ User Role
✅ User Management
✅ Team Management
✅ Team Members
✅ Task Creation
✅ Task Assignment
✅ Task Status Tracking
✅ Task Priorities
✅ Task Deadlines
✅ Task Filtering
✅ Comments
✅ Notifications
✅ Dashboard
✅ Responsive React Frontend
✅ REST API
✅ PostgreSQL Production Database
✅ SQL Server Local Docker Database
✅ Entity Framework Core
✅ Swagger / OpenAPI
✅ Docker
✅ Docker Compose
✅ Persistent Local Database Volume
✅ GitHub Repository
✅ Environment Secret Protection
✅ Vercel Deployment
✅ Render Deployment
✅ Neon PostgreSQL Deployment
✅ Project Documentation

🌐 Repository

GitHub:

https://github.com/mukulparmar0110/team-task-management

📄 License

This project is provided for development, assessment, and portfolio purposes.