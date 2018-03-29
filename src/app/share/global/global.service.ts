import { Injectable } from '@angular/core';
import { Http, Headers, Request, Response, 
         RequestOptions, RequestMethod, URLSearchParams
       } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { Subject } from 'rxjs/Subject';
import { AuthService } from '../../auth/auth.service'
@Injectable()
export class GlobalService {
  constructor(
    private http: Http,
    private authService: AuthService
  ) { }
  public apps = [];
/*-----------------------加载中动画---------------*/
  private loading: Subject<boolean> = new Subject<boolean>();
  //返回loading的一个可观察对象，用于home.component观察，显示和隐藏动画
  loading$ = this.loading.asObservable();
  /**
   * 显示加载中动画
   */
  public showSpin() {
      this.loading.next(true);
  }
  /**
   * 隐藏加载中动画
   */
  public hideSpin() {
      this.loading.next(false);
  }
/*--------------------------------------------------*/
  
  private logining: Subject<any> = new Subject<any>();
  //返回logining的一个可观察对象，用于app.component观察
  apps$ = this.logining.asObservable();

  /**
   * @param userId 用户id
   * @param token 用户token
   * 用于查找当前用户的产品列表
   */
  public goRender(userId, token):void {
      let vm = this;
      
      let completeLength = 0;
      let tempAppList = [];
      let storage = window.localStorage;
      let headers = new Headers();
      headers.append('Content-Type', 'application/x-www-form-urlencoded');
      headers.append('X-Access-Token', token);
      let obj = {userId: userId};
      
      let result = this.http.get('api/getAppsList', {params: obj, headers: headers}).map((res:Response)=>{
          let data = res.json();
          return data;
      }).subscribe(data=>{
        //setFlag通知app.component显示用户名
        this.authService.setFlag(true);
        this.apps = data.appList;
        /*--------------有产品----------------- */
        if (this.apps.length > 0){
            storage.setItem("appId", this.apps[0].appId);
            storage.setItem("appName", this.apps[0].appName);
            storage.setItem("roleId", this.apps[0].roleId.toString());
            storage.setItem("apps", JSON.stringify(this.apps));
            //通知app.component改变产品列表
            this.logining.next(this.apps);
            
        }else {
        /*--------------无产品------------------ */
            //通知app.component没有产品
            this.logining.next("noApp");
        }
      })
    }
}
