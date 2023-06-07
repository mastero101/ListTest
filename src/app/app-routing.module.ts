import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { PartsComponent } from './parts/parts.component';

const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'parts', component: PartsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
