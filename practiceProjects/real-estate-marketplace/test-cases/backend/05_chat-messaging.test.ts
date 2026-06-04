import request from 'supertest';
import app from '../../src/app';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Client from 'socket.io-client';
import pool from '../../src/db';

/**
 * FEATURE ID: FT-5.1 (Monitored Chat System)
 * MAPPED REQUIREMENTS: FR-501, BRL-004, SEC-501
 * ACCEPTANCE CRITERIA: AC-501, AC-502
 */

describe('FT-5.1: Monitored Chat System Integration tests', () => {

  let ioServer: Server;
  let socketClient: any;
  let serverInstance: any;
  let buyerToken: string;

  beforeAll((done) => {
    buyerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzcl9idXllcjEyMyIsInJvbGUiOiJCdXllciJ9...';
    
    serverInstance = createServer(app);
    ioServer = new Server(serverInstance);
    
    serverInstance.listen(() => {
      const port = (serverInstance.address() as any).port;
      
      // Connect client socket mimicking authenticated setup
      socketClient = Client(`http://localhost:${port}`, {
        extraHeaders: {
          Authorization: `Bearer ${buyerToken}`
        }
      });
      
      socketClient.on('connect', done);
    });
  });

  afterAll(async () => {
    socketClient.disconnect();
    ioServer.close();
    serverInstance.close();
    await pool.end();
  });

  /**
   * TC ID: TC-BE-501
   * Type: WebSocket Connection & Auth validation
   * Preconditions: Socket client initiates handshake
   * Priority: Critical
   */
  it('TC-BE-501: Socket server gateway should validate token and allow user to join rooms', (done) => {
    // Client joins inquiry room
    socketClient.emit('join_room', { inquiryId: 'inq_123' });
    
    socketClient.on('room_joined', (data: any) => {
      expect(data.inquiryId).toBe('inq_123');
      done();
    });
  });

  /**
   * TC ID: TC-BE-502
   * Type: API & Email Cron Job triggers
   * Preconditions: Recipient socket state is marked disconnected/inactive
   * Priority: High
   */
  it('TC-BE-502: POST /api/v1/inquiries should save message and enqueue offline notifications alerts', async () => {
    // Ensure agent is offline in mock users state database
    await pool.query('UPDATE users SET is_online = false WHERE id = \'usr_agent123\'');

    const res = await request(app)
      .post('/api/v1/inquiries')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        propertyId: 'prop_test123',
        initialMessage: 'Offline alert notification check'
      });

    expect(res.status).toBe(210); // Matches created thread indicator
    expect(res.body.success).toBe(true);

    // Verify system writes mail event record inside db queues
    const dbMailQueue = await pool.query('SELECT * FROM email_notification_queue WHERE target_user_id = $1 AND sent = false', ['usr_agent123']);
    expect(dbMailQueue.rows.length).toBeGreaterThan(0);
    expect(dbMailQueue.rows[0].message_body).toContain('Offline alert notification check');
  });

});
