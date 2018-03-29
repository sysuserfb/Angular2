import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './profile.component';
import { RouterModule,Routes }   from '@angular/router';
import { NgZorroAntdModule, NzFormModule } from 'ng-zorro-antd';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpService }from '../share/http/http.service';

const routes: Routes = [
  {
    path: '',
    component: ProfileComponent,
  }
]

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    NgZorroAntdModule,
    NzFormModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [ProfileComponent],
  exports: [RouterModule],
  providers: [HttpService]
})
export class ProfileModule { }