const express = require('express');
const router = express.Router();
const { createProduct,getProducts,deleteProduct } = require('../controllers/productController');


router.post('/create', createProduct);
router.get('/', getProducts);
router.delete('/:id', deleteProduct);

module.exports = router;