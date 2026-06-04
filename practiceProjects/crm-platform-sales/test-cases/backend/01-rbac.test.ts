import request from 'supertest';
import app from '../../src/app'; // Mocked reference to Express app container
import { DatabaseHelper } from '../../src/utils/db'; // Mock database helper for setup/teardown
import { RedisHelper } from '../../src/utils/redis'; // Mock Redis helper for session checks

describe('RBAC Backend Test Suite (FE-TAS-2)', () => {
  beforeAll(async () => {
    await DatabaseHelper.connect();
    await RedisHelper.connect();
  });

  afterAll(async () => {
    await DatabaseHelper.disconnect();
    await RedisHelper.disconnect();
  });

  beforeEach(async () => {
    await DatabaseHelper.seedTestUsers();
  });

  afterEach(async () => {
    await DatabaseHelper.clearData();
    await RedisHelper.clearAll();
  });

  /**
   * @TestCaseID TC-RBAC-B-001
   * @RequirementMapping FR-RBAC-001, FR-RBAC-002
   * @AcceptanceCriteriaMapping AC-RBAC-001
   * @Type Functional / Security / API
   * @Priority Critical
   * @Description Verify that a user can successfully log in with valid credentials and receive access/refresh tokens.
   * @Preconditions Test user account "rep1@apexsales.com" exists with password "Password123!".
   * @Steps
   *   1. Send POST request to /api/v1/auth/login with valid credentials payload.
   *   2. Inspect response status code.
   *   3. Inspect token payload structures (contains user_id, tenant_id, role).
   *   4. Verify cookie attributes.
   * @ExpectedResults
   *   - Returns status code 200 OK.
   *   - Body contains signed JWT access token.
   *   - HttpOnly cookie contains refresh token.
   *   - JWT contains correct payload mapping: role="Sales Representative".
   */
  test('TC-RBAC-B-001: Success Login with Valid Credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'rep1@apexsales.com',
        password: 'Password123!'
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('role', 'Sales Representative');
    
    // Check cookie flags
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toContain('HttpOnly');
    expect(cookies[0]).toContain('Secure');
    expect(cookies[0]).toContain('SameSite=Strict');
  });

  /**
   * @TestCaseID TC-RBAC-B-002
   * @RequirementMapping FR-RBAC-001
   * @AcceptanceCriteriaMapping AC-RBAC-001
   * @Type Negative / Validation / API
   * @Priority High
   * @Description Verify that login fails when invalid input schemas (wrong email formats) are submitted.
   * @Preconditions None.
   * @Steps
   *   1. Send POST request to /api/v1/auth/login with invalid email "rep1invalid".
   *   2. Inspect response status code and payload error keys.
   * @ExpectedResults
   *   - Returns status code 400 Bad Request.
   *   - Payload details validation schema error.
   */
  test('TC-RBAC-B-002: Login Fail - Invalid Email Format', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'rep1invalid',
        password: 'Password123!'
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('status', 'error');
    expect(res.body.message).toContain('email');
  });

  /**
   * @TestCaseID TC-RBAC-B-003
   * @RequirementMapping FR-RBAC-001
   * @AcceptanceCriteriaMapping AC-RBAC-001
   * @Type Negative / Security / API
   * @Priority Critical
   * @Description Verify that login fails when an incorrect password is provided.
   * @Preconditions Test user exists with password "Password123!".
   * @Steps
   *   1. Send POST request to /api/v1/auth/login with correct email and wrong password "WrongPass!".
   *   2. Inspect response status code and generic message.
   * @ExpectedResults
   *   - Returns status code 401 Unauthorized.
   *   - Message displays generic warning to prevent user enumeration.
   */
  test('TC-RBAC-B-003: Login Fail - Incorrect Password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'rep1@apexsales.com',
        password: 'WrongPass!'
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  /**
   * @TestCaseID TC-RBAC-B-004
   * @RequirementMapping FR-RBAC-002
   * @AcceptanceCriteriaMapping AC-RBAC-003
   * @Type Functional / Integration / Database
   * @Priority Critical
   * @Description Verify token refresh execution yields new JWT credentials.
   * @Preconditions Valid active session refresh token is stored in Redis cache.
   * @Steps
   *   1. Send POST request to /api/v1/auth/refresh with valid refresh token cookie.
   *   2. Verify response variables.
   * @ExpectedResults
   *   - Returns status code 200 OK.
   *   - Body contains a newly generated access token.
   */
  test('TC-RBAC-B-004: Refresh Token Verification Workflow', async () => {
    // Generate valid session in Redis
    const token = await RedisHelper.createMockSession('rep1-uuid');

    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({
        refresh_token: token
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  /**
   * @TestCaseID TC-RBAC-B-005
   * @RequirementMapping FR-RBAC-004
   * @AcceptanceCriteriaMapping AC-RBAC-002
   * @Type Security / Integration / API
   * @Priority Critical
   * @Description Verify that a Sales Representative is blocked from fetching deals owned by other users.
   * @Preconditions
   *   - Authenticated as "rep1@apexsales.com" (role=Rep, id=rep1-uuid).
   *   - Deal "Deal-Other" exists, owned by "rep2-uuid".
   * @Steps
   *   1. Send GET request to /api/v1/deals/Deal-Other-id carrying Rep 1 authorization headers.
   *   2. Inspect response status.
   * @ExpectedResults
   *   - Returns status code 403 Forbidden.
   */
  test('TC-RBAC-B-005: Authorization Check - Sales Rep Cannot Read Other Deals', async () => {
    const repToken = DatabaseHelper.getJWTForUser('rep1-uuid');
    const otherDealId = 'deal-other-uuid';

    const res = await request(app)
      .get(`/api/v1/deals/${otherDealId}`)
      .set('Authorization', `Bearer ${repToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Access Denied');
  });

  /**
   * @TestCaseID TC-RBAC-B-006
   * @RequirementMapping FR-RBAC-004
   * @AcceptanceCriteriaMapping None
   * @Type Security / Integration / API
   * @Priority Critical
   * @Description Verify that a Sales Manager can retrieve deals owned by members of their assigned Team.
   * @Preconditions
   *   - Authenticated as Manager "manager1@apexsales.com" (Team=Team West).
   *   - Deal "Deal-West" exists, owned by team member "rep1-uuid" (Team=Team West).
   * @Steps
   *   1. Send GET request to /api/v1/deals/Deal-West-id carrying Manager authorization headers.
   *   2. Inspect response status.
   * @ExpectedResults
   *   - Returns status code 200 OK.
   *   - Deals metadata successfully retrieved.
   */
  test('TC-RBAC-B-006: Authorization Check - Sales Manager Can Read Team Deals', async () => {
    const managerToken = DatabaseHelper.getJWTForUser('manager1-uuid');
    const teamDealId = 'deal-west-uuid';

    const res = await request(app)
      .get(`/api/v1/deals/${teamDealId}`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.deal.owner_id).toBe('rep1-uuid');
  });

  /**
   * @TestCaseID TC-RBAC-B-007
   * @RequirementMapping FR-RBAC-004
   * @AcceptanceCriteriaMapping None
   * @Type Security / Integration / API
   * @Priority Critical
   * @Description Verify that a Sales Manager is blocked from viewing deals belonging to another Team.
   * @Preconditions
   *   - Authenticated as Manager "manager1@apexsales.com" (Team=Team West).
   *   - Deal "Deal-East" exists, owned by team member on "Team East" (manager=manager2-uuid).
   * @Steps
   *   1. Send GET request to /api/v1/deals/Deal-East-id carrying Manager 1 authorization headers.
   *   2. Inspect response.
   * @ExpectedResults
   *   - Returns status code 403 Forbidden.
   */
  test('TC-RBAC-B-007: Authorization Check - Sales Manager Blocked From Other Team Deals', async () => {
    const managerToken = DatabaseHelper.getJWTForUser('manager1-uuid');
    const otherTeamDealId = 'deal-east-uuid';

    const res = await request(app)
      .get(`/api/v1/deals/${otherTeamDealId}`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.status).toBe(403);
  });

  /**
   * @TestCaseID TC-RBAC-B-008
   * @RequirementMapping Edge Case 1 (User is Deactivated)
   * @AcceptanceCriteriaMapping None
   * @Type Edge Case / Security / Database
   * @Priority Critical
   * @Description Verify that deactivating a user invalidates their active refresh tokens instantly in Redis.
   * @Preconditions Admin is authenticated. User "rep1-uuid" has active refresh tokens in Redis.
   * @Steps
   *   1. Send POST request as Admin to deactivate user "rep1-uuid" (/api/v1/users/rep1-uuid/deactivate).
   *   2. Query Redis to verify the refresh token keys are deleted.
   *   3. Attempt to call /api/v1/auth/refresh with the deactivated token.
   * @ExpectedResults
   *   - Deactivation endpoint returns 200 OK.
   *   - Redis keys for "session:refresh_token:*" associated with rep1-uuid are deleted.
   *   - Refresh request returns 401 Unauthorized.
   */
  test('TC-RBAC-B-008: Edge Case - Deactivation Clears Redis Cache Sessions', async () => {
    const adminToken = DatabaseHelper.getJWTForUser('admin-uuid');
    const refreshCookie = 'd7410468-b78f-session-token';
    
    // Seed session in cache
    await RedisHelper.seedSession(refreshCookie, 'rep1-uuid');

    // Deactivate via Admin endpoint
    const resDeactivate = await request(app)
      .post('/api/v1/users/rep1-uuid/deactivate')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(resDeactivate.status).toBe(200);

    // Verify session drop in Redis
    const sessionVal = await RedisHelper.getSession(refreshCookie);
    expect(sessionVal).toBeNull();

    // Verify refresh endpoint blocks reuse
    const resRefresh = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refresh_token: refreshCookie });

    expect(resRefresh.status).toBe(401);
  });

  /**
   * @TestCaseID TC-RBAC-B-009
   * @RequirementMapping FR-RBAC-003 / API Security
   * @AcceptanceCriteriaMapping None
   * @Type Security / Performance / API
   * @Priority High
   * @Description Verify api execution duration for secured route checking remains below latency target limits.
   * @Preconditions System load baseline active.
   * @Steps
   *   1. Measure start timestamp.
   *   2. Fire GET /api/v1/leads request carrying valid token headers.
   *   3. Measure end timestamp.
   * @ExpectedResults
   *   - Middleware intercepts, validates token role, queries DB, and completes execution in < 200ms (NFR-PERF-001).
   */
  test('TC-RBAC-B-009: Auth Middleware Performance Baseline Check', async () => {
    const repToken = DatabaseHelper.getJWTForUser('rep1-uuid');
    const startTime = Date.now();

    const res = await request(app)
      .get('/api/v1/leads')
      .set('Authorization', `Bearer ${repToken}`);

    const duration = Date.now() - startTime;
    expect(res.status).toBe(200);
    expect(duration).toBeLessThan(200); // Latency target limit
  });
});
