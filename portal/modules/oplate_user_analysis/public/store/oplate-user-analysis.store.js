var OplateUserAnalysisActions = require('../action/oplate-user-analysis.action');
var DateSelectorUtils = require('antc/lib/components/datepicker/utils');
var userData = require('../../../../public/sources/user-data');

//用户分析
function OplateUserAnalysisStore() {
    //初始化state数据
    this.resetState();
    //绑定action
    this.bindActions(OplateUserAnalysisActions);
}

//日期
const DATE_FORMAT_WITH_YEAR = oplateConsts.DATE_FORMAT;
const DATE_FORMAT_WITHOUT_YEAR = oplateConsts.DATE_MONTH_DAY_FORMAT;

//设置store的初始值
OplateUserAnalysisStore.prototype.resetState = function() {
    //默认查看总用户
    this.currentTab = 'total';
    //选中的app
    this.selectedApp = '';
    //是否选中了综合
    this.isComposite = true;
    //是否是销售角色(销售角色不显示活跃度统计)
    this.isSalesRole = userData.hasRole(userData.ROLE_CONSTANS.SALES) ||
        userData.hasRole(userData.ROLE_CONSTANS.SALES_LEADER) ||
        userData.hasRole(userData.ROLE_CONSTANS.SECRETARY);
    //全部应用的id
    this.allAppId = '';
    //筛选区域是否是展开的
    this.filterExpanded = false;
    //时间对象（true:本周截止到今天为止）
    var timeObj = DateSelectorUtils.getThisWeekTime(true);
    //开始时间
    this.startTime = DateSelectorUtils.getMilliseconds(timeObj.start_time);
    //结束时间
    this.endTime = DateSelectorUtils.getMilliseconds(timeObj.end_time, true);
    //过滤参数
    this.filterParams = [];
    // 用户类型状态：全部类型、 签约、试用、赠送、培训、员工、未知
    this.user_type = '';
    // 应用的启停用状态：全部（''） 启用、停用
    this.status = '';
    // 对应的地域
    this.zone = '';
    // 对应的行业
    this.industry = '';
    // 对应的团队
    this.team = '';
    //重置统计图数据
    this.resetChartData('loading');
};
//切换过滤条件选中状态
OplateUserAnalysisStore.prototype.toggleFilterParam = function({field, checked}) {
    if (this.filterParams.indexOf(field) >= 0) {
        this.filterParams = _.filter(this.filterParams, function(f) {
            return field !== f;
        });
    } else {
        this.filterParams.push(field);
    }
};
//显示/隐藏 筛选区域
OplateUserAnalysisStore.prototype.toggleFilterArea = function() {
    this.filterExpanded = !this.filterExpanded;
};

//用户登录时长统计
OplateUserAnalysisStore.prototype.getUserLoginLong = function(result) {
    var loginLong = this.loginLong;
    if (result.loading) {
        loginLong.resultType = 'loading';
        loginLong.errorMsg = '';
        loginLong.data = [];
    } else if (result.error) {
        loginLong.resultType = 'error';
        loginLong.errorMsg = result.errorMsg;
        loginLong.data = [];
    } else {
        loginLong.resultType = '';
        loginLong.errorMsg = '';
        loginLong.data = result.data;
    }
};

