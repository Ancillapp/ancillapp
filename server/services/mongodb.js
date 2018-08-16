const { MongoClient } = require('mongodb');

const dbPromise =
  MongoClient
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
    }).then((client) => client.db(process.env.MONGO_DB));

module.exports = dbPromise;
