import { environment } from './../../../environments/environment';
import { Router, RouterState } from '@angular/router';
import { Cidadao } from './../../models/cidadao';
import { Medico } from './../../models/medico';
import { User } from './../../models/user';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, catchError, retry } from 'rxjs/operators';
import { Role } from 'src/app/models/role';


@Injectable({
  providedIn: 'root'
})
export class MedicoService {
  private currentUserSubject: BehaviorSubject<User>;
  user: User;
  currentUser: Observable<User>;
  role: string;
  constructor(private httpClient: HttpClient, private router: Router) { }
  httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Response-Type': 'text',
  Authorization: 'Bearer ' + localStorage.getItem('token') } )
};
statusCode: number;


// API: GET /medico
getMedicoById(crm: string): Observable<Medico[]> {
  return this.httpClient.get<Medico[]>(environment.api + '/hasmart/api/Medico' + crm, this.httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError));
}

// API: POST /HaSmart/api/medico
public createCidadao(medico: Medico): Observable<Medico> {
  return this.httpClient.post<Medico>((environment.api + '/hasmart/api/Medico'), medico, this.httpOptions)
  .pipe(
    catchError(this.handleError));
}


handleError(error: HttpErrorResponse) {
  let errorMessage = '';
  if (error.error instanceof ErrorEvent) {
    // Erro ocorreu no lado do client
    errorMessage = error.error.message;
  } else {
    // Erro ocorreu no lado do servidor
    errorMessage = `Código do erro: ${error.status}, ` + `menssagem: ${error.message}`;
  }
  // console.log(errorMessage);
  // console.log(error);
  this.statusCode = error.status;
  return throwError(error);
}
login(usernameForLogin?: string, password?: string) {
  if (usernameForLogin === 'admin') {
    this.user = {
      username: usernameForLogin,
      role: Role.Admin,
      firstName: 'Fábio',
      lastName: 'Martins'
    };
    this.authenticate(usernameForLogin).subscribe();
    localStorage.setItem('currentUser', JSON.stringify(this.user));
    // this.router.navigate(['/admin']);
  } else if (usernameForLogin === 'user') {
    this.user = {
      username: usernameForLogin,
      role: Role.User,
      firstName: 'Maria',
      lastName: 'Andrade'
    };
    this.authenticate(usernameForLogin).subscribe();
    localStorage.setItem('currentUser', JSON.stringify(this.user));
    // this.currentUserSubject.next(this.user);

  } else if (usernameForLogin === 'medic') {
    this.user = {
      username: usernameForLogin,
      role: Role.Medico,
      firstName: 'George',
      lastName: 'Matos',
      crm: '123123123'
    };
    this.authenticate(usernameForLogin).subscribe();
    localStorage.setItem('currentUser', JSON.stringify(this.user));

  }
}
authenticate(role: string): Observable<any> {
const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
const body = new URLSearchParams();
body.set('grant_type', 'client_credentials');
if (role === 'admin') {

  body.set('client_id', 'admin');
  body.set('client_secret', 'admin');
} else {

body.set('client_id', 'atendente');
body.set('client_secret', 'atendente');
}

return this.httpClient.post<any>(environment.auth + '/connect/token', body.toString(), {
  headers
}).pipe(
  map(jwt => {
    if (jwt && jwt.access_token) {
      localStorage.setItem('token', jwt.access_token.toString());
    }
  })
);
}
}