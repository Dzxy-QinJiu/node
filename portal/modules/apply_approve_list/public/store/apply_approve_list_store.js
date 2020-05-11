import ApplyApproveListActions from '../action/apply_approve_list_action';
import {notificationEmitter} from '../../../../public/sources/utils/emitters';
import {storageUtil} from 'ant-utils';
const session = storageUtil.session;
import {DIFF_APPLY_TYPE_UNREAD_REPLY} from 'PUB_DIR/sources/utils/consts';
import {ALL} from '../utils/apply_approve_utils';
import {INNER_SETTING_FLOW} from 'MOD_DIR/apply_approve_manage/public/utils/apply-approve-utils';
//用户审批界面使用的store
function UserApplyStore() {
    //我的有未读回复的列表
    this.unreadMyReplyList = [];
    //团队有回复的列表
    this.unreadTeamReplyList = [];
    //初始化state数据
    this.resetState();
    //绑定action
    this.bindActions(ApplyApproveListActions);
}

//初始化数据
UserApplyStore.prototype.resetState = function() {
    //申请列表
    this.applyListObj = {
        // "" loading error
        loadingResult: 'loading',
        //获取的列表
        list: [],
        //错误信息
        errorMsg: ''
    };
    this.pageSize = 20;//一次获取的条数
    this.lastApplyId = '';//下拉加载数据时所需前一次获取的最后一个申请的id
    //左侧选中的要查看详情的项
    this.selectedDetailItem = {};
    //选中的查看详情的数组下标
    this.selectedDetailItemIdx = -1;
    //用户审批关键字
    this.searchKeyword = '';
    //保存上次的关键字
    this.oldSearchKeyword = '';
    //默认不显示输入框
    this.searchInputShow = false;
    //筛选状态 all(全部) pass(已通过) reject(已驳回)  ongoing(待审批)
    this.selectedApplyStatus = ALL;
    //筛选审批类型
    this.selectedApplyType = INNER_SETTING_FLOW.NEWUSERAPPLY;
    this.firstLogin = true;//用来记录是否是首次加载
    //是否显示更新数据提示
    this.showUpdateTip = false;
    // 下拉加载
    this.listenScrollBottom = true;
    //记录所有apps
    this.allApps = [];
    // //有未读回复的列表
    //     // this.unreadReplyList = [];
    //处理申请操作失败
    this.dealApplyError = 'success';
    //是否查看未读回复的申请列表
    this.isCheckUnreadApplyList = false;

};
UserApplyStore.prototype.updateAllApplyItemStatus = function(updateItem) {
    var allApplyArr = this.applyListObj.list;
    this.selectedDetailItem.status = updateItem.status;
    var targetObj = _.find(allApplyArr,(item) => {
        return item.id === updateItem.id;
    });
    if (targetObj){
        targetObj.status = updateItem.status;
    }
};
//审批完后更改状态
UserApplyStore.prototype.changeApplyAgreeStatus = function(message) {
    this.selectedDetailItem.status = message.agree;
    this.selectedDetailItem.approve_details = message.approve_details;
    this.selectedDetailItem.update_time = message.update_time;
};
//设置是否查看未读回复的申请列表
UserApplyStore.prototype.setIsCheckUnreadApplyList = function(flag) {
    this.isCheckUnreadApplyList = flag;
    if(flag){
        this.searchKeyword = '';
        this.lastApplyId = '';
        this.showUpdateTip = false;
        this.selectedApplyStatus = ALL;
        this.selectedApplyType = ALL;
    }
};
//刷新未读回复列表;
// UserApplyStore.prototype.refreshUnreadReplyList = function(unreadReplyList) {
//     this.unreadReplyList = _.isArray(unreadReplyList) ? unreadReplyList : [];
// };
UserApplyStore.prototype.refreshMyUnreadReplyList = function(unreadReplyList) {
    this.unreadMyReplyList = _.isArray(unreadReplyList) ? unreadReplyList : [];
};
UserApplyStore.prototype.refreshTeamUnreadReplyList = function(unreadReplyList) {
    this.unreadTeamReplyList = _.isArray(unreadReplyList) ? unreadReplyList : [];
};


/**
 * 清除未读回复申请列表中已读的回复
 * @param applyId：有值时只清除applyId对应的申请，不传时，清除当前登录用户所有的未读回复申请列表
 */
