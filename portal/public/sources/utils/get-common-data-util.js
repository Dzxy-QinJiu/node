import {getUserData, setUserData} from '../user-data';
import crmAjax from 'MOD_DIR/crm/public/ajax/index';
import appAjaxTrans from 'MOD_DIR/common/public/ajax/app';
import teamAjaxTrans from 'MOD_DIR/common/public/ajax/team';
import {storageUtil} from 'ant-utils';
import {traversingTeamTree} from 'PUB_DIR/sources/utils/common-method-util';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import {message} from 'antd';
import {phoneMsgEmitter} from 'PUB_DIR/sources/utils/emitters';
const session = storageUtil.session;
// 缓存在sessionStorage中的座席号的key
const sessionCallNumberKey = 'callNumber';
let appList = [];
let allProductList = [];
//缓存在sessionStorage中的我能查看的团队
const MY_TEAM_TREE_KEY = 'my_team_tree';
const AUTH_MAP = {
    ALL_TEAM_AUTH: 'GET_TEAM_LIST_ALL'//管理员获取所有团队树的权限
};
// 获取拨打电话的座席号
exports.getUserPhoneNumber = function(cb) {
    let user_id = getUserData().user_id;
    let callNumberObj = {};
    let storageObj = JSON.parse(session.get(sessionCallNumberKey));
    let callNumber = storageObj && storageObj[user_id] ? storageObj[user_id] : '';
    if (callNumber) {
        callNumberObj.callNumber = callNumber;
        cb(callNumberObj);
    } else {
        crmAjax.getUserPhoneNumber(user_id).then((result) => {
            if (result.phone_order) {
                let storageCallNumberObj = {};
                storageCallNumberObj[user_id] = result.phone_order;
                session.set(sessionCallNumberKey, JSON.stringify(storageCallNumberObj));
                callNumberObj.callNumber = result.phone_order;
                cb(callNumberObj);
            }
        }, (errMsg) => {
            callNumberObj.errMsg = errMsg || Intl.get('crm.get.phone.failed', ' 获取座机号失败!');
            cb(callNumberObj);
        });
    }
};
//获取oplate中的应用
exports.getAppList = function(cb) {
    if (_.get(appList, '[0]')) {
        if (_.isFunction(cb)) cb(appList);
    } else {
        appAjaxTrans.getGrantApplicationListAjax().sendRequest().success(result => {
            let list = [];
            if (_.get(result, '[0]')) {
                list = result.map(function(app) {
                    return {
                        app_id: app.app_id,
                        app_name: app.app_name,
                        app_logo: app.app_logo,
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
//获取订单\合同中的产品列表(ketao:oplate中的应用+后台管理中的产品列表, curtao:后台管理中的产品列表)
exports.getAllProductList = function(cb) {
    if (_.get(allProductList, '[0]')) {
        if (_.isFunction(cb)) cb(allProductList);
    } else {
        $.ajax({
            url: '/rest/product_list',
            type: 'get',
            dataType: 'json',
            success: result => {
                allProductList = _.isArray(result) ? result : [];
                if (_.isFunction(cb)) cb(allProductList);
            },
            error: xhr => {
                allProductList = [];
                if (_.isFunction(cb)) cb(allProductList);
            }
        });
    }
};
//获取我能看的团队树
exports.getMyTeamTreeList = function(cb) {
    let teamTreeList = getUserData().my_team_tree || [];
    let teamList = [];
    if (_.get(teamTreeList, '[0]')) {
        traversingTeamTree(teamTreeList, teamList);
        if (_.isFunction(cb)) cb({teamTreeList, teamList});
    } else {
        let type = 'self';//GET_TEAM_LIST_MYTEAM_WITH_SUBTEAMS
        if (hasPrivilege(AUTH_MAP.ALL_TEAM_AUTH)) {
            type = 'all';
        }
        teamAjaxTrans.getMyTeamTreeListAjax().sendRequest({
            type: type,
        }).success(function(treeList) {
            if (_.get(treeList, '[0]')) {
                teamTreeList = treeList;
                //遍历团队树取出我能看的所有的团队列表list
                traversingTeamTree(teamTreeList, teamList);
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
    }
};

/* 拨号是否成功的处理
 * paramObj:{
 * errorMsg:获取座机号时的错误提示，
 * callNumber: 座席号，
 * contactName: 电话联系人名称，
 * phoneNumber: 拨打的电话号码，
 * customerId: 客户的id
 * }
 */
exports.handleCallOutResult = function(paramObj) {
    if (paramObj.errorMsg) {
        message.error(paramObj.errorMsg || Intl.get('crm.get.phone.failed', ' 获取座机号失败!'));
    } else {
        if (paramObj.callNumber) {
            let phoneNumber = paramObj.phoneNumber ? paramObj.phoneNumber.replace('-', '') : '';
            if (phoneNumber) {
                phoneMsgEmitter.emit(phoneMsgEmitter.SEND_PHONE_NUMBER,
                    {
                        contact: paramObj.contactName,
                        phone: phoneNumber
                    }
                );
                let reqData = {
                    from: paramObj.callNumber,
                    to: phoneNumber
                };
                crmAjax.callOut(reqData).then((result) => {
                    if (result.code === 0) {
                        message.success(Intl.get('crm.call.phone.success', '拨打成功'));
                    }
                }, (errMsg) => {
                    message.error(errMsg || Intl.get('crm.call.phone.failed', '拨打失败'));
                });
            }
        } else {
            message.error(Intl.get('crm.bind.phone', '请先绑定分机号！'));
        }
    }
};
