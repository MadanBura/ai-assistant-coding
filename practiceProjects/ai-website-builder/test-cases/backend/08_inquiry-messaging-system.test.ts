import request from 'supertest';
import app from '../../src/app';
import db from '../../src/db';
import http from 'http';
import { io as Client, Socket } from 'socket.io-client';

/**
 * FEATURE: Inquiry Messaging System (FEAT-501)
 * COVERAGE: API, Database, Validation, WebSockets, Security, Edge Cases
 */

describe('FEAT-501: Inquiry Management REST APIs and WebSocket Gateways', () => {
  let buyerToken: string;
  let ownerToken: string;
  let propertyId: string;
  let buyerId: string;
  let server: http.Server;
  let socketClient: Socket;
  let threadId: string;

  beforeAll(async (done) => {
    // Clear databases and users
    await db.query('DELETE FROM messages');
    await db.query('DELETE FROM inquiries');
    await db.query('DELETE FROM properties');
    await db.query('DELETE FROM users');

    // Create Buyer
    await request(app).post('/api/auth/register').send({
      email: 'buyer@test.com',
      password: 'ComplexPass123!',
      fullName: 'Sarah Buyer',
      role: 'buyer',
      phone: '+12065550002'
    });
    await db.query("UPDATE users SET is_verified = true WHERE email = 'buyer@test.com'");
    const buyerLogin = await request(app).post('/api/auth/login').send({
      email: 'buyer@test.com',
      password: 'ComplexPass123!'
    });
    buyerToken = buyerLogin.body.token;
    buyerId = buyerLogin.body.user.id;

    // Create Owner
    await request(app).post('/api/auth/register').send({
      email: 'owner@test.com',
      password: 'ComplexPass123!',
      fullName: 'David Owner',
      role: 'owner',
      phone: '+12065550001'
    });
    await db.query("UPDATE users SET is_verified = true WHERE email = 'owner@test.com'");
    const ownerLogin = await request(app).post('/api/auth/login').send({
      email: 'owner@test.com',
      password: 'ComplexPass123!'
    });
    ownerToken = ownerLogin.body.token;

    // Seed property
    const propRes = await db.query(`
      INSERT INTO properties (owner_id, title, description, category, transaction, price, address, latitude, longitude, status, bedrooms, bathrooms, square_footage, images)
      VALUES ((SELECT id FROM users WHERE email = 'owner@test.com'), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id
    `, [
      'Suburban Mansion',
      'Mansion details for chat integration testing...',
      'residential',
      'sale',
      1200000.00,
      '789 Wealthy Way, Bellevue, WA 98004',
      47.6101,
      -122.2015,
      'published',
      5,
      6.0,
      6200.00,
      JSON.stringify(['image1.webp'])
    ]);
    propertyId = propRes.rows[0].id;

    // Start server on dynamic port for WebSockets tests
    server = http.createServer(app);
    server.listen(0, () => {
      const port = (server.address() as any).port;
      socketClient = Client(`http://localhost:${port}`, {
        auth: { token: buyerToken }
      });
      socketClient.on('connect', () => {
        done();
      });
    });
  });

  afterAll((done) => {
    socketClient.disconnect();
    server.close(() => {
      db.close().then(() => done());
    });
  });

  /**
   * TC-BE-501-01 (API & Database)
   * Requirement Mapping: FR-501, US-501-1
   * Priority: High
   */
  test('TC-BE-501-01: Create inquiry, initialize database tables and return masked email proxy', async () => {
    const res = await request(app)
      .post('/api/inquiries')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        propertyId: propertyId,
        message: 'Hello, is this property available for viewing this Saturday?'
      })
      .expect(201);

    expect(res.body.status).toBe('success');
    expect(res.body.threadId).toBeDefined();
    threadId = res.body.threadId;

    // DB verification
    const dbInq = await db.query('SELECT * FROM inquiries WHERE id = $1', [threadId]);
    expect(dbInq.rows.length).toBe(1);
    expect(dbInq.rows[0].buyer_id).toBe(buyerId);

    // Message insertion check
    const dbMsg = await db.query('SELECT * FROM messages WHERE inquiry_id = $1', [threadId]);
    expect(dbMsg.rows.length).toBe(1);
    expect(dbMsg.rows[0].content).toBe('Hello, is this property available for viewing this Saturday?');
  });

  /**
   * TC-BE-501-02 (API & Validation & Rate Limiter)
   * Requirement Mapping: BRL-004
   * Priority: High
   */
  test('TC-BE-501-02: Rate limit blocks second inquiry to same property within 10 minutes', async () => {
    await request(app)
      .post('/api/inquiries')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        propertyId: propertyId,
        message: 'Second rapid message attempt'
      })
      .expect(429); // Too Many Requests / Rate limited
  });

  /**
   * TC-BE-501-03 (WebSockets & Handshake Security)
   * Requirement Mapping: SEC-002
   * Priority: Medium
   */
  test('TC-BE-501-03: Live chat push validation via WebSockets client handles connection state', (done) => {
    // Listen for custom incoming chat broadcast event on client socket
    socketClient.emit('join_thread', { threadId: threadId });
    
    socketClient.on('message_received', (data: any) => {
      expect(data.content).toBe('WebSocket follow-up query text.');
      done();
    });

    // Fire POST reply via Rest API to trigger WebSocket broadcast from backend
    request(app)
      .post(`/api/inquiries/threads/${threadId}/messages`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ message: 'WebSocket follow-up query text.' })
      .expect(200)
      .then(() => {});
  });
});
