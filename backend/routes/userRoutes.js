const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { createUser, getUsers, deleteUser } = require('../controllers/userController');

router.use(requireAuth, requireAdmin); // all user management routes are admin-only

router.post('/', createUser);
router.get('/', getUsers);
router.delete('/:id', deleteUser);

module.exports = router;