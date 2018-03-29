import { Component, OnInit } from '@angular/core';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { FileUploader } from 'ng2-file-upload';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { PackageDetailComponent } from './detail/detail.component';
import { VersionService } from './versions.service';

import ObjectAssign from 'object-assign';
import Utils from '../utils/index';

@Component({
  selector: 'app-versions',
  templateUrl: './versions.component.html',
  styleUrls: ['./versions.component.css'],
  providers: [VersionService]
})
export class VersionsComponent implements OnInit {
  constructor(private versionService: VersionService,
              private NzMessage: NzMessageService,
              private NzModal: NzModalService,
              private fb: FormBuilder) {};

  //产品 id
  readonly _appId = localStorage.getItem('appId') || '';
  //用户 id
  readonly _userId = localStorage.getItem('userId') || '';
  //NzMessage 显示时长
  readonly _nzMessageDuration = 3000;


  /************************************/
  /* 资源包列表渲染 */
  /************************************/

  //对应的 checkStatus: 0-未审核，1-审核通过，2-审核不通过
  readonly _checkStatus = ['未审核', '审核通过', '审核不通过'];
  //后台返回的 packageList
  _packageList = [];
  //table 分页数据
  _pageArgs = [1, 1, 1];

  /**
   * 获取资源包列表
   * @param appId {String} 产品 ID
   * @param type {String} 资源包的类型: dev(开发版)/exp(体验版)/pro(线上版)
   * @return void
   * @author 张志鹏 2017/08/28
   */
  getPackageList(appId, type, itemsPerPage, currentPage) {
    //let packageListBuffer = [];
    type = type.toUpperCase();
    return new Promise((resolve, reject) => {
      this.versionService.getPackageList(appId, type, itemsPerPage, currentPage).subscribe(data => {
        for (let i = 0, len = data.packageList.length; i < len; i++) {
          let item = data.packageList[i];
          item.statusString = this._checkStatus[item.checkStatus];
        }

        //arr.splice(position, 1, item)

        let packageList = Utils.deepClone(this._packageList);
        //let packageList = this._packageList;
        switch (type) {
          case 'DEV':
            data.name = '开发版';
            packageList[0] = data;
            this._packageList = packageList;
            break;
          case 'EXP':
            data.name = '体验版';
            packageList[1] = data;
            this._packageList = packageList;
            break;
          case 'PRO':
            data.name = '线上版';
            packageList[2] = data;
            this._packageList = packageList;
            break;
        }

        //console.log(this._packageList);
        resolve();
      });
    });
  }

  //根据 table 分页获取数据
  getPackageListByPagination(index) {
    //console.log(this._pageArgs[index]);
    switch (index) {
      case 0:
        this.getPackageList(this._appId, 'dev', 10, this._pageArgs[index]).then(() => {});
        break;
      case 1:
        this.getPackageList(this._appId, 'exp', 10, this._pageArgs[index]).then(() => {});
        break;
      case 2:
        this.getPackageList(this._appId, 'pro', 10, this._pageArgs[index]).then(() => {});
        break;
    }
  }


  /************************************/
  /* 资源包详情 */
  /************************************/
  //选中的资源包详情信息
  _packageInfo = {};

  getPackageInfo(packageId) {
    this.versionService.getPackageInfo(packageId).subscribe(data => {
      if (!data.result) {
        this._packageInfo = data.packageInfo;
        this.showPackageDetailModal();
      }
      else {
        this.NzMessage.error('查询失败', { nzDuration: this._nzMessageDuration });
      }
    });
  }

  showPackageDetailModal() {
    const subscription = this.NzModal.open({
      wrapClassName: 'vertical-center-modal',
      title: '资源包详情',
      content: PackageDetailComponent,
      footer: false,
      maskClosable: false,
      onOk() {},
      onCancel() {
        //console.log('Click cancel');
      },
      componentParams: {
        packageInfo: this._packageInfo,
        checkStatus: this._checkStatus
      }
    });
    subscription.subscribe(result => {
      //console.log(result);
    });
  }


  /************************************/
  /* 资源包操作 */
  /************************************/

  _isVisiblePackageManageModal = false;
  _packageManageModalData = {
    type: '', //{String} 弹窗类型: 删除(delete)/修改状态(changeStatus: 1-体验版, 2-线上版)/审核(approve: 1通过, 2不同)
    question: '',
    cancelText: '取消',
    okText: '确认',
    cancelButtonLoading: false,
    okButtonLoading: false,
    tabIndexOfCurrentPackage: 1, //当前操作的资源包在 tab 里的索引
    packageIdOfCurrentPackage: ''
  };

