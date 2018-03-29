import { Injectable }       from '@angular/core';
import {
  CanActivate, Router, Route,
  ActivatedRouteSnapshot,
  RouterStateSnapshot, CanLoad
}                           from '@angular/router';
import { AuthService }      from './auth.service';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import { HomeService } from '../home/home.service'
@Injectable()
export class AuthGuard implements CanActivate, CanLoad {
  constructor(
    public authService: AuthService, 
    private router: Router,
    private homeService:HomeService
  ) {}
  public flag = false;

  /**
   * canActivate用于守卫已经加载之后的导航行为
   */
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let url: string = state.url;
    if(this.authService.checkLogin()) {
      if(url == '/maintaince' || url == '/data'){
        return false;
      }
      else{
        //通知改变面包屑
        this.authService.changDirectory(url);
        return true;
      }
    }
    return false;
  }
  /**
   * canLoad用于守卫是否可以加载模块
   */
  canLoad(route: Route): Observable<boolean>|Promise<boolean>|boolean {
    let url = `/${route.path}`;
    if(this.authService.checkLogin()) {
      if(url == '/maintaince' || url == '/data'){
        return false;
      }
      else if(url == '/profile'){
        return true;
      }
      else{
        /**
         * 需要根据storage中的roleId判断是否允许加载模块
         * 先获取home.service中的配置信息，查找对应roleId下的url权限
         * 如果有匹配就return true
         */
        if(window.localStorage.roleId){
          let menuList = this.homeService.getRoleConfig(window.localStorage.roleId);
          for (let menu of menuList) {
            if(menu.url == url){
              return true;
            }
          }
        }else{
          window.location.href="#/exception";
        }
        
        //通知改变面包屑
        this.authService.changDirectory(url);
        return true;
      }
    }



    // let url: string = state.url;
    // let storage = window.localStorage;
    // 
    // let canAct: boolean = true;
    // let roleId = storage.getItem("roleId");
    // switch (url) {
    //   case '/products':
    //     if (parseInt(roleId) > 1) {
    //       canAct = false;
    //     }
    //     break;
    //   case '/version':
    //     if (parseInt(roleId) > 3) {
    //       canAct = false;
    //     }
    //     break;
    //   case '/users':
    //     if (parseInt(roleId) > 2) {
    //       canAct = false;
    //     }
    //     break;
    //   default: canAct = canAct;
    // }

    // return canAct;
    return false;
  }

}