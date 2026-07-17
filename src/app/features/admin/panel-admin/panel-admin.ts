import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PanelHeader } from '../../../components/layouts/panel-header/panel-header';
import { PanelFooter } from '../../../components/layouts/panel-footer/panel-footer';
import { AdminSidebar } from '../admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-panel-admin',
  imports: [RouterOutlet, PanelHeader, PanelFooter, AdminSidebar],
  templateUrl: './panel-admin.html',
  styleUrl: './panel-admin.scss',
})
export class PanelAdmin {
  protected readonly menuAbierto = signal(false);

  alternarMenu(): void {
    this.menuAbierto.update((abierto) => !abierto);
  }
}
