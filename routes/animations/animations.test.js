const supertest = require('supertest');
const { sequelize, Animation } = require('../../models');
const app = require('../../server');

const ANIMATION_NAME = 'test-animation';

// Animation.name is unique, so a leftover from a crashed run makes the insert
// below fail -- and a beforeAll that throws skips this suite's cleanup, so one
// bad run used to poison every later one. Purge on the way in as well as out,
// keyed on the fixed name rather than an id captured during setup.
const removeFixtures = async () => {
  await Animation.destroy({ where: { name: ANIMATION_NAME } });
};

describe('animations route', () => {
  let animation;

  beforeAll(async () => {
    await removeFixtures();
    animation = await Animation.create({
      name: ANIMATION_NAME,
      title: 'Test Animation',
      url: 'https://example.com/animations/test',
      minzoom: 10,
      maxzoom: 18,
      firstyear: 1900,
      lastyear: 2000,
    });
  });

  it('GET /animations returns the animation', async () => {
    const res = await supertest(app).get('/animations').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    const ours = res.body.find(a => a.id === animation.id);
    expect(ours).toMatchObject({ name: 'test-animation', title: 'Test Animation' });
    expect(Array.isArray(ours.frames)).toBe(true);
  });

  it('GET /animations?year=invalid returns 400', async () => {
    const res = await supertest(app).get('/animations?year=notanumber');
    expect(res.status).toBe(400);
  });

  it('GET /animations?year=1950 includes the in-range animation', async () => {
    const res = await supertest(app).get('/animations?year=1950').expect(200);
    expect(res.body.find(a => a.id === animation.id)).toBeDefined();
  });

  afterAll(async () => {
    await removeFixtures();
    await sequelize.close();
  });
});
