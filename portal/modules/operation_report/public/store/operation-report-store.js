var OperationReportActions = require('../action/operation-report-action');

//用户分析
function OperationReportStore() {
    //初始化state数据
    this.resetState();
    //绑定action
    this.bindActions(OperationReportActions);
}

//设置store的初始值
OperationReportStore.prototype.resetState = function() {
    this.appList = [];//应用列表
    this.selectAppList = [];//已选择应用的列表
    this.teamList = [];//团队列表
    this.appUserTotal = 0;//各应用用户总数
    //重置统计图数据
    this.resetChartData('loading');
};

//重置统计图数据
OperationReportStore.prototype.resetChartData = function(type) {
    //各应用登录情况的统计
    this.appLoginUserObj = {
        resultType: type || '',
        errorMsg: '',
        total: 0,//共有多少人登录了系统
        lastWeekTotal: 0,//上周共有多少人登录了系统
        data: []
    };
    //各应用新开账号统计
    this.appNewTrialUser = {
        resultType: type || '',
        errorMsg: '',
        total: 0,//本周共有多少新开试用账号
        lastWeekTotal: 0,
        data: []
    };
    //各应用新增延期用户的统计
    this.appNewDelayUser = {
        resultType: type || '',
        errorMsg: '',
        total: 0,//本周共有多少新增延期用户
        lastWeekTotal: 0,
        data: []
    };
    //各应用签约用户数
    this.appSignedUser = {
        resultType: type || '',
        errorMsg: '',
        data: []
    };

    //获取近四周的登录对比
    this.appLoginComparison = {
        resultType: type || '',
        errorMsg: '',
        data: []
    };
    //获取近四周周登录总时长超过1小时的用户数对比
    this.appWeeklyLoginTotalTime = {
        resultType: type || '',
        errorMsg: '',
        data: [],
        total: 0,
        lastWeekTotal: 0
    };
    //获取近四周到期用户的登录对比
    this.appExpiredLoginComparison = {
        resultType: type || '',
        errorMsg: '',
        data: []
    };
    //近四周用户活跃度
    this.userActive = {
        resultType: type || '',
        errorMsg: '',
        data: []
    };
    //用户日活跃度
    this.userDailyActive = {
        resultType: type || '',
        errorMsg: '',
        data: []
    };
    //近四周新开用户对比
    this.appNewUserComparison = {
        resultType: type || '',
        errorMsg: '',
        data: []
    };
    //近四周新增延期用户对比
    this.appNewDelayUserComparison = {
        resultType: type || '',
        errorMsg: '',
        data: []
    };
    //近四周签约用户登录对比
    this.appFormalLoginComparison = {
        resultType: type || '',
        errorMsg: '',
        total: '',//本周共有多少个签约用户登录了系统
        lastWeekTotal: 0,
        data: []
    };
    //各应用签约用户的登录情况团队分布的统计表格
    this.teamSignedLoginUser = {
        resultType: type || '',
        errorMsg: '',
        total: 0,//共有多少个签约用户登录了系统
        data: []
    };
    //各应用用户的登录情况团队分布的统计表格
    this.teamLoginUser = {
        resultType: type || '',
        errorMsg: '',
        data: []
    };
    //应用到期用户登录统计表格数据
    this.teamExpiredLoginUser = {
        resultType: type || '',
        errorMsg: '',
        total: 0,//共有多少个到期用户
        lastWeekTotal: 0,
        data: []
    };
    //到期用户周在线总时长超1小时
    this.expiredUserExceedLoginTime = {
        resultType: type || '',
        errorMsg: '',
        total: 0,//共有多少个到期用户周在线总时长超1小时
        data: []
    };
    //到期用户登录时长超过8小时的统计表数据
    this.teamExpiredUserLoginTime = {
        resultType: type || '',
        errorMsg: '',
        total: 0,//共有多少个到期用户登录时长超过8小时
        lastWeekTotal: 0,
        data: []
    };
    //各部门新开试用账号的统计数据
    this.teamNewTrialUser = {
        resultType: type || '',
        errorMsg: '',
        data: []
    };
    //各部门新增延期用户的统计数据
    this.teamNewDelayUser = {
        resultType: type || '',
        errorMsg: '',
        data: []
    };
    //各部门新开试用账号登录的统计数据
    this.teamNewTrialLoginUser = {
        resultType: type || '',
        errorMsg: '',
        total: 0,//共有多少个新开试用用户
        lastWeekTotal: 0,
        data: []
    };
    //各部门延期用户登录的统计数据
    this.teamNewDelayLoginUser = {
        resultType: type || '',
        errorMsg: '',
        total: 0,//共有多少个登录过的延期用户
        lastWeekTotal: 0,
        data: []
    };
    //获取各部门登录超过1小时的统计表格数据
    this.teamExceedLoginTime = {
        resultType: type || '',
        errorMsg: '',
        total: 0,//共有多少个登录超过1小时用户
        data: []
    };
    //获取各部门登录超过1小时的延期用户统计表格数据
    this.teamDelayUserLoginTime = {
        resultType: type || '',
        errorMsg: '',
        total: 0,//共有多少个登录超过1小时用户
        data: []
    };
};
//选择应用列表的设置
OperationReportStore.prototype.setSelectAppList = function(list) {
    this.selectAppList = list;
};
//获取应用列表
OperationReportStore.prototype.getAppList = function(data) {
    this.appList = _.isArray(data) ? data : [];
};
//获取团队列表
OperationReportStore.prototype.getTeamList = function(data) {
    this.teamList = _.isArray(data) ? data : [];
    //未知团队的添加
    this.teamList.push({teamName: Intl.get("user.unknown", "未知"), teamId: "unknown"});
};

