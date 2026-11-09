import { InjectionToken, Provider } from '@angular/core';
import { environment } from '@env/environment';

export interface AppConfig {
  production: boolean;
  apiUrl: string;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');

export function provideAppConfig(config: AppConfig = environment): Provider {
  return { provide: APP_CONFIG, useValue: config };
}
