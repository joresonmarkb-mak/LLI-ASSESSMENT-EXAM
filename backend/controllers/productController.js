const { sql, poolPromise } = require('../config/db');

// CREATE
exports.createProduct = async (req, res) => {
  try {
    const { productName, category, batchNumber, quantityInStock, unit, expiryDate, unitPrice } = req.body;

    if (!productName || quantityInStock === undefined) {
      return res.status(400).json({ message: 'Product name and quantity are required' });
    }

    const pool = await poolPromise;
    await pool.request()
      .input('productName', sql.NVarChar, productName)
      .input('category', sql.NVarChar, category || null)
      .input('batchNumber', sql.NVarChar, batchNumber || null)
      .input('quantityInStock', sql.Int, quantityInStock)
      .input('unit', sql.NVarChar, unit || 'pcs')
      .input('expiryDate', sql.Date, expiryDate || null)
      .input('unitPrice', sql.Decimal(10, 2), unitPrice || 0)
      .query(`
        INSERT INTO Products (ProductName, Category, BatchNumber, QuantityInStock, Unit, ExpiryDate, UnitPrice)
        VALUES (@productName, @category, @batchNumber, @quantityInStock, @unit, @expiryDate, @unitPrice)
      `);

    res.status(201).json({ message: 'Product created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};