const supertest = require('supertest');
const { sequelize } = require('../../models');
const app = require('../../server');

describe('search route validation', () => {
  it('GET /search without params returns 400 with zod issues', async () => {
    const res = await supertest(app).get('/search').expect(400);
    expect(res.body.error).toBe('Invalid request');
    expect(Array.isArray(res.body.issues)).toBe(true);
    const fields = res.body.issues.map(i => i.path.join('.'));
    expect(fields).toEqual(expect.arrayContaining(['query.text', 'query.year']));
  });

  it('GET /search with non-numeric year returns 400', async () => {
    const res = await supertest(app).get('/search?text=foo&year=notanumber').expect(400);
    expect(res.body.error).toBe('Invalid request');
  });

  it('GET /search with valid params returns 200 (may be empty)', async () => {
    const res = await supertest(app).get('/search?text=zzz_no_match_zzz&year=1900').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  afterAll(async () => {
    await sequelize.close();
  });
});
