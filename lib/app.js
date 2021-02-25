const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

//define an endpoint on the '/' path for our 'home'
app.get('/', (req,res) =>{
  //do some sql stuff work with data 
  res.json({greeting: `welcome to the sticker place! go to /stickers to checkem out`})
})

app.get('/stickers', async(req, res) => {
  try {
    const data = await client.query(`
    SELECT
      stickers.id,
      stickers.name,
      stickers.category_id,
      categories.category_name,
      stickers.url,
      stickers.in_stock,
      stickers.price,
      stickers.inventory,
      stickers.label_type,
      stickers.width,
      stickers.height,
      stickers.shape,
      stickers.seller_id
    FROM stickers
    JOIN categories
    ON stickers.category_id = categories.id
    `);
    
    res.json(data.rows);
   
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/category', async(req, res) => {
  try {
    
    const data = await client.query('SELECT * from categories');
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/stickers/:id', async(req, res) => {
  try{
    const id = req.params.id;
    const data = await client.query(`
    SELECT
      stickers.id,
      stickers.name,
      stickers.category_id,
      stickers.url,
      stickers.in_stock,
      stickers.price,
      stickers.inventory,
      stickers.label_type,
      stickers.width,
      stickers.height,
      stickers.shape,
      stickers.seller_id
    FROM stickers
    JOIN categories
    ON stickers.category_id = categories.id
    WHERE stickers.id=$1`, [id]);
    
    res.json(data.rows);
  } catch (e){
    res.status(500).json({error: e.message});
  }
});

app.get('/categories', async(req,res) => {
  try{
    const data = await client.query(`
    SELECT * FROM categories`);

    res.json(data.rows);
  } catch(e) {
    res.status(500).json({error: e.message});
  }
})

app.get('/categories/:id', async(req,res) => {
  try{
    const id = req.params.id;
    const data = await client.query(`
    SELECT * FROM categories WHERE categories.id = $1`, [id]);

    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({error: e.message});
  }
})


app.post('/stickers', async (req, res) => {
  try{
    const data = await client.query(`INSERT INTO stickers
    (
      name,
      url,
      in_stock,
      price,
      inventory,
      label_type,
      width,
      height,
      shape,
      category_id,
      seller_id
      ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *
    `, 
    [
      req.body.name,
      req.body.url,
      req.body.in_stock,
      req.body.price,
      req.body.inventory,
      req.body.label_type,
      req.body.width,
      req.body.height,
      req.body.shape,
      req.body.category_id,
      req.body.seller_id
    ]);
    res.json(data.rows[0]);
  }catch(e){
    res.status(500).json({error: e.message});
  }
});

app.put('/stickers/:id', async (req, res) => {
  try{
    const id = req.params.id;
    
    const data = await client.query(`
    UPDATE stickers 
    SET 
    name = $1, 
    category_id = $2, 
    url = $3, 
    in_stock = $4,
    price = $5, 
    inventory = $6,
    label_type = $7,
    width = $8,
    height = $9,
    shape = $10,
    seller_id = $11
    WHERE id=$12
    RETURNING *;
    `, [req.body.name,
      req.body.category_id,
      req.body.url,
      req.body.in_stock, 
      req.body.price, 
      req.body.inventory, 
      req.body.label_type,
      req.body.width,
      req.body.height,
      req.body.shape,
      req.body.seller_id, id]);
    console.log(req.body);
    res.json(data.rows[0]);
  }catch(e){
    res.status(500).json({error: e.message});
  }
});

app.delete('/stickers/:id', async (req, res) => {
  try{
    const id = req.params.id;
    const data = await client.query(`
      DELETE FROM stickers 
      WHERE id=$1
      RETURNING *`, [id]);
    
    res.json(data.rows[0]);
  }catch(e){
    res.status(500).json({error: e.message});
  }
});

app.use(require('./middleware/error'));

module.exports = app;
