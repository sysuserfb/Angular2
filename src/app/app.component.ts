import { Component, OnInit } from '@angular/core';
import { AuthService }from './auth/auth.service'
import { Subscription } from 'rxjs/Subscription';
import { Router } from '@angular/router'
import { GlobalService } from './share/global/global.service'

interface APP {
  appId:string,
  appName:string,
  roleId:Number
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'app';
  subscriptionLogin: Subscription;
  subscriptionApps: Subscription;
  //导航栏显示的名字
  public userName:string = '';
  //bool变量控制是否显示名字 只有登陆之后才会true
  public loginFlag:boolean = false;
  //下拉框显示的全部产品
  public apps:APP[];
  //当前app对象，用于显示当前app
  public curApp:APP;
  //bool变量控制是否显示产品框
  public ifApps:boolean = false;
  //bool变量控制是否显示产品下拉箭头
  public ifDropdown:boolean = false;
  constructor(
    private authService: AuthService,
    private globalService: GlobalService
  ){
    /*-----订阅authService的login$，改变loginFlag并显示用户名--------*/
    this.subscriptionLogin = this.authService.login$.subscribe(flag=>{
      //通知接收的flag控制是否显示用户名
      this.loginFlag = flag;
      let storage = window.localStorage;
      let name = '';
      if(storage.name) name = storage.name;
      else name = storage.username;
      this.userName = name;
    });
    /*-----订阅globalService的login$，改变产品列表 */
    this.subscriptionApps = this.globalService.apps$.subscribe(apps=>{
      //如果返回noApp，则说明用户没有产品
      if(apps==='noApp') {
        //不显示产品dropdown框
        this.ifApps = false;
        //跳转到异常页面
        window.location.href="#/exception";
        
      }else {
      /*--------------有产品----------*/
        this.ifApps = true;
        //默认当前app为返回的所有产品的第一个
        this.curApp = apps[0];
        if(apps.length <= 1) {
          //少于1个产品，不显示下拉的箭头
          this.ifDropdown = false;
        }else{
          this.ifDropdown = true;
          //调用deleteById去除下拉产品中与当前产品的重复项
          this.apps = this.deleteById(apps, apps[0].appId);

          /**
           * 需要根据apps[0].roleId来调用this.authService.setRouterLinkState
           * 改变路由状态
           */

        }
        window.location.href="#/versions";
      }
    });
  }
  ngOnInit() {
    this.loginFlag = false;
    let storage = window.localStorage;
    /*-----------------用户已经登陆------------------ */
    if (storage.userId) {
      
      let name = '';
      if(storage.name) name = storage.name;
      else name = storage.username;
      this.userName = name;
      //函数最终通知到自己的订阅服务改变导航栏状态
      this.authService.setFlag(true);
      /*---------------如果有产品------------- */
      if (storage.apps) {
          this.ifApps = true;
          //当前产品为localStroage中的信息
          this.curApp = {
            appId: storage.appId, 
            appName: storage.appName,
            roleId: storage.roleId
          };
          let apps = JSON.parse(storage.apps);
          if(apps.length <= 1) {
            this.ifDropdown = false;
          }else{
            this.ifDropdown = true;
            //同样需要去掉重复项
            this.apps = this.deleteById(apps, storage.appId);

            /**
           * 需要根据apps[0].roleId来调用this.authService.setRouterLinkState
           * 改变路由状态
           */

          }
          
      }else {
      /*--------------如果没产品----------------*/  
          this.ifApps = false;
          //跳转到异常页面
          window.location.href="#/exception";
      }
    }else {
    /*-----------------用户没有登陆------------------ */  
      window.location.href="#/login";
    }

  }
  /**
   * 退出登陆，清空storage
   */
  logout() {
    localStorage.clear();
    this.authService.logout();
  }
  /**
   * 更换当前产品
   * @param id 目标产品的id
   * @param name 目标产品的名字
   * 用于改变当前产品
   */
  setApp(id, name) {
    let roleId:Number;
    for (let app of this.apps) {
        if (app.appId === id) {
            //this.currentApp = app;
            roleId = app.roleId;
        }
    }
    let storage = window.localStorage;
    storage.setItem("appId", id);
    storage.setItem("appName", name);
    storage.setItem("roleId", roleId.toString());
    //重新刷新页面
    window.location.reload();
  }
  /**
   * 
   * @param apps 原app列表
   * @param id 当前产品的id
   */
  deleteById(apps, id):any {
    let tmpApps = apps;
    for(let i = 0; i < apps.length; i++){
      if(tmpApps[i].appId===id){
        tmpApps.splice(i, 1);
        break;
      }
    }
    return tmpApps;
  }
  ngOnDestroy() {
      this.subscriptionLogin.unsubscribe();
  }
}
