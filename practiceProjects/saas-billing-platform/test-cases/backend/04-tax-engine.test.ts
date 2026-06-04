/**
 * @file Tax Engine Integration Backend TypeScript Jest Tests
 * @feature FEAT-INV-02
 */

import request from 'supertest';
import app from '../../src/app';

describe('Tax Engine Integration - Backend [FEAT-INV-02]', () => {
  
  /**
   * @id TC-BE-INV-02-01
   * @requirement FR-INV-02-01, FR-INV-02-05
   * @acceptance AC-INV-02-01
   * @priority CRITICAL
   * @type Functional
   */
  test('TC-BE-INV-02-01: Calculate correct dynamic tax rate for standard EU resident location', async () => {
    const response = await request(app)
      .post('/v1/tax/calculate')
      .send({
        customer_id: 'cust_8f9024j94j',
        amount_cents: 10000,
        billing_address: {
          country: 'DE',
          postal_code: '10115',
          city: 'Berlin'
        }
      });

    expect(response.status).toBe(200);
    expect(response.body.tax_rate).toBe(19.00);
    expect(response.body.tax_amount_cents).toBe(1900);
  });

  /**
   * @id TC-BE-INV-02-02
   * @requirement FR-INV-02-02
   * @acceptance AC-INV-02-02
   * @priority HIGH
   * @type Functional
   */
  test('TC-BE-INV-02-02: Apply 0% reverse charge VAT on valid B2B tax ID', async () => {
    const response = await request(app)
      .post('/v1/tax/calculate')
      .send({
        customer_id: 'cust_8f9024j94j',
        amount_cents: 10000,
        tax_id: 'DE123456789',
        billing_address: {
          country: 'DE',
          postal_code: '10115',
          city: 'Berlin'
        }
      });

    expect(response.status).toBe(200);
    expect(response.body.tax_rate).toBe(0.00);
    expect(response.body.reverse_charge_applied).toBe(true);
  });

  /**
   * @id TC-BE-INV-02-03
   * @requirement FR-INV-02-03, RULE-002
   * @acceptance AC-INV-02-03
   * @priority HIGH
   * @type Edge Case / Fallback
   */
  test('TC-BE-INV-02-03: Fallback to local static tax tables on external API timeout', async () => {
    process.env.MOCK_TAX_ENGINE_TIMEOUT = 'true';

    const response = await request(app)
      .post('/v1/tax/calculate')
      .send({
        amount_cents: 10000,
        billing_address: {
          country: 'US',
          state: 'CA',
          postal_code: '90210'
        }
      });

    expect(response.status).toBe(200);
    expect(response.body.tax_rate).toBe(8.25); // local table CA fallback
  });
});
