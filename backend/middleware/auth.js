// Reads user identity from headers (set by the frontend after login)
exports.requireAuth = (req, res, next) => {
  const username = req.headers['x-username'];
  const role = req.headers['x-role'];

  if (!username || !role) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  req.user = { username, role };
  next();
};

// Restricts a route to admin only
exports.requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admins only' });
  }
  next();
};