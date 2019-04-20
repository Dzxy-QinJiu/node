/**
 *  IP配置action文件
 * */
var IpConfigAjax = require('../ajax/ip-config-ajax');
import { message } from 'antd';

function IpConfigActions(){
    this.generateActions(
        'getIpConfigList', // 获取IP配置列表
        'getFilterIp', // 获取配置过滤内网信息
        'addIp', // 添加ip
        'deleteIp' // 删除ip
    );

    // 获取IP配置列表
    this.getIpConfigList = function(searchObj){
        var _this = this;
        _this.dispatch({loading: true});
        IpConfigAjax.getIpConfigList(searchObj).then(function(resData) {
            _this.dispatch({loading: false,error: false, resData: resData});
        },function(errorMsg) {
            _this.dispatch({loading: false,error: true, errorMsg: errorMsg});
        });
    };

    this.filterIp = function(status) {
        IpConfigAjax.filterIp(status).then( (result) => {
            if (result) {
                this.dispatch(status);
                message.success(Intl.get('config.filter.ip.succss','过滤内网配置成功！'));
            } else {
                message.error(Intl.get('config.filter.ip.err','过滤内网配置失败！'));
            }
        }, (errorMsg) => {
            message.error(errorMsg || Intl.get('config.filter.ip.err','过滤内网配置失败！'));
        } );
    };

    this.getFilterIp = function() {
        IpConfigAjax.getFilterIp().then( (result) => {
            this.dispatch({error: false, status: result});
        }, (errorMsg) => {
            this.dispatch({error: true, errorMsg: errorMsg });
            message.error(errorMsg || Intl.get('common.get.filter.ip.err','获取配置过滤网段失败！'));
        } );
    };
}

module.exports = alt.createActions(IpConfigActions);