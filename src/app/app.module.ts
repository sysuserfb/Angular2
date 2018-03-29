import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { NgZorroAntdModule, NzFormModule } from 'ng-zorro-antd';
import { NzMessageService } from 'ng-zorro-antd';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { AuthService } from './auth/auth.service';
import { GlobalService } from './share/global/global.service';
import { CommonModule } from '@angular/common';
import { AuthGuard } from './auth/auth-guard.service';
import { HomeService } from './home/home.service'
/*引入enableProdMode以放弃检查html中的boolean值频繁变化*/
import {enableProdMode} from '@angular/core';
enableProdMode();
/*---------------------------------------------------*/
const appRoutes: Routes = [
  {
    path: 'login',
    loadChildren: './login/login.module#LoginModule'
  },
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'versions',
        pathMatch: 'full'
      },
      {
        path: 'versions',
        loadChildren: './versions/versions.module#VersionsModule',
        canLoad: [AuthGuard],
        canActivate: [AuthGuard],
      },
      {
        path: 'members',
        loadChildren: './members/members.module#MembersModule',
        canLoad: [AuthGuard],
        canActivate: [AuthGuard]
      },
      {
        path: 'apps',
        loadChildren: './apps/apps.module#AppsModule',
        canLoad: [AuthGuard],
        canActivate: [AuthGuard]
      },
      {
        path: 'profile',
        loadChildren: './profile/profile.module#ProfileModule',
        canLoad: [AuthGuard],
        canActivate: [AuthGuard]
      },
      {
        path: 'exception',
        loadChildren: './exception/exception.module#ExceptionModule',
        canActivate: [AuthGuard]
      }
    ]
  }
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    BrowserAnimationsModule,
    NgZorroAntdModule.forRoot(),
    RouterModule.forRoot(appRoutes, { useHash: true })
  ],
  exports: [
    RouterModule
  ],
  providers: [NzMessageService, AuthService, AuthGuard, GlobalService, HomeService],
  bootstrap: [AppComponent]
})
export class AppModule {}
