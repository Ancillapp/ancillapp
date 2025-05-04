import { defineString } from 'firebase-functions/params';
import webPush from 'web-push';
import { onInit } from 'firebase-functions/v2/core';

const subject = defineString('WEB_PUSH_SUBJECT');
const publickey = defineString('WEB_PUSH_PUBLIC_KEY');
const privatekey = defineString('WEB_PUSH_PRIVATE_KEY');

onInit(() => {
  webPush.setVapidDetails(
    `mailto:${subject.value()}`,
    publickey.value(),
    privatekey.value(),
  );
});

export const sendNotification = (
  ...args: Parameters<(typeof webPush)['sendNotification']>
) => webPush.sendNotification(...args);