//获取各部门签约用户的登录表格数据
OperationReportStore.prototype.getTeamSignedLoginUser = function(result) {
    if (result.loading) {
        this.teamSignedLoginUser.resultType = 'loading';
        this.teamSignedLoginUser.errorMsg = '';
        this.teamSignedLoginUser.data = [];
    } else if (result.error) {
        this.teamSignedLoginUser.resultType = 'error';
        this.teamSignedLoginUser.errorMsg = result.errorMsg;
        this.teamSignedLoginUser.data = [];
    } else {
        this.teamSignedLoginUser.resultType = '';
        this.teamSignedLoginUser.errorMsg = '';
        this.teamSignedLoginUser.data = this.getTeamTableData(result.data);
        let lastArrayData = _.last(this.teamSignedLoginUser.data);
        this.teamSignedLoginUser.total = lastArrayData ? lastArrayData.total : 0;
    }
};
//获取各应用用户的登录部门分布表格数据
OperationReportStore.prototype.getTeamLoginUser = function(result) {
    if (result.loading) {
        this.teamLoginUser.resultType = 'loading';
        this.teamLoginUser.errorMsg = '';
        this.teamLoginUser.data = [];
    } else if (result.error) {
        this.teamLoginUser.resultType = 'error';
        this.teamLoginUser.errorMsg = result.errorMsg;
        this.teamLoginUser.data = [];
    } else {
        this.teamLoginUser.resultType = '';
        this.teamLoginUser.errorMsg = '';
        this.teamLoginUser.data = this.getTeamTableData(result.data);
    }
};
//获取到期用户的周登录时长超1小时的各应用的用户数
OperationReportStore.prototype.getExpiredUserExceedLoginTime = function(result) {
    if (result.loading) {
        this.expiredUserExceedLoginTime.resultType = 'loading';
        this.expiredUserExceedLoginTime.errorMsg = '';
        this.expiredUserExceedLoginTime.data = [];
    } else if (result.error) {
        this.expiredUserExceedLoginTime.resultType = 'error';
        this.expiredUserExceedLoginTime.errorMsg = result.errorMsg;
        this.expiredUserExceedLoginTime.data = [];
    } else {
        this.expiredUserExceedLoginTime.resultType = '';
        this.expiredUserExceedLoginTime.errorMsg = '';
        if (_.isArray(result.data) && result.data.length) {
            let total = 0;
            this.expiredUserExceedLoginTime.data = _.map(result.data, appData=> {
                let app = _.find(this.appList, app=>app.id == appData.app_id);
                total += appData.count;
                return {
                    appId: appData.app_id,
                    appName: app ? app.name : "",
                    count: appData.count
                };
            });
            this.expiredUserExceedLoginTime.total = total;
        } else {
            this.expiredUserExceedLoginTime.data = [];
            this.expiredUserExceedLoginTime.total = 0;
        }

    }
};

