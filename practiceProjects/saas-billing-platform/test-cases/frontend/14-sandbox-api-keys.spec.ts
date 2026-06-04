/**
 * @file Sandbox & API Keys Frontend Cypress Spec
 * @feature FEAT-API-02
 */

describe('Sandbox & API Keys - Frontend [FEAT-API-02]', () => {
  
  beforeEach(() => {
    cy.login('admin@merchant.com', 'password123');
    cy.visit('/dashboard/developer/keys');
  });

  /**
   * @id TC-FE-API-02-01
   * @requirement FR-API-02-01
   * @priority HIGH
   * @type UI / Functional
   */
  it('TC-FE-MTR-02-01: Displays publishable keys and masks secret key tokens', () => {
    cy.get('[data-testid="api-keys-card"]').should('be.visible');
    cy.get('[data-testid="publishable-key-input"]').should('have.value', 'pk_live_mock_key');
    cy.get('[data-testid="secret-key-masked"]').should('contain', 'sk_live_••••••••');
  });
});
