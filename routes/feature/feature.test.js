const supertest = require('supertest');
const { pick } = require('lodash');
const { sequelize, Layer, Feature } = require('../../models');
const app = require('../../server');

describe('test feature API route', () => {
  let layer;
  let features;

  beforeAll(async () => {
    layer = await Layer.create({
      name: 'test',
      title: 'Test Layer',
    });
    const attributes = {
      name: 'Feature',
      firstyear: 1900,
      lastyear: 2000,
      LayerId: layer.id,
      type: 'Test Line',
    };
    features = [
      await Feature.create({
        ...attributes,
        id: 'feature.test.1',
        geom: {
          type: 'LineString',
          coordinates: [
            [-43.207, -22.91],
            [-43.197, -22.907],
          ],
        },
      }),
      await Feature.create({
        ...attributes,
        id: 'feature.test.2',
        geom: {
          type: 'LineString',
          coordinates: [
            [-43.197, -22.907],
            [-43.188, -22.904],
          ],
        },
      }),
    ];
  });

  it('should return a valid feature with combined geography', async () => {
    const [{ dataValues }] = features;
    const response = await supertest(app).get(`/feature/${dataValues.id}?year=1950`).expect(200);
    expect(response.body).toMatchObject({
      type: 'Feature',
      geometry: {
        type: 'MultiLineString',
        coordinates: [
          [
            [-43.207, -22.91],
            [-43.197, -22.907],
          ],
          [
            [-43.197, -22.907],
            [-43.188, -22.904],
          ],
        ],
      },
      properties: pick(dataValues, 'id', 'name', 'type'),
    });
  });

  it('should fail when accessing a route without a year', async () => {
    const [{ dataValues }] = features;
    const response = await supertest(app).get(`/feature/${dataValues.id}`).expect(500);

    expect(response.status).toEqual(500);
  });

  afterAll(async () => {
    await sequelize.close();
  });
});
