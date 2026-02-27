import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { NgIf, NgTemplateOutlet } from '@angular/common';
import { ModalService } from '@core/services/modal.service';

@Component({
  selector: 'mira-ui-modal-host',
  standalone: true,
  imports: [NgIf, NgTemplateOutlet],
  template: `
    <div class="overlay" *ngIf="modal.state().open" (keydown.escape)="close()" tabindex="-1">
      <div class="dialog" role="dialog" aria-modal="true" [attr.aria-label]="modal.state().title ?? 'Modal'">
        <header class="head">
          <div class="title">{{ modal.state().title }}</div>
          <button #closeBtn class="x focus-ring" type="button" (click)="close()" [attr.aria-label]="modal.state().closeLabel ?? 'Fechar'">×</button>
        </header>

        <section class="body">
        <ng-container *ngIf="modal.state().template as tpl" [ngTemplateOutlet]="tpl"></ng-container>
        </section>

        <footer class="foot">
          <button class="btn focus-ring" type="button" (click)="close()">{{ modal.state().closeLabel ?? 'Fechar' }}</button>
        </footer>
      </div>

      <button class="backdrop" type="button" (click)="close()" aria-label="Fechar modal"></button>
    </div>
  `,
  styleUrl: './ui-modal-host.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiModalHostComponent implements AfterViewInit {
  readonly modal = inject(ModalService);

  @ViewChild('closeBtn') closeBtn?: ElementRef<HTMLButtonElement>;

  ngAfterViewInit(): void {
    // foco inicial (a11y)
    queueMicrotask(() => this.closeBtn?.nativeElement?.focus());
  }

  close() {
    this.modal.close();
  }
}