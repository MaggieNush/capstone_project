JuiceCo Sales & Client Manager (JCSCM)
Table of Contents
Project Title

Description

Key Features (MVP)

User Roles & Functionality

Technology Stack

High-Level Architecture

Database Schema (ERD)

API Endpoints Overview

Setup Instructions

Prerequisites

Backend Setup

Frontend Setup

Running the Application

Demo Credentials

Future Enhancements

1. Project Title
JuiceCo Sales & Client Manager (JCSCM)

2. Description
The JuiceCo Sales & Client Manager (JCSCM) is a web-based application designed to streamline the sales reporting and client management process for JuiceCo's sales team. It addresses challenges such as time-consuming manual paperwork, error-prone data entry, lack of centralized client management, and inefficient report generation.

JCSCM provides a centralized, user-friendly platform that allows salespersons to efficiently record daily sales, manage their clients, track payments, and generate various reports. An administrative role oversees client verification, salesperson management, flavor management, and overall system reporting.

3. Key Features (MVP)
The Minimum Viable Product (MVP) focuses on core functionalities:

A. User Management & Authentication
Salesperson Registration: Admin-only ability to register new salespersons.

Login/Logout: Secure authentication for both salespersons and administrators.

Role-Based Access Control: Salespersons can only access and manage their assigned clients and sales data; Admins have full access.

B. Client Management
Salesperson-Specific Client List: Each salesperson has a dedicated list of clients assigned to them.

Client Details: Ability to view and update client information (name, type: wholesale/retail, outstanding balance, etc.).

New Client Request & Verification: Salespersons can request to add new clients, which must be approved by an administrator before being assigned.

Client Order History: View a history of orders placed by a specific client, including payment status.

C. Sales Reporting & Order Management
Daily Sales Entry: Salespersons can record daily sales, including client selection, juice flavors, quantities, price per liter (auto-populated/override), total amount, and payment status.

Payment Tracking: Update payment status for outstanding balances and record new payments.

Automated Total Calculations: Real-time calculation of total sales per order.

D. Report Generation & Download
Dynamic Report Generation: Salespersons can generate daily, weekly, and monthly sales reports based on their recorded data.

Overall Reports (Admin): Administrators can generate comprehensive daily, weekly, monthly, and yearly sales reports across all salespersons.

CSV Download: Ability to download all generated reports as CSV files.

E. Master Data Management (Admin)
Manage Flavors: Administrators can add, edit, and deactivate juice flavors and their base prices.

4. User Roles & Functionality
Salesperson
Manages their assigned clients.

Records daily sales and order details.

Tracks client payments and outstanding balances.

Generates and downloads personal sales reports (daily, weekly, monthly).

Requests new client additions (pending admin approval).

Administrator
Registers new salespersons.

Verifies and approves new client requests, assigning them to specific salespersons.

Manages overall system data (juice flavors, default prices).

Can view all sales data and generate comprehensive reports across all salespersons.

5. Technology Stack
Frontend: React.js

State Management: Zustand (for global state) and React's useState (for component-level state).

Routing: react-router-dom for navigation.

Styling: Tailwind CSS (for rapid and responsive UI development).

Date Formatting: date-fns

Backend: Django

API Framework: Django REST Framework (DRF) for building robust RESTful APIs.

Database: PostgreSQL (recommended for production deployment; SQLite for local development).

Authentication: Django's built-in User model and TokenAuthentication.

Permissions: Django's permission system and DRF's custom permission classes for role-based access control.

CORS: django-cors-headers

6. High-Level Architecture
The application follows a client-server architecture. The React frontend serves as the user interface, making asynchronous API calls to the Django backend. The Django backend handles all business logic, data storage (PostgreSQL/SQLite), authentication, authorization, and serves data to the frontend via RESTful API endpoints.

+----------------+       HTTP/REST API       +----------------+       Database Queries       +--------------+
|                | <-----------------------> |                | <------------------------> |              |
| React Frontend |                           | Django Backend |                            | PostgreSQL   |
| (Web Browser)  |                           | (Django REST   |                            | (Data Storage)|
|                |                           | Framework)     |                            |              |
+----------------+                           +----------------+                            +--------------+

7. Database Schema (ERD)
The database schema includes the following entities and their relationships:

+-----------------+       1:1        +-----------------+
|      User       |------------------|   UserProfile   |
|-----------------|                  |-----------------|
| id (PK)         |                  | id (PK)         |
| username        |                  | user_id (FK)    |
| email           |                  | role            |
| password        |                  | created_at      |
| ...             |                  | updated_at      |
+-----------------+                  +-----------------+
                                            | 1
                                            |
                                            | M (assigned_salesperson)
                                            v
+-----------------+                 +-----------------+
|     Client      |                 |      Order      |
|-----------------|                 |-----------------|
| id (PK)         |                 | id (PK)         |
| name            |                 | client_id (FK)  |
| client_type     |                 | salesperson_id (FK) |
| is_new_client   |                 | order_date      |
| assigned_salesperson_id (FK) |    | total_amount    |
| status          |                 | payment_status  |
| created_at      |                 | created_at      |
| updated_at      |                 | updated_at      |
+-----------------+                 +-----------------+
        | 1                                 | 1
        |                                   |
        | M                                 | M
        v                                   v
