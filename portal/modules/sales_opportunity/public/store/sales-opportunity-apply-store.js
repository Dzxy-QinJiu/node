/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/10.
 */

var notificationEmitter = require('PUB_DIR/sources/utils/emitters').notificationEmitter;
import {storageUtil} from 'ant-utils';
const session = storageUtil.session;
var SalesOpportunityApplyAction = require('../action/sales-opportunity-apply-action');
import {DIFF_APPLY_TYPE_UNREAD_REPLY} from 'PUB_DIR/sources/utils/consts';
function SalesOpportunityApplyStore() {
    //初始化state数据
    this.setInitState();
    this.bindActions(SalesOpportunityApplyAction);
}
SalesOpportunityApplyStore.prototype.setInitState = function() {
    this.sort_field = 'create_time';//排序字段
    this.status = '';//请假申请的状态
    this.order = 'descend';
    this.page_size = 20;
    //所有申请列表
    this.applyListObj = {
        // "" loading error
        loadingResult: 'loading',
        //获取的列表
        list: [],
        //错误信息
        errorMsg: ''
    };
    this.lastApplyId = '';
    //由我发起的销售机会申请
    this.selfApplyList = {
        // "" loading error
        loadingResult: 'loading',
        //获取的列表
        list: [],
        //错误信息
        errorMsg: ''
    };
    //筛选类别 'all'(全部) pass(已通过) reject(已驳回)  ongoing(待我审批) cancel(已撤销)
    this.applyListType = 'ongoing';
    //是否显示更新数据提示
    this.showUpdateTip = false;
    //是否查看未读回复的申请列表
    this.isCheckUnreadApplyList = false;
    this.clearData();
};
//设置是否查看未读回复的申请列表
SalesOpportunityApplyStore.prototype.setIsCheckUnreadApplyList = function(flag) {
    this.isCheckUnreadApplyList = flag;
};
//是否显示更新数据提示,flag:true/false
SalesOpportunityApplyStore.prototype.setShowUpdateTip = function(flag) {
    this.showUpdateTip = flag;
};
//清空数据
SalesOpportunityApplyStore.prototype.clearData = function() {
    this.applyListObj.list = [];
    this.selectedDetailItem = {};
    this.selectedDetailItemIdx = -1;
    this.listenScrollBottom = false;
};
SalesOpportunityApplyStore.prototype.getAllSalesOpportunityApplyList = function(obj) {
    if (obj.loading) {
        this.applyListObj.loadingResult = 'loading';
        this.applyListObj.errorMsg = '';
    } else if (obj.error) {
        this.applyListObj.loadingResult = 'error';
        this.applyListObj.errorMsg = obj.errMsg;
        //获取由我审批的
        if (!this.lastApplyId) {
            this.clearData();
        }
    } else {
        //由我审批的申请列表
        this.applyListObj.loadingResult = '';
        this.applyListObj.errorMsg = '';
        this.totalSize = obj.data.total;
        let applyList = obj.data.list;
        if (_.isArray(applyList) && applyList.length) {
            if (this.lastApplyId) {//下拉加载数据时
                this.applyListObj.list = this.applyListObj.list.concat(applyList);
            } else {//首次获取数据时
                this.applyListObj.list = applyList;
                this.selectedDetailItem = applyList[0];
                this.selectedDetailItemIdx = 0;
            }
            this.lastApplyId = this.applyListObj.list.length ? _.last(this.applyListObj.list).id : '';
            this.listenScrollBottom = this.applyListObj.list.length < this.totalSize;
        } else if (!this.lastApplyId) {//获取第一页就没有数据时
            this.clearData();
            //获取的未读回复列表为空时，清除sessionStore中存的未读回复的申请
            if (this.isCheckUnreadApplyList) {
                this.clearUnreadReply();
            }
        } else {//下拉加载取得数据为空时需要取消下拉加载得处理（以防后端得total数据与真实获取得数据列表不一致时，一直触发下拉加载取数据得死循环问题）
            this.listenScrollBottom = false;
        }
    }
};
/**
 * 清除未读回复申请列表中已读的回复
 * @param applyId：有值时只清除applyId对应的申请，不传时，清除当前登录用户所有的未读回复申请列表
 */
