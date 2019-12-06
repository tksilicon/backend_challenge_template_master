import { Router } from 'express';
import CustomerController from '../../controllers/customer.controller';

const { check } = require('express-validator/check');

const passport = require('passport');

const router = Router();

/**
 * This function comment is parsed by doctrine
 * @route POST //customers
 * @group Customer - Operations about customer
 * @param {string} email.query.required - email - eg: user@domain.com
 * @param {string} password.query.required - password - eg: shhstehjep
 * @param {string} name.query.required - email - eg: thankgod ukachukwu
 * @returns {object} 200 - Return a Object of Customer with auth credencials
 * @returns {Error}  400 - Return a error object { "code": "USR_02", "message": "The field example is empty.","field": "example","status": "500"}
 */
router.post(
  '/customers',
  check('email').isEmail(),

  CustomerController.create
);

router.post(
  '/customers/login',
  passport.authenticate('login'),
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