UserApplyStore.prototype.clearUnreadReply = function(applyId) {
    const MY_UNREAD_REPLY = DIFF_APPLY_TYPE_UNREAD_REPLY.MY_UNREAD_REPLY;
    const TEAM_UNREAD_REPLY = DIFF_APPLY_TYPE_UNREAD_REPLY.TEAM_UNREAD_REPLY;
    //获取sessionStorage中该用户的未读回复列表
    let unreadMyReplyList = session.get(MY_UNREAD_REPLY);
    let unreadTeamReplyList = session.get(TEAM_UNREAD_REPLY);
    if (unreadMyReplyList) {
        let applyUnreadReplyList = JSON.parse(unreadMyReplyList) || [];
        //清除某条申请
        if (applyId) {
            applyUnreadReplyList = _.filter(applyUnreadReplyList, reply => reply.id !== applyId);
        }else{//不传时，清除当前登录用户所有的未读回复申请列表
            applyUnreadReplyList = [];
        }
        this.unreadMyReplyList = applyUnreadReplyList;
        session.set(MY_UNREAD_REPLY, JSON.stringify(applyUnreadReplyList));
        //加延时是为了，避免循环dispatch报错：Cannot dispatch in the middle of a dispatch
        setTimeout(() => {
            notificationEmitter.emit(notificationEmitter.MY_UNREAD_REPLY, applyUnreadReplyList);
        });
    }
    if (unreadTeamReplyList) {
        let applyUnreadReplyList = JSON.parse(unreadTeamReplyList) || [];
        //清除某条申请
        if (applyId) {
            applyUnreadReplyList = _.filter(applyUnreadReplyList, reply => reply.id !== applyId);
        }else{//不传时，清除当前登录用户所有的未读回复申请列表
            applyUnreadReplyList = [];
        }
        this.unreadTeamReplyList = applyUnreadReplyList;
        session.set(TEAM_UNREAD_REPLY, JSON.stringify(applyUnreadReplyList));
        //加延时是为了，避免循环dispatch报错：Cannot dispatch in the middle of a dispatch
        setTimeout(() => {
            notificationEmitter.emit(notificationEmitter.TEAM_UNREAD_REPLY, applyUnreadReplyList);
        });
    }
};
//是否显示更新数据提示,flag:true/false
UserApplyStore.prototype.setShowUpdateTip = function(flag) {
    this.showUpdateTip = flag;
};
//获取由我发起的申请
UserApplyStore.prototype.getApplyListStartSelf = function(obj){
    this.handleApplyLists(obj);
};
//获取所有申请列表
UserApplyStore.prototype.getAllApplyLists = function(obj) {
    this.handleApplyLists(obj);
};
//获取我的申请列表
UserApplyStore.prototype.getMyApplyLists = function(obj) {
    this.handleApplyLists(obj,true);
};
//清空数据
UserApplyStore.prototype.clearData = function() {
    this.applyListObj.list = [];
    this.selectedDetailItem = {};
    this.selectedDetailItemIdx = -1;
    this.listenScrollBottom = false;
};
UserApplyStore.prototype.handleApplyLists = function(obj,flag){
    if (obj.loading) {
        this.applyListObj.loadingResult = 'loading';
        this.applyListObj.errorMsg = '';
    } else if (obj.error) {
        this.applyListObj.loadingResult = 'error';
        this.applyListObj.errorMsg = obj.errorMsg;
        if (!this.lastApplyId) {
            this.clearData();
        }
    } else {
        if(_.get(obj,'data.apply_type')){
            this.selectedApplyType = _.get(obj,'data.apply_type');
        }
        this.applyListObj.loadingResult = '';
        this.applyListObj.errorMsg = '';
        this.totalSize = obj.data.total;//todo 我的审批的总值是不对的，页面暂时不展示
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
            //如果是我的审批，listenScrollBottom要一直保持是true
            if(flag){
                this.firstLogin = false;
                if(_.get(applyList,'length') < this.pageSize){
                    this.listenScrollBottom = false;
                }else{
                    this.listenScrollBottom = true;
                }

            }else{
                this.listenScrollBottom = this.applyListObj.list.length < this.totalSize;
            }

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



//根据id获取申请（通过邮件中的链接查看申请时）
UserApplyStore.prototype.getApplyById = function(obj) {
    if (obj.error) {
        this.applyListObj.loadingResult = 'error';
        this.applyListObj.errorMsg = obj.errorMsg;
    } else {
        if (obj.loading) {
            this.applyListObj.loadingResult = 'loading';
            this.applyListObj.errorMsg = '';
        } else {
            this.applyListObj.loadingResult = '';
            this.applyListObj.list = this.applyListObj.list.concat(obj.data.detail);
            //获取单个申请时，走的获取申请详情的接口，这里记录下获取回来的所有app的信息
            this.allApps = obj.data.apps;
            this.selectedDetailItem = this.applyListObj.list[0];
            this.selectedDetailItemIdx = 0;
            this.totalSize = 1;
            this.applyListObj.errorMsg = '';
            this.listenScrollBottom = false;
        }
    }
};
//分页改变
UserApplyStore.prototype.setLastApplyId = function(applyId) {
    this.lastApplyId = applyId;
    this.listenScrollBottom = true;
};

UserApplyStore.prototype.afterAddApplySuccess = function(item) {
    this.applyListObj.list.unshift(item);
    this.selectedDetailItem = item;
    this.selectedDetailItemIdx = 0;
    this.totalSize++;
};
//更改用户审批筛选类型
UserApplyStore.prototype.changeApplyStatus = function(type) {
    this.selectedApplyStatus = type;
    this.lastApplyId = '';
    this.showUpdateTip = false;
    this.isCheckUnreadApplyList = false;
};
//修改查询申请审批的类型
UserApplyStore.prototype.changeApplyType = function(type){
    this.selectedApplyType = type;
    this.lastApplyId = '';
    this.isCheckUnreadApplyList = false;
    this.showUpdateTip = false;
};

//输入框的值改变
UserApplyStore.prototype.changeSearchInputValue = function(value) {
    this.searchKeyword = value;
    this.lastApplyId = '';
    this.showUpdateTip = false;
    this.isCheckUnreadApplyList = false;
};


//设置当前要查看详情的申请
UserApplyStore.prototype.setSelectedDetailItem = function({obj, idx}) {
    this.selectedDetailItem = obj;
    this.selectedDetailItemIdx = idx;
};
//更新处理申请错误的状态,"success"或者"error"
UserApplyStore.prototype.updateDealApplyError = function(status) {
    this.dealApplyError = status;
};

UserApplyStore.prototype.backApplySuccess = function({id, approval_state, isConsumed}) {
    this.applyListObj.list.forEach((x, idx) => {
        if (x.id === id) {
            this.applyListObj.list[idx].approval_state = approval_state;
            this.applyListObj.list[idx].isConsumed = isConsumed;
        }
    });
};
//成功转出一条审批后的处理，如果当前展示的是待审批列表
UserApplyStore.prototype.afterTransferApplySuccess = function(targetId) {
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
//使用alt导出store
module.exports = alt.createStore(UserApplyStore, 'UserApplyStore');
