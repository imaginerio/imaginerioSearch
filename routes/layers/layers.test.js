const supertest = require('supertest');
const faker = require('faker');
const { pick } = require('lodash');
const { sequelize, Layer, Feature } = require('../../models');
const app = require('../../server');

describe('test layers API route', () => {
  let layer;
  let feature;
  beforeAll(async () => {
    layer = await Layer.create({
      name: 'test',
      title: 'Test Layer',
    });
    feature = await Feature.create({
      id: faker.datatype.uuid(),
      name: 'Feature 1',
      firstyear: 1900,
      lastyear: 2000,
      LayerId: layer.id,
      type: 'Test Line',
      geom: {
        type: 'LineString',
        coordinates: [
          [-43.207, -22.91],
          [-43.197, -22.907],
        ],
      },
    });
  });

  it('should return layers and types for a given year', async () => {
    const response = await supertest(app).get('/layers?year=1950').expect(200);
    expect(response.body).toMatchObject([
      { ...pick(layer.dataValues, 'id', 'name', 'title'), types: [feature.type] },
    ]);
  });

  it('should fail when accessing a route without a year', async () => {
    const response = await supertest(app).get('/layers').expect(404);

    expect(response.status).toEqual(404);
  });

  // After all tersts have finished, close the DB connection
  afterAll(async () => {
    await Layer.destroy({ where: {}, truncate: true, cascade: true });
    await Feature.destroy({ where: {}, truncate: true, cascade: true });

    await sequelize.close();
  });
});
