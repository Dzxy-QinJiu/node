import IpConfigAction from '../action/ip-config-action';

class IpConfigStore{
    constructor(){
        this.IpConfigList = []; // IP配置列表
        this.IpConfigloading = false;
        this.getIpConfigErrMsg = ''; // 获取配置信息失败
        this.getFilterIpStatus = ''; // 获取安全域过滤内网网段的状态，true是过滤，false是不过滤
        this.filterErrMsg = ''; // 获取安全域过滤内网失败信息
        this.bindActions(IpConfigAction);
    }
    getIpConfigList(result) {
        if(result.loading){
            this.IpConfigloading = true;
        }else if (result.error) {
            this.IpConfigloading = false;
            this.getIpConfigErrMsg = result.errorMsg;
        } else {
            this.IpConfigloading = false;
            this.getIpConfigErrMsg = '';
            var ipList = _.isArray(result.resData) ? result.resData : [];
            this.IpConfigList = ipList;
        }
    }

    getFilterIp(result) {
        if (result.error) {
            this.filterErrMsg = result.errorMsg;
        }else {
            this.getFilterIpStatus = result.status;
        }
    }

    filterIp(result) {
        this.getFilterIpStatus = result;
    }

    addIp(addIpObj) {
        this.IpConfigList.unshift(addIpObj);
    }

    deleteIp(id) {
        this.IpConfigList = _.filter( this.IpConfigList, item => item.id !== id );
    }
}

//使用alt导出store
export default alt.createStore(IpConfigStore , 'IpConfigStore');