//获取各部门到期用户的登录表格数据
OperationReportStore.prototype.getTeamExpiredLoginUser = function(result) {
    if (result.loading) {
        this.teamExpiredLoginUser.resultType = 'loading';
        this.teamExpiredLoginUser.errorMsg = '';
        this.teamExpiredLoginUser.data = [];
    } else if (result.error) {
        this.teamExpiredLoginUser.resultType = 'error';
        this.teamExpiredLoginUser.errorMsg = result.errorMsg;
        this.teamExpiredLoginUser.data = [];
    } else {
        this.teamExpiredLoginUser.resultType = '';
        this.teamExpiredLoginUser.errorMsg = '';
        let teamDataObj = this.getTeamDataObj(result.data);
        this.teamExpiredLoginUser.data = teamDataObj.data;
        this.teamExpiredLoginUser.total = teamDataObj.total;
        this.teamExpiredLoginUser.lastWeekTotal = teamDataObj.lastWeekTotal;
    }
};
//获取团队表格数据中上周数据的总数
function getTeamLastWeekTotal(lastWeekData) {
    if (_.isArray(lastWeekData) && lastWeekData.length) {
        let dataList = [];
        _.each(lastWeekData, (appData)=> {
            if (_.isArray(appData.data) && appData.data.length) {
                dataList = dataList.concat(appData.data);
            }
        });
        return _.reduce(dataList, (memo, data) => {
            return memo + data.count;
        }, 0);
    } else {
        return 0;
    }
}
//获取团队列表数据、总数和上周总数的对象
OperationReportStore.prototype.getTeamDataObj = function(resultData) {
    let teamDataObj = {data: [], total: 0, lastWeekTotal: 0};
    let thisWeekData = [], lastWeekData = [];//[{app_id:'1',data:[{count:10,name:‘team_id’},{}...]},{},{}...]
    if (_.isArray(resultData) && resultData.length) {
        thisWeekData = resultData[0];
        lastWeekData = resultData[1];
    }
    //本周数据的处理
    if (_.isArray(thisWeekData) && thisWeekData.length) {
        teamDataObj.data = this.getTeamTableData(thisWeekData);
        let lastArrayData = _.last(teamDataObj.data);
        teamDataObj.total = lastArrayData ? lastArrayData.total : 0;
    }
    //上周总数的计算
    teamDataObj.lastWeekTotal = getTeamLastWeekTotal(lastWeekData);
    return teamDataObj;
};

//获取到期用户登录时长统计表数据
OperationReportStore.prototype.getTeamExpiredUserLoginTime = function(result) {
    if (result.loading) {
        this.teamExpiredUserLoginTime.resultType = 'loading';
        this.teamExpiredUserLoginTime.errorMsg = '';
        this.teamExpiredUserLoginTime.data = [];
    } else if (result.error) {
        this.teamExpiredUserLoginTime.resultType = 'error';
        this.teamExpiredUserLoginTime.errorMsg = result.errorMsg;
        this.teamExpiredUserLoginTime.data = [];
    } else {
        this.teamExpiredUserLoginTime.resultType = '';
        this.teamExpiredUserLoginTime.errorMsg = '';
        let teamDataObj = this.getTeamDataObj(result.data);
        this.teamExpiredUserLoginTime.data = teamDataObj.data;
        this.teamExpiredUserLoginTime.total = teamDataObj.total;
        this.teamExpiredUserLoginTime.lastWeekTotal = teamDataObj.lastWeekTotal;
    }
};

//获取各部门新开试用账号的统计表格
OperationReportStore.prototype.getTeamNewTrialUser = function(result) {
    if (result.loading) {
        this.teamNewTrialUser.resultType = 'loading';
        this.teamNewTrialUser.errorMsg = '';
        this.teamNewTrialUser.data = [];
    } else if (result.error) {
        this.teamNewTrialUser.resultType = 'error';
        this.teamNewTrialUser.errorMsg = result.errorMsg;
        this.teamNewTrialUser.data = [];
    } else {
        this.teamNewTrialUser.resultType = '';
        this.teamNewTrialUser.errorMsg = '';
        this.teamNewTrialUser.data = this.getTeamTableData(result.data);
    }
};

