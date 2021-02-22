require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('returns stickers', async() => {

      const expectation = [
        {
          id: 1,
          name: "star",
          category: "space",
          url: "",
          in_stock: true,
          price: 1,
          inventory: 5,
          label_type: "vinyl",
          width: 2,
          height: 2,
          shape: "square",
          seller_id: 1,
        },
        {
          id: 2,
          name: "bird",
          category: "animal",
          url: "",
          in_stock: true,
          price: 1,
          inventory: 2,
          label_type: "polyester",
          width: 2,
          height: 2,
          shape: "circle",
          seller_id: 1,
        },
        {
          id: 3,
          name: "bmw",
          category: "vehicle",
          url: "",
          in_stock: true,
          price: 1,
          inventory: 2,
          label_type: "polyester",
          width: 2,
          height: 2,
          shape: "circle",
          seller_id: 1,
        },
        {
          id: 4,
          name: "eggs",
          category: "food",
          url: "",
          in_stock: true,
          price: 1,
          inventory: 2,
          label_type: "polyester",
          width: 2,
          height: 2,
          shape: "circle",
          seller_id: 1,
          },
          {
            id: 5,
            name: "beach",
            category: "nature",
            url: "",
            in_stock: true,
            price: 1,
            inventory: 2,
            label_type: "polyester",
            width: 2,
            height: 2,
            shape: "circle",
            seller_id: 1,
            }
      ];
      const data = await fakeRequest(app)
      .get('/stickers')
      .expect('Content-Type', /json/)
      .expect(200);
      
      expect(data.body).toEqual(expectation);
    });
    
    test('returns stickers', async() => {
    
      const expectation = {
          id: 1,
          name: "star",
          category: "space",
          url: "",
          in_stock: true,
          price: 1,
          inventory: 5,
          label_type: "vinyl",
          width: 2,
          height: 2,
          shape: "square",
          seller_id: 1
    } ;
    
      
      const data = await fakeRequest(app)
      .get('/stickers/1')
      .expect('Content-Type', /json/)
      .expect(200);
    
      expect(data.body).toEqual(expectation);
    });
  });
});


