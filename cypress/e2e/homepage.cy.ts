describe('The Home Page', () => {
  // quando la sessione è chiusa deve mostrare il button ACCEDI con i dati di default
  it('should display default data when session is close', () => {
    cy.visit('/');
    cy.get('.example-card mat-card-title').should('have.text', 'Ospite');
    cy.get('.example-card mat-card-subtitle').should('have.text', '');
    cy.get('[data-testid="login-button"]').should('have.text', ' ACCEDI ');
  });
});
