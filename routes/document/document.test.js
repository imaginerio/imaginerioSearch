const supertest = require('supertest');
const { faker } = require('@faker-js/faker');
const { v4: uuidv4 } = require('uuid');
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
      id: uuidv4(),
      ssid: uuidv4(),
      title: faker.lorem.words(3),
      creator: `${faker.person.firstName()} ${faker.person.lastName()}`,
      firstyear: 1900,
      lastyear: 2000,
      VisualId: visual.id,
      latitude: faker.location.latitude(),
      longitude: faker.location.longitude(),
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

  // Remove this suite's fixtures (children first for FK safety), then close the DB.
  afterAll(async () => {
    await document.destroy();
    await visual.destroy();
    await sequelize.close();
  });
});
