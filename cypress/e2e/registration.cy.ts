describe('The Registration Page', () => {
  it('successfully loads', () => {
    cy.visit('/signup');
  });

  // describe('R2F1 - Registrazione al sistema', () => {
  //   it('R2F1.1 - inserimento nome', () => {});
  //   it('R2F1.2 - inserimento cognome', () => {});
  //   it('R2F1.3 - inserimento indirizzo email', () => {});
  //   it('R2F1.4 - inserimento nome utente', () => {});
  //   it('R2F1.5 - inserimento password', () => {});
  // });

  // describe('R1F1 . Risoluzione CAPTCHA', () => {});

  // describe('R3F1 - Visualizzazione password in chiaro', () => {});

  // describe('R2F9 - Errore requisito necessario', () => {
  //   it('R2F9.1 - nome necessario', () => {});
  //   it('R2F9.2 - cognome necessario', () => {});
  //   it('R2F9.3 - indirizzo email necessario', () => {});
  //   it('R2F9.4 - nome utente necessario', () => {});
  //   it('R2F9.5 - password necessaria', () => {});
  // });

  // describe('R2F3 - Errore formato errato', () => {
  //   it('R2F3.1 - formato nome errato', () => {});
  //   it('R2F3.2 - formato cognome errato', () => {});
  //   it('R2F3.3 - formato  email errato', () => {});
  // });

  // describe('R2F5 - Errore email già in uso', () => {});

  // describe('R2F6 - Errore fallimento test clock CAPTCHA ', () => {});

  // describe('R2F4 - Errore password non sicura', () => {
  //   it('R2F4.1 - vincolo lunghezza non rispettato', () => {});
  //   it('R2F4.2 - vincolo almeno una lettera minuscola non rispettato', () => {});
  //   it('R2F4.3 - vincolo almeno una lettera maiuscola non rispettato', () => {});
  //   it('R2F4.4 - vincolo almeno un valore numerico non rispettato', () => {});
  // });
});
