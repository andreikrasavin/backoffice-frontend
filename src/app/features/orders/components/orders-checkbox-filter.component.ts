import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTagModule } from 'ng-zorro-antd/tag';

export interface FilterOption {
  readonly value: string;
  readonly label: string;
}

/**
 * Список опций с чекбоксами, поиском и чипами выбранного.
 * Модель остаётся плоским массивом значений — контракт `OrdersFilter` не меняется.
 */
@Component({
  selector: 'bf-orders-checkbox-filter',
  imports: [FormsModule, NzCheckboxModule, NzEmptyModule, NzIconModule, NzInputModule, NzTagModule],
  template: `
    <div class="checkbox-filter">
      @if (selectedOptions().length > 0) {
        <div class="checkbox-filter__chips">
          @for (option of selectedOptions(); track option.value) {
            <nz-tag nzMode="closeable" (nzOnClose)="remove(option.value)">
              {{ option.label }}
            </nz-tag>
          }
        </div>
      }

      <div class="checkbox-filter__search">
        <nz-icon nzType="search" />
        <input
          nz-input
          type="search"
          [placeholder]="searchPlaceholder()"
          [ngModel]="query()"
          (ngModelChange)="query.set($event)"
        />
      </div>

      <div
        class="checkbox-filter__all"
        nz-checkbox
        [ngModel]="allVisibleSelected()"
        [nzIndeterminate]="someVisibleSelected()"
        (ngModelChange)="toggleAll($event)"
      >
        Выбрать все
      </div>

      <div class="checkbox-filter__list">
        @for (option of filteredOptions(); track option.value) {
          <div
            class="checkbox-filter__option"
            nz-checkbox
            [ngModel]="isSelected(option.value)"
            (ngModelChange)="toggle(option.value, $event)"
          >
            {{ option.label }}
          </div>
        } @empty {
          <nz-empty nzNotFoundContent="Ничего не найдено" />
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .checkbox-filter {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .checkbox-filter__chips {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      max-height: 72px;
      overflow-y: auto;
      scrollbar-color: var(--app-color-border) transparent;
    }

    .checkbox-filter__chips nz-tag {
      margin: 0;
    }

    .checkbox-filter__search {
      position: relative;
    }

    .checkbox-filter__search nz-icon {
      position: absolute;
      top: 50%;
      left: 10px;
      color: var(--app-color-text-secondary);
      transform: translateY(-50%);
      pointer-events: none;
    }

    .checkbox-filter__search input {
      padding-left: 30px;
    }

    .checkbox-filter__all {
      padding-bottom: 4px;
      border-bottom: 1px solid var(--app-color-border);
    }

    .checkbox-filter__list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      max-height: 240px;
      overflow-y: auto;
      scrollbar-color: var(--app-color-border) transparent;
    }

    .checkbox-filter__option {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersCheckboxFilterComponent {
  readonly options = input.required<readonly FilterOption[]>();
  readonly selected = input.required<readonly string[]>();
  readonly searchPlaceholder = input('Поиск');

  readonly selectedChange = output<readonly string[]>();

  readonly query = signal('');

  readonly filteredOptions = computed(() => {
    const query = this.query().trim().toLowerCase();

    if (!query) {
      return this.options();
    }

    return this.options().filter((option) => option.label.toLowerCase().includes(query));
  });

  readonly selectedOptions = computed(() =>
    this.options().filter((option) => this.selected().includes(option.value)),
  );

  readonly allVisibleSelected = computed(() => {
    const options = this.filteredOptions();

    return options.length > 0 && options.every((option) => this.isSelected(option.value));
  });

  readonly someVisibleSelected = computed(
    () =>
      !this.allVisibleSelected() && this.filteredOptions().some((o) => this.isSelected(o.value)),
  );

  isSelected(value: string): boolean {
    return this.selected().includes(value);
  }

  toggle(value: string, checked: boolean): void {
    const next = new Set(this.selected());

    if (checked) {
      next.add(value);
    } else {
      next.delete(value);
    }

    this.selectedChange.emit([...next]);
  }

  toggleAll(checked: boolean): void {
    const next = new Set(this.selected());

    for (const option of this.filteredOptions()) {
      if (checked) {
        next.add(option.value);
      } else {
        next.delete(option.value);
      }
    }

    this.selectedChange.emit([...next]);
  }

  remove(value: string): void {
    const next = this.selected().filter((item) => item !== value);

    this.selectedChange.emit(next);
  }
}