  packageManageModalHandleOk() {
    let data = this._packageManageModalData;
    data.okButtonLoading = true;
    switch (data.type) {
      case 'delete':
        //console.log(data.packageIdOfCurrentPackage, this._pageArgs[data.tabIndexOfCurrentPackage]);
        this.deletePackage(data.packageIdOfCurrentPackage)
            .then(() => {
              return this.getPackageList(this._appId, 'dev', 10, this._pageArgs[data.tabIndexOfCurrentPackage]);
            })
            .then(() => {
              data.okButtonLoading = false;
              this._isVisiblePackageManageModal = false;
            });
        break;
      case 'changeStatus-1':
        //console.log(data.packageIdOfCurrentPackage, this._pageArgs[data.tabIndexOfCurrentPackage]);
        this.publishPackageToEXP(data.packageIdOfCurrentPackage)
            .then(() => {
              return Promise.all([
                this.getPackageList(this._appId, 'dev', 10, this._pageArgs[data.tabIndexOfCurrentPackage]),
                this.getPackageList(this._appId, 'exp', 10, this._pageArgs[data.tabIndexOfCurrentPackage])
              ]);
            })
            .then(() => {
              data.okButtonLoading = false;
              this._isVisiblePackageManageModal = false;
            });
        break;
      case 'changeStatus-2':
        //console.log(data.packageIdOfCurrentPackage, this._pageArgs[data.tabIndexOfCurrentPackage]);
        this.publishPackageToPRO(data.packageIdOfCurrentPackage)
            .then(() => {
              return Promise.all([
                this.getPackageList(this._appId, 'exp', 10, this._pageArgs[data.tabIndexOfCurrentPackage]),
                this.getPackageList(this._appId, 'pro', 10, this._pageArgs[data.tabIndexOfCurrentPackage])
              ]);
            })
            .then(() => {
              data.okButtonLoading = false;
              this._isVisiblePackageManageModal = false;
            });
        break;
      case 'approve':
        //console.log(data.packageIdOfCurrentPackage, this._pageArgs[data.tabIndexOfCurrentPackage]);
        this.approvePackage(data.packageIdOfCurrentPackage, 1)
            .then(() => {
              return this.getPackageList(this._appId, 'exp', 10, this._pageArgs[data.tabIndexOfCurrentPackage]);
            })
            .then(() => {
              data.okButtonLoading = false;
              this._isVisiblePackageManageModal = false;
            });
        break;
    }
  }

  packageManageModalHandleCancel() {
    switch (this._packageManageModalData.type) {
      case 'approve':
        let data = this._packageManageModalData;
        data.cancelButtonLoading = true;
        //console.log(data.packageIdOfCurrentPackage, this._pageArgs[data.tabIndexOfCurrentPackage]);
        this.approvePackage(data.packageIdOfCurrentPackage, 2)
            .then(() => {
              return this.getPackageList(this._appId, 'exp', 10, this._pageArgs[data.tabIndexOfCurrentPackage]);
            })
            .then(() => {
              data.cancelButtonLoading = false;
              this._isVisiblePackageManageModal = false;
            });
        break;
      default:
        this._isVisiblePackageManageModal = false;
    }
  }

