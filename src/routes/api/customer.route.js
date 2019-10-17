import { Router } from 'express';
import CustomerController from '../../controllers/customer.controller';

const { check } = require('express-validator/check');

const passport = require('passport');

const router = Router();

router.post(
  '/customers',
  check('email').isEmail(),

  CustomerController.create
);

router.post(
  '/customers/login',
  [
    // Check validity
    check('email', 'Invalid email').isEmail(),
    check('password')
      .not()
      .isEmpty(),
  ],
  CustomerController.login
);

router.post(
  '/customers/facebook',
  passport.authenticate('facebook-token'),
  CustomerController.loginfacebook
);

router.get('/customer', passport.authenticate('jwt'), CustomerController.getCustomerProfile);

router.put(
  '/customer',

  [
    // Check validity
    check('email', 'Invalid email').isEmail(),
    check('name')
      .not()
      .isEmpty(),
  ],

  CustomerController.updateCustomerProfile
);

router.put(
  '/customer/address',
  [
    // Check validity

    check('address_1')
      .not()
      .isEmpty(),
    check('address_2')
      .not()
      .isEmpty(),
    check('city')
      .not()
      .isEmpty(),
    check('region')
      .not()
      .isEmpty(),
    check('postal_code')
      .not()
      .isEmpty(),
    check('country')
      .not()
      .isEmpty(),
    check('shipping_region_id').isNumeric(),
  ],

  CustomerController.updateCustomerAddress
);

router.put(
  '/customer/creditCard',
  [
    // Check validity
    check('credit_card').isCreditCard(),
  ],

  CustomerController.updateCreditCard
);

export default router;
