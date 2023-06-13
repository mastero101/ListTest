import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { PartsComponent } from './parts/parts.component';
import { BuildsComponent } from './builds/builds.component';
import { EditpartsComponent } from './editparts/editparts.component';

const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'parts', component: PartsComponent },
  { path: 'builds', component: BuildsComponent },
  { path: 'edit', component: EditpartsComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
