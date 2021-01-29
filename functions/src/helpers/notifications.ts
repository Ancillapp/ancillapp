import * as functions from 'firebase-functions';
import webPush from 'web-push';

const { subject, publickey, privatekey } = functions.config().webpush;

webPush.setVapidDetails(`mailto:${subject}`, publickey, privatekey);

export const sendNotification = (
  ...args: Parameters<typeof webPush['sendNotification']>
) => webPush.sendNotification(...args);
