import { Router } from 'express';
import ShoppingCartController from '../../controllers/shoppingCart.controller';

const { check } = require('express-validator/check');

const passport = require('passport');

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
router.put(
  '/shoppingcart/update/:item_id',
  check('quantity')
    .not()
    .isEmpty(),
  ShoppingCartController.updateCartItem
);
router.delete(
  '/shoppingcart/empty/:cart_id',
  check('cart_id')
    .not()
    .isEmpty(),
  ShoppingCartController.emptyCart
);
router.delete('/shoppingcart/removeProduct/:item_id', ShoppingCartController.removeItemFromCart);
router.post('/orders', ShoppingCartController.createOrder);
router.get(
  '/orders/inCustomer',
  passport.authenticate('jwt'),
  ShoppingCartController.getCustomerOrders
);
router.get(
  '/orders/:order_id',
  passport.authenticate('jwt'),
  ShoppingCartController.getOrderSummary
);
router.post(
  '/stripe/charge',
  passport.authenticate('jwt'),
  ShoppingCartController.processStripePayment
);

export default router;
