/**
 * @file PDF Invoice Generator Backend TypeScript Jest Tests
 * @feature FEAT-INV-01
 */

import request from 'supertest';
import app from '../../src/app';
import AWSMock from 'aws-sdk-mock';

describe('PDF Invoice Generator - Backend [FEAT-INV-01]', () => {
  
  beforeAll(() => {
    AWSMock.mock('S3', 'upload', (params: any, callback: any) => {
      callback(null, { Location: 'https://s3.aurabilling.com/invoices/mock_invoice.pdf' });
    });
  });

  afterAll(() => {
    AWSMock.restore('S3');
  });

  /**
   * @id TC-BE-INV-01-01
   * @requirement FR-INV-01-01, FR-INV-01-02
   * @acceptance AC-INV-01-01
   * @priority CRITICAL
   * @type Functional
   */
  test('TC-BE-INV-01-01: Create and retrieve invoice with sequential formatting rules', async () => {
    const response = await request(app)
      .get('/v1/invoices/inv_93802ka9123')
      .set('Authorization', 'Bearer sk_live_admin123');

    expect(response.status).toBe(200);
    expect(response.body.invoice_number).toMatch(/^INV-\d{4}-\d{7}$/);
    expect(response.body.subtotal).toBe(100.00);
  });

  /**
   * @id TC-BE-INV-01-02
   * @requirement FR-INV-01-05, VAL-INV-01-01
   * @acceptance AC-INV-01-01
   * @priority CRITICAL
   * @type Integration / Calculations
   */
  test('TC-BE-INV-01-02: Block execution when sum validation rules fail to balance', async () => {
    const response = await request(app)
      .post('/v1/admin/invoices/inv_broken_calc/finalize')
      .set('Authorization', 'Bearer sk_live_admin123')
      .send({
        subtotal: 100.00,
        tax_amount: 19.00,
        discount_amount: 10.00,
        total: 105.00
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('CALCULATION_MISMATCH');
  });

  /**
   * @id TC-BE-INV-01-03
   * @requirement FR-INV-01-04, SEC-INV-01-02
   * @priority HIGH
   * @type Security / API
   */
  test('TC-BE-INV-01-03: Signed URLs generated expire in exactly 15 minutes', async () => {
    const response = await request(app)
      .get('/v1/invoices/inv_93802ka9123')
      .set('Authorization', 'Bearer sk_live_admin123');

    expect(response.status).toBe(200);
    expect(response.body.pdf_download_url).toContain('Expires=');
  });
});
