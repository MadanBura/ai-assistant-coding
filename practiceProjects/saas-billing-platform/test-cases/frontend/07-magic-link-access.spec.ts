/**
 * @file Passwordless Magic-Link Access Frontend Cypress Spec
 * @feature FEAT-PORT-01
 */

describe('Passwordless Magic-Link Access - Frontend [FEAT-PORT-01]', () => {
  
  /**
   * @id TC-FE-PORT-01-01
   * @requirement FR-PORT-01-01
   * @priority CRITICAL
   * @type UI / Functional
   */
  it('TC-FE-PORT-01-01: Dispatches email login request successfully', () => {
    cy.visit('/portal/login');
    cy.get('[data-testid="portal-email-input"]').type('customer@company.com');
    cy.get('[data-testid="send-link-btn"]').click();
    
    cy.get('[data-testid="login-success-banner"]').should('be.visible');
  });

  /**
   * @id TC-FE-PORT-01-02
   * @requirement FR-PORT-01-05
   * @acceptance AC-PORT-01-01
   * @priority CRITICAL
   * @type UI / Functional / Security
   */
  it('TC-FE-PORT-01-02: Requires landing confirm action button to prevent automatic email scanner bot validation', () => {
    cy.visit('/portal/auth?token=d7a4f9104bce38290192e');
    
    cy.url().should('include', '/portal/auth');
    cy.get('[data-testid="confirm-login-btn"]').should('be.visible');

    cy.get('[data-testid="confirm-login-btn"]').click();
    cy.url().should('include', '/portal/dashboard');
  });
});
