// TODO: replace with API dictionaries
import { ProductionUnit } from '@features/orders/models';

export interface ProductionMaterial {
  readonly id: string;
  readonly name: string;
  readonly unit: ProductionUnit;
}

export const PRODUCTION_MASTERS: readonly string[] = [
  'Иванов Иван Иванович',
  'Петрова Анна Сергеевна',
  'Сидоров Пётр Алексеевич',
  'Кузнецова Мария Андреевна',
  'Соколов Дмитрий Павлович',
  'Морозов Алексей Викторович',
];

export const PRODUCTION_OPERATIONS: readonly string[] = [
  'Распил',
  'Склейка щита',
  'Кромление',
  'Резка стекла',
  'Сверление',
  'Шлифовка',
  'Сборка',
  'Упаковка',
];

export const PRODUCTION_MATERIALS: readonly ProductionMaterial[] = [
  { id: 'ldsp-16', name: 'ЛДСП 16мм', unit: 'м²' },
  { id: 'mdf-10', name: 'МДФ 10мм', unit: 'м²' },
  { id: 'glass-4', name: 'Стекло 4мм', unit: 'м²' },
  { id: 'edge-pvc-2', name: 'Кромка ПВХ 2мм', unit: 'м' },
  { id: 'hinge', name: 'Фурнитура: петля', unit: 'шт' },
  { id: 'handle', name: 'Фурнитура: ручка', unit: 'шт' },
  { id: 'glue', name: 'Клей', unit: 'кг' },
  { id: 'screw', name: 'Саморез 4×30', unit: 'шт' },
  { id: 'varnish', name: 'Лак', unit: 'кг' },
  { id: 'fabric', name: 'Ткань обивки', unit: 'м' },
];

export const PRODUCTION_MATERIALS_BY_ID: ReadonlyMap<string, ProductionMaterial> = new Map(
  PRODUCTION_MATERIALS.map((material) => [material.id, material]),
);

export const PRODUCTION_MATERIALS_BY_NAME: ReadonlyMap<string, ProductionMaterial> = new Map(
  PRODUCTION_MATERIALS.map((material) => [material.name, material]),
);
