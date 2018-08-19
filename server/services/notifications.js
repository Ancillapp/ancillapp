const webPush = require('web-push');

webPush.setVapidDetails(
  `mailto:${process.env.WEBPUSH_SUBJECT}`,
  process.env.WEBPUSH_PUBLIC_KEY,
  process.env.WEBPUSH_PRIVATE_KEY,
);

module.exports = webPush;
