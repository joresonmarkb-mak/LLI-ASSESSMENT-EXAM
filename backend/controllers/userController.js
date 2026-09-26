const { sql, poolPromise } = require('../config/db');

// CREATE USER (admin only)
exports.createUser = async (req, res) => {
  try {
    const { username, password, firstName, lastName, role } = req.body;

    if (!username || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!['admin', 'staff'].includes(role)) {
      return res.status(400).json({ message: 'Role must be admin or staff' });
    }

    const pool = await poolPromise;

    const existing = await pool.request()
      .input('username', sql.NVarChar, username)
      .query('SELECT UserID FROM Users WHERE Username = @username');

    if (existing.recordset.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    await pool.request()
      .input('username', sql.NVarChar, username)
      .input('password', sql.NVarChar, password)
      .input('firstName', sql.NVarChar, firstName)
      .input('lastName', sql.NVarChar, lastName)
      .input('role', sql.NVarChar, role)
      .query(`
        INSERT INTO Users (Username, PasswordHash, FirstName, LastName, Role)
        VALUES (@username, @password, @firstName, @lastName, @role)
      `);

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// LIST USERS (admin only)
exports.getUsers = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT UserID, Username, FirstName, LastName, Role, CreatedAt 
      FROM Users 
      ORDER BY UserID DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE USER (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.username === req.params.id) {
      // extra guard below covers this properly via username check on frontend too
    }

    const pool = await poolPromise;

    // prevent admin from deleting their own account by ID lookup
    const target = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT Username FROM Users WHERE UserID = @id');

    if (target.recordset[0]?.Username === req.user.username) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Users WHERE UserID = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};