//重置统计图数据
OplateUserAnalysisStore.prototype.resetChartData = function(type) {
    //总数、新增用户数、过期用户数、新增过期用户数
    this.summaryNumbers = {
        resultType: type || '',
        errorMsg: '',
        data: type === 'loading' ? {} : {
            'added': 0,
            'added_expired': 0,
            'expired': 0,
            'total': 0,
            'delayed': 0
        }
    };
    //用户统计
    this.userAnalysis = {
        resultType: type || '',
        errorMsg: '',
        data: []
    };
    //团队统计
    this.teamOrMemberAnalysis = {
        resultType: type || '',
        errorMsg: '',
        data: []
    };
    //地域统计
    this.zoneAnalysis = {
        resultType: type || '',
        errorMsg: '',
        data: []
    };
    //行业统计
    this.industryAnalysis = {
        resultType: type || '',
        errorMsg: '',
        data: []
    };
    //销售开通用户统计
    this.salesOpenUserAnalysis = {
        resultType: type || '',
        errorMsg: '',
        data: []
    };
    //销售开通用户的所有应用列表
    this.salesUserApps = [];
    //用户活跃度
    this.activeNess = {
        //总用户、新用户、过期用户
        dataType: 'total',
        //数据类型（日活、周活、月活）
        dateRange: 'daily',
        //loading error ''
        resultType: type || '',
        //错误信息
        errorMsg: '',
        //数据
        data: []
    };
    //用户活跃时间段
    this.activeTime = {
        resultType: type || '',
        errorMsg: '',
        data: []
    };
    //登录时长统计
    this.loginLong = {
        dataType: 'total',
        dateRange: 1,
        resultType: type || '',
        errorMsg: '',
        data: []
    };
    //用户留存
    this.retention = {
        resultType: type || '',
        errorMsg: '',
        data: {
            columns: [],
            tableJsonList: []
        }
    };

    // 用户类型统计
    this.userType = {
        dataType: 'total',
        resultType: type || '',
        errorMsg: '',
        data: []
    };

    // 应用的启停用状态
    this.appStatus = {
        dataType: 'total',
        resultType: type || '',
        errorMsg: '',
        data: []
    };

    // 应用app下载统计
    this.appDownload = {
        resultType: type || '',
        errorMsg: '',
        data: []
    };
};

//总数、新增用户数、过期用户数、新增过期用户数
OplateUserAnalysisStore.prototype.getSummaryNumbers = function(result) {
    var summaryNumbers = this.summaryNumbers;
    if (result.loading) {
        summaryNumbers.resultType = 'loading';
        summaryNumbers.errorMsg = '';
    } else if (result.error) {
        summaryNumbers.resultType = 'error';
        summaryNumbers.errorMsg = result.errorMsg;
    } else {
        summaryNumbers.resultType = '';
        summaryNumbers.errorMsg = '';
        summaryNumbers.data = result.data;
        if (!_.isObject(summaryNumbers.data)) {
            summaryNumbers.data = {
                'added': 0,
                'added_expired': 0,
                'expired': 0,
                'total': 0,
                'delayed': 0
            };
        }
    }
};

//总用户统计
OplateUserAnalysisStore.prototype.getTotalSummary =
    OplateUserAnalysisStore.prototype.getAddedSummary =
        OplateUserAnalysisStore.prototype.getExpiredSummary =
            OplateUserAnalysisStore.prototype.getAddedExpiredSummary = function(result) {
                var userAnalysis = this.userAnalysis;
                if (result.loading) {
                    userAnalysis.resultType = 'loading';
                    userAnalysis.errorMsg = '';
                    userAnalysis.data = [];
                } else if (result.error) {
                    userAnalysis.resultType = 'error';
                    userAnalysis.errorMsg = result.errorMsg;
                    userAnalysis.data = [];
                } else {
                    userAnalysis.resultType = '';
                    userAnalysis.errorMsg = '';
                    userAnalysis.data = result.data;
                    //找到app_name为''的，改为'综合'
                    if (this.isComposite) {
                        //更改综合名称
                        _.find(userAnalysis.data, function(obj, idx) {
                            if (obj.app_name === '') {
                                obj.app_name = Intl.get('oplate.user.analysis.22', '综合');
                                //将当前这个放到最头上
                                userAnalysis.data.splice(idx, 1);
                                userAnalysis.data.unshift(obj);
                                return true;
                            }
                        });
                        //对数据进行排序
                        userAnalysis.data.sort(function(obj1, obj2) {
                            return obj2.total - obj1.total;
                        });
                    }
                }
            };

