import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiCardComponent } from '@ui/card/ui-card.component';
import { UiButtonComponent } from '@ui/button/ui-button.component';
import { UiSkeletonComponent } from '@ui/skeleton/ui-skeleton.component';
import { UiEmptyStateComponent } from '@ui/empty-state/ui-empty-state.component';
import { UiErrorStateComponent } from '@ui/error-state/ui-error-state.component';
import { ToastService } from '@core/services/toast.service';
import { inject } from '@angular/core';

type ViewState = 'loading' | 'ready' | 'empty' | 'error';

type Period = 7 | 30 | 90;

type SpendCategory = 'fastfood' | 'market' | 'transport' | 'subscriptions' | 'leisure' | 'other';
type InsightKind = 'warning' | 'info' | 'positive';

type SpendTx = {
  id: string;
  date: string; // ISO
  category: SpendCategory;
  label: string;
  amount: number;
};

type Insight = {
  id: string;
  tag: string;
  title: string;
  body: string;
  why: string;
  actionLabel: string;
  kind: InsightKind;
  category: SpendCategory | 'general';
};

@Component({
  standalone: true,
  imports: [
    CommonModule,
    UiCardComponent,
    UiButtonComponent,
    UiSkeletonComponent,
    UiEmptyStateComponent,
    UiErrorStateComponent,
  ],
  template: `
    <div class="page">
      <header class="head">
        <div>
          <div class="title">Dicas & Insights</div>
          <div class="muted sub">Kick-off • conteúdo mock • visão clara do que dá pra ajustar</div>
        </div>

        <div class="head__actions">
          <button class="pill focus-ring" type="button" (click)="state.set('loading')">Loading</button>
          <button class="pill focus-ring" type="button" (click)="state.set('error')">Erro</button>
          <button class="pill focus-ring" type="button" (click)="state.set('empty')">Vazio</button>
          <button class="pill focus-ring" type="button" (click)="state.set('ready')">Normal</button>
        </div>
      </header>

      <!-- Context “feito pra mim” + controles úteis -->
      <mira-ui-card *ngIf="state() === 'ready'" class="context">
        <div class="context__inner">
          <div class="context__left">
            <div class="kicker">Resumo do período</div>

            <div class="context__title">Pequenos ajustes, grande impacto.</div>

            <div class="muted context__desc">
              Baseado no seu momento (mock): <b>{{ profile() }}</b> • foco: <b>{{ goal() }}</b>.
            </div>

            <div class="stats">
              <div class="stat">
                <div class="stat__k muted">Total no período</div>
                <div class="stat__v">{{ money(summary().total) }}</div>
              </div>

              <div class="stat">
                <div class="stat__k muted">Maior categoria</div>
                <div class="stat__v">
                  {{ categoryLabel(summary().topCategory) }}
                  <span class="muted stat__sub">({{ money(summary().topAmount) }})</span>
                </div>
              </div>

              <div class="stat">
                <div class="stat__k muted">Economia possível</div>
                <div class="stat__v">{{ money(summary().potentialSaving) }}</div>
              </div>
            </div>
          </div>

          <div class="controls">
            <div class="control">
              <div class="control__label muted">Período</div>
              <div class="seg" role="tablist" aria-label="Período">
                <button class="segBtn focus-ring" type="button" (click)="period.set(7)"  [class.is-active]="period() === 7">7d</button>
                <button class="segBtn focus-ring" type="button" (click)="period.set(30)" [class.is-active]="period() === 30">30d</button>
                <button class="segBtn focus-ring" type="button" (click)="period.set(90)" [class.is-active]="period() === 90">90d</button>
              </div>
            </div>

            <label class="field">
              <span class="field__label muted">Categoria</span>
              <select class="select focus-ring" [value]="categoryFilter()" (change)="onCategoryChange($any($event.target).value)">
                <option value="all">Todas</option>
                <option value="fastfood">Fast-food</option>
                <option value="market">Mercado</option>
                <option value="transport">Transporte</option>
                <option value="subscriptions">Assinaturas</option>
                <option value="leisure">Lazer</option>
                <option value="other">Outros</option>
              </select>
            </label>
          </div>
        </div>
      </mira-ui-card>

      <!-- STATES -->
      <ng-container [ngSwitch]="state()">
        <div *ngSwitchCase="'loading'" class="grid">
          <mira-ui-card class="ins-card"><div class="ins-inner"><mira-ui-skeleton height="160px" radius="18px" /></div></mira-ui-card>
          <mira-ui-card class="ins-card"><div class="ins-inner"><mira-ui-skeleton height="160px" radius="18px" /></div></mira-ui-card>
          <mira-ui-card class="ins-card"><div class="ins-inner"><mira-ui-skeleton height="160px" radius="18px" /></div></mira-ui-card>
        </div>

        <div *ngSwitchCase="'empty'" class="state">
          <mira-ui-empty-state
            title="Sem insights por enquanto"
            description="No Kick-off isso é simulado. Depois, a API traz recomendações personalizadas pelos seus gastos."
            actionLabel="Recarregar"
            [action]="reload"
          />
        </div>

        <div *ngSwitchCase="'error'" class="state">
          <mira-ui-error-state
            title="Não foi possível carregar"
            description="Simulação de erro (Kick-off). Em produção virá da API."
            actionLabel="Tentar novamente"
            [action]="reload"
          />
        </div>

        <div *ngSwitchDefault class="grid">
          <mira-ui-card class="ins-card" *ngFor="let i of visible(); let idx = index; trackBy: trackById">
            <div
              class="ins-inner"
              [attr.data-kind]="i.kind"
              [style.animationDelay.ms]="idx * 45"
            >
              <div class="topline">
                <div class="tag">{{ i.tag }}</div>
                <div class="kpi muted" *ngIf="i.category !== 'general'">
                  {{ categoryLabel(i.category) }}
                </div>
              </div>

              <div class="h3">{{ i.title }}</div>
              <div class="muted body">{{ i.body }}</div>

              <div class="why">
                <div class="why__k">Por que isso ajuda</div>
                <div class="muted why__t">{{ i.why }}</div>
              </div>

              <div class="actions">
                <mira-ui-button variant="secondary" (click)="save(i)">Salvar</mira-ui-button>
                <mira-ui-button variant="primary" (click)="doNow(i)">{{ i.actionLabel }}</mira-ui-button>
              </div>
            </div>
          </mira-ui-card>

          <div class="muted hint" *ngIf="visible().length === 0">
            Nenhum insight nessa categoria no período selecionado.
          </div>
        </div>
      </ng-container>

      <div class="note muted" *ngIf="state() === 'ready'">
        TODO (pós Kick-off): conectar API de transações/insights, limites por categoria, e histórico (comparar com mês anterior).
      </div>
    </div>
  `,
  styles: [
    `
      :host { display: block; }
      mira-ui-card { display: block; min-width: 0; }

      .page { display: grid; gap: 14px; }

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

      .head__actions{
        display:flex;
        gap:10px;
        flex-wrap:wrap;
      }

      .pill{
        border: 1px solid var(--border);
        background: rgba(255,255,255,0.04);
        color: var(--text);
        border-radius: 999px;
        padding: 8px 12px;
        cursor: pointer;
        transition: transform 160ms ease, background 160ms ease;
      }
      .pill:hover{
        transform: translateY(-1px);
        background: rgba(255,255,255,0.07);
      }

      /* Context */
      .context{
        border-radius: 22px;
        border: 1px solid rgba(255,255,255,0.10);
        background: linear-gradient(180deg, rgba(15,18,26,0.56), rgba(12,14,20,0.34));
        box-shadow: 0 24px 80px rgba(0,0,0,0.26);
        backdrop-filter: blur(12px);
        animation: fadeUp 220ms ease both;
      }

      .context__inner{
        padding: 16px;
        display:flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 14px;
        flex-wrap: wrap;
      }

      .context__left{ min-width: 280px; flex: 1; }

      .kicker{
        width: fit-content;
        padding: 6px 10px;
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 999px;
        background: rgba(255,255,255,0.05);
        color: var(--muted);
        font-size: 12px;
      }

      .context__title{
        margin-top: 10px;
        font-weight: 950;
        font-size: 18px;
        letter-spacing: -0.2px;
      }

      .context__desc{
        margin-top: 6px;
        font-size: 12px;
        max-width: 68ch;
      }

      .stats{
        margin-top: 12px;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
      }
      @media (max-width: 900px){
        .stats{ grid-template-columns: 1fr; }
      }

      .stat{
        border: 1px solid rgba(255,255,255,0.10);
        background: rgba(255,255,255,0.035);
        border-radius: 16px;
        padding: 10px 12px;
      }
      .stat__k{ font-size: 12px; font-weight: 800; }
      .stat__v{
        margin-top: 4px;
        font-weight: 950;
        letter-spacing: -0.2px;
        font-size: 14px;
      }
      .stat__sub{ font-weight: 800; font-size: 12px; margin-left: 6px; opacity: .85; }

      .controls{
        display: grid;
        gap: 10px;
        align-content: start;
        min-width: 240px;
      }

      .control{ display: grid; gap: 8px; }
      .control__label{ font-size: 12px; font-weight: 850; }

      .seg{
        display: inline-flex;
        gap: 8px;
        flex-wrap: wrap;
        padding: 8px;
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.10);
        background: rgba(255,255,255,0.03);
      }

      .segBtn{
        border: 1px solid rgba(255,255,255,0.12);
        background: rgba(255,255,255,0.04);
        color: rgba(255,255,255,0.82);
        border-radius: 999px;
        padding: 8px 12px;
        cursor: pointer;
        transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
        font-weight: 900;
        font-size: 12px;
        letter-spacing: -0.15px;
      }
      .segBtn:hover{
        transform: translateY(-1px);
        background: rgba(255,255,255,0.07);
        border-color: rgba(255,255,255,0.18);
      }
      .segBtn.is-active{
        background: linear-gradient(180deg, rgba(133,94,217,0.22), rgba(255,255,255,0.04));
        border-color: rgba(133,94,217,0.45);
        color: rgba(255,255,255,0.92);
        box-shadow: 0 14px 34px rgba(133,94,217,0.16);
      }

      .field{ display: grid; gap: 7px; }
      .field__label{ font-size: 12px; font-weight: 850; }

      .select{
        width: 100%;
        border-radius: 16px;
        padding: 12px 44px 12px 12px;
        border: 1px solid rgba(255,255,255,0.12);
        background: rgba(255,255,255,0.045);
        color: rgba(255,255,255,0.92);
        outline: none;
        min-height: 44px;
        transition: border-color 160ms ease, background 160ms ease;
      }
      .select:hover{ background: rgba(255,255,255,0.06); }
      .select:focus{ border-color: rgba(133,94,217,0.45); }
      .select option{
        background: rgba(12,14,20,1);
        color: rgba(255,255,255,0.92);
      }

      /* Grid */
      .grid{
        display:grid;
        grid-template-columns: 1fr;
        gap: 12px;
      }
      @media (min-width: 980px){
        .grid{ grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }

      .ins-inner{
        padding: 16px;
        display:grid;
        gap: 10px;
        border-radius: 18px;
        border: 1px solid rgba(255,255,255,0.10);
        background: rgba(255,255,255,0.03);
        box-shadow: 0 18px 60px rgba(0,0,0,0.18);
        animation: rise 240ms ease both;
        transition: transform 180ms ease, background 180ms ease, border-color 180ms ease;
      }
      .ins-inner:hover{
        transform: translateY(-1px);
        background: rgba(255,255,255,0.05);
        border-color: rgba(255,255,255,0.14);
      }

      /* tons por “kind” (bem leve e mais sério) */
      .ins-inner[data-kind='warning']{
        background: linear-gradient(180deg, rgba(255,92,122,0.10), rgba(255,255,255,0.02));
        border-color: rgba(255,92,122,0.18);
      }
      .ins-inner[data-kind='positive']{
        background: linear-gradient(180deg, rgba(35,209,195,0.09), rgba(255,255,255,0.02));
        border-color: rgba(35,209,195,0.16);
      }
      .ins-inner[data-kind='info']{
        background: linear-gradient(180deg, rgba(132,210,244,0.08), rgba(255,255,255,0.02));
        border-color: rgba(132,210,244,0.16);
      }

      .topline{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap: 10px;
      }

      .tag{
        width: fit-content;
        padding: 6px 10px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,0.12);
        background: rgba(255,255,255,0.04);
        font-size: 12px;
        font-weight: 850;
        color: rgba(255,255,255,0.82);
      }

      .kpi{
        font-size: 12px;
        font-weight: 850;
        white-space: nowrap;
        opacity: .9;
      }

      .h3{
        font-weight: 950;
        letter-spacing: -0.2px;
        font-size: 16px;
        line-height: 1.2;
      }

      .body{
        font-size: 13px;
        line-height: 1.5;
        max-width: 76ch;
      }

      .why{
        margin-top: 2px;
        border-top: 1px solid rgba(255,255,255,0.08);
        padding-top: 10px;
        display:grid;
        gap: 4px;
      }
      .why__k{ font-weight: 950; font-size: 12px; }
      .why__t{ font-size: 12px; line-height: 1.35; }

      .actions{
        margin-top: 6px;
        display:flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .state{ padding: 16px 0; }

      .note{ font-size: 12px; }
      .hint{ font-size: 12px; padding: 6px 2px; }

      @keyframes rise{
        from{ opacity: 0; transform: translateY(6px); }
        to{ opacity: 1; transform: translateY(0); }
      }

      @keyframes fadeUp{
        from{ opacity: 0; transform: translateY(6px); }
        to{ opacity: 1; transform: translateY(0); }
      }

      @media (prefers-reduced-motion: reduce){
        .context, .ins-inner{ animation: none !important; transition: none !important; }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InsightsPage {
  private readonly toast = inject(ToastService);

  readonly state = signal<ViewState>('ready');

  // mock “perfil”
  readonly profile = signal('controle leve');
  readonly goal = signal('reduzir ansiedade financeira');

  // controles
  readonly period = signal<Period>(30);
  readonly categoryFilter = signal<'all' | SpendCategory>('all');

  // mock “transações”
  readonly tx = signal<SpendTx[]>([
    // últimos dias (mock)
    { id: 't1', date: this.daysAgoIso(2),  category: 'fastfood',      label: 'Burger',          amount: 48.9 },
    { id: 't2', date: this.daysAgoIso(3),  category: 'market',        label: 'Mercado',         amount: 212.4 },
    { id: 't3', date: this.daysAgoIso(4),  category: 'subscriptions', label: 'Streaming',       amount: 39.9 },
    { id: 't4', date: this.daysAgoIso(6),  category: 'transport',     label: 'Uber',            amount: 26.5 },
    { id: 't5', date: this.daysAgoIso(9),  category: 'fastfood',      label: 'Pizza',           amount: 72.0 },
    { id: 't6', date: this.daysAgoIso(11), category: 'leisure',       label: 'Cinema',          amount: 54.0 },
    { id: 't7', date: this.daysAgoIso(15), category: 'market',        label: 'Mercado',         amount: 178.2 },
    { id: 't8', date: this.daysAgoIso(18), category: 'fastfood',      label: 'Delivery',        amount: 36.9 },
    { id: 't9', date: this.daysAgoIso(22), category: 'subscriptions', label: 'App',             amount: 19.9 },
    { id: 't10',date: this.daysAgoIso(28), category: 'other',         label: 'Farmácia',        amount: 63.4 },

    // mais antigo (entra no 90d)
    { id: 't11',date: this.daysAgoIso(46), category: 'fastfood',      label: 'Fast-food',       amount: 89.0 },
    { id: 't12',date: this.daysAgoIso(63), category: 'transport',     label: 'Transporte',      amount: 110.0 },
  ]);

  private readonly limits = {
    fastfood: 220,
    market: 700,
    transport: 260,
    subscriptions: 120,
    leisure: 180,
    other: 300,
  } satisfies Record<SpendCategory, number>;

  readonly filteredTx = computed(() => {
    const days = this.period();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    cutoff.setHours(0, 0, 0, 0);

    return this.tx().filter((t) => new Date(t.date).getTime() >= cutoff.getTime());
  });

  readonly byCategory = computed(() => {
    const acc: Record<SpendCategory, number> = {
      fastfood: 0,
      market: 0,
      transport: 0,
      subscriptions: 0,
      leisure: 0,
      other: 0,
    };

    for (const t of this.filteredTx()) acc[t.category] += t.amount;
    return acc;
  });

  readonly summary = computed(() => {
    const by = this.byCategory();
    const total = Object.values(by).reduce((a, b) => a + b, 0);

    let topCategory: SpendCategory = 'market';
    let topAmount = -1;
    (Object.keys(by) as SpendCategory[]).forEach((k) => {
      if (by[k] > topAmount) {
        topAmount = by[k];
        topCategory = k;
      }
    });

    // “economia possível” mock: 25% do que estiver acima do limite, somado
    let potentialSaving = 0;
    (Object.keys(by) as SpendCategory[]).forEach((k) => {
      const over = Math.max(0, by[k] - this.limits[k]);
      potentialSaving += over * 0.25;
    });

    return { total, topCategory, topAmount: Math.max(0, topAmount), potentialSaving };
  });

  readonly insights = computed<Insight[]>(() => {
    const by = this.byCategory();
    const days = this.period();

    const makeId = (x: string) => `i_${x}_${days}`;

    const list: Insight[] = [];

    // 1) Fast-food
    const ff = by.fastfood;
    if (ff > this.limits.fastfood) {
      const over = ff - this.limits.fastfood;
      list.push({
        id: makeId('fastfood_over'),
        tag: 'Ajuste direto',
        title: `Fast-food acima do ideal no período`,
        body: `Você gastou ${this.money(ff)} em fast-food nos últimos ${days} dias. Um corte leve de ${this.money(over * 0.25)} já melhora o mês sem “apertar”.`,
        why: `Fast-food costuma ser um gasto invisível (pequeno e recorrente). Ajustar só uma parte já reduz o total com pouco esforço.`,
        actionLabel: 'Criar limite',
        kind: 'warning',
        category: 'fastfood',
      });
    } else {
      list.push({
        id: makeId('fastfood_ok'),
        tag: 'Bom sinal',
        title: `Fast-food sob controle`,
        body: `Seu gasto em fast-food está em ${this.money(ff)} no período. Mantendo assim, você evita “vazamentos” no orçamento.`,
        why: `Quando essa categoria fica estável, você ganha previsibilidade e diminui a chance de estourar o mês.`,
        actionLabel: 'Salvar dica',
        kind: 'positive',
        category: 'fastfood',
      });
    }

    // 2) Assinaturas
    const subs = by.subscriptions;
    list.push({
      id: makeId('subs'),
      tag: 'Revisão rápida',
      title: `Assinaturas: vale checar 10 minutos`,
      body: `Assinaturas somaram ${this.money(subs)} no período. Se tiver 1 serviço pouco usado, trocar/pausar já libera espaço.`,
      why: `Assinaturas são silenciosas e acumulam. Uma revisão curta evita pagar por coisa parada.`,
      actionLabel: 'Revisar assinaturas',
      kind: subs > this.limits.subscriptions ? 'warning' : 'info',
      category: 'subscriptions',
    });

    // 3) Mercado (dica prática)
    const mk = by.market;
    list.push({
      id: makeId('market'),
      tag: 'Praticidade',
      title: `Mercado: 1 regra simples pra reduzir desperdício`,
      body: `Mercado está em ${this.money(mk)} no período. Antes de ir, liste 6 itens essenciais + 2 “livres”. Isso reduz compras por impulso.`,
      why: `Uma lista curta mantém o foco e diminui gasto por “aproveitar promoção” sem necessidade.`,
      actionLabel: 'Salvar regra',
      kind: 'info',
      category: 'market',
    });

    // 4) Geral: revisão semanal
    list.push({
      id: makeId('weekly'),
      tag: 'Rotina',
      title: `Check-in de 8 minutos (1x/semana)`,
      body: `Escolha um dia fixo: veja o total gasto, a maior categoria e 1 ajuste simples pra próxima semana.`,
      why: `Revisão curta evita surpresa e aumenta sensação de controle sem virar “planilha eterna”.`,
      actionLabel: 'Criar lembrete',
      kind: 'positive',
      category: 'general',
    });

    return list;
  });

  readonly visible = computed(() => {
    const f = this.categoryFilter();
    const arr = this.insights();
    if (f === 'all') return arr;
    return arr.filter((i) => i.category === f);
  });

  onCategoryChange(v: string) {
    const next = (v || 'all') as 'all' | SpendCategory;
    this.categoryFilter.set(next);
  }

  reload = () => {
    this.state.set('loading');
    setTimeout(() => this.state.set('ready'), 650);
  };

  trackById = (_: number, it: Insight) => it.id;

  save(i: Insight) {
    this.toast.push({ type: 'success', title: 'Salvo', message: `“${i.title}” foi salvo (mock).` });
  }

  doNow(i: Insight) {
    this.toast.push({
      type: 'success',
      title: 'Boa!',
      message: `Ação “${i.actionLabel}” (mock) registrada.`,
    });
  }

  money(v: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
  }

  categoryLabel(c: SpendCategory | 'general') {
    if (c === 'general') return 'Geral';
    if (c === 'fastfood') return 'Fast-food';
    if (c === 'market') return 'Mercado';
    if (c === 'transport') return 'Transporte';
    if (c === 'subscriptions') return 'Assinaturas';
    if (c === 'leisure') return 'Lazer';
    return 'Outros';
  }

  private daysAgoIso(n: number) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
  }
}