import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  opened = false;
  darkTheme = false;

  constructor() {

  }

  toggleSidebar() {
    this.opened = !this.opened;
  }

  toggleTheme() {
    this.darkTheme = !this.darkTheme;
  }

}
