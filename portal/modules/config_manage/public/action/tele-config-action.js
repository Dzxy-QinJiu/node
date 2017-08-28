/**
 *  客服电话配置action文件
 * */
var TeleConfigAjax = require('../ajax/tele-config-ajax');
import { message } from "antd";

function TeleConfigActions(){
    this.generateActions(
        'getTeleList', 
        'delTele'
    );
    
    //获取客服电话列表 
    this.getTeleList = function(param){
        var _this = this;
        _this.dispatch({loading:true});
        TeleConfigAjax.getTeleList(param)
        .then(function (data) {
            _this.dispatch({loading:false,error:false, data: data});
        },function(errorMsg) {
            _this.dispatch({loading:false,error:true, errorMsg:errorMsg});
        });
    };   

    //删除电话
    this.delTele = function(param){
        var _this = this;
        _this.dispatch({loading:true});
        TeleConfigAjax.delTele(param)
        .then(function (data) {
            _this.dispatch({loading:false,error:false, data: data});
        },function(errorMsg) {
            _this.dispatch({loading:false,error:true, errorMsg:errorMsg});
        });
    };
    

   
}

module.exports = alt.createActions(TeleConfigActions);