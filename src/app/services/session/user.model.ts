/*
  Si definisce un modello per gestire i dati relativi all'utente che ha effettuato l'accesso all'applicazione
*/

export class User {
  constructor(
    public email: string,
    private _sessionToken: string,
    private _tokenExpDate: Date
  ) {}


  get token(){
     const currentTime: Date = new Date();

    //se il token non è mai stato generato oppure è scaduto il token di sessione sarà nullo
    if(!this._tokenExpDate || currentTime > this._tokenExpDate){
      return null;
    }

    //il token esiste ed è ancora valido
    return this._sessionToken;
  }
}
