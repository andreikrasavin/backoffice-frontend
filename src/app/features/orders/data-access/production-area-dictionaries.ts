// TODO: replace with API dictionaries
export type MaterialUnit = 'шт' | 'м²' | 'м' | 'кг';

export interface ProductionMaterial {
  readonly id: string;
  readonly name: string;
  readonly unit: MaterialUnit;
}

export interface ProductionOperationDef {
  readonly id: string;
  readonly name: string;
  readonly materials: readonly ProductionMaterial[];
}

export const PRODUCTION_MASTERS: readonly string[] = [
  'Иванов Иван Иванович',
  'Петрова Анна Сергеевна',
  'Сидоров Пётр Алексеевич',
  'Кузнецова Мария Андреевна',
  'Соколов Дмитрий Павлович',
  'Морозов Алексей Викторович',
];

const LDSP: ProductionMaterial = { id: 'ldsp-16', name: 'ЛДСП 16мм', unit: 'м²' };
const MDF: ProductionMaterial = { id: 'mdf-10', name: 'МДФ 10мм', unit: 'м²' };
const GLASS: ProductionMaterial = { id: 'glass-4', name: 'Стекло 4мм', unit: 'м²' };
const EDGE: ProductionMaterial = { id: 'edge-pvc-2', name: 'Кромка ПВХ 2мм', unit: 'м' };
const HINGE: ProductionMaterial = { id: 'hinge', name: 'Фурнитура: петля', unit: 'шт' };
const HANDLE: ProductionMaterial = { id: 'handle', name: 'Фурнитура: ручка', unit: 'шт' };
const SCREW: ProductionMaterial = { id: 'screw', name: 'Саморез 4×30', unit: 'шт' };
const GLUE: ProductionMaterial = { id: 'glue', name: 'Клей', unit: 'кг' };
const VARNISH: ProductionMaterial = { id: 'varnish', name: 'Лак', unit: 'кг' };

export const PRODUCTION_OPERATIONS: readonly ProductionOperationDef[] = [
  { id: 'cutting', name: 'Распил', materials: [LDSP, MDF] },
  { id: 'gluing', name: 'Склейка щита', materials: [GLUE, LDSP, MDF] },
  { id: 'edging', name: 'Кромление', materials: [EDGE, LDSP, MDF] },
  { id: 'glass', name: 'Резка стекла', materials: [GLASS] },
  { id: 'drilling', name: 'Сверление', materials: [HINGE, HANDLE, SCREW] },
  { id: 'grinding', name: 'Шлифовка', materials: [LDSP, MDF, VARNISH] },
];

export const PRODUCTION_OPERATIONS_BY_ID: ReadonlyMap<string, ProductionOperationDef> = new Map(
  PRODUCTION_OPERATIONS.map((operation) => [operation.id, operation]),
);

export const PRODUCTION_MATERIALS_BY_ID: ReadonlyMap<string, ProductionMaterial> = new Map(
  PRODUCTION_OPERATIONS.flatMap((operation) =>
    operation.materials.map((material) => [material.id, material] as const),
  ),
);
