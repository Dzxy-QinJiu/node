import {getUserData, setUserData} from '../user-data';
import appAjaxTrans from 'MOD_DIR/common/public/ajax/app';
import teamAjaxTrans from 'MOD_DIR/common/public/ajax/team';
import salesmanAjax from 'MOD_DIR/common/public/ajax/salesman';
import guideAjax from 'MOD_DIR/common/public/ajax/guide';
import {storageUtil} from 'ant-utils';
import {traversingTeamTree, getParamByPrivilege, hasCalloutPrivilege, getOrganization} from 'PUB_DIR/sources/utils/common-method-util';
import {message} from 'antd';
import {phoneMsgEmitter} from 'PUB_DIR/sources/utils/emitters';
import {getCallClient, isRongLianPhoneSystem} from 'PUB_DIR/sources/utils/phone-util';
import { INTEGRATE_TYPES } from 'PUB_DIR/sources/utils/consts';
import CONSTS from 'LIB_DIR/consts';
import publicPrivilegeConst from '../../privilege-const';
import ajax from 'ant-ajax';
const session = storageUtil.session;
let appList = [];
//oplate中的应用+客套中的产品列表
let allProductList = [];
//已集成的产品列表
let integrationProductList = [];
let dealStageList = [];
let allUserList = [];
let notSalesUserList = [];
// 销售列表
let salesmanList = [];
let myTeamTreeMemberList = [];//我所在团队及下级团队的人员列表（管理员返回所有团队下的人员列表）
//缓存在sessionStorage中的我能查看的团队
const MY_TEAM_TREE_KEY = 'my_team_tree';
const AUTH_MAP = {
    ALL_TEAM_AUTH: publicPrivilegeConst.GET_TEAM_LIST_ALL//管理员获取所有团队树的权限
};
import {DIFF_TYPE_LOG_FILES, AM_AND_PM} from './consts';
import {isEqualArray} from 'LIB_DIR/func';
import userData from 'PUB_DIR/sources/user-data';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
//获取oplate中的应用
exports.getAppList = function(cb) {
    if (_.get(appList, '[0]')) {
        if (_.isFunction(cb)) cb(appList);
    } else {
        appAjaxTrans.getGrantApplicationListAjax().sendRequest({integration: true, page_size: 1000}).success(result => {
            let list = [];
            if (_.get(result, '[0]')) {
                list = result.map(function(app) {
                    return {
                        app_id: app.app_id,
                        app_name: app.app_name,
                        app_logo: app.app_logo,
                        terminals: app.terminals // 多终端类型
                    };
                });
            }
            appList = list;
            if (_.isFunction(cb)) cb(appList);
        }).error(errorMsg => {
            appList = [];
            if (_.isFunction(cb)) cb(appList, errorMsg);
        });
    }
};
//获取订单\合同中的产品列表,所有的产品列表，包括：集成+自己添加的
exports.getAllProductList = function(cb) {
    if (_.get(allProductList, '[0]')) {
        if (_.isFunction(cb)) cb(allProductList);
    } else {
        appAjaxTrans.getGrantApplicationListAjax().sendRequest().success(result => {
            let list = [];
            if (_.get(result, '[0]')) {
                list = result.map(function(app) {
                    return {
                        client_id: app.app_id,
                        client_name: app.app_name,
                        client_image: app.app_logo,
                    };
                });
            }
            allProductList = list;
            if (_.isFunction(cb)) cb(allProductList);
        }).error(errorMsg => {
            allProductList = [];
            if (_.isFunction(cb)) cb(allProductList, errorMsg);
        });
    }
};
//获取所有的成员列表,notFilterStop:不过滤停用的成员
const getAllUserList = function(notFilterStop) {
    return new Promise((resolve, reject) => {
        if (_.get(allUserList, '[0]')) {
            //不过滤停用的成员
            if(notFilterStop){
                resolve(allUserList);
            }else{//过滤停用的成员
                resolve(_.filter(allUserList, sales => sales && sales.status === 1));
            }
        } else {
            $.ajax({
                url: '/rest/user',
                type: 'get',
                dataType: 'json',
                data: {},
                success: result => {
                    if (_.get(result, 'data[0]')) {
                        allUserList = result.data;
                    }
                    //不过滤停用的成员
                    if(notFilterStop){
                        resolve(allUserList);
                    }else{//过滤停用的成员
                        resolve(_.filter(allUserList, sales => sales && sales.status === 1));
                    }
                },
                error: xhr => {
                    allUserList = [];
                    resolve(allUserList);
                }
            });
        }
    });
};
exports.getAllUserList = getAllUserList;
//获取不包含销售角色的用户列表
const getNotSalesRoleUserList = function() {
    return new Promise((resolve, reject) => {
        if (_.get(notSalesUserList, '[0]')) {
            //过滤停用的成员
            resolve(_.filter(notSalesUserList, sales => sales && sales.status === 1));
        } else {
            var roleIdsConsts = _.cloneDeep(CONSTS.ROLE_ID_CONSTANS);
            delete roleIdsConsts.SALE_ID;
            let queryObj = {
                roleParam: _.values(roleIdsConsts), // 成员角色
            };
            $.ajax({
                url: '/rest/get/member/by/roles',
                type: 'get',
                dataType: 'json',
                data: queryObj,
                success: result => {
                    if (_.get(result, '[0]')) {
                        notSalesUserList = result;
                    }
                    resolve(_.filter(notSalesUserList, sales => sales && sales.status === 1));
                },
                error: xhr => {
                    notSalesUserList = [];
                    resolve(notSalesUserList);
                }
            });
        }
    });
};
exports.getNotSalesRoleUserList = getNotSalesRoleUserList;

