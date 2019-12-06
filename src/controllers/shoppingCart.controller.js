/* eslint-disable camelcase */
/* eslint-disable consistent-return */
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
import { ShoppingCart, Product, Order, OrderDetail } from '../database/models';

const { validationResult } = require('express-validator/check');

const passport = require('passport');

const jwt = require('jsonwebtoken');
const secret = require('../config/jwtConfig');
const db = require('../database/models/index');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

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
          buy_now: 1,
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
      }
      cartItem2.quantity = quantity;
      cartItem2.save();

      const cartItem = await ShoppingCart.findOne({
        where: {
          // eslint-disable-next-line object-shorthand
          item_id: item_id,
        },
      });

      if (!cartItem) {
        return res.status(400).json({
          error: {
            code: `SHO_03`,
            message: `Error occurred`,  // eslint-disable-line
            field: `updatecateitem`,
            status: 400,
          },
        });
      }

      return res.status(200).json({
        cartItem,
      });
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
    // return res.status(200).json({ message: 'this works' };

    try {
      const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions

      if (!errors.isEmpty()) {
        return res.status(422).json({
          error: {
            code: `SHO_06`,
            message: `Check path parameter.`,  // eslint-disable-line
            field: `cart_id`,
            status: 400,
          },
        });
      }
      // eslint-disable-next-line camelcase
      const { cart_id } = req.params;

      const shoppingCart = await ShoppingCart.destroy({
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
          code: `SHO_06`,
          message: `Error occurred`,  // eslint-disable-line
          field: `delete  shoppingcart`,
          status: 400,
        },
      });
    } catch (error) {
      return next(error);
    }
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
    const { item_id } = req.params // eslint-disable-line

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
      }
      cartItem2.buy_now = 0;
      cartItem2.save();

      const cartItem = await ShoppingCart.findOne({
        where: {
          // eslint-disable-next-line object-shorthand
          item_id: item_id,
        },
      });
      if (!cartItem) {
        return res.status(400).json({
          error: {
            code: `SHO_03`,
            message: `Error occurred`,  // eslint-disable-line
            field: `updatecateitem`,
            status: 400,
          },
        });
      }

      return res.status(200).json({
        message: `success`,
      });
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
    // eslint-disable-next-line no-unused-vars
    passport.authenticate('jwt', async (err, user, _info) => {
      try {
        if (err || !user) {
          return res.status(401).json({
            error: {
              code: `USR_11`,
              message: `Error occurred`,  // eslint-disable-line
              field: `jwt login,  `,
              status: 401,
            },
          });
        }

        // eslint-disable-next-line consistent-return
        req.login(user, { session: false }, async error => {
          if (error) return next(error);
          let transaction;
          let order;
          try {
            transaction = await db.sequelize.transaction();
            // eslint-disable-next-line camelcase
            const { cart_id } = req.body;
            // eslint-disable-next-line camelcase
            const { shipping_id } = req.body;
            // eslint-disable-next-line camelcase
            const { tax_id } = req.body;

            // eslint-disable-next-line camelcase
            let total_amount = 0.0;

            await ShoppingCart.findAll(
              {
                where: {
                  // eslint-disable-next-line object-shorthand
                  cart_id,
                  buy_now: 1,
                },
              },
              { transaction }
            )
              .then(async result => {
                const promises = [];
                // for...of loop that supports await
                // eslint-disable-next-line no-restricted-syntax
                for await (const cartItem of result) {
                  const prodId = cartItem.product_id;
                  // Make sure to wait on all your sequelize CRUD calls
                  const prod = await Product.findByPk(prodId, { transaction });

                  const total = prod.price * cartItem.quantity;

                  promises.push(prod);

                  // eslint-disable-next-line camelcase
                  total_amount += total;
                }
                Promise.all(promises);
              })
              .catch(errr => {
                return res.status(400).json({
                  error: {
                    code: `USR_12`,
                    message: `Error occurred`,  // eslint-disable-line
                    field: `processing order inserting into orderdetail , ${errr.message}`,
                    status: 400,
                  },
                });
              });

            // eslint-disable-next-line camelcase
            const created_on = new Date();

            // eslint-disable-next-line camelcase
            const { customer_id } = user;
            order = await Order.create(
              {
                total_amount,
                created_on,
                customer_id,
                shipping_id,
                tax_id,
              },
              { transaction }
            );

            const cartItems = await ShoppingCart.findAll(
              {
                where: {
                  cart_id,
                  buy_now: 1,
                },
              },
              { transaction }
            );
            const promises = [];
            // eslint-disable-next-line no-restricted-syntax
            for await (const cartItem4 of cartItems) {
              // Make sure to wait on all your sequelize CRUD calls
              const prodId = cartItem4.product_id;
              const prod = await Product.findByPk(prodId, { transaction });

              const { order_id } = order;
              const { product_id } = prod;
              const { attributes } = cartItem4;
              const product_name = prod.name;
              const { quantity } = cartItem4;
              const unit_cost = prod.price;
              promises.push(prod);

              promises.push(
                await OrderDetail.create(
                  {
                    order_id,
                    product_id,
                    attributes,
                    product_name,
                    quantity,
                    unit_cost,
                  },
                  { transaction }
                ).catch(errrr => {
                  return res.status(400).json({
                    error: {
                      code: `USR_12`,
                      message: `Error occurred`,  // eslint-disable-line
                      field: `processing order inserting into orderdetail , ${errrr.message}`,
                      status: 400,
                    },
                  });
                })
              );
            }

            Promise.all(promises);
            await transaction.commit();
            console.log('we got here');
            // eslint-disable-next-line no-empty
          } catch (err1) {
            // eslint-disable-next-line prettier/prettier
            await transaction.rollback();
            return next(error);
          }

          // We don't want to store the sensitive information such as the
          // user password in the token so we pick only the email and id
          const payload = {
            email: user.email,
          };
          // eslint-disable-next-line consistent-return
          jwt.sign(payload, `${secret}`, { expiresIn: 36000 }, async (errr, token) => {
            if (errr) {
              return res.status(400).json({
                error: {
                  code: `USR_10`,
                  message: `Error occurred`,  // eslint-disable-line
                  field: `jwt signing`,
                  status: 400,
                },
              });
            }

            if (res) res.setHeader(`USERKEY`, token);
            return res.status(200).json({
              order: {
                order_id: order.order_id,
              },
            });
          });
        });
        // eslint-disable-next-line no-empty
      } catch (error) {}
    })(req, res, next);
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
    // eslint-disable-next-line no-unused-vars
    passport.authenticate('jwt', async (err, user, _info) => {
      try {
        if (err || !user) {
          return res.status(401).json({
            error: {
              code: `USR_11`,
              message: `Error occurred`,  // eslint-disable-line
              field: `jwt login,  `,
              status: 401,
            },
          });
        }

        // eslint-disable-next-line consistent-return
        req.login(user, { session: false }, async error => {
          if (error) return next(error);
          const { customer_id } = user;
          const orders = await Order.findAll({
            where: {
              // eslint-disable-next-line object-shorthand
              customer_id,
            },
          });

          // We don't want to store the sensitive information such as the
          // user password in the token so we pick only the email and id
          const payload = {
            email: user.email,
          };
          // eslint-disable-next-line consistent-return
          jwt.sign(payload, `${secret}`, { expiresIn: 36000 }, async (errr, token) => {
            if (errr) {
              return res.status(400).json({
                error: {
                  code: `USR_10`,
                  message: `Error occurred`,  // eslint-disable-line
                  field: `jwt signing`,
                  status: 400,
                },
              });
            }

            if (res) res.setHeader(`USERKEY`, token);
            return res.status(200).json({
              orders,
            });
          });
        });
        // eslint-disable-next-line no-empty
      } catch (error) {}
    })(req, res, next);
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
    // eslint-disable-next-line no-unused-vars
    passport.authenticate('jwt', async (err, user, _info) => {
      try {
        if (err || !user) {
          return res.status(401).json({
            error: {
              code: `USR_11`,
              message: `Error occurred`,  // eslint-disable-line
              field: `jwt login,  `,
              status: 401,
            },
          });
        }

        // eslint-disable-next-line consistent-return
        req.login(user, { session: false }, async error => {
          if (error) return next(error);
          const { customer_id } = user;
          const { order_id } = req.params;
          const orders = await Order.findAll({
            where: {
              // eslint-disable-next-line object-shorthand
              order_id,
              customer_id,
            },
          });

          // We don't want to store the sensitive information such as the
          // user password in the token so we pick only the email and id
          const payload = {
            email: user.email,
          };
          // eslint-disable-next-line consistent-return
          jwt.sign(payload, `${secret}`, { expiresIn: 36000 }, async (errr, token) => {
            if (errr) {
              return res.status(400).json({
                error: {
                  code: `USR_10`,
                  message: `Error occurred`,  // eslint-disable-line
                  field: `jwt signing`,
                  status: 400,
                },
              });
            }

            if (res) res.setHeader(`USERKEY`, token);
            return res.status(200).json({
              orders,
            });
          });
        });
        // eslint-disable-next-line no-empty
      } catch (error) {}
    })(req, res, next);
  }

  /**
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async processStripePayment(req, res, next) {
    // eslint-disable-next-line no-unused-vars
    passport.authenticate('jwt', async (err, user, _info) => {
      try {
        if (err || !user) {
          return res.status(401).json({
            error: {
              code: `USR_11`,
              message: `Error occurred`,  // eslint-disable-line
              field: `jwt login,  `,
              status: 401,
            },
          });
        }

        // eslint-disable-next-line consistent-return
        req.login(user, { session: false }, async error => {
          if (error) return next(error);
          const { customer_id } = user;
          const { email, amount, stripeToken, order_id } = req.body; // eslint-disable-line
          console.log(customer_id);

          const charge = await stripe.charges
            .create({
              amount: Number(amount) * 100,
              currency: 'usd',
              description: 'Example charge',
              source: stripeToken,
              // eslint-disable-next-line object-shorthand
              metadata: { order_id: order_id },
            })
            .catch(errrr => console.log(errrr));

          // We don't want to store the sensitive information such as the
          // user password in the token so we pick only the email and id
          const payload = {
            email: user.email,
          };
          // eslint-disable-next-line consistent-return
          jwt.sign(payload, `${secret}`, { expiresIn: 36000 }, async (errr, token) => {
            if (errr) {
              return res.status(400).json({
                error: {
                  code: `USR_10`,
                  message: `Error occurred`,  // eslint-disable-line
                  field: `jwt signing`,
                  status: 400,
                },
              });
            }

            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            const msg = {
              to: 'frankgod02@hotmail.com',
              from: 'frankgod02@gmail.com',
              subject: 'Sending with SendGrid is Fun',
              text: 'and easy to do anywhere, even with Node.js',
              html: '<strong>and easy to do anywhere, even with Node.js</strong>',
            };
            sgMail.send(msg);

            if (res) res.setHeader(`USERKEY`, token);
            return res.status(200).json({
              charge,
            });
          });
        });
        // eslint-disable-next-line no-empty
      } catch (error) {}
    })(req, res, next);
  }
}

export default ShoppingCartController;
