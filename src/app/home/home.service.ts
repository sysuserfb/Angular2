import { Injectable } from '@angular/core';
const roleConfig = [
  {
    roleId: 1,
    roleName: '超级管理员',
    menuList: [
      {
        name: '版本管理',
        url: '/versions',
        iClass: 'anticon-api'
      },
      {
        name: '成员管理',
        url: '/members',
        iClass: 'anticon-team'
      },
      {
        name: '产品管理',
        url: '/apps',
        iClass: 'anticon-appstore-o'
      }
    ]
  },
  {
    roleId: 2,
    roleName: '产品管理员',
    menuList: [
      {
        name: '版本管理',
        url: '/versions',
        iClass: 'anticon-api'
      },
      {
        name: '成员管理',
        url: '/members',
        iClass: 'anticon-team'
      },
      {
        name: '产品管理',
        url: '/apps',
        iClass: 'anticon-appstore-o'
      }
    ]
  },
  {
    roleId: 3,
    roleName: '产品开发者',
    menuList: [
      {
        name: '版本管理',
        url: '/versions',
        iClass: 'anticon-api'
      },
      {
        name: '成员管理',
        url: '/members',
        iClass: 'anticon-team'
      },
      {
        name: '产品管理',
        url: '/apps',
        iClass: 'anticon-appstore-o'
      }
    ]
  },
  {
    roleId: 4,
    roleName: '产品体验者',
    menuList: [
      {
        name: '版本管理',
        url: '/versions',
        iClass: 'anticon-api'
      },
      {
        name: '成员管理',
        url: '/members',
        iClass: 'anticon-team'
      },
      {
        name: '产品管理',
        url: '/apps',
        iClass: 'anticon-appstore-o'
      }
    ]
  }
];
@Injectable()
export class HomeService {
    constructor() { }
    public getRoleConfig(id: string) {
        let roleId = parseInt(id);
        for(let r of roleConfig){
            if(r.roleId == roleId){
                return r.menuList;
            }
        }
    }
}