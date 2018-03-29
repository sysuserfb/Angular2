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
interface Department {
  departmentId: string,
  departmentName: string,
  departmentType: number
}
interface Member {
  switch: boolean,
  memberId: string,
  departmentInfo: string,
  userId: string,
  roleId: number,
  status: number,
  userInfo: {
    userId: string,
    username: string,
    name: string,
    avatarId: number,
    account: string,
    department: Department[]
  }
};

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.css']
})
export class MembersComponent implements OnInit {
  // 定义添加成员表单
  addForm: FormGroup;
  _isDisable;
  currentModal;
  // 设置只读常数
  //set Max developer and Max experiencer
  readonly Maxadmin: number = 1;
  readonly Maxdev: number = 5;
  readonly Maxexp: number = 20;

  readonly SAdmin: number = 1;
  readonly PAdmin: number = 2;
  readonly Pdevelop: number = 3;
  readonly PExperien: number = 4;
  readonly roleGroup = [
    '超级管理员',
    '产品管理员',
    '产品开发者',
    '产品体验者'
  ];//roleId==0即为超管

  // 判断是否有超级管理员和产品管理员等
  private Snull = true;
  private Pnull = true;
  private deveLen: number;
  private expeLen: number;

  // 用户的重要信息
  private appId: string;
  private roleId: string;

  // 临时变量，用来承载需要在弹窗显示的数据
  public MemberInfo: Member;
  // 临时变量，用来承载得到的数据
  public SadminUser = {};
  public PadminUser = {};
  public UsersList: any = [];
  public MemberList: Member[];
  public adminList: Member[];
  public developerList: Member[];
  public experiencerList: Member[];

  public department: Department[];

  constructor(
    private httpService: HttpService,
    private modalService: NzModalService,
    private globalService: GlobalService,
    private _message: NzMessageService,
    private authService: AuthService,
    private fb: FormBuilder) { }

  ngOnInit() {
    // 初始化参数
    this.adminList = [];
    this.developerList = [];
    this.experiencerList = [];
    this.deveLen = -1;
    this.expeLen = -1;
    this.department = [
      {
        departmentId: "",
        departmentName: "",
        departmentType: 1
      },
      {
        departmentId: "",
        departmentName: "",
        departmentType: 2
      }
    ];
    // 获取用户的appId和roleId
    this.appId = this.authService.get('appId');
    this.roleId = this.authService.get('roleId');

    // 第一次进入页面获取所有成员列表
    this.getMemberList();

    // 初始化添加成员的表单
    this.addForm = this.fb.group({
      Name: [null, [Validators.required]]
    });
  }

  /* 辅助函数 */

  // 请求响应弹窗
  public httpError(error, num = 3000) {
    this._message.create('error', `${error}`, { nzDuration: num });
  }
  public httpSuccess(msg, num = 3000) {
    this._message.create('success', `${msg}`, { nzDuration: num });
  }
  // 改变用户状态，绑定到switch
  public sendStatus(member) {
    // 改变用户状态
    this.updateMemberInfo(member);
  }
  // 调整表单确定按钮是否可用
  public isDisable(validForm: FormGroup) {
    this._isDisable = validForm.valid;
  }
  // 将用户信息赋值给提交临时变量
  public getMemberInfo(user): void {
    this.clearInfo();
    for (let key in user) {
      this.MemberInfo[key] = user[key];
    }
  }
  // 清空临时变量
  public clearInfo(): void {
    this.MemberInfo = {
      switch: null,
      memberId: "",
      departmentInfo: "",
      roleId: null,
      status: 1,
      userId: "",
      userInfo: {
        userId: "",
        username: "",
        name: null,
        avatarId: 0,
        account: null,
        department: this.department
      }
    };
  }
  /*********** nz-Modal **********
   * 添加成员的弹窗
   * 删除成员的弹窗
   * 更换管理员的弹窗
  *******************************/
  /** 
   * 添加成员的弹窗
   * @param roles {number} 添加的成员到哪个角色
   * @param contentTpl 内容模板
   * @param footerTpl 脚部按钮模板
  */
  public showAddModal(roles, contentTpl, footerTpl) {
    // 第一次用到成员列表就发起请求
    if (this.UsersList.length === 0) this.getUsersList();
    // 定义要添加的角色，初始化表单
    let title = this.roleGroup[roles - 1];
    // this.MemberInfo.roleId = roles;
    this.addForm.controls['Name'].reset();
    let that = this;
    this.currentModal = this.modalService.open({
      title: '添加' + title,
      content: contentTpl,
      footer: footerTpl,
      maskClosable: false,
      wrapClassName: 'vertical-center-modal',
      onOk() {
        // 添加成员
        that.addMembers(roles);
      },
      onCancel() {
      }
    });
  }
  /** 
   * 删除成员的弹窗
   * @param member {Member} 成员的详细信息
   * @param contentTpl 内容模板
   * @param footerTpl 脚部按钮模板
  */
  public showDelModal(member, contentTpl, footerTpl) {
    let that = this;
    // 获取成员信息，初始化弹窗显示的变量
    this.getMemberInfo(member);
    this.currentModal = this.modalService.open({
      title: '确认删除此用户？',
      content: contentTpl,
      footer: footerTpl,
      maskClosable: false,
      wrapClassName: 'vertical-center-modal',
      onOk() {
        that.deleteMembers();
      },
      onCancel() {
      }
    });
  }
  /** 
  * 更换管理员的弹窗
  * @param contentTpl 内容模板
  * @param footerTpl 脚部按钮模板
 */
  public showChangeModal(contentTpl, footerTpl) {
    // 需要用到成员列表
    if (this.UsersList.length === 0) this.getUsersList();
    let that = this;
    // 仍使用双向绑定法
    this.MemberInfo.roleId = this.PAdmin;
    this.currentModal = this.modalService.open({
      title: '更换管理员',
      content: contentTpl,
      footer: footerTpl,
      maskClosable: false,
      wrapClassName: 'vertical-center-modal',
      onOk() {
        that.changeAdmin();
      },
      onCancel() {
      }
    });
  }
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

