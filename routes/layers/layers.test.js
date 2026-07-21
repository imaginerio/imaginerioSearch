const supertest = require('supertest');
const { sequelize, Folder, Layer, Type, Feature } = require('../../models');
const app = require('../../server');

const FOLDER_NAME = 'Test Folder';
const LAYER_NAME = 'layers-test';
const TYPE_KEY = 'layers-test-type';
const FEATURE_ID = 'layers.test.1';

// Layer.name and Type.key are unique and the feature id is fixed, so leftovers
// from a crashed run make the inserts below fail -- and a beforeAll that throws
// skips this suite's cleanup, so one bad run used to poison every later one.
// Purge on the way in as well as on the way out, keyed on those fixed values
// rather than on ids captured during setup. Children first, for FK safety.
const removeFixtures = async () => {
  await Feature.destroy({ where: { id: FEATURE_ID } });
  await Type.destroy({ where: { key: TYPE_KEY } });
  await Layer.destroy({ where: { name: LAYER_NAME } });
  await Folder.destroy({ where: { name: FOLDER_NAME } });
};

describe('test layers API route', () => {
  let folder;
  let layer;
  let type;

  beforeAll(async () => {
    await removeFixtures();
    folder = await Folder.create({
      name: FOLDER_NAME,
      ordering: 1,
    });
    layer = await Layer.create({
      name: LAYER_NAME,
      titleEn: 'Test Layer',
      titlePt: 'Camada de Teste',
      FolderId: folder.id,
    });
    type = await Type.create({
      key: TYPE_KEY,
      titleEn: 'Test Line',
      titlePt: 'Linha de Teste',
      LayerId: layer.id,
    });
    await Feature.create({
      id: FEATURE_ID,
      name: 'Feature 1',
      firstyear: 1900,
      lastyear: 2000,
      LayerId: layer.id,
      TypeId: type.id,
      geom: {
        type: 'LineString',
        coordinates: [
          [-43.207, -22.91],
          [-43.197, -22.907],
        ],
      },
    });
  });

  it('should return folder-grouped layers and their types for a given year', async () => {
    const response = await supertest(app).get('/layers?year=1950').expect(200);
    expect(response.body).toContainEqual({
      id: folder.id,
      name: folder.name,
      layers: [
        {
          id: layer.id,
          name: layer.name,
          title: layer.titleEn,
          types: [{ title: type.titleEn, name: type.titleEn }],
        },
      ],
    });
  });

  it('should omit layers whose features fall outside the requested year', async () => {
    const response = await supertest(app).get('/layers?year=1850').expect(200);
    expect(response.body).toEqual([]);
  });

  // Remove this suite's fixtures, then close the DB.
  afterAll(async () => {
    await removeFixtures();
    await sequelize.close();
  });
});