  /**
   * 处理操作按钮点击
   * @param index1 {Number} 资源包在 this._packageList 中的位置
   * @param index2 {Number} 资源包在 this._packageList[index1].packageList 中的位置
   * @param type {String} 操作类型: 删除(delete)/修改状态(changeStatus)/审核(approve)
   * @param status {Number} type 为 delete 时, status 无效
   * @param status {Number} type 为 changeStatus 时, 1-发布到体验版, 2-发布到线上版
   * @param status {Number} type 为 approve 时, 1-通过, 2-不通过
   * @return void
   * @author 张志鹏 2017/08/28
   */
  managePackage(index1, index2, type, status) {
    const
      //当前操作的版本数据: 开发版/体验版/线上版
      currentPackageListData = this._packageList[index1],
      //当前操作的资源包列表
      list                   = Utils.deepClone(currentPackageListData.packageList),
      //当前操作的资源包 id
      packageId              = list[index2].packageId;

    //当前操作资源包在 packageList 数组中的位置
    //index                  = (this._pageArgs[index1] - 1) * currentPackageListData.itemsPerPage + index2;

    switch (type) {
      case 'delete':
        ObjectAssign(this._packageManageModalData, {
          type: 'delete',
          question: `确定要将资源包 ${list[index2].resourceVersion} 删除吗？`,
          cancelText: '取消',
          okText: '确认',
          tabIndexOfCurrentPackage: index1,
          packageIdOfCurrentPackage: packageId
        });
        break;
      case 'changeStatus':
        if (status === 1) {
          ObjectAssign(this._packageManageModalData, {
            type: 'changeStatus-1',
            question: `确定要将资源包 ${list[index2].resourceVersion} 发布到体验版吗？`,
            cancelText: '取消',
            okText: '确认',
            tabIndexOfCurrentPackage: index1,
            packageIdOfCurrentPackage: packageId
          });
        }
        else if (status === 2) {
          ObjectAssign(this._packageManageModalData, {
            type: 'changeStatus-2',
            question: `确定要将资源包 ${list[index2].resourceVersion} 发布到线上版吗？`,
            cancelText: '取消',
            okText: '确认',
            tabIndexOfCurrentPackage: index1,
            packageIdOfCurrentPackage: packageId
          });
        }
        else {
          return false;
        }
        break;
      case 'approve':
        ObjectAssign(this._packageManageModalData, {
          type: 'approve',
          question: `请审核资源包 ${list[index2].resourceVersion}`,
          cancelText: '不通过',
          okText: '通过',
          tabIndexOfCurrentPackage: index1,
          packageIdOfCurrentPackage: packageId
        });
    }
    this._isVisiblePackageManageModal = true;
  };

  deletePackage(packageId) {
    return new Promise((resolve, reject) => {
      this.versionService.deletePackages(packageId).subscribe(data => {
        //data.result === 0 为成功
        if (!data.result) {
          this.NzMessage.success('删除成功', { nzDuration: this._nzMessageDuration });
          resolve();
        }
        else {
          this.NzMessage.error('删除失败', { nzDuration: this._nzMessageDuration });
          reject();
        }
      });
    });
  }

  publishPackageToEXP(packageId) {
    const packageInfo = {
      userId: this._userId,
      packageId: packageId
    };

    return new Promise((resolve, reject) => {
      this.versionService.publishPackageToEXP(packageInfo).subscribe(data => {
        //data.result === 0 为成功
        if (!data.result) {
          this.NzMessage.success('操作成功', { nzDuration: this._nzMessageDuration });
          resolve();
        }
        else {
          this.NzMessage.error('操作失败', { nzDuration: this._nzMessageDuration });
          reject();
        }
      });
    });
  }

  publishPackageToPRO(packageId) {
    const packageInfo = {
      userId: this._userId,
      packageId: packageId
    };

    return new Promise((resolve, reject) => {
      this.versionService.publishPackageToPRO(packageInfo).subscribe(data => {
        //data.result === 0 为成功
        if (!data.result) {
          this.NzMessage.success('操作成功', { nzDuration: this._nzMessageDuration });
          resolve();
        }
        else {
          this.NzMessage.error('操作失败', { nzDuration: this._nzMessageDuration });
          reject();
        }
      });
    });
  }

  //更改审核版本的通过与不通过的状态，checkStatus 值：1-通过，2-不通过
  approvePackage(packageId, checkStatus) {
    const packageInfo = {
      userId: this._userId,
      packageId: packageId,
      checkStatus: checkStatus
    };

    return new Promise((resolve, reject) => {
      this.versionService.approvePackage(packageInfo).subscribe(data => {
        //data.result === 0 为成功
        if (!data.result) {
          this.NzMessage.success('操作成功', { nzDuration: this._nzMessageDuration });
          resolve();
        }
        else {
          this.NzMessage.error('操作失败', { nzDuration: this._nzMessageDuration });
          reject();
        }
      });
    });
  }


  /************************************/
  /* 资源包上传 */
  /************************************/

