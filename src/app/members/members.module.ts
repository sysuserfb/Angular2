import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MembersComponent } from './members.component';
import { RouterModule,Routes }   from '@angular/router';
import { FormsModule , ReactiveFormsModule}   from '@angular/forms';
import { NgZorroAntdModule, NzFormModule } from 'ng-zorro-antd';
import { HttpService } from '../share/http/http.service';

const routes: Routes = [
  {
    path: '',
    component: MembersComponent,
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
  declarations: [MembersComponent],
  exports: [RouterModule],
  providers: [HttpService]
})
export class MembersModule { }
