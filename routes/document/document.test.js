const supertest = require('supertest');
const faker = require('faker');
const { omit } = require('lodash');
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
      id: faker.datatype.uuid(),
      ssid: `SSID${faker.datatype.number(999999)}`,
      title: faker.lorem.words(3),
      creator: `${faker.name.firstName()} ${faker.name.lastName()}`,
      firstyear: 1900,
      lastyear: 2000,
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

  it('should succeed when accessing a valid document', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app).get(`/document/${document.ssid}`).expect(200);

    expect(response.body).toMatchObject({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            ...omit(document.dataValues, 'Visual', 'VisualId', 'createdAt', 'updatedAt', 'geom'),
            type: visual.title,
          },
          geometry: document.geom,
        },
      ],
    });
  });

  it('should fail when accessing a route without an ID', async () => {
    const response = await supertest(app).get('/document').expect(404);

    expect(response.status).toEqual(404);
  });

  // After all tersts have finished, close the DB connection
  afterAll(async () => {
    await sequelize.close();
  });
});
