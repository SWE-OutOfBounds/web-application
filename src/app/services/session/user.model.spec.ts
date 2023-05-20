import { User } from './user.model';

describe('User', () => {
  let user: User;

  beforeEach(() => {
    // Crea una nuova istanza di Utente prima di ogni test
    const tokenExpDate = new Date(); // imposta la scadenza del token di sessione
    tokenExpDate.setHours(tokenExpDate.getHours() + 1); // aggiunge 1 ora alla scadenza
    user = new User(
      'John Doe',
      'john@example.com',
      'sessionToken',
      tokenExpDate
    );
  });

  it('should return null if the token is expired', () => {
    // Imposta la scadenza del token ad una data già trascorsa
    user['_tokenExpDate'] = new Date(2022, 0, 1);

    // Il token ritornato dovrebbe essere nullo
    expect(user.token).toBeNull();
  });

  it('should return the session token if it is still valid', () => {
    // Il token creato per il test è valido per cui dovrebbe ritornare il token di sessione impostato nel test
    expect(user.token).toBe('sessionToken');
  });

  it('should return null if the token expiration date is not set', () => {
    // Elimina la scadenza del token
    user['_tokenExpDate'] = null;

    // La funzione dovrebbe ritornare il valore nullo
    expect(user.token).toBeNull();
  });
});
