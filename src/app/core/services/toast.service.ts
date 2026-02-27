import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'info' | 'warning' | 'danger';

export type Toast = {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  ttlMs?: number;
};

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  push(t: Omit<Toast, 'id'>) {
    const id = crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    const toast: Toast = { id, ttlMs: 3500, ...t };
    this.toasts.update((arr) => [toast, ...arr]);

    window.setTimeout(() => this.remove(id), toast.ttlMs);
  }

  remove(id: string) {
    this.toasts.update((arr) => arr.filter((t) => t.id !== id));
  }
}