const supertest = require('supertest');
const { sequelize, Folder, Layer, Type, Feature } = require('../../models');
const app = require('../../server');

describe('test layers API route', () => {
  let folder;
  let layer;
  let type;

  beforeAll(async () => {
    folder = await Folder.create({
      name: 'Test Folder',
      ordering: 1,
    });
    layer = await Layer.create({
      name: 'layers-test',
      titleEn: 'Test Layer',
      titlePt: 'Camada de Teste',
      FolderId: folder.id,
    });
    type = await Type.create({
      key: 'layers-test-type',
      titleEn: 'Test Line',
      titlePt: 'Linha de Teste',
      LayerId: layer.id,
    });
    await Feature.create({
      id: 'layers.test.1',
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

  // Remove this suite's fixtures (children first for FK safety), then close the DB.
  afterAll(async () => {
    await Feature.destroy({ where: { LayerId: layer.id } });
    await Type.destroy({ where: { LayerId: layer.id } });
    await layer.destroy();
    await folder.destroy();
    await sequelize.close();
  });
});
