const client = require('../lib/client');
const { getEmoji } = require('../lib/emoji.js');

// async/await needs to run in a function
run();

async function run() {

  try {
    // initiate connecting to db
    await client.connect();

    // run a query to create tables
    await client.query(`
                CREATE TABLE users (
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(256) NOT NULL,
                    hash VARCHAR(512) NOT NULL
                ); 
                CREATE TABLE categories(
                  id SERIAL PRIMARY KEY,
                  category_name VARCHAR(512) NOT NULL
                );          
                CREATE TABLE stickers (
                    id SERIAL PRIMARY KEY NOT NULL,
                    name VARCHAR(512) NOT NULL,
                    category_id INTEGER NOT NULL REFERENCES categories(id),
                    url VARCHAR(512) NOT NULL,
                    in_stock BOOLEAN NOT NULL,
                    price INTEGER NOT NULL,
                    inventory INTEGER NOT NULL,
                    label_type VARCHAR(512) NOT NULL,
                    width INTEGER NOT NULL,
                    height INTEGER NOT NULL,
                    shape VARCHAR(512),
                    seller_id INTEGER NOT NULL REFERENCES users(id)
            );
        `);

    console.log('create tables complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    // problem? let's see the error...
    console.log(err);
  }
  finally {
    // success or failure, need to close the db connection
    client.end();
  }

}
