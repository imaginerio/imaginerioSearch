/* eslint-disable no-param-reassign */
const mappings = require('../config/mappings');

module.exports.mapProperties = ({ properties, type }) => {
  if (process.env.MAPPING && mappings[process.env.MAPPING][type]) {
    const map = mappings[process.env.MAPPING][type];
    if (map) {
      map.forEach(({ db, remote }) => {
        if (Array.isArray(remote)) {
          remote.some(r => {
            properties[db] = properties[r];
            return properties[r];
          });
        } else {
          properties[db] = properties[remote];
        }
      });
    }
  }
  return properties;
};
