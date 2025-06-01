import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
// import { environment } from '../../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class LoanApplicationService {
  private apiUrl = `${environment.baseUrl}/api/create-loan`;

  constructor(private http: HttpClient) {}

  createLoanApplication(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}
