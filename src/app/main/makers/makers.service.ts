import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Maker } from '../../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MakerService {
  private apiUrl = `${environment.baseUrl}/api`;

  constructor(private http: HttpClient) { }

  getAllMakers(): Observable<Maker[]> {
    return this.http.get<Maker[]>(`${this.apiUrl}/makers`);
  }

  getMakerById(id: number): Observable<Maker> {
    return this.http.get<Maker>(`${this.apiUrl}/maker/${id}`);
  }

  createMaker(maker: Partial<Maker>): Observable<Maker> {
    return this.http.post<Maker>(`${this.apiUrl}/create-maker`, maker);
  }

  checkMaker(maker: Partial<Maker>): Observable<Maker> {
    return this.http.post<Maker>(`${this.apiUrl}/makers/check-duplicate`, maker);
  }

  updateMaker(id: number, maker: Partial<Maker>): Observable<Maker> {
    return this.http.put<Maker>(`${this.apiUrl}/update-maker/${id}`, maker);
  }

  deleteMaker(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete-maker`, { params: { id: id.toString() } });
  }
}