// 获取销售列表
const getSalesmanList = function() {
    return new Promise((resolve, reject) => {
        if (_.get(salesmanList, '[0]')) {
            resolve(salesmanList);
        } else {
            salesmanAjax.getSalesmanListAjax().addQueryParam({with_ketao_member: true}).sendRequest()
                .success(result => {
                    if (_.isArray(result)) {
                        salesmanList = result;
                        resolve(result);
                    }
                })
                .error(() => {
                    salesmanList = [];
                    resolve(salesmanList);
                })
                .timeout(() => {
                    salesmanList = [];
                    resolve(salesmanList);
                });
        }
    });
};
exports.getSalesmanList = getSalesmanList;
function filterDisabledMembers(memberLists) {
    return _.filter(memberLists, item => item.status === 1);
}
const getMyTeamTreeMemberList = function(filter_disabled) {
    return new Promise((resolve, reject) => {
        if (_.get(myTeamTreeMemberList, '[0]')) {
            var data = myTeamTreeMemberList;
            if (filter_disabled){
                data = filterDisabledMembers(data);
            }
            resolve(data);
        } else {
            var type = 'self';
            if (hasPrivilege(publicPrivilegeConst.GET_TEAM_LIST_ALL)){
                type = 'all';
            }
            salesmanAjax.getMyTeamTreeMemberListAjax().resolvePath({
                type: type
            }).sendRequest({}).success(result => {
                if (_.isArray(result)) {
                    myTeamTreeMemberList = result;
                    if (filter_disabled){
                        result = filterDisabledMembers(result);
                    }
                    resolve(result);
                }
            }).error(() => {
                myTeamTreeMemberList = [];
                resolve(myTeamTreeMemberList);
            }).timeout(() => {
                myTeamTreeMemberList = [];
                resolve(myTeamTreeMemberList);
            });
        }
    });
};
exports.getMyTeamTreeMemberList = getMyTeamTreeMemberList;

// 返回所有成员列表和销售列表的组合数据
exports.getAllSalesUserList = function(cb) {
    Promise.all([getAllUserList(), getSalesmanList()]).then(result => {
        if (_.isFunction(cb)) {
            let userList = _.get(result, '[0]', []), salesManList = _.get(result, '[1]', []);
            _.each(userList, user => {
                let isExist = _.some(salesManList, item => _.get(item, 'user_info.user_id') === user.userId);
                //将销售列表里没有的成员，加到列表中
                if (!isExist) {
                    salesManList.push({
                        user_info: {
                            user_id: _.get(user, 'userId', ''),
                            nick_name: _.get(user, 'nickName', '') || _.get(user,'userName', ''),
                        },
                        user_groups: [{
                            group_name: '',
                            group_id: ''
                        }]
                    });
                }
            });
            cb(salesManList);
        }
    });

};

