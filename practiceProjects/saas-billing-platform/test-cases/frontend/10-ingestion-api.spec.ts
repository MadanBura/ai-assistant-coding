/**
 * @file Usage Ingestion API Frontend Cypress Spec
 * @feature FEAT-MTR-01
 */

describe('Usage Ingestion API - Frontend [FEAT-MTR-01]', () => {
  
  beforeEach(() => {
    cy.login('admin@merchant.com', 'password123');
    cy.visit('/dashboard/developer/usage-logs');
  });

  /**
   * @id TC-FE-MTR-01-01
   * @requirement FR-MTR-01-01
   * @priority MEDIUM
   * @type UI / Functional
   */
  it('TC-FE-MTR-01-01: Displays raw telemetry JSON log streams and filter bars', () => {
    cy.get('[data-testid="telemetry-logs-container"]').should('be.visible');
    cy.get('[data-testid="logs-filter-input"]').type('sub_92k02kasj8');
    cy.get('[data-testid="log-row-0"]').should('contain', 'api_calls');
  });
});
