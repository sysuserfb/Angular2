import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { GlobalService } from '../share/global/global.service'
import { AuthService } from '../auth/auth.service'
@Component({
  selector: 'app-exception',
  templateUrl: './exception.component.html',
  styleUrls: ['./exception.component.css']
})
export class ExceptionComponent implements OnInit {
  public msg:string = '';
  subscription: Subscription;
  constructor(
    private authService: AuthService
  ) {}

  ngOnInit() {
    //如果需要频繁显示的话就不能懒加载...然后换成监听的形式吧
    this.msg = '请联系管理员添加产品';
  }
  ngOnDestroy() {
  }

}
