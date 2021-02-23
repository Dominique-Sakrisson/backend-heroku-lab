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
      };
    
      
      const data = await fakeRequest(app)
      .get('/stickers/1')
      .expect('Content-Type', /json/)
      .expect(200);
    
      expect(data.body).toEqual(expectation);
    });

    test('adds a sticker and tests the db for our new sticker', async() => {
    
      const newSticker = {
          name: "best sticker",
          category: "coolest",
          url: "",
          in_stock: true,
          price: 100,
          inventory: 1,
          label_type: "vinyl",
          width: 10,
          height: 10,
          shape: "amorphous",
          seller_id: 2
      };

      const expectedSticker = {
        ...newSticker,
        id:6
      }
    
      const data = await fakeRequest(app)
        .post('/stickers')
        .send(newSticker)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectedSticker);
      
      const allStickers = await fakeRequest(app)
      .get('/stickers')
      .expect('Content-Type', /json/)
      .expect(200);
    

      const bestSticker = allStickers.body.find(sticker => sticker.name === 'best sticker');

      expect(bestSticker).toEqual(expectedSticker);
    });

    test('updates a sticker and tests that it was actually updated', async() => {

      const expectedSticker = {
        id:6,
        in_stock: false,
        inventory: 0,
        name: 'best sticker',
        category : 'coolest',
        url: '',
        price: 100,
        label_type: 'vinyl',
        width: 10,
        height: 10,
        shape: 'amorphous',
        seller_id: 2
      }
      
      const updatedSticker = await fakeRequest(app)
      .put('/stickers/6')
      .send(expectedSticker)
      .expect('Content-Type', /json/)
      .expect(200);

      expect(updatedSticker.body).toEqual(expectedSticker);
    });

    test('udeletes a sticker and tests that it was removed', async() => {
      
      const expectation = {
        "id": 1,
        "name": "star",
        "category": "space",
        "url": "",
        "in_stock": true,
        "price": 1,
        "inventory": 5,
        "label_type": "vinyl",
        "width": 2,
        "height": 2,
        "shape": "square",
        "seller_id": 1
      }
      
      const data = await fakeRequest(app)
      .delete('/stickers/1')
      .expect('Content-Type', /json/)
      .expect(200);
      
      expect(data.body).toEqual(expectation);

      const deleted = await fakeRequest(app)
        .get('/stickers/1')
        .expect('Content-Type', /json/)
        .expect(200)

        expect(deleted.body).toEqual('');

    });

  });
});


