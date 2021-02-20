const client = require('../lib/client');
// import our seed data:
const stickers = require('./stickers.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );
      
    const user = users[0].rows[0];

    await Promise.all(
      stickers.map(sticker => {
       
        return client.query(`
                    INSERT INTO stickers (name, category, url, in_stock, price, inventory, label_type, width, height, shape, seller_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);
                `,
        [sticker.name, sticker.category, sticker.url, sticker.in_stock, sticker.price, sticker.inventory, sticker.label_type, sticker.width, sticker.height, sticker.shape, user.id]);
      })
    );
    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
