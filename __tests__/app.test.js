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

    test('returns all the stickers', async() => {

      const expectation = [
        {
          id: 1,
          name: "star",
          category_id: 1,
          category_name: 'space',
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
          category_id: 2,
          category_name: 'animal',
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
          category_id: 3,
          category_name: 'vehicle',
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
          category_id: 4,
          category_name: 'food',
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
            category_id: 5,
            category_name: 'nature',
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
    
    test('returns the particular sticker chosen by the user', async() => {
    
      const expectation = [{
        "id": 2,
        "name": "bird",
        "category_id": 2,
        "url": "",
        "in_stock": true,
        "price": 1,
        "inventory": 2,
        "label_type": "polyester",
        "width": 2,
        "height": 2,
        "shape": "circle",
        "seller_id": 1
    }];
    
      
      const data = await fakeRequest(app)
      .get('/stickers/2')
      .expect('Content-Type', /json/)
      .expect(200);
    
      expect(data.body).toEqual(expectation);
    });

    test('adds a sticker and tests the db for our new sticker', async() => {
    
      const newSticker = {
          name: "best sticker",
          category_id: 6,
          category_name: "coolest",
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
        id: 6,
        ...newSticker
      }
    
      const data = await fakeRequest(app)
        .post('/stickers')
        .send(expectedSticker)
        .expect('Content-Type', /json/)
        .expect(200);
      
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
        name: 'best sticker',
        category_id: 6,
        url: '',
        in_stock: false,
        price: 100,
        inventory: 0,
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

      console.log(`updated sticker request =${JSON.stringify(updatedSticker.body)}`);
      //ask about whether this is doing the same thing as the updated sticker thing. This is making a get request, is using the put request return for the expected bypassing hitting th endpoint making this solution incorrect?
      // const data = await fakeRequest(app)
      //   .get('/stickers/6')
      //   .expect('Content-Type', /json/)
      //   .expect(200);

      expect(updatedSticker.body).toEqual(expectedSticker);
    });

    test('deletes a sticker and tests that it was removed', async() => {
      
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
      .delete('/stickers/6')
      .expect('Content-Type', /json/)
      .expect(200);
      
      // expect(data.body).toEqual(expectation);

      const deleted = await fakeRequest(app)
        .get('/stickers/6')
        .expect('Content-Type', /json/)
        .expect(200)

        expect(deleted.body).toEqual([]);

    });

  });
});


