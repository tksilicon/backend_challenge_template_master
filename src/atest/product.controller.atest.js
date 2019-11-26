// we will use supertest to test HTTP requests/responses
import '@babel/polyfill';

process.env.NODE_ENV = 'test';

const request = require('supertest');

let server = require('../index');

const department = {
  department_id: 1,
  name: 'Regional',
  description: 'Proud of your country? Wear a T-shirt with a national symbol stamp!',
};

const product = {
  description: 'This beautiful and iconic T-shirt will no doubt lead you to your own triumph.',
  discounted_price: '0.00',
  name: "Arc d'Triomphe",
  price: '14.99',
  product_id: 1,
  thumbnail: 'arc-d-triomphe-thumbnail.gif',
};

const departments = [
  {
    department_id: 1,
    name: 'Regional',
    description: 'Proud of your country? Wear a T-shirt with a national symbol stamp!',
  },
  {
    department_id: 2,
    name: 'Nature',
    description: 'Find beautiful T-shirts with animals and flowers in our Nature department!',
  },
  {
    department_id: 3,
    name: 'Seasonal',
    description:
      'Each time of the year has a special flavor. Our seasonal T-shirts express traditional symbols using unique postal stamp pictures.',
  },
];

afterEach(async () => {
  await server.close();
});

afterAll(async () => {
  await new Promise(resolve => setTimeout(() => resolve(), 10000)); // avoid jest open handle error
});

beforeEach(() => {
  // eslint-disable-next-line global-require
  server = require('../index');
  jest.setTimeout(30000);
});

describe('Test the root path', () => {
  test('It should respond with the GET method', done => {
    request(server)
      .get('/')
      .then(response => {
        expect(response.statusCode).toBe(200);
        done();
      });
  });
});


describe('GET /departments/:departmentId', () => {
  test('It responds with a department', async () => {
    const response = await request(server).get('/departments/1');

    expect(response.body).toEqual(department);
    expect(response.body).toHaveProperty('department_id');
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('description');

    expect(response.statusCode).toBe(200);
  });
});

describe('GET /departments/:departmentId', () => {
  test('It responds with an validation error', async () => {
    const response = await request(server).get('/departments/t666655');
    expect(response.statusCode).toBe(422);
  });
});

describe('GET /departments', () => {
  test('It responds with an array of departments', async () => {
    const response = await request(server).get('/departments');
    expect(response.body).toEqual(departments);
    expect(response.body.length).toBe(3);
    expect(response.body[0]).toHaveProperty('department_id');
    expect(response.body[0]).toHaveProperty('name');
    expect(response.body[0]).toHaveProperty('description');

    expect(response.statusCode).toBe(200);
  });
});

describe('GET /products', () => {
  test('It responds with products and pagination meta data', async () => {
    const response = await request(server)
      .get('/products')
      // .query({ page: 1, limit: 20, description_length: 200 });
      .query({ page: 'gjhggfd', description_length: 200 });
    expect(response.body).toHaveProperty('rows');
    expect(response.statusCode).toBe(200);
  });
});

describe('GET /products/search', () => {
  test('It responds with products with words like beautiful and pagination meta data', async () => {
    const response = await request(server)
      .get('/products/search/')
      .query({
        query_string: 'beautiful',
        all_words: 'on',
        page: 1,
        limit: 20,
        description_length: 200,
      });

    expect(response.body).toHaveProperty('rows');
    expect(response.body).toHaveProperty('paginationMeta');
    expect(response.statusCode).toBe(200);
  });
});

describe('GET /products/inCategory/:category_id', () => {
  test('It responds with products in category 1', async () => {
    const response = await request(server)
      .get('/products/inCategory/1')
      .query({
        page: 1,
        limit: 20,
        description_length: 200,
      });

    expect(response.body).toHaveProperty('rows');
    expect(response.body).toHaveProperty('params');
    expect(response.statusCode).toBe(200);
  });
});

describe('GET /products/inDepartment/:department_id', () => {
  test('It responds with products in department 1', async () => {
    const response = await request(server)
      .get('/products/inDepartment/2')
      .query({
        page: 1,
        limit: 20,
        description_length: 200,
      });

    expect(response.body).toHaveProperty('rows');
    expect(response.body).toHaveProperty('params');
    expect(response.statusCode).toBe(200);
  });
});

describe('GET /products/:product_id', () => {
  test('It responds with a product', async () => {
    const response = await request(server).get('/products/1');

    expect(response.body).toEqual(product);
    expect(response.body).toHaveProperty('product_id');
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('price');

    expect(response.statusCode).toBe(200);
  });
});

describe('GET /categories', () => {
  test('It responds with an array of categories', async () => {
    const response = await request(server).get('/categories');
    // console.log(response.body);
    expect(response.body.length).toBe(7);
    expect(response.body[0]).toHaveProperty('category_id');
    expect(response.body[0]).toHaveProperty('department_id');
    expect(response.body[0]).toHaveProperty('name');
    expect(response.body[0]).toHaveProperty('description');

    expect(response.statusCode).toBe(200);
  });
});

describe('GET /categories/:category_id', () => {
  test('It responds with a category with id 1', async () => {
    const response = await request(server).get('/categories/1');
    // console.log(response.body);
    expect(response.body).toHaveProperty('category_id');
    expect(response.body).toHaveProperty('department_id');
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('description');

    expect(response.statusCode).toBe(200);
  });
});

describe('GET /categories/inDepartment/:department_id', () => {
  test('It responds list of categories in a department 1', async () => {
    const response = await request(server).get('/categories/inDepartment/3');
    // console.log(response.body);
    expect(response.body).toHaveProperty('rows');

    expect(response.statusCode).toBe(200);
  });
});
