import { ChangeDetectionStrategy, Component, forwardRef, Input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'mira-ui-toggle',
  standalone: true,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UiToggleComponent), multi: true },
  ],
  template: `
    <button
      class="toggle focus-ring"
      type="button"
      role="switch"
      [attr.aria-checked]="on()"
      [disabled]="disabled"
      (click)="flip()"
    >
      <span class="thumb" aria-hidden="true"></span>
    </button>
  `,
  styleUrl: './ui-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiToggleComponent implements ControlValueAccessor {
  @Input() disabled = false;
  readonly on = signal(false);

  private onChange: (v: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(v: boolean | null): void {
    this.on.set(!!v);
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

  flip() {
    if (this.disabled) return;
    const v = !this.on();
    this.on.set(v);
    this.onChange(v);
    this.onTouched();
  }
}