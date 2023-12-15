import { Component, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent{
  opened = false;
  darkTheme = false;
  showToggleButton = true;

  constructor(private changeDetector: ChangeDetectorRef,) {}

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  toggleSidebar() {
    this.opened = !this.opened;
  }

  toggleTheme() {
    this.darkTheme = !this.darkTheme;
  }

}
