const supertest = require('supertest');

// The limiter reads its config once, at require time, and each app instance
// gets its own in-memory bucket store. So every case sets env vars, then loads
// a fresh server in an isolated module registry — no bucket bleeds across cases.
const loadApp = () => {
  let app;
  jest.isolateModules(() => {
    // eslint-disable-next-line global-require
    app = require('../server');
  });
  return app;
};

const hit = (app, token) => {
  const req = supertest(app).get('/health');
  return token ? req.set('x-ratelimit-bypass', token) : req;
};

describe('rate limiting', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV, RATE_LIMIT_PER_MIN: '2' };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('returns 429 once the per-minute limit is exceeded', async () => {
    delete process.env.RATE_LIMIT_BYPASS_TOKEN;
    const app = loadApp();

    expect((await hit(app)).status).toBe(200);
    expect((await hit(app)).status).toBe(200);
    expect((await hit(app)).status).toBe(429);
  });

  it('never counts requests carrying the bypass token', async () => {
    process.env.RATE_LIMIT_BYPASS_TOKEN = 'build-secret';
    const app = loadApp();

    const statuses = [];
    for (let i = 0; i < 5; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      statuses.push((await hit(app, 'build-secret')).status);
    }
    // Well past the limit of 2, every request bypassed.
    expect(statuses).toEqual([200, 200, 200, 200, 200]);
  });

  it('still limits requests presenting the wrong token', async () => {
    process.env.RATE_LIMIT_BYPASS_TOKEN = 'build-secret';
    const app = loadApp();

    expect((await hit(app, 'nope')).status).toBe(200);
    expect((await hit(app, 'nope')).status).toBe(200);
    expect((await hit(app, 'nope')).status).toBe(429);
  });
});