//获取各部门新增延期用户的统计表格
OperationReportStore.prototype.getTeamNewDelayUser = function(result) {
    if (result.loading) {
        this.teamNewDelayUser.resultType = 'loading';
        this.teamNewDelayUser.errorMsg = '';
        this.teamNewDelayUser.data = [];
    } else if (result.error) {
        this.teamNewDelayUser.resultType = 'error';
        this.teamNewDelayUser.errorMsg = result.errorMsg;
        this.teamNewDelayUser.data = [];
    } else {
        this.teamNewDelayUser.resultType = '';
        this.teamNewDelayUser.errorMsg = '';
        this.teamNewDelayUser.data = this.getTeamTableData(result.data);
    }
};
//获取各部门新增延期用户的统计表格
OperationReportStore.prototype.getTeamNewDelayLoginUser = function(result) {
    if (result.loading) {
        this.teamNewDelayLoginUser.resultType = 'loading';
        this.teamNewDelayLoginUser.errorMsg = '';
        this.teamNewDelayLoginUser.data = [];
    } else if (result.error) {
        this.teamNewDelayLoginUser.resultType = 'error';
        this.teamNewDelayLoginUser.errorMsg = result.errorMsg;
        this.teamNewDelayLoginUser.data = [];
    } else {
        this.teamNewDelayLoginUser.resultType = '';
        this.teamNewDelayLoginUser.errorMsg = '';
        let teamDataObj = this.getTeamDataObj(result.data);
        this.teamNewDelayLoginUser.data = teamDataObj.data;
        this.teamNewDelayLoginUser.total = teamDataObj.total;
        this.teamNewDelayLoginUser.lastWeekTotal = teamDataObj.lastWeekTotal;
    }
};
//获取各部门新开试用账号登录的统计表格
OperationReportStore.prototype.getTeamNewTrialLoginUser = function(result) {
    if (result.loading) {
        this.teamNewTrialLoginUser.resultType = 'loading';
        this.teamNewTrialLoginUser.errorMsg = '';
        this.teamNewTrialLoginUser.data = [];
    } else if (result.error) {
        this.teamNewTrialLoginUser.resultType = 'error';
        this.teamNewTrialLoginUser.errorMsg = result.errorMsg;
        this.teamNewTrialLoginUser.data = [];
    } else {
        this.teamNewTrialLoginUser.resultType = '';
        this.teamNewTrialLoginUser.errorMsg = '';
        let teamDataObj = this.getTeamDataObj(result.data);
        this.teamNewTrialLoginUser.data = teamDataObj.data;
        this.teamNewTrialLoginUser.total = teamDataObj.total;
        this.teamNewTrialLoginUser.lastWeekTotal = teamDataObj.lastWeekTotal;
    }
};
//获取各部门登录超过x小时的统计表格数据
OperationReportStore.prototype.getTeamExceedLoginTime = function(result) {
    if (result.loading) {
        this.teamExceedLoginTime.resultType = 'loading';
        this.teamExceedLoginTime.errorMsg = '';
        this.teamExceedLoginTime.data = [];
    } else if (result.error) {
        this.teamExceedLoginTime.resultType = 'error';
        this.teamExceedLoginTime.errorMsg = result.errorMsg;
        this.teamExceedLoginTime.data = [];
    } else {
        this.teamExceedLoginTime.resultType = '';
        this.teamExceedLoginTime.errorMsg = '';
        this.teamExceedLoginTime.data = this.getTeamTableData(result.data);
        let lastArrayData = _.last(this.teamExceedLoginTime.data);
        this.teamExceedLoginTime.total = lastArrayData ? lastArrayData.total : 0;
    }
};
//获取各部门登录超过x小时的延期用统计表格数据
OperationReportStore.prototype.getTeamDelayUserLoginTime = function(result) {
    if (result.loading) {
        this.teamDelayUserLoginTime.resultType = 'loading';
        this.teamDelayUserLoginTime.errorMsg = '';
        this.teamDelayUserLoginTime.data = [];
    } else if (result.error) {
        this.teamDelayUserLoginTime.resultType = 'error';
        this.teamDelayUserLoginTime.errorMsg = result.errorMsg;
        this.teamDelayUserLoginTime.data = [];
    } else {
        this.teamDelayUserLoginTime.resultType = '';
        this.teamDelayUserLoginTime.errorMsg = '';
        this.teamDelayUserLoginTime.data = this.getTeamTableData(result.data);
        let lastArrayData = _.last(this.teamDelayUserLoginTime.data);
        this.teamDelayUserLoginTime.total = lastArrayData ? lastArrayData.total : 0;
    }
};
//获取团队表格列表数据
OperationReportStore.prototype.getTeamTableData = function(resultData) {
    let teamTableData = [];
    //组装成界面表格中所需数据格式[{name:团队名称,appId1:count,appId2:count},...]
    if (_.isArray(this.teamList) && this.teamList.length) {
        let totalRowData = {name: Intl.get("sales.home.total.compute", "总计"), total: 0};//最后一条总计数据
        //遍历团队列表，组装每个团队对应的各个应用的登录count
        teamTableData = this.teamList.map(team=> {
            let rowData = {name: team.teamName}, total = 0;
            //遍历已选的应用列表，组装各个应用对应的登次数
            this.selectAppList.forEach(appId=> {
                let teamLoginList = [];//该应用所有团队的登录数据
                //通过后台返回的数据[{appId:"",teamList:[{name:teamId,count:123}]},...]
                //找到应用对应的团队登录统计列表
                if (_.isArray(resultData) && resultData.length) {
                    let appTeamObj = _.find(resultData, appTeam=>appTeam.app_id == appId);
                    if (appTeamObj && _.isArray(appTeamObj.data)) {
                        teamLoginList = appTeamObj.data;
                    }
                }
                //遍历该应用所有团队的登录次数列表，通过teamId找该应用对应该团队的登录数据
                if (_.isArray(teamLoginList) && teamLoginList.length) {
                    let teamData = _.find(teamLoginList, teamObj=>teamObj.name == team.teamId);
                    if (teamData && teamData.count) {
                        rowData[appId] = teamData.count;
                        total += teamData.count;//团队的总计
                    } else {
                        rowData[appId] = 0;
                    }
                } else {
                    rowData[appId] = 0;
                }
                //应用的总计
                if (totalRowData[appId]) {
                    totalRowData[appId] += rowData[appId];
                } else {
                    totalRowData[appId] = rowData[appId];
                }
            });
            //团队的总计
            rowData.total = total;
            totalRowData.total += total;
            return rowData;
        });
        if (_.isArray(teamTableData) && teamTableData.length) {
            //过滤掉都是团队内各应用都是0的数据
            teamTableData = _.filter(teamTableData, (rowData)=>rowData.total != 0);
        }
        //最后一条总计数据
        teamTableData.push(totalRowData);
    }
    return teamTableData;
};