//获取我能看的团队树
exports.getMyTeamTreeList = function(cb) {
    let teamTreeList = getUserData().my_team_tree || [];
    if (_.get(teamTreeList, '[0]')) {
        if (_.isFunction(cb)) cb({teamTreeList});
    } else {
        const reqData = getParamByPrivilege();
        teamAjaxTrans.getMyTeamTreeListAjax().sendRequest({
            type: reqData.type,
        }).success(function(teamTreeList) {
            if (_.isFunction(cb)) cb({teamTreeList});
            //保存到userData中
            setUserData(MY_TEAM_TREE_KEY, teamTreeList);
        }).error(errorMsg => {
            teamTreeList = [];
            if (_.isFunction(cb)) cb({teamTreeList, errorMsg});
            //保存到userData中
            setUserData(MY_TEAM_TREE_KEY, teamTreeList);
        });
    }
};

//获取平铺的和树状团队列表，
// isReload：是否重新获取数据，并且teamList中会返回root_group，parent_group
// 团队管理中，获取团队及添加、修改团队后刷新团队列表时需要重新获取数据，不能用缓存的团队数据
exports.getMyTeamTreeAndFlattenList = function(cb, isReload) {
    let teamTreeList = getUserData().my_team_tree || [];
    let teamList = [];
    if (isReload || _.isEmpty(teamTreeList)) {
        const reqData = getParamByPrivilege();
        teamAjaxTrans.getMyTeamTreeListAjax().sendRequest({
            type: reqData.type,
        }).success(function(treeList) {
            if (_.get(treeList, '[0]')) {
                teamTreeList = treeList;
                //遍历团队树取出我能看的所有的团队列表list
                traversingTeamTree(teamTreeList, teamList, isReload);
            }
            if (_.isFunction(cb)) cb({teamTreeList, teamList});
            //保存到userData中
            setUserData(MY_TEAM_TREE_KEY, teamTreeList);
        }).error(errorMsg => {
            teamTreeList = [];
            if (_.isFunction(cb)) cb({teamTreeList, teamList, errorMsg});
            //保存到userData中
            setUserData(MY_TEAM_TREE_KEY, teamTreeList);
        });
    } else {
        traversingTeamTree(teamTreeList, teamList, isReload);
        if (_.isFunction(cb)) cb({teamTreeList, teamList});
    }
};

/* 拨号是否成功的处理
 * paramObj:{
 * errorMsg:获取座机号时的错误提示，
 * contactName: 电话联系人名称，
 * phoneNumber: 拨打的电话号码，
 * customerId: 客户的id
 * }
 * callback 拨打完电话后的回调
 */
exports.handleCallOutResult = function(paramObj, callback) {
    if (!paramObj || Oplate.isCalling) {
        return;
    }
    let phoneNumber = paramObj.phoneNumber ? paramObj.phoneNumber.replace('-', '') : '';
    if (phoneNumber) {
        phoneMsgEmitter.emit(phoneMsgEmitter.SEND_PHONE_NUMBER,
            {
                contact: paramObj.contactName,
                phone: phoneNumber
            }
        );
        let callClient = getCallClient();
        if (hasCalloutPrivilege()) {
            //开始打电话
            Oplate.isCalling = true;
            callClient.callout(phoneNumber, paramObj.id, paramObj.type).then((result) => {
                //不是容联的电话系统不能同时打俩电话（结束推送事件可能会很慢），所以此时就可以设成false，容联的电话系统可以同时打俩电话，所以需推送过来结束事件后才可以继续打电话
                if (!isRongLianPhoneSystem()) {
                    Oplate.isCalling = false;
                }
                message.success(Intl.get('crm.call.phone.success', '拨打成功'));
                _.isFunction(callback) && callback();
            }, (errMsg) => {
                //拨打失败后，将正在拨打电话的标识设为false，可以继续拨打电话
                Oplate.isCalling = false;
                _.isFunction(callback) && callback();
                message.error(errMsg || Intl.get('crm.call.phone.failed', '拨打失败'));
            });
        }
    }

};

//获取订单阶段列表
exports.getDealStageList = function(cb) {
    if (_.get(dealStageList, '[0]')) {
        if (_.isFunction(cb)) cb(dealStageList);
    } else {
        $.ajax({
            url: '/rest/sales_stage_list',
            type: 'get',
            dataType: 'json',
            success: data => {
                dealStageList = _.get(data, 'result[0]') ? data.result : [];
                if (_.isFunction(cb)) cb(dealStageList);
            },
            error: xhr => {
                dealStageList = [];
                if (_.isFunction(cb)) cb(dealStageList);
            }
        });
    }
};

