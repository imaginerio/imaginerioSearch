/* eslint-disable no-param-reassign */
const mappings = require('../config/mappings');

module.exports.mapProperties = ({ properties, type }) => {
  if (process.env.MAPPING && mappings[process.env.MAPPING][type]) {
    const map = mappings[process.env.MAPPING][type];
    if (map) {
      map.forEach(({ db, remote }) => {
        properties[db] = properties[remote];
      });
    }
  }
  return properties;
};
