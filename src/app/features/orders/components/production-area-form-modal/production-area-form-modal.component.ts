import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NZ_MODAL_DATA, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { ProductionArea, ProductionOperation } from '@features/orders/models';
import { OrderDetailsStore } from '@features/orders/data-access';
import {
  PRODUCTION_MASTERS,
  PRODUCTION_MATERIALS,
  PRODUCTION_MATERIALS_BY_ID,
  PRODUCTION_MATERIALS_BY_NAME,
  PRODUCTION_OPERATIONS,
} from '@features/orders/data-access/production-area-dictionaries';
import { generateId } from '@shared/utils';

export interface ProductionAreaFormModalData {
  readonly area: ProductionArea;
}

type OperationRowForm = FormGroup<{
  id: FormControl<string | null>;
  master: FormControl<string | null>;
  operation: FormControl<string | null>;
  materialId: FormControl<string | null>;
  quantity: FormControl<number | null>;
}>;

interface OperationRowValue {
  readonly id: string | null;
  readonly master: string | null;
  readonly operation: string | null;
  readonly materialId: string | null;
  readonly quantity: number | null;
}

@Component({
  selector: 'bf-production-area-form-modal',
  imports: [
    ReactiveFormsModule,
    NzButtonModule,
    NzCardModule,
    NzEmptyModule,
    NzFormModule,
    NzIconModule,
    NzInputNumberModule,
    NzSelectModule,
    NzTooltipModule,
  ],
  templateUrl: './production-area-form-modal.component.html',
  styleUrl: './production-area-form-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductionAreaFormModalComponent {
  private readonly data = inject<ProductionAreaFormModalData>(NZ_MODAL_DATA);
  private readonly store = inject(OrderDetailsStore);
  private readonly fb = inject(FormBuilder);
  private readonly modalRef = inject(NzModalRef);
  private readonly modal = inject(NzModalService);

  readonly area = this.data.area;
  readonly masters = PRODUCTION_MASTERS;
  readonly operations = PRODUCTION_OPERATIONS;
  readonly materials = PRODUCTION_MATERIALS;

  readonly saving = computed(() => this.store.updatingAreaId() === this.area.id);
  readonly rowsError = signal(false);

  private readonly existingOperations = new Map(
    this.area.operations.map((operation) => [operation.id, operation]),
  );

  readonly form = this.fb.group({
    rows: this.fb.array<OperationRowForm>([]),
  });

  constructor() {
    if (this.area.operations.length === 0) {
      this.addRow();
    } else {
      for (const operation of this.area.operations) {
        this.rows.push(this.createRow(operation));
      }
    }
  }

  get rows(): FormArray<OperationRowForm> {
    return this.form.controls.rows;
  }

  isSaving(): boolean {
    return this.saving();
  }

  protected materialUnit(row: OperationRowForm): string {
    const materialId = row.controls.materialId.value;

    if (!materialId) {
      return '—';
    }

    return PRODUCTION_MATERIALS_BY_ID.get(materialId)?.unit ?? '—';
  }

  protected addRow(): void {
    if (this.saving()) {
      return;
    }

    this.rows.push(this.createRow());
    this.rowsError.set(false);
  }

  protected removeRow(index: number): void {
    if (this.saving()) {
      return;
    }

    this.rows.removeAt(index);
    this.form.markAsDirty();
  }

  protected async save(): Promise<void> {
    if (this.saving()) {
      return;
    }

    if (this.rows.length === 0) {
      this.rowsError.set(true);
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      for (const row of this.rows.controls) {
        for (const control of Object.values(row.controls)) {
          control.updateValueAndValidity();
        }
      }
      return;
    }

    const operations = this.rows
      .getRawValue()
      .map((row) => this.toOperation(row))
      .filter((operation): operation is ProductionOperation => operation !== null);

    if (operations.length !== this.rows.length) {
      this.rowsError.set(true);
      return;
    }

    const saved = await this.store.updateArea(this.area.id, operations);

    if (saved) {
      this.modalRef.close();
    }
  }

  protected cancel(): void {
    if (this.saving()) {
      return;
    }

    if (!this.form.dirty) {
      this.modalRef.close();
      return;
    }

    this.modal.confirm({
      nzTitle: 'Отменить изменения?',
      nzContent: 'Несохранённые изменения будут потеряны.',
      nzOkText: 'Отменить изменения',
      nzOkDanger: true,
      nzCancelText: 'Продолжить редактирование',
      nzOnOk: () => this.modalRef.close(),
    });
  }

  private createRow(operation?: ProductionOperation): OperationRowForm {
    const material = operation ? PRODUCTION_MATERIALS_BY_NAME.get(operation.material) : undefined;

    return this.fb.group({
      id: this.fb.control<string | null>(operation?.id ?? null),
      master: this.fb.control<string | null>(operation?.master ?? null, Validators.required),
      operation: this.fb.control<string | null>(operation?.operation ?? null, Validators.required),
      materialId: this.fb.control<string | null>(material?.id ?? null, Validators.required),
      quantity: this.fb.control<number | null>(operation?.quantity ?? null, [
        Validators.required,
        Validators.min(0.01),
      ]),
    });
  }

  private toOperation(row: OperationRowValue): ProductionOperation | null {
    const { id, master, operation, materialId, quantity } = row;
    const material = materialId ? PRODUCTION_MATERIALS_BY_ID.get(materialId) : undefined;

    if (!master || !operation || !material || quantity === null || quantity <= 0) {
      return null;
    }

    const existing = id ? this.existingOperations.get(id) : undefined;

    return {
      id: id ?? generateId('op'),
      master,
      startDate: existing?.startDate ?? null,
      endDate: existing?.endDate ?? null,
      operation,
      material: material.name,
      unit: material.unit,
      quantity,
    };
  }
}
