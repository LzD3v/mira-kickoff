import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  Input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'mira-ui-input',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiInputComponent),
      multi: true,
    },
  ],
  template: `
    <label class="field">
      <span class="label" *ngIf="label">{{ label }}</span>

      <div class="control" [class.has-error]="!!error">
        <input
          class="input focus-ring"
          [attr.type]="type"
          [attr.placeholder]="placeholder"
          [attr.autocomplete]="autocomplete"
          [disabled]="disabled"
          [value]="value()"
          (input)="onInput($event)"
          (blur)="onTouched()"
          [attr.aria-invalid]="!!error"
          [attr.aria-describedby]="hint || error ? describedById : null"
        />
      </div>

      <div class="meta" *ngIf="hint || error" [id]="describedById">
        <span class="hint" *ngIf="hint && !error">{{ hint }}</span>
        <span class="error" *ngIf="error">{{ error }}</span>
      </div>
    </label>
  `,
  styleUrl: './ui-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiInputComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() hint?: string;
  @Input() error?: string;
  @Input() placeholder = '';
  @Input() type: 'text' | 'email' | 'password' | 'number' = 'text';
  @Input() autocomplete = 'on';

  disabled = false;
  readonly value = signal('');

  describedById = `desc-${Math.random().toString(16).slice(2)}`;

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

  onInput(ev: Event) {
    const v = (ev.target as HTMLInputElement).value;
    this.value.set(v);
    this.onChange(v);
  }
}