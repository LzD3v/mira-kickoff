import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UiCardComponent } from '@ui/card/ui-card.component';
import { UiInputComponent } from '@ui/input/ui-input.component';
import { UiButtonComponent } from '@ui/button/ui-button.component';
import { ToastService } from '@core/services/toast.service';
import { AuthService } from '@core/services/auth.service';

type ThemePref = 'system' | 'dark' | 'light';
type WeekStart = 'mon' | 'sun';
type Currency = 'BRL' | 'USD' | 'EUR';
type Period = 7 | 30 | 90;

type Prefs = {
  notifications: boolean;
  weekly: boolean;
  weeklyEmail: boolean;
  hideAmounts: boolean;
  compact: boolean;
  autoCategorize: boolean;
  roundingSavings: boolean;

  theme: ThemePref;
  weekStart: WeekStart;
  currency: Currency;
  defaultInsightPeriod: Period;
};

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UiCardComponent, UiInputComponent, UiButtonComponent],
  template: `
    <div class="wrap">
      <header class="head">
        <div>
          <div class="title">Perfil & Config</div>
          <div class="muted sub">Kick-off • preferências locais (sem backend)</div>
        </div>

        <div class="head__actions">
          <mira-ui-button type="button" variant="primary" [loading]="saving()" (click)="save()">Salvar</mira-ui-button>
        </div>
      </header>

      <form class="grid" [formGroup]="form" (ngSubmit)="save()">
        <!-- Perfil -->
        <mira-ui-card class="panel">
          <div class="card">
            <div class="profile">
              <div class="avatar" aria-hidden="true">{{ initials() }}</div>
              <div>
                <div class="profile__name">{{ form.value.name || '—' }}</div>
                <div class="muted profile__mail">{{ form.value.email || '—' }}</div>
              </div>
            </div>

            <div class="fields">
              <mira-ui-input label="Nome (mock)" formControlName="name" placeholder="Seu nome" />
              <mira-ui-input
                label="E-mail (mock)"
                type="email"
                formControlName="email"
                placeholder="voce@exemplo.com"
              />
            </div>

            <div class="hint muted">
              TODO: persistir via API quando endpoints chegarem (ANEXO I).
            </div>
          </div>
        </mira-ui-card>

        <!-- Financeiro -->
        <mira-ui-card class="panel">
          <div class="card">
            <div class="sectionTitle">Financeiro</div>
            <div class="muted sectionSub">
              Base para limites, alertas e recomendações (mock). Depois vem da API.
            </div>

            <div class="fields">
              <label class="field">
                <span class="field__label">Moeda</span>
                <select class="select focus-ring" [value]="prefs().currency" (change)="setCurrency($any($event.target).value)">
                  <option value="BRL">BRL (R$)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </label>

              <mira-ui-input
                label="Orçamento mensal (mock)"
                type="number"
                formControlName="monthlyBudget"
                placeholder="Ex.: 3500"
              />

              <mira-ui-input
                label="Meta de economia/mês (mock)"
                type="number"
                formControlName="savingsGoal"
                placeholder="Ex.: 500"
              />

              <mira-ui-input
                label="Dia do pagamento (mock)"
                type="number"
                formControlName="payday"
                placeholder="Ex.: 5"
              />
            </div>

            <div class="hint muted">
              Dica: mesmo valores aproximados já deixam os insights muito mais úteis.
            </div>
          </div>
        </mira-ui-card>

        <!-- Preferências -->
        <mira-ui-card class="panel">
          <div class="card">
            <div class="sectionTitle">Preferências</div>

            <div class="group">
              <div class="groupTitle">Notificações & Resumos</div>

              <div class="pref">
                <div>
                  <div class="pref__name">Notificações</div>
                  <div class="muted pref__desc">Lembretes de tarefas e check-ins semanais (mock).</div>
                </div>

                <label class="switch" aria-label="Ativar notificações">
                  <input
                    type="checkbox"
                    role="switch"
                    [checked]="prefs().notifications"
                    [attr.aria-checked]="prefs().notifications"
                    (change)="toggle('notifications', $event)"
                  />
                  <span class="track" aria-hidden="true"></span>
                </label>
              </div>

              <div class="pref">
                <div>
                  <div class="pref__name">Resumo semanal</div>
                  <div class="muted pref__desc">Um overview simples de gastos/entradas (mock).</div>
                </div>

                <label class="switch" aria-label="Ativar resumo semanal">
                  <input
                    type="checkbox"
                    role="switch"
                    [checked]="prefs().weekly"
                    [attr.aria-checked]="prefs().weekly"
                    (change)="toggle('weekly', $event)"
                  />
                  <span class="track" aria-hidden="true"></span>
                </label>
              </div>

              <div class="pref">
                <div>
                  <div class="pref__name">Enviar resumo por e-mail</div>
                  <div class="muted pref__desc">Receber um e-mail com os pontos-chave (mock).</div>
                </div>

                <label class="switch" aria-label="Ativar resumo por e-mail">
                  <input
                    type="checkbox"
                    role="switch"
                    [checked]="prefs().weeklyEmail"
                    [attr.aria-checked]="prefs().weeklyEmail"
                    (change)="toggle('weeklyEmail', $event)"
                  />
                  <span class="track" aria-hidden="true"></span>
                </label>
              </div>

              <div class="pref">
                <div>
                  <div class="pref__name">Semana começa em</div>
                  <div class="muted pref__desc">Ajusta agenda e agrupamentos (mock).</div>
                </div>

                <div class="pref__right">
                  <select class="select focus-ring" [value]="prefs().weekStart" (change)="setWeekStart($any($event.target).value)">
                    <option value="mon">Segunda-feira</option>
                    <option value="sun">Domingo</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="group">
              <div class="groupTitle">Insights</div>

              <div class="pref">
                <div>
                  <div class="pref__name">Período padrão</div>
                  <div class="muted pref__desc">Define como o painel começa (ex.: 30 dias).</div>
                </div>

                <div class="pref__right">
                  <select
                    class="select focus-ring"
                    [value]="prefs().defaultInsightPeriod.toString()"
                    (change)="setDefaultInsightPeriod($any($event.target).value)"
                  >
                    <option value="7">7 dias</option>
                    <option value="30">30 dias</option>
                    <option value="90">90 dias</option>
                  </select>
                </div>
              </div>

              <div class="pref">
                <div>
                  <div class="pref__name">Auto-categorização</div>
                  <div class="muted pref__desc">Ajuda a agrupar gastos automaticamente (mock).</div>
                </div>

                <label class="switch" aria-label="Ativar auto-categorização">
                  <input
                    type="checkbox"
                    role="switch"
                    [checked]="prefs().autoCategorize"
                    [attr.aria-checked]="prefs().autoCategorize"
                    (change)="toggle('autoCategorize', $event)"
                  />
                  <span class="track" aria-hidden="true"></span>
                </label>
              </div>

              <div class="pref">
                <div>
                  <div class="pref__name">Arredondar economia sugerida</div>
                  <div class="muted pref__desc">Deixa recomendações mais “práticas” (ex.: R$ 47 → R$ 50).</div>
                </div>

                <label class="switch" aria-label="Arredondar economia sugerida">
                  <input
                    type="checkbox"
                    role="switch"
                    [checked]="prefs().roundingSavings"
                    [attr.aria-checked]="prefs().roundingSavings"
                    (change)="toggle('roundingSavings', $event)"
                  />
                  <span class="track" aria-hidden="true"></span>
                </label>
              </div>
            </div>

            <div class="group">
              <div class="groupTitle">Aparência & Privacidade</div>

              <div class="pref">
                <div>
                  <div class="pref__name">Tema</div>
                  <div class="muted pref__desc">Sistema, escuro ou claro.</div>
                </div>

                <div class="pref__right">
                  <select class="select focus-ring" [value]="prefs().theme" (change)="setTheme($any($event.target).value)">
                    <option value="system">Sistema</option>
                    <option value="dark">Escuro</option>
                    <option value="light">Claro</option>
                  </select>
                </div>
              </div>

              <div class="pref">
                <div>
                  <div class="pref__name">Ocultar valores</div>
                  <div class="muted pref__desc">Útil pra usar em público (mock).</div>
                </div>

                <label class="switch" aria-label="Ocultar valores">
                  <input
                    type="checkbox"
                    role="switch"
                    [checked]="prefs().hideAmounts"
                    [attr.aria-checked]="prefs().hideAmounts"
                    (change)="toggle('hideAmounts', $event)"
                  />
                  <span class="track" aria-hidden="true"></span>
                </label>
              </div>

              <div class="pref">
                <div>
                  <div class="pref__name">Modo compacto</div>
                  <div class="muted pref__desc">Menos espaçamento, mais informação por tela (mock).</div>
                </div>

                <label class="switch" aria-label="Modo compacto">
                  <input
                    type="checkbox"
                    role="switch"
                    [checked]="prefs().compact"
                    [attr.aria-checked]="prefs().compact"
                    (change)="toggle('compact', $event)"
                  />
                  <span class="track" aria-hidden="true"></span>
                </label>
              </div>

              <div class="pref pref--actions">
                <div>
                  <div class="pref__name">Padrões</div>
                  <div class="muted pref__desc">Voltar para as configurações recomendadas.</div>
                </div>

                <mira-ui-button type="button" variant="secondary" (click)="restoreDefaults()">
                  Restaurar
                </mira-ui-button>
              </div>
            </div>
          </div>
        </mira-ui-card>

        <!-- Sessão -->
        <mira-ui-card class="panel wide">
          <div class="card">
            <div class="sectionTitle">Sessão</div>
            <div class="muted">Logado como: <b>{{ auth.session()?.user?.email ?? '—' }}</b></div>

            <div class="danger">
              <div>
                <div class="danger__t">Sair</div>
                <div class="muted danger__d">Encerra a sessão mock e volta pro login.</div>
              </div>
              <mira-ui-button type="button" variant="secondary" (click)="auth.logout()">Sair</mira-ui-button>
            </div>
          </div>
        </mira-ui-card>

        <!-- Dados -->
        <mira-ui-card class="panel wide">
          <div class="card">
            <div class="sectionTitle">Dados</div>
            <div class="muted">Ferramentas locais (mock). Depois vira export real / LGPD.</div>

            <div class="dataRow">
              <div>
                <div class="dataRow__t">Exportar preferências</div>
                <div class="muted dataRow__d">Gera um JSON simples com seu setup (mock).</div>
              </div>
              <mira-ui-button type="button" variant="secondary" (click)="exportPrefs()">Exportar</mira-ui-button>
            </div>

            <div class="dataRow dangerRow">
              <div>
                <div class="dataRow__t">Limpar dados locais</div>
                <div class="muted dataRow__d">Remove preferências e perfil salvos nesse navegador.</div>
              </div>
              <mira-ui-button type="button" variant="secondary" (click)="clearLocalData()">Limpar</mira-ui-button>
            </div>
          </div>
        </mira-ui-card>
      </form>
    </div>
  `,
  styles: [
    `
      :host { display: block; }
      mira-ui-card { display: block; min-width: 0; }

      .wrap{
        max-width: 1040px;
        margin: 0 auto;
        display: grid;
        gap: 14px;
      }

      .head{
        display:flex;
        align-items:flex-end;
        justify-content:space-between;
        gap:12px;
        flex-wrap:wrap;
      }

      .title{
        font-weight: 950;
        font-size: 18px;
        letter-spacing: -0.2px;
      }
      .sub{ font-size: 12px; margin-top: 2px; }

      .head__actions{ display:flex; gap:10px; flex-wrap:wrap; }

      .grid{
        display:grid;
        grid-template-columns: 1fr;
        gap: 12px;
      }

      /* card premium (mesmo vibe das outras telas) */
      mira-ui-card.panel{
        padding: 0;
        border-radius: 24px;
        border: 1px solid rgba(255,255,255,0.10);
        background: linear-gradient(180deg, rgba(15,18,26,0.56), rgba(12,14,20,0.34));
        box-shadow: 0 24px 80px rgba(0,0,0,0.26);
        backdrop-filter: blur(12px);
        overflow: hidden;
        animation: rise 220ms ease both;
      }

      .card{
        padding: 16px;
        display:grid;
        gap: 14px;
      }

      .sectionTitle{
        font-weight: 950;
        letter-spacing: -0.2px;
      }

      .sectionSub{
        font-size: 12px;
        margin-top: -6px;
      }

      .profile{
        display:flex;
        align-items:center;
        gap: 12px;
      }

      .avatar{
        width: 46px;
        height: 46px;
        border-radius: 16px;
        display:grid;
        place-items:center;
        font-weight: 950;
        letter-spacing: -0.2px;
        background: rgba(124, 92, 255, 0.16);
        border: 1px solid rgba(124, 92, 255, 0.22);
        box-shadow: 0 18px 50px rgba(0,0,0,0.24);
      }

      .profile__name{
        font-weight: 950;
        letter-spacing: -0.2px;
      }

      .profile__mail{ font-size: 12px; }

      .fields{
        display:grid;
        gap: 12px;
      }

      .hint{ font-size: 12px; }

      /* grupos dentro de preferências */
      .group{
        display:grid;
        gap: 10px;
        padding-top: 12px;
        border-top: 1px solid rgba(255,255,255,0.08);
      }
      .group:first-of-type{
        padding-top: 0;
        border-top: 0;
      }
      .groupTitle{
        font-weight: 950;
        font-size: 12px;
        letter-spacing: -0.1px;
        color: rgba(255,255,255,0.86);
      }

      .pref{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap: 16px;
      }

      .pref__name{ font-weight: 850; }
      .pref__desc{
        font-size: 12px;
        margin-top: 2px;
        max-width: 54ch;
      }

      .pref__right{
        display:flex;
        justify-content:flex-end;
        min-width: 200px;
      }

      .pref--actions{
        padding-top: 2px;
      }

      /* select premium */
      .field{ display:grid; gap: 7px; min-width: 0; }
      .field__label{
        font-size: 12px;
        color: var(--muted, rgba(255,255,255,0.72));
        font-weight: 850;
      }

      .select{
        width: 100%;
        border-radius: 16px;
        padding: 12px 44px 12px 12px;
        border: 1px solid rgba(255,255,255,0.12);
        background: rgba(255,255,255,0.045);
        color: rgba(255,255,255,0.92);
        outline: none;
        min-height: 44px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        transition: border-color 160ms ease, background 160ms ease;
      }
      .select:hover{ background: rgba(255,255,255,0.06); }
      .select:focus{ border-color: rgba(133,94,217,0.45); }
      .select option{
        background: rgba(12,14,20,1);
        color: rgba(255,255,255,0.92);
      }

      /* switch acessível e “premium” */
      .switch{ position: relative; display: inline-flex; align-items: center; flex: 0 0 auto; }

      .switch input{
        width: 52px;
        height: 30px;
        appearance: none;
        border-radius: 999px;
        border: 1px solid var(--border);
        background: rgba(255,255,255,0.06);
        cursor: pointer;
        outline: none;
        transition: background 180ms ease, border-color 180ms ease;
      }

      .switch input:focus-visible { box-shadow: var(--focus); }

      .switch .track{
        position:absolute;
        left: 8px;
        top: 7px;
        width: 22px;
        height: 22px;
        border-radius: 999px;
        background: rgba(255,255,255,0.44);
        border: 1px solid rgba(255,255,255,0.16);
        box-shadow: 0 6px 18px rgba(0,0,0,0.25);
        transition: transform 180ms ease, background 180ms ease, border-color 180ms ease;
        pointer-events:none;
      }

      .switch input:checked{
        border-color: rgba(124,92,255,0.45);
        background: rgba(124,92,255,0.18);
      }

      .switch input:checked + .track{
        transform: translateX(22px);
        background: rgba(35,209,195,0.90);
        border-color: rgba(35,209,195,0.35);
      }

      :root[data-theme='light'] .switch input{
        background: rgba(17, 24, 39, 0.06);
        border-color: rgba(17, 24, 39, 0.18);
      }

      :root[data-theme='light'] .switch .track{
        background: rgba(17, 24, 39, 0.28);
        border-color: rgba(17, 24, 39, 0.10);
        box-shadow: 0 6px 18px rgba(2, 6, 23, 0.12);
      }

      :root[data-theme='light'] .switch input:checked{
        background: rgba(124,92,255,0.18);
        border-color: rgba(124,92,255,0.35);
      }

      :root[data-theme='light'] .switch input:checked + .track{
        background: rgba(35,209,195,0.90);
        border-color: rgba(35,209,195,0.30);
      }

      .danger{
        margin-top: 6px;
        padding-top: 12px;
        border-top: 1px solid rgba(255,255,255,0.08);
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap: 12px;
        flex-wrap: wrap;
      }

      .danger__t{ font-weight: 950; }
      .danger__d{ font-size: 12px; margin-top: 2px; }

      .dataRow{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap: 12px;
        padding-top: 12px;
        border-top: 1px solid rgba(255,255,255,0.08);
        flex-wrap: wrap;
      }
      .dataRow:first-of-type{
        border-top: 0;
        padding-top: 0;
      }
      .dataRow__t{ font-weight: 950; }
      .dataRow__d{ font-size: 12px; margin-top: 2px; }

      .dangerRow{
        border-top-color: rgba(255,92,122,0.20);
      }

      @media (min-width: 980px){
        .grid{
          grid-template-columns: 1fr 1fr;
          align-items: start;
        }
        .wide{ grid-column: 1 / -1; }
        .fields{ grid-template-columns: 1fr 1fr; }
      }

      @keyframes rise{
        from{ opacity: 0; transform: translateY(6px); }
        to{ opacity: 1; transform: translateY(0); }
      }

      @media (prefers-reduced-motion: reduce){
        mira-ui-card.panel{ animation: none !important; }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage {
  readonly toast = inject(ToastService);
  readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly saving = signal(false);

  private readonly PROFILE_KEY = 'mira_profile_v2';
  private readonly PREFS_KEY = 'mira_prefs_v2';
  private readonly PREFS_OLD_KEY = 'mira_prefs_v1';

  readonly prefs = signal<Prefs>(this.loadPrefs());

  readonly form = this.fb.group({
    name: ['Demo User', [Validators.required]],
    email: [this.auth.session()?.user?.email ?? 'demo@mira.app', [Validators.required, Validators.email]],

    monthlyBudget: ['3500'],
    savingsGoal: ['500'],
    payday: ['5'],
  });

  constructor() {
    const saved = this.loadProfile();
    if (saved) this.form.patchValue(saved, { emitEvent: false });
    this.applyTheme(this.prefs().theme);
  }

  initials() {
    const n = (this.form.value.name ?? '').trim();
    if (!n) return 'M';
    const parts = n.split(' ').filter(Boolean);
    return (parts[0]?.[0] ?? 'M').toUpperCase() + (parts[1]?.[0] ?? '').toUpperCase();
  }

  private loadProfile(): Partial<{ name: string; email: string; monthlyBudget: string; savingsGoal: string; payday: string }> | null {
    try {
      const raw = localStorage.getItem(this.PROFILE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as any;
      return {
        name: typeof parsed?.name === 'string' ? parsed.name : undefined,
        email: typeof parsed?.email === 'string' ? parsed.email : undefined,
        monthlyBudget: parsed?.monthlyBudget != null ? String(parsed.monthlyBudget) : undefined,
        savingsGoal: parsed?.savingsGoal != null ? String(parsed.savingsGoal) : undefined,
        payday: parsed?.payday != null ? String(parsed.payday) : undefined,
      };
    } catch {
      return null;
    }
  }

  private persistProfile() {
    try {
      const v = this.form.getRawValue();
      localStorage.setItem(
        this.PROFILE_KEY,
        JSON.stringify({
          name: (v.name ?? '').toString().trim(),
          email: (v.email ?? '').toString().trim(),
          monthlyBudget: (v.monthlyBudget ?? '').toString().trim(),
          savingsGoal: (v.savingsGoal ?? '').toString().trim(),
          payday: (v.payday ?? '').toString().trim(),
        }),
      );
    } catch {}
  }

  private loadPrefs(): Prefs {
    const fallback: Prefs = {
      notifications: true,
      weekly: false,
      weeklyEmail: false,
      hideAmounts: false,
      compact: false,
      autoCategorize: true,
      roundingSavings: true,

      theme: 'system',
      weekStart: 'mon',
      currency: 'BRL',
      defaultInsightPeriod: 30,
    };

    try {
      const rawV2 = localStorage.getItem(this.PREFS_KEY);
      if (rawV2) {
        const p = JSON.parse(rawV2) as Partial<Prefs>;
        return { ...fallback, ...p } as Prefs;
      }

      // migra do v1 (ignorando "tone" antigo)
      const rawV1 = localStorage.getItem(this.PREFS_OLD_KEY);
      if (rawV1) {
        const old = JSON.parse(rawV1) as any;
        const migrated: Partial<Prefs> = {
          notifications: !!old?.notifications,
          weekly: !!old?.weekly,
        };
        const next = { ...fallback, ...migrated };
        try { localStorage.setItem(this.PREFS_KEY, JSON.stringify(next)); } catch {}
        return next;
      }

      return fallback;
    } catch {
      return fallback;
    }
  }

  private persistPrefs(p: Prefs) {
    try {
      localStorage.setItem(this.PREFS_KEY, JSON.stringify(p));
    } catch {}
  }

  toggle(key: 'notifications' | 'weekly' | 'weeklyEmail' | 'hideAmounts' | 'compact' | 'autoCategorize' | 'roundingSavings', ev: Event) {
    const checked = (ev.target as HTMLInputElement).checked;
    this.prefs.update((p) => {
      const next = { ...p, [key]: checked } as Prefs;
      this.persistPrefs(next);
      return next;
    });
  }

  setTheme(theme: ThemePref) {
    this.prefs.update((p) => {
      const next = { ...p, theme };
      this.persistPrefs(next);
      return next;
    });
    this.applyTheme(theme);
  }

  setWeekStart(v: WeekStart) {
    this.prefs.update((p) => {
      const next = { ...p, weekStart: v };
      this.persistPrefs(next);
      return next;
    });
  }

  setCurrency(v: Currency) {
    this.prefs.update((p) => {
      const next = { ...p, currency: v };
      this.persistPrefs(next);
      return next;
    });
  }

  setDefaultInsightPeriod(v: string) {
    const n = Number(v);
    const period: Period = (n === 7 || n === 30 || n === 90 ? n : 30) as Period;
    this.prefs.update((p) => {
      const next = { ...p, defaultInsightPeriod: period };
      this.persistPrefs(next);
      return next;
    });
  }

  restoreDefaults() {
    const next = this.loadPrefs(); // fallback + migração (se existir)
    // força defaults recomendados (sem reaproveitar storage antigo)
    const clean: Prefs = {
      notifications: true,
      weekly: false,
      weeklyEmail: false,
      hideAmounts: false,
      compact: false,
      autoCategorize: true,
      roundingSavings: true,
      theme: 'system',
      weekStart: 'mon',
      currency: 'BRL',
      defaultInsightPeriod: 30,
    };
    this.prefs.set(clean);
    this.persistPrefs(clean);
    this.applyTheme(clean.theme);
    this.toast.push({ type: 'success', title: 'Restaurado', message: 'Configurações recomendadas aplicadas (mock).' });
    void next;
  }

  exportPrefs() {
    // mock: não faz download real, só confirma
    this.toast.push({ type: 'success', title: 'Exportado (mock)', message: 'Preferências exportadas (simulado).' });
  }

  clearLocalData() {
    try {
      localStorage.removeItem(this.PREFS_KEY);
      localStorage.removeItem(this.PREFS_OLD_KEY);
      localStorage.removeItem(this.PROFILE_KEY);
    } catch {}

    this.prefs.set(this.loadPrefs());
    const sessionEmail = this.auth.session()?.user?.email ?? 'demo@mira.app';
    this.form.reset(
      {
        name: 'Demo User',
        email: sessionEmail,
        monthlyBudget: '3500',
        savingsGoal: '500',
        payday: '5',
      },
      { emitEvent: false },
    );

    this.applyTheme(this.prefs().theme);

    this.toast.push({ type: 'success', title: 'Limpo', message: 'Dados locais removidos (mock).' });
  }

  private applyTheme(theme: ThemePref) {
    try {
      const root = document.documentElement;
      if (theme === 'dark' || theme === 'light') {
        root.setAttribute('data-theme', theme);
        return;
      }

      // system
      const isLight =
        window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
      root.setAttribute('data-theme', isLight ? 'light' : 'dark');
    } catch {}
  }

  async save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.push({ type: 'warning', title: 'Revise os campos', message: 'Confira e tente novamente.' });
      return;
    }

    this.saving.set(true);
    await new Promise((r) => setTimeout(r, 450));
    this.saving.set(false);

    this.persistProfile();
    this.persistPrefs(this.prefs());

    this.toast.push({ type: 'success', title: 'Salvo', message: 'Preferências salvas (mock).' });
  }
}