  validateForm: FormGroup; //上传弹窗 Form 数据
  _selectedTabIndex = 0; //当前显示的 Tab 索引，控制上传按钮只在开发版时显示
  _isVisibleUploadModal = false; //是否显示上传弹窗
  _uploadConfirmLoading = false; //上传弹窗内的按钮 loading
  _packageVersionsList = []; //资源包版本列表
  //当前选择的资源包版本信息
  _selectedVersionItem = {
    appVersion: '无数据',
    system: '无数据',
    sysVersion: '无数据',
    resourceType: '无数据'
  };
  //待上传资源包信息
  _uploadedPackageInfo = {
    appId: this._appId,
    userId: this._userId,
    packageId: '',
    versionId: '',
    description: ''
  };
  //ng2-file-upload 上传插件
  uploader: FileUploader = new FileUploader({
    removeAfterUpload: true, //上传完成后从队列中移除
    url: this.versionService.config.url.uploadPackage
  });

  //上传弹窗开关
  toggleUploadModal(flag) {
    if (flag) {
      this.getVersionsList();
    }
    else {
      if (this.uploader.isUploading) {
        //取消上传
        this.uploader.cancelAll();
        this.NzMessage.info('取消上传', { nzDuration: this._nzMessageDuration });
      }
      this.initializeUploadForm();
    }
    this._isVisibleUploadModal = flag;
  };

  //提交操作
  handleUploadSubmit() {
    this._uploadConfirmLoading = true;
    this.uploadFile();
  }

  //初始化表单
  initializeUploadForm() {
    //配置默认资源包版本
    if (this._packageVersionsList.length) {
      this._selectedVersionItem = this._packageVersionsList[0];
      this._uploadedPackageInfo.versionId = this._packageVersionsList[0].versionId;
      this._uploadedPackageInfo.description = '';
    }
    //清空上传队列
    this.uploader.clearQueue();
  }

  getVersionsList() {
    let data = {
      params: {
        appId: this._appId,
        onlyUnPublished: true
      }
    };

    this.versionService.getVersionsList(data).subscribe(data => {
      if (!data.result) {
        this._packageVersionsList = data.versionList;
        this.initializeUploadForm();
      }
      else {
        return false;
      }
    });
  }

  //根据 versionId 获取版本信息
  getVersionItemByVersionId(versionId) {
    let item;
    for (let i = 0, len = this._packageVersionsList.length; i < len; i++) {
      item = this._packageVersionsList[i];
      if (item.versionId === versionId) {
        return item;
      }
    }
  };

  //变更资源包版本号回调
  selectedVersionOnChanged(e) {
    if (e === true) return;
    if (!this._uploadedPackageInfo.versionId) return;
    this._selectedVersionItem = this.getVersionItemByVersionId(this._uploadedPackageInfo.versionId);
  };

  selectedFileOnChanged() {
    console.log(this.uploader.queue);
  };

  //添加上传成功事件回调函数
  uploaderInit() {
    this.uploader.onSuccessItem = (item, response, status, headers) => {
      let data = JSON.parse(response);
      //data.result === 0 为成功
      if (!data.result) {
        console.log('开始上传资源包信息');
        this.updatePackageInfo(data.packageId);
      }
      else {
        this.NzMessage.error('上传失败', { nzDuration: this._nzMessageDuration });
      }
    };
  }

  uploadFile() {
    let queueLen   = this.uploader.queue.length,
        uploadFile = this.uploader.queue[queueLen - 1]; //待上传文件
    uploadFile.upload(); //开始上传
    //console.log(this.uploader);
  }

  updatePackageInfo(packageId) {
    let packageInfo = this._uploadedPackageInfo;

    //console.log(this.validateForm['_value']);

    ObjectAssign(packageInfo, {
      packageId: packageId
    });

    this.versionService.updatePackageInfo(packageInfo).subscribe(({ result }) => {
      //data.result === 0 为成功
      if (!result) {
        this.getPackageList(this._appId, 'dev', 10, 1).then(() => {});
        this.NzMessage.success('上传成功', { nzDuration: this._nzMessageDuration });
      }
      else {
        this.NzMessage.error('上传失败', { nzDuration: this._nzMessageDuration });
      }
      this._isVisibleUploadModal = false;
      this._uploadConfirmLoading = false;
    });
  }


  ngOnInit() {
    this.getPackageList(this._appId, 'dev', 10, 1).then(() => {
      this.getPackageList(this._appId, 'exp', 10, 1).then(() => {
        this.getPackageList(this._appId, 'pro', 10, 1).then(() => {});
      });
    });

    this.validateForm = this.fb.group({
      versionId: ['', [Validators.required]],
      description: []
    });

    this.uploaderInit();
  }
}
