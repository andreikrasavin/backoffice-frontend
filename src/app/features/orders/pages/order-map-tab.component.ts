import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

// TODO: order map
@Component({
  selector: 'bf-order-map-tab',
  imports: [NzEmptyModule],
  templateUrl: './order-map-tab.component.html',
  styleUrl: './order-map-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderMapTabComponent {}