  /******** 请求接口 ***************
   * 获取用户列表的请求
   * 获取成员列表的请求
   * 修改用户状态的请求
   * 更换管理员的请求
   * 添加成员的请求
   * 删除成员的请求
   ******************************/
  /* 获取用户列表 */
  public getUsersList() {
    let api = 'getUsersList';
    this.httpService.get(api).subscribe((data) => {
      this.UsersList = data.userList;
      for (let user of this.UsersList) {
        // 将获取的数据转换为nz-select的数据模型[value, label]
        user.value = user.userId;
        if (user.name === null || user.name === undefined)
          user.label = user.username;
        else
          user.label = user.name + " (" + user.username + ")";
      }
    });
  }
  /** 
   * 获取成员列表
   * @param roles {number} 获取哪个角色的成员列表，null即获取所有
   * @param itemsPerPage {number} 每页个数
   * @param currentPage {number} 当前页数
  */
  public getMemberList(roles = null, itemsPerPage: number = 30, currentPage: number = 1): void {
    let api = 'getMembersList';
    this.clearInfo();
    // roles	可选	成员角色数组
    // appId	必须	成员所属产品
    // itemsPerPage	可选	每页条数，默认10
    // currentPage	可选	当前页码，默认1
    let appId = this.appId;
    let Obj = {
      'appId': appId,
      'itemsPerPage': itemsPerPage,
      'currentPage': currentPage
    }
    if (roles != null) Obj['roleId'] = roles;
    this.globalService.showSpin();
    this.httpService.get(api, Obj).subscribe((data) => {
      this.MemberList = data.memberList;
      this.globalService.hideSpin();
      // 清理缓存数据
      if (roles === this.PAdmin) {
        this.Pnull = true;
        this.PadminUser = {};
      }
      else if (roles === this.Pdevelop) {
        this.developerList = [];
      }
      else if (roles === this.PExperien) {
        this.experiencerList = [];
      }
      else {
        this.Snull = true;
        this.Pnull = true;
        this.SadminUser = {};
        this.PadminUser = {};
        this.adminList = [];
        this.developerList = [];
        this.experiencerList = [];
      }

      for (let mem of this.MemberList) {
        //将status转换为switch
        if (mem.status === 1) {
          mem.switch = true;
        } else if (mem.status === 2) {
          mem.switch = false;
        }
        //判断部门是否为空
        if (!mem.userInfo.department.length) {
          mem.userInfo.department = this.department;
          mem.departmentInfo = '';
        }
        else {
          mem.departmentInfo = mem.userInfo.department[0].departmentName + ' . '
            + mem.userInfo.department[1].departmentName;
        }

        //判断中文名是否为空
        if (!mem.userInfo.name)
          mem.userInfo.name = mem.userInfo.username;

        // 根据成员角色分装入不同的数组
        if (mem.roleId === this.SAdmin) {
          //判断是否超管
          this.SadminUser = mem;//超管只有一个
          this.Snull = false;
        }
        else if (mem.roleId === this.PAdmin) {
          this.PadminUser = mem;//一个产品只有一个管理员
          this.Pnull = false;
        }
        else if (mem.roleId === this.Pdevelop) {
          this.developerList.push(mem);
        }
        else if (mem.roleId === this.PExperien) {
          this.experiencerList.push(mem);
        }
      }
      this.deveLen = this.developerList.length;
      this.expeLen = this.experiencerList.length;
    });
  }
  /** 
   * 刷新列表，更新成员状态
   * @param roleId {number} 获取哪个角色的成员列表，null即获取所有
   * @param itemsPerPage {number} 每页个数
   * @param currentPage {number} 当前页数
  */
  public updateStatus(roleId, itemsPerPage: number = 30, currentPage: number = 1) {
    let api = 'getMembersList';
    // roles	可选	成员角色数组
    // appId	必须	成员所属产品
    // itemsPerPage	可选	每页条数，默认10
    // currentPage	可选	当前页码，默认1
    let appId = this.appId;
    let params = {
      'roleId': roleId,
      'appId': appId,
      'itemsPerPage': itemsPerPage,
      'currentPage': currentPage
    }
    this.httpService.get(api, params).subscribe((data) => {
      this.MemberList = data.memberList;
      //只有两个角色可修改状态
      let tran = [true, true, false];
      for (let key in this.MemberList) {
        if (roleId === this.Pdevelop) {
          this.developerList[key].status = this.MemberList[key].status;
          this.developerList[key].switch = tran[this.developerList[key].status];
        }
        else if (roleId === this.PExperien) {
          this.experiencerList[key].status = this.MemberList[key].status;
          this.experiencerList[key].switch = tran[this.experiencerList[key].status];
        }
      }
    });
  }
  /* 更换管理员 */
  public changeAdmin() {
    let api = 'modifyAppManager';
    // appId	String	必须	app ID，作为产品的唯一标识
    // managerId	String	必须	管理员的userId
    let params = {
      appId: this.appId,
      managerId: this.MemberInfo.userId
    }
    this.httpService.post(api, params).subscribe((data) => {
      // 刷新列表
      this.getMemberList(this.MemberInfo.roleId);
      this._message.create('success', `${data.msg}`, { nzDuration: 3000 });
    }, error => { this.httpError(error); });
  }
  /* 删除成员 */
  public deleteMembers(): void {
    let api = 'deleteMembers';
    let member = [this.MemberInfo.memberId];
    // members	必须	成员ID数组 id1,id2,id3...
    let params = { 'memberIds': member.join(',') };

    this.httpService.post(api, params).subscribe((data) => {
      this.getMemberList(this.MemberInfo.roleId);
      this._message.create('success', `${data.msg}`, { nzDuration: 3000 });
    }, error => { this.httpError(error); });
  }
  /* 更换成员状态 */
  public updateMemberInfo(info) {
    let api = 'updateMemberInfo';
    // 转换获取status
    if (info.switch === true) {
      info.status = 1;
    } else if (info.switch === false) {
      info.status = 2;
    }
    // memberId	必须	成员ID
    // status	必须	用户状态，可用、停用
    let param = {
      'memberId': info.memberId,
      'status': info.status
    };

    this.httpService.post(api, param).subscribe((data) => {
      this.updateStatus(info.roleId);
      this._message.create('success', `${data.msg}`, { nzDuration: 3000 });
    }, error => { this.httpError(error); });
  }
  /* 添加成员 */
  public addMembers(roleId): void {
    let api = 'addMember';
    // let userId = this.MemberInfo.userId;
    // let roleId = this.MemberInfo.roleId;
    let userId = this.addForm.controls['Name'].value;
    // appId	必须	成员ID
    // roleId	必须	成员角色数组
    // appId	必须	成员所属产品
    let params = {
      'userId': userId,
      'roleId': roleId,
      'appId': this.appId
    }

    this.httpService.post(api, params).subscribe((data) => {
      // 更新列表
      this.getMemberList(roleId);
      this._message.create('success', `${data.msg}`, { nzDuration: 3000 });
    }, error => { this.httpError(error); });
  }
}
