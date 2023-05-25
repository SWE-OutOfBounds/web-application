describe('The Registration Page', () => {
  const backendUrl = 'http://localhost:3000';

  it('successfully loads', () => {
    cy.visit('/signup');
  });

  /**
   * R2F1 - Registrazione al sistema
   * R2F1.1 - inserimento nome
   * R2F1.2 - inserimento cognome
   * R2F1.3 - inserimento indirizzo email
   * R2F1.4 - inserimento nome utente
   * R2F1.5 - inserimento password
   *
   */
  describe('Sign up form', () => {
    it('should display signup form inputs enabled and submit disabled', () => {
      cy.visit('/signup');
      cy.get('form');
      cy.get('[data-testid="firstName"]').should('be.enabled');
      cy.get('[data-testid="lastName"]').should('be.enabled');
      cy.get('[data-testid="username"]').should('be.enabled');
      cy.get('[data-testid="email"]').should('be.enabled');
      cy.get('[data-testid="psw"]').should('be.enabled');
      cy.get('[data-testid="submit"]').should('be.disabled');
    });

    it('should display an error message and disabled submit button when clock-captcha is not available', () => {
      cy.intercept('GET', `${backendUrl}/clock-captcha`, (req) => {
        req.reply({
          status: 400,
        });
      }).as('signupPost');

      cy.visit('/signup');

      cy.wait('@signupPost');

      cy.get('.error').should('be.visible');
      cy.get('[data-testid="submit"]').should('be.disabled');
    });

    it('should enabled submit button when all data are inserted and clock captcha is visible', () => {
      cy.visit('/signup');
      cy.get('[data-testid="firstName"]').type('nome');
      cy.get('[data-testid="lastName"]').type('cognome');
      cy.get('[data-testid="username"]').type('nomeUtente#123');
      cy.get('[data-testid="email"]').type('esempio@test.com');
      cy.get('[data-testid="psw"]').type('Password987');

      cy.intercept('GET', 'http://localhost:3000/clock-captcha', {
        statusCode: 200,
      });

      cy.get('[data-testid="submit"]').should('be.enabled');
    });
  });

  /**
   * R1F1 Risoluzione CAPTCHA
   */
  describe('clock CAPTCHA', () => {
    beforeEach(() => {
      cy.visit('/signup');
    });

    it('should display the image of the clock', () => {
      cy.get('canvas').should('be.visible');
    });

    it('should display the form for clock-captcha input', () => {
      cy.get('#clock-captcha_signup input').should('be.enabled');
    });
  });

  /**
   * R3F1 - Visualizzazione password in chiaro
   */
  describe('plaintext password', () => {
    beforeEach(() => {
      cy.visit('/signup');
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
   * R2F9.1 - nome necessario
   * R2F9.2 - cognome necessario
   * R2F9.3 - indirizzo email necessario
   * R2F9.4 - nome utente necessario
   * R2F9.5 - password necessaria
   */
  describe('Required error', () => {
    beforeEach(() => {
      cy.visit('/signup');
    });
    //nome
    it('should display "firstname required" error when there is no type in input', () => {
      cy.get('[data-testid="firstName"]').type('mario'); //inizia a digitare
      cy.get('[data-testid="firstName"]').clear(); //cancella il campo necessario
      cy.get('[data-testid="lastName"]').focus(); //sposta il focus

      cy.get('mat-error').should(
        'have.text',
        ' Nome necessario per effettuare la registrazione. '
      ); //deve ricordare all'utente che il campo lasciato bianco deve essere compilato
    });

    //cognome
    it('should display "lastname required" error when there is no type in input', () => {
      cy.get('[data-testid="lastName"]').type('mario'); //inizia a digitare
      cy.get('[data-testid="lastName"]').clear(); //cancella il campo necessario
      cy.get('[data-testid="firstName"]').focus(); //sposta il focus

      cy.get('mat-error').should(
        'have.text',
        ' Cognome necessario per effettuare la registrazione. '
      ); //deve ricordare all'utente che il campo lasciato bianco deve essere compilato
    });

    //username
    it('should display "username required" error when there is no type in input', () => {
      cy.get('[data-testid="username"]').type('mario'); //inizia a digitare
      cy.get('[data-testid="username"]').clear(); //cancella il campo necessario
      cy.get('[data-testid="firstName"]').focus(); //sposta il focus

      cy.get('mat-error').should(
        'have.text',
        ' Username necessario per effettuare la registrazione. '
      ); //deve ricordare all'utente che il campo lasciato bianco deve essere compilato
    });

    it('should display "email required" error when there is no email in input', () => {
      cy.get('[data-testid="email"]').type('mario'); //inizia a digitare
      cy.get('[data-testid="email"]').clear(); //cancella il campo necessario
      cy.get('[data-testid="psw"]').focus(); //sposta il focus

      cy.get('mat-error').should(
        'have.text',
        ' Email necessaria per effettuare la registrazione. '
      ); //deve ricordare all'utente che il campo lasciato bianco deve essere compilato
    });
    it('should display "password required" error when there is no password in input', () => {
      cy.get('[data-testid="psw"]').type('pass'); //inizia a digitare
      cy.get('[data-testid="psw"]').clear(); //cancella il campo necessario
      cy.get('[data-testid="email"]').focus(); //sposta il focus

      cy.get('mat-error').should(
        'have.text',
        ' Password necessaria per effettuare la registrazione. '
      ); //deve ricordare all'utente che il campo lasciato bianco deve essere compilato
    });
  });

  /**
   * R2F3 - Errore formato errato
   * R2F3.1 - formato nome errato
   * R2F3.2 - formato cognome errato
   * R2F3.3 - formato  email errato
   *
   */
  describe('Format error', () => {
    beforeEach(() => {
      cy.visit('/signup');
    });
    it('should display an error message when firstname format is invalid', () => {
      cy.get('[data-testid="firstName"]').type('#nome123');
      cy.get('[data-testid="lastName"]').focus();
      cy.get('mat-error').should('have.text', ' Formato nome non valido. ');
    });
    it('should display an error message when lastname format is invalid', () => {
      cy.get('[data-testid="lastName"]').type('#cognome123');
      cy.get('[data-testid="firstName"]').focus();
      cy.get('mat-error').should('have.text', ' Formato cognome non valido. ');
    });
    it('should display an error message when email format is invalid', () => {
      cy.get('[data-testid="email"]').type('esempio@sbagliato');
      cy.get('[data-testid="psw"]').focus();
      cy.get('mat-error').should('have.text', ' Inserisci una email valida. ');
    });
  });

  /**
   * R2F5 - Errore email già in uso
   */
  describe('Used Email', () => {
    it('should display an error message when email already registered', () => {
      cy.intercept('POST', `${backendUrl}/users`, (req) => {
        const customResponse = {
          statusCode: 400,
          body: {
            details: 'USED_EMAIL',
          },
        };

        req.reply(customResponse);
      }).as('signupPost');

      cy.visit('/signup');

      cy.get('[data-testid="firstName"]').type('nome');
      cy.get('[data-testid="lastName"]').type('cognome');
      cy.get('[data-testid="username"]').type('nomeUtente#123');
      cy.get('[data-testid="email"]').type('esempio@test.com');
      cy.get('[data-testid="psw"]').type('Password987');
      cy.get('#clock-captcha_signup input').type('07:45');

      cy.get('[data-testid="submit"]').click();

      cy.wait('@signupPost');

      cy.get('@signupPost').then((interception) => {
        cy.get('mat-error').should('have.text', ' Email già in uso. ');
      });
    });
  });

  /**
   * R2F6 - Errore fallimento test clock CAPTCHA
   */
  describe('Bad Captcha', () => {
    it('should display an error message in case of bad captcha', () => {
      cy.intercept('POST', `${backendUrl}/users`, (req) => {
        const customResponse = {
          statusCode: 400,
          body: {
            details: 'BAD_CAPTCHA',
          },
        };

        req.reply(customResponse);
      }).as('postRequest'); // Assegna un alias all'intercettazione

      cy.visit('/signup');

      cy.get('[data-testid="firstName"]').type('nome');
      cy.get('[data-testid="lastName"]').type('cognome');
      cy.get('[data-testid="username"]').type('nomeUtente#123');
      cy.get('[data-testid="email"]').type('esempio@test.com');
      cy.get('[data-testid="psw"]').type('Password987');
      cy.get('#clock-captcha_signup input').type('07:45');

      cy.get('[data-testid="submit"]').click();

      cy.wait('@postRequest'); // Attende la risposta del backend utilizzando l'alias assegnato all'intercettazione

      cy.get('@postRequest').then((interception) => {
        cy.get('#clock-captcha_signup p').should(
          'have.text',
          'OPS, ORARIO SCORRETTO!'
        );
      });
    });
  });

  /**
   * R2F4 - Errore password non sicura
   * R2F4.1 - vincolo lunghezza non rispettato
   * R2F4.2 - vincolo almeno una lettera minuscola non rispettato
   * R2F4.3 - vincolo almeno una lettera maiuscola non rispettato
   * R2F4.4 - vincolo almeno un valore numerico non rispettato
   */
  describe('Email rules', () => {
    beforeEach(() => {
      cy.visit('/signup');
    });
    it("should display an error message when password' length is less then 8", () => {
      cy.get('[data-testid="psw"]').type('Psw123');
      cy.get('#clock-captcha_signup input').focus();

      cy.get('mat-error').should(
        'have.text',
        ' La password deve avere almeno 8 caratteri, almeno un carattere minuscolo, almeno un carattere maiuscolo e almeno un numero '
      );
    });
    it('should display an error message when password do not have a lowercase letter', () => {
      cy.get('[data-testid="psw"]').type('PASSWORD1234');
      cy.get('#clock-captcha_signup input').focus();
      cy.get('mat-error').should(
        'have.text',
        ' La password deve avere almeno 8 caratteri, almeno un carattere minuscolo, almeno un carattere maiuscolo e almeno un numero '
      );
    });
    it('should display an error message when password do not have a capital letter', () => {
      cy.get('[data-testid="psw"]').type('password1234');
      cy.get('#clock-captcha_signup input').focus();
      cy.get('mat-error').should(
        'have.text',
        ' La password deve avere almeno 8 caratteri, almeno un carattere minuscolo, almeno un carattere maiuscolo e almeno un numero '
      );
    });
    it('should display an error message when password do not have a number', () => {
      cy.get('[data-testid="psw"]').type('Password!');
      cy.get('#clock-captcha_signup input').focus();
      cy.get('mat-error').should(
        'have.text',
        ' La password deve avere almeno 8 caratteri, almeno un carattere minuscolo, almeno un carattere maiuscolo e almeno un numero '
      );
    });
  });
});
