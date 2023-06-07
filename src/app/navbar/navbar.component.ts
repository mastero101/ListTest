import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  opened = false;

  constructor() {

  }

  toggleSidebar() {
    this.opened = !this.opened;
  }

}