//团队统计 或 成员统计
OplateUserAnalysisStore.prototype.getTotalTeam =
    OplateUserAnalysisStore.prototype.getAddedTeam =
        OplateUserAnalysisStore.prototype.getExpiredTeam =
            OplateUserAnalysisStore.prototype.getAddedExpiredTeam =
                OplateUserAnalysisStore.prototype.getTotalMember =
                    OplateUserAnalysisStore.prototype.getAddedMember =
                        OplateUserAnalysisStore.prototype.getExpiredMember =
                            OplateUserAnalysisStore.prototype.getAddedExpiredMember =
                                function(result) {
                                    var teamOrMemberAnalysis = this.teamOrMemberAnalysis;
                                    if (result.loading) {
                                        teamOrMemberAnalysis.resultType = 'loading';
                                        teamOrMemberAnalysis.errorMsg = '';
                                        teamOrMemberAnalysis.data = [];
                                    } else if (result.error) {
                                        teamOrMemberAnalysis.resultType = 'error';
                                        teamOrMemberAnalysis.errorMsg = result.errorMsg;
                                        teamOrMemberAnalysis.data = [];
                                    } else {
                                        teamOrMemberAnalysis.resultType = '';
                                        teamOrMemberAnalysis.errorMsg = '';
                                        teamOrMemberAnalysis.data = result.data;
                                    }
                                };

//地域统计（单个应用）
OplateUserAnalysisStore.prototype.getTotalZone =
    OplateUserAnalysisStore.prototype.getAddedZone =
        OplateUserAnalysisStore.prototype.getExpiredZone =
            OplateUserAnalysisStore.prototype.getAddedExpiredZone = function(result) {
                var zoneAnalysis = this.zoneAnalysis;
                if (result.loading) {
                    zoneAnalysis.resultType = 'loading';
                    zoneAnalysis.errorMsg = '';
                    zoneAnalysis.data = [];
                } else if (result.error) {
                    zoneAnalysis.resultType = 'error';
                    zoneAnalysis.errorMsg = result.errorMsg;
                    zoneAnalysis.data = [];
                } else {
                    zoneAnalysis.resultType = '';
                    zoneAnalysis.errorMsg = '';
                    zoneAnalysis.data = result.data;
                }
            };

//行业统计（单个应用）
OplateUserAnalysisStore.prototype.getTotalIndustry =
    OplateUserAnalysisStore.prototype.getAddedIndustry =
        OplateUserAnalysisStore.prototype.getExpiredIndustry =
            OplateUserAnalysisStore.prototype.getAddedExpiredIndustry = function(result) {
                var industryAnalysis = this.industryAnalysis;
                if (result.loading) {
                    industryAnalysis.resultType = 'loading';
                    industryAnalysis.errorMsg = '';
                    industryAnalysis.data = [];
                } else if (result.error) {
                    industryAnalysis.resultType = 'error';
                    industryAnalysis.errorMsg = result.errorMsg;
                    industryAnalysis.data = [];
                } else {
                    industryAnalysis.resultType = '';
                    industryAnalysis.errorMsg = '';
                    industryAnalysis.data = result.data;
                }
            };

/**
 * 销售开通用户统计数据
 *  result={resultType:'error/loading',
 *          errorMsg:"xxx",
 *          data:[{
 *              memberName:"销售1"，
 *              salesTeamName:"南部公安团队"，
 *              appMap:{
 *                  鹰击:10,
 *                  鹰眼: 15
 *              }
 *          },{
 *              memberName:"销售2"，
 *              salesTeamName:"北部区域团队"，
 *              appMap:{
 *                  鹰击:10,
 *                  鹰眼: 15，
 *                  鹰仔: 8,
 *                  包打听:20
 *              }
 *          },...]
 *
 *  }
 *  重组后data的数据结构
 *        [{
 *              memberName:"销售1"，
 *              salesTeamName:"南部公安团队"，
 *              鹰击:10,
 *              鹰眼: 15,
 *              鹰仔: 0,
 *              包打听:0
 *          },{
 *              memberName:"销售2"，
 *              salesTeamName:"北部区域团队"，
 *              appMap:{
 *                  鹰击:10,
 *                  鹰眼: 15，
 *                  鹰仔: 8,
 *                  包打听:20
 *              }
 *          },...]
 */
