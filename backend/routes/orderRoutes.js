const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { 
  createOrder, 
  getOrders, 
  updateOrderStatus, 
  cancelOrder 
} = require('../controllers/orderController');

router.use(requireAuth); // all order routes require login

router.post('/', createOrder);
router.get('/', getOrders);
router.put('/:id/status', updateOrderStatus);
router.put('/:id/cancel', cancelOrder);

module.exports = router;