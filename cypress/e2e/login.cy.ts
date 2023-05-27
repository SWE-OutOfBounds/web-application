describe('The Login Page', () => {
  const backendUrl = 'http://localhost:3000';
  it('successfully loads', () => {
    cy.visit('/login');
  });

  /**
   * R1F2 - Accesso al sistema
   * R1F2.1 - inserimento email
   * R1F2.2 - inserimento password
   */
  describe('Login form', () => {
    beforeEach(() => {
      cy.visit('/login');
    });

    //Corretta visualizzazione del form per l'accesso al sistema
    it('should display login form with email and password input enabled and submit disabled', () => {
      cy.get('form');
      cy.get('[data-testid="email"]').should('be.enabled');
      cy.get('[data-testid="psw"]').should('be.enabled');
      cy.get('[data-testid="submit"]').should('be.disabled');
    });

    it('should display an error message and disabled submit button when clock-captcha is not available', () => {
      cy.get('[data-testid="email"]').type('mario.rossi@gmmail.com');
      cy.get('[data-testid="psw"]').type('Password1234');

      cy.intercept('GET', `${backendUrl}/clock-captcha`, (req) => {
        req.reply({
          status: 400,
        });
      });

      cy.get('.error').should('be.visible');
      cy.get('[data-testid="submit"]').should('be.disabled');
    });

    it('should enabled submit button when all data are inserted and clock captcha is visible', () => {
      cy.get('[data-testid="email"]').type('mario.rossi@gmmail.com');
      cy.get('[data-testid="psw"]').type('Password1234');

      cy.intercept('GET', 'http://localhost:3000/clock-captcha', {
        statusCode: 200,
      });

      cy.get('[data-testid="submit"]').should('be.enabled');
    });

    it('should log in when data are correct', () => {
      cy.intercept('POST', `${backendUrl}/session`, (req) => {
        const customResponse = {
          statusCode: 200,
          body: {
            username: 'BigMario',
            session_token: 'sessionToken',
            expiredIn: 3600,
          },
        };

        req.reply(customResponse);
      }).as('postRequest'); // Assegna un alias all'intercettazione

      cy.visit('/login');

      cy.get('[data-testid="email"]').type('mario.rossi@gmmail.com');
      cy.get('[data-testid="psw"]').type('Password1234');
      cy.get('#clock-captcha input').type('07:45');

      cy.wait(500);

      cy.get('[data-testid="submit"]').click();

      cy.wait('@postRequest').then((interception) => {
        cy.location('pathname').should('eq', '/');
        cy.get('.example-card mat-card-title').should(
          'not.have.text',
          'Ospite'
        );
        cy.get('.example-card mat-card-subtitle').should('not.have.text', '');
        cy.get('[data-testid="logout-button"]').should('have.text', ' ESCI ');
      });
    });
  });

  /**
   * R1F1 Risoluzione CAPTCHA
   * R1F1.1
   * R1F1.1.1
   * R1F1.1.2
   * R1F1.1.3
   * R1F1.2
   * R1F1.2.1
   * R1F1.2.2
   */
  describe('clock CAPTCHA', () => {
    beforeEach(() => {
      cy.visit('/login');
    });
    it('should display the image of the clock', () => {
      cy.get('canvas').should('be.visible');
    });
    it('should display the form for clock-captcha input', () => {
      cy.get('#clock-captcha input').should('be.enabled');
    });
  });

  /**
   * R3F1 - Visualizzazione password in chiaro
   */
  describe('plaintext password', () => {
    beforeEach(() => {
      cy.visit('/login');
    });
    it('should display plaintext password when button is clicked on visibility', () => {
      cy.get('[data-testid="psw"]').type('password');
      cy.get('[data-testid="plaintextPswButton"]').click();
      cy.get('[data-testid="psw"][type="text"]').should('be.visible');
    });
    it('should hide password when button is clicked on visibility_off', () => {
      cy.get('[data-testid="psw"]').type('password');
      cy.get('[data-testid="plaintextPswButton"]').dblclick();
      cy.get('[data-testid="psw"][type="password"]').should('be.visible');
    });
  });

  /**
   * R2F9 - Errore requisito necessario
   * R2F9.3 - indirizzo email necessario
   * R2F9.5 - password necessaria
   */
  describe('Required error', () => {
    beforeEach(() => {
      cy.visit('/login');
    });

    it('should display "email required" error when there is no email in input', () => {
      cy.get('[data-testid="email"]').type('mario'); //inizia a digitare
      cy.get('[data-testid="email"]').clear(); //cancella il campo necessario
      cy.get('[data-testid="psw"]').focus(); //sposta il focus

      cy.get('mat-error').should('have.text', ' Indirizzo email necessario. '); //deve ricordare all'utente che il campo lasciato bianco deve essere compilato
    });
    it('should display "password required" error when there is no password in input', () => {
      cy.get('[data-testid="psw"]').type('pass'); //inizia a digitare
      cy.get('[data-testid="psw"]').clear(); //cancella il campo necessario
      cy.get('[data-testid="email"]').focus(); //sposta il focus

      cy.get('mat-error').should('have.text', ' Password necessaria. '); //deve ricordare all'utente che il campo lasciato bianco deve essere compilato
    });
  });

  /**
   * R2F2 - Errore credenziali errate
   */
  describe('Bad Credential', () => {
    it('should display "bad credential" error message in case of invalid password', () => {
      cy.intercept('POST', `${backendUrl}/session`, (req) => {
        const customResponse = {
          statusCode: 400,
          body: {
            details: 'INVALID_PASSWORD_FORMAT',
          },
        };

        req.reply(customResponse);
      }).as('postRequest'); // Assegna un alias all'intercettazione

      cy.visit('/login');

      cy.get('[data-testid="email"]').type('mario.rossi@gmmail.com');
      cy.get('[data-testid="psw"]').type('Password');
      cy.get('#clock-captcha input').type('07:45');

      cy.wait(500);

      cy.get('[data-testid="submit"]').click();

      cy.wait('@postRequest').then((interception) => {
        cy.get('mat-error').should(
          'have.text',
          ' Credenziali errate.  Credenziali errate. '
        );
      });
    });
  });

  /**
   * R2F6 - Errore fallimento test clock CAPTCHA
   */
  describe('Bad Captcha', () => {
    it('should display an error message in case of bad captcha', () => {
      cy.intercept('POST', `${backendUrl}/session`, (req) => {
        const customResponse = {
          statusCode: 400,
          body: {
            details: 'BAD_CAPTCHA',
          },
        };

        req.reply(customResponse);
      }).as('postRequest'); // Assegna un alias all'intercettazione

      cy.visit('/login');

      cy.get('[data-testid="email"]').type('mario.rossi@gmmail.com');
      cy.get('[data-testid="psw"]').type('Password123');
      cy.get('#clock-captcha input').type('07:45');

      cy.wait(500);

      cy.get('[data-testid="submit"]').click();

      cy.wait('@postRequest').then((interception) => {
        cy.get('#clock-captcha p').should(
          'have.text',
          'OPS, ORARIO SCORRETTO!'
        );
      });
    });
  });
});
