import { Router } from 'express';
import ProductController from '../../controllers/product.controller';

const { check } = require('express-validator/check');

// These are valid routes but they may contain a bug, please try to define and fix them

const router = Router();
router.get(
  '/products',

  ProductController.getAllProducts
);

router.get(
  '/products/search',
  [
    check('query_string')
      .not()
      .isEmpty(),
  ],
  [
    check('all_words')
      .not()
      .isEmpty(),
  ],
  ProductController.searchProduct
);

router.get(
  '/products/:product_id',
  [check('product_id').isNumeric()],
  ProductController.getProduct
);

router.get(
  '/products/inCategory/:category_id',
  [check('category_id').isNumeric()],
  ProductController.getProductsByCategory
);
router.get(
  '/products/inDepartment/:department_id',
  [check('department_id').isNumeric()],
  ProductController.getProductsByDepartment
);

router.get('/departments', ProductController.getAllDepartments);
router.get(
  '/departments/:department_id',
  [check('department_id').isNumeric()],

  ProductController.getDepartment
);
router.get('/categories', ProductController.getAllCategories);
router.get(
  '/categories/:category_id',
  [check('category_id').isNumeric()],
  ProductController.getSingleCategory
);
router.get(
  '/categories/inDepartment/:department_id',
  [check('department_id').isNumeric()],
  ProductController.getDepartmentCategories
);

export default router;
