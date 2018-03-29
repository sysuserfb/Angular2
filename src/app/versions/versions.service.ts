import { Injectable } from '@angular/core';
import { Http, Headers, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Injectable()
export class VersionService {
  debug = false;
  public config: any = {
    domain: 'http://localhost:3000',
    url: {
      /* 资源包获取相关接口 */
      'getPackagesList': '/api/getPackagesList',
      'getPackageInfo': '/api/getPackageInfo',

      /* 资源包操作相关接口 */
      'deletePackages': '/api/deletePackages',
      'publishPackageToEXP': '/api/publishPackageToEXP',
      'publishPackageToPRO': '/api/publishPackageToPRO',
      'approvePackage': '/api/approvePackage',

      /* 资源包上传相关接口 */
      'getVersionsList': '/api/getVersionsList',
      'uploadPackage': '/api/uploadPackage',
      'updatePackageInfo': '/api/updatePackageInfo'
    }
  };

  constructor(private http: Http) { }

  public getPackageList(appId: string, versionType: string, itemsPerPage: string, currentPage: string): Observable<any> {
    const URL = this.config.domain + this.config.url.getPackagesList;
    let data = {
      params: {
        'appId': appId,
        'versionType': versionType,
        'itemsPerPage': itemsPerPage || 10,
        'currentPage': currentPage || 1
      }
    };

    if (this.debug === true) {
      return this.http.get(`/assets/data/package-list-${versionType.toLowerCase()}.json`).map(res => res.json());
    } else {
      return this.http.get(URL, data).map(res => res.json());
    }
  }

  public getPackageInfo(packageId: string): Observable<any> {
    const URL = this.config.domain + this.config.url.getPackageInfo;
    let data = {
      params: { 'packageId': packageId }
    };
    if (this.debug === true) {
      return this.http.get(`/assets/data/package-info.json`).map(res => res.json());
    } else {
      return this.http.get(URL, data).map(res => res.json());
    }
  }

  public deletePackages(packageIdString: string): Observable<any> {
    const URL = this.config.domain + this.config.url.deletePackages;
    let headers = new Headers(),
        data    = new URLSearchParams();

    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    data.append('packageIds', packageIdString);

    if (this.debug === true) {
      return this.http.get('/assets/data/delete-package.json').map(res => res.json());
    } else {
      return this.http.post(URL, data, { headers: headers }).map(res => res.json());
    }
  }

  public publishPackageToEXP(packageInfo: any): Observable<any> {
    const URL = this.config.domain + this.config.url.publishPackageToEXP;
    let headers = new Headers(),
        data    = new URLSearchParams();

    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    for (let key in packageInfo) {
      data.append(key, packageInfo[key]);
    }
    if (this.debug === true) {
      return this.http.get('/assets/data/update-status.json').map(res => res.json());
    } else {
      return this.http.post(URL, data, { headers: headers }).map(res => res.json());
    }
  }

  public publishPackageToPRO(packageInfo: any): Observable<any> {
    const URL = this.config.domain + this.config.url.publishPackageToPRO;
    let headers = new Headers(),
        data    = new URLSearchParams();

    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    for (let key in packageInfo) {
      data.append(key, packageInfo[key]);
    }
    if (this.debug === true) {
      return this.http.get('/assets/data/update-status.json').map(res => res.json());
    } else {
      return this.http.post(URL, data, { headers: headers }).map(res => res.json());
    }
  }

  public approvePackage(packageInfo: any): Observable<any> {
    const URL = this.config.domain + this.config.url.approvePackage;
    let headers = new Headers(),
        data    = new URLSearchParams();

    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    for (let key in packageInfo) {
      data.append(key, packageInfo[key]);
    }
    if (this.debug === true) {
      return this.http.get('/assets/data/approve-package.json').map(res => res.json());
    } else {
      return this.http.post(URL, data, { headers: headers }).map(res => res.json());
    }
  }

  public getVersionsList(packageInfo: any): Observable<any> {
    const URL = this.config.domain + this.config.url.getVersionsList;

    if (this.debug === true) {
      return this.http.get('/assets/data/version-list.json').map(res => res.json());
    } else {
      return this.http.get(URL, packageInfo).map(res => res.json());
    }
  }

  public updatePackageInfo(packageInfo: any): Observable<any> {
    const URL = this.config.domain + this.config.url.updatePackageInfo;
    let headers = new Headers(),
        data    = new URLSearchParams();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    for (let key in packageInfo) {
      data.append(key, packageInfo[key]);
    }

    if (this.debug === true) {
      return this.http.get('/assets/data/upload-package-info.json').map(res => res.json());
    } else {
      return this.http.post(URL, data, { headers: headers }).map((res: Response) => {return res.json();});
    }
  }
}
