export type ProductionAreaType = 'big_saw' | 'small_saw' | 'gluing' | 'edge_banding' | 'glass';

export const PRODUCTION_AREA_ORDER: readonly ProductionAreaType[] = [
  'big_saw',
  'small_saw',
  'gluing',
  'edge_banding',
  'glass',
] as const;

export const PRODUCTION_AREA_LABELS: Record<ProductionAreaType, string> = {
  big_saw: 'Большая пила',
  small_saw: 'Малая пила',
  gluing: 'Склейка',
  edge_banding: 'Кромление',
  glass: 'Стекло',
};

export type ProductionUnit = 'шт' | 'м²' | 'м' | 'кг';

export interface ProductionOperation {
  id: string;
  master: string;
  startDate: string | null;
  endDate: string | null;
  operation: string;
  material: string;
  unit: ProductionUnit | null;
  quantity: number;
}

export interface ProductionArea {
  id: string;
  type: ProductionAreaType;
  operations: ProductionOperation[];
}
