import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
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
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_MODAL_DATA, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { Subscription } from 'rxjs';
import { ProductionArea, ProductionOperation } from '@features/orders/models';
import { OrderDetailsStore } from '@features/orders/data-access';
import {
  PRODUCTION_MASTERS,
  PRODUCTION_MATERIALS_BY_ID,
  PRODUCTION_OPERATIONS,
  PRODUCTION_OPERATIONS_BY_ID,
  ProductionMaterial,
} from '@features/orders/data-access/production-area-dictionaries';
import { generateId } from '@shared/utils';

export interface ProductionAreaFormModalData {
  readonly area: ProductionArea;
}

type OperationForm = FormGroup<{
  id: FormControl<string | null>;
  operationId: FormControl<string | null>;
  materialId: FormControl<string | null>;
  quantity: FormControl<number | null>;
}>;

type MasterSectionForm = FormGroup<{
  master: FormControl<string | null>;
  operations: FormArray<OperationForm>;
}>;

type OperationValue = ReturnType<OperationForm['getRawValue']>;

@Component({
  selector: 'bf-production-area-form-modal',
  imports: [
    ReactiveFormsModule,
    NzButtonModule,
    NzCardModule,
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
  private readonly message = inject(NzMessageService);

  readonly area = this.data.area;
  readonly masters = PRODUCTION_MASTERS;
  readonly operationDefs = PRODUCTION_OPERATIONS;

  readonly saving = computed(() => this.store.updatingAreaId() === this.area.id);

  private readonly existingOperations = new Map(
    this.area.operations.map((operation) => [operation.id, operation]),
  );
  private readonly sectionSubscriptions = new Map<MasterSectionForm, Subscription[]>();

  readonly form = this.fb.group({
    masterSections: this.fb.array<MasterSectionForm>([]),
  });

  constructor() {
    if (this.area.operations.length === 0) {
      this.sections.push(this.createSection(null, []));
      return;
    }

    const grouped = new Map<string, ProductionOperation[]>();

    for (const operation of this.area.operations) {
      const operations = grouped.get(operation.master) ?? [];
      operations.push(operation);
      grouped.set(operation.master, operations);
    }

    for (const [master, operations] of grouped) {
      this.sections.push(this.createSection(master, operations));
    }
  }

  get sections(): FormArray<MasterSectionForm> {
    return this.form.controls.masterSections;
  }

  isSaving(): boolean {
    return this.saving();
  }

  operations(section: MasterSectionForm): FormArray<OperationForm> {
    return section.controls.operations;
  }

  materialsFor(row: OperationForm): readonly ProductionMaterial[] {
    const operationId = row.controls.operationId.value;

    return operationId ? (PRODUCTION_OPERATIONS_BY_ID.get(operationId)?.materials ?? []) : [];
  }

  materialUnit(row: OperationForm): string {
    const materialId = row.controls.materialId.value;

    return materialId ? (PRODUCTION_MATERIALS_BY_ID.get(materialId)?.unit ?? '—') : '—';
  }

  addSection(): void {
    if (this.saving()) {
      return;
    }

    this.sections.push(this.createSection(null, []));
    this.form.markAsDirty();
  }

  addOperation(section: MasterSectionForm): void {
    if (this.saving() || !section.controls.master.value) {
      return;
    }

    section.controls.operations.push(this.createOperation());
    this.watchOperation(section);
    this.form.markAsDirty();
  }

  removeOperation(section: MasterSectionForm, index: number): void {
    if (this.saving()) {
      return;
    }

    const operations = section.controls.operations;

    if (operations.length <= 1) {
      operations.at(0).reset({
        id: null,
        operationId: null,
        materialId: null,
        quantity: null,
      });
      this.form.markAsDirty();
      return;
    }

    operations.removeAt(index);
    this.form.markAsDirty();
  }

  confirmRemoveSection(section: MasterSectionForm): void {
    if (this.saving() || this.sections.length <= 1) {
      return;
    }

    const master = section.controls.master.value;

    if (!master) {
      this.removeSection(section);
      return;
    }

    this.modal.confirm({
      nzTitle: 'Удалить мастера?',
      nzContent: `Удалить мастера ${master} и его операции?`,
      nzOkText: 'Удалить',
      nzOkDanger: true,
      nzCancelText: 'Отмена',
      nzOnOk: () => this.removeSection(section),
    });
  }

  async save(): Promise<void> {
    if (this.saving()) {
      return;
    }

    for (const section of this.sections.controls) {
      if (section.controls.master.value && section.controls.operations.length === 0) {
        section.controls.operations.push(this.createOperation());
        this.watchOperation(section);
      }
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity();

      for (const section of this.sections.controls) {
        section.updateValueAndValidity();

        for (const row of section.controls.operations.controls) {
          row.updateValueAndValidity();
          Object.values(row.controls).forEach((control) => control.updateValueAndValidity());
        }
      }

      this.message.error('Проверьте заполнение формы');
      return;
    }

    const operations: ProductionOperation[] = [];

    for (const section of this.sections.controls) {
      const master = section.controls.master.value;

      if (!master) {
        continue;
      }

      for (const row of section.controls.operations.controls) {
        const operation = this.toOperation(row.getRawValue(), master);

        if (!operation) {
          this.message.error('Проверьте заполнение формы');
          return;
        }

        operations.push(operation);
      }
    }

    if (operations.length === 0) {
      this.message.error('Добавьте хотя бы одну операцию');
      return;
    }

    const saved = await this.store.updateArea(this.area.id, operations);

    if (saved) {
      this.modalRef.close();
    }
  }

  cancel(): void {
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

  private createSection(
    master: string | null,
    operations: readonly ProductionOperation[],
  ): MasterSectionForm {
    const section = this.fb.group({
      master: this.fb.control<string | null>(master, Validators.required),
      operations: this.fb.array<OperationForm>([]),
    });

    this.sectionSubscriptions.set(section, []);
    this.watchMaster(section);

    for (const operation of operations) {
      section.controls.operations.push(this.createOperation(operation));
      this.watchOperation(section);
    }

    if (master && operations.length === 0) {
      section.controls.operations.push(this.createOperation());
      this.watchOperation(section);
    }

    return section;
  }

  private createOperation(operation?: ProductionOperation): OperationForm {
    const definition = operation
      ? PRODUCTION_OPERATIONS.find((item) => item.name === operation.operation)
      : undefined;

    const material = definition
      ? definition.materials.find((item) => item.name === operation?.material)
      : undefined;

    return this.fb.group({
      id: this.fb.control<string | null>(operation?.id ?? null),
      operationId: this.fb.control<string | null>(definition?.id ?? null, Validators.required),
      materialId: this.fb.control<string | null>(material?.id ?? null),
      quantity: this.fb.control<number | null>(operation?.quantity ?? null, [
        Validators.required,
        Validators.min(0.01),
      ]),
    });
  }

  private watchMaster(section: MasterSectionForm): void {
    const subscription = section.controls.master.valueChanges.subscribe((master) => {
      if (master && section.controls.operations.length === 0) {
        this.addOperation(section);
      }
    });

    this.sectionSubscriptions.get(section)?.push(subscription);
  }

  private watchOperation(section: MasterSectionForm): void {
    const row = section.controls.operations.at(section.controls.operations.length - 1);
    const subscription = row.controls.operationId.valueChanges.subscribe(() => {
      row.controls.materialId.setValue(null, { emitEvent: false });
    });

    this.sectionSubscriptions.get(section)?.push(subscription);
  }

  private removeSection(section: MasterSectionForm): void {
    const index = this.sections.controls.indexOf(section);

    if (index === -1) {
      return;
    }

    for (const subscription of this.sectionSubscriptions.get(section) ?? []) {
      subscription.unsubscribe();
    }

    this.sectionSubscriptions.delete(section);
    this.sections.removeAt(index);
    this.form.markAsDirty();
  }

  private toOperation(row: OperationValue, master: string): ProductionOperation | null {
    const definition = row.operationId
      ? PRODUCTION_OPERATIONS_BY_ID.get(row.operationId)
      : undefined;
    const material = definition
      ? definition.materials.find((item) => item.id === row.materialId)
      : undefined;
    const quantity = row.quantity;

    if (!definition || quantity === null || quantity <= 0) {
      return null;
    }

    const existing = row.id ? this.existingOperations.get(row.id) : undefined;

    return {
      id: row.id ?? generateId('op'),
      master,
      startDate: existing?.startDate ?? null,
      endDate: existing?.endDate ?? null,
      operation: definition.name,
      material: material?.name ?? '',
      unit: material?.unit ?? null,
      quantity,
    };
  }
}
