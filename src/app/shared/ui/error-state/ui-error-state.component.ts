import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { UiButtonComponent } from '@ui/button/ui-button.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'mira-ui-error-state',
  standalone: true,
  imports: [NgIf, UiButtonComponent],
  template: `
    <div class="wrap">
      <div class="icon" aria-hidden="true">!</div>
      <div class="title">{{ title }}</div>
      <div class="desc muted" *ngIf="description">{{ description }}</div>
      <div class="actions" *ngIf="actionLabel">
        <mira-ui-button variant="secondary" (click)="action?.()">{{ actionLabel }}</mira-ui-button>
      </div>
    </div>
  `,
  styleUrl: './ui-error-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiErrorStateComponent {
  @Input() title = 'Ops, algo deu errado';
  @Input() description?: string;
  @Input() actionLabel?: string;
  @Input() action?: () => void;
}