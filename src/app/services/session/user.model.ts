/**
 * Si definisce un modello per raccogliere i dati relativi all'utente che ha effettuato l'accesso all'applicazione
 */
export class User {
  /**
   * Costruttore del modello che ne definisce le proprietà che ogni utente autenticato deve possedere
   *
   * @param name Nome con cui l'utente ha scelto di farsi chiamare dal sistema
   * @param email Indirizzo email fornito dall'utente
   * @param _sessionToken Token di sessione
   * @param _tokenExpDate Data e orario di scadenza del token
   */
  constructor(
    public name: string,
    public email: string,
    private _sessionToken: string,
    private _tokenExpDate: Date | null
  ) {}

  /**
   * Restituisce il token di sessione dell'utente solo quando è valido.
   */
  get token(): string | null {
    const currentTime: Date = new Date();

    //se il token non è mai stato generato oppure è scaduto il token di sessione sarà nullo
    if (!this._tokenExpDate || currentTime > this._tokenExpDate) {
      return null;
    }

    //il token esiste ed è ancora valido
    return this._sessionToken;
  }
}