OplateUserAnalysisStore.prototype.getSalesOpenUserAnalysis = function(result) {
    var salesOpenUserAnalysis = this.salesOpenUserAnalysis;
    if (result.loading) {
        salesOpenUserAnalysis.resultType = 'loading';
        salesOpenUserAnalysis.errorMsg = '';
        salesOpenUserAnalysis.data = [];
    } else if (result.error) {
        salesOpenUserAnalysis.resultType = 'error';
        salesOpenUserAnalysis.errorMsg = result.errorMsg;
        salesOpenUserAnalysis.data = [];
    } else {
        salesOpenUserAnalysis.resultType = '';
        salesOpenUserAnalysis.errorMsg = '';
        let salesOpenUserNumList = _.isArray(result.data) ? result.data : [];
        let salesUserApps = [];//各个销售开通用户对应的所有应用
        let appTotalRowData = {member_name: Intl.get('sales.home.total.compute', '总计'), sales_team_name: '', total: 0};//最有一行的各应用用户数的总计
        if (_.isArray(salesOpenUserNumList) && salesOpenUserNumList.length) {
            //取出所有销售下的appMap;
            let appMapList = _.map(salesOpenUserNumList, 'app_map');
            //取出所有appMap中的应用名
            _.each(appMapList, app_map => {
                //应用名合并去重
                salesUserApps = _.union(salesUserApps,_.keys(app_map));
            });
            //将取出的所有应用名合并去重
            salesUserApps = _.union(salesUserApps);
            this.salesUserApps = salesUserApps;
            //重构数据结构，将appMap中的数据提取出来组成每一行的数据
            salesOpenUserNumList = _.map(salesOpenUserNumList, item => {
                let rowData = {
                    member_name: item.member_name,
                    sales_team_name: item.sales_team_name
                };
                //遍历所有的应用，从appMap中取app对应的值，没有的补0
                _.each(salesUserApps, (app_name) => {
                    rowData[app_name] = item.app_map[app_name] ? item.app_map[app_name] : 0;
                    //各应用总数的处理
                    if (appTotalRowData[app_name]) {
                        appTotalRowData[app_name] += rowData[app_name];
                    } else {
                        appTotalRowData[app_name] = rowData[app_name];
                    }
                });
                //该销售所有应用开通用户数的总和(行总计)
                rowData.total = 0;
                _.each(item.app_map, (value, key) => {
                    rowData.total += value;
                });
                appTotalRowData.total += rowData.total;
                return rowData;
            });
        }
        salesOpenUserNumList.push(appTotalRowData);
        salesOpenUserAnalysis.data = salesOpenUserNumList;
    }
};

//获取活跃度统计（单个应用）
OplateUserAnalysisStore.prototype.getUserActiveNess = function(result) {
    var activeNess = this.activeNess;
    if (result.loading) {
        activeNess.resultType = 'loading';
        activeNess.dataType = result.dataType;
        activeNess.dateRange = result.dateRange;
        activeNess.errorMsg = '';
        activeNess.data = [];
    } else if (result.error) {
        activeNess.resultType = 'error';
        activeNess.errorMsg = result.errorMsg || Intl.get('contract.111', '获取数据失败');
        activeNess.data = [];
    } else {
        activeNess.resultType = '';
        activeNess.errorMsg = '';
        var dataLines = result.data;
        //针对数据进行处理，对后面超出当前时间范围的数据，进行忽略
        var searchEndTime = moment().valueOf();
        _.each(dataLines, function(line) {
            var lineDatas = line.datas;
            var idx = _.findIndex(lineDatas, function(obj) {
                if (obj.timestamp > searchEndTime) {
                    return true;
                }
            });
            if (idx >= 0) {
                line.datas = lineDatas.slice(0, idx);
            }
        });
        activeNess.data = dataLines;
    }
};
//获取活跃时间段（单个应用）
OplateUserAnalysisStore.prototype.getUserActiveTime = function(result) {
    var activeTime = this.activeTime;
    if (result.loading) {
        activeTime.resultType = 'loading';
        activeTime.errorMsg = '';
        activeTime.data = [];
    } else if (result.error) {
        activeTime.resultType = 'error';
        activeTime.errorMsg = result.errorMsg;
        activeTime.data = [];
    } else {
        activeTime.resultType = '';
        activeTime.errorMsg = '';
        activeTime.data = result.data;
    }
};

