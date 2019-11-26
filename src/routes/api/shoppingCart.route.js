import { Router } from 'express';
import ShoppingCartController from '../../controllers/shoppingCart.controller';

const { check } = require('express-validator/check');

const router = Router();
router.get('/shoppingcart/generateUniqueId', ShoppingCartController.generateUniqueCart);
router.post(
  '/shoppingcart/add',
  check('cart_id')
    .not()
    .isEmpty(),
  check('attributes')
    .not()
    .isEmpty(),
  check('product_id')
    .not()
    .isEmpty()
    .isNumeric(),

  ShoppingCartController.addItemToCart
);
router.get(
  '/shoppingcart/:cart_id',
  check('cart_id')
    .not()
    .isEmpty(),

  ShoppingCartController.getCart
);
router.put('/shoppingcart/update/:item_id'
,check('quantity')
    .not()
    .isEmpty(), 
    ShoppingCartController.updateCartItem);
router.delete('/shoppingcart/empty/:cart_id', ShoppingCartController.emptyCart);
router.delete('/shoppingcart/removeProduct/:item_id', ShoppingCartController.removeItemFromCart);
router.post('/orders', ShoppingCartController.createOrder);
router.get('/orders/inCustomer', ShoppingCartController.getCustomerOrders);
router.get('/orders/:order_id', ShoppingCartController.getOrderSummary);
router.post('/stripe/charge', ShoppingCartController.processStripePayment);

export default router;
