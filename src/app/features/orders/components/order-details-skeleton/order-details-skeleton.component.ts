import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type OrderDetailsSkeletonSection = 'header' | 'main' | 'sidebar';

@Component({
  selector: 'bf-order-details-skeleton',
  imports: [],
  templateUrl: './order-details-skeleton.component.html',
  styleUrl: './order-details-skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailsSkeletonComponent {
  readonly section = input<OrderDetailsSkeletonSection>('main');

  protected readonly fields = [0, 1, 2, 3, 4, 5, 6, 7];
  protected readonly areaCards = [0, 1, 2];
  protected readonly areaRows = [0, 1, 2, 3];
}
