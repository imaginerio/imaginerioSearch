const supertest = require('supertest');
const { sequelize } = require('../../models');
const app = require('../../server');

describe('thematic route validation', () => {
  it('GET /thematic returns 200 with an array', async () => {
    const res = await supertest(app).get('/thematic').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /thematic?year=invalid returns 400', async () => {
    const res = await supertest(app).get('/thematic?year=notanumber');
    expect(res.status).toBe(400);
  });

  it('GET /thematic/:id with unknown id returns 404', async () => {
    const res = await supertest(app).get('/thematic/999999');
    expect(res.status).toBe(404);
  });

  afterAll(async () => {
    await sequelize.close();
  });
});
