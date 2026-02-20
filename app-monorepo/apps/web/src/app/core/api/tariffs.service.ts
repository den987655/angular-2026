import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Tariff {
  id: string;
  name: string;
  price: number;
  period?: 'month';
  periodDays?: number;
  features: string[];
}

@Injectable({ providedIn: 'root' })
export class TariffsService {
  private readonly base = '/api';

  constructor(private readonly http: HttpClient) {}

  getTariffs(): Observable<Tariff[]> {
    return this.http.get<Tariff[]>(`${this.base}/tariffs`);
  }
}
