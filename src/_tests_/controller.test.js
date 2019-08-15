// we will use supertest to test HTTP requests/responses
import '@babel/polyfill';

const request = require('supertest');
//const server = require('../index');

const department = {
  id: 1,
  name: 'Regional',
  description: 'Proud of your country? Wear a T-shirt with a national symbol stamp!',
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

beforeEach(()=> { 
		server = require('../index');
		});
		
describe('Test the root path', () => {
  test('It should response the GET method', done => {
    request(server).get('/').then(response => {
        expect(response.statusCode).toBe(200);
        done();
      });
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
