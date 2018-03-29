import { Component, OnInit } from '@angular/core';
import { HttpService } from '../share/http/http.service';
import { NzModalService } from 'ng-zorro-antd';
import { NzMessageService } from 'ng-zorro-antd';
import { GlobalService } from '../share/global/global.service';
import { AuthService } from '../auth/auth.service'
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
interface Version {
  versionId: string,
  appId: string
  resourceVersion: string
  sysVersion: string
  appVersion: string
  resourceType: string
  system: string
}
@Component({
  selector: 'app-apps',
  templateUrl: './apps.component.html',
  styleUrls: ['./apps.component.css'],
})
export class AppsComponent implements OnInit {
  // 定义提交表单
  // 添加产品
  addForm: FormGroup;
  // 新建版本
  versionForm: FormGroup;
  // 更改名称
  changeForm: FormGroup;
  // 更换管理员
  adminForm: FormGroup;
  // 标记按钮是否可用
  _isDisable;
  // 当前弹窗
  currentModal;
  // 是否超管，隐藏删除按钮
  public isSAdmin = false;
  // 定义版本号的数组，如[0,0,0]表示 v0.0.0
  public resourceVersion = [0, 0, 0];
  public sysVersion = [0, 0, 0];
  public appVersion = [0, 0, 0];
  // 产品列表长度，标识是否显示无数据时候的内容
  public appLen;
  // 临时变量，用来承载需要提交的数据
  public version: Version;
  // 临时变量，用来承载得到的数据
  public AppList: any = [];
  public userList = [];

  constructor(
    private httpService: HttpService,
    private modalService: NzModalService,
    private _message: NzMessageService,
    private globalService: GlobalService,
    private authService: AuthService,
    private fb: FormBuilder) {
    this.appLen = 1;
  }
  // 重要的用户信息
  private userId: string;
  private roleId: string;

