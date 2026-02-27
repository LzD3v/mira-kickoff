import { ChangeDetectionStrategy, Component, forwardRef, Input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'mira-ui-textarea',
  standalone: true,
  imports: [NgIf],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UiTextareaComponent), multi: true },
  ],
  template: `
    <label class="field">
      <span class="label" *ngIf="label">{{ label }}</span>

      <div class="control" [class.has-error]="!!error">
        <textarea
          class="textarea focus-ring"
          [attr.placeholder]="placeholder"
          [rows]="rows"
          [disabled]="disabled"
          [value]="value()"
          (input)="onInput($event)"
          (blur)="onTouched()"
          [attr.aria-invalid]="!!error"
        ></textarea>
      </div>

      <div class="meta" *ngIf="hint || error">
        <span class="hint" *ngIf="hint && !error">{{ hint }}</span>
        <span class="error" *ngIf="error">{{ error }}</span>
      </div>
    </label>
  `,
  styleUrl: './ui-textarea.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiTextareaComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() hint?: string;
  @Input() error?: string;
  @Input() placeholder = '';
  @Input() rows = 4;

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

  onInput(ev: Event) {
    const v = (ev.target as HTMLTextAreaElement).value;
    this.value.set(v);
    this.onChange(v);
  }
}