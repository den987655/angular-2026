import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type TelegramAccountStatus = 'pending' | 'active' | 'banned';

export interface TelegramAccount {
  id: string;
  phone: string;
  sessionString: string | null;
  status: TelegramAccountStatus;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class TelegramAccountsService {
  private readonly base = '/api/telegram-accounts';

  constructor(private readonly http: HttpClient) {}

  list(): Observable<TelegramAccount[]> {
    return this.http.get<TelegramAccount[]>(this.base);
  }

  create(payload: {
    phone: string;
    sessionString?: string | null;
    status?: TelegramAccountStatus;
  }): Observable<TelegramAccount> {
    return this.http.post<TelegramAccount>(this.base, payload);
  }

  update(
    id: string,
    payload: {
      phone?: string;
      sessionString?: string | null;
      status?: TelegramAccountStatus;
    }
  ): Observable<TelegramAccount> {
    return this.http.patch<TelegramAccount>(`${this.base}/${id}`, payload);
  }

  remove(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }

  requestCode(phone: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/request-code`, {
      phone,
    });
  }

  verifyCode(phone: string, code: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/verify`, {
      phone,
      code,
    });
  }
}
