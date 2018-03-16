var AppUserUtil = require("../util/app-user-util");
var UserApplyActions = require("../action/user-apply-actions");
const FORMAT = oplateConsts.DATE_FORMAT;
import userData from "PUB_DIR/sources/user-data";

//用户审批界面使用的store
function UserApplyStore() {
    //初始化state数据
    this.resetState();
    //绑定action
    this.bindActions(UserApplyActions);
}

//初始化数据
UserApplyStore.prototype.resetState = function () {
    //申请列表
    this.applyListObj = {
        // "" loading error
        loadingResult: "loading",
        //获取的列表
        list: [],
        //错误信息
        errorMsg: ""
    };
    this.pageSize = 20;//一次获取的条数
    this.lastApplyId = "";//下拉加载数据时所需前一次获取的最后一个申请的id
    //默认进去显示"申请列表"，筛选过后，再显示具体的标签
    this.ifClickedFilterLabel = false;
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
    //筛选类别 all(全部) pass(已通过) reject(已驳回)  false(待审批)
    this.applyListType = 'all';
    //是否显示更新数据提示
    this.showUpdateTip = false;
    // 下拉加载
    this.listenScrollBottom = true;
    //记录所有apps
    this.allApps = [];
    //有未读回复的列表
    this.unreadReplyList = [];
};
//刷新未读回复列表;
UserApplyStore.prototype.refreshUnreadReplyList = function (unreadReplyList) {
    this.unreadReplyList = _.isArray(unreadReplyList) ? unreadReplyList : [];
};
//清除未读回复列表中已读的回复
UserApplyStore.prototype.clearUnreadReplyById = function (applyId) {
    const APPLY_UNREAD_REPLY = "apply_unread_reply";
    let userId = userData.getUserData().user_id;
    //获取sessionStorage中该用户的未读回复列表
    let applyUnreadReply = sessionStorage.getItem(APPLY_UNREAD_REPLY);
    if (applyUnreadReply) {
        let applyUnreadReplyObj = JSON.parse(applyUnreadReply);
        let applyUnreadReplyList = _.isArray(applyUnreadReplyObj[userId]) ? applyUnreadReplyObj[userId] : [];
        console.log(applyUnreadReplyList);
        applyUnreadReplyList = _.filter(applyUnreadReplyList, reply => reply.apply_id != applyId);
        console.log(applyUnreadReplyList);
        sessionStorage.setItem(APPLY_UNREAD_REPLY, JSON.stringify(applyUnreadReplyList));
        this.refreshUnreadReplyList(applyUnreadReplyList);
    }
};
//是否显示更新数据提示,flag:true/false
UserApplyStore.prototype.setShowUpdateTip = function (flag) {
    this.showUpdateTip = flag;
};
//清空数据
UserApplyStore.prototype.clearData = function () {
    this.applyListObj.list = [];
    this.selectedDetailItem = {};
    this.selectedDetailItemIdx = -1;
    this.listenScrollBottom = false;
};
//获取申请列表
UserApplyStore.prototype.getApplyList = function (obj) {
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
            this.lastApplyId = this.applyListObj.list.length ? _.last(this.applyListObj.list).id : "";
            this.listenScrollBottom = this.applyListObj.list.length < this.totalSize;
        } else if (!this.lastApplyId) {//获取第一页就没有数据时
            this.clearData();
        }
    }
};
//根据id获取申请（通过邮件中的链接查看申请时）
UserApplyStore.prototype.getApplyById = function (obj) {
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
UserApplyStore.prototype.setLastApplyId = function (applyId) {
    this.lastApplyId = applyId;
    this.listenScrollBottom = true;
};

//更改用户审批筛选类型
UserApplyStore.prototype.changeApplyListType = function (type) {
    this.applyListType = type;
    this.lastApplyId = "";
    this.ifClickedFilterLabel = true;
    this.showUpdateTip = false;
};

//输入框的值改变
UserApplyStore.prototype.changeSearchInputValue = function (value) {
    this.searchKeyword = value;
    this.lastApplyId = "";
    this.showUpdateTip = false;
};

//设置当前要查看详情的申请
UserApplyStore.prototype.setSelectedDetailItem = function ({obj, idx}) {
    this.selectedDetailItem = obj;
    this.selectedDetailItemIdx = idx;
};
//使用alt导出store
module.exports = alt.createStore(UserApplyStore, 'UserApplyStore');