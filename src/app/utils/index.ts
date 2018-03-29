export default class Utils {
  static deepClone(list) {
    return JSON.parse(JSON.stringify(list));
  };

  static sortPackageByVersionType(array, type) {
    return array.filter(item => item.versionType === type);
  }

  static getFormData(object: object) {
    let formData = new URLSearchParams();
    for (let key in object) {
      formData.append(key, object[key]);
    }
    return formData;
  }
}
