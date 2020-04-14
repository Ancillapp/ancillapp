import * as functions from 'firebase-functions';
import { MongoClient } from 'mongodb';

const uri = functions.config().mongodb.uri;

export const mongoClient = new MongoClient(uri, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
}).connect();
