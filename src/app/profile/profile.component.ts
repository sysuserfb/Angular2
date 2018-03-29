import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { Router } from '@angular/router';
import { HttpService } from '../share/http/http.service';
import { GlobalService } from '../share/global/global.service'
import { AuthService } from '../auth/auth.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl
} from '@angular/forms';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  //表单
  informationForm: FormGroup;
  //一级部门列表
  private firstDepartments:any = [];
  //二级部门列表
  private secondDepartments:any = [];
  //用户头像url
  private avatarUrl:string = "url('../../assets/avatar/0.jpg')";
  private userId:string = "";
  //用于标记返回的一级部门id，然后查找对应的二级部门并渲染
  private tmpFirstDepartId:any;
  //用于第一次渲染一级部门时避免触发订阅
  private firstlyGetSecond:boolean=false;
  //username和emai是固定项，不放入form表单中
  private username:string = '';
  private email:string = '';
  
  //button的文字
  private saving:string='保存';
  public jobTypes:any = [
    {value: 1, label:'专业岗'}, 
    {value: 2, label:'管理岗'}
  ];
  public jobCategories:any = [
    {value: 1, label:'研发'},
    {value: 2, label:'UI'},
    {value: 3, label:'交互设计'},
    {value: 4, label:'前端'},
    {value: 5, label:'测试'},
    {value: 6, label:'其他'}
  ];
  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private _message: NzMessageService,
    private globalService: GlobalService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    let _that = this;
    //通过formBuilder生成表单 [初始值, [验证器]]
    this.informationForm = this.fb.group({
      cname: [ null, [ Validators.required ] ],
      employeeNO: [ null, [ Validators.required ] ],
      jobType: [ null, [ Validators.required ] ],
      jobCategory: [ null, [ Validators.required ] ],
      firstDepartment: [ null, [ Validators.required ] ],
      secondDepartment: [ null, [ Validators.required ] ],
      //需要另外判断邮箱格式 函数confirmationValidator
      account: [ null, [ Validators.required, this.confirmationValidator ] ],
      avatarId: [ null, [ Validators.required ] ]
    });
    //avatar选择框改变时触发订阅
    this.getFormControl('avatarId').valueChanges.subscribe(id=>{
      this.avatarUrl = "url('../../assets/avatar/" + id + ".jpg')";
    });
    //选择一级部门的时候触发订阅，查询并渲染二级部门列表
    this.getFormControl('firstDepartment').valueChanges.subscribe(fd=>{
      this.getFormControl('secondDepartment').setValue(null);
      //先判断是不是通过第一次渲染一级部门的时候触发的，不是才请求接口
      if(fd&&!this.firstlyGetSecond) {
        this.getSecondDepartsByID(fd);        
      }
      //改变为false
      if(this.firstlyGetSecond) this.firstlyGetSecond=!this.firstlyGetSecond;
    });
    //通过global service的get函数获取storage中的userId，用于查询个人信息
    this.userId = this.authService.get('userId')
    //显示加载中动画
    this.globalService.showSpin();
    this.httpService.get('getUserInfo', {userId: this.userId}).subscribe(data=>{
      //隐藏加载中动画
      this.globalService.hideSpin();
      if(data.userInfo.name){
        this.getFormControl('cname').setValue(data.userInfo.name);
      }
      this.username= data.userInfo.username;
      this.email = data.userInfo.email;
      if(data.userInfo.account){
        this.getFormControl('account').setValue(data.userInfo.account);  
      }
      
      if(data.userInfo.employeeNO) {
        this.getFormControl('employeeNO').setValue(data.userInfo.employeeNO);
      }
      this.getFormControl('jobCategory').setValue(data.userInfo.jobCategory ? data.userInfo.jobCategory : 1);
      this.getFormControl('jobType').setValue(data.userInfo.jobType ? data.userInfo.jobType : 1);
      this.getFormControl('avatarId').setValue(data.userInfo.avatarId ? data.userInfo.avatarId : 0);
      //如果有部门信息
      if (data.userInfo.department.length > 0){
        //标记一级部门id
        this.tmpFirstDepartId = data.userInfo.department[0].departmentId;
        this.getSecondDepartsByID(this.tmpFirstDepartId);
        //首次加载，设置firstlyGetSecond为true
        //否则一级部门值发生改变，触发订阅函数，又再次请求二级部门的接口
        this.firstlyGetSecond = true;
        this.getFormControl('firstDepartment').setValue(
          data.userInfo.department[0].departmentId
        );
        this.getFormControl('secondDepartment').setValue(
          data.userInfo.department[1].departmentId
        );
      }
      
    });
    /* -----获取一级部门列表--------- */
    this.httpService.get('getDepartmentsList').subscribe(data=>{
      this.firstDepartments = data.departmentList;
    });
  }
  /**
   * 获取formGroup表单属性对象
   * @param name 属性名
   */
  getFormControl(name) {
    return this.informationForm.controls[name];
  }
  /**
   * 获取二级部门
   * @param id 一级部门id
   */
  getSecondDepartsByID(id) {
    this.httpService.get('getDepartmentsList', {parentDepartmentId: id}).subscribe(data=>{
      this.secondDepartments = data.departmentList;
    });
  }
  _submitForm() {
    console.log(this.informationForm);
    this.saving = '保存中...';
    let updateUserInfoParams = {
      userId: this.userId,
      name: this.getFormControl('cname').value,
      account: this.getFormControl('account').value,
      employeeNO: this.getFormControl('employeeNO').value,
      jobCategory: this.getFormControl('jobCategory').value,
      jobType: this.getFormControl('jobType').value,
      departmentId: this.getFormControl('secondDepartment').value,
      avatarId: this.getFormControl('avatarId').value,
    };
    this.httpService.post('updateUserInfo', updateUserInfoParams).subscribe(data=>{
      this.saving = '保存';
      this._message.create('success', data.msg);
      //将最新的name渲染到导航栏，利用authService的setFlag函数渲染导航栏的名字
      if(this.getFormControl('cname').value){
        window.localStorage.name=this.getFormControl('cname').value;
        this.authService.setFlag(true);
        //window.location.href="#/versions";
      }
    })
  }
  /**
   * error: true改变样式
   */
  confirmationValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (!this.checkEmail(control.value)) {
      return { valid: true, error: true };
    }
  };
  /**
   * 当天翼账号的值发生改变时调用，通知更新值和有效情况，触发confirmationValidator
   */
  updateEmailValidator(){
    setTimeout(_ => {
      this.informationForm.controls[ 'account' ].updateValueAndValidity();
    });
  }
  private checkEmail(value:any) {
    let reg = /^\w+((-\w+)|(\.\w+))*\@189.cn/;
    let isValid = reg.test(value);
    if (!isValid) {
      return false
    }
    return true;
  }
}
