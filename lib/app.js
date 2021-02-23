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
    
    const data = await client.query('SELECT * from stickers');
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});


app.get('/stickers/:id', async(req, res) => {
  try {
    const id = req.params.id;

    const data = await client.query(`SELECT * from stickers WHERE id=$1`, [id]);
    
    res.json(data.rows[0]);
  } catch(e) {
    console.log(e.message);
    res.status(500).json({ error: e.message });
  }
});

app.post('/stickers', async (req, res) => {
  try{
    const data = await client.query(`INSERT INTO stickers
    (name,category,url,in_stock,price,inventory,label_type,width,height,shape,seller_id) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *
    `, [req.body.name, req.body.category, req.body.url, req.body.in_stock, req.body.price, req.body.inventory, req.body.label_type, req.body.width, req.body.height, req.body.shape, req.body.seller_id]);
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
    SET in_stock=$1, inventory=$2
    WHERE id=$3
    RETURNING *
    `, [req.body.in_stock, req.body.inventory, id]);
    
    res.json(data.rows[0]);
  }catch(e){
    res.status(500).json({error: e.message});
  }
});

app.use(require('./middleware/error'));

module.exports = app;
