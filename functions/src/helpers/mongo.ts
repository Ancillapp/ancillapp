import { defineString } from 'firebase-functions/params';
import { Db, MongoClient, ObjectId } from 'mongodb';
import { onInit } from 'firebase-functions/v2/core';

const uri = defineString('MONGODB_URI');
const db = defineString('MONGODB_NAME');

export { ObjectId };

export let mongoDb: Promise<Db>;
onInit(() => {
  mongoDb = new MongoClient(uri.value())
    .connect()
    .then((client) => client.db(db.value()));
});
