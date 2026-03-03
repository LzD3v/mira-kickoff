import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UiToastHostComponent } from '@ui/toast/ui-toast-host.component';
import { UiModalHostComponent } from '@ui/modal/ui-modal-host.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'mira-root',
  standalone: true,
  imports: [RouterOutlet, UiToastHostComponent, UiModalHostComponent],
  template: `
    <router-outlet />
    <mira-ui-toast-host />
    <mira-ui-modal-host />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly translate = inject(TranslateService);

  constructor() {
    const lang = (this.translate.currentLang || this.translate.getDefaultLang?.() || 'pt-BR') as string;
    document.documentElement.lang = lang;
    // garante que está ativo (sem depender só do provider)
    this.translate.use(lang);
  }
}