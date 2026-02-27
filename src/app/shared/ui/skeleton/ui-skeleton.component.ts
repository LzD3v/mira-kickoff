import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'mira-ui-skeleton',
  standalone: true,
  imports: [NgStyle],
  template: `<div class="sk" [ngStyle]="{ width, height, borderRadius: radius }" aria-hidden="true"></div>`,
  styleUrl: './ui-skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiSkeletonComponent {
  @Input() width = '100%';
  @Input() height = '14px';
  @Input() radius = '12px';
}