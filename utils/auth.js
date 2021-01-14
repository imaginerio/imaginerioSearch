/* eslint-disable camelcase */
require('dotenv');
const axios = require('axios');
const https = require('https');

exports.authenticate = () => {
  const { CLIENT_ID, USERNAME, PASSWORD } = process.env;
  const httpsAgent = new https.Agent({ rejectUnauthorized: false });
  return axios
    .get(
      `https://enterprise.spatialstudieslab.org/portal/sharing/rest/oauth2/authorize/?client_id=${CLIENT_ID}&response_type=code&expiration=3600&redirect_uri=urn:ietf:wg:oauth:2.0:oob`,
      { httpsAgent }
    )
    .then(({ data }) => {
      const oauth = data.replace(/^.*"oauth_state":"(.*?)".*$/gs, '$1');
      return axios
        .post(
          `https://enterprise.spatialstudieslab.org/portal/sharing/oauth2/signin?oauth_state=${oauth}&authorize=true&username=${USERNAME}&password=${PASSWORD}`,
          {},
          { httpsAgent }
        )
        .then(res => {
          const code = res.data.replace(/^.*id="code" value="(.*?)".*$/gs, '$1');
          return axios
            .post(
              `https://enterprise.spatialstudieslab.org/portal/sharing/oauth2/token?client_id=${CLIENT_ID}&code=${code}&redirect_uri=urn:ietf:wg:oauth:2.0:oob&grant_type=authorization_code`,
              {},
              { httpsAgent }
            )
            .then(res2 => {
              const { access_token } = res2.data;
              return access_token;
            });
        });
    });
};
