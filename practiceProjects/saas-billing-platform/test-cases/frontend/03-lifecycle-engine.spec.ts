/**
 * @file Subscription Lifecycle Engine Frontend Cypress Spec
 * @feature FEAT-SUB-02
 */

describe('Subscription Lifecycle Engine - Frontend [FEAT-SUB-02]', () => {
  
  beforeEach(() => {
    cy.login('admin@merchant.com', 'password123');
    cy.visit('/dashboard/subscriptions/sub_active_555');
  });

  /**
   * @id TC-FE-SUB-02-01
   * @requirement FR-SUB-02-01
   * @priority CRITICAL
   * @type UI / Functional
   */
  it('TC-FE-SUB-02-01: Displays subscription status badges and actions properly', () => {
    cy.get('[data-testid="subscription-status-badge"]')
      .should('have.class', 'badge-active')
      .and('contain', 'Active');
      
    cy.get('[data-testid="pause-sub-btn"]').should('be.visible');
    cy.get('[data-testid="cancel-sub-btn"]').should('be.visible');
  });

  /**
   * @id TC-FE-SUB-02-02
   * @requirement FR-SUB-02-05
   * @acceptance AC-SUB-02-03
   * @priority HIGH
   * @type UI / Functional
   */
  it('TC-FE-SUB-02-02: Support pausing active subscriptions from admin controls page', () => {
    cy.get('[data-testid="pause-sub-btn"]').click();
    cy.get('[data-testid="pause-confirm-btn"]').click();

    cy.get('[data-testid="subscription-status-badge"]')
      .should('have.class', 'badge-paused')
      .and('contain', 'Paused');
  });
});
