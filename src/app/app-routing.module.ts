import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PartsComponent } from './parts/parts.component';
import { BuildsComponent } from './builds/builds.component';
import { EditpartsComponent } from './editparts/editparts.component';
import { ChatgptComponent } from './chatgpt/chatgpt.component';
import { DetalleConfiguracionComponent } from './detalle-configuracion/detalle-configuracion.component';
import { RegisterUserComponent } from './register-user/register-user.component';
import { LoginComponent } from './login/login.component';
import { ProfileUserComponent } from './profile-user/profile-user.component';

import { JwtAuthGuard } from './jwt-auth.guard';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'builds', component: BuildsComponent },
  { path: 'builds/:id', component: DetalleConfiguracionComponent },
  { path: 'login', component: LoginComponent},
  { path: 'parts', 
    component: PartsComponent,
    canActivate: [JwtAuthGuard]
  },
  { path: 'edit', 
    component: EditpartsComponent,
    canActivate: [JwtAuthGuard]
  },
  { path: 'chatgpt', 
    component: ChatgptComponent,
    canActivate: [JwtAuthGuard]
  },
  { path: 'register-user', 
    component: RegisterUserComponent, 
    canActivate: [JwtAuthGuard]
  },
  { path: 'profile', 
    component: ProfileUserComponent,
    canActivate: [JwtAuthGuard]
  },
  { path: 'home', 
    component: HomeComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
