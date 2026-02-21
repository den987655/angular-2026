import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  TelegramAccount,
  TelegramAccountsService,
  TelegramAccountStatus,
} from '../../core/api/telegram-accounts.service';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="accounts-page">
      <header class="page-head">
        <h2>Менеджер аккаунтов</h2>
        <button type="button" class="primary-btn" (click)="openModal()">
          Добавить аккаунты
        </button>
      </header>

      <section class="toolbar card">
        <input class="search" placeholder="Поиск по аккаунтам" />
        <select [formControl]="setupForm.controls.project">
          <option value="all">Все проекты</option>
          <option value="sales">Sales Bot</option>
          <option value="invite">Invite Flow</option>
        </select>
        <button class="ghost-btn" type="button">Фильтры</button>
      </section>

      <section class="card" *ngIf="accounts.length; else emptyState">
        <div class="table-header">
          <strong>Аккаунты</strong>
          <button type="button" class="ghost-btn" (click)="loadAccounts()">Обновить</button>
        </div>
        <p class="status-line" *ngIf="message">{{ message }}</p>
        <p class="status-line error" *ngIf="error">{{ error }}</p>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Phone</th>
                <th>Status</th>
                <th>Session</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let acc of accounts">
                <td>
                  <input [value]="editState[acc.id]?.phone ?? acc.phone" (input)="patchEdit(acc.id, 'phone', $any($event.target).value)" />
                </td>
                <td>
                  <select [value]="editState[acc.id]?.status ?? acc.status" (change)="patchEdit(acc.id, 'status', $any($event.target).value)">
                    <option value="pending">pending</option>
                    <option value="active">active</option>
                    <option value="banned">banned</option>
                  </select>
                </td>
                <td>
                  <input [value]="editState[acc.id]?.sessionString ?? (acc.sessionString || '')" (input)="patchEdit(acc.id, 'sessionString', $any($event.target).value)" />
                </td>
                <td>{{ acc.createdAt | date: 'short' }}</td>
                <td class="actions">
                  <button class="ghost-btn" type="button" (click)="save(acc.id)">Сохранить</button>
                  <button class="danger-btn" type="button" (click)="remove(acc.id)">Удалить</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <ng-template #emptyState>
        <section class="empty-wrap card">
          <div class="empty-illustration"></div>
          <div>
            <h3>Аккаунты не найдены</h3>
            <p>Попробуйте изменить фильтры или добавить новые аккаунты</p>
            <button type="button" class="primary-btn" (click)="openModal()">Добавить аккаунты</button>
          </div>
        </section>
      </ng-template>

      <div class="modal-overlay" *ngIf="modalOpen" (click)="closeModal()"></div>
      <section class="modal" *ngIf="modalOpen">
        <header class="modal-head">
          <h3>Выберите аккаунты для загрузки</h3>
          <button type="button" class="close-btn" (click)="closeModal()">x</button>
        </header>

        <label class="field">
          <span>Выберите проект</span>
          <select [formControl]="setupForm.controls.project">
            <option value="all">Все проекты</option>
            <option value="sales">Sales Bot</option>
            <option value="invite">Invite Flow</option>
          </select>
        </label>

        <div class="session-block">
          <span>Выбор сессии</span>
          <div class="toggle">
            <button type="button" [class.active]="setupForm.controls.sessionMode.value === 'current'" (click)="setupForm.controls.sessionMode.setValue('current')">Использовать текущую</button>
            <button type="button" [class.active]="setupForm.controls.sessionMode.value === 'new'" (click)="setupForm.controls.sessionMode.setValue('new')">Создать новую</button>
          </div>
        </div>

        <label class="dropzone">
          <input type="file" multiple (change)="onFilesChanged($event)" />
          <p>Переместите архивы с аккаунтами сюда</p>
          <span>или</span>
          <div class="choose-btn">Выбрать аккаунты</div>
        </label>

        <div class="archives" *ngIf="selectedArchives.length">
          <div class="archive-row" *ngFor="let file of selectedArchives">{{ file.name }}</div>
        </div>

        <div class="manual-form">
          <h4>Добавить аккаунт вручную</h4>
          <form [formGroup]="createForm" class="create-grid">
            <input formControlName="phone" placeholder="+79990000000" />
            <select formControlName="status">
              <option value="pending">pending</option>
              <option value="active">active</option>
              <option value="banned">banned</option>
            </select>
          </form>
        </div>

        <div class="verify-form">
          <h4>Telegram Verify</h4>
          <form [formGroup]="verifyForm" class="verify-grid">
            <input formControlName="phone" placeholder="+79990000000" />
            <button type="button" class="ghost-btn" [disabled]="verifyForm.controls.phone.invalid || loading" (click)="requestCode()">
              Request code
            </button>
            <input formControlName="code" placeholder="12345" />
            <button type="button" class="ghost-btn" [disabled]="verifyForm.invalid || loading" (click)="verifyCode()">
              Verify
            </button>
          </form>
        </div>

        <p class="status-line" *ngIf="message">{{ message }}</p>
        <p class="status-line error" *ngIf="error">{{ error }}</p>

        <footer class="modal-foot">
          <button type="button" class="plain-btn" (click)="closeModal()">Отменить</button>
          <button type="button" class="primary-btn" [disabled]="createForm.invalid || loading" (click)="submitModal()">
            Загрузить аккаунты
          </button>
        </footer>
      </section>
    </div>
  `,
  styles: [
    `
      .accounts-page {
        display: flex;
        flex-direction: column;
        gap: 14px;
        color: #1f2431;
      }
      .page-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .page-head h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 700;
      }
      .card {
        background: #fff;
        border: 1px solid #e1e5ef;
        border-radius: 12px;
        padding: 14px;
      }
      .toolbar {
        display: grid;
        grid-template-columns: 1fr 180px auto;
        gap: 8px;
        align-items: center;
      }
      .search,
      input,
      select {
        width: 100%;
        height: 38px;
        border-radius: 8px;
        border: 1px solid #d6dceb;
        background: #f8f9fd;
        padding: 0 10px;
      }
      .empty-wrap {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 18px;
        min-height: 340px;
      }
      .empty-illustration {
        width: 130px;
        height: 95px;
        border: 3px solid #7a90d8;
        border-radius: 14px;
        position: relative;
      }
      .empty-illustration::before {
        content: '';
        position: absolute;
        width: 56px;
        height: 12px;
        right: 10px;
        top: -15px;
        border-radius: 8px 8px 0 0;
        background: #4f66f3;
      }
      .empty-wrap h3 {
        margin: 0 0 8px;
        font-size: 25px;
      }
      .empty-wrap p {
        margin: 0 0 12px;
        color: #59617b;
      }
      .table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }
      .table-wrap {
        overflow: auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        min-width: 760px;
      }
      th, td {
        border-bottom: 1px solid #edf0f7;
        padding: 8px 6px;
        text-align: left;
      }
      th {
        font-size: 12px;
        color: #707a94;
      }
      .actions {
        display: flex;
        gap: 6px;
        justify-content: flex-end;
      }
      .primary-btn {
        height: 38px;
        border: none;
        border-radius: 8px;
        background: #4f66f3;
        color: #fff;
        padding: 0 14px;
        font-weight: 600;
        cursor: pointer;
      }
      .ghost-btn {
        height: 38px;
        border: 1px solid #d5dbec;
        border-radius: 8px;
        background: #f4f6fd;
        color: #3f4863;
        padding: 0 12px;
        cursor: pointer;
      }
      .danger-btn {
        height: 34px;
        border: none;
        border-radius: 8px;
        background: #fee2e2;
        color: #b91c1c;
        padding: 0 10px;
        cursor: pointer;
      }
      .status-line {
        margin: 0 0 8px;
        font-size: 13px;
        color: #2645cb;
      }
      .status-line.error {
        color: #b91c1c;
      }
      .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(22, 26, 37, 0.46);
        z-index: 39;
      }
      .modal {
        position: fixed;
        width: min(780px, calc(100vw - 24px));
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #fff;
        border-radius: 16px;
        border: 1px solid #dfe3ef;
        box-shadow: 0 24px 70px rgba(11, 20, 42, 0.35);
        z-index: 40;
        padding: 18px;
      }
      .modal-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }
      .modal-head h3 {
        margin: 0;
        font-size: 28px;
      }
      .close-btn {
        width: 34px;
        height: 34px;
        border-radius: 8px;
        border: 1px solid #d7ddef;
        background: #fff;
        cursor: pointer;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 10px;
      }
      .field span {
        font-size: 13px;
        color: #5d647a;
      }
      .session-block {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }
      .toggle {
        display: flex;
        background: #f0f3fc;
        border-radius: 10px;
        padding: 2px;
      }
      .toggle button {
        border: none;
        background: transparent;
        height: 34px;
        padding: 0 12px;
        border-radius: 8px;
        cursor: pointer;
      }
      .toggle button.active {
        background: #fff;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
      }
      .dropzone {
        display: block;
        border: 1px dashed #cfd6ea;
        border-radius: 12px;
        background: #fafbff;
        text-align: center;
        padding: 22px;
        margin-bottom: 10px;
      }
      .dropzone input {
        display: none;
      }
      .dropzone p {
        margin: 0 0 6px;
        color: #5d647a;
      }
      .dropzone span {
        display: block;
        color: #7a839b;
        margin-bottom: 8px;
      }
      .choose-btn {
        margin: 0 auto;
        width: 170px;
        height: 36px;
        border-radius: 8px;
        display: grid;
        place-items: center;
        background: #4f66f3;
        color: #fff;
        font-weight: 600;
      }
      .archives {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 10px;
      }
      .archive-row {
        padding: 6px 10px;
        background: #eef2ff;
        border-radius: 999px;
        font-size: 12px;
      }
      .manual-form,
      .verify-form {
        margin-top: 8px;
        border-top: 1px solid #edf0f7;
        padding-top: 10px;
      }
      .manual-form h4,
      .verify-form h4 {
        margin: 0 0 8px;
        font-size: 14px;
      }
      .create-grid {
        display: grid;
        grid-template-columns: 1fr 160px;
        gap: 8px;
      }
      .verify-grid {
        display: grid;
        grid-template-columns: 1fr 130px 120px 90px;
        gap: 8px;
      }
      .modal-foot {
        margin-top: 14px;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }
      .plain-btn {
        height: 38px;
        border: none;
        background: transparent;
        color: #5a627d;
        padding: 0 12px;
        cursor: pointer;
      }
      @media (max-width: 900px) {
        .toolbar,
        .create-grid,
        .verify-grid,
        .empty-wrap {
          grid-template-columns: 1fr;
        }
        .modal-head h3 {
          font-size: 21px;
        }
        .empty-wrap {
          flex-direction: column;
          text-align: center;
        }
      }
    `,
  ],
})
export class AccountsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly telegramAccountsApi = inject(TelegramAccountsService);

  accounts: TelegramAccount[] = [];
  selectedArchives: File[] = [];
  loading = false;
  modalOpen = false;
  message = '';
  error = '';
  editState: Record<string, Partial<TelegramAccount>> = {};

  setupForm = this.fb.nonNullable.group({
    project: ['all'],
    sessionMode: ['current'],
  });

  createForm = this.fb.nonNullable.group({
    phone: ['', Validators.required],
    status: ['pending' as TelegramAccountStatus],
  });

  verifyForm = this.fb.nonNullable.group({
    phone: ['', Validators.required],
    code: ['', Validators.required],
  });

  ngOnInit(): void {
    this.loadAccounts();
  }

  onFilesChanged(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedArchives = input.files ? Array.from(input.files) : [];
  }

  uploadAccounts(): void {
    this.message = `Выбрано архивов: ${this.selectedArchives.length}. Импорт подключается через API.`;
    this.error = '';
  }

  openModal(): void {
    this.modalOpen = true;
    this.message = '';
    this.error = '';
  }

  closeModal(): void {
    this.modalOpen = false;
  }

  loadAccounts(): void {
    this.loading = true;
    this.telegramAccountsApi.list().subscribe({
      next: (res) => {
        this.accounts = res;
        this.loading = false;
        this.error = '';
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Не удалось загрузить аккаунты';
        this.loading = false;
      },
    });
  }

  createAccount(): void {
    if (this.createForm.invalid) return;
    this.loading = true;
    this.message = '';
    this.error = '';
    this.telegramAccountsApi.create(this.createForm.getRawValue()).subscribe({
      next: () => {
        this.createForm.patchValue({ phone: '', status: 'pending' });
        this.message = 'Аккаунт добавлен';
        this.loadAccounts();
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Не удалось добавить аккаунт';
        this.loading = false;
      },
    });
  }

  submitModal(): void {
    this.createAccount();
    this.uploadAccounts();
    if (!this.error) {
      this.closeModal();
    }
  }

  patchEdit(id: string, key: keyof TelegramAccount, value: unknown): void {
    this.editState[id] = { ...this.editState[id], [key]: value as never };
  }

  save(id: string): void {
    const patch = this.editState[id];
    if (!patch) return;
    this.loading = true;
    this.message = '';
    this.error = '';
    this.telegramAccountsApi.update(id, patch).subscribe({
      next: () => {
        delete this.editState[id];
        this.message = 'Аккаунт обновлен';
        this.loadAccounts();
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Не удалось обновить аккаунт';
        this.loading = false;
      },
    });
  }

  remove(id: string): void {
    this.loading = true;
    this.message = '';
    this.error = '';
    this.telegramAccountsApi.remove(id).subscribe({
      next: () => {
        this.message = 'Аккаунт удален';
        this.loadAccounts();
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Не удалось удалить аккаунт';
        this.loading = false;
      },
    });
  }

  requestCode(): void {
    const phone = this.verifyForm.controls.phone.value;
    if (!phone) return;
    this.loading = true;
    this.message = '';
    this.error = '';
    this.telegramAccountsApi.requestCode(phone).subscribe({
      next: (res) => {
        this.loading = false;
        this.message = res.message;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message ?? 'Не удалось отправить код';
      },
    });
  }

  verifyCode(): void {
    const { phone, code } = this.verifyForm.getRawValue();
    this.loading = true;
    this.message = '';
    this.error = '';
    this.telegramAccountsApi.verifyCode(phone, code).subscribe({
      next: (res) => {
        this.loading = false;
        this.message = res.message;
        this.verifyForm.patchValue({ code: '' });
        this.loadAccounts();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message ?? 'Не удалось подтвердить код';
      },
    });
  }
}