  //页面初始化
  ngOnInit() {
    // 初始化产品列表（超管）
    this.getAppsListAll();
    // 初始化参数
    this.version = {
      versionId: "",
      appId: "",
      resourceVersion: "",
      sysVersion: "",
      appVersion: "",
      resourceType: "",
      system: ""
    };
    this._isDisable = false;
    // 获取userId
    this.userId = this.authService.get('userId');
    // 初始化表单
    this.addForm = this.fb.group({
      Name: [null, [Validators.required]],
      admin: [null, [Validators.required]]
    });
    this.changeForm = this.fb.group({
      Name: [null, [Validators.required]]
    });
    this.adminForm = this.fb.group({
      admin: [null, [Validators.required]]
    });
    this.versionForm = this.fb.group({
      resourceVersion0: [null, [Validators.required]],
      sysVersion0: [null, [Validators.required]],
      appVersion0: [null, [Validators.required]],
      resourceVersion1: [null, [Validators.required]],
      sysVersion1: [null, [Validators.required]],
      appVersion1: [null, [Validators.required]],
      resourceVersion2: [null, [Validators.required]],
      sysVersion2: [null, [Validators.required]],
      appVersion2: [null, [Validators.required]],
      resourceType: [null, [Validators.required]],
      system: [null, [Validators.required]]
    });
  }
  /* 辅助函数 */
  // 设置表单提交按钮可用性，绑定到button
  public isDisable(validForm: FormGroup) {
    this._isDisable = validForm.valid;
  }
  // 版本号排序
  public versionSort(a, b): number {
    let va = a.resourceVersion.split('.');
    let vb = b.resourceVersion.split('.');
    let result = 0;
    for (let i = 0; i < 3; i++) {
      let intA = parseInt(va[i]);
      let intB = parseInt(vb[i])
      if (intA > intB) {
        result += -1;
      } else if (intA < intB) {
        result += 1;
      } else {
        result += 0;
      }
      if (result != 0)
        break;
    }
    return result;
  }
  // 清除缓存版本数据
  // public clearInfo() {
  //   for (let key in this.version) {
  //     this.version[key] = "";
  //   }
  // }
  // 请求失败时的弹窗
  public httpError(error) {
    this._message.create('error', `${error}`, { nzDuration: 3000 });
  }
  /**
   * nz-Modal
   * 添加产品的弹窗
   * 删除产品的弹窗
   * 修改产品名字的弹窗
   * 更换产品管理员的弹窗
   * 新建版本的弹窗
  */
  /**
   * 显示添加产品的弹窗
   * @param contentTpl 内容模板
   * @param footerTpl 脚部按钮模板
   */
  public showAddModal(contentTpl, footerTpl) {
    // 设置表单初始值
    this.addForm.controls['Name'].reset();
    this.addForm.controls['admin'].reset();
    this.addForm.controls['Name'].markAsPristine();
    this.addForm.controls['admin'].markAsPristine();
    // 表单信息为空，默认不可用
    this._isDisable = false;
    if (this.userList.length === 0) this.getUsersList();
    let that = this;
    this.currentModal = this.modalService.open({
      title: '添加产品',
      content: contentTpl,
      footer: footerTpl,
      maskClosable: false,
      wrapClassName: 'vertical-center-modal',
      onOk() {
        // 添加产品
        that.addApp();
      },
      onCancel() {
      }
    });
  }
  /**
   * 显示产品重命名的弹窗
   * @param product 要更换管名称的产品
   * @param contentTpl 内容模板
   * @param footerTpl 脚部按钮模板
   */
  public showRenameModal(product, contentTpl, footerTpl) {
    // 设置表单初始值
    this.changeForm.controls['Name'].setValue(product.appName);
    // Name不为空，默认按钮可用
    this._isDisable = true;
    let that = this;
    this.currentModal = this.modalService.open({
      title: '请输入产品的新名称',
      content: contentTpl,
      footer: footerTpl,
      maskClosable: false,
      wrapClassName: 'vertical-center-modal',
      onOk() {
        // 更换产品名称
        that.changeName(product);
      },
      onCancel() {
      }
    });
  }
  /**
   * 显示更换管理员的弹窗
   * @param product 要更换管理员的产品
   * @param contentTpl 内容模板
   * @param footerTpl 脚部按钮模板
   */
  public showChangeModal(product, contentTpl, footerTpl) {
    // 设置表单初始值
    this.adminForm.controls['admin'].setValue(product.managerInfo.userId);
    // admin不为空，默认按钮可用
    this._isDisable = true;
    if (this.userList.length === 0) this.getUsersList();
    let that = this;
    this.currentModal = this.modalService.open({
      title: '请选择产品管理员',
      content: contentTpl,
      footer: footerTpl,
      maskClosable: false,
      wrapClassName: 'vertical-center-modal',
      onOk() {
        // 更换产品管理者
        that.changeManager(product);
      },
      onCancel() {
      }
    });
  }
  /**
   * 显示新建版本的弹窗
   * @param appId 要新建版本的产品Id
   * @param contentTpl 内容模板
   * @param footerTpl 脚部按钮模板
   */
  public showVersionModal(product, contentTpl, footerTpl) {
    this._isDisable = true;
    // 获取最高版本号，设置表单初始值
    if (product.versionList.length != 0) {
      let versionList = product.versionList.sort(this.versionSort)[0];
      this.resourceVersion = versionList.resourceVersion.split('.');
      this.sysVersion = versionList.sysVersion.split('.');
      this.appVersion = versionList.appVersion.split('.');
    } else {
      this.resourceVersion = [0, 0, 0];
      this.sysVersion = [0, 0, 0];
      this.appVersion = [0, 0, 0];
    }
    this.version.system = 'Android';
    this.version.resourceType = 'H5';
    this.version.appId = product.appId;
    // 获取成员列表
    if (this.userList.length === 0) this.getUsersList();
    let that = this;
    this.currentModal = this.modalService.open({
      title: '新建版本',
      content: contentTpl,
      footer: footerTpl,
      maskClosable: false,
      wrapClassName: 'vertical-center-modal',
      onOk() {
        that.addVersion();
      },
      onCancel() {
      }
    });
  }
  // 确认删除弹窗
  showConfirm = (appId) => {
    let that = this;
    this.modalService.confirm({
      title: '您是否确认要删除此产品',
      content: '<b>请再次确认您要进行删除操作</b>',
      wrapClassName: 'vertical-center-modal',
      zIndex: 2000,
      onOk() {
        that.delApps(appId)
      },
      onCancel() {
      }
    });
  }
  // footer的按钮绑定的事件
  handleOk = (e) => {
    // 销毁弹窗
    this.currentModal.destroy('onOk');
    this.currentModal = null;
  }
  handleCancel = (e) => {
    // 销毁弹窗
    this.currentModal.destroy('onCancel');
    this.currentModal = null;
  }
  /**
   * ******** 请求接口 ***************
   * 获取用户列表
   * 获取所有产品列表（超管）
   * 更换产品管理员（超管）
   * 获取用户拥有的产品列表（暂无）
   * 修改产品名称
   * 添加版本号
   * 添加产品
   * 删除产品（屏蔽）
   * ********************************/
  /* 获取用户列表 */
  public getUsersList() {
    let api = 'getUsersList';
    this.httpService.get(api).subscribe((data) => {
      this.userList = data.userList;
      for (let user of this.userList) {
        // 将用户列表转换为nz-select的数据模型
        user.value = user.userId;
        if (user.name === null || user.name === undefined)
          user.label = user.username;
        else
          user.label = user.name + " (" + user.username + ")";
      }
    });
  }
  /* 获取所有产品列表（超管）*/
  public getAppsListAll() {
    let api = 'getAppsListAll';
    let params = {
      // 暂未实现分页功能
      // itemsPerPage: 10,
      // currentPage: 1
    }
    this.getAppsListReq(api, params);
  }
  /* 获取用户拥有的产品列表 */
  public getAppsList() {
    let api = 'getAppsList';
    let params = {
      // 暂未实现分页功能
      userId: this.userId,
      // itemsPerPage: 10,
      // currentPage: 1
    }
    this.getAppsListReq(api, params);
  }
  /**
   * 获取产品列表的函数
   * 这是getAppsList 和 getAppsListAll的公共部分
   * @param api 请求的接口地址
   * @param params 要传递的参数
   */
  public getAppsListReq(api, params) {
    this.globalService.showSpin();
    this.httpService.get(api, params).subscribe((data) => {
      this.AppList = data.appList;
      this.globalService.hideSpin();
      for (let i = 0; i < this.AppList.length; i++) {
        // 判断name是否为空
        if (!this.AppList[i].managerInfo.name) {
          this.AppList[i].managerInfo.name = this.AppList[i].managerInfo.username
        }
        let product = this.AppList[i];
        // 将产品信息注入productInfo数组，使得可以被nz-table正常调用
        this.AppList[i].productInfo = [product];
        let appId = product.appId;
      }
      // 更新产品列表长度
      this.appLen = this.AppList.length;
    });
  }
  /**
   * 更换管理员（超管）
   * @param product 传入的产品对象
  */
  public changeManager(product) {
    let api = 'modifyAppManager';
    // appId	String	必须	app ID，作为产品的唯一标识
    // managerId	String	必须	管理员的userId
    let managerId = this.adminForm.controls['admin'].value;
    let appId = product.appId;
    let params = {
      appId: appId,
      managerId: managerId
    }
    this.httpService.post(api, params).subscribe((data) => {
      // 更换成功
      this.httpService.get('getAppInfo', { appId: appId }).subscribe((data) => {
        // 判断name是否为空
        if (!data.appInfo.managerInfo.name) {
          data.appInfo.managerInfo.name = data.appInfo.managerInfo.username
        }
        // 更新产品管理者信息
        product.managerInfo = data.appInfo.managerInfo;
      });
      this._message.create('success', `${data.msg}`, { nzDuration: 3000 });
    }, error => { this.httpError(error); });
  }
  /**
   * 获取单个产品的版本列表
   * @param appId 需要获取版本列表的产品Id
   * @param i 产品所在产品列表的下标
   */
  public getVersionList(appId, i) {
    let api = 'getVersionsList';
    this.httpService.get(api, { appId: appId }).subscribe((data) => {
      // 根据下标 i 更新单个产品的版本列表
      this.AppList[i].versionList = data.versionList;
    }, error => { this.httpError(error); })
  }
  /* 新建版本 */
  public addVersion(): void {
    let api = 'addVersion';
    // 拼接三个输入框，并存储到临时变量
    this.version.resourceVersion = this.resourceVersion.join('.');
    this.version.appVersion = this.appVersion.join('.');
    this.version.sysVersion = this.sysVersion.join('.');

    let version = this.version;
    let appId = version.appId;
    // 获取版本号在所有产品列表里的下标
    let i;
    for (let k = 0; k < this.AppList.length; k++) {
      if (this.AppList[k].appId === appId)
        i = k;
    }
    let params = {
      appId: version.appId,
      resourceVersion: version.resourceVersion,
      appVersion: version.appVersion,
      sysVersion: version.sysVersion,
      resourceType: version.resourceType,
      system: version.system
    }
    this.httpService.post(api, params).subscribe((data) => {
      this.getVersionList(appId, i);
      this._message.create('success', `${data.msg}`, { nzDuration: 3000 });
    }, error => { this.httpError(error); });
    // this.clearInfo()
  }