//获取用户留存i（单个应用）
OplateUserAnalysisStore.prototype.getRetention = function(result) {
    var retention = this.retention;
    if (result.loading) {
        retention.resultType = 'loading';
        retention.errorMsg = '';
        retention.data = {};
    } else if (result.error) {
        retention.resultType = 'error';
        retention.errorMsg = result.errorMsg;
        retention.data = {};
    } else {
        retention.resultType = '';
        retention.errorMsg = '';

        //如果后端返回数据为空，不进行后续处理
        if (!result.data || !_.isArray(result.data) || (_.isArray(result.data) && !result.data.length)) {
            return;
        }

        //表格列
        let columns = [];
        //表格数据
        const list = [];
        //当前选择的时间段内各天的时间戳
        const timestamps = [];
        //当前选择的时间段内各天的显示值，如 03-06，用于表格首列
        const dates = [];
        //时间相关列名，如“当天”、“次日”、“n天后”
        const dateColumns = [];
        //开始时间的moment表示，用于计算时间区间包含的天数及确定时间格式
        const startTimeMoment = moment(new Date(+this.startTime));
        //结束时间的moment表示，用于计算时间区间包含的天数及确定时间格式
        const endTimeMoment = moment(new Date(+this.endTime));
        //时间区间包含的天数
        const distance = Math.abs(startTimeMoment.diff(endTimeMoment, 'days'));
        //时间格式，分带年和不带年的两种格式
        const DATE_FORMAT = startTimeMoment.year() === endTimeMoment.year() ? DATE_FORMAT_WITHOUT_YEAR : DATE_FORMAT_WITH_YEAR;

        //填充时间戳、时间值及时间列名数组
        for (var i = 0; i <= distance; i++) {
            const timestamp = startTimeMoment.clone().add(i, 'days').valueOf();
            const date = moment(timestamp).format(DATE_FORMAT);
            let column;

            if (i === 0) {
                column = Intl.get('oplate.user.analysis.23', '当天');
            } else if (i === 1) {
                column = Intl.get('oplate.user.analysis.24', '次日');
            } else {
                column = Intl.get('oplate.user.analysis.25', '{count}天后', {count: i});
            }

            timestamps.push(timestamp);
            dates.push(date);
            dateColumns.push(column);
        }

        //用“时间”和“新增数”这两列加上时间相关列，构造表格列数组
        columns = ['date', 'added'].concat(dateColumns);

        //填充表格数据
        _.each(result.data, (dataItem, dataIndex) => {
            //超出当前日期的数据不予显示
            if (dataItem.timestamp > moment().valueOf()) return;

            //列表项，相当于表格行
            const listItem = {};
            //将日期加入列表项
            listItem.date = dates[dataIndex];
            //将新增数加入列表项
            listItem.added = dataItem.count;

            //将各天的活跃值加入列表项
            _.each(dateColumns, (column, columnIndex) => {
                //每一行中的“当天”等时间列对应的时间戳不同，用当前时间列索引(columnIndex) + 当前行索引(dataIndex) 做索引，在时间戳数组里找出该列对应的时间戳
                const timestamp = timestamps[columnIndex + dataIndex];
                //根据时间戳找到对应的活跃点
                const activeObj = _.find(dataItem.actives, activeItem => activeItem.timestamp === timestamp);
                //当前行列单元格的值
                let cellValue;
                //如果当前单元格有对应的活跃点
                if (activeObj && activeObj.active) {
                    //则将该活跃点的值赋给单元格
                    cellValue = activeObj.active;
                } else {
                    //如果当前单元格没有对应的活跃点，且所在时间为已经过去的时间
                    if (timestamp && timestamp < moment().valueOf()) {
                        //则将单元格的值赋为0
                        cellValue = 0;
                        //如果当前单元格没有对应的活跃点，且所在时间为将来的时间
                    } else {
                        //则将单元格的值赋为空
                        cellValue = '';
                    }
                }
                //将该活跃点的数据加入列表项
                listItem[column] = cellValue;
            });

            //将列表项加入列表数组
            list.push(listItem);
        });

        //将表格列数组赋给用于活跃度表格渲染的数据对象
        retention.data.columns = columns;
        //将表格数据数组赋给用于活跃度表格渲染的数据对象
        retention.data.tableJsonList = list;
    }
};

