import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login.component'
import { RouterModule,Routes }   from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgZorroAntdModule, NzFormModule } from 'ng-zorro-antd';
import {HttpService}from '../share/http/http.service'
import {AuthService}from '../auth/auth.service'

const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  }
]

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgZorroAntdModule,
    NzFormModule
  ],
  declarations: [LoginComponent],
  exports: [RouterModule],
  providers: [HttpService]
})
export class LoginModule { }
