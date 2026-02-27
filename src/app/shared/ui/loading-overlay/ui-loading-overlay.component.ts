import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'mira-ui-loading-overlay',
  standalone: true,
  imports: [NgIf],
  template: `
    <div class="overlay" *ngIf="show" role="status" aria-live="polite" aria-label="Carregando">
      <div class="box">
        <div class="spin" aria-hidden="true"></div>
        <div class="text">{{ label }}</div>
      </div>
    </div>
  `,
  styleUrl: './ui-loading-overlay.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiLoadingOverlayComponent {
  @Input() show = false;
  @Input() label = 'Carregando...';
}