import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService }from '../share/http/http.service';
import { NzMessageService } from 'ng-zorro-antd';
import { AuthService }from '../auth/auth.service';
import { GlobalService } from '../share/global/global.service'
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']

})
export class LoginComponent implements OnInit {
  validateForm: FormGroup;
  public logging:any='登陆';
  public rebaseInfo:any={}

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private router: Router,
    private _message: NzMessageService,
    private authService: AuthService,
    private globalService: GlobalService
  ) {
  }

  ngOnInit() {
    this.validateForm = this.fb.group({
      userName: [ null, [ Validators.required ] ],
      password: [ null, [ Validators.required ] ]
    });
  }
  _submitForm() {
    
    let tmpUserName = this.getFormControl('userName').value,
        password = this.getFormControl('password').value;
    var reg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
    if(!reg.test(tmpUserName)){
      tmpUserName = tmpUserName + "@corp.21cn.com";
    }
    this.logging = '登陆中...';
    this.httpService.post('login', {email: tmpUserName, password: password})
    .subscribe((info)=>{
      this.rebaseInfo = info;
      console.log(info)
      if(this.rebaseInfo.result==0){
        //将登陆信息放进localStorage里面
        let storage = window.localStorage;
        //let userInfo = JSON.stringify(this.rebaseInfo.userInfo);
        storage.isNew = this.rebaseInfo.isNew;
        storage.token = this.rebaseInfo.token;
        storage.username = this.rebaseInfo.userInfo.username;
        if(this.rebaseInfo.userInfo.name){
          storage.name = this.rebaseInfo.userInfo.name;
        }
        storage.userId = this.rebaseInfo.userInfo.userId;
        this._message.create('success', '登陆成功');
        //this.logging = '登陆';
        if(this.rebaseInfo.isNew==false){
          //使用global service获取当前用户的产品列表
          this.globalService.goRender(this.rebaseInfo.userInfo.userId, this.rebaseInfo.token);
          //global service的一句this.authService.setFlag(true)
          //通知到app.component渲染导航栏
        }else{
          this.authService.setFlag(true); 
          //跳转到profile页面
          this.router.navigate(['/profile']);
        }
      }
      
    }, error=>{
      this.logging = "登陆";
      this._message.create('error', error);
    })
  }
  getFormControl(name) {
    return this.validateForm.controls[name];
  }

}