//将文件分为客户资料和各种类型的报告
exports.seperateFilesDiffType = function(fileList) {
    var allUploadFiles = {
        customerFiles: [],//销售添加申请时上传的文件
        customerAddedFiles: [],//销售在申请确认之前补充上传的文件
        approverUploadFiles: []//支持部上传的文件
    };
    if (_.isArray(fileList)) {
        allUploadFiles.customerFiles = _.filter(fileList, item => item.log_type === DIFF_TYPE_LOG_FILES.SALE_UPLOAD);
        allUploadFiles.customerAddedFiles = _.filter(fileList, item => item.log_type === DIFF_TYPE_LOG_FILES.SALE_UPLOAD_NEW);
        allUploadFiles.approverUploadFiles = _.filter(fileList, item => item.log_type === DIFF_TYPE_LOG_FILES.APPROVER_UPLOAD);
    }
    return allUploadFiles;
};
//标识是否已经确认过审批,因为文件类型和舆情报告前面是有两个节点
exports.hasApprovedReportAndDocumentApply = function(that) {
    return _.get(that, 'state.applyNode[0].forms[0]') === 'submitFiles';
};

function calculateTimeRange(beginType, endType) {
    var timeRange = '';
    if (beginType === endType) {
        timeRange = 0.5;
    } else if (beginType === AM_AND_PM.AM && endType === AM_AND_PM.PM) {
        timeRange = 1;
    }
    return timeRange;

}

//计算两个日期中间相隔的天数
exports.calculateTotalTimeRange = (formData) => {
    var beginTime = formData.begin_time, beginType = formData.begin_type, endTime = formData.end_time,
        endType = formData.end_type;
    var timeRange = '';
    //如果开始和结束时间是同一天的
    var isSameDay = moment(beginTime).isSame(endTime, 'day');
    if (isSameDay) {
        timeRange = calculateTimeRange(beginType, endType);
    } else {
        //相差几天
        timeRange = moment(endTime).diff(moment(beginTime), 'days');
        timeRange += calculateTimeRange(beginType, endType);
    }
    return timeRange;
};

function showAmAndPmDes(time) {
    var des = '';
    if (time === AM_AND_PM.AM) {
        des = Intl.get('apply.approve.leave.am', '上午');
    } else if (time === AM_AND_PM.PM) {
        des = Intl.get('apply.approve.leave.pm', '下午');
    }
    return des;
}

exports.handleTimeRange = function(start, end) {
    var beginTimeArr = start.split('_');
    var endTimeArr = end.split('_');
    var leaveTime = _.get(beginTimeArr, [0]);
    if (isEqualArray(beginTimeArr, endTimeArr)) {
        leaveTime += showAmAndPmDes(_.get(beginTimeArr, [1]));
    } else if (_.get(beginTimeArr, [0]) !== _.get(endTimeArr, [0])) {
        leaveTime += showAmAndPmDes(_.get(beginTimeArr, [1]));
        leaveTime = leaveTime + ' — ' + _.get(endTimeArr, [0]);
        leaveTime += showAmAndPmDes(_.get(endTimeArr, [1]));
    }
    return leaveTime;
};
exports.calculateRangeType = function() {
    //今天上午12点前请假，默认请假时间选今天一天，下午12点到6点请假，默认请今天一下午，6点之后请假，默认请明天一天
    var newSetting = {};
    var curHour = moment().hours();
    if (curHour >= 0 && curHour < 12) {
        newSetting.begin_type = AM_AND_PM.AM;
        newSetting.end_type = AM_AND_PM.PM;
    } else if (curHour >= 12 && curHour < 18) {
        newSetting.begin_type = AM_AND_PM.PM;
        newSetting.end_type = AM_AND_PM.PM;
    } else if (curHour >= 18 && curHour < 24) {
        newSetting.begin_type = AM_AND_PM.AM;
        newSetting.end_type = AM_AND_PM.PM;
        newSetting.begin_time = moment().add(1, 'day').valueOf();
        newSetting.end_time = moment().add(1, 'day').valueOf();
    }
    return newSetting;
};

//获取集成配置
function getIntegrationConfig() {
    return new Promise((resolve, reject) => {
        const userProperty = 'integration_config';
        //集成配置信息{type: matomo、oplate、uem}
        let integrationConfig = getUserData()[userProperty];
        if (integrationConfig) {
            resolve(integrationConfig);
        } else {
            $.ajax({
                url: '/rest/global/integration/config',
                type: 'get',
                dataType: 'json',
                success: data => {
                    //保存到userData中
                    setUserData(userProperty, data);
                    resolve(data);
                },
                error: xhr => {
                    reject(xhr.responseJSON);
                }
            });
        }
    });
}

