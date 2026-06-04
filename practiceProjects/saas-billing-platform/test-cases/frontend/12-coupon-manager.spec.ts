/**
 * @file Coupon Code Manager Frontend Cypress Spec
 * @feature FEAT-COUP-01
 */

describe('Coupon Code Manager - Frontend [FEAT-COUP-01]', () => {
  
  beforeEach(() => {
    cy.visit('/checkout/pay/cs_test_a1b2c3d4');
  });

  /**
   * @id TC-FE-COUP-01-01
   * @requirement FR-COUP-01-01
   * @priority HIGH
   * @type UI / Functional
   */
  it('TC-FE-COUP-01-01: Apply valid promotional coupon at checkout successfully', () => {
    cy.get('[data-testid="promo-code-input"]').type('WINTER30');
    cy.get('[data-testid="apply-promo-btn"]').click();

    cy.get('[data-testid="promo-success-alert"]').should('be.visible');
    cy.get('[data-testid="discount-amount-label"]').should('contain', '-$8.70');
  });
});
