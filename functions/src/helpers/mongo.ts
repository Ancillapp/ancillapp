import * as functions from 'firebase-functions';
import { MongoClient } from 'mongodb';

const uri = functions.config().mongodb.uri;

export const mongoDb = new MongoClient(uri, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
})
  .connect()
  .then((client) => client.db('Main'));
