import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comaker } from '../../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ComakerService {
  private apiUrl = `${environment.baseUrl}/api`;

  constructor(private http: HttpClient) { }

  getAllComakers(): Observable<Comaker[]> {
    return this.http.get<Comaker[]>(`${this.apiUrl}/comakers`);
  }

  getComakerById(id: number): Observable<Comaker> {
    return this.http.get<Comaker>(`${this.apiUrl}/comaker/${id}`);
  }

  createComaker(comaker: Partial<Comaker>): Observable<Comaker> {
    return this.http.post<Comaker>(`${this.apiUrl}/create-comaker`, comaker);
  }

  updateComaker(id: number, comaker: Partial<Comaker>): Observable<Comaker> {
    return this.http.put<Comaker>(`${this.apiUrl}/update-comaker/${id}`, comaker);
  }

  deleteComaker(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete-comaker`, { params: { id: id.toString() } });
  }
}