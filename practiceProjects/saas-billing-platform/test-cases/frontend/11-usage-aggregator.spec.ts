/**
 * @file Usage Aggregator Frontend Cypress Spec
 * @feature FEAT-MTR-02
 */

describe('Usage Aggregator - Frontend [FEAT-MTR-02]', () => {
  
  beforeEach(() => {
    cy.login('admin@merchant.com', 'password123');
    cy.visit('/portal/dashboard');
  });

  /**
   * @id TC-FE-MTR-02-01
   * @requirement FR-MTR-02-01
   * @priority MEDIUM
   * @type UI / Functional
   */
  it('TC-FE-MTR-02-01: Displays accrued usage units preview in dashboard summary widgets', () => {
    cy.get('[data-testid="accrued-usage-widget"]').should('be.visible');
    cy.get('[data-testid="usage-metric-sum"]').should('contain', '15,403 API Calls');
  });
});
