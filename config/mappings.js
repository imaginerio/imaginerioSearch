module.exports = {
  highways: {
    document: [
      { db: 'ssid', remote: 'image_id' },
      { db: 'artstor', remote: 'artstor_id' },
    ],
    feature: [{ db: 'namealt', remote: 'nameshort' }],
  },
  rio: {
    document: [
      { db: 'ssid', remote: ['notes', 'ss_id'] },
      { db: 'artstor', remote: 'ssc_id' },
    ],
    feature: [{ db: 'namealt', remote: 'nameshort' }],
  },
};
