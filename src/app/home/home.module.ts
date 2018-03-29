import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { RouterModule,Routes }   from '@angular/router';
import { NgZorroAntdModule, NzFormModule } from 'ng-zorro-antd';
import { HomeService } from './home.service'
const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  }
]

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    NgZorroAntdModule,
    NzFormModule
  ],
  declarations: [HomeComponent],
  exports: [RouterModule],
  providers: [HomeService]
})
export class HomeModule { }
