import { ChangeDetectionStrategy, Component, forwardRef, Input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'mira-ui-checkbox',
  standalone: true,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UiCheckboxComponent), multi: true },
  ],
  template: `
    <label class="wrap">
      <input
        class="native"
        type="checkbox"
        [checked]="checked()"
        [disabled]="disabled"
        (change)="onToggle($event)"
        (blur)="onTouched()"
      />
      <span class="box" aria-hidden="true"></span>
      <span class="text"><ng-content /></span>
    </label>
  `,
  styleUrl: './ui-checkbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiCheckboxComponent implements ControlValueAccessor {
  @Input() disabled = false;
  readonly checked = signal(false);

  private onChange: (v: boolean) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(v: boolean | null): void {
    this.checked.set(!!v);
  }
  registerOnChange(fn: (v: boolean) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onToggle(ev: Event) {
    const v = (ev.target as HTMLInputElement).checked;
    this.checked.set(v);
    this.onChange(v);
  }
}