//获取集成配置
exports.getIntegrationConfig = getIntegrationConfig;

//获取已集成的产品列表
exports.getProductList = function(cb, isRefresh) {
    //需要刷新产品列表或产品列表中没有数据时，发请求获取已集成的产品列表
    if (isRefresh || !_.get(integrationProductList, '[0]')) {
        $.ajax({
            url: '/rest/product',
            type: 'get',
            dataType: 'json',
            data: {
                page_size: 1000, //为确保能获取到全部的产品，所以传了个比较大的数1000
                integration: true //集成的应用
            },
            success: result => {
                integrationProductList = _.get(result, 'list', []);
                if (_.isFunction(cb)) cb(integrationProductList);
            },
            error: xhr => {
                integrationProductList = [];
                if (_.isFunction(cb)) cb(integrationProductList);
            }
        });
    } else {
        if (_.isFunction(cb)) cb(integrationProductList);
    }
};
function isRealmManager() {
    //是否是管理员
    return userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN);
}
//点击电话后不可拨打的提示
exports.showDisabledCallTip = function() {
    //是否是管理员
    if (isRealmManager()) {
        return Intl.get('manager.role.has.not.setting.phone.systerm', '您尚未开通电话系统或未设置座席号!');
    } else {
        return Intl.get('sales.role.has.not.setting.phone.systerm', '您尚未开通电话系统或未设置座席号，请通知管理员!');
    }
};

//获取组织电话系统配置
exports.getCallSystemConfig = function() {
    return new Promise((resolve, reject) => {
        const userProperty = 'callsystem_config';
        let callsystemConfig = getUserData()[userProperty];
        if (callsystemConfig) {
            resolve(callsystemConfig);
        } else {
            $.ajax({
                url: '/rest/global/callsystem/config',
                type: 'get',
                dataType: 'json',
                success: data => {
                    //保存到userData中
                    setUserData(userProperty, data);
                    resolve(data);
                },
                error: xhr => {
                    reject(xhr.responseJSON);
                }
            });
        }
    });
};

