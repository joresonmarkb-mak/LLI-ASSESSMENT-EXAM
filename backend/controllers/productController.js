const { sql, poolPromise } = require('../config/db');

// CREATE PRODUCT
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
// READ PRODUCT
exports.getProducts = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query('SELECT * FROM Products ORDER BY ProductID DESC');

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Products WHERE ProductID = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};