  /* 修改产品名称 */
  public changeName(product): void {
    let newName = this.changeForm.controls['Name'].value;
    let appId = product.appId
    this.httpService.post('updateAppInfo', { appName: newName, appId: appId }).subscribe((data) => {
      this._message.create('success', `${data.msg}`, { nzDuration: 3000 });
      //刷新单个信息
      this.httpService.get('getAppInfo', { appId: appId }).subscribe((data) => {
        product.appName = data.appInfo.appName;
      });
    }, error => { this.httpError(error); })
  }

  /* 增加产品 */
  public addApp(): void {
    let managerId = this.addForm.controls['admin'].value;
    let name = this.addForm.controls['Name'].value;
    this.httpService.post('addApp', { appName: name, managerId: managerId }).subscribe((item) => {
      // 刷新列表
      this.getAppsListAll();
      this._message.create('success', `${item.msg}`, { nzDuration: 3000 });
    }, error => { this.httpError(error); })
  }

  /* 删除产品 */
  public delApps(appId: string): void {
    this.httpService.post('deleteApps', { appId: appId }).subscribe((data) => {
      // 刷新列表
      this.getAppsListAll();
      this._message.create('success', `${data.msg}`, { nzDuration: 3000 });
    }, error => { this.httpError(error); })
  }
}
