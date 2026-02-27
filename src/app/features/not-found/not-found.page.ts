import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiButtonComponent } from '@ui/button/ui-button.component';
import { UiCardComponent } from '@ui/card/ui-card.component';

@Component({
  standalone: true,
  imports: [RouterLink, UiButtonComponent, UiCardComponent],
  template: `
    <div class="container wrap">
      <mira-ui-card class="card">
        <div class="code">404</div>
        <div class="title">Página não encontrada</div>
        <div class="muted">Cheque o link ou volte para a home.</div>
        <div class="actions">
          <mira-ui-button routerLink="/" variant="primary">Ir para Home</mira-ui-button>
          <mira-ui-button routerLink="/app/dashboard" variant="secondary">Dashboard</mira-ui-button>
        </div>
      </mira-ui-card>
    </div>
  `,
  styles: [
    `
      .wrap {
        padding: 64px 0;
        display: grid;
        place-items: center;
      }
      .card {
        padding: 22px;
        width: min(560px, 100%);
        text-align: center;
      }
      .code {
        font-size: 44px;
        font-weight: 900;
        letter-spacing: -0.6px;
        background: linear-gradient(90deg, var(--brand-2), var(--brand));
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
      .title {
        margin-top: 10px;
        font-weight: 900;
        font-size: 18px;
      }
      .actions {
        margin-top: 14px;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        justify-content: center;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPage {}