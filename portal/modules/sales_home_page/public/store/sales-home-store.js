var SalesHomeActions = require('../action/sales-home-actions');
var viewConstant = require('../util/constant').VIEW_CONSTANT;
var showTypeConstant = require('../util/constant').SHOW_TYPE_CONSTANT;
var DateSelectorUtils = require('antc/lib/components/datepicker/utils');
var TimeUtil = require('../../../../public/sources/utils/time-format-util');
let userData = require('../../../../public/sources/user-data');
import shpPrivilegeConst from '../privilege-const';
import analysisPrivilegeConst from '../../../analysis/public/privilege-const';
import {formatRoundingPercentData, getStartEndTimeOfDiffRange} from 'PUB_DIR/sources/utils/common-method-util';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
function SalesHomeStore() {
    this.setInitState();
    this.bindActions(SalesHomeActions);
}

//设置初始化数据
SalesHomeStore.prototype.setInitState = function() {
    //设置客户、用户、电话、合同总数的初始化数据
    this.setInitTotalData('loading');
    if (hasPrivilege(analysisPrivilegeConst.CURTAO_CRM_CUSTOMER_ANALYSIS_ALL) || hasPrivilege(analysisPrivilegeConst.CURTAO_CRM_CUSTOMER_ANALYSIS_SELF)) {
        this.activeView = viewConstant.CUSTOMER;//默认展示客户分析视图
    } else if (hasPrivilege(shpPrivilegeConst.GET_USER_STATISTIC_VIEW) || hasPrivilege(shpPrivilegeConst.USER_ANALYSIS_COMMON)) {
        this.activeView = viewConstant.USER;//默认展示用户户分析视图
    } else {
        this.activeView = viewConstant.PHONE;//默认展示电话统计视图
    }
    //默认展示本周的时间
    this.timeType = 'week';
    // true:本周截止到今天为止
    var timeRange = getStartEndTimeOfDiffRange(this.timeType, true);
    //开始时间
    this.start_time = DateSelectorUtils.getMilliseconds(timeRange.start_time);
    //结束时间
    this.end_time = DateSelectorUtils.getMilliseconds(timeRange.end_time, true);
    this.userType = '';//当前登录销售的角色，销售总监：senior_leader、销售经理：junior_leader
    this.saleStageList = [];//销售阶段列表
    this.salesCustomerList = [];//销售-客户列表
    this.salesPhoneList = [];//销售-电话列表
    this.salesUserList = [];//销售-用户列表
    this.salesUserData = [];//销售-用户列表数据源
    this.callBackRecord = {
        //是否加载中
        isLoading: true,
        //一页多少条
        pageSize: 20,
        //当前第几页
        page: 1,
        //总共多少条
        total: 0,
        //是否监听下拉加载
        listenScrollBottom: true,
        //数据列表
        dataList: [],
        //排序字段
        sortField: 'call_date',
        //排序方向
        sortOrder: 'descend'
    }; // 回访列表
    this.originSalesTeamTree = {};//销售所在团队及其子团队树
    this.resetSalesTeamListObj();
    this.resetSalesTeamMembersObj();
    this.currShowType = '';//当前展示的是销售团队列表、销售人员列表、销售的待办事宜
    this.currShowSalesTeam = '';//当前选择的要展示的销售团队
    this.currShowSalesman = '';//当前选择的要展示的销售人员
    this.isLoadingCustomerList = false;//正在获取销售-客户列表
    this.isLoadingUserList = false;//正在获取销售-用户列表
    this.isLoadingPhoneList = false;//正在获取销售-电话列表
    this.errMsg = ''; //获取不同应用即将过期的试用用户或者签约用户失败后的提示
    this.isLoadingExpireUserList = false;
    this.expireUserLists = {};//获取不同应用，在不同时间段之内即将过期的试用用户（一天，一周，一个月）和签约用户（半年）列表
    this.setWebConfigStatus = '';//设置个人配置的状态
    this.setWebConfigClientStatus = '';//设置个人配置的坐席号状态
    this.salesCallStatus = {};//各销售对应的状态
    //统计团队内成员个数的列表
    this.teamMemberCountList = [];
    this.emailShowObj = {
        isShowActiveEmail: false, //是否展示邮箱激活提示
        isShowAddEmail: false,//是否展示添加邮箱的提示, 不能仅用是否有email字段进行判断，原因是如果数据获取慢的时候，也会在页面上展示出添加邮箱的提示
        isShowSetClient: false//是否展示设置电话系统的提示
    };
    // 待我审批的成员信息
    this.pendingApproveMemberObj = {
        list: [],
        errMsg: ''
    };
};

// 重置回访记录列表状态
SalesHomeStore.prototype.resetCallBackRecord = function() {
    this.callBackRecord = {
        //是否加载中
        isLoading: true,
        //一页多少条
        pageSize: 20,
        //当前第几页
        page: 1,
        //总共多少条
        total: 0,
        //是否监听下拉加载
        listenScrollBottom: true,
        //数据列表
        dataList: [],
        //排序字段
        sortField: 'call_date',
        //排序方向
        sortOrder: 'descend'
    };
};

//销售团队列表对象数据
SalesHomeStore.prototype.resetSalesTeamListObj = function() {
    this.salesTeamListObj = {
        resultType: 'loading',
        errorMsg: '',
        data: []
    };
};
//销售团队成员列表对象数据
SalesHomeStore.prototype.resetSalesTeamMembersObj = function() {
    this.salesTeamMembersObj = {
        resultType: 'loading',
        errorMsg: '',
        data: []
    };
};

//返回销售成员列表展示页
SalesHomeStore.prototype.returnSalesMemberList = function() {
    this.currShowSalesman = '';
    this.currShowType = showTypeConstant.SALES_MEMBER_LIST;
};
//去掉原团队是正在展示列表的父团队的标识
function delTeamFlag(teamList) {
    if (_.isArray(teamList) && teamList.length) {
        _.some(teamList, team => {
            if (team.isCurrShowListParent) {
                delete team.isCurrShowListParent;
                //去掉子团队中正在展示列表的父团队的标识（跨级/隔级返回时）
                delTeamFlag(team.child_groups);
                return true;
            }
        });
    }
}
//设置要返回团队的子团队列表
SalesHomeStore.prototype.setReturnTeamChilds = function(teamId, teamList) {
    if (_.isArray(teamList) && teamList.length > 0) {
        _.some(teamList, team => {
            if (team.group_id === teamId) {
                //设置当前展示的销售团队
                this.currShowSalesTeam = team;
                //去掉原团队是正在展示列表的父团队的标识
                delTeamFlag(team.child_groups);
                this.salesTeamListObj.data = team.child_groups;
                return true;
            } else {
                this.setReturnTeamChilds(teamId, team.child_groups);
            }
        });
    }
};
//返回销售团队列表展示页
SalesHomeStore.prototype.returnSalesTeamList = function(teamId) {
    if (this.originSalesTeamTree.group_id === teamId) {
        //去掉原团队是正在展示列表的父团队的标识
        delTeamFlag(this.originSalesTeamTree.child_groups);
        //返回到第一层团队
        this.salesTeamListObj.data = this.originSalesTeamTree.child_groups;
        this.currShowSalesTeam = '';
    } else {
        //递归遍历子团队，设置当前需要展示的团队列表
        this.setReturnTeamChilds(teamId, this.originSalesTeamTree.child_groups);
    }
    this.currShowSalesman = '';
    this.currShowType = showTypeConstant.SALES_TEAM_LIST;
};

//点击销售团队列表中的某个团队进入该团队的子团队或成员列表展示页
SalesHomeStore.prototype.selectSalesTeam = function(team) {
    //设置该团队是当前展示列表的福团队
    team.isCurrShowListParent = true;
    this.currShowSalesTeam = team;
    if (_.isArray(team.child_groups) && team.child_groups.length > 0) {
        //该团队下还有子团队
        this.salesTeamListObj.data = team.child_groups;
    } else {
        //该团队下没有子团队，展示该团队的所有成员
        //展示新的销售成员列表时，先清空原数据
        this.resetSalesTeamMembersObj();
        this.currShowType = showTypeConstant.SALES_MEMBER_LIST;
        //获取该团队的所有成员
        SalesHomeActions.getSalesTeamMembers(team.group_id);
        //获取该团队销售人员对应的通话状态
        getSalesCallStatusFunc(team);
    }
};
//获取该团队销售人员对应的通话状态
SalesHomeStore.prototype.getSalesCallStatus = function(dataObj) {
    if (_.isObject(dataObj.resData) && !_.isEmpty(dataObj.resData)) {
        this.salesCallStatus = dataObj.resData;
    }
};

//获取该团队销售人员对应的通话状态的方法
function getSalesCallStatusFunc(team) {
    let userIds = [];
    if (_.isArray(team.user_ids) && team.user_ids.length) {
        userIds = team.user_ids;
    }
    if (userIds.length > 0) {
        setTimeout(() => {
            SalesHomeActions.getSalesCallStatus(userIds.join(','));
        });
    }
}

//点击销售成员列表中的某个成员进入该成员的待办事宜展示页
SalesHomeStore.prototype.selectSalesman = function(user) {
    this.currShowSalesman = user;
    this.currShowType = showTypeConstant.SALESMAN;
    //TODO 获取用户提醒
    //SalesHomeAction.getToDoList(user.userId);
};

//获取销售团队列表
SalesHomeStore.prototype.getSalesTeamList = function(result) {
    var salesTeamListObj = this.salesTeamListObj;
    if (result.loading) {
        salesTeamListObj.resultType = 'loading';
        salesTeamListObj.errorMsg = '';
    } else if (result.error) {
        salesTeamListObj.resultType = 'error';
        salesTeamListObj.errorMsg = result.errorMsg;
    } else {
        salesTeamListObj.resultType = '';
        salesTeamListObj.errorMsg = '';
        //管理员、运营人员展示所有的团队时的处理
        if (result.type === 'all') {
            if (_.isArray(result.resData) && result.resData.length) {
                this.originSalesTeamTree = {
                    group_id: 'sales-team-list-parent-group-id',
                    group_name: '销售团队列表',
                    child_groups: result.resData,
                    isCurrShowListParent: true//当前展示（团队）列表的父团队
                };
                salesTeamListObj.data = result.resData;
                this.currShowType = showTypeConstant.SALES_TEAM_LIST;
            }
        } else if (result.type === 'self') {
            //展示销售所在团队及其子团队时的处理
            if (_.isArray(result.resData) && result.resData[0]) {
                let teamObj = result.resData[0];//销售所在团队
                this.originSalesTeamTree = teamObj;//销售所在团队及其子团队
                if (_.isArray(teamObj.child_groups) && teamObj.child_groups.length > 0) {
                    //有下级团队, 展示下级团队
                    salesTeamListObj.data = teamObj.child_groups;
                    this.originSalesTeamTree.isCurrShowListParent = true;//当前展示（团队）列表的父团队
                    this.currShowType = showTypeConstant.SALES_TEAM_LIST;
                } else {
                    //没有下级团队,0、manager还是user
                    let currSalesId = userData.getUserData().user_id;
                    let isOwner = false, isManager = false;
                    if (teamObj.owner_id && teamObj.owner_id === currSalesId) {
                        //当前销售是团队主管
                        isOwner = true;
                    } else if (_.isArray(teamObj.manager_ids) && teamObj.manager_ids.indexOf(currSalesId) !== -1) {
                        //当前销售是团队的舆情秘书
                        isManager = true;
                    }
                    if (isOwner) {
                        this.currShowType = showTypeConstant.SALES_MEMBER_LIST;
                        this.originSalesTeamTree.isCurrShowListParent = true;//当前展示（成员）列表的父团队
                        //获取该销售所在团队的成员列表
                        SalesHomeActions.getSalesTeamMembers(teamObj.group_id);
                        //获取销售所在团队的成员列表对应的通话状态
                        getSalesCallStatusFunc(teamObj);
                    } else {
                        //普通销售或者是舆情秘书，要展示过期用户提醒
                        this.currShowType = showTypeConstant.SALESMAN;
                    }//end of  if (isOwner) else
                }// end of if (_.isArray(teamObj.child_groups) && teamObj.child_groups.length > 0) else
            }// end of if (_.isArray(result.resData) && result.resData[0])
        } // end of else if (result.type === "all")
    }// end of  if (result.loading) else if(result.error)  else
};
//获取销售团队成员列表
SalesHomeStore.prototype.getSalesTeamMembers = function(result) {
    var salesTeamMembersObj = this.salesTeamMembersObj;
    if (result.loading) {
        salesTeamMembersObj.resultType = 'loading';
        salesTeamMembersObj.errorMsg = '';
    } else if (result.error) {
        salesTeamMembersObj.resultType = 'error';
        salesTeamMembersObj.errorMsg = result.errorMsg;
        //获取销售团队只有一个时，根据销售团队id获取成员列表后，再将获取销售团队的loading效果去掉
        this.salesTeamListObj.resultType = '';
    } else {

        salesTeamMembersObj.resultType = '';
        salesTeamMembersObj.errorMsg = '';
        //获取销售团队只有一个时，根据销售团队id获取成员列表后，再将获取销售团队的loading效果去掉
        this.salesTeamListObj.resultType = '';
        if (_.isArray(result.resData)) {
            //对团队列表进行排序
            //按销售角色排序
            result.resData = _.sortBy(result.resData, (item) => item.teamRoleName);
            // 启停用排序，启用的放在前面，停用的放在后面
            result.resData = _.sortBy(result.resData, (item) => {
                return -item.status;
            });
            salesTeamMembersObj.data = result.resData;
        } else {
            salesTeamMembersObj.data = [];
        }
    }
};

//获取统计团队内成员个数的列表
SalesHomeStore.prototype.getTeamMemberCountList = function(list) {
    this.teamMemberCountList = _.isArray(list) ? list : [];
};
//修改团队成员列表中的信息（销售角色）
SalesHomeStore.prototype.updateSalesTeamMembersObj = function(salesTeamMembersObj) {
    this.salesTeamMembersObj = salesTeamMembersObj;
};

//更换查询时间
SalesHomeStore.prototype.changeSearchTime = function(timeObj) {
    this.start_time = timeObj.startTime;
    this.end_time = timeObj.endTime;
    this.timeType = timeObj.timeType;
};

//设置当前要展示的视图
SalesHomeStore.prototype.setActiveView = function(view) {
    this.activeView = view;
};
//设置客户、用户、电话、合同总数的初始化数据
SalesHomeStore.prototype.setInitTotalData = function(type) {
    //客户统计数据:总数、新增客户数、执行阶段客户、成交阶段客户
    this.customerTotalObj = {
        resultType: type || '',
        errorMsg: '',
        data: type === 'loading' ? {} : {
            'total': 0,//总数
            'added': 0,//新增客户数
            'executed': 0,//执行阶段客户
            'dealed': 0//成交阶段客户

        }
    };
    //总数、新增用户数、过期用户数、新增过期用户数
    this.userTotalObj = {
        resultType: type || '',
        errorMsg: '',
        data: type === 'loading' ? {} : {
            'added': 0,//新增用户数
            'added_expired': 0,//新增过期用户数
            'expired': 0,//过期用户数
            'total': 0//总数
        }
    };
    //电话统计数据
    this.phoneTotalObj = {
        resultType: type || '',
        errorMsg: '',
        data: type === 'loading' ? {} : {
            'totalTime': 0,//总时长
            'totalCount': 0//总接通数
        }
    };
};

//获取当前登录用户的角色
SalesHomeStore.prototype.getSalesType = function(typeList) {
    //管理员：admin
    //应用所有者：appowner
    //应用管理员：appmanager
    //普通销售：sales
    //基层领导：salesleader
    //高层领导：salesseniorleader
    //舆情秘书：salesmanager
    //运营人员：operations
    this.userType = _.isArray(typeList) ? typeList : [];
};

//获取客户统计总数
SalesHomeStore.prototype.getCustomerTotal = function(result) {
    var customerTotalObj = this.customerTotalObj;
    if (result.loading) {
        customerTotalObj.resultType = 'loading';
        customerTotalObj.errorMsg = '';
    } else if (result.error) {
        customerTotalObj.resultType = 'error';
        customerTotalObj.errorMsg = result.errorMsg;
    } else {
        customerTotalObj.resultType = '';
        customerTotalObj.errorMsg = '';
        customerTotalObj.data = result.resData;
        if (!_.isObject(customerTotalObj.data)) {
            customerTotalObj.data = {
                'added': 0,
                'dealed': 0,
                'executed': 0,
                'total': 0
            };
        }
    }
};

//总数、新增用户数、过期用户数、新增过期用户数
SalesHomeStore.prototype.getUserTotal = function(result) {
    var userTotalObj = this.userTotalObj;
    if (result.loading) {
        userTotalObj.resultType = 'loading';
        userTotalObj.errorMsg = '';
    } else if (result.error) {
        userTotalObj.resultType = 'error';
        userTotalObj.errorMsg = result.errorMsg;
    } else {
        userTotalObj.resultType = '';
        userTotalObj.errorMsg = '';
        userTotalObj.data = result.resData;
        if (!_.isObject(userTotalObj.data)) {
            userTotalObj.data = {
                'added': 0,
                'added_expired': 0,
                'expired': 0,
                'total': 0
            };
        }
    }
};

