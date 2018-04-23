import AppOverViewActions from '../action/app-overview-actions';


class AppOverViewStore {
    constructor(){
        this.resetState();
        this.bindActions(AppOverViewActions);
    }
    resetState(){
        this.curOnlineNumber = 0; // 当前在线用户总数
        this.todayUserLine = 0; // 今日上线用户数
        // 用户类型统计（用户总数）
        this.userType = {
            dataType : 'total',
            resultType : 'loading' || '',
            errorMsg : '',
            data : [{count: 0, name: '试用'},{count: 0, name: '签约'}]
        };
        // 新增用户（总数，试用和签约）
        this.newUserType = {
            dataType : 'added',
            resultType : 'loading' || '',
            errorMsg : '',
            data : [{count: 0, name: '试用'},{count: 0, name: '签约'}]
        };

        //用户活跃度
        this.activeNess = {
            dataType : "total",
            dateRange : "daily", //数据类型（日活、周活、月活）默认是日活
            //loading error ''
            resultType : 'loading' || '',
            //错误信息
            errorMsg : '',
            //数据
            data : []
        };
        // 今天的活跃率和活跃数
        this.todayActiveRate = {
            active: 0,
            percent: 0
        }; 

        //团队统计
        this.teamAnalysis = {
            resultType : 'loading' || '',
            dateRange : "today", //数据类型（今日、本周、本月）默认是今日
            errorMsg : '',
            data : []
        };
        // 地域统计(新增用户、在线用户和全部用户)
        this.zoneAnalysis = {
            resultType : 'loading' || '',
            dateRange : "added", //数据类型（新增用户、在线用户和全部用户），默认是新增用户
            errorMsg : '',
            data : []
        };
    }
    resetData() {
        this.resetState();
    }
    // 当前在前用户数
    getOnlineUserList(result) {
        this.curOnlineNumber = result.resData && result.resData.total || 0;
    }
    // 今日上线的用户数
    getRecentLoginUsers(result) {
        this.todayUserLine = result.resData && result.resData.total || 0;
    }
    handleUserType(result, data) {
        let userType = data;
        if(result.loading) {
            userType.resultType = 'loading';
            userType.dataType = result.dataType;
            userType.errorMsg = '';
            userType.data = [];
        } else if(result.error) {
            userType.resultType = 'error';
            userType.errorMsg = result.errorMsg;
            userType.data = [];
        } else {
            userType.resultType = '';
            userType.errorMsg = '';
            //如果后端返回数据为空，不进行后续处理
            if (!result.data || !_.isArray(result.data) || (_.isArray(result.data) && !result.data.length)) {
                return userType.data = [{count: 0, name: '试用'},{count: 0, name: '签约'}];
            }
            userType.data = _.filter( result.data, (item) => {
                if (item.name == Intl.get("common.trial.user", "试用用户")) {
                    return  item.name = Intl.get("common.trial", "试用");
                } else if (item.name == Intl.get("common.trial.official", "正式用户")) {
                    return  item.name = Intl.get("common.official", "签约");
                }
            } );
        }
        let nameArray = _.pluck(userType.data, 'name');
        if (nameArray.length == 1) {
            if (_.indexOf(nameArray, '签约') == -1) {
                userType.data.push({count: 0, name: '签约'});
            } else if (_.indexOf(nameArray, '试用') == -1) {
                userType.data.push({count: 0, name: '试用'});
            }
        } else if (nameArray.length == 0) {
            userType.data = [{count: 0, name: '试用'},{count: 0, name: '签约'}];
        }
    }
    // 用户总数中用户类型的试用和签约的用户数
    getUserTypeStatistics (result) {
        this.handleUserType(result, this.userType);
    }
    // 新增用户中用户类型的试用和签约的用户数
    getAddedUserTypeStatistics(result) {
        this.handleUserType(result, this.newUserType);
    }

    //获取活跃度统计（单个应用）
    getUserActiveNess(result) {
        var activeNess = this.activeNess;
        if(result.loading) {
            activeNess.resultType = 'loading';
            activeNess.dataType = result.dataType;
            activeNess.dateRange = result.dateRange;
            activeNess.errorMsg = '';
            activeNess.data = [];
        } else if(result.error) {
            activeNess.resultType = 'error';
            activeNess.errorMsg = result.errorMsg || Intl.get("contract.111", "获取数据失败");
            activeNess.data = [];
        } else {
            activeNess.resultType = '';
            activeNess.errorMsg = '';
            var dataLines = result.data;
            //针对数据进行处理，对后面超出当前时间范围的数据，进行忽略
            var searchEndTime = moment().valueOf();
            _.each(dataLines , function(line) {
                var lineDatas = line.datas;
                var idx = _.findIndex(lineDatas , function(obj) {
                    if(obj.timestamp > searchEndTime) {
                        return true;
                    }
                });
                if(idx >= 0) {
                    line.datas = lineDatas.slice(0,idx);
                }
            });
            activeNess.data = dataLines;
        }
        if (activeNess.dateRange == 'daily' && activeNess.data.length) {
            let dataArray = activeNess.data[activeNess.data.length - 1].datas;
            if (dataArray.length) {
                this.todayActiveRate = dataArray[dataArray.length - 1];
            }
        }
    }

    // 新增团队统计
    getAddedTeam(result) {
        var teamAnalysis = this.teamAnalysis;
        if(result.loading) {
            teamAnalysis.resultType = 'loading';
            teamAnalysis.dateRange = result.dateRange;
            teamAnalysis.errorMsg = '';
            teamAnalysis.data = [];
        } else if(result.error) {
            teamAnalysis.resultType = 'error';
            teamAnalysis.errorMsg = result.errorMsg;
            teamAnalysis.data = [];
        } else {
            teamAnalysis.resultType = '';
            teamAnalysis.errorMsg = '';
            teamAnalysis.data = result.data || [];
        }
    }
    
    handleUserZone(result) {
        var zoneAnalysis = this.zoneAnalysis;
        if(result.loading) {
            zoneAnalysis.resultType = 'loading';
            zoneAnalysis.dateRange = result.dateRange;
            zoneAnalysis.errorMsg = '';
            zoneAnalysis.data = [];
        } else if(result.error) {
            zoneAnalysis.resultType = 'error';
            zoneAnalysis.errorMsg = result.errorMsg;
            zoneAnalysis.data = [];
        } else {
            zoneAnalysis.resultType = '';
            zoneAnalysis.errorMsg = '';
            zoneAnalysis.data = result.data || [];
            let zoneArray = [];
            if (_.isArray( zoneAnalysis.data) &&  zoneAnalysis.data.length > 0) {
                _.each(zoneAnalysis.data, (item) => {
                    if (item.name == 'unknown' || item.name == '') {
                        item.name = '未知';
                    }
                    zoneArray.push({name: item.name, value: item.count});
                });
                zoneAnalysis.data = zoneArray;
            }
        }
    }

    // 新增地域统计（新增用户）
    getAddedZone(result) {
       this.handleUserZone(result);
    }


    // 获取当前应用的在线用户的地域数据
    getOnLineUserZone(result){
        this.handleUserZone(result);
    }

    // 新增地域统计(全部用户)
    getTotalZone(result) {
        this.handleUserZone(result);
    }
}

//使用alt导出store
export default alt.createStore(AppOverViewStore , "AppOverViewStore");