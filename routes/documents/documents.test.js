const supertest = require('supertest');
const faker = require('faker');
const { pick } = require('lodash');
const { sequelize, Visual, Document } = require('../../models');
const app = require('../../server');

describe('test document API route', () => {
  it('should succeed when given a year', async () => {
    await Visual.destroy({ where: {}, truncate: true, cascade: true });
    await Document.destroy({ where: {}, truncate: true });
    const visual = await Visual.create({
      name: 'test',
      title: 'Test Visual',
    });
    const document = await Document.create({
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
    // App is used with supertest to simulate server request
    const response = await supertest(app).get(`/documents?year=1950`).expect(200);

    expect(response.body).toMatchObject([
      {
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
          ]),
        ],
      },
    ]);
  });

  it('should fail when accessing a route without an ID', async () => {
    const response = await supertest(app).get('/documents').expect(404);

    expect(response.status).toEqual(404);
  });

  // After all tersts have finished, close the DB connection
  afterAll(async () => {
    await sequelize.close();
  });
});
