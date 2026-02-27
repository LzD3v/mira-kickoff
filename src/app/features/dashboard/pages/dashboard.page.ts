import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiCardComponent } from '@ui/card/ui-card.component';
import { UiSkeletonComponent } from '@ui/skeleton/ui-skeleton.component';
import { UiErrorStateComponent } from '@ui/error-state/ui-error-state.component';

type ViewState = 'loading' | 'ready' | 'error';

type Preset = 'week' | 'month' | 'today';
type BalanceView = 'realized' | 'projected'; // segment no chart de saldo
type PayTab = 'paid' | 'due';

type Cat = { label: string; value: number; color: string };

@Component({
  standalone: true,
  imports: [
    CommonModule,
    UiCardComponent,
    UiSkeletonComponent,
    UiErrorStateComponent,
  ],
  template: `
    <div class="dash">
      <!-- TOP TOOLBAR -->
      <div class="topbar">
        <div class="monthNav" aria-label="Selecionar mês">
          <button class="navBtn focus-ring" type="button" (click)="prevMonth()" aria-label="Mês anterior">‹</button>
          <div class="monthLabel">
            <div class="monthLabel__k muted">Mês</div>
            <div class="monthLabel__v">{{ monthLabel() }}</div>
          </div>
          <button class="navBtn focus-ring" type="button" (click)="nextMonth()" aria-label="Próximo mês">›</button>
        </div>

        <div class="filters">
          <div class="seg" role="tablist" aria-label="Atalhos de período">
            <button class="seg__btn focus-ring" type="button" (click)="setPreset('week')" [class.is-active]="preset() === 'week'">
              Semana
            </button>
            <button class="seg__btn focus-ring" type="button" (click)="setPreset('month')" [class.is-active]="preset() === 'month'">
              Mês
            </button>
            <button class="seg__btn focus-ring" type="button" (click)="setPreset('today')" [class.is-active]="preset() === 'today'">
              Hoje
            </button>
          </div>

          <div class="dates" aria-label="Selecionar datas">
            <label class="dateField">
              <span class="sr-only">Data inicial</span>
              <input class="dateInput focus-ring" type="date" [value]="dateStart()" (change)="onDateStart($any($event.target).value)" />
            </label>
            <span class="muted dates__sep">→</span>
            <label class="dateField">
              <span class="sr-only">Data final</span>
              <input class="dateInput focus-ring" type="date" [value]="dateEnd()" (change)="onDateEnd($any($event.target).value)" />
            </label>
          </div>

          <!-- DEV: toggle de estado (pode tirar depois) -->
          <div class="dev">
            <button class="pill focus-ring" type="button" (click)="setState('loading')">Loading</button>
            <button class="pill focus-ring" type="button" (click)="setState('error')">Erro</button>
            <button class="pill focus-ring" type="button" (click)="setState('ready')">Normal</button>
          </div>
        </div>
      </div>

      <!-- BODY -->
      <ng-container [ngSwitch]="state()">
        <!-- LOADING -->
        <div *ngSwitchCase="'loading'" class="grid">
          <div class="left">
            <mira-ui-card class="card"><div class="cardPad"><mira-ui-skeleton height="128px" radius="22px" /></div></mira-ui-card>
            <mira-ui-card class="card"><div class="cardPad"><mira-ui-skeleton height="120px" radius="22px" /></div></mira-ui-card>
            <mira-ui-card class="card"><div class="cardPad"><mira-ui-skeleton height="120px" radius="22px" /></div></mira-ui-card>
          </div>

          <div class="right">
            <mira-ui-card class="card"><div class="cardPad"><mira-ui-skeleton height="260px" radius="22px" /></div></mira-ui-card>
            <mira-ui-card class="card"><div class="cardPad"><mira-ui-skeleton height="260px" radius="22px" /></div></mira-ui-card>
          </div>
        </div>

        <!-- ERROR -->
        <div *ngSwitchCase="'error'" class="grid">
          <div class="left">
            <mira-ui-card class="card">
              <div class="cardPad">
                <div class="cardTitle">Resumo</div>
                <div class="muted">Falha simulada (Kick-off)</div>
              </div>
            </mira-ui-card>
          </div>

          <div class="right">
            <mira-ui-card class="card">
              <div class="cardPad">
                <mira-ui-error-state
                  title="Não foi possível carregar"
                  description="No Kick-off isso é simulado. Depois, o erro vem da API."
                  actionLabel="Tentar novamente"
                  [action]="retry"
                />
              </div>
            </mira-ui-card>
          </div>
        </div>

        <!-- READY -->
        <div *ngSwitchDefault class="grid">
          <!-- LEFT COLUMN -->
          <div class="left">
            <!-- Resultado do período -->
            <mira-ui-card class="card">
              <div class="cardPad">
                <div class="rowTop">
                  <div>
                    <div class="muted tiny">Resultado do Período</div>
                    <div class="big">{{ formatBRL(periodResultAnim()) }}</div>
                    <div class="muted tiny">{{ dateRangeLabel() }}</div>
                  </div>

                  <div class="delta" [attr.data-type]="periodDeltaType()">{{ periodDeltaLabel() }}</div>
                </div>

                <div class="sparkWrap" aria-hidden="true">
                  <svg class="spark" viewBox="0 0 120 30">
                    <path class="spark__grid" d="M0 26H120 M0 16H120 M0 6H120" />
                    <path class="spark__line" [attr.d]="sparkPath(periodSpark())" pathLength="100"
                      [style.strokeDasharray]="100"
                      [style.strokeDashoffset]="(1 - sparkReveal()) * 100"
                    />
                    <path class="spark__fill" [attr.d]="sparkFill(periodSpark())" [style.opacity]="sparkFillOpacity()" />
                  </svg>
                </div>
              </div>
            </mira-ui-card>

            <!-- Entradas -->
            <mira-ui-card class="card">
              <div class="cardPad">
                <div class="cardTitle">Entradas</div>

                <div class="miniRows">
                  <div class="miniRow">
                    <div class="muted tiny">Realizado</div>
                    <div class="miniV ok">{{ formatBRL(incomeRealAnim()) }}</div>
                  </div>

                  <div class="miniRow">
                    <div class="muted tiny">Previsto (A Receber)</div>
                    <div class="miniV">{{ formatBRL(incomeProjAnim()) }}</div>
                  </div>
                </div>
              </div>
            </mira-ui-card>

            <!-- Saídas -->
            <mira-ui-card class="card">
              <div class="cardPad">
                <div class="cardTitle">Saídas</div>

                <div class="miniRows">
                  <div class="miniRow">
                    <div class="muted tiny">Realizado</div>
                    <div class="miniV danger">{{ formatBRL(expenseRealAnim()) }}</div>
                  </div>

                  <div class="miniRow">
                    <div class="muted tiny">Previsto (A Pagar)</div>
                    <div class="miniV">{{ formatBRL(expenseProjAnim()) }}</div>
                  </div>
                </div>
              </div>
            </mira-ui-card>
          </div>

          <!-- RIGHT COLUMN -->
          <div class="right">
            <!-- Evolução do saldo -->
            <mira-ui-card class="card">
              <div class="cardPad">
                <div class="cardHead">
                  <div>
                    <div class="cardTitle">Evolução do Saldo no Período</div>
                    <div class="muted tiny">Comparando realizado vs projetado</div>
                  </div>

                  <div class="seg" role="tablist" aria-label="Modo do gráfico">
                    <button class="seg__btn focus-ring" type="button" (click)="setBalanceView('realized')" [class.is-active]="balanceView() === 'realized'">
                      Realizado
                    </button>
                    <button class="seg__btn focus-ring" type="button" (click)="setBalanceView('projected')" [class.is-active]="balanceView() === 'projected'">
                      Projetado
                    </button>
                  </div>
                </div>

                <div class="chartBox">
                  <svg class="line" viewBox="0 0 520 190" aria-label="Gráfico de saldo (mock)">
                    <defs>
                      <linearGradient id="gradA" x1="0" x2="1">
                        <stop offset="0" stop-color="rgba(132,210,244,0.95)" />
                        <stop offset="1" stop-color="rgba(133,94,217,0.95)" />
                      </linearGradient>

                      <linearGradient id="fillA" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0" stop-color="rgba(133,94,217,0.18)" />
                        <stop offset="1" stop-color="rgba(133,94,217,0.02)" />
                      </linearGradient>

                      <linearGradient id="gradB" x1="0" x2="1">
                        <stop offset="0" stop-color="rgba(255,255,255,0.35)" />
                        <stop offset="1" stop-color="rgba(255,255,255,0.20)" />
                      </linearGradient>
                    </defs>

                    <path class="gridLine" d="M20 160H500 M20 120H500 M20 80H500 M20 40H500" />

                    <!-- projected (fundo) -->
                    <path
                      class="lineProj"
                      [class.is-dim]="balanceView() === 'realized'"
                      [attr.d]="linePath(balanceProjected())"
                      pathLength="100"
                      [style.strokeDasharray]="100"
                      [style.strokeDashoffset]="(1 - lineReveal()) * 100"
                    />

                    <!-- realized (frente) -->
                    <path
                      class="lineReal"
                      [class.is-dim]="balanceView() === 'projected'"
                      [attr.d]="linePath(balanceRealized())"
                      pathLength="100"
                      [style.strokeDasharray]="100"
                      [style.strokeDashoffset]="(1 - lineReveal()) * 100"
                    />

                    <path class="lineFill" [attr.d]="lineFill(balanceRealized())" [style.opacity]="lineFillOpacity()" />

                    <!-- labels X -->
                    <g class="axisX muted">
                      <text x="20" y="182">1</text>
                      <text x="140" y="182">7</text>
                      <text x="260" y="182">14</text>
                      <text x="380" y="182">21</text>
                      <text x="492" y="182" text-anchor="end">28</text>
                    </g>
                  </svg>
                </div>

                <div class="legendLine">
                  <div class="legItem">
                    <span class="dot dot--real"></span><span class="muted tiny">Saldo Realizado</span>
                  </div>
                  <div class="legItem">
                    <span class="dot dot--proj"></span><span class="muted tiny">Saldo Projetado</span>
                  </div>
                </div>
              </div>
            </mira-ui-card>

            <!-- Despesas (pizza) -->
            <mira-ui-card class="card">
              <div class="cardPad">
                <div class="cardHead">
                  <div>
                    <div class="cardTitle">Despesas</div>
                    <div class="muted tiny">Pagas vs A pagar • Detalhes por categoria</div>
                  </div>

                  <div class="seg" role="tablist" aria-label="Despesas pagas ou a pagar">
                    <button class="seg__btn focus-ring" type="button" (click)="setPayTab('paid')" [class.is-active]="payTab() === 'paid'">
                      Pagas
                    </button>
                    <button class="seg__btn focus-ring" type="button" (click)="setPayTab('due')" [class.is-active]="payTab() === 'due'">
                      A pagar
                    </button>
                  </div>
                </div>

                <div class="pieGrid">
                  <button
                    class="pie focus-ring"
                    type="button"
                    (click)="replayPie()"
                    [style.background]="pieBackground()"
                    [style.--reveal]="pieReveal()"
                    aria-label="Repetir animação do gráfico de despesas"
                  >
                    <div class="pie__center">
                      <div class="pie__value">{{ formatBRL(expenseTotalAnim()) }}</div>
                      <div class="muted tiny">Total {{ payTab() === 'paid' ? 'pago' : 'a pagar' }}</div>
                      <div class="muted tiny" style="margin-top:6px;">Clique para reanimar</div>
                    </div>
                  </button>

                  <div class="cats">
                    <div class="cats__head">
                      <div class="cats__title">Detalhes por Categoria</div>
                      <div class="muted tiny">{{ payTab() === 'paid' ? 'Realizado' : 'Previsto' }}</div>
                    </div>

                    <div class="cat" *ngFor="let c of expenseCats(); trackBy: trackByLabel">
                      <span class="sw" [style.background]="c.color"></span>
                      <span class="cat__label">{{ c.label }}</span>
                      <span class="cat__value">{{ formatBRL(c.value) }}</span>
                    </div>

                    <button class="replayBtn focus-ring" type="button" (click)="replayPie()">Repetir animação</button>
                  </div>
                </div>
              </div>
            </mira-ui-card>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [
    `
      :host{ display:block; }
      mira-ui-card{ display:block; min-width:0; }

      .dash{
        display:grid;
        gap: 14px;
      }

      /* TOP */
      .topbar{
        display:flex;
        align-items:flex-end;
        justify-content:space-between;
        gap:12px;
        flex-wrap:wrap;
      }

      .monthNav{
        display:flex;
        align-items:center;
        gap:10px;
      }

      .navBtn{
        width: 42px;
        height: 42px;
        border-radius: 14px;
        border: 1px solid var(--border);
        background: rgba(255,255,255,0.04);
        color: var(--text);
        cursor:pointer;
        transition: transform 160ms ease, background 160ms ease;
      }
      .navBtn:hover{ transform: translateY(-1px); background: rgba(255,255,255,0.07); }

      .monthLabel{ display:grid; gap:2px; }
      .monthLabel__k{ font-size: 12px; }
      .monthLabel__v{
        font-weight: 950;
        letter-spacing: -0.3px;
        font-size: 18px;
        line-height: 1.1;
      }

      .filters{
        display:flex;
        align-items:center;
        gap:10px;
        flex-wrap:wrap;
        justify-content:flex-end;
      }

      .seg{
        border:1px solid var(--border);
        background: rgba(255,255,255,0.04);
        border-radius:999px;
        padding:4px;
        display:inline-flex;
        gap:6px;
      }
      .seg__btn{
        border:0;
        background:transparent;
        color: var(--muted);
        cursor:pointer;
        border-radius:999px;
        padding: 8px 10px;
        font-size:12px;
        transition: background 160ms ease, color 160ms ease, transform 160ms ease;
      }
      .seg__btn:hover{ transform: translateY(-1px); color: var(--text); }
      .seg__btn.is-active{ background: rgba(255,255,255,0.08); color: var(--text); }

      .dates{
        display:inline-flex;
        align-items:center;
        gap:8px;
        border:1px solid var(--border);
        background: rgba(255,255,255,0.04);
        padding: 6px 10px;
        border-radius: 999px;
      }
      .dates__sep{ font-size: 12px; }

      .dateInput{
        border:0;
        outline:0;
        background: transparent;
        color: var(--text);
        font-size: 12px;
        padding: 6px 6px;
        border-radius: 10px;
      }
      .dateInput::-webkit-calendar-picker-indicator{
        filter: invert(1);
        opacity: .85;
        cursor:pointer;
      }

      .dev{ display:inline-flex; gap:8px; flex-wrap:wrap; }
      .pill{
        border:1px solid var(--border);
        background: rgba(255,255,255,0.04);
        color: var(--text);
        border-radius:999px;
        padding:8px 12px;
        cursor:pointer;
        transition: transform 160ms ease, background 160ms ease;
        font-size: 12px;
      }
      .pill:hover{ transform: translateY(-1px); background: rgba(255,255,255,0.07); }

      /* GRID */
      .grid{
        display:grid;
        grid-template-columns: 360px 1fr;
        gap: 14px;
        align-items:start;
      }
      .left{ display:grid; gap: 12px; }
      .right{ display:grid; gap: 12px; }

      .cardPad{ padding: 16px; }
      .cardTitle{
        font-weight: 950;
        letter-spacing: -0.2px;
        font-size: 14px;
      }
      .tiny{ font-size: 12px; }
      .sr-only{
        position:absolute !important;
        width:1px !important;
        height:1px !important;
        padding:0 !important;
        margin:-1px !important;
        overflow:hidden !important;
        clip:rect(0,0,0,0) !important;
        white-space:nowrap !important;
        border:0 !important;
      }

      /* LEFT - Resultado */
      .rowTop{
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap: 10px;
      }
      .big{
        margin-top: 6px;
        font-weight: 950;
        letter-spacing: -0.6px;
        font-size: 26px;
        line-height: 1.05;
      }
      .delta{
        font-size: 12px;
        padding: 6px 10px;
        border-radius: 999px;
        border: 1px solid var(--border);
        background: rgba(255,255,255,0.04);
        white-space: nowrap;
      }
      .delta[data-type='up']{ border-color: rgba(56,217,150,0.35); background: rgba(56,217,150,0.10); }
      .delta[data-type='down']{ border-color: rgba(255,92,122,0.35); background: rgba(255,92,122,0.10); }
      .delta[data-type='flat']{ border-color: rgba(255,255,255,0.14); background: rgba(255,255,255,0.04); }

      .sparkWrap{ margin-top: 12px; }
      .spark{ width:100%; height: 34px; }
      .spark__grid{ stroke: rgba(255,255,255,0.08); stroke-width:1; fill:none; }
      .spark__line{
        fill:none;
        stroke: rgba(133,94,217,0.95);
        stroke-width: 3;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .spark__fill{ fill: rgba(133,94,217,0.12); stroke:none; transition: opacity 220ms ease; }

      /* LEFT - Entradas/Saídas */
      .miniRows{ margin-top: 12px; display:grid; gap: 10px; }
      .miniRow{ display:flex; align-items:baseline; justify-content:space-between; gap: 10px; }
      .miniV{ font-weight: 900; letter-spacing: -0.2px; }
      .ok{ color: rgba(56,217,150,0.92); }
      .danger{ color: rgba(255,92,122,0.92); }

      /* RIGHT - heads */
      .cardHead{
        display:flex;
        align-items:flex-end;
        justify-content:space-between;
        gap: 12px;
        flex-wrap:wrap;
        margin-bottom: 12px;
      }

      .chartBox{
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.03);
        border-radius: 22px;
        padding: 12px;
      }

      .line{ width:100%; height: 210px; display:block; }
      .gridLine{ stroke: rgba(255,255,255,0.08); stroke-width: 1; fill:none; }
      .lineReal{
        fill:none;
        stroke: url(#gradA);
        stroke-width: 3.6;
        stroke-linecap: round;
        stroke-linejoin: round;
        transition: opacity 180ms ease;
      }
      .lineProj{
        fill:none;
        stroke: url(#gradB);
        stroke-width: 2.6;
        stroke-linecap: round;
        stroke-linejoin: round;
        opacity: .65;
        transition: opacity 180ms ease;
      }
      .is-dim{ opacity: .25 !important; }
      .lineFill{ fill: url(#fillA); stroke:none; transition: opacity 240ms ease; }

      .axisX text{
        font-size: 11px;
        fill: rgba(255,255,255,0.55);
      }

      .legendLine{
        margin-top: 10px;
        display:flex;
        gap: 14px;
        flex-wrap: wrap;
      }
      .legItem{ display:flex; align-items:center; gap: 8px; }
      .dot{ width: 10px; height: 10px; border-radius: 999px; display:inline-block; }
      .dot--real{ background: rgba(133,94,217,0.95); }
      .dot--proj{ background: rgba(255,255,255,0.28); }

      /* PIE */
      .pieGrid{
        display:grid;
        grid-template-columns: 240px 1fr;
        gap: 16px;
        align-items:center;
      }

      .pie{
        position: relative;
        width: 220px;
        height: 220px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,0.10);
        background: #222;
        box-shadow: 0 18px 50px rgba(0,0,0,0.20);
        cursor: pointer;
        padding: 0;
        overflow: hidden;
        transform: translateZ(0);
        transition: transform 180ms ease;
        -webkit-mask-image: conic-gradient(#000 0 calc(var(--reveal) * 1turn), transparent 0);
        mask-image: conic-gradient(#000 0 calc(var(--reveal) * 1turn), transparent 0);
      }
      .pie:hover{ transform: translateY(-1px) scale(1.01); }

      .pie::after{
        content:'';
        position:absolute;
        inset: 18px;
        border-radius: 999px;
        background: rgba(0,0,0,0.35);
        border: 1px solid rgba(255,255,255,0.12);
      }

      .pie__center{
        position:absolute;
        inset:0;
        display:grid;
        place-items:center;
        text-align:center;
        pointer-events:none;
        z-index: 2;
      }
      .pie__value{
        font-weight: 950;
        letter-spacing: -0.6px;
        font-size: 18px;
      }

      .cats{
        display:grid;
        gap: 10px;
        min-width: 0;
      }
      .cats__head{
        display:flex;
        align-items:baseline;
        justify-content:space-between;
        gap: 10px;
      }
      .cats__title{
        font-weight: 950;
        letter-spacing: -0.2px;
        font-size: 13px;
      }
      .cat{
        display:grid;
        grid-template-columns: 14px 1fr auto;
        align-items:center;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.10);
        background: rgba(255,255,255,0.03);
      }
      .sw{ width: 10px; height: 10px; border-radius: 999px; }
      .cat__label{ font-size: 13px; color: rgba(255,255,255,0.82); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .cat__value{ font-size: 13px; color: rgba(255,255,255,0.82); font-weight: 800; }

      .replayBtn{
        width: fit-content;
        border-radius: 999px;
        border: 1px solid var(--border);
        background: rgba(255,255,255,0.04);
        color: var(--text);
        padding: 8px 12px;
        cursor:pointer;
        transition: transform 160ms ease, background 160ms ease;
      }
      .replayBtn:hover{ transform: translateY(-1px); background: rgba(255,255,255,0.07); }

      /* Responsive */
      @media (max-width: 980px){
        .grid{ grid-template-columns: 1fr; }
        .pieGrid{ grid-template-columns: 1fr; justify-items:center; }
        .cats{ width: min(520px, 100%); }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  private readonly destroyRef = inject(DestroyRef);

  // view state
  readonly state = signal<ViewState>('loading');

  // top controls
  readonly preset = signal<Preset>('month');

  readonly month = signal<number>(3); // Abril (0=Jan)
  readonly year = signal<number>(2025);

  readonly dateStart = signal<string>('2025-04-01');
  readonly dateEnd = signal<string>('2025-04-30');

  readonly balanceView = signal<BalanceView>('realized');
  readonly payTab = signal<PayTab>('paid');

  // ===== mock base (não animado)
  private periodResult = 53414.71;
  private incomeReal = 62000;
  private incomeProj = 22000;
  private expenseReal = 8585.29;
  private expenseProj = 76600.11;

  // ===== anim signals
  readonly periodResultAnim = signal(0);
  readonly incomeRealAnim = signal(0);
  readonly incomeProjAnim = signal(0);
  readonly expenseRealAnim = signal(0);
  readonly expenseProjAnim = signal(0);

  readonly sparkReveal = signal(0);
  readonly sparkFillOpacity = signal(0);

  readonly lineReveal = signal(0);
  readonly lineFillOpacity = signal(0);

  readonly pieReveal = signal(0);
  readonly expenseTotalAnim = signal(0);

  // motion preference
  private readonly reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  private rafIds = new Set<number>();
  private timers = new Set<number>();

  // ===== labels
  readonly monthLabel = computed(() => {
    const months = [
      'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
      'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
    ];
    return `${months[this.month()] ?? '—'} ${this.year()}`;
  });

  readonly dateRangeLabel = computed(() => {
    // “1 abr — 30 abr”
    const a = this.prettyShort(this.dateStart());
    const b = this.prettyShort(this.dateEnd());
    return `${a} — ${b}`;
  });

  // ===== series (mock) — 12 pontos
  readonly balanceRealized = computed(() => this.makeBalanceSeries('realized'));
  readonly balanceProjected = computed(() => this.makeBalanceSeries('projected'));

  // pie cats
  readonly expenseCats = computed(() => {
    const basePaid: Cat[] = [
      { label: 'Casa', color: 'rgba(255, 92, 122, 0.95)', value: this.money(37000.11) },
      { label: 'Outros', color: 'rgba(255,255,255,0.22)', value: this.money(17200.00) },
      { label: 'Utilidades', color: 'rgba(132,210,244,0.95)', value: this.money(12200.00) },
      { label: 'Transporte', color: 'rgba(133,94,217,0.95)', value: this.money(10200.00) },
    ];

    const baseDue: Cat[] = [
      { label: 'Casa', color: 'rgba(255, 92, 122, 0.95)', value: this.money(21400.00) },
      { label: 'Outros', color: 'rgba(255,255,255,0.22)', value: this.money(9800.00) },
      { label: 'Utilidades', color: 'rgba(132,210,244,0.95)', value: this.money(6200.00) },
      { label: 'Transporte', color: 'rgba(133,94,217,0.95)', value: this.money(4200.00) },
    ];

    // varia um pouco com o preset/range pra “parecer vivo”
    const mult = this.preset() === 'week' ? 0.62 : this.preset() === 'today' ? 0.28 : 1;
    const cats = (this.payTab() === 'paid' ? basePaid : baseDue).map((c) => ({
      ...c,
      value: this.money(c.value * mult),
    }));

    // normaliza pra bater com total mock
    const totalTarget = this.payTab() === 'paid' ? this.expenseReal : this.expenseProj;
    const sum = cats.reduce((a, b) => a + b.value, 0) || 1;
    const k = totalTarget / sum;

    return cats.map((c) => ({ ...c, value: this.money(c.value * k) }));
  });

  readonly pieBackground = computed(() => {
    const cats = this.expenseCats();
    const total = cats.reduce((a, b) => a + b.value, 0) || 1;

    let acc = 0;
    const parts = cats.map((c) => {
      const a = (acc / total) * 100;
      acc += c.value;
      const b = (acc / total) * 100;
      return `${c.color} ${a}% ${b}%`;
    });

    return `conic-gradient(${parts.join(', ')})`;
  });

  constructor() {
    // inicial loading -> ready
    const t = window.setTimeout(() => {
      this.state.set('ready');
      this.refreshMocks(true);
    }, 650);
    this.timers.add(t);

    this.destroyRef.onDestroy(() => {
      this.rafIds.forEach((id) => cancelAnimationFrame(id));
      this.rafIds.clear();

      this.timers.forEach((id) => window.clearTimeout(id));
      this.timers.clear();
    });
  }

  // =============================
  // Actions
  // =============================
  setState(s: ViewState) {
    this.state.set(s);
    if (s === 'ready') this.refreshMocks(true);
  }

  retry = () => {
    this.setState('loading');
    const t = window.setTimeout(() => {
      this.setState('ready');
    }, 650);
    this.timers.add(t);
  };

  prevMonth() {
    const m = this.month();
    if (m === 0) {
      this.month.set(11);
      this.year.set(this.year() - 1);
    } else {
      this.month.set(m - 1);
    }
    this.applyPresetToDates(this.preset());
    if (this.state() === 'ready') this.refreshMocks(false);
  }

  nextMonth() {
    const m = this.month();
    if (m === 11) {
      this.month.set(0);
      this.year.set(this.year() + 1);
    } else {
      this.month.set(m + 1);
    }
    this.applyPresetToDates(this.preset());
    if (this.state() === 'ready') this.refreshMocks(false);
  }

  setPreset(p: Preset) {
    if (this.preset() === p) return;
    this.preset.set(p);
    this.applyPresetToDates(p);
    if (this.state() === 'ready') this.refreshMocks(false);
  }

  onDateStart(v: string) {
    if (!v) return;
    this.dateStart.set(v);
    if (this.state() === 'ready') this.refreshMocks(false);
  }

  onDateEnd(v: string) {
    if (!v) return;
    this.dateEnd.set(v);
    if (this.state() === 'ready') this.refreshMocks(false);
  }

  setBalanceView(v: BalanceView) {
    this.balanceView.set(v);
    // só “enfatiza”; não precisa re-gerar dados
  }

  setPayTab(t: PayTab) {
    if (this.payTab() === t) return;
    this.payTab.set(t);
    if (this.state() === 'ready') this.animatePie(false);
  }

  replayPie() {
    if (this.state() === 'ready') this.animatePie(false);
  }

  // =============================
  // Mock generator + animations
  // =============================
  private refreshMocks(first: boolean) {
    // regenera valores de forma determinística com base em mês/preset/datas
    const seed = this.seedFrom(
      this.year(),
      this.month(),
      this.preset(),
      this.dateStart(),
      this.dateEnd(),
    );

    const mult = this.preset() === 'week' ? 0.55 : this.preset() === 'today' ? 0.22 : 1;

    this.periodResult = this.money((52000 + (seed % 9000)) * (0.92 + (seed % 7) * 0.02) * mult + 8000);
    this.incomeReal = this.money((61000 + (seed % 8000)) * mult + 2200);
    this.incomeProj = this.money((21000 + (seed % 5000)) * mult + 1200);

    this.expenseReal = this.money((8600 + (seed % 4200)) * mult + 400);
    this.expenseProj = this.money((76000 + (seed % 18000)) * mult + 1200);

    this.animateSummary(first);
    this.animateLine(first);
    this.animatePie(first);
  }

  private animateSummary(first: boolean) {
    if (this.reduceMotion) {
      this.periodResultAnim.set(this.periodResult);
      this.incomeRealAnim.set(this.incomeReal);
      this.incomeProjAnim.set(this.incomeProj);
      this.expenseRealAnim.set(this.expenseReal);
      this.expenseProjAnim.set(this.expenseProj);
      this.sparkReveal.set(1);
      this.sparkFillOpacity.set(1);
      return;
    }

    // reset + animate
    this.periodResultAnim.set(0);
    this.incomeRealAnim.set(0);
    this.incomeProjAnim.set(0);
    this.expenseRealAnim.set(0);
    this.expenseProjAnim.set(0);

    this.sparkReveal.set(0);
    this.sparkFillOpacity.set(0);

    this.animateNumber(0, this.periodResult, first ? 860 : 720, (v) => this.periodResultAnim.set(v));
    this.animateNumber(0, this.incomeReal, 720, (v) => this.incomeRealAnim.set(v));
    this.animateNumber(0, this.incomeProj, 720, (v) => this.incomeProjAnim.set(v));
    this.animateNumber(0, this.expenseReal, 720, (v) => this.expenseRealAnim.set(v));
    this.animateNumber(0, this.expenseProj, 720, (v) => this.expenseProjAnim.set(v));

    this.animateNumber(0, 1, first ? 820 : 680, (v) => this.sparkReveal.set(v), () => {
      this.animateNumber(0, 1, 240, (v) => this.sparkFillOpacity.set(v));
    });
  }

  private animateLine(first: boolean) {
    if (this.reduceMotion) {
      this.lineReveal.set(1);
      this.lineFillOpacity.set(1);
      return;
    }

    this.lineReveal.set(0);
    this.lineFillOpacity.set(0);

    this.animateNumber(0, 1, first ? 980 : 820, (v) => this.lineReveal.set(v), () => {
      this.animateNumber(0, 1, 260, (v) => this.lineFillOpacity.set(v));
    });
  }

  private animatePie(first: boolean) {
    const total = this.payTab() === 'paid' ? this.expenseReal : this.expenseProj;

    if (this.reduceMotion) {
      this.pieReveal.set(1);
      this.expenseTotalAnim.set(total);
      return;
    }

    this.pieReveal.set(0);
    this.expenseTotalAnim.set(0);

    this.animateNumber(0, 1, first ? 980 : 820, (v) => this.pieReveal.set(v));
    this.animateNumber(0, total, first ? 980 : 820, (v) => this.expenseTotalAnim.set(v));
  }

  // =============================
  // Derived UI
  // =============================
  periodDeltaLabel() {
    // só mock “bonito”
    const v = this.periodResult;
    const pct = Math.max(-9.9, Math.min(16.5, (v % 1650) / 100));
    const sign = pct >= 0 ? '+' : '';
    return `${sign}${pct.toFixed(1)}%`;
  }
  periodDeltaType() {
    const n = Number(this.periodDeltaLabel().replace('%', ''));
    if (n > 0.2) return 'up';
    if (n < -0.2) return 'down';
    return 'flat';
  }

  // =============================
  // Series / Charts
  // =============================
  private makeBalanceSeries(kind: 'realized' | 'projected') {
    const seed = this.seedFrom(this.year(), this.month(), this.preset(), kind, this.dateStart(), this.dateEnd());
    const mult = this.preset() === 'week' ? 0.72 : this.preset() === 'today' ? 0.35 : 1;

    // base e variação
    const base = 34000 * mult + (seed % 4200);
    const amp = (kind === 'projected' ? 6200 : 7600) * mult;

    // 12 pontos
    const pts = Array.from({ length: 12 }, (_, i) => {
      const t = i / 11;
      const wave = Math.sin((t * Math.PI) * 1.2) * 0.55 + Math.sin(t * Math.PI * 2.2) * 0.25;
      const step = (seed % 900) * (i > 2 ? 0.002 : 0.0);
      const bump = i === 3 ? amp * 0.8 : 0;
      const v = base + amp * (0.45 + wave) + bump + step * amp;
      return this.money(v);
    });

    // suaviza “queda” leve no final pra ficar parecido com exemplo
    if (kind === 'projected') pts[9] = this.money(pts[9] * 0.96);
    pts[10] = this.money(pts[10] * 1.02);
    pts[11] = this.money(pts[11] * 1.01);

    return pts;
  }

  linePath(values: number[]) {
    const pts = this.normPoints(values, 520, 160, 120, 20, 500);
    return `M ${pts.map((p) => `${p.x} ${p.y}`).join(' L ')}`;
  }

  lineFill(values: number[]) {
    const pts = this.normPoints(values, 520, 160, 120, 20, 500);
    const start = `M ${pts[0].x} 160`;
    const line = `L ${pts.map((p) => `${p.x} ${p.y}`).join(' L ')}`;
    const end = `L ${pts[pts.length - 1].x} 160 Z`;
    return `${start} ${line} ${end}`;
  }

  private normPoints(values: number[], w: number, baseY: number, height: number, left: number, right: number) {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = Math.max(1, max - min);

    return values.map((v, i) => {
      const x = Math.round((i / (values.length - 1)) * (right - left) + left);
      const y = Math.round(baseY - ((v - min) / span) * height);
      return { x, y };
    });
  }

  // spark (12 pontos)
  periodSpark() {
    const seed = this.seedFrom(this.year(), this.month(), this.preset(), this.dateStart(), this.dateEnd(), 'spark');
    const base = 18 + (seed % 6);
    return Array.from({ length: 10 }, (_, i) => {
      const t = i / 9;
      const wave = Math.sin(t * Math.PI * 1.6) * 2.2;
      const drift = (seed % 7) * 0.12 * i;
      return base + wave + drift;
    });
  }

  sparkPath(values: number[]) {
    const pts = this.normSpark(values, 120, 26, 18, 0, 120);
    return `M ${pts.map((p) => `${p.x} ${p.y}`).join(' L ')}`;
  }

  sparkFill(values: number[]) {
    const pts = this.normSpark(values, 120, 26, 18, 0, 120);
    const start = `M ${pts[0].x} 26`;
    const line = `L ${pts.map((p) => `${p.x} ${p.y}`).join(' L ')}`;
    const end = `L ${pts[pts.length - 1].x} 26 Z`;
    return `${start} ${line} ${end}`;
  }

  private normSpark(values: number[], w: number, baseY: number, height: number, left: number, right: number) {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = Math.max(1, max - min);

    return values.map((v, i) => {
      const x = Math.round((i / (values.length - 1)) * (right - left) + left);
      const y = Math.round(baseY - ((v - min) / span) * height);
      return { x, y };
    });
  }

  // =============================
  // Helpers: dates/preset
  // =============================
  private applyPresetToDates(p: Preset) {
    const y = this.year();
    const m = this.month();

    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);

    const toISO = (d: Date) => {
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${d.getFullYear()}-${mm}-${dd}`;
    };

    if (p === 'month') {
      this.dateStart.set(toISO(first));
      this.dateEnd.set(toISO(last));
      return;
    }

    if (p === 'today') {
      // “hoje” dentro do mês selecionado: usa dia 14 como referência (bonito pro mock)
      const d = new Date(y, m, Math.min(14, last.getDate()));
      this.dateStart.set(toISO(d));
      this.dateEnd.set(toISO(d));
      return;
    }

    // week
    const end = last;
    const start = new Date(y, m, Math.max(1, end.getDate() - 6));
    this.dateStart.set(toISO(start));
    this.dateEnd.set(toISO(end));
  }

  private prettyShort(iso: string) {
    try {
      const d = new Date(iso);
      const months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
      return `${d.getDate()} ${months[d.getMonth()]}`;
    } catch {
      return iso;
    }
  }

  // =============================
  // Helpers: animation
  // =============================
  private animateNumber(from: number, to: number, ms: number, onUpdate: (v: number) => void, onDone?: () => void) {
    const start = performance.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      const p = ease(t);
      const v = from + (to - from) * p;
      onUpdate(v);

      if (t < 1) {
        const id = requestAnimationFrame(tick);
        this.rafIds.add(id);
      } else {
        onUpdate(to);
        onDone?.();
      }
    };

    const id = requestAnimationFrame(tick);
    this.rafIds.add(id);
  }

  // =============================
  // Helpers: formatting / seed
  // =============================
  formatBRL(n: number) {
    const v = Math.round((n || 0) * 100) / 100;
    try {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(v);
    } catch {
      return `R$ ${v.toFixed(2)}`;
    }
  }

  private money(n: number) {
    return Math.round(n * 100) / 100;
  }

  private seedFrom(...parts: any[]) {
    const s = parts.map((p) => String(p)).join('|');
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
  }

  trackByLabel = (_: number, c: Cat) => c.label;
}