//各应用登录情况的统计
OperationReportStore.prototype.getAppLoginUser = function(result) {
    if (result.loading) {
        this.appLoginUserObj.resultType = 'loading';
        this.appLoginUserObj.errorMsg = '';
        this.appLoginUserObj.data = [];
    } else if (result.error) {
        this.appLoginUserObj.resultType = 'error';
        this.appLoginUserObj.errorMsg = result.errorMsg;
        this.appLoginUserObj.data = [];
    } else {
        this.appLoginUserObj.resultType = '';
        this.appLoginUserObj.errorMsg = '';
        let thisWeekData = [], lastWeekData = [];
        if (_.isArray(result.data) && result.data.length) {
            thisWeekData = result.data[0];
            lastWeekData = result.data[1];
        }
        //本周数据的处理
        if (_.isArray(thisWeekData) && thisWeekData.length) {
            let total = 0;//本周共有多少人登录了系统
            this.appLoginUserObj.data = this.selectAppList.map((appId)=> {
                //遍历已选择的应用列表，如果返回的数据里，有该应用的登录数据，设置为返回的登录数据，没有则补全为0
                let appLoginCount = 0;//应用对应的登录次数
                if (_.isArray(thisWeekData) && thisWeekData.length) {
                    let findItem = _.find(thisWeekData, item=>item.app_id == appId);
                    if (findItem) {
                        appLoginCount = findItem.count;
                    }
                }
                //从应用列表中获取应用对应的名称
                let app = _.find(this.appList, app=>app.id == appId);
                total += appLoginCount;
                return {
                    appName: app ? app.name : "",
                    count: appLoginCount
                };
            });
            this.appLoginUserObj.total = total;
        } else {
            this.appLoginUserObj.data = [];
            this.appLoginUserObj.total = 0;
        }
        //上周数据的处理
        if (_.isArray(lastWeekData) && lastWeekData.length) {
            let countList = _.pluck(lastWeekData, "count");
            this.appLoginUserObj.lastWeekTotal = _.reduce(countList, (memo, count) => {
                return memo + count;
            }, 0);
        } else {
            this.appLoginUserObj.lastWeekTotal = 0;
        }
    }
};

//获取各应用新开账号统计
OperationReportStore.prototype.getAppNewTrialUser = function(result) {
    if (result.loading) {
        this.appNewTrialUser.resultType = 'loading';
        this.appNewTrialUser.errorMsg = '';
        this.appNewTrialUser.data = [];
    } else if (result.error) {
        this.appNewTrialUser.resultType = 'error';
        this.appNewTrialUser.errorMsg = result.errorMsg;
        this.appNewTrialUser.data = [];
    } else {
        this.appNewTrialUser.resultType = '';
        this.appNewTrialUser.errorMsg = '';
        let thisWeekData = [], lastWeekData = [];
        if (_.isArray(result.data) && result.data.length) {
            thisWeekData = result.data[0];
            lastWeekData = result.data[1];
        }
        //本周数据的处理
        if (_.isArray(thisWeekData) && thisWeekData.length) {
            let total = 0;
            this.appNewTrialUser.data = this.selectAppList.map((appId)=> {
                //遍历已选择的应用列表，如果返回的数据里，有该应用的新开账号数据，设置为返回的登录数据，没有则补全为0
                let appNewTrialUserCount = 0;//应用对应的新开账号数
                if (_.isArray(thisWeekData) && thisWeekData.length) {
                    let findItem = _.find(thisWeekData, item=>item.app_id == appId);
                    if (findItem) {
                        appNewTrialUserCount = findItem.count;
                        total += findItem.count;
                    }
                }
                //从应用列表中获取应用对应的名称
                let app = _.find(this.appList, app=>app.id == appId);
                return {
                    appName: app ? app.name : "",
                    count: appNewTrialUserCount
                };
            });
            this.appNewTrialUser.total = total;
        } else {
            this.appNewTrialUser.data = [];
            this.appNewTrialUser.total = 0;
        }
        //上周数据的处理
        if (_.isArray(lastWeekData) && lastWeekData.length) {
            let countList = _.pluck(lastWeekData, "count");
            this.appNewTrialUser.lastWeekTotal = _.reduce(countList, (memo, count) => {
                return memo + count;
            }, 0);
        } else {
            this.appNewTrialUser.lastWeekTotal = 0;
        }
    }
};

