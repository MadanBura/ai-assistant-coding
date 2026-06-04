/**
 * @file Vaulting & Checkout Frontend Cypress Spec
 * @feature FEAT-PAY-01
 */

describe('Vaulting & Checkout - Frontend [FEAT-PAY-01]', () => {
  
  beforeEach(() => {
    cy.visit('/checkout/pay/cs_test_a1b2c3d4');
  });

  /**
   * @id TC-FE-PAY-01-01
   * @requirement FR-PAY-01-02
   * @priority CRITICAL
   * @type UI / Functional
   */
  it('TC-FE-PAY-01-01: Renders plan summary and Stripe card fields cleanly', () => {
    cy.get('[data-testid="pricing-summary-card"]').should('be.visible');
    cy.get('[data-testid="subtotal-label"]').should('contain', '$29.00');
    cy.get('iframe').should('exist');
  });

  /**
   * @id TC-FE-PAY-01-02
   * @requirement FR-PAY-01-02, FR-PAY-01-03
   * @acceptance AC-PAY-01-01
   * @priority CRITICAL
   * @type UI / Functional
   */
  it('TC-FE-PAY-01-02: Process checkout successfully using valid testing card parameters', () => {
    cy.get('[data-testid="checkout-name"]').type('John Doe');
    cy.window().then((win: any) => {
      win.stripeMockToken = 'pm_1H2i3o4k5j';
    });
    
    cy.get('[data-testid="pay-submit-btn"]').click();
    cy.url().should('include', '/checkout/success');
  });

  /**
   * @id TC-FE-PAY-01-03
   * @requirement FR-PAY-01-05
   * @priority HIGH
   * @type UI / Negative
   */
  it('TC-FE-PAY-01-03: Render clean card decline notifications on failure', () => {
    cy.get('[data-testid="checkout-name"]').type('Decline Card User');
    cy.window().then((win: any) => {
      win.stripeMockDecline = true;
    });

    cy.get('[data-testid="pay-submit-btn"]').click();
    cy.get('[data-testid="payment-error-alert"]').should('be.visible');
  });
});