//更换查询时间
OplateUserAnalysisStore.prototype.changeSearchTime = function({startTime, endTime}) {
    this.startTime = startTime;
    this.endTime = endTime;
    this.resetChartData('loading');
};

//更换选中应用
OplateUserAnalysisStore.prototype.changeSelectedApp = function({selectedApp, isComposite}) {
    this.isComposite = isComposite;
    if (this.isComposite) {
        this.allAppId = selectedApp;
    }
    //为app重新赋值
    this.selectedApp = selectedApp;
};
//更换当前tab页
OplateUserAnalysisStore.prototype.changeCurrentTab = function(tabName) {
    this.currentTab = tabName;
};

//显示各统计图没有数据
OplateUserAnalysisStore.prototype.showNoData = function() {
    this.resetChartData();
};


// 用户类型统计
OplateUserAnalysisStore.prototype.getUserTypeStatistics = function(result) {
    var userType = this.userType;
    if (result.loading) {
        userType.resultType = 'loading';
        userType.dataType = result.dataType;
        userType.errorMsg = '';
        userType.data = [];
    } else if (result.error) {
        userType.resultType = 'error';
        userType.errorMsg = result.errorMsg;
        userType.data = [];
    } else {
        userType.resultType = '';
        userType.errorMsg = '';
        //如果后端返回数据为空，不进行后续处理
        if (!result.data || !_.isArray(result.data) || (_.isArray(result.data) && !result.data.length)) {
            return userType.data = [];
        }
        _.each(result.data, (item) => {
            if (item.name === Intl.get('common.trial.official', '正式用户')) {
                item.name = Intl.get('common.official', '签约');
            } else if (item.name === Intl.get('common.trial.user', '试用用户')) {
                item.name = Intl.get('common.trial', '试用');
            } else if (item.name === 'special') {
                item.name = Intl.get('user.type.presented', '赠送');
            } else if (item.name === 'training') {
                item.name = Intl.get('user.type.presented', '培训');
            } else if (item.name === 'internal') {
                item.name = Intl.get('user.type.employee', '员工');
            } else if (item.name === 'unknown') {
                item.name = Intl.get('common.unknown', '未知');
            }
        });
        userType.data = result.data;
    }
};


