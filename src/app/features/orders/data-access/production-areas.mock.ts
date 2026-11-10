import {
  ProductionArea,
  ProductionAreaType,
  ProductionOperation,
  ProductionUnit,
} from '@features/orders/models';

interface OperationTemplate {
  master: string;
  operation: string;
  material: string;
  unit: ProductionUnit;
  quantity: number;
  startOffset: number | null;
  endOffset: number | null;
}

const BASE_DATE = Date.UTC(2025, 1, 3, 9);

const OPERATION_TEMPLATES: Record<ProductionAreaType, readonly OperationTemplate[]> = {
  big_saw: [
    {
      master: 'Иванов Иван Иванович',
      operation: 'Распил',
      material: 'ЛДСП 16мм',
      unit: 'м²',
      quantity: 12,
      startOffset: 0,
      endOffset: 1,
    },
    {
      master: 'Петрова Анна Сергеевна',
      operation: 'Распил',
      material: 'МДФ 10мм',
      unit: 'м²',
      quantity: 8,
      startOffset: 1,
      endOffset: null,
    },
    {
      master: 'Сидоров Максим Олегович',
      operation: 'Сверление',
      material: 'ЛДСП 16мм',
      unit: 'шт',
      quantity: 24,
      startOffset: null,
      endOffset: null,
    },
  ],
  small_saw: [
    {
      master: 'Кузнецова Мария Андреевна',
      operation: 'Распил',
      material: 'ЛДСП 16мм',
      unit: 'м²',
      quantity: 6,
      startOffset: 2,
      endOffset: 3,
    },
    {
      master: 'Соколов Дмитрий Павлович',
      operation: 'Распил',
      material: 'МДФ 10мм',
      unit: 'м²',
      quantity: 4,
      startOffset: null,
      endOffset: 4,
    },
  ],
  gluing: [
    {
      master: 'Петрова Анна Сергеевна',
      operation: 'Склейка щита',
      material: 'ЛДСП 16мм',
      unit: 'м²',
      quantity: 9,
      startOffset: 3,
      endOffset: 4,
    },
    {
      master: 'Иванов Иван Иванович',
      operation: 'Склейка щита',
      material: 'МДФ 10мм',
      unit: 'м²',
      quantity: 5,
      startOffset: 4,
      endOffset: null,
    },
    {
      master: 'Соколов Дмитрий Павлович',
      operation: 'Склейка щита',
      material: 'ЛДСП 16мм',
      unit: 'м²',
      quantity: 3,
      startOffset: null,
      endOffset: null,
    },
  ],
  edge_banding: [
    {
      master: 'Сидоров Максим Олегович',
      operation: 'Кромление',
      material: 'Кромка ПВХ 2мм',
      unit: 'м',
      quantity: 36,
      startOffset: 5,
      endOffset: 6,
    },
    {
      master: 'Кузнецова Мария Андреевна',
      operation: 'Кромление',
      material: 'Кромка ПВХ 2мм',
      unit: 'м',
      quantity: 18,
      startOffset: 6,
      endOffset: null,
    },
  ],
  glass: [
    {
      master: 'Соколов Дмитрий Павлович',
      operation: 'Резка стекла',
      material: 'Стекло 4мм',
      unit: 'м²',
      quantity: 3,
      startOffset: 1,
      endOffset: 2,
    },
    {
      master: 'Иванов Иван Иванович',
      operation: 'Резка стекла',
      material: 'Стекло 4мм',
      unit: 'м²',
      quantity: 2,
      startOffset: 2,
      endOffset: 3,
    },
    {
      master: 'Петрова Анна Сергеевна',
      operation: 'Сверление',
      material: 'Стекло 4мм',
      unit: 'м²',
      quantity: 6,
      startOffset: null,
      endOffset: null,
    },
  ],
};

const SCENARIOS: readonly (readonly [ProductionAreaType, number])[][] = [
  [],
  [['big_saw', 3]],
  [
    ['big_saw', 3],
    ['gluing', 1],
    ['glass', 2],
  ],
  [
    ['big_saw', 2],
    ['small_saw', 0],
    ['gluing', 3],
    ['edge_banding', 1],
    ['glass', 0],
  ],
];

function hashOrderId(orderId: string): number {
  let hash = 0;

  for (const char of orderId) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return hash;
}

function dayAt(offset: number): string {
  return new Date(BASE_DATE + offset * 24 * 60 * 60 * 1000).toISOString();
}

function createOperations(
  orderId: string,
  type: ProductionAreaType,
  count: number,
): ProductionOperation[] {
  return OPERATION_TEMPLATES[type].slice(0, count).map((template, index) => ({
    id: `op-${orderId}-${type}-${index}`,
    master: template.master,
    startDate: template.startOffset === null ? null : dayAt(template.startOffset),
    endDate: template.endOffset === null ? null : dayAt(template.endOffset),
    operation: template.operation,
    material: template.material,
    unit: template.unit,
    quantity: template.quantity,
  }));
}

export function getMockAreas(orderId: string): ProductionArea[] {
  const scenario = SCENARIOS[hashOrderId(orderId) % SCENARIOS.length] ?? [];

  return scenario.map(([type, operationCount]) => ({
    id: `area-${type}-${orderId}`,
    type,
    operations: createOperations(orderId, type, operationCount),
  }));
}
