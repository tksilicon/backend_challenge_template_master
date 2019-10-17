/* eslint-disable no-restricted-globals */
/* eslint-disable use-isnan */
/* eslint-disable camelcase */
/**
 * The Product controller contains all static methods that handles product request
 * Some methods work fine, some needs to be implemented from scratch while others may contain one or two bugs
 * The static methods and their function include:
 *
 * - getAllProducts - Return a paginated list of products
 * - searchProducts - Returns a list of product that matches the search query string
 * - getProductsByCategory - Returns all products in a product category
 * - getProductsByDepartment - Returns a list of products in a particular department
 * - getProduct - Returns a single product with a matched id in the request params
 * - getAllDepartments - Returns a list of all product departments
 * - getDepartment - Returns a single department
 * - getAllCategories - Returns all categories
 * - getSingleCategory - Returns a single category
 * - getDepartmentCategories - Returns all categories in a department
 *
 *  NB: Check the BACKEND CHALLENGE TEMPLATE DOCUMENTATION in the readme of this repository to see our recommended
 *  endpoints, request body/param, and response object for each of these method
 */
import { Product, Department, Category, Sequelize } from '../database/models';
import { getPage, getLimit, getDescriptionLength } from '../util/turingutil.ts';

const { Op } = Sequelize;

const { validationResult } = require('express-validator/check');

/**
 *
 *
 * @class ProductController
 */
