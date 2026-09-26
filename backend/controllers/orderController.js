const { sql, poolPromise } = require('../config/db');

// CREATE ORDER (deducts stock)
exports.createOrder = async (req, res) => {
  try {
    const { productId, quantity, clientName } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Product and valid quantity are required' });
    }

    if (!clientName) {
      return res.status(400).json({ message: 'Client name is required' });
    }

    const pool = await poolPromise;

    const productResult = await pool.request()
      .input('productId', sql.Int, productId)
      .query('SELECT QuantityInStock FROM Products WHERE ProductID = @productId');

    const product = productResult.recordset[0];

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.QuantityInStock < quantity) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }

    await pool.request()
      .input('productId', sql.Int, productId)
      .input('quantity', sql.Int, quantity)
      .query('UPDATE Products SET QuantityInStock = QuantityInStock - @quantity WHERE ProductID = @productId');

    await pool.request()
      .input('productId', sql.Int, productId)
      .input('quantity', sql.Int, quantity)
      .input('clientName', sql.NVarChar, clientName)
      .input('createdBy', sql.NVarChar, req.user.username)
      .query(`
        INSERT INTO Orders (ProductID, Quantity, ClientName, Status, CreatedBy)
        VALUES (@productId, @quantity, @clientName, 'Pending', @createdBy)
      `);

    res.status(201).json({ message: 'Order created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// LIST ORDERS
exports.getOrders = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT o.OrderID, o.Quantity, o.ClientName, o.Status, o.CreatedBy, o.CreatedAt, o.UpdatedAt,
             p.ProductID, p.ProductName, p.Unit
      FROM Orders o
      JOIN Products p ON o.ProductID = p.ProductID
      ORDER BY o.OrderID DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE STATUS (Packing, Shipped, Delivered)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Packing', 'Shipped', 'Delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('status', sql.NVarChar, status)
      .query(`
        UPDATE Orders 
        SET Status = @status, UpdatedAt = GETDATE() 
        WHERE OrderID = @id AND Status != 'Cancelled'
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Order not found or already cancelled' });
    }

    res.json({ message: 'Order status updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// CANCEL ORDER (restores stock)
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    const orderResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Orders WHERE OrderID = @id');

    const order = orderResult.recordset[0];

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.Status === 'Cancelled') {
      return res.status(400).json({ message: 'Order is already cancelled' });
    }

    // restore stock
    await pool.request()
      .input('productId', sql.Int, order.ProductID)
      .input('quantity', sql.Int, order.Quantity)
      .query('UPDATE Products SET QuantityInStock = QuantityInStock + @quantity WHERE ProductID = @productId');

    // mark as cancelled
    await pool.request()
      .input('id', sql.Int, id)
      .query(`UPDATE Orders SET Status = 'Cancelled', UpdatedAt = GETDATE() WHERE OrderID = @id`);

    res.json({ message: 'Order cancelled and stock restored' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};