SalesOpportunityApplyStore.prototype.clearUnreadReply = function(applyId) {
    const APPLY_UNREAD_REPLY = DIFF_APPLY_TYPE_UNREAD_REPLY.DIFF_APPLY_UNREAD_REPLY;
    //获取sessionStorage中该用户的未读回复列表
    let unreadReplyList = session.get(APPLY_UNREAD_REPLY);
    if (unreadReplyList) {
        let applyUnreadReplyList = JSON.parse(unreadReplyList) || [];
        //清除某条申请
        if (applyId) {
            applyUnreadReplyList = _.filter(applyUnreadReplyList, reply => reply.apply_id !== applyId);
        }
        this.unreadReplyList = applyUnreadReplyList;
        session.set(APPLY_UNREAD_REPLY, JSON.stringify(applyUnreadReplyList));
        //加延时是为了，避免循环dispatch报错：Cannot dispatch in the middle of a dispatch
        setTimeout(() => {
            notificationEmitter.emit(notificationEmitter.DIFF_APPLY_UNREAD_REPLY, applyUnreadReplyList);
        });
    }
};
//刷新未读回复列表;
SalesOpportunityApplyStore.prototype.refreshUnreadReplyList = function(unreadReplyList) {
    this.unreadReplyList = _.isArray(unreadReplyList) ? unreadReplyList : [];
};
SalesOpportunityApplyStore.prototype.setSelectedDetailItem = function({obj, idx}) {
    this.selectedDetailItem = obj;
    this.selectedDetailItemIdx = idx;
};
SalesOpportunityApplyStore.prototype.changeApplyListType = function(type) {
    this.applyListType = type;
    this.lastApplyId = '';
    this.showUpdateTip = false;
    this.isCheckUnreadApplyList = false;
};
SalesOpportunityApplyStore.prototype.setLastApplyId = function(applyId) {
    this.lastApplyId = applyId;
    this.listenScrollBottom = true;
};
SalesOpportunityApplyStore.prototype.changeApplyAgreeStatus = function(message) {
    this.selectedDetailItem.status = message.agree;
    this.selectedDetailItem.approve_details = message.approve_details;
    this.selectedDetailItem.update_time = message.update_time;
};
SalesOpportunityApplyStore.prototype.updateAllApplyItemStatus = function(updateItem) {
    var allApplyArr = this.applyListObj.list;
    this.selectedDetailItem.status = updateItem.status;
    var targetObj = _.find(allApplyArr,(item) => {
        return item.id === updateItem.id;
    });
    if (targetObj){
        targetObj.status = updateItem.status;
    }
};
SalesOpportunityApplyStore.prototype.afterAddApplySuccess = function(item) {
    this.applyListObj.list.unshift(item);
    this.selectedDetailItem = item;
    this.selectedDetailItemIdx = 0;
    this.totalSize++;
};
//成功转出一条审批后的处理，如果当前展示的是待审批列表
SalesOpportunityApplyStore.prototype.afterTransferApplySuccess = function(targetId) {
    //查到该条记录
    var targetIndex = _.findIndex(this.applyListObj.list, item => item.id === targetId);
    //删除转出的这一条后，展示前面的或者后面的那一条审批
    if (targetIndex === 0){
        if (this.applyListObj.list.length > targetIndex + 1){
            this.selectedDetailItem = _.get(this,`applyListObj.list[${targetIndex + 1}]`);
            this.selectedDetailItemIdx = targetIndex;
            this.applyListObj.list.splice(targetIndex,1);
            this.totalSize -= 1;
        }else{
            this.applyListObj.list = [];
            this.selectedDetailItem = {};
            this.selectedDetailItemIdx = -1;
            this.totalSize = 0;
        }
    }else if (targetIndex > 0){
        this.selectedDetailItem = _.get(this,`applyListObj.list[${targetIndex - 1}]`);
        this.selectedDetailItemIdx = targetIndex - 1;
        this.applyListObj.list.splice(targetIndex,1);
        this.totalSize -= 1;
    }
};


module.exports = alt.createStore(SalesOpportunityApplyStore, 'SalesOpportunityApplyStore');