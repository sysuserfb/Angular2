import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { AuthService } from '../auth/auth.service'
import { GlobalService } from '../share/global/global.service' 
import { HomeService } from './home.service'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  //面包屑显示的模块名称
  private directory:string = "";
  //订阅auth服务的路径变化
  subscription_directory: Subscription;
  //订阅global服务改变_loading控制显示加载中动画
  Subscription_isLoading: Subscription;
  //控制是否显示加载中动画
  private _loading:boolean = false;
  //用于html渲染路由导航列表
  private routerLinks = [];
  constructor(
    private authService: AuthService,
    private globalService: GlobalService,
    private homeService: HomeService
  ) {
    //监听路由url来改变面包屑
    this.subscription_directory = this.authService.directory$.subscribe(link=>{
      switch(link){
        case '/':
          this.directory = '版本管理';
          window.location.href="#/versions";
          break;
        case '/versions':
          this.directory = '版本管理';
          break;
        case '/members':
          this.directory = '成员管理';
          break;
        case '/apps':
          this.directory = '产品管理';
          break;
        case '/profile':
          this.directory = '个人设置';
          break;
        case '/exception':
          this.directory = '联系管理员';
          break;
        default: 
      }
    });
    //监听通知是否显示加载中动画
    this.Subscription_isLoading = this.globalService.loading$.subscribe(_isLoading=>{
      this._loading = _isLoading;
    })
  }

  ngOnInit() {
    if(window.localStorage.roleId) {
      let roleId = window.localStorage.roleId;
      this.routerLinks = this.homeService.getRoleConfig(roleId);
    }
    let link = window.location.hash;
    switch(link) {
      case '#/versions':
        this.directory = '版本管理';
        break;
      case '#/members':
        this.directory = '成员管理';
        break;
      case '#/apps':
        this.directory = '产品管理';
        break;
      case '#/profile':
        this.directory = '个人设置';
        break;
      case '#/':
        this.directory = '版本管理';
        window.location.href="#/versions";
        break;
      case '#/exception':
        this.directory = '联系管理员';
        break;
      default:
    }
  }
  ngOnDestroy() {
      this.subscription_directory.unsubscribe();
      this.Subscription_isLoading.unsubscribe();
  }

}
