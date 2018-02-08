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
        let resData = result.resData;
        if (_.isArray(resData) && resData.length) {
            //获取团队信息成功后，再计算今天是第几周
            var nWeek = weeklyReportUtils.getNWeekOfYear(new Date());
            for (var i = nWeek - 1; i > 0; i--) {
                this.teamList.list = _.map(resData, (item) => {
                    //得到团队描述的列表
                    this.teamDescArr.push({
                        teamDsc: item.group_name + Intl.get("weekly.report.statics.report", "第{n}周统计周报", {n: i}),
                        teamId: item.group_id,
                        nWeek: i
                    });
                    this.initialTeamDescArr = $.extend(true, [], this.teamDescArr);
                    //得到团队的列表，只需要一次就可以
                    if (i === nWeek - 1) {
                        return {
                            name: item.group_name,
                            id: item.group_id
                        }
                    }

                });
            }
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
function removeEmptyArrayEle(arr){
    for(var i = 0; i < arr.length; i++) {
        if(arr[i] == undefined) {
            arr.splice(i,1);
            i = i - 1; // i - 1 ，删除空元素之后，后面的元素要向前补位，这样才能去掉连续为空的元素
        }
    }
};
//设置当前要查看详情的申请
weeklyReportStore.prototype.changeSearchInputValue = function (value) {
    this.searchKeyword = value;
    var keyWordArr = value.trim().split(" ");
    removeEmptyArrayEle(keyWordArr);
    //去除查询条件中值为空的项
    this.teamDescArr = _.filter(this.initialTeamDescArr, (teamItem) => {
        var isFilterDes = 0;
        //如果搜索的关键词是用空格隔开，把每个关键词都检查一遍
        for (var i = 0; i < keyWordArr.length; i++) {
            var keyword = keyWordArr[i];
            if (teamItem.teamDsc.indexOf(keyword) > -1){
                isFilterDes++;
            }
        }
        return isFilterDes === keyWordArr.length;
    });
    //选定的团队周报是数组的第一个，下标为0
    this.selectedReportItem = this.teamDescArr[0];
    this.selectedReportItemIdx = 0;

};

module.exports = alt.createStore(weeklyReportStore, 'weeklyReportStore');