import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { NgClass } from '@angular/common';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

@Component({
  selector: 'mira-ui-button',
  standalone: true,
  imports: [NgClass, NgIf],
  template: `
    <button
      class="btn focus-ring"
      [attr.type]="type"
      [disabled]="disabled || loading"
      [ngClass]="['v-' + variant, 's-' + size, loading ? 'is-loading' : '']"
    >
      <span class="spinner" *ngIf="loading" aria-hidden="true"></span>
      <span class="label"><ng-content /></span>
    </button>
  `,
  styleUrl: './ui-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiButtonComponent {
  @Input() variant: Variant = 'primary';
  @Input() size: Size = 'md';
  @Input() type: 'button' | 'submit' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
}