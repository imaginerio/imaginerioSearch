const supertest = require('supertest');
const { pick } = require('lodash');
const { sequelize, Layer, Feature } = require('../../models');
const app = require('../../server');

const LAYER_NAME = 'feature-test';
const FEATURE_IDS = ['feature.test.1', 'feature.test.2'];

// Layer.name is unique and the feature ids are fixed, so anything a previous
// crashed run left behind makes the inserts below fail -- and a beforeAll that
// throws skips this suite's cleanup, so a single bad run used to poison every
// later one until the database was rebuilt by hand. Purge on the way in as well
// as on the way out, keyed on those fixed values rather than on ids captured
// during setup, so it still works when setup never completed.
const removeFixtures = async () => {
  await Feature.destroy({ where: { id: FEATURE_IDS } });
  await Layer.destroy({ where: { name: LAYER_NAME } });
};

describe('test feature API route', () => {
  let layer;
  let features;

  beforeAll(async () => {
    await removeFixtures();
    layer = await Layer.create({
      name: LAYER_NAME,
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
        id: FEATURE_IDS[0],
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
        id: FEATURE_IDS[1],
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
    const response = await supertest(app).get(`/feature/${dataValues.id}`).expect(400);

    expect(response.status).toEqual(400);
  });

  // Remove this suite's fixtures (children first for FK safety), then close the DB.
  afterAll(async () => {
    await removeFixtures();
    await sequelize.close();
  });
});
