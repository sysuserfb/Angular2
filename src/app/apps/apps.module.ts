import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppsComponent } from './apps.component';
import { RouterModule,Routes }   from '@angular/router';
import { FormsModule , ReactiveFormsModule}   from '@angular/forms';
import { NgZorroAntdModule, NzFormModule } from 'ng-zorro-antd';
import { HttpService } from '../share/http/http.service';

const routes: Routes = [
  {
    path: '',
    component: AppsComponent,
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
  declarations: [AppsComponent],
  exports: [RouterModule],
  providers: [HttpService]
})
export class AppsModule { }