/**
 * @file Operations Console Frontend Cypress Spec
 * @feature FEAT-ADMN-02
 */

describe('Operations Console - Frontend [FEAT-ADMN-02]', () => {
  
  beforeEach(() => {
    cy.login('support@merchant.com', 'password123'); // Log in as Support Rep
    cy.visit('/dashboard/customers/cust_8f9024j94j');
  });

  /**
   * @id TC-FE-ADMN-02-01
   * @requirement FR-ADMN-02-01
   * @priority CRITICAL
   * @type UI / Functional
   */
  it('TC-FE-ADMN-02-01: Displays action sidebars and triggers refund confirmation modals', () => {
    cy.get('[data-testid="customer-actions-sidebar"]').should('be.visible');
    cy.get('[data-testid="refund-invoice-trigger-btn-inv_938"]').click();
    cy.get('[data-testid="refund-modal"]').should('be.visible');
    
    cy.get('[data-testid="refund-amount-input"]').type('50.00');
    cy.get('[data-testid="refund-reason-select"]').select('duplicate_charge');
    cy.get('[data-testid="submit-refund-btn"]').click();

    cy.get('[data-testid="toast-alert"]').should('contain', 'Refund processed successfully');
  });
});
