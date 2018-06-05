import OnlineUserListAction from '../action/list';
var _ = require('underscore');

//存储在线用户列表
function OnlineUserListStore() {
    this.resetState();
    //绑定action
    this.bindActions(OnlineUserListAction);
}
OnlineUserListStore.prototype.resetState = function() {
    //应用列表
    this.appList = [];
    this.resetUserOnlineList();
};
OnlineUserListStore.prototype.resetUserOnlineList = function() {
    //在线用户列表
    this.onlineUserList = [];
    //用户总数
    this.total = 0;
    //每页多少条
    this.pageSize = 10;
    //当前第几页
    this.pageNum = 1;
    //是否在加载数据
    this.isLoading = true;
    //是否是初次加载
    this.isFirstTimeLoading = true;
    //是否加载出错
    this.appListErrorMsg = '';
};
OnlineUserListStore.prototype.handleRefresh = function() {
    this.resetUserOnlineList();
};
//获取在线用户列表
OnlineUserListStore.prototype.getOnlineUserList = function(result) {
    if (result.loading) {
        this.isLoading = true;
        this.appListErrorMsg = '';
    } else if (result.error) {
        this.isLoading = false;
        this.appListErrorMsg = result.error;
    } else {
        this.isLoading = false;
        this.appListErrorMsg = '';
        this.isFirstTimeLoading = false;

        var data = result.data;
        this.onlineUserList = _.isArray(data.list) ? data.list : [];
        this.total = data.total;
        //在线用户分页修复
        if (this.onlineUserList.length === 0) {
            this.total = 0;
        }
    }
};
//翻页
OnlineUserListStore.prototype.setPageNum = function(pageNum) {
    this.pageNum = pageNum;
};

//监听Action的kickUser方法
OnlineUserListStore.prototype.kickUser = function(ids) {
    let user_id = ids.user_ids[0];
    this.onlineUserList = _.filter(this.onlineUserList, (item) => {
        return item.user_id != user_id;
    } );
    this.total -= 1;
};


module.exports = alt.createStore(OnlineUserListStore, 'OnlineUserListStore');