class ProductController {
  /**
   * get all products
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product data
   * @memberof ProductController
   */
  static async getAllProducts(req, res, next) {
    try {
      const page = getPage(req);
      const limit = getLimit(req);
      const descriptionLength = getDescriptionLength(req);

      const offsett = Number(page) * Number(limit);
      const limitPage = offsett + Number(limit);

      const sqlQueryMap = {
        attributes: [
          'product_id',
          'name',
          'price',

          [Sequelize.literal(`SUBSTRING(description, 1, ${descriptionLength})`), 'description'],
          'discounted_price',
          'thumbnail',
        ],
        limit: limitPage,
        offset: offsett,
      };

      const products = await Product.findAndCountAll(sqlQueryMap);

      if (products) {
        return res.status(200).json({
          paginationMeta: {
            currentPage: page, // Current page number
            currentPageSize: limit, // The page limit
            totalPages: limitPage / limit, // The total number of pages for all products
            totalRecords: products.count, // The total number of product in the database
          },
          rows: { products },
        });
      }

      return res.status(404).json({
        error: {
          code: `API_01`,
          message: `Error occurred`,  // eslint-disable-line
          field: `products`,
          status: 400,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * search all products
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product data
   * @memberof ProductController
   */
  static async searchProduct(req, res, next) {
    try {
      const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions

      if (!errors.isEmpty()) {
        return res.status(422).json({
          error: {
            code: `PRO_01`,
            message: `Check that query params are not empty`,  // eslint-disable-line
            field: `query_string/allwords`,
            status: 400,
          },
        });
      }

      const page = getPage(req);
      const limit = getLimit(req);
      const descriptionLength = getDescriptionLength(req);
      const { query_string } = req.query;

      const offsett = Number(page) * Number(limit);
      const limitPage = offsett + Number(limit);

      const sqlQueryMap = {
        attributes: [
          'product_id',
          'name',
          'price',

          [Sequelize.literal(`SUBSTRING(description, 1, ${descriptionLength})`), 'description'],
          'discounted_price',
          'thumbnail',
        ],
        where: {
          [Op.or]: [
            {
              description: {
                [Op.like]: `%${query_string}%`,
              },
            },
            {
              name: {
                [Op.like]: `%${query_string}%`,
              },
            },
          ],
        },

        limit: limitPage,
        offset: offsett,
      };

      const products = await Product.findAndCountAll(sqlQueryMap);

      if (products) {
        return res.status(200).json({
          paginationMeta: {
            currentPage: page, // Current page number
            currentPageSize: limit, // The page limit
            totalPages: limitPage / limit, // The total number of pages for all products
            totalRecords: products.count, // The total number of product in the database
          },
          rows: { products },
        });
      }

      return res.status(404).json({
        error: {
          code: `API_01`,
          message: `Error occurred`,  // eslint-disable-line
          field: `products`,
          status: 400,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * get all products by caetgory
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product data
   * @memberof ProductController
   */
  static async getProductsByCategory(req, res, next) {
    try {
      const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions

      if (!errors.isEmpty()) {
        return res.status(422).json({
          error: {
            code: `PRO_01`,
            message: `Check that category_id isnumeric`,  // eslint-disable-line
            field: `category_id`,
            status: 400,
          },
        });
      }
      const { category_id } = req.params; // eslint-disable-line

      const page = getPage(req);
      const limit = getLimit(req);
      const descriptionLength = getDescriptionLength(req);

      const offsett = Number(page) * Number(limit);
      const limitPage = offsett + Number(limit);

      const products = await Product.findAndCountAll({
        include: [Category],
        through: { where: { category_id: `${category_id}` } },
        attributes: [
          'product_id',
          'name',
          'price',

          [Sequelize.literal(`SUBSTRING(description, 1, ${descriptionLength})`), 'description'],
          'discounted_price',
          'thumbnail',
        ],

        limit: limitPage,
        offset: offsett,
      });

      if (products) {
        return res.status(200).json({
          params: {
            currentPage: page, // Current page number
            currentPageSize: limit, // The page limit
            totalPages: limitPage / limit, // The total number of pages for all products
            totalRecords: products.count, // The total number of product in the database
          },
          rows: { products },
        });
      }

      return res.status(404).json({
        error: {
          code: `API_02`,
          message: `Error occurred`,  // eslint-disable-line
          field: `products`,
          status: 400,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * get all products by department
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product data
   * @memberof ProductController
   */
  static async getProductsByDepartment(req, res, next) {
    // implement the method to get products by department

    try {
      const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions

      if (!errors.isEmpty()) {
        return res.status(422).json({
          error: {
            code: `PRO_03`,
            message: `Check that department_id isnumeric`,  // eslint-disable-line
            field: `department_id`,
            status: 400,
          },
        });
      }

      const { department_id } = req.params; // eslint-disable-line

      const page = getPage(req);
      const limit = getLimit(req);
      const descriptionLength = getDescriptionLength(req);

      const offsett = Number(page) * Number(limit);
      const limitPage = offsett + Number(limit);

      const products = await Product.findAndCountAll({
        include: [Category],
        through: { where: { department_id: `${department_id}` } },
        attributes: [
          'product_id',
          'name',
          'price',

          [Sequelize.literal(`SUBSTRING(description, 1, ${descriptionLength})`), 'description'],
          'discounted_price',
          'thumbnail',
        ],

        limit: limitPage,
        offset: offsett,
      });

      if (products) {
        return res.status(200).json({
          params: {
            currentPage: page, // Current page number
            currentPageSize: limit, // The page limit
            totalPages: limitPage / limit, // The total number of pages for all products
            totalRecords: products.count, // The total number of product in the database
          },
          rows: { products },
        });
      }

      return res.status(404).json({
        error: {
          code: `API_03`,
          message: `Error occurred`,  // eslint-disable-line
          field: `products`,
          status: 400,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * get single product details
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product details
   * @memberof ProductController
   */
  static async getProduct(req, res, next) {
    try {
      const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions

      if (!errors.isEmpty()) {
        return res.status(422).json({
          error: {
            code: `PRO_04`,
            message: `Check that product_id isnumeric`,  // eslint-disable-line
            field: `product_id`,
            status: 400,
          },
        });
      }
      const { product_id } = req.params; // eslint-disable-line

      const product = await Product.findByPk(product_id, {
        attributes: [
          'product_id',
          'name',
          'price',

          [Sequelize.literal(`SUBSTRING(description, 1, 200)`), 'description'],
          'discounted_price',
          'thumbnail',
        ],
      });

      if (product) {
        return res.status(200).json(product);
      }

      return res.status(404).json({
        error: {
          code: `API_04`,
          message: `Product with id ${product_id} does not exist`,  // eslint-disable-line
          field: `product_id`,
          status: 400,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * get all departments
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and department list
   * @memberof ProductController
   */
  static async getAllDepartments(req, res, next) {
    try {
      const departments = await Department.findAll();

      if (departments) {
        return res.status(200).json(departments);
      }

      return res.status(404).json({
        error: {
          code: `DEP_03`,
          message: `Error occurred`,  // eslint-disable-line
          field: `departments`,
          status: 400,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get a single department
   * @param {*} req
   * @param {*} res
   * @param {*} next
   *
   */

  static async getDepartment(req, res, next) {
    try {
      const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions

      if (!errors.isEmpty()) {
        return res.status(422).json({
          error: {
            code: `DEP_01`,
            message: `The ID is not a number`,  // eslint-disable-line
            field: `department_id`,
            status: 400,
          },
        });
      }
    } catch (error) {
      return next(error);
    }

    try {
      const { department_id } = req.params; // eslint-disable-line
      const department = await Department.findByPk(department_id);
      if (department) {
        return res.status(200).json(department);
      }

      return res.status(404).json({
        error: {
          code: `DEP_02`,
          message: `Department with id ${department_id} does not exist`,  // eslint-disable-line
          field: `department_id`,
          status: 400,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * This method should get all categories
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getAllCategories(req, res, next) {
    // Implement code to get all categories here

    try {
      const categories = await Category.findAll();

      if (categories) {
        return res.status(200).json(categories);
      }

      return res.status(404).json({
        error: {
          code: `CAT_03`,
          message: `Error occurred`,  // eslint-disable-line
          field: `categories`,
          status: 400,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * This method should get a single category using the categoryId
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getSingleCategory(req, res, next) {
    try {
      const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions

      if (!errors.isEmpty()) {
        return res.status(422).json({
          error: {
            code: `CAT_01`,
            message: `The category_id is not a number`,  // eslint-disable-line
            field: `category_id`,
            status: 400,
          },
        });
      }

      const { category_id } = req.params;  // eslint-disable-line
      const category = await Category.findByPk(category_id);

      if (category) {
        return res.status(200).json(category);
      }

      return res.status(404).json({
        error: {
          code: `CAT_01`,
          message: `Categort with id ${category_id} does not exist`,  // eslint-disable-line
          field: `category_id`,
          status: 400,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * This method should get list of categories in a department
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getDepartmentCategories(req, res, next) {
    try {
      const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions

      if (!errors.isEmpty()) {
        return res.status(422).json({
          error: {
            code: `DEP_03`,
            message: `Check that department_id isnumeric`,  // eslint-disable-line
            field: `department_id`,
            status: 400,
          },
        });
      }

      const { department_id } = req.params; // eslint-disable-line

      const departments = await Department.findAndCountAll({
        include: [Category],
        through: { where: { department_id: `${department_id}` } },
      });

      if (departments) {
        return res.status(200).json({
          rows: { departments },
        });
      }

      return res.status(404).json({
        error: {
          code: `DEP_03`,
          message: `Error occurred`,  // eslint-disable-line
          field: `departments`,
          status: 400,
        },
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default ProductController;
