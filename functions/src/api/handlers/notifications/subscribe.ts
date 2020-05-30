import * as functions from 'firebase-functions';
import { mongoDb } from '../../../helpers/mongo';
import { sendNotification } from '../../../helpers/notifications';

export const subscribeForNotifications = functions.https.onRequest(
  async ({ method, body }, res) => {
    if (method !== 'POST') {
      res.status(405).send();
      return;
    }

    if (
      !body ||
      !body.endpoint ||
      !body.keys ||
      !body.keys.p256dh ||
      !body.keys.auth ||
      !body.keys.p256dh
    ) {
      res.status(400).send();
      return;
    }

    const db = await mongoDb;

    // We want to make sure we only add the necessary data to the DB
    const {
      endpoint,
      keys: { auth, p256dh },
    } = body;

    const subscription = {
      endpoint,
      keys: { auth, p256dh },
    };

    await db.collection('subscriptions').insertOne(subscription);

    await sendNotification(
      subscription,
      JSON.stringify({
        title: {
          it: 'Fatto!',
          en: 'Done!',
          de: 'Getan!',
          pt: 'Feito!',
        },
        body: {
          it: 'Sei stato registrato con successo!',
          en: 'You have been successfully registered!',
          de: 'Sie wurden erfolgreich registriert!',
          pt: 'Você foi registrado com sucesso!',
        },
      }),
    );

    res.status(204).send();
  },
);
