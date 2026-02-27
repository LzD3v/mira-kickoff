import { animate, query, style, transition, trigger } from '@angular/animations';

export const routeFadeSlide = trigger('routeFadeSlide', [
  transition('* <=> *', [
    query(':enter, :leave', style({ position: 'fixed', width: '100%' }), { optional: true }),
    query(':leave', [animate('180ms ease', style({ opacity: 0, transform: 'translateY(-6px)' }))], {
      optional: true,
    }),
    query(':enter', [style({ opacity: 0, transform: 'translateY(8px)' }), animate('260ms ease', style({ opacity: 1, transform: 'translateY(0)' }))], {
      optional: true,
    }),
  ]),
]);