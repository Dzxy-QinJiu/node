/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/8/8.
 */
var UserAbnormalLoginAction = require('../action/user-abnormal-login-actions');
function UserAbnormalLoginStore(){
    //初始化state数据
    this.resetState();
    //绑定action
    this.bindActions(UserAbnormalLoginAction);
}
UserAbnormalLoginStore.prototype.resetState = function() {
    this.abnormalLoginList = [];//异常登录展示的列表
    this.abnormalLoginLoading = true;//是否正在加载异常登录
    this.abnormalLoginErrMsg = '';//加载错误后的提示信息
    this.page_size = 10;//加载记录每页的条数
    this.appId = '';//选中app的id
    this.listenScrollBottom = true;//是否监听下拉加载
    this.isNoMoreTipShow = false;//是否显示没有更多数据了
};
UserAbnormalLoginStore.prototype.getUserAbnormalLogin = function(result) {
    if (result.loading){
        this.abnormalLoginLoading = true;
    } else if (result.error){
        this.abnormalLoginLoading = false;
        this.abnormalLoginErrMsg = result.errorMsg || Intl.get('fail.to.get.record','获取用户变更记录失败');
        this.abnormalLoginList = [];
    } else {
        this.abnormalLoginLoading = false;
        this.abnormalLoginErrMsg = '';
        if (result.data.length < this.page_size){
            this.listenScrollBottom = false;
            this.isNoMoreTipShow = true;
        }
        this.abnormalLoginList = this.abnormalLoginList.concat(result.data || []);
    }
};
UserAbnormalLoginStore.prototype.setApp = function(appId) {

    this.abnormalLoginList = [];//变更记录展示的列表
    this.abnormalLoginLoading = true;//是否正在加载变更记录
    this.abnormalLoginErrMsg = '';//加载错误后的提示信息
    this.isNoMoreTipShow = false;
    this.listenScrollBottom = true;
    this.appId = appId;

};

UserAbnormalLoginStore.prototype.deleteAbnormalLoginInfo = function(id) {
    this.abnormalLoginList = _.filter(this.abnormalLoginList, itemLogin => itemLogin.id !== id);
};
module.exports = alt.createStore(UserAbnormalLoginStore , 'UserAbnormalLoginStore');