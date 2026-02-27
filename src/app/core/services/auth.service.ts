import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';

export type Session = {
  token: string;
  user: { email: string; name: string };
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly KEY = 'mira_session';
  readonly session = signal<Session | null>(null);
  readonly isAuthenticated = computed(() => !!this.session()?.token);

  constructor(private router: Router) {
    this.hydrate();
  }

  private hydrate() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Session;
      if (parsed?.token) this.session.set(parsed);
    } catch {
      localStorage.removeItem(this.KEY);
    }
  }

  async login(email: string, password: string): Promise<void> {
    // Mock (Kick-off)
    await new Promise((r) => setTimeout(r, 650));

    const ok = email.trim().toLowerCase() === 'demo@mira.app' && password === 'mira123';
    if (!ok) throw new Error('E-mail ou senha inválidos.');

    const s: Session = {
      token: 'mock.jwt.token',
      user: { email, name: 'Demo User' },
    };

    this.session.set(s);
    localStorage.setItem(this.KEY, JSON.stringify(s));
    await this.router.navigateByUrl('/app/dashboard');
  }

  logout() {
    this.session.set(null);
    localStorage.removeItem(this.KEY);
    void this.router.navigateByUrl('/login');
  }

  getToken(): string | null {
    return this.session()?.token ?? null;
  }
}