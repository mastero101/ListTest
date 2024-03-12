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

const routes: Routes = [
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
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