// 对象数组的去重方法
exports.uniqueObjectOfArray = (arr) => {
    let unique = []; // 去重后的数组
    _.each(arr, (originalItem) => { // 循环arr重复数组对象的内容
        let flag = true; // 建立标记，判断数据是否重复，true为不重复
        _.each(unique, (uniqueItem) => {
            if (originalItem.field === uniqueItem.field && originalItem.detail === uniqueItem.detail) { //让arr数组对象的内容与新数组的内容作比较，相同的话，改变标记为false
                flag = false;
            }
        });
        if (flag) { //判断是否重复
            unique.push(originalItem); //不重复的放入新数组。
        }
    });
    return unique;
};
//获取我所在团队及下级团队的人员列表（管理员获取所有团队下的人员列表）
exports.getTeamTreeMemberLists = function(callback) {
    //运营或管理员，获取所有的成员列表
    if (userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN) || userData.hasRole(userData.ROLE_CONSTANS.OPERATION_PERSON)) {
        //获取所有的成员（不过滤停用的成员）
        getAllUserList(true).then(list => {
            _.isFunction(callback) && callback(_.map(list, item => {
                return {
                    user_id: _.get(item, 'userId', ''),
                    nickname: _.get(item, 'nickName', '') || _.get(item, 'userName', '')
                };
            }));

        }, function(errorMsg) {
            console.log(errorMsg);
        });
    } else {//销售获取我所在团队及下级团的成员列表
        getMyTeamTreeMemberList().then(list => {
            _.isFunction(callback) && callback(_.map(list, item => {
                return {
                    user_id: _.get(item, 'user_id'),
                    nickname: _.get(item, 'nick_name', '') || _.get(item, 'user_name', '')
                };
            }));
        }, function(errorMsg) {
            console.log(errorMsg);
        });
    }
};
// 查询所有行政区域规划信息
exports.getAreaInfoAll = function() {
    return new Promise((resolve, reject) => {
        let sessionKey = 'area_info';
        let area_info = session.get(sessionKey);
        if (area_info) {
            resolve(area_info);
        } else {
            $.ajax({
                url: '/rest/area_info/all',
                type: 'get',
                dataType: 'json',
                success: data => {
                    //保存到session中
                    session.set(sessionKey, data.result);
                    resolve(data.result);
                },
                error: xhr => {
                    reject(xhr.responseJSON);
                }
            });
        }
    });
};
// 获取用户类型列表
exports.getUserTypeList = function() {
    return new Promise((resolve, reject) => {
        getIntegrationConfig().then(resultObj => {
            let userTypeList = [{
                value: '',
                name: Intl.get('oplate_customer_analysis.type.all', '全部类型')
            }];

            let isOplateUser = _.get(resultObj, 'type') === INTEGRATE_TYPES.OPLATE;

            if (isOplateUser) {
                userTypeList = _.concat(userTypeList, [{
                    value: '试用用户',
                    name: Intl.get('oplate_customer_analysis.type.trial', '试用用户')
                },
                {
                    value: '正式用户',
                    name: Intl.get('oplate_customer_analysis.type.formal', '正式用户')
                },
                {
                    value: 'internal',
                    name: Intl.get('oplate_customer_analysis.type.employee', '员工用户')
                },
                {
                    value: 'special',
                    name: Intl.get('oplate_customer_analysis.type.gift', '赠送用户')
                },
                {
                    value: 'training',
                    name: Intl.get('oplate_customer_analysis.type.training', '培训用户')
                }]);

                resolve(userTypeList);
            } else {
                appAjaxTrans.getUserCondition().then( (list) => {
                    let uemUserTypeList = _.filter(list, item => {
                        return item.key === 'user_type' && _.get(item.values,'[0]');
                    });

                    uemUserTypeList = _.map(uemUserTypeList, item => {
                        return {
                            name: item,
                            value: item
                        };
                    });

                    userTypeList = _.concat(userTypeList, uemUserTypeList);

                    resolve(userTypeList);
                },() => {
                    resolve(userTypeList);
                });
            }
        });
    });
};
// 更新引导流程
exports.updateGuideMark = function(key) {
    // 判断是否完成此引导，没有则请求接口
    let userProperty = 'guideConfig';
    let guideConfig = _.get(getUserData(), userProperty, []);
    let curGuide = _.find(guideConfig, guide => guide.content === key);
    if(curGuide && !curGuide.finished) {
        guideAjax.setGuideMark({
            step: key
        }).then((data) => {
            _.each(guideConfig, guide => {
                if(guide.content === key) {
                    guide.finished = true;
                }
            });
            setUserData(userProperty, guideConfig);
        }, (errMsg) => {console.log(errMsg);});
    }
};

// 获取组织信息
exports.getOrganizationInfo = (queryParams = {}) => {
    const Deferred = $.Deferred();
    $.ajax({
        url: '/rest/get/member/organization',
        dataType: 'json',
        type: 'get',
        data: queryParams,
        success: (resData) => {
            Deferred.resolve(resData);
        },
        error: (errorInfo) => {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

//获取能提取线索的最大数
exports.getMaxLimitExtractClueCount = function() {
    const Deferred = $.Deferred();
    $.ajax({
        url: '/rest/get/maxlimit/and/hasExtracted/count',
        dataType: 'json',
        type: 'get',
        success: (data) => {
            var maxCount = _.get(data,'total', 0);
            var hasExtractedCount = _.get(data,'pulled_clue_numbers');
            Deferred.resolve({maxCount, hasExtractedCount});
        },
        error: (xhr) => {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};

// 获取组织的通话费用
exports.getOrganizationCallFee = function() {
    let organizationId = _.get(getOrganization(), 'id');
    const Deferred = $.Deferred();
    $.ajax({
        url: '/rest/get/organization/phone/fee',
        dataType: 'json',
        type: 'get',
        data: {organization: organizationId},
        success: (data) => {
            Deferred.resolve(data);
        },
        error: (errorInfo) => {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

// 升级公告
let upgradeNoticeAjax;
exports.getUpgradeNoticeList = (queryObj) => {
    if (upgradeNoticeAjax) {
        upgradeNoticeAjax.abort();
    }
    const Deferred = $.Deferred();
    upgradeNoticeAjax = $.ajax({
        url: '/rest/get/upgrade/notice',
        dataType: 'json',
        type: 'get',
        data: queryObj,
        success: (result) => {
            Deferred.resolve(result);
        },
        error: (error, errorText) => {
            if (errorText !== 'abort') {
                Deferred.reject(error && error.responseJSON || Intl.get('notice.get.list.failed', '获取公告列表失败'));
            }
        }
    });
    return Deferred.promise();
};