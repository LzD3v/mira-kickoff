import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UiToastHostComponent } from '@ui/toast/ui-toast-host.component';
import { UiModalHostComponent } from '@ui/modal/ui-modal-host.component';

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
export class AppComponent {}