//设置正在获取数据的标识
SalesHomeStore.prototype.setListIsLoading = function(type) {
    switch (type) {
        case 'customer':
            this.isLoadingCustomerList = true;
            break;
        case 'user':
            this.isLoadingUserList = true;
            break;
        case 'phone':
            this.isLoadingPhoneList = true;
            break;
    }

};
//获取销售-客户列表
SalesHomeStore.prototype.getSalesCustomerList = function(data) {
    this.isLoadingCustomerList = false;
    if (data && _.isObject(data)) {
        this.userType = data && data.salesRole;
        this.saleStageList = _.isArray(data.saleStageList) ? data.saleStageList : [];
        var customerData = [], _this = this, totalObj = {salesName: Intl.get('sales.home.total.compute', '总计')};
        if (_.isArray(data.salesCustomerList) && data.salesCustomerList.length > 0) {
            customerData = data.salesCustomerList.map(function(salesCustomer) {
                var data = {salesName: salesCustomer.salesName};
                var total = 0;
                _this.saleStageList.forEach(function(saleStage) {
                    data[saleStage] = 0;
                    _.find(salesCustomer.saleStages, function(stageObj) {
                        if (stageObj && stageObj.stage === saleStage) {
                            data[saleStage] = stageObj.customerCount;
                            total += parseInt(stageObj.customerCount);
                            return true;
                        }
                    });

                    totalObj[saleStage] = (totalObj[saleStage] || 0) + data[saleStage];
                });
                data.totalCustomer = total;
                totalObj.totalCustomer = (totalObj.totalCustomer || 0) + total;
                return data;
            });
            customerData.push(totalObj);
        }
        this.salesCustomerList = customerData;
    } else {
        this.salesCustomerList = [];
    }
};
//数据判断
function getData(data) {
    if (isNaN(data)) {
        return '-';
    } else {
        return data;
    }
}
//获取计费时长
function getBillingTime(seconds) {
    if (isNaN(seconds)) {
        return '-';
    } else {
        return Math.ceil(seconds / 60);
    }
}
//获取销售-电话列表
SalesHomeStore.prototype.getSalesPhoneList = function(result) {
    this.isLoadingPhoneList = false;
    var data = result.resData;
    if (data && _.isObject(data)) {
        this.userType = data.salesRole;
        let salesPhoneList = _.isArray(data.salesPhoneList) ? data.salesPhoneList : [];
        salesPhoneList = salesPhoneList.map(function(salesPhone) {
            return {
                averageAnswer: getData(salesPhone.averageAnswer),//日均接通数
                averageTime: getData(salesPhone.averageTime),//日均时长
                salesName: salesPhone.salesName || '',//销售名称
                totalAnswer: getData(salesPhone.totalAnswer),//总接通数
                totalTime: getData(salesPhone.totalTime),//总时长
                callinCount: getData(salesPhone.callinCount),//呼入次数
                callinSuccess: getData(salesPhone.callinSuccess),//成功呼入
                callinRate: formatRoundingPercentData(salesPhone.callinRate),//呼入接通率
                calloutCount: getData(salesPhone.calloutCount),//呼出次数
                calloutSuccess: getData(salesPhone.calloutSuccess),//成功呼出
                calloutRate: formatRoundingPercentData(salesPhone.calloutRate),//呼出接通率
                billingTime: getBillingTime(salesPhone.totalTime),//计费时长
                effectiveCount: getData(salesPhone.effectiveCount),//有效接通数
                effectiveTime: getData(salesPhone.effectiveTime),//有效通话时长
            };
        });
        this.salesPhoneList = _.isArray(salesPhoneList) ? salesPhoneList : [];
    } else {
        this.salesPhoneList = [];
    }
    //销售统计数据
    var phoneTotalObj = this.phoneTotalObj;
    if (result.loading) {
        phoneTotalObj.resultType = 'loading';
        phoneTotalObj.errorMsg = '';
    } else if (result.error) {
        phoneTotalObj.resultType = 'error';
        phoneTotalObj.errorMsg = result.errorMsg;
    } else {
        phoneTotalObj.resultType = '';
        phoneTotalObj.errorMsg = '';
        //总时长、总接通数
        if (_.isArray(data.salesPhoneList)) {
            let totalTime = 0, totalCount = 0;
            data.salesPhoneList.forEach((phone) => {
                totalCount += phone.totalAnswer || 0;
                totalTime += phone.totalTime || 0;
            });
            phoneTotalObj.data = {
                'totalTime': totalTime,
                'totalCount': totalCount
            };
        }
        if (!_.isObject(phoneTotalObj.data)) {
            phoneTotalObj.data = {
                'totalTime': 0,
                'totalCount': 0
            };
        }
    }

};
//获取销售-用户列表
SalesHomeStore.prototype.getSalesUserList = function(data) {
    this.isLoadingUserList = false;
    if (data && _.isObject(data)) {
        this.userType = data.salesRole;
        this.salesUserList = _.isArray(data.salesUserList) ? data.salesUserList : [];
        var userData = [], totalObj = {salesName: Intl.get('sales.home.total.compute', '总计')};
        if (_.isArray(data.salesUserList) && data.salesUserList.length > 0) {
            data.salesUserList.forEach(function(salesUser) {
                salesUser.appList.forEach(function(app) {
                    userData.push({
                        salesName: salesUser.salesName,
                        app: app.appName,
                        newFormalUser: app.newFormalUser,
                        newTryUser: app.newTryUser,
                        newTotalUser: app.newTotalUser || 0
                    });
                    totalObj.newFormalUser = (totalObj.newFormalUser || 0) + (app.newFormalUser || 0);
                    totalObj.newTryUser = (totalObj.newTryUser || 0) + (app.newTryUser || 0);
                    totalObj.newTotalUser = (totalObj.newTotalUser || 0) + (app.newTotalUser || 0);
                });
            });
            userData.push(totalObj);
        }
        this.salesUserData = userData;
    } else {
        this.salesUserList = [];
        this.salesUserData = [];
    }
};
//获取销售-合同列表
SalesHomeStore.prototype.getSalesContractList = function(list) {
    this.salesContractList = _.isArray(list) ? list : [];
};

//获取过期用户列表
SalesHomeStore.prototype.getExpireUser = function(data) {
    this.isLoadingExpireUserList = data.loading;
    if (!data.error) {
        _.each(data.resData, function(val, key) {
            if (val.length !== 0) {
                //给node端传来的数据加上开始和结束时间属性
                for (var i = 0; i < val.length; i++) {
                    val[i].start_date = TimeUtil.getStartTime(key);
                    val[i].end_date = TimeUtil.getEndTime(key);
                }
            }
        });
        this.expireUserLists = data.resData;
    } else {
        this.errMsg = data.errorMsg;
        this.expireUserLists = {};
    }
};
//是否展示邮箱激活的提示
SalesHomeStore.prototype.getShowActiveEmailOrClientConfig = function(result) {
    if (_.isObject(result)){
        this.emailShowObj = result;
    }
};
//设置个人信息配置
SalesHomeStore.prototype.setWebsiteConfig = function(userInfo) {
    if (userInfo.emailLoading) {
        this.setWebConfigStatus = 'loading';
    }
};
// 获取回访列表
SalesHomeStore.prototype.getCallBackList = function(result) {
    let newData = result.resData;
    let callBackRecord = this.callBackRecord;
    callBackRecord.isLoading = result.loading;
    if (callBackRecord.page === 1) {
        callBackRecord.dataList = [];
    }
    if (result.loading) {
        callBackRecord.errorMsg = '';
        callBackRecord.listenScrollBottom = false;
    } else {
        if (result.error) {
            callBackRecord.errorMsg = result.errorMsg || Intl.get('call.record.get.failed', '获取通话记录失败');
        } else {
            callBackRecord.errorMsg = '';
            callBackRecord.total = newData.total;
            if (newData.result) {
                let dataList = newData.result;
                if (!_.isArray(dataList)) {
                    dataList = [];
                }
                // 累加
                callBackRecord.dataList = callBackRecord.dataList.concat(dataList);
                // 页数加1
                callBackRecord.page++;
            }
            //是否监听下拉加载的处理
            if (_.isArray(callBackRecord.dataList) && callBackRecord.dataList.length < callBackRecord.total) {
                callBackRecord.listenScrollBottom = true;
            } else {
                callBackRecord.listenScrollBottom = false;
            }
        }
    }
};

// 获取待我审批的邀请成员列表
SalesHomeStore.prototype.getPendingApproveMemberApplyList = function(result) {
    if (result.error) {
        this.pendingApproveMemberObj.errMsg = _.get(result, 'errMsg');
    } else {
        this.pendingApproveMemberObj.errMsg = '';
        let length = _.get(result, 'data.list.length');
        if (length) {
            this.pendingApproveMemberObj.list = _.get(result, 'data.list');
        }
    }
};

// 处理成员审批
SalesHomeStore.prototype.handleMemberApprove = function(flag) {
    if (flag) {
        this.pendingApproveMemberObj.list = _.slice(this.pendingApproveMemberObj.list, 1);
    }
};

module.exports = alt.createStore(SalesHomeStore, 'SalesHomeStore');
