import * as functions from 'firebase-functions';
import { setVapidDetails, sendNotification } from 'web-push';

const { subject, publickey, privatekey } = functions.config().webpush;

setVapidDetails(`mailto:${subject}`, publickey, privatekey);

export { sendNotification };
