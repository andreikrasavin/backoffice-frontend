import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzSiderComponent } from 'ng-zorro-antd/layout';
import { NzMenuDirective, NzMenuItemComponent } from 'ng-zorro-antd/menu';

@Component({
  selector: 'bf-sidebar',
  imports: [NzSiderComponent, NzMenuDirective, NzMenuItemComponent, RouterLink],
  template: `
    <nz-sider class="shell-sider" nzTheme="dark">
      <ul nz-menu nzMode="inline" nzTheme="dark">
        <li nz-menu-item routerLink="/dashboard">Дашборд</li>
        <li nz-menu-item routerLink="/orders">Заказы</li>
        <li nz-menu-item routerLink="/customers">Клиенты</li>
        <li nz-menu-item routerLink="/products">Продукты</li>
        <li nz-menu-item routerLink="/production">Производство</li>
      </ul>
    </nz-sider>
  `,
})
export class SidebarComponent {}
