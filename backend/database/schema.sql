CREATE DATABASE PharmaStockDB;
GO

USE PharmaStockDB;
GO

CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    FirstName NVARCHAR(50) NOT NULL,
    LastName NVARCHAR(50) NOT NULL,
    Role NVARCHAR(20) DEFAULT 'staff',
    CreatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE Products (
    ProductID INT IDENTITY(1,1) PRIMARY KEY,
    ProductName NVARCHAR(150) NOT NULL,
    Category NVARCHAR(100),
    BatchNumber NVARCHAR(50),
    QuantityInStock INT NOT NULL DEFAULT 0,
    Unit NVARCHAR(20) DEFAULT 'pcs',
    ExpiryDate DATE,
    UnitPrice DECIMAL(10,2) DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE Orders (
    OrderID INT IDENTITY(1,1) PRIMARY KEY,
    ProductID INT NOT NULL FOREIGN KEY REFERENCES Products(ProductID),
    Quantity INT NOT NULL,
    ClientName NVARCHAR(150) NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Pending',
    CreatedBy NVARCHAR(50),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

INSERT INTO Users (Username, PasswordHash, FirstName, LastName, Role)
VALUES ('admin', 'admin123', 'Admin', 'User', 'admin');

INSERT INTO Products (ProductName, Category, BatchNumber, QuantityInStock, Unit, ExpiryDate, UnitPrice)
VALUES 
('Paracetamol 500mg', 'Analgesic', 'B2026-001', 500, 'box', '2027-06-30', 45.00),
('Amoxicillin 250mg', 'Antibiotic', 'B2026-002', 200, 'box', '2026-12-15', 85.50);