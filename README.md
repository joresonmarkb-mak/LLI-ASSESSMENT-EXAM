# Pharma Stock Management System

A simple stock management system for a pharmaceutical company, built with React (Ant Design), Express, and MSSQL. Supports login, full CRUD on products, order management with stock deduction/restoration, a stock report, and admin-only user management.

## Technical Stack

- **Frontend:** ReactJS, Ant Design
- **Backend:** ExpressJS (Node.js)
- **Database:** Microsoft SQL Server (MSSQL)
- **API:** RESTful API

## Features

- Login functionality (username/password)
- Role-based access (Admin, Staff)
- Products: Create, Read, Update, Delete
- Orders: Create (deducts stock), update status (Pending → Packing → Shipped → Delivered), cancel (restores stock)
- Users: Admin-only create, list, delete
- Simple stock report (total products, total stock value, low-stock items, near-expiry items) shown on the Dashboard

---

## Prerequisites

Before running this project, make sure you have installed:

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) (Express edition is fine)
- [SQL Server Management Studio (SSMS)](https://learn.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms)
- Git

---

## 1. Clone the Repository

```bash
git clone https://github.com/joresonmarkb-mak/LLI-ASSESSMENT-EXAM.git
cd <LLI-ASSESSMENT-EXAM>
```

## 2. Database Setup

1. Open **SSMS** and connect to your local SQL Server instance.
2. Open a new query window and run the script located at `backend/database/schema.sql`. This will:
   - Create the `PharmaStockDB` database
   - Create the `Users`, `Products`, and `Orders` tables
   - Insert a default admin account and sample product data

   Default login credentials created by the script:
   ```
   Username: admin
   Password: admin123
   ```

## 3. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` folder with the following (adjust as needed for your SQL Server setup):

```
DB_SERVER=localhost
DB_DATABASE=PharmaStockDB
DB_USER=
DB_PASSWORD=
DB_PORT=1433
PORT=5000
```

> This project connects to SQL Server using **Windows Authentication** via ODBC. If your SQL Server is configured for **SQL Server Authentication** instead, update `backend/config/db.js` accordingly and fill in `DB_USER` / `DB_PASSWORD` above.

Run the backend server:

```bash
npm run dev
```

You should see:
```
Server running on port 5000
Connected to MSSQL
```

## 4. Frontend Setup

Open a new terminal window:

```bash
cd frontend
npm install
npm run dev
```

The app will run at `http://localhost:5173` (or the port shown in your terminal).

---

## 5. Testing the Application

1. Open the frontend URL in your browser — you'll land on the **Login** page.
2. Log in with the default admin account:
   - Username: `admin`
   - Password: `admin123`
3. **Dashboard** — view the stock summary (total products, total stock value, low-stock items, near-expiry items).
4. **Products** — click "+ Add Product" to create a product, use "Edit" to update it, and "Delete" to remove it.
5. **Orders** — click "+ New Order," select a product and quantity, and submit. Confirm the product's stock decreases. Use "Mark as [status]" to move an order through Pending → Packing → Shipped → Delivered, or "Cancel" to cancel it and restore the stock.
6. **Users** (admin only) — click "+ Add User" to create a new user and assign a role (Admin or Staff). Log out and log back in as the new staff account to confirm staff users cannot see or access the Users page.

You can also test the REST API directly using Postman. Example:

```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

For endpoints under `/api/products`, `/api/orders`, and `/api/users`, include these headers (set automatically by the frontend after login, but required manually in Postman):
```
x-username: admin
x-role: admin
```

---

## Challenges Encountered

**Setting up the database with MSSQL**
This was my first time connecting a Node.js backend to SQL Server rather than MongoDB, which I had used in previous projects. Getting the connection working took some troubleshooting — I initially set up the connection using Windows Authentication through the `mssql/msnodesqlv8` driver, but ran into a `[Microsoft][ODBC Driver Manager] Data source name not found and no default driver specified` error. This happened because the connection config didn't specify which ODBC driver to use. I resolved it by checking which ODBC drivers were actually installed on my machine and explicitly specifying the driver name in the connection string (`Driver={ODBC Driver 17 for SQL Server}`). This taught me that, unlike MongoDB connection strings, MSSQL connections are more dependent on the local machine's installed drivers and authentication mode, which isn't something you can fully abstract away in code.

**Learning Ant Design**
Since this was my first time using Ant Design rather than building UI components from scratch or using a utility-first library, there was a learning curve in understanding its component-driven approach — particularly how `Form` works with `Form.useForm()` for controlled form state, how `Table` expects a `dataSource`/`columns` structure instead of manually mapping JSX, and how components like `Modal`, `DatePicker`, and `Select` handle their own internal state versus needing to be wired to a form instance. Once I understood the pattern (define columns/fields declaratively, let Ant Design handle rendering and validation), building out the Products, Orders, and Users pages became much faster and more consistent-looking than if I had styled everything manually.

---

## Project Structure

```
pharma-stock-system/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   └── userRoutes.js
│   ├── database/
│   │   └── schema.sql
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```
