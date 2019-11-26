

// we will use supertest to test HTTP requests/responses
import '@babel/polyfill';

process.env.NODE_ENV = 'test';

const request = require('supertest');

let server = require('../index');

let accessToken;

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

describe('POST /customers', () => {
  jest.setTimeout(30000);
  test('It creates a customer', async () => {
    const r = Math.random()
      .toString(36)
      .substring(7);
    const response = await request(server)
      .post('/customers')
      .query({
        name: r,
        email: `${r}@${r}.com`,
        password: 'beautiful',
      });
    // console.log(response.body);
    expect(response.body).toHaveProperty('customer');
    expect(response.body).toHaveProperty('accessToken');
    expect(response.statusCode).toBe(200);
  });
});

/*describe('POST /customers', () => {
  jest.setTimeout(30000);
  test('It creates a customer', async () => {
    
    const response = await request(server)
      .post('/customers')
      .query({
        name: 'thankgod',
        email: 'frankgod02@gmail.com',
        password: 'beautiful',
      });
    // console.log(response.body);
    expect(response.body).toHaveProperty('customer');
    expect(response.body).toHaveProperty('accessToken');
    expect(response.statusCode).toBe(200);
  });
});*/


describe('POST /customers/login', () => {
  jest.setTimeout(20000);
  test('Logs in a customer with facebook token', async () => {
    const response = await request(server)
      .post('/customers/login')
      .query({
        email: 'frankgod02@gmail.com',
        password: 'beautiful',
      });
    
    // eslint-disable-next-line prefer-destructuring
    accessToken = response.body.accessToken.split(' ')[1];

    expect(response.body).toHaveProperty('customer');
    expect(response.body).toHaveProperty('accessToken');
    expect(response.statusCode).toBe(200);
  });
});

describe('GET /customer', () => {
  jest.setTimeout(20000);

  test('Retrieves customer profile with token', async () => {
    const response = await request(server)
      .get('/customer')

      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.body).toHaveProperty('customer');
    expect(response.body).toHaveProperty('accessToken');
    expect(response.statusCode).toBe(200);
  });
});


describe('PUT /customer', () => {
  jest.setTimeout(20000);
  test('update  a customer details with token', async () => {
    const response = await request(server)
      .put('/customer')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({
        email: 'frankgod02@gmail.com',
        name: 'thankgod',
        password: 'beautiful',
        day_phone: '+234813653563',
        eve_phone: '+234813653563',
        mob_phone: '+234813653563',
      });

    // console.log(response.body);

    // eslint-disable-next-line prefer-destructuring

    expect(response.body).toHaveProperty('customer');
    expect(response.body).toHaveProperty('accessToken');
    expect(response.statusCode).toBe(200);
  });
});


describe('PUT /customer/address', () => {
  jest.setTimeout(20000);
  test('update  a customer customer with token', async () => {
    const response = await request(server)
      .put('/customer/address')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({
        address_1: 'edjba street',
        city: 'Lagos',
        region: 'Lagos',
        postal_code: '12202',
        country: 'Nigeria',
        shipping_region_id: 1,
      });

    // eslint-disable-next-line prefer-destructuring

    expect(response.body).toHaveProperty('customer');
    expect(response.body).toHaveProperty('accessToken');
    expect(response.statusCode).toBe(200);
  });
});

describe('PUT /customer/creditCard', () => {
  jest.setTimeout(20000);
  test('update  a customer credit card with token', async () => {
    const response = await request(server)
      .put('/customer/creditCard')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({
        credit_card: '4111 1111 1111 1111',
      });

    // eslint-disable-next-line prefer-destructuring

    expect(response.body).toHaveProperty('customer');
    expect(response.body).toHaveProperty('accessToken');
    expect(response.statusCode).toBe(200);
  });
});




// const { TESTACCESSTOKEN } = require('../config/jwtConfig');
 
/*
describe('POST /customers/facebook', () => {
  jest.setTimeout(30000);
  test('Logs in a customer with facebook token', async () => {
    const response = await request(server)
      .post('/customers/facebook')
      .query({
        access_token: TESTACCESSTOKEN,
      });
     console.log(response.body);
    expect(response.body).toHaveProperty('customer');
    expect(response.body).toHaveProperty('accessToken');
    expect(response.statusCode).toBe(200);
  });
});

/** describe('Authentication', function() {

//database reset here

  it('should create a new user /users/registration', function(done) {
    request(server)
      .post('/users/register')
      .send({
        username: 'user-name',
        email: 'luser-name@gmail.com',
        password: '12345'
      })
      .set('Accept', 'application/json')
      .expect(201, done);
  });
});

describe('my test', () => {
    beforeEach(() => {
       // code to run before each test
    });

    test('test 1', () => {
      // code
    });

   test('test 2', () => {
      // code
   });
}) */

//   https://github.com/sahat/satellizer/blob/master/examples/server/node/server.js
