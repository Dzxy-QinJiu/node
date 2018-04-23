var weeklyReportActions = require("../action/weekly-report-actions");
import weeklyReportUtils from "../utils/weekly-report-utils";
function weeklyReportStore() {
    this.setInitState();
    this.bindActions(weeklyReportActions);
}

//设置初始化数据
weeklyReportStore.prototype.setInitState = function () {
    // 团队数据
    this.teamList = {
        loading:true,
        list: [],
        errMsg: ''  // 获取失败的提示
    };
    // 成员数据
    this.memberList = {
        list: [],
        errMsg: '' // 获取失败的提示
    };
    this.teamDescArr = [];//团队周报标题描述的列表
    this.initialTeamDescArr = [];//全部的团队周报描述列表
    this.selectedReportItem = {};//选中的团队周报
    this.selectedReportItemIdx = -1;//选中的团队周报下标
    this.searchKeyword = "";//搜索的关键词
};

// 获取团队信息
// 获取团队信息成功后，再组合数据
weeklyReportStore.prototype.getSaleGroupTeams = function (result) {
    this.teamList.loading = result.loading;
    if (result.error) {
        this.teamList.errMsg = result.errMsg;
    } else if (result.resData) {
        this.teamList.errMsg = '';
        let resData = _.filter(result.resData,(item)=>{
            return item.manager_ids;
        });
        if (_.isArray(resData) && resData.length) {
            //获取团队信息成功后，再计算今天是第几周
            var nWeek = moment(new Date()).week();
            for (var i = nWeek - 1; i > 0; i--) {
                this.teamList.list = resData;
                _.map(resData, (item, index) => {
                    //得到团队描述的列表
                    this.teamDescArr.push({
                        teamDsc: item.group_name + Intl.get("weekly.report.statics.report", "第{n}周统计周报", {n: i}),
                        teamId: item.group_id,
                        nWeek: i
                    });
                });
            }
            //把描述进行备份
            this.initialTeamDescArr = $.extend(true, [], this.teamDescArr);
            //选定的团队周报是数组的第一个，下标为0
            this.selectedReportItem = this.teamDescArr[0];
            this.selectedReportItemIdx = 0;
        }
    }
};

// 获取成员信息
weeklyReportStore.prototype.getSaleMemberList = function (result) {
    if (result.error) {
        this.memberList.errMsg = result.errMsg;
    } else if (result.resData) {
        this.memberList.errMsg = '';
        let resData = result.resData;
        let memberList = [];
        if (_.isArray(resData) && resData.length) {
            _.each(resData, (item) => {
                if (item.status) {
                    memberList.push({name: item.nick_name, id: item.user_id, user_name: item.user_name});
                }
            });
        }
        this.memberList.list = memberList;
    }
};


//清空数据
weeklyReportStore.prototype.clearData = function () {
    this.applyListObj.list = [];
    this.selectedReportItem = {};
    this.selectedReportItemIdx = -1;
};
//设置当前要查看详情的申请
weeklyReportStore.prototype.setSelectedWeeklyReportItem = function ({obj, idx}) {
    this.selectedReportItem = obj;
    this.selectedReportItemIdx = idx;
};
//去除数组中为空的
function removeEmptyArrayEle(arr){
     _.filter(arr,(item)=>{
        return !item;
    });
}
//设置当前要查看详情的申请
weeklyReportStore.prototype.changeSearchInputValue = function (value) {
    this.searchKeyword = value;
    //把搜索的关键词按空格进行分割
    var keyWordArr = value.trim().split(" ");
    //去除查询条件中值为空的项
    removeEmptyArrayEle(keyWordArr);
    this.teamDescArr = _.filter(this.initialTeamDescArr, (teamItem) => {
        var isFilterDes = 0;
        //如果搜索的关键词是用空格隔开，把每个关键词都检查一遍
        for (var i = 0; i < keyWordArr.length; i++) {
            var keyword = keyWordArr[i];
            if (teamItem.teamDsc.indexOf(keyword) > -1){
                isFilterDes++;
            }
        }
        //这里是考虑了关键字中有空格的情况，比如 南部 8 ，这样实际要index南部 和index 8 都存在才可以展示
        return isFilterDes === keyWordArr.length;
    });
    //选定的团队周报是数组的第一个，下标为0
    this.selectedReportItem = this.teamDescArr[0];
    this.selectedReportItemIdx = 0;
};

module.exports = alt.createStore(weeklyReportStore, 'weeklyReportStore');