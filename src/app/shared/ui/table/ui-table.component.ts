import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

export type UiColumn<T> = {
  header: string;
  key: keyof T;
};

@Component({
  selector: 'mira-ui-table',
  standalone: true,
  imports: [NgFor, NgIf],
  template: `
    <div class="wrap" role="region" [attr.aria-label]="ariaLabel">
      <table class="tbl" *ngIf="rows?.length; else empty">
        <thead>
          <tr>
            <th *ngFor="let c of columns">{{ c.header }}</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let r of rows">
            <td *ngFor="let c of columns">{{ r[c.key] }}</td>
          </tr>
        </tbody>
      </table>

      <ng-template #empty>
        <div class="empty muted">Sem dados.</div>
      </ng-template>
    </div>
  `,
  styleUrl: './ui-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiTableComponent<T extends Record<string, any>> {
  @Input({ required: true }) columns!: UiColumn<T>[];
  @Input() rows: T[] = [];
  @Input() ariaLabel = 'Tabela';
}