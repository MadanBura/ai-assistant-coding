const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/db');

describe('Budget & Expense Tracker API (FE-401) - Test Suite', () => {
  let ownerToken, tripId, userB_id;

  beforeAll(async () => {
    await db.migrate.latest();
    const ownerRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'owner@example.com', password: 'SecurePassword123!' });
    ownerToken = ownerRes.body.token;
    
    userB_id = '8c5a98d3-7ccb-44e2-a1b2-c3d4e5f6a7b8';

    const tripRes = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        title: 'Budget Test Trip',
        destination: 'Vienna, Austria',
        start_date: '2026-12-01',
        end_date: '2026-12-05',
        budget_limit: 1000.00
      });
    tripId = tripRes.body.tripId;
  });

  afterAll(async () => {
    await db.destroy();
  });

  test('TC-BE-401.1: Functional & Database - Add Expense Transaction with Splits (AC-401.1)', async () => {
    // Priority: High
    // Requirement Mapping: FR-4.1
    // Steps: Execute post calling budget split endpoint, check response math
    const res = await request(app)
      .post(`/api/trips/${tripId}/expenses`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        title: 'Dinner splitting test',
        amount: 10.00,
        currency: 'USD',
        payer_id: 'd3b07384-d113-4956-a511-2d480574719d', // Owner ID
        category: 'food',
        spent_at: '2026-12-02',
        splits: [
          { debtor_id: 'd3b07384-d113-4956-a511-2d480574719d', amount: 3.34 },
          { debtor_id: userB_id, amount: 6.66 } // Splits matching total $10.00
        ]
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('expenseId');

    // Database Verification: Check splits records exist in expense_splits table
    const splits = await db('expense_splits').where('expense_id', res.body.expenseId);
    expect(splits.length).toEqual(2);
    
    // Check penny sum matching total expense exactly
    const splitSum = splits.reduce((acc, row) => acc + parseFloat(row.amount), 0);
    expect(splitSum).toEqual(10.00);
  });

  test('TC-BE-401.2: Validation - Negative cost input blocks (AC-401.1)', async () => {
    // Priority: High
    // Requirement Mapping: FR-4.1
    const res = await request(app)
      .post(`/api/trips/${tripId}/expenses`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        title: 'Hacked ticket cost',
        amount: -5.00,
        currency: 'USD',
        payer_id: 'owner-id',
        category: 'tickets'
      });

    expect(res.statusCode).toEqual(400);
  });
});
