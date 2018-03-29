import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FileUploadModule } from 'ng2-file-upload';
import { VersionsComponent } from './versions.component';
import { PackageDetailComponent } from './detail/detail.component';

const routes: Routes = [
  {
    path: '',
    component: VersionsComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    NgZorroAntdModule.forRoot(),
    FileUploadModule
  ],
  declarations: [VersionsComponent, PackageDetailComponent],
  entryComponents: [PackageDetailComponent],
  exports: [RouterModule]
})

export class VersionsModule {}
