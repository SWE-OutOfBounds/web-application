var ROUTES_INDEX = {"name":"<root>","kind":"module","className":"AppModule","children":[{"name":"routes","filename":"src/app/app-routing.module.ts","module":"AppRoutingModule","children":[{"path":"","component":"HomepageComponent"},{"path":"login","component":"LoginComponent","canActivate":["NotAuthGuard"]},{"path":"signup","component":"RegistrationComponent","canActivate":["NotAuthGuard"]},{"path":"**","redirectTo":""}],"kind":"module"}]}