const supertest = require('supertest');
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
      id: 'layers.test.1',
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
    expect(response.body).toContainEqual({
      ...pick(layer.dataValues, 'id', 'name', 'title'),
      types: [feature.type],
    });
  });

  // After all tersts have finished, close the DB connection
  afterAll(async () => {
    await sequelize.close();
  });
});
