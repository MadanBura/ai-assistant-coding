/**
 * @file Financial Analytics Frontend Cypress Spec
 * @feature FEAT-ADMN-01
 */

describe('Financial Analytics - Frontend [FEAT-ADMN-01]', () => {
  
  beforeEach(() => {
    cy.login('admin@merchant.com', 'password123');
    cy.visit('/dashboard/overview');
  });

  /**
   * @id TC-FE-ADMN-01-01
   * @requirement FR-ADMN-01-04
   * @priority HIGH
   * @type UI / Functional
   */
  it('TC-FE-ADMN-01-01: Displays metric cards and interactive charts elements', () => {
    cy.get('[data-testid="mrr-metric-card"]').should('be.visible').and('contain', '$142,050');
    cy.get('[data-testid="revenue-trend-chart"]').should('be.visible');
    cy.get('[data-testid="csv-export-btn"]').should('be.visible');
  });
});
