import { Injectable } from '@angular/core';
import { ProductionArea } from '@features/orders/models';
import { delay, getRandomDelay } from '@shared/utils';

@Injectable()
export class ProductionAreasService {
  async getAreasByOrderId(orderId: string): Promise<ProductionArea[]> {
    // TODO: replace with HttpClient
    // TODO: remove artificial delay when real API is connected
    await delay(getRandomDelay());
    void orderId;

    return [];
  }
}
