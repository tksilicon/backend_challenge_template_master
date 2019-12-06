/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
/**
 * Customer controller handles all requests that has to do with customer
 * - create - allow customers to create a new account
 * - login - allow customers to login to their account
 * - getCustomerProfile - allow customers to view their profile info
 * - updateCustomerProfile - allow customers to update their profile info like name, email, password, day_phone, eve_phone and mob_phone
 * - updateCustomerAddress - allow customers to update their address info
 * - updateCreditCard - allow customers to update their credit card number
 *
 */

import { Customer } from '../database/models';

const bcrypt = require('bcrypt');
const passport = require('passport');
const { validationResult } = require('express-validator/check');
const jwt = require('jsonwebtoken');
const secret = require('../config/jwtConfig');

/**
 *
 *
 * @class CustomerController
 */
class CustomerController {
  /**
   * create a customer record
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, customer data and access token
   * @memberof CustomerController
   */

  static async create(req, res, next) {
    try {
      const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions

      if (!errors.isEmpty()) {
        return res.status(422).json({
          error: {
            code: `USR_03`,
            message: `The email is invalid.`,  // eslint-disable-line
            field: `email`,
            status: 400,
          },
        });
      }
      const { email } = req.query;
      const { name } = req.query;
      const { password } = req.query;

      const cust = await Customer.findOne({
        where: {
          // eslint-disable-next-line object-shorthand
          email: email,
        },
      });

      if (cust) {
        return res.status(422).json({
          error: {
            code: `USR_04`,
            message: `The email already exists.`,  // eslint-disable-line
            field: `email`,
            status: 400,
          },
        });
      }

      Customer.create({
        email,
        password,
        name,
      })
        .then(user => {
          const payload = { email: user.email };

          const token = jwt.sign(payload, `${secret}`, { expiresIn: '24h' });

          return res.status(200).json({
            customer: {
              customer_id: user.customer_id,
              name: user.name,
              email: user.email,
              address_1: user.address_1,
              address_2: user.address_2,
              city: user.city,
              region: user.region,
            },

            accessToken: `Bearer ${token}`,
            expiresIn: `24h`,
          });
        })
        // eslint-disable-next-line no-unused-vars
        .catch(_err => {
          return res.status(400).json({
            error: {
              code: `USR_10`,
              message: `Error occurred`,  // eslint-disable-line
              field: `register`,
              status: 400,
            },
          });
        });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * log in a customer
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, and access token
   * @memberof CustomerController
   */
  static async login(req, res, next) {
    passport.authenticate(
      'login',
      { session: false },

      // eslint-disable-next-line consistent-return
      // eslint-disable-next-line no-unused-vars
      async (err, user, _info) => {
        try {
          if (err || !user) {
            return res.status(401).json({
              error: {
                code: `USR_10`,
                message: `Error occurred`,  // eslint-disable-line
                field: `facebook login,  `,
                status: 401,
              },
            });
          }
          // eslint-disable-next-line consistent-return
          req.login(user, { session: false }, async error => {
            if (error) return next(error);

            // We don't want to store the sensitive information such as the
            // user password in the token so we pick only the email and id
            const payload = {
              email: user.email,
            };
            // eslint-disable-next-line consistent-return
            jwt.sign(payload, `${secret}`, { expiresIn: '24h' }, (errr, token) => {
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

              return res.status(200).json({
                customer: {
                  customer_id: user.customer_id,
                  name: user.name,
                  email: user.email,
                  address_1: user.address_1,
                  address_2: user.address_2,
                  city: user.city,
                  region: user.region,
                  postal_code: user.postal_code,
                  country: user.country,
                  shipping_region_id: user.shipping_region_id,
                  day_phone: user.day_phone,
                  eve_phone: user.eve_phone,
                  mob_phone: user.mob_phone,
                  credit_card: user.credit_card,
                },

                accessToken: `Bearer ${token}`,
                expiresIn: `24h`,
              });
            });
          });
        } catch (error) {
          return next(error);
        }
      }
    )(req, res, next);
  }

  /**
   * log in a customer using facebook
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, and access token
   * @memberof CustomerController
   */
  static async loginfacebook(req, res, next) {
    // eslint-disable-next-line consistent-return
    passport.authenticate(
      'facebook-token',
      { session: false },
      // eslint-disable-next-line no-unused-vars
      async (err, user, _info) => {
        try {
          if (err || !user) {
            return res.status(401).json({
              error: {
                code: `USR_10`,
                message: `Error occurred`,  // eslint-disable-line
                field: `facebook login,  `,
                status: 401,
              },
            });
          }
          // eslint-disable-next-line consistent-return
          req.login(user, { session: false }, async error => {
            if (error) return next(error);

            // We don't want to store the sensitive information such as the
            // user password in the token so we pick only the email and id
            const payload = {
              email: user.email,
            };
            // eslint-disable-next-line consistent-return
            jwt.sign(payload, `${secret}`, { expiresIn: '24h' }, (errr, token) => {
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

              return res.status(200).json({
                customer: {
                  customer_id: user.customer_id,
                  name: user.name,
                  email: user.email,
                  address_1: user.address_1,
                  address_2: user.address_2,
                  city: user.city,
                  region: user.region,
                  postal_code: user.postal_code,
                  country: user.country,
                  shipping_region_id: user.shipping_region_id,
                  day_phone: user.day_phone,
                  eve_phone: user.eve_phone,
                  mob_phone: user.mob_phone,
                  credit_card: user.credit_card,
                },

                accessToken: `Bearer ${token}`,
                expiresIn: `24h`,
              });
            });
          });
        } catch (error) {
          return next(error);
        }
      }
    )(req, res, next);
  }

  /**
   * get customer profile data
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status customer profile data
   * @memberof CustomerController
   */
  static async getCustomerProfile(req, res, next) {
    // eslint-disable-next-line consistent-return
    // eslint-disable-next-line no-unused-vars
    passport.authenticate('jwt', { session: false }, async (err, user, _info) => {
      try {
        if (!user) {
          return res.status(402).json({
            error: {
              code: `USR_10`,
              message: `Error occurred`,  // eslint-disable-line
              field: `jwt login user`,
              status: 402,
            },
          });
        }
        if (err) {
          return res.status(401).json({
            error: {
              code: `USR_10`,
              message: err.message,  // eslint-disable-line
              field: `jwt login`,
              status: 401,
            },
          });
        }

        // eslint-disable-next-line consistent-return
        req.login(user, { session: false }, async error => {
          if (error) return next(error);

          // We don't want to store the sensitive information such as the
          // user password in the token so we pick only the email and id
          const payload = {
            email: user.email,
          };
          // eslint-disable-next-line consistent-return
          jwt.sign(payload, `${secret}`, { expiresIn: '24h' }, (errr, token) => {
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

            return res.status(200).json({
              customer: {
                customer_id: user.customer_id,
                name: user.name,
                email: user.email,
                address_1: user.address_1,
                address_2: user.address_2,
                city: user.city,
                region: user.region,
                postal_code: user.postal_code,
                country: user.country,
                shipping_region_id: user.shipping_region_id,
                day_phone: user.day_phone,
                eve_phone: user.eve_phone,
                mob_phone: user.mob_phone,
                credit_card: user.credit_card,
              },

              accessToken: `Bearer ${token}`,
              expiresIn: `24h`,
            });
          });
        });
      } catch (error) {
        return next(error);
      }
    })(req, res, next);
  }

  /**
   * update customer profile data such as name, email, password, day_phone, eve_phone and mob_phone
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status customer profile data
   * @memberof CustomerController
   */
  static async updateCustomerProfile(req, res, next) {
    // Implement function to update customer profile like name, day_phone, eve_phone and mob_phone
    // return res.status(200).json({ message: 'this works' });

    const { name } = req.query;
    const { password } = req.query;
    // eslint-disable-next-line camelcase
    const { day_phone } = req.query;
    // eslint-disable-next-line camelcase
    const { eve_phone } = req.query;
    // eslint-disable-next-line camelcase
    const { mob_phone } = req.query;

    // eslint-disable-next-line no-unused-vars
    // eslint-disable-next-line consistent-return
    passport.authenticate('jwt', async (err, user, _info) => {
      try {
        if (err || !user) {
          return res.status(400).json({
            error: {
              code: `USR_10`,
              message: `Error occurred`,  // eslint-disable-line
              field: `jwt login,  `,
              status: 400,
            },
          });
        }
        // eslint-disable-next-line consistent-return
        req.login(user, { session: false }, async error => {
          if (error) return next(error);

          // We don't want to store the sensitive information such as the
          // user password in the token so we pick only the email and id
          const payload = {
            email: user.email,
          };

          const hashPassword = async function generatePasswordHash() {
            const saltRounds = 8;
            return bcrypt.hash(password, saltRounds);
          };

          Customer.update(
            { name, day_phone, eve_phone, mob_phone, hashPassword },
            { where: { email: user.email } }
            // eslint-disable-next-line no-unused-vars
          ).catch(_err => {
            return res.status(400).json({
              error: {
                code: `USR_10`,
              message: `Error occurred`,  // eslint-disable-line
                field: `update`,
                status: 400,
              },
            });
          });

          // eslint-disable-next-line consistent-return
          jwt.sign(payload, `${secret}`, { expiresIn: '24h' }, (errr, token) => {
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
            return res.status(200).json({
              customer: {
                customer_id: user.customer_id,
                name: user.name,
                email: user.email,
                address_1: user.address_1,
                address_2: user.address_2,
                city: user.city,
                region: user.region,
                postal_code: user.postal_code,
                country: user.country,
                shipping_region_id: user.shipping_region_id,
                day_phone: user.day_phone,
                eve_phone: user.eve_phone,
                mob_phone: user.mob_phone,
                credit_card: user.credit_card,
              },

              accessToken: `Bearer ${token}`,
              expiresIn: `24h`,
            });
          });
        });
      } catch (error) {
        return next(error);
      }
    })(req, res, next);
  }

  /**
   * update customer profile data such as address_1, address_2, city, region, postal_code, country and shipping_region_id
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status customer profile data
   * @memberof CustomerController
   */
  static async updateCustomerAddress(req, res, next) {
    //  update customer address info such as address_1, address_2, city, region, postal_code, country
    // and shipping_region_id

    // eslint-disable-next-line camelcase
    const { address_1 } = req.query;
    // eslint-disable-next-line camelcase
    const { address_2 } = req.query;
    const { city } = req.query;
    const { region } = req.query;
    // eslint-disable-next-line camelcase
    const { postal_code } = req.query;
    const { country } = req.query;
    // eslint-disable-next-line camelcase
    const { shipping_region_id } = req.query;

    // eslint-disable-next-line no-unused-vars
    // eslint-disable-next-line consistent-return
    passport.authenticate('jwt', async (err, user, _info) => {
      try {
        if (err || !user) {
          return res.status(400).json({
            error: {
              code: `USR_10`,
              message: `Error occurred`,  // eslint-disable-line
              field: `jwt login,  `,
              status: 400,
            },
          });
        }
        // eslint-disable-next-line consistent-return
        req.login(user, { session: false }, async error => {
          if (error) return next(error);

          // We don't want to store the sensitive information such as the
          // user password in the token so we pick only the email and id
          const payload = {
            email: user.email,
          };

          Customer.update(
            { address_1, address_2, city, region, postal_code, country, shipping_region_id },
            { where: { email: user.email } }
            // eslint-disable-next-line no-unused-vars
          ).catch(_err => {
            return res.status(400).json({
              error: {
                code: `USR_10`,
              message: `Error occurred`,  // eslint-disable-line
                field: `update`,
                status: 400,
              },
            });
          });

          // eslint-disable-next-line consistent-return
          jwt.sign(payload, `${secret}`, { expiresIn: 36000 }, (errr, token) => {
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
            return res.status(200).json({
              customer: {
                customer_id: user.customer_id,
                name: user.name,
                email: user.email,
                address_1: user.address_1,
                address_2: user.address_2,
                city: user.city,
                region: user.region,
                postal_code: user.postal_code,
                country: user.country,
                shipping_region_id: user.shipping_region_id,
                day_phone: user.day_phone,
                eve_phone: user.eve_phone,
                mob_phone: user.mob_phone,
                credit_card: user.credit_card,
              },

              accessToken: `Bearer ${token}`,
              expiresIn: `24h`,
            });
          });
        });
      } catch (error) {
        return next(error);
      }
    })(req, res, next);
  }

  /**
   * update customer credit card
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status customer profile data
   * @memberof CustomerController
   */
  static async updateCreditCard(req, res, next) {
    // eslint-disable-next-line camelcase
    const { credit_card } = req.query;

    // eslint-disable-next-line no-unused-vars
    // eslint-disable-next-line consistent-return
    passport.authenticate('jwt', async (err, user, _info) => {
      try {
        if (err || !user) {
          return res.status(400).json({
            error: {
              code: `USR_10`,
              message: `Error occurred`,  // eslint-disable-line
              field: `jwt login,  `,
              status: 400,
            },
          });
        }
        // eslint-disable-next-line consistent-return
        req.login(user, { session: false }, async error => {
          if (error) return next(error);

          // We don't want to store the sensitive information such as the
          // user password in the token so we pick only the email and id
          const payload = {
            email: user.email,
          };

          Customer.update(
            { credit_card },
            { where: { email: user.email } }
            // eslint-disable-next-line no-unused-vars
          ).catch(_err => {
            return res.status(400).json({
              error: {
                code: `USR_10`,
              message: `Error occurred`,  // eslint-disable-line
                field: `update`,
                status: 400,
              },
            });
          });

          // eslint-disable-next-line consistent-return
          jwt.sign(payload, `${secret}`, { expiresIn: 36000 }, (errr, token) => {
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
            return res.status(200).json({
              customer: {
                customer_id: user.customer_id,
                name: user.name,
                email: user.email,
                address_1: user.address_1,
                address_2: user.address_2,
                city: user.city,
                region: user.region,
                postal_code: user.postal_code,
                country: user.country,
                shipping_region_id: user.shipping_region_id,
                day_phone: user.day_phone,
                eve_phone: user.eve_phone,
                mob_phone: user.mob_phone,
                credit_card: user.credit_card,
              },

              accessToken: `Bearer ${token}`,
              expiresIn: `24h`,
            });
          });
        });
      } catch (error) {
        return next(error);
      }
    })(req, res, next);
  }
}

export default CustomerController;
