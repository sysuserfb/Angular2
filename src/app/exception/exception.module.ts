import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExceptionComponent } from './exception.component'
import { RouterModule,Routes }   from '@angular/router';
import { NgZorroAntdModule, NzFormModule } from 'ng-zorro-antd';

const routes: Routes = [
  {
    path: '',
    component: ExceptionComponent
  }
]

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    NgZorroAntdModule,
    NzFormModule
  ],
  declarations: [ExceptionComponent],
  exports: [RouterModule]

})
export class ExceptionModule { }
