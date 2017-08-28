/**
 * App是前端界面使用的应用对象
 * @param obj 服务端返回的应用对象
 */
function App(obj) {
    this.app_id = obj.client_id || '';
    this.app_name = obj.client_name || '';
    this.app_logo = obj.client_logo || '';
}

exports.App = App;