import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'mira-ui-toast-host',
  standalone: true,
  imports: [NgFor, NgIf],
  template: `
    <div class="host" aria-live="polite" aria-relevant="additions">
      <div class="toast" *ngFor="let t of toast.toasts()" [attr.data-type]="t.type" role="status">
        <div class="toast__top">
          <div class="toast__title">{{ t.title }}</div>
          <button class="x focus-ring" type="button" (click)="toast.remove(t.id)" aria-label="Fechar notificação">×</button>
        </div>
        <div class="toast__msg muted" *ngIf="t.message">{{ t.message }}</div>
      </div>
    </div>
  `,
  styleUrl: './ui-toast-host.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiToastHostComponent {
  readonly toast = inject(ToastService);
}