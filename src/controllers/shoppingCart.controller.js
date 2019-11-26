/**
 * Check each method in the shopping cart controller and add code to implement
 * the functionality or fix any bug.
 * The static methods and their function include:
 *
 * - generateUniqueCart - To generate a unique cart id
 * - addItemToCart - To add new product to the cart
 * - getCart - method to get list of items in a cart
 * - updateCartItem - Update the quantity of a product in the shopping cart
 * - emptyCart - should be able to clear shopping cart
 * - removeItemFromCart - should delete a product from the shopping cart
 * - createOrder - Create an order
 * - getCustomerOrders - get all orders of a customer
 * - getOrderSummary - get the details of an order
 * - processStripePayment - process stripe payment
 *
 *  NB: Check the BACKEND CHALLENGE TEMPLATE DOCUMENTATION in the readme of this repository to see our recommended
 *  endpoints, request body/param, and response object for each of these method
 */

import { getUniqueId } from '../util/turingutil.ts';
import { ShoppingCart, Product } from '../database/models';

const { validationResult } = require('express-validator/check');

/**
 *
 *
 * @class shoppingCartController
 */
class ShoppingCartController {
  /**
   * generate random unique id for cart identifier
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with cart_id
   * @memberof shoppingCartController
   */
  static async generateUniqueCart(req, res, next) {
    // implement method to generate unique cart Id

    try {
      const randomString = getUniqueId(11);

      if (randomString) {
        return res.status(200).json({
          cart_id: randomString,
        });
      }

      return res.status(400).json({
        error: {
          code: `SHO_01`,
          message: `Error occurred`,  // eslint-disable-line
          field: `card_id`,
          status: 400,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * adds item to a cart with cart_id
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with cart
   * @memberof ShoppingCartController
   */
  static async addItemToCart(req, res, next) {
    // implement function to add item to cart
    // return res.status(200).json({ message: 'this works' });

    try {
      const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions

      if (!errors.isEmpty()) {
        return res.status(422).json({
          error: {
            code: `SHO_02`,
            message: `Check item parameters.`,  // eslint-disable-line
            field: `cart_id, product_id, attributes`,
            status: 400,
          },
        });
      }
      // eslint-disable-next-line camelcase
      const { cart_id } = req.query;
      // eslint-disable-next-line camelcase
      const { product_id } = req.query;
      const { attributes } = req.query;
      const quantity = 1;

      const cartItem = await ShoppingCart.create({
        cart_id,
        product_id,
        attributes,
        quantity,
      });

      const shoppingCart = [];

      await ShoppingCart.findAll({
        where: {
          cart_id: cartItem.cart_id,
        },
      }).then(async result => {
        // for...of loop that supports await
        // eslint-disable-next-line no-restricted-syntax
        for await (const cartItem2 of result) {
          // Make sure to wait on all your sequelize CRUD calls
          const prod = await Product.findByPk(cartItem2.product_id);

          // It will now wait for above Promise to be fulfilled and show the proper details

          const cartItem3 = {};
          const total = prod.price * cartItem2.quantity;
          cartItem3.cart_id = cartItem2.cart_id;
          cartItem3.product_id = cartItem2.product_id;
          cartItem3.attributes = cartItem2.attributes;
          cartItem3.quantity = cartItem2.quantity;
          cartItem3.price = prod.price;
          cartItem3.name = prod.name;
          cartItem3.image = prod.image2;
          cartItem3.item_id = cartItem2.item_id;
          cartItem3.subtotal = total;

          // Simple push will work in this loop, you don't need to return anything
          shoppingCart.push(cartItem3);
        }
      });

      if (shoppingCart) {
        return res.status(200).json({
          shoppingCart,
        });
      }

      return res.status(404).json({
        error: {
          code: `SHO_02`,
          message: `Error occurred`,  // eslint-disable-line
          field: `get shoppingcart`,
          status: 400,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * get shopping cart using the cart_id
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with cart
   * @memberof ShoppingCartController
   */
  static async getCart(req, res, next) {
    // implement method to get cart items
    // return res.status(200).json({ message: 'this works' });

    try {
      const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions

      if (!errors.isEmpty()) {
        return res.status(422).json({
          error: {
            code: `SHO_04`,
            message: `Check path parameter.`,  // eslint-disable-line
            field: `cart_id`,
            status: 400,
          },
        });
      }
      // eslint-disable-next-line camelcase
      const { cart_id } = req.params;

      const shoppingCart = await ShoppingCart.findAll({
        where: {
          cart_id,
        },
      });

      if (shoppingCart) {
        return res.status(200).json({
          shoppingCart,
        });
      }

      return res.status(404).json({
        error: {
          code: `SHO_02`,
          message: `Error occurred`,  // eslint-disable-line
          field: `get shoppingcart`,
          status: 400,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * update cart item quantity using the item_id in the request param
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with cart
   * @memberof ShoppingCartController
   */

  static async updateCartItem(req, res, next) {
    const { item_id } = req.params // eslint-disable-line
    const { quantity } = req.body;
    // https://stackoverflow.com/questions/38524938/sequelize-update-record-and-return-resultv
    // return res.status(200).json({ message: 'this works' });

    try {
      

      const cartItem2 = await ShoppingCart.findOne({
        where: {
          // eslint-disable-next-line object-shorthand
          item_id: item_id,
        },
      });

      if (!cartItem2) {
        return res.status(400).json({
          error: {
            code: `SHO_03`,
              message: `Error occurred`,  // eslint-disable-line
            field: `updatecateitem`,
            status: 400,
          },
        });
      } else {
        cartItem2.quantity = quantity;
        cartItem2.save();
      }

      const cartItem = await ShoppingCart.findOne({
        where: {
          // eslint-disable-next-line object-shorthand
          item_id: item_id,
        },
      });

      if (cartItem) {
        return res.status(200).json({
          cartItem,
        });
      } else {

        return res.status(400).json({

          error: {
            code: `SHO_03`,
            message: `Error occurred`,  // eslint-disable-line
            field: `updatecateitem`,
            status: 400,
          },
        });
      }
    } catch (error) {
      return next(error);
    }
  }

  /**
   * removes all items in a cart
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with cart
   * @memberof ShoppingCartController
   */
  static async emptyCart(req, res, next) {
    // implement method to empty cart
    return res.status(200).json({ message: 'this works' });
  }

  /**
   * remove single item from cart
   * cart id is obtained from current session
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with message
   * @memberof ShoppingCartController
   */
  static async removeItemFromCart(req, res, next) {
    try {
      // implement code to remove item from cart here
    } catch (error) {
      return next(error);
    }
  }

  /**
   * create an order from a cart
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with created order
   * @memberof ShoppingCartController
   */
  static async createOrder(req, res, next) {
    try {
      // implement code for creating order here
    } catch (error) {
      return next(error);
    }
  }

  /**
   *
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with customer's orders
   * @memberof ShoppingCartController
   */
  static async getCustomerOrders(req, res, next) {
    const { customer_id } = req;  // eslint-disable-line
    try {
      // implement code to get customer order
    } catch (error) {
      return next(error);
    }
  }

  /**
   *
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with order summary
   * @memberof ShoppingCartController
   */
  static async getOrderSummary(req, res, next) {
    const { order_id } = req.params;  // eslint-disable-line
    const { customer_id } = req;   // eslint-disable-line
    try {
      // write code to get order summary
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async processStripePayment(req, res, next) {
    const { email, stripeToken, order_id } = req.body; // eslint-disable-line
    const { customer_id } = req;  // eslint-disable-line
    try {
      // implement code to process payment and send order confirmation email here
    } catch (error) {
      return next(error);
    }
  }
}

export default ShoppingCartController;
