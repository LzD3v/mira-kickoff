import { Injectable, TemplateRef, signal } from '@angular/core';

export type ModalState = {
  open: boolean;
  title?: string;
  template?: TemplateRef<unknown>;
  closeLabel?: string;
};

@Injectable({ providedIn: 'root' })
export class ModalService {
  readonly state = signal<ModalState>({ open: false });

  open(title: string, template: TemplateRef<unknown>, closeLabel = 'Fechar') {
    this.state.set({ open: true, title, template, closeLabel });
  }

  close() {
    this.state.set({ open: false });
  }
}