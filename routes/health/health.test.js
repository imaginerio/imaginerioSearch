const supertest = require('supertest');
const { sequelize } = require('../../models');
const app = require('../../server');

describe('health routes', () => {
  it('GET /health returns 200 with uptime', async () => {
    const res = await supertest(app).get('/health').expect(200);
    expect(res.body).toMatchObject({ message: 'OK' });
    expect(typeof res.body.uptime).toBe('number');
    expect(typeof res.body.timestamp).toBe('number');
  });

  it('GET /ready returns 200 when DB reachable', async () => {
    const res = await supertest(app).get('/ready').expect(200);
    expect(res.body).toMatchObject({ ready: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });
});
