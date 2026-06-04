const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/db');

describe('Destination Discovery API (FE-301) - Test Suite', () => {

  beforeAll(async () => {
    await db.migrate.latest();
    // Seed static destinations data
    await db('destinations').insert([
      {
        id: 'f3b07384-d113-4956-a511-2d480574719e',
        name: 'Kyoto, Japan',
        description: 'Historic temples and gardens.',
        average_daily_cost_usd: 120.00,
        best_months: JSON.stringify(["April", "May", "October", "November"]),
        tags: JSON.stringify(["culture", "history"])
      }
    ]);
  });

  afterAll(async () => {
    await db.destroy();
  });

  test('TC-BE-301.1: Functional & Public - Public read-only queries allowed (AC-301.2)', async () => {
    // Priority: High
    // Requirement Mapping: FR-3.1
    // Preconditions: No auth headers provided
    const res = await request(app)
      .get('/api/destinations?query=Kyoto');

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].name).toEqual('Kyoto, Japan');
  });

  test('TC-BE-301.2: Security - Write operations restricted (AC-301.1)', async () => {
    // Priority: High
    // Requirement Mapping: FR-3.1
    // Preconditions: Try to create a destination card without admin rights
    const res = await request(app)
      .post('/api/destinations')
      .send({
        name: 'Fake City',
        average_daily_cost_usd: 500.00
      });

    // Expected Result: Forbidden/Unauthorized status (only GET is public)
    expect(res.statusCode).toEqual(401);
  });
});
