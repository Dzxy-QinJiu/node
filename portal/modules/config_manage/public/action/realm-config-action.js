/**
 *  IP配置action文件
 * */
var RealmConfigAjax = require('../ajax/realm-config-ajax');
import { message } from "antd";

function RealmConfigActions(){
    this.generateActions(
        'getRealmStrategy', // 获取安全域密码策略配置
        'updateRealmStrategy'
    );
    
    // 获取安全域密码策略配置
    this.getRealmStrategy = function(param){
        var _this = this;
        _this.dispatch({loading: true});
        RealmConfigAjax.getRealmStrategy(param)
            .then(function(data) {
                _this.dispatch({loading: false,error: false, data: data});
            },function(errorMsg) {
                _this.dispatch({loading: false,error: true, errorMsg: errorMsg});
            });
    };

    // 修改
    this.updateRealmStrategy = function(param){
        var _this = this;
        _this.dispatch({loading: true,value: param});
        RealmConfigAjax.updateRealmStrategy(param)
            .then(function(result) {
                _this.dispatch({loading: false,error: false, data: result,value: param});
            },function(errorMsg) {
                _this.dispatch({loading: false,error: true, errorMsg: errorMsg});
            });
    };

   
}

module.exports = alt.createActions(RealmConfigActions);