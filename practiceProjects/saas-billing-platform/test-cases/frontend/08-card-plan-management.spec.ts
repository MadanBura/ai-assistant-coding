/**
 * @file Card & Plan Management Frontend Cypress Spec
 * @feature FEAT-PORT-02
 */

describe('Card & Plan Management - Frontend [FEAT-PORT-02]', () => {
  
  beforeEach(() => {
    cy.setCookie('portal_session', 'bearer_mock_jwt_customer_8f');
    cy.visit('/portal/dashboard');
  });

  /**
   * @id TC-FE-PORT-02-01
   * @requirement FR-PORT-02-02
   * @priority CRITICAL
   * @type UI / Functional
   */
  it('TC-FE-PORT-02-01: Displays subscription info and billing card details correctly', () => {
    cy.get('[data-testid="subscription-info-card"]').should('be.visible');
    cy.get('[data-testid="active-plan-title"]').should('contain', 'Pro Gold Plan');
    cy.get('[data-testid="payment-details-mask"]').should('contain', '•••• •••• •••• 4242');
  });

  /**
   * @id TC-FE-PORT-02-02
   * @requirement FR-PORT-02-03
   * @acceptance AC-PORT-02-01
   * @priority CRITICAL
   * @type UI / Functional
   */
  it('TC-FE-PORT-02-02: Modal opens card inputs element dynamically on edit click', () => {
    cy.get('[data-testid="edit-card-btn"]').click();
    cy.get('[data-testid="card-update-modal"]').should('be.visible');
    cy.get('iframe').should('exist');
  });

  /**
   * @id TC-FE-PORT-02-03
   * @requirement FR-PORT-02-05
   * @acceptance AC-PORT-02-03
   * @priority CRITICAL
   * @type UI / Functional
   */
  it('TC-FE-PORT-02-03: Renders warning dialog on cancel click and executes cancel action successfully', () => {
    cy.get('[data-testid="cancel-subscription-trigger-btn"]').click();
    cy.get('[data-testid="cancel-warning-dialog"]').should('be.visible');
    cy.get('[data-testid="confirm-cancel-checkbox"]').check();
    cy.get('[data-testid="confirm-cancel-btn"]').click();

    cy.get('[data-testid="active-plan-status-pill"]')
      .should('have.class', 'status-pending-cancel')
      .and('contain', 'Pending Cancellation');
  });
});
