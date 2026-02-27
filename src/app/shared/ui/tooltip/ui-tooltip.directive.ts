import { Directive, ElementRef, HostListener, Input, OnDestroy, Renderer2 } from '@angular/core';

@Directive({
  selector: '[miraTooltip]',
  standalone: true,
})
export class UiTooltipDirective implements OnDestroy {
  @Input('miraTooltip') text = '';

  private tip?: HTMLElement;
  private readonly id = `tip-${Math.random().toString(16).slice(2)}`;

  constructor(private el: ElementRef<HTMLElement>, private r: Renderer2) {}

  @HostListener('mouseenter')
  @HostListener('focus')
  show() {
    if (!this.text || this.tip) return;

    const host = this.el.nativeElement;
    this.tip = this.r.createElement('div') as HTMLElement;

    this.r.setAttribute(host, 'aria-describedby', this.id);
    this.r.setAttribute(this.tip, 'id', this.id);
    this.r.setStyle(this.tip, 'position', 'fixed');
    this.r.setStyle(this.tip, 'z-index', '100');
    this.r.setStyle(this.tip, 'padding', '8px 10px');
    this.r.setStyle(this.tip, 'border-radius', '12px');
    this.r.setStyle(this.tip, 'border', '1px solid var(--border)');
    this.r.setStyle(this.tip, 'background', 'rgba(0,0,0,.35)');
    this.r.setStyle(this.tip, 'backdrop-filter', 'blur(10px)');
    this.r.setStyle(this.tip, 'color', 'var(--text)');
    this.r.setStyle(this.tip, 'font-size', '12px');
    this.r.setStyle(this.tip, 'max-width', '260px');
    this.r.setStyle(this.tip, 'pointer-events', 'none');
    this.r.setStyle(this.tip, 'box-shadow', 'var(--shadow)');

    this.tip.textContent = this.text;
    document.body.appendChild(this.tip);

    const rect = host.getBoundingClientRect();
    const tipRect = this.tip.getBoundingClientRect();

    const top = Math.max(8, rect.top - tipRect.height - 10);
    const left = Math.min(window.innerWidth - tipRect.width - 8, Math.max(8, rect.left + rect.width / 2 - tipRect.width / 2));

    this.r.setStyle(this.tip, 'top', `${top}px`);
    this.r.setStyle(this.tip, 'left', `${left}px`);
  }

  @HostListener('mouseleave')
  @HostListener('blur')
  hide() {
    this.destroy();
  }

  @HostListener('keydown.escape')
  onEsc() {
    this.destroy();
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  private destroy() {
    const host = this.el.nativeElement;
    if (this.tip) {
      this.tip.remove();
      this.tip = undefined;
    }
    host.removeAttribute('aria-describedby');
  }
}