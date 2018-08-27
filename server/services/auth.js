const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
let authorizedDomains = [];
if (process.env.GOOGLE_AUTH_DOMAINS) {
  try {
    authorizedDomains = JSON.parse(process.env.GOOGLE_AUTH_DOMAINS);
  } catch (e) {
    authorizedDomains = [process.env.GOOGLE_AUTH_DOMAINS];
  }
}

const authMiddleware = () => async (req, res, next) => {
  try {
    if (!req.header.authorization) {
      throw new Error();
    }
    const [, idToken] = /Bearer (.+)/g.exec(req.header.authorization);
    if (!idToken) {
      throw new Error();
    }
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!authorizedDomains.includes(payload.hd)) {
      throw new Error();
    }
    res.locals.user = payload;
    next();
  } catch (e) {
    res.status(403).json({
      status: 403,
      data: 'Forbidden',
    });
  }
};

module.exports = authMiddleware;
