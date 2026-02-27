import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { UiButtonComponent } from '@ui/button/ui-button.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'mira-ui-empty-state',
  standalone: true,
  imports: [NgIf, UiButtonComponent],
  template: `
    <div class="wrap">
      <div class="icon" aria-hidden="true">◌</div>
      <div class="title">{{ title }}</div>
      <div class="desc muted" *ngIf="description">{{ description }}</div>
      <div class="actions" *ngIf="actionLabel">
        <mira-ui-button variant="primary" (click)="action?.()">{{ actionLabel }}</mira-ui-button>
      </div>
    </div>
  `,
  styleUrl: './ui-empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiEmptyStateComponent {
  @Input() title = 'Nada por aqui ainda';
  @Input() description?: string;
  @Input() actionLabel?: string;
  @Input() action?: () => void;
}