import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';  
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/delay';
@Injectable()
export class AuthService {
  constructor(
  ){}
  private flag = false;
  private redirectUrl: string='';

  // public exceptionMsg:string = '';
  // public getExceptionMsg() {
  //   return this.exceptionMsg;
  // }
  // public setExceptionMsg(msg) {
  //     this.exceptionMsg = msg;
  // }
  
  private directory: Subject<any> = new Subject<any>();
  //返回directory的一个可观察对象，用于home.component观察并改变面包屑
  directory$ = this.directory.asObservable();
  
  //用于给home.component查询当前所有路由的可点击状态
  private routerLinkState:Object = {
    versions: true,
    data: false,
    maintaince: false,
    members: true,
    apps: true
  };

  /**
   * 
   * @param attr 需要从storage中获取的属性名，例如appId,userId
   */
  public get(attr:string) {
      let storage = window.localStorage;
      let res = "";
      switch (attr) {
        case 'appId':
            res = storage.appId;
            break;
        case 'userId':
            res = storage.userId;
            break;
        case 'token':
            res = storage.token;
            break;
        case 'apps':
            res = storage.apps;
            break;
        case 'username':
            res = storage.username;
            break;
        case 'appName':
            res = storage.appName;
            break;
        case 'roleId':
            res = storage.roleId;
            break;
        default:
      }
    //如果storage中不存在这些值，就清空storage并跳转到登录页
      if(res) {
          return res;
      }else {
        window.location.href="#/login";
        localStorage.clear();
        return null;
      }
  }

  /**
   * 
   * @param url 设置重定向url
   */
  public setRedirectUrl(url) {
    this.redirectUrl = url;
  }
  public getRedirectUrl() {
    return this.redirectUrl;
  }

  //用于给app.component观察，改变导航栏登陆状态：显示和隐藏用户名
  public subject: Subject<boolean> = new Subject<boolean>();
  login$ = this.subject.asObservable();

  /**
   * 
   * @param url 切换目标url，改变home.component面包屑
   */
  public changDirectory(url) {
    this.directory.next(url);
  }
  /**
   * 检查是否已经登陆
   */
  public checkLogin():boolean {
    if(this.get("userId")){
      return true;
    }
    return false;
  }
  /**
   * 
   * @param flag 控制user.component是否显示用户名
   */
  public setFlag(flag:boolean) {
    this.flag = flag;
    //通知app.component改变
    this.subject.next(flag);
  }
  /**
   * 退出登陆，跳转到登录页
   */
  public logout(): void {
    this.setFlag(false);
    window.location.href="#/login";
  }

}