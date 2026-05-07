const axios = require('axios');

const PORTAL = 'https://gis.spatialstudieslab.org/portal/sharing';

const enc = encodeURIComponent;

const authenticate = async () => {
  const { CLIENT_ID, USERNAME, PASSWORD } = process.env;
  if (!CLIENT_ID || !USERNAME || !PASSWORD) {
    throw new Error('CLIENT_ID, USERNAME, and PASSWORD env vars are required');
  }

  const authorizeUrl =
    `${PORTAL}/rest/oauth2/authorize/` +
    `?client_id=${enc(CLIENT_ID)}` +
    `&response_type=code` +
    `&expiration=3600` +
    `&redirect_uri=urn:ietf:wg:oauth:2.0:oob`;
  const { data: authorizePage } = await axios.get(authorizeUrl);
  const oauthState = authorizePage.replace(/^.*"oauth_state":"(.*?)".*$/gs, '$1');

  const signinUrl =
    `${PORTAL}/oauth2/signin` +
    `?oauth_state=${enc(oauthState)}` +
    `&authorize=true` +
    `&username=${enc(USERNAME)}` +
    `&password=${enc(PASSWORD)}`;
  const { data: signinPage } = await axios.post(signinUrl);
  const code = signinPage.replace(/^.*id="code" value="(.*?)".*$/gs, '$1');

  const tokenUrl =
    `${PORTAL}/oauth2/token` +
    `?client_id=${enc(CLIENT_ID)}` +
    `&code=${enc(code)}` +
    `&redirect_uri=urn:ietf:wg:oauth:2.0:oob` +
    `&grant_type=authorization_code`;
  const { data: tokenResponse } = await axios.post(tokenUrl);
  return tokenResponse.access_token;
};

exports.authenticate = authenticate;
