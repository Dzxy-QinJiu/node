/**
 * Created by hzl on 2019/3/5.
 */
import MemberApplyAction from '../action/member-apply-action'; 

function MemberApplyStore() {
    //初始化state数据
    this.setInitState();
    this.bindActions(MemberApplyAction);
}
MemberApplyStore.prototype.setInitState = function() {
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
    //由我发起的请假申请
    this.selfApplyList = {
        // "" loading error
        loadingResult: 'loading',
        //获取的列表
        list: [],
        //错误信息
        errorMsg: ''
    };
    //筛选类别 'all'(全部) pass(已通过) reject(已驳回)  ongoing(待我审批)
    this.selectedApplyStatus = 'ongoing';
    //是否显示更新数据提示
    this.showUpdateTip = false;
    this.clearData();
};
//是否显示更新数据提示,flag:true/false
MemberApplyStore.prototype.setShowUpdateTip = function(flag) {
    this.showUpdateTip = flag;
};
//清空数据
MemberApplyStore.prototype.clearData = function() {
    this.applyListObj.list = [];
    this.selectedDetailItem = {};
    this.selectedDetailItemIdx = -1;
    this.listenScrollBottom = false;
};
MemberApplyStore.prototype.getAllMemberApplyList = function(obj) {
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
        } else {//下拉加载取得数据为空时需要取消下拉加载得处理（以防后端得total数据与真实获取得数据列表不一致时，一直触发下拉加载取数据得死循环问题）
            this.listenScrollBottom = false;
        }
    }
};
MemberApplyStore.prototype.setSelectedDetailItem = function({obj, idx}) {
    this.selectedDetailItem = obj;
    this.selectedDetailItemIdx = idx;
};
MemberApplyStore.prototype.changeApplyListType = function(type) {
    this.selectedApplyStatus = type;
    this.lastApplyId = '';
    this.showUpdateTip = false;
};
MemberApplyStore.prototype.setLastApplyId = function(applyId) {
    this.lastApplyId = applyId;
    this.listenScrollBottom = true;
};
MemberApplyStore.prototype.changeApplyAgreeStatus = function(message) {
    this.selectedDetailItem.status = message.agree;
    this.selectedDetailItem.approve_details = message.approve_details;
    this.selectedDetailItem.update_time = message.update_time;
};
MemberApplyStore.prototype.updateAllApplyItemStatus = function(updateItem) {
    var allApplyArr = this.applyListObj.list;
    this.selectedDetailItem.status = updateItem.status;
    var targetObj = _.find(allApplyArr,(item) => {
        return item.id === updateItem.id;
    });
    if (targetObj){
        targetObj.status = updateItem.status;
    }
};
MemberApplyStore.prototype.afterAddApplySuccess = function(item) {
    this.applyListObj.list.unshift(item);
    this.selectedDetailItem = item;
    this.selectedDetailItemIdx = 0;
    this.totalSize++;
};
//成功转出一条审批后的处理，如果当前展示的是待审批列表
MemberApplyStore.prototype.afterTransferApplySuccess = function(targetId) {
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


module.exports = alt.createStore(MemberApplyStore, 'MemberApplyStore');
