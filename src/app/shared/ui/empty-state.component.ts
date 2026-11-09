import { Component, input } from '@angular/core';
import { NzEmptyComponent } from 'ng-zorro-antd/empty';

@Component({
  selector: 'bf-empty-state',
  imports: [NzEmptyComponent],
  template: `<nz-empty [nzNotFoundContent]="description()" />`,
})
export class EmptyStateComponent {
  readonly description = input<string>('Нет данных');
}
