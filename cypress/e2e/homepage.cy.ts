describe('The Home Page', () => {
  // quando sessione aperta deve mostrare il button ESCI con i dati dell'utente
  it('should display user data when session is open', () => {
    // ATTENZIONE: per testare se funziona inserire un token valido
    cy.setCookie(
      'user_data',
      '%7B%22closed%22%3Afalse%2C%22currentObservers%22%3A%5B%5D%2C%22observers%22%3A%5B%5D%2C%22isStopped%22%3Afalse%2C%22hasError%22%3Afalse%2C%22thrownError%22%3Anull%2C%22_value%22%3A%7B%22name%22%3A%22marione%22%2C%22email%22%3A%22mario.rossi%40gmmail.com%22%2C%22_sessionToken%22%3A%22eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1hcmlvLnJvc3NpQGdtbWFpbC5jb20iLCJ1c2VybmFtZSI6Im1hcmlvbmUiLCJpYXQiOjE2ODUwMjI2NjQsImV4cCI6MTY4NTAyNjI2NH0.XPyxDB1m0LroBd45HLh-awJQpnwEZRbo4N0-Ye36zoc%22%2C%22_tokenExpDate%22%3A%222023-05-25T14%3A51%3A04.634Z%22%7D%7D'
    );
    cy.visit('/');
    cy.get('.example-card mat-card-title').should('not.have.text', 'Ospite');
    cy.get('.example-card mat-card-subtitle').should('not.have.text', '');
    cy.get('[data-testid="logout-button"]').should('have.text', ' ESCI ');
  });

  // quando sessione chiusa deve mostrare il button ACCEDI con i dati di default
  it('should display user data when session is open', () => {
    cy.visit('/');
    cy.get('.example-card mat-card-title').should('have.text', 'Ospite');
    cy.get('.example-card mat-card-subtitle').should('have.text', '');
    cy.get('[data-testid="login-button"]').should('have.text', ' ACCEDI ');
  });
});
