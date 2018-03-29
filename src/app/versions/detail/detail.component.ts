import { Component, Input, OnInit } from '@angular/core';
import { NzModalSubject } from 'ng-zorro-antd';
import * as moment from 'moment';

@Component({
  selector: 'nz-package-detail-component',
  template: `
    <div>
      <nz-table #nzTable
                [nzDataSource]="true"
                [nzBordered]="true"
                [nzIsPagination]="false">
        <tbody nz-tbody>
          <tr nz-tbody-tr>
            <td nz-td style="width: 20%;">版本号：</td>
            <td nz-td style="width: 80%;">{{_packageInfo.resourceVersion}}</td>
          </tr>
          <tr nz-tbody-tr>
            <td nz-td>状态：</td>
            <td nz-td>{{_checkStatus[_packageInfo.checkStatus]}}</td>
          </tr>
          <tr nz-tbody-tr>
            <td nz-td>类型：</td>
            <td nz-td>{{_type[_packageInfo.versionType]}}</td>
          </tr>
          <tr nz-tbody-tr>
            <td nz-td>客户端版本：</td>
            <td nz-td>{{_packageInfo.versionInfo.appVersion}}</td>
          </tr>
          <tr nz-tbody-tr>
            <td nz-td>投放平台：</td>
            <td nz-td>{{_packageInfo.versionInfo.system}}</td>
          </tr>
          <tr nz-tbody-tr>
            <td nz-td>系统版本：</td>
            <td nz-td>{{_packageInfo.versionInfo.sysVersion}}</td>
          </tr>
          <tr nz-tbody-tr>
            <td nz-td>资源包类型：</td>
            <td nz-td>{{_packageInfo.versionInfo.resourceType}}</td>
          </tr>
          <tr nz-tbody-tr>
            <td nz-td>描述：</td>
            <td nz-td>{{_packageInfo.description}}</td>
          </tr>
          <tr nz-tbody-tr>
            <td nz-td>历史记录：</td>
            <td nz-td>
              <nz-timeline>
                <nz-timeline-item *ngFor="let item of _recordList">{{item}}</nz-timeline-item>
              </nz-timeline>
            </td>
          </tr>
        </tbody>
      </nz-table>
    </div>
  `,
  styles: [`
    :host ::ng-deep .ant-timeline {
      max-height: 100px;
      overflow-y: auto;
    }

    :host ::ng-deep .ant-timeline-item-last .ant-timeline-item-content {
      min-height: unset;
      padding-bottom: 0;
    }

    :host ::ng-deep .ant-timeline-item-last {
      padding-bottom: 0;
    }
  `]
})
export class PackageDetailComponent implements OnInit {
  _type = { DEV: '开发版', EXP: '体验版', PRO: '线上版' };
  _operation = {
    UPLOAD_PACKAGE: '上传资源包',
    PUBLISH_TO_EXP: '发布到体验版',
    APPROVE_PACKAGE: '审核资源包',
    PUBLISH_TO_PRO: '发布到线上版'
  };
  _packageInfo;
  _checkStatus;
  _recordList = [];

  @Input()
  set packageInfo(value) {
    this._packageInfo = value;
  }

  set checkStatus(value) {
    this._checkStatus = value;
  }

  emitDataOutside() {
    this.subject.next('传出数据');
  }

  handleCancel() {
    this.subject.destroy('onCancel');
  }

  constructor(private subject: NzModalSubject) {
    this.subject.on('onDestory', () => {
      //console.log('destroy');
    });
  }

  ngOnInit() {
    let recordList = this._packageInfo.recordList,
        item;
    for (let i = 0, len = recordList.length; i < len; i++) {
      item = recordList[i];
      this._recordList.push(`${i + 1}. ${moment(item.operateTime).format('YYYY-MM-DD HH:mm:ss')} 由 ${item.operatorInfo.name} ${this._operation[item.operateType]}。`);
    }
  }
}
