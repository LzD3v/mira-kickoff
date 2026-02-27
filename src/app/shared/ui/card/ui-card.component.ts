import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'mira-ui-card',
  standalone: true,
  template: `
    <section class="card">
      <ng-content />
    </section>
  `,
  styleUrl: './ui-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiCardComponent {}