/**
 * @file Tax Engine Integration Frontend Cypress Spec
 * @feature FEAT-INV-02
 */

describe('Tax Engine Integration - Frontend [FEAT-INV-02]', () => {
  
  beforeEach(() => {
    cy.visit('/checkout/pay/cs_test_a1b2c3d4');
  });

  /**
   * @id TC-FE-INV-02-01
   * @requirement FR-INV-02-01
   * @acceptance AC-INV-02-01
   * @priority CRITICAL
   * @type UI / Functional
   */
  it('TC-FE-INV-02-01: Update tax details dynamically when ZIP/Country changes', () => {
    cy.get('[data-testid="billing-country-select"]').select('DE');
    cy.get('[data-testid="billing-zip-input"]').type('10115');
    
    cy.get('[data-testid="tax-preview-line"]').should('contain', '19%');
    cy.get('[data-testid="tax-amount-label"]').should('contain', '$5.51');
  });

  /**
   * @id TC-FE-INV-02-02
   * @requirement FR-INV-02-02
   * @acceptance AC-INV-02-02
   * @priority HIGH
   * @type UI / Functional
   */
  it('TC-FE-INV-02-02: Apply 0% reverse charge tax visual check when verified B2B Tax ID is entered', () => {
    cy.get('[data-testid="billing-country-select"]').select('DE');
    cy.get('[data-testid="billing-zip-input"]').type('10115');
    cy.get('[data-testid="tax-id-input"]').type('DE123456789');
    cy.get('[data-testid="tax-id-verify-btn"]').click();

    cy.get('[data-testid="tax-id-checkmark"]').should('be.visible');
    cy.get('[data-testid="tax-amount-label"]').should('contain', '$0.00');
  });
});