+-----------------+                 +-----------------+
|     Payment     |                 |    OrderItem    |
|-----------------|                 |-----------------|
| id (PK)         |                 | id (PK)         |
| client_id (FK)  |                 | order_id (FK)   |
| order_id (FK, Nullable) |         | flavor_id (FK)  |
| amount_paid     |                 | quantity_liters |
| payment_date    |                 | price_per_liter_at_sale |
| recorded_by_salesperson_id (FK) | | item_total      |
| created_at      |                 | created_at      |
| updated_at      |                 | updated_at      |
+-----------------+                 +-----------------+
                                            | 1
                                            |
                                            | M
                                            v
                                     +-----------------+
                                     |      Flavor     |
                                     |-----------------|
                                     | id (PK)         |
                                     | name            |
                                     | base_price_per_liter |
                                     | is_active       |
                                     | created_at      |
                                     | updated_at      |
                                     +-----------------+

8. API Endpoints Overview
All API endpoints are prefixed with /api/v1/.

Authentication & User Management
POST /api/v1/auth/register/: Admin-only to register new salespersons.

POST /api/v1/auth/login/: Authenticate user, return token, user ID, username, and role.

POST /api/v1/auth/logout/: Invalidate the current user's authentication token.

GET /api/v1/auth/me/: Get details of the currently authenticated user.

GET /api/v1/users/?role=salesperson: Admin-only to list salespersons.

Client Management
GET /api/v1/clients/: List clients (filtered by salesperson for salespersons, all for admin).

POST /api/v1/clients/: Create a new client (pending approval for salespersons, approved for admin).

GET /api/v1/clients/<id>/: Retrieve specific client details.

PUT/PATCH /api/v1/clients/<id>/: Update client details.

POST /api/v1/clients/<id>/approve/: Admin-only action to approve a pending client.

POST /api/v1/clients/<id>/reject/: Admin-only action to reject a pending client.

Sales & Order Management
GET /api/v1/orders/: List orders (filtered by salesperson for salespersons, all for admin).

POST /api/v1/orders/: Create a new sales order.

GET /api/v1/orders/<id>/: Retrieve specific order details.

PATCH /api/v1/orders/<id>/: Update an existing order (e.g., change payment status).

Payment Management
POST /api/v1/payments/: Record a new payment.

GET /api/v1/payments/: List payments (filtered by recorded salesperson for salespersons, all for admin).

System Data (Admin Only)
GET /api/v1/flavors/: List all juice flavors.

POST /api/v1/flavors/: Add a new juice flavor.

GET /api/v1/flavors/<id>/: Retrieve specific flavor details.

PUT/PATCH /api/v1/flavors/<id>/: Update a specific flavor's details.

Reporting Endpoints (CSV Download)
GET /api/v1/reports/sales/daily/?date=<YYYY-MM-DD>&salesperson_id=<id>

GET /api/v1/reports/sales/weekly/?start_date=<YYYY-MM-DD>&end_date=<YYYY-MM-DD>&salesperson_id=<id>

GET /api/v1/reports/sales/monthly/?year=<YYYY>&month=<MM>&salesperson_id=<id>

GET /api/v1/reports/sales/yearly/?year=<YYYY> (Admin Only)

9. Setup Instructions
To get the JCSCM application running on your local machine, follow these steps.

Prerequisites
Python 3.8+

Node.js (LTS recommended) & npm

Git

Backend Setup (Django)
Clone the repository:

git clone <your-repository-url>
cd sales_recorder_backend # Navigate into your backend directory

Create and activate a virtual environment:

python3 -m venv venv
source venv/bin/activate # On Windows: .\venv\Scripts\activate

Install Python dependencies:

pip install django djangorestframework django-cors-headers djangorestframework-knox

(Note: djangorestframework-knox is assumed based on usage patterns in user management, even if not explicitly in django-backend-setup's pip install list)

Configure settings.py:
Open sales_recorder_backend/sales_recorder_project/settings.py and ensure the following:

Add your apps (users, clients, sales, core) and third-party libraries (rest_framework, corsheaders, knox) to INSTALLED_APPS.

Set CORS_ALLOWED_ORIGINS = ["http://localhost:5173"] (or your frontend's URL).

Add 'corsheaders.middleware.CorsMiddleware' to MIDDLEWARE.

Ensure AUTH_USER_MODEL = 'users.User' is set.

Set REST_FRAMEWORK defaults, including 'rest_framework.authentication.TokenAuthentication' or 'knox.auth.TokenAuthentication'.

Apply database migrations:

python manage.py makemigrations
python manage.py migrate

Create a superuser: (For Django Admin access)

python manage.py createsuperuser

Follow the prompts to set username, email, and password.

Generate Dummy Data (Optional but Recommended):
This will pre-populate your database with an admin, salespersons, clients, flavors, orders, and payments for testing.

python manage.py shell
# Inside the Django shell, execute:
# from dummy_data import *
# (Press Ctrl+D or type exit() and press Enter to exit the shell)

(Ensure you have a dummy_data.py script in your sales_recorder_backend directory, as generated previously.)

Frontend Setup (React)
Navigate to the frontend directory:

cd ../sales_recorder_frontend # Or wherever your React project is located

Install Node.js dependencies:

npm install

10. Running the Application
Start the Django backend server:
Open a terminal, navigate to sales_recorder_backend, activate your virtual environment, and run:

source venv/bin/activate
python manage.py runserver

The backend will typically run on http://localhost:8000.

Start the React frontend development server:
Open a separate terminal, navigate to sales_recorder_frontend, and run:

npm run dev

The frontend will typically run on http://localhost:5173.

11. Demo Credentials
If you've run the dummy_data.py script:

Administrator:

Username: admin

Password: adminpassword

Salesperson 1:

Username: john_doe

Password: sales1password

Salesperson 2:

Username: jane_smith

Password: sales2password

12. Future Enhancements
Potential improvements for future iterations include:

More robust error logging and user feedback.

Advanced data visualizations for reports.

Client onboarding workflow improvements.

Notifications for pending client requests.

User profile editing for salespersons.

Soft delete for entities instead of hard delete.
