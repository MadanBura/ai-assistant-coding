/**
 * @file Retry & Dunning Frontend Cypress Spec
 * @feature FEAT-PAY-02
 */

describe('Retry & Dunning - Frontend [FEAT-PAY-02]', () => {
  
  beforeEach(() => {
    cy.setCookie('portal_session', 'bearer_mock_jwt_customer_8f_pastdue');
    cy.visit('/portal/dashboard');
  });

  /**
   * @id TC-FE-PAY-02-01
   * @requirement FR-PAY-02-02
   * @priority HIGH
   * @type UI / Functional
   */
  it('TC-FE-PAY-02-01: Displays red alert banner when subscription state is past_due', () => {
    cy.get('[data-testid="subscription-info-card"]').should('be.visible');
    cy.get('[data-testid="active-plan-status-pill"]').should('contain', 'Past Due');
    cy.get('[data-testid="payment-error-alert-banner"]')
      .should('be.visible')
      .and('contain', 'Your payment failed. Please update your card');
  });
});
