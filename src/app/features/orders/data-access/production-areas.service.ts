import { Injectable } from '@angular/core';
import { ProductionArea, ProductionAreaType, ProductionOperation } from '@features/orders/models';
import { delay, generateId, getRandomDelay } from '@shared/utils';
import { getMockAreas } from './production-areas.mock';

@Injectable()
export class ProductionAreasService {
  private readonly areasByOrder = new Map<string, ProductionArea[]>();

  async getAreasByOrderId(orderId: string): Promise<ProductionArea[]> {
    // TODO: replace with HttpClient
    // TODO: remove artificial delay when real API is connected
    await delay(getRandomDelay());

    return this.getOrCreate(orderId).map((area) => this.clone(area));
  }

  async addArea(orderId: string, type: ProductionAreaType): Promise<ProductionArea> {
    // TODO: replace with HttpClient
    await delay(getRandomDelay());

    const area: ProductionArea = {
      id: generateId('area'),
      type,
      operations: [],
    };

    this.getOrCreate(orderId).push(area);

    return this.clone(area);
  }

  async removeArea(orderId: string, areaId: string): Promise<void> {
    // TODO: replace with HttpClient
    await delay(getRandomDelay());

    const areas = this.getOrCreate(orderId);
    const index = areas.findIndex((area) => area.id === areaId);

    if (index === -1) {
      throw new Error(`Production area ${areaId} not found`);
    }

    areas.splice(index, 1);
  }

  async clearArea(orderId: string, areaId: string): Promise<void> {
    // TODO: replace with HttpClient
    await delay(getRandomDelay());

    const area = this.getOrCreate(orderId).find((item) => item.id === areaId);

    if (!area) {
      throw new Error(`Production area ${areaId} not found`);
    }

    area.operations = [];
  }

  async updateArea(
    orderId: string,
    areaId: string,
    patch: Partial<Pick<ProductionArea, 'type'>>,
  ): Promise<ProductionArea> {
    // TODO: replace with HttpClient
    await delay(getRandomDelay());

    const area = this.getOrCreate(orderId).find((item) => item.id === areaId);

    if (!area) {
      throw new Error(`Production area ${areaId} not found`);
    }

    Object.assign(area, patch);

    return this.clone(area);
  }

  private getOrCreate(orderId: string): ProductionArea[] {
    const existing = this.areasByOrder.get(orderId);

    if (existing) {
      return existing;
    }

    const seeded = getMockAreas(orderId);
    this.areasByOrder.set(orderId, seeded);

    return seeded;
  }

  private clone(area: ProductionArea): ProductionArea {
    return {
      ...area,
      operations: area.operations.map((operation): ProductionOperation => ({ ...operation })),
    };
  }
}
