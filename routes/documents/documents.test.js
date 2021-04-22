const supertest = require('supertest');
const faker = require('faker');
const { v4: uuidv4 } = require('uuid');
const { pick } = require('lodash');
const { sequelize, Visual, Document } = require('../../models');
const app = require('../../server');

describe('test document API route', () => {
  let visual;
  let document;
  beforeAll(async () => {
    visual = await Visual.create({
      name: 'test',
      title: 'Test Visual',
    });

    document = await Document.create({
      id: uuidv4(),
      ssid: uuidv4(),
      title: faker.lorem.words(3),
      creator: `${faker.name.firstName()} ${faker.name.lastName()}`,
      firstyear: 1900,
      lastyear: 2000,
      thumbnail: faker.internet.url(),
      VisualId: visual.id,
      latitude: faker.datatype.float({ min: -90, max: 90 }),
      longitude: faker.datatype.float({ min: -180, max: 180 }),
      geom: {
        type: 'Polygon',
        coordinates: [
          [
            [-58, -31],
            [-47, -31],
            [-47, -24],
            [-58, -24],
            [-58, -31],
          ],
        ],
      },
    });
  });

  it('should succeed when given a year', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app).get(`/documents?year=1950`).expect(200);
    expect(response.body).toContainEqual({
      id: visual.id,
      title: 'Test Visual',
      Documents: [
        pick(document.dataValues, [
          'ssid',
          'title',
          'latitude',
          'longitude',
          'firstyear',
          'lastyear',
          'thumbnail',
        ]),
      ],
    });
  });

  // After all tersts have finished, close the DB connection
  afterAll(async () => {
    await sequelize.close();
  });
});
