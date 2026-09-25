const express = require('express');
const router = express.Router();
const { createProduct,getProducts,deleteProduct, updateProduct } = require('../controllers/productController');


router.post('/create', createProduct);
router.get('/', getProducts);
router.delete('/:id', deleteProduct);
router.put('/:id', updateProduct);

module.exports = router;