/**
 * @file Plan Builder Frontend Cypress Spec
 * @feature FEAT-SUB-01
 */

describe('Plan Builder - Frontend [FEAT-SUB-01]', () => {
  
  beforeEach(() => {
    cy.login('admin@merchant.com', 'password123');
    cy.visit('/dashboard/plans/create');
  });

  /**
   * @id TC-FE-SUB-01-01
   * @requirement FR-SUB-01-01, FR-SUB-01-02
   * @acceptance AC-SUB-01-01
   * @priority CRITICAL
   * @type UI / Functional
   */
  it('TC-FE-SUB-01-01: Build and save flat plan via Form Wizard', () => {
    cy.get('[data-testid="plan-name-input"]').type('Startup Basic Plan');
    cy.get('[data-testid="plan-price-input"]').type('19.99');
    cy.get('[data-testid="plan-interval-select"]').select('month');
    cy.get('[data-testid="plan-pricing-type-select"]').select('flat');
    cy.get('[data-testid="save-plan-btn"]').click();

    cy.url().should('include', '/dashboard/plans');
    cy.get('[data-testid="toast-alert"]').should('contain', 'Plan created successfully');
  });

  /**
   * @id TC-FE-SUB-01-02
   * @requirement FR-SUB-01-03
   * @acceptance AC-SUB-01-02
   * @priority HIGH
   * @type UI / Functional
   */
  it('TC-FE-SUB-01-02: Build tiered plan with dynamic inputs', () => {
    cy.get('[data-testid="plan-name-input"]').type('Enterprise Metered API');
    cy.get('[data-testid="plan-pricing-type-select"]').select('tiered');
    
    cy.get('[data-testid="add-tier-row-btn"]').click();
    cy.get('[data-testid="tier-up-to-input-0"]').type('100');
    cy.get('[data-testid="tier-amount-input-0"]').type('0.05');

    cy.get('[data-testid="save-plan-btn"]').click();
    cy.get('[data-testid="toast-alert"]').should('contain', 'Plan created successfully');
  });

  /**
   * @id TC-FE-SUB-01-03
   * @requirement UI-003
   * @priority MEDIUM
   * @type Accessibility
   */
  it('TC-FE-SUB-01-03: Ensure form fields satisfy accessibility standards', () => {
    cy.injectAxe();
    cy.checkA11y('[data-testid="plan-form-container"]');
  });
});
