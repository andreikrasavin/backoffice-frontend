import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { ru_RU, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import ru from '@angular/common/locales/ru';
import { provideNzNativeDateAdapter } from 'ng-zorro-antd/core/time';
import { NzModalService } from 'ng-zorro-antd/modal';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import {
  AppstoreOutline,
  BellOutline,
  DashboardOutline,
  DeleteOutline,
  DownloadOutline,
  EditOutline,
  FilterFill,
  FilterOutline,
  LogoutOutline,
  MenuOutline,
  MoonOutline,
  PlusOutline,
  ReloadOutline,
  SearchOutline,
  SettingOutline,
  ShoppingCartOutline,
  SunOutline,
  UserOutline,
} from '@ant-design/icons-angular/icons';
import { provideAppConfig } from '@core/config';
import { provideAuth } from '@core/auth';
import { provideApi } from '@core/api';
import { authInterceptor } from '@core/http';
import { provideTheme } from '@core/theme';

registerLocaleData(ru);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideNzI18n(ru_RU),
    provideNzNativeDateAdapter(),
    NzModalService,
    provideNzIcons([
      AppstoreOutline,
      BellOutline,
      DashboardOutline,
      DeleteOutline,
      DownloadOutline,
      EditOutline,
      FilterFill,
      FilterOutline,
      LogoutOutline,
      MenuOutline,
      MoonOutline,
      PlusOutline,
      ReloadOutline,
      SearchOutline,
      SettingOutline,
      ShoppingCartOutline,
      SunOutline,
      UserOutline,
    ]),
    provideAppConfig(),
    provideAuth(),
    provideApi(),
    provideTheme(),
  ],
};
