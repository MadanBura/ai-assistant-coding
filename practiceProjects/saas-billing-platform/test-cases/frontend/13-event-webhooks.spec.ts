/**
 * @file Event Stream & Webhooks Frontend Cypress Spec
 * @feature FEAT-API-01
 */

describe('Event Stream & Webhooks - Frontend [FEAT-API-01]', () => {
  
  beforeEach(() => {
    cy.login('admin@merchant.com', 'password123');
    cy.visit('/dashboard/developer/webhooks');
  });

  /**
   * @id TC-FE-API-01-01
   * @requirement FR-API-01-02
   * @priority HIGH
   * @type UI / Functional
   */
  it('TC-FE-API-01-01: Displays registered webhook list and allows configuring new endpoints', () => {
    cy.get('[data-testid="webhooks-endpoints-list"]').should('be.visible');
    cy.get('[data-testid="create-endpoint-btn"]').click();
    cy.get('[data-testid="endpoint-url-input"]').type('https://api.test.com/hooks');
    cy.get('[data-testid="event-checkbox-invoice-paid"]').check();
    cy.get('[data-testid="save-endpoint-btn"]').click();

    cy.get('[data-testid="toast-alert"]').should('contain', 'Webhook registered');
  });
});
