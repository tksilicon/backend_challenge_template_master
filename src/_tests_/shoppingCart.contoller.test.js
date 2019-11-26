// we will use supertest to test HTTP requests/responses
import '@babel/polyfill';

process.env.NODE_ENV = 'test';

const request = require('supertest');

let server = require('../index');

afterEach(async () => {
  await server.close();
});

afterAll(async () => {
  await new Promise(resolve => setTimeout(() => resolve(), 10000)); // avoid jest open handle error
});

beforeEach(() => {
  // eslint-disable-next-line global-require
  server = require('../index');
});

describe('GET /shoppingcart/generateUniqueId', () => {
  jest.setTimeout(20000);
  test('Generate unique id for cart', async () => {
    const response = await request(server).get('/shoppingcart/generateUniqueId');

    expect(response.body).toHaveProperty('cart_id');
    expect(response.statusCode).toBe(200);
  });
});

describe('POST /shoppingcart/add', () => {
  jest.setTimeout(20000);
  test('add item to shopping cart', async () => {
    const response = await request(server)
      .post('/shoppingcart/add')
      .query({
        cart_id: 'hste2753!9',
        product_id: 1,
        attributes: 'LG, red',
      });

    expect(response.statusCode).toBe(200);
  });
});

describe('GET /shoppingcart/:cart_id', () => {
  jest.setTimeout(20000);
  test('Get cart using cart id', async () => {
    const response = await request(server).get('/shoppingcart/hste2753!9');

    
    expect(response.body).toEqual(expect.anything());
    expect(response.statusCode).toBe(200);
  });
});
