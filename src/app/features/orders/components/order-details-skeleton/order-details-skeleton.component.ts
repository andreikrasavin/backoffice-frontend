import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';

@Component({
  selector: 'bf-order-details-skeleton',
  imports: [NzSkeletonModule],
  templateUrl: './order-details-skeleton.component.html',
  styleUrl: './order-details-skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailsSkeletonComponent {
  private readonly reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  protected readonly reducedMotion = signal(this.reducedMotionQuery.matches);
  protected readonly fields = [0, 1, 2, 3, 4, 5, 6, 7];

  constructor() {
    const onChange = (event: MediaQueryListEvent): void => this.reducedMotion.set(event.matches);

    this.reducedMotionQuery.addEventListener('change', onChange);
    inject(DestroyRef).onDestroy(() =>
      this.reducedMotionQuery.removeEventListener('change', onChange),
    );
  }
}