// 应用的启停用状态统计
OplateUserAnalysisStore.prototype.getAppStatus = function(result) {
    var appStatus = this.appStatus;
    if (result.loading) {
        appStatus.dataType = result.dataType;
        appStatus.errorMsg = '';
        appStatus.resultType = 'loading';
        appStatus.data = [];
    } else if (result.error) {
        appStatus.resultType = 'error';
        appStatus.errorMsg = result.errorMsg;
        appStatus.data = [];
    } else {
        appStatus.resultType = '';
        appStatus.errorMsg = '';
        //如果后端返回数据为空，不进行后续处理
        if (!result.data || !_.isArray(result.data) || (_.isArray(result.data) && !result.data.length)) {
            return appStatus.data = [];
        }
        let data = _.filter(result.data, (item) => {
            return item.name === '0' || item.name === '1';
        });
        _.each(data, (item) => {
            if (item.name === '0') {
                item.name = Intl.get('common.stop', '停用');
            } else if (item.name === '1') {
                item.name = Intl.get('common.enabled', '启用');
            }
        });
        appStatus.data = data;
    }
};
// 全部应用下（综合）,团队统计
OplateUserAnalysisStore.prototype.getAppsTeam = function(result) {
    var teamOrMemberAnalysis = this.teamOrMemberAnalysis;
    if (result.loading) {
        teamOrMemberAnalysis.resultType = 'loading';
        teamOrMemberAnalysis.errorMsg = '';
        teamOrMemberAnalysis.data = [];
    } else if (result.error) {
        teamOrMemberAnalysis.resultType = 'error';
        teamOrMemberAnalysis.errorMsg = result.errorMsg;
        teamOrMemberAnalysis.data = [];
    } else {
        teamOrMemberAnalysis.resultType = '';
        teamOrMemberAnalysis.errorMsg = '';
        teamOrMemberAnalysis.data = result.data;
    }
};

// 全部应用下（综合）,行业统计
OplateUserAnalysisStore.prototype.getAppsIndustry = function(result) {
    var industryAnalysis = this.industryAnalysis;
    if (result.loading) {
        industryAnalysis.resultType = 'loading';
        industryAnalysis.errorMsg = '';
        industryAnalysis.data = [];
    } else if (result.error) {
        industryAnalysis.resultType = 'error';
        industryAnalysis.errorMsg = result.errorMsg;
        industryAnalysis.data = [];
    } else {
        industryAnalysis.resultType = '';
        industryAnalysis.errorMsg = '';
        industryAnalysis.data = result.data;
    }
};

// 全部应用下（综合）,地域统计
OplateUserAnalysisStore.prototype.getAppsZone = function(result) {
    var zoneAnalysis = this.zoneAnalysis;
    if (result.loading) {
        zoneAnalysis.resultType = 'loading';
        zoneAnalysis.errorMsg = '';
        zoneAnalysis.data = [];
    } else if (result.error) {
        zoneAnalysis.resultType = 'error';
        zoneAnalysis.errorMsg = result.errorMsg;
        zoneAnalysis.data = [];
    } else {
        zoneAnalysis.resultType = '';
        zoneAnalysis.errorMsg = '';
        zoneAnalysis.data = result.data;
    }
};

// 点击用户类型图表获取对应的类型：试用、签约、员工、赠送、培训、未知
OplateUserAnalysisStore.prototype.setLinkageUserType = function(userType) {
    this.user_type = userType;
};

// 点击启停用图表获取对应的类型：启用、停用
OplateUserAnalysisStore.prototype.setLinkageAppStatus = function(appStatus) {
    this.status = appStatus;
};

// 点击地域图表获取地域
OplateUserAnalysisStore.prototype.setLinkageZone = function(zone) {
    this.zone = zone;
};

// 点击行业图表获取行业
OplateUserAnalysisStore.prototype.setLinkageIndustry = function(industry) {
    this.industry = industry;
};

// 点击团队图表获取对应的团队
OplateUserAnalysisStore.prototype.setLinkageTeam = function(team) {
    this.team = team;
};

// 获取应用下载的统计
OplateUserAnalysisStore.prototype.getAppsDownloadStatistics = function(result) {
    var appDownload = this.appDownload;
    if (result.loading) {
        appDownload.resultType = 'loading';
        appDownload.errorMsg = '';
        appDownload.data = [];
    } else if (result.error) {
        appDownload.resultType = 'error';
        appDownload.errorMsg = result.errorMsg;
        appDownload.data = [];
    } else {
        appDownload.resultType = '';
        appDownload.errorMsg = '';
        appDownload.data = result.data;
    }
};

//导出 用户分析-用户构成 的store
module.exports = alt.createStore(OplateUserAnalysisStore, 'OplateUserAnalysisStore');