//获取各应用新开账号统计
OperationReportStore.prototype.getAppNewDelayUser = function(result) {
    if (result.loading) {
        this.appNewDelayUser.resultType = 'loading';
        this.appNewDelayUser.errorMsg = '';
        this.appNewDelayUser.data = [];
    } else if (result.error) {
        this.appNewDelayUser.resultType = 'error';
        this.appNewDelayUser.errorMsg = result.errorMsg;
        this.appNewDelayUser.data = [];
    } else {
        this.appNewDelayUser.resultType = '';
        this.appNewDelayUser.errorMsg = '';
        let thisWeekData = [], lastWeekData = [];
        if (_.isArray(result.data) && result.data.length) {
            thisWeekData = result.data[0];
            lastWeekData = result.data[1];
        }
        //本周数据的处理
        if (_.isArray(thisWeekData) && thisWeekData.length) {
            let total = 0;
            this.appNewDelayUser.data = this.selectAppList.map((appId)=> {
                //遍历已选择的应用列表，如果返回的数据里，有该应用的新开账号数据，设置为返回的登录数据，没有则补全为0
                let appNewDelayUserCount = 0;//应用对应的延期用户数
                if (_.isArray(thisWeekData) && thisWeekData.length) {
                    let findItem = _.find(thisWeekData, item=>item.app_id == appId);
                    if (findItem) {
                        appNewDelayUserCount = findItem.count;
                        total += findItem.count;
                    }
                }
                //从应用列表中获取应用对应的名称
                let app = _.find(this.appList, app=>app.id == appId);
                return {
                    appName: app ? app.name : "",
                    count: appNewDelayUserCount
                };
            });
            this.appNewDelayUser.total = total;
        } else {
            this.appNewDelayUser.data = [];
            this.appNewDelayUser.total = 0;
        }
        //上周数据的处理
        if (_.isArray(lastWeekData) && lastWeekData.length) {
            let countList = _.pluck(lastWeekData, "count");
            this.appNewDelayUser.lastWeekTotal = _.reduce(countList, (memo, count) => {
                return memo + count;
            }, 0);
        } else {
            this.appNewDelayUser.lastWeekTotal = 0;
        }
    }
};
//获取各应用的签约用户数
OperationReportStore.prototype.getAppSignedUser = function(result) {
    if (result.loading) {
        this.appSignedUser.resultType = 'loading';
        this.appSignedUser.errorMsg = '';
        this.appSignedUser.data = [];
    } else if (result.error) {
        this.appSignedUser.resultType = 'error';
        this.appSignedUser.errorMsg = result.errorMsg;
        this.appSignedUser.data = [];
    } else {
        this.appSignedUser.resultType = '';
        this.appSignedUser.errorMsg = '';
        if (_.isArray(result.data) && result.data.length) {
            this.appSignedUser.data = result.data;
        }
    }
};
//获取近四周的登录对比
OperationReportStore.prototype.getAppLoginComparison = function(result) {
    if (result.loading) {
        this.appLoginComparison.resultType = 'loading';
        this.appLoginComparison.errorMsg = '';
        this.appLoginComparison.data = [];
    } else if (result.error) {
        this.appLoginComparison.resultType = 'error';
        this.appLoginComparison.errorMsg = result.errorMsg;
        this.appLoginComparison.data = [];
    } else {
        this.appLoginComparison.resultType = '';
        this.appLoginComparison.errorMsg = '';
        if (_.isArray(result.data) && result.data.length) {
            this.appLoginComparison.data = result.data.map((activeObj)=> {
                //通过id获取应用对应的名称
                let app = _.find(this.appList, app=>app.id == activeObj.appId);
                let data = [];
                //格式化数据，以适应chart的渲染
                if (_.isArray(activeObj.actives) && activeObj.actives.length) {
                    data = activeObj.actives.map(active=> {
                        return {count: active.active, timestamp: active.timestamp};
                    });
                }
                return {
                    app_name: app ? app.name : "",
                    data: data
                };
            });
        } else {
            this.appLoginComparison.data = [];
        }
    }
};
//获取应用用户数
OperationReportStore.prototype.getAppsUserCount = function(result) {
    if (!result.loading && !result.error) {
        this.appUserTotal = result.data ? result.data.total : 0;
    } else {
        this.appUserTotal = 0;
    }
};
//获取近四周周登录总时长超过1小时的用户数对比
OperationReportStore.prototype.getAppWeeklyLoginTotalTime = function(result) {
    if (result.loading) {
        this.appWeeklyLoginTotalTime.resultType = 'loading';
        this.appWeeklyLoginTotalTime.errorMsg = '';
        this.appWeeklyLoginTotalTime.data = [];
    } else if (result.error) {
        this.appWeeklyLoginTotalTime.resultType = 'error';
        this.appWeeklyLoginTotalTime.errorMsg = result.errorMsg;
        this.appWeeklyLoginTotalTime.data = [];
    } else {
        this.appWeeklyLoginTotalTime.resultType = '';
        this.appWeeklyLoginTotalTime.errorMsg = '';
        if (_.isArray(result.data) && result.data.length) {
            this.appWeeklyLoginTotalTime.data = result.data.map((LoginObj)=> {
                //通过id获取应用对应的名称
                let app = _.find(this.appList, app=>app.id == LoginObj.app_id);
                return {
                    app_name: app ? app.name : "",
                    data: LoginObj.data//[{count: 936, timestamp: 1496592000000},{},{},{}]该应用近四周的数据
                };
            });
            let lastWeekTotal = 0, total = 0;//总数的计算
            _.each(this.appWeeklyLoginTotalTime.data, (obj)=> {
                let appDataList = obj.data;
                if (_.isArray(appDataList)) {
                    //上周数据
                    if (appDataList[2] && !isNaN(appDataList[2].count)) {
                        lastWeekTotal += appDataList[2].count;
                    }
                    //本周数据
                    if (appDataList[3] && !isNaN(appDataList[3].count)) {
                        total += appDataList[3].count;
                    }
                }
            });
            this.appWeeklyLoginTotalTime.total = total;
            this.appWeeklyLoginTotalTime.lastWeekTotal = lastWeekTotal;
        } else {
            this.appWeeklyLoginTotalTime.data = [];
            this.appWeeklyLoginTotalTime.total = 0;
            this.appWeeklyLoginTotalTime.lastWeekTotal = 0;
        }
    }
};
//获取近四周到期用户的登录对比
OperationReportStore.prototype.getAppExpiredLoginComparison = function(result) {
    if (result.loading) {
        this.appExpiredLoginComparison.resultType = 'loading';
        this.appExpiredLoginComparison.errorMsg = '';
        this.appExpiredLoginComparison.data = [];
    } else if (result.error) {
        this.appExpiredLoginComparison.resultType = 'error';
        this.appExpiredLoginComparison.errorMsg = result.errorMsg;
        this.appExpiredLoginComparison.data = [];
    } else {
        this.appExpiredLoginComparison.resultType = '';
        this.appExpiredLoginComparison.errorMsg = '';
        if (_.isArray(result.data) && result.data.length) {
            this.appExpiredLoginComparison.data = result.data.map((activeObj)=> {
                //通过id获取应用对应的名称
                let app = _.find(this.appList, app=>app.id == activeObj.appId);
                let data = [];
                //格式化数据，以适应chart的渲染
                if (_.isArray(activeObj.actives) && activeObj.actives.length) {
                    data = activeObj.actives.map(active=> {
                        return {count: active.active, timestamp: active.timestamp};
                    });
                }
                return {
                    app_name: app ? app.name : "",
                    data: data
                };
            });
        } else {
            this.appExpiredLoginComparison.data = [];
        }
    }
};
//获取近四周签约用户的登录对比
OperationReportStore.prototype.getAppFormalUserLoginComparison = function(result) {
    if (result.loading) {
        this.appFormalLoginComparison.resultType = 'loading';
        this.appFormalLoginComparison.errorMsg = '';
        this.appFormalLoginComparison.data = [];
    } else if (result.error) {
        this.appFormalLoginComparison.resultType = 'error';
        this.appFormalLoginComparison.errorMsg = result.errorMsg;
        this.appFormalLoginComparison.data = [];
    } else {
        this.appFormalLoginComparison.resultType = '';
        this.appFormalLoginComparison.errorMsg = '';
        let total = 0, lastWeekTotal = 0;//本周(上周)共有多少签约用户登录了系统
        if (_.isArray(result.data) && result.data.length) {
            this.appFormalLoginComparison.data = result.data.map((activeObj)=> {
                //通过id获取应用对应的名称
                let app = _.find(this.appList, app=>app.id == activeObj.appId);
                let data = [];
                //格式化数据，以适应chart的渲染
                if (_.isArray(activeObj.actives) && activeObj.actives.length) {
                    data = activeObj.actives.map((active, index)=> {
                        if (index == activeObj.actives.length - 1) {
                            total += active.active;//最后一个点的数据为本周的登录数据
                        } else if (index == activeObj.actives.length - 2) {
                            lastWeekTotal += active.active;//倒数第二个点的数据为上周周的登录数据
                        }
                        return {count: active.active, timestamp: active.timestamp};
                    });
                }
                return {
                    app_id: app ? app.id : "",
                    app_name: app ? app.name : "",
                    data: data
                };
            });
        } else {
            this.appFormalLoginComparison.data = [];
        }
        this.appFormalLoginComparison.total = total;
        this.appFormalLoginComparison.lastWeekTotal = lastWeekTotal;
    }
};
//近四周新开通用户对比
OperationReportStore.prototype.getAppNewUserComparison = function(result) {
    if (result.loading) {
        this.appNewUserComparison.resultType = 'loading';
        this.appNewUserComparison.errorMsg = '';
        this.appNewUserComparison.data = [];
    } else if (result.error) {
        this.appNewUserComparison.resultType = 'error';
        this.appNewUserComparison.errorMsg = result.errorMsg;
        this.appNewUserComparison.data = [];
    } else {
        this.appNewUserComparison.resultType = '';
        this.appNewUserComparison.errorMsg = '';
        if (_.isArray(result.data) && result.data.length) {
            this.appNewUserComparison.data = result.data.map((userObj)=> {
                //通过id获取应用对应的名称
                let app = _.find(this.appList, app=>app.id == userObj.app_id);
                return {
                    app_name: app ? app.name : "",
                    data: userObj.data
                };
            });
        } else {
            this.appNewUserComparison.data = [];
        }
    }
};
//近四周新增延期用户对比
OperationReportStore.prototype.getAppNewDelayUserComparison = function(result) {
    if (result.loading) {
        this.appNewDelayUserComparison.resultType = 'loading';
        this.appNewDelayUserComparison.errorMsg = '';
        this.appNewDelayUserComparison.data = [];
    } else if (result.error) {
        this.appNewDelayUserComparison.resultType = 'error';
        this.appNewDelayUserComparison.errorMsg = result.errorMsg;
        this.appNewDelayUserComparison.data = [];
    } else {
        this.appNewDelayUserComparison.resultType = '';
        this.appNewDelayUserComparison.errorMsg = '';
        if (_.isArray(result.data) && result.data.length) {
            this.appNewDelayUserComparison.data = result.data.map((userObj)=> {
                //通过id获取应用对应的名称
                let app = _.find(this.appList, app=>app.id == userObj.app_id);
                return {
                    app_name: app ? app.name : "",
                    data: userObj.data
                };
            });
        } else {
            this.appNewDelayUserComparison.data = [];
        }
    }
};
//获取近四周用户活跃度
OperationReportStore.prototype.getUserActive = function(result) {
    if (result.loading) {
        this.userActive.resultType = 'loading';
        this.userActive.errorMsg = '';
        this.userActive.data = [];
    } else if (result.error) {
        this.userActive.resultType = 'error';
        this.userActive.errorMsg = result.errorMsg;
        this.userActive.data = [];
    } else {
        this.userActive.resultType = '';
        this.userActive.errorMsg = '';
        if (_.isArray(result.data) && result.data.length) {
            this.userActive.data = result.data.map((activeObj)=> {
                //通过id获取应用对应的名称
                let app = _.find(this.appList, app=>app.id == activeObj.appId);
                return {
                    datas: activeObj.actives,
                    appName: app ? app.name : ""
                };
            });
        } else {
            this.userActive.data = [];
        }
    }
};

//获取用户日活跃度
OperationReportStore.prototype.getUserDailyActive = function(result) {
    if (result.loading) {
        this.userDailyActive.resultType = 'loading';
        this.userDailyActive.errorMsg = '';
        this.userDailyActive.data = [];
    } else if (result.error) {
        this.userDailyActive.resultType = 'error';
        this.userDailyActive.errorMsg = result.errorMsg;
        this.userDailyActive.data = [];
    } else {
        this.userDailyActive.resultType = '';
        this.userDailyActive.errorMsg = '';
        if (_.isArray(result.data) && result.data.length) {
            this.userDailyActive.data = result.data.map((activeObj)=> {
                //通过id获取应用对应的名称
                let app = _.find(this.appList, app=>app.id == activeObj.appId);
                return {
                    datas: activeObj.actives,
                    appName: app ? app.name : ""
                };
            });
        } else {
            this.userDailyActive.data = [];
        }
    }
};

//运营报告 的store
module.exports = alt.createStore(OperationReportStore, 'OperationReportStore');
