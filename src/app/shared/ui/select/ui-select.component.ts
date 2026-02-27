import { ChangeDetectionStrategy, Component, forwardRef, Input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';

export type UiOption = { label: string; value: string };

@Component({
  selector: 'mira-ui-select',
  standalone: true,
  imports: [NgFor, NgIf],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UiSelectComponent), multi: true },
  ],
  template: `
    <label class="field">
      <span class="label" *ngIf="label">{{ label }}</span>

      <div class="control">
        <select
          class="select focus-ring"
          [disabled]="disabled"
          [value]="value()"
          (change)="onChangeSelect($event)"
          (blur)="onTouched()"
        >
          <option *ngFor="let o of options" [value]="o.value">{{ o.label }}</option>
        </select>
      </div>

      <div class="meta" *ngIf="hint">
        <span class="hint">{{ hint }}</span>
      </div>
    </label>
  `,
  styleUrl: './ui-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiSelectComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() hint?: string;
  @Input() options: UiOption[] = [];

  disabled = false;
  readonly value = signal('');

  private onChange: (v: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(v: string | null): void {
    this.value.set(v ?? '');
  }
  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onChangeSelect(ev: Event) {
    const v = (ev.target as HTMLSelectElement).value;
    this.value.set(v);
    this.onChange(v);
  }
}