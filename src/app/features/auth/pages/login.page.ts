import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { animate, style, transition, trigger } from '@angular/animations';
import { UiButtonComponent } from '@ui/button/ui-button.component';
import { UiInputComponent } from '@ui/input/ui-input.component';
import { UiCardComponent } from '@ui/card/ui-card.component';
import { ToastService } from '@core/services/toast.service';
import { AuthService } from '@core/services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, UiButtonComponent, UiInputComponent, UiCardComponent, TranslateModule],
  animations: [
    trigger('enter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px) scale(0.995)' }),
        animate('320ms cubic-bezier(.2,.9,.2,1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
      ]),
    ]),
  ],
  template: `
    <div class="container wrap">
      <mira-ui-card class="card" @enter>
        <div class="inner">
          <div class="head">
            <div class="kicker">{{ 'AUTH.LOGIN.KICKER' | translate }}</div>
            <h1 class="title">{{ 'AUTH.LOGIN.TITLE' | translate }}</h1>
            <p class="muted desc" [innerHTML]="'AUTH.LOGIN.DESC_HTML' | translate"></p>
          </div>

          <form class="form" [formGroup]="form" (ngSubmit)="submit()">
            <mira-ui-input
              [label]="'AUTH.LOGIN.EMAIL_LABEL' | translate"
              type="email"
              autocomplete="email"
              [placeholder]="'AUTH.LOGIN.EMAIL_PLACEHOLDER' | translate"
              formControlName="email"
              [error]="emailError()"
            />

            <mira-ui-input
              [label]="'AUTH.LOGIN.PASS_LABEL' | translate"
              type="password"
              autocomplete="current-password"
              [placeholder]="'AUTH.LOGIN.PASS_PLACEHOLDER' | translate"
              formControlName="password"
              [error]="passError()"
            />

            <div class="muted tip">
              {{ 'AUTH.LOGIN.TIP' | translate }}
            </div>

            <div class="actions">
              <mira-ui-button type="submit" variant="primary" size="lg" [loading]="loading()">
                {{ 'AUTH.LOGIN.BUTTON' | translate }}
              </mira-ui-button>
            </div>
          </form>
        </div>
      </mira-ui-card>
    </div>
  `,
  styles: [
    `
      .wrap {
        padding: 56px 0 72px;
        display: grid;
        place-items: center;
      }

      /* evita “tudo grudado no quadrado”: o padding fica no wrapper interno */
      .card {
        width: min(560px, 100%);
      }

      .inner {
        padding: 26px;
      }

      .head {
        text-align: center;
        margin-bottom: 18px;
      }

      .kicker {
        margin: 0 auto;
        width: fit-content;
        padding: 7px 12px;
        border: 1px solid var(--border);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.06);
        color: var(--muted);
        font-size: 12px;
      }

      .title {
        margin: 14px 0 8px;
        font-size: 30px;
        letter-spacing: -0.5px;
        font-weight: 900;
      }

      .desc {
        margin: 0 auto;
        max-width: 48ch;
        font-size: 14px;
      }

      .form {
        margin-top: 6px;
        display: grid;
        gap: 14px;
      }

      .tip {
        font-size: 12px;
        text-align: center;
        padding-top: 2px;
      }

      .actions {
        display: flex;
        justify-content: center;
        padding-top: 6px;
      }

      /* microinteração premium */
      .card {
        transition: transform 220ms ease, box-shadow 220ms ease;
      }
      .card:hover {
        transform: translateY(-2px);
      }

      @media (max-width: 520px) {
        .inner {
          padding: 18px;
        }
        .title {
          font-size: 26px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);
  private readonly t = inject(TranslateService);

  readonly loading = signal(false);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  emailError() {
    const c = this.form.controls.email;
    if (!c.touched) return '';
    if (c.hasError('required')) return this.t.instant('AUTH.ERRORS.EMAIL_REQUIRED');
    if (c.hasError('email')) return this.t.instant('AUTH.ERRORS.EMAIL_INVALID');
    return '';
  }

  passError() {
    const c = this.form.controls.password;
    if (!c.touched) return '';
    if (c.hasError('required')) return this.t.instant('AUTH.ERRORS.PASS_REQUIRED');
    if (c.hasError('minlength')) return this.t.instant('AUTH.ERRORS.PASS_SHORT');
    return '';
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.push({
        type: 'warning',
        title: this.t.instant('AUTH.ERRORS.REVIEW_TITLE'),
        message: this.t.instant('AUTH.ERRORS.REVIEW_MSG'),
      });
      return;
    }

    this.loading.set(true);
    try {
      const { email, password } = this.form.getRawValue();
      await this.auth.login(email!, password!);
      this.toast.push({
        type: 'success',
        title: this.t.instant('AUTH.TOASTS.WELCOME_TITLE'),
        message: this.t.instant('AUTH.TOASTS.WELCOME_MSG'),
      });
    } catch (e: any) {
      this.toast.push({
        type: 'danger',
        title: this.t.instant('AUTH.ERRORS.FAIL_TITLE'),
        message: e?.message ?? this.t.instant('AUTH.ERRORS.FAIL_MSG'),
      });
    } finally {
      this.loading.set(false);
    }
  }
}