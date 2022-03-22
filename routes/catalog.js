const express = require('express');
const multer = require('multer');
const upload = multer()
const router = express.Router();

const categoriesController = require('../controllers/categoryController');
const manufacturersController = require('../controllers/manufacturerController')
const templateController = require('../controllers/templateController');

//category
router.get('/', categoriesController.index);

router.get('/categories', categoriesController.category_list);

router.get('/categories/create', categoriesController.category_create_get);

router.post('/categories/create', categoriesController.category_create_post);

router.get('/categories/:title', categoriesController.category_detail);

router.get('/categories/:title/delete', categoriesController.category_delete_get);

router.post('/categories/:title/delete', categoriesController.category_delete_post);

router.get('/categories/:title/update', categoriesController.category_update_get);

router.post('/categories/:title/update', categoriesController.category_update_post);

//inventory

router.get('/categories/:title/create', templateController.inventory_create_get);

router.get('/categories/:title/:model_name', templateController.inventory_detail);

router.post('/categories/:title/create', upload.single('image'), templateController.inventory_create_post);

router.get('/categories/:title/:model_name/delete', templateController.inventory_delete_get);

router.post('/categories/:title/:model_name/delete', templateController.inventory_delete_post);

router.get('/categories/:title/:model_name/update', templateController.inventory_update_get);

router.post('/categories/:title/:model_name/update', upload.single('image'), templateController.inventory_update_post);

//manufacturer
router.get('/manufacturers', manufacturersController.manufacturer_list);

router.get('/manufacturers/create', manufacturersController.manufacturer_get);

router.post('/manufacturers/create', manufacturersController.manufacturer_post);

router.get('/manufacturers/:title', manufacturersController.manufacturer_detail);

router.get('/manufacturers/:title/delete', manufacturersController.manufacturer_detele_get);

router.post('/manufacturers/:title/delete', manufacturersController.manufacturer_detele_post);

router.get('/manufacturers/:title/update', manufacturersController.manufacturer_update_get);

//router.post('/manufacturers/:title/update', upload.single('image'), manufacturersController.manufacturer_update_post);

router.post('/manufacturers/:title/update', manufacturersController.manufacturer_update_post);


module.exports = router;