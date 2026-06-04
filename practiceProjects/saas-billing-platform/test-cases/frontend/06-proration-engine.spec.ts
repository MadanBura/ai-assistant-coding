/**
 * @file Proration Engine Frontend Cypress Spec
 * @feature FEAT-SUB-03
 */

describe('Proration Engine - Frontend [FEAT-SUB-03]', () => {
  
  beforeEach(() => {
    cy.login('admin@merchant.com', 'password123');
    cy.visit('/portal/subscriptions/sub_active_555/change');
  });

  /**
   * @id TC-FE-SUB-03-01
   * @requirement FR-SUB-03-01
   * @acceptance AC-SUB-03-01
   * @priority CRITICAL
   * @type UI / Functional
   */
  it('TC-FE-SUB-03-01: Displays calculation details breakdown in change-plan preview card', () => {
    cy.get('[data-testid="plan-select-plan_gold_monthly"]').click();
    cy.get('[data-testid="preview-proration-btn"]').click();

    cy.get('[data-testid="proration-summary"]').should('be.visible');
    cy.get('[data-testid="proration-credit-line"]').should('contain', '-$50.00');
    cy.get('[data-testid="proration-debit-line"]').should('contain', '+$150.00');
    cy.get('[data-testid="proration-total-due"]').should('contain', '$100.00');
  });
});
