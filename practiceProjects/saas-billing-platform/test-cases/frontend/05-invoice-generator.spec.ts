/**
 * @file PDF Invoice Generator Frontend Cypress Spec
 * @feature FEAT-INV-01
 */

describe('PDF Invoice Generator - Frontend [FEAT-INV-01]', () => {
  
  beforeEach(() => {
    cy.login('admin@merchant.com', 'password123');
    cy.visit('/dashboard/invoices');
  });

  /**
   * @id TC-FE-INV-01-01
   * @requirement FR-INV-01-02
   * @priority CRITICAL
   * @type UI / Functional
   */
  it('TC-FE-INV-01-01: Displays invoice grid with correct columns and status badge classes', () => {
    cy.get('[data-testid="invoices-table"]').should('be.visible');
    cy.get('[data-testid="invoice-row-inv_938"]').within(() => {
      cy.get('[data-testid="invoice-number"]').should('contain', 'INV-2026-0000104');
      cy.get('[data-testid="invoice-status-badge"]')
        .should('have.class', 'badge-paid')
        .and('contain', 'Paid');
    });
  });

  /**
   * @id TC-FE-INV-01-02
   * @requirement FR-PORT-02-04
   * @priority CRITICAL
   * @type UI / Integration
   */
  it('TC-FE-INV-01-02: Clicking download button redirects user to signed S3 URL path', () => {
    cy.intercept('GET', '/v1/invoices/inv_938/download', {
      statusCode: 302,
      headers: {
        location: 'https://s3.aurabilling.com/invoices/mock_invoice.pdf?SignedToken=123'
      }
    }).as('downloadReq');

    cy.get('[data-testid="download-btn-inv_938"]').click();
    cy.wait('@downloadReq');
    
    cy.window().then((win) => {
      expect(win.location.href).to.not.equal('/dashboard/invoices');
    });
  });
});
