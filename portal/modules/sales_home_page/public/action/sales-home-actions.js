var salesHomeAjax = require('../ajax/sales-home-ajax');
var userData = require('../../../../public/sources/user-data');
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
let scrollBarEmitter = require('../../../../public/sources/utils/emitters').scrollBarEmitter;
var _ = require('lodash');
import {getMyTeamTreeList} from 'PUB_DIR/sources/utils/common-data-util';
import UserAjax from '../../../common/public/ajax/user';
import {afterGetExtendUserInfo} from 'PUB_DIR/sources/utils/common-method-util';
import {APPLY_APPROVE_TYPES} from 'PUB_DIR/sources/utils/consts';
import {getWorklistApplyList} from 'PUB_DIR/sources/utils/apply-common-data-utils';

function SalesHomeActions() {
    this.generateActions(
        'setListIsLoading',//设置是否正在加载数据列表
        'setActiveView',//设置当前要展示的视图
        'changeSearchTime',//搜索时间的切换
        'selectSalesTeam',//选择要展示的销售团队
        'selectSalesman',//选择要展示的销售人员
        'returnSalesTeamList',//返回销售团队列表
        'returnSalesMemberList',//返回销售成员列表
        'getExpireUser',//获取过期用户列表
        'setWebsiteConfig',//对网站进行个性化设置
        'setInitState',//设置初始化数据
        'updateSalesTeamMembersObj',//修改团队成员列表中的信息（销售角色）
        'resetCallBackRecord', // 重置回访记录列表状态
        'handleMemberApprove', // 处理成员审批
    );

    //获取当前登录销售的角色（销售/经理/总监）
    this.getSalesType = function() {
        var _this = this;
        salesHomeAjax.getSalesType().then(function(list) {
            _this.dispatch(list);
            if (list.indexOf('sales') >= 0) {
                //TODO 普通销售：sales
            } else if (list.indexOf('salesleader') >= 0 || list.indexOf('salesseniorleader') >= 0) {//基层领导：salesleader，高层领导：salesseniorleader
                //获取销售(团队)-客户列表
                _this.actions.getSalesCustomerList();
                //获取销售(团队)-电话列表
                _this.actions.getSalesPhoneList();
                //获取销售(团队)-用户列表
                _this.actions.getSalesUserList();
                //获取销售(团队)-合同列表
                _this.actions.getSalesContractList();
            }
        }, function(errorMsg) {
            _this.dispatch(errorMsg);
        }
        );
    };
    //获取销售团队列表
    this.getSalesTeamList = function(type) {
        this.dispatch({loading: true, error: false});
        getMyTeamTreeList(data => {
            if(data.errorMsg){
                this.dispatch({loading: false, error: true, errorMsg: data.errorMsg});
            }else{
                this.dispatch({loading: false, error: false, resData: data.teamTreeList, type: type});
            }
        });
    };

    //获取统计团队内成员个数的列表
    this.getTeamMemberCountList = function() {
        salesHomeAjax.getTeamMemberCountList().then((resData) => {
            this.dispatch(resData);
        }, (errMsg) => {
            this.dispatch(errMsg);
        }
        );
    };
    //获取各销售对应的通话状态
    this.getSalesCallStatus = function(userIds) {
        var _this = this;
        _this.dispatch({loading: true, error: false});
        salesHomeAjax.getSalesCallStatus(userIds).then(function(resData) {
            _this.dispatch({loading: false, error: false, resData: resData});
        }, function(errorMsg) {
            _this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
    //获取某销售团队的成员列表
    this.getSalesTeamMembers = function(teamId) {
        var _this = this;
        if (_this.dispatched) {
            _this.dispatch({loading: true, error: false});
        }
        salesHomeAjax.getSalesTeamMembers(teamId).then(function(resData) {
            _this.dispatch({loading: false, error: false, resData: resData});
        }, function(errorMsg) {
            _this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };

    //获取客户统计总数
    this.getCustomerTotal = function(reqData) {
        var _this = this;
        _this.dispatch({loading: true, error: false});
        salesHomeAjax.getCustomerTotal(reqData).then(function(resData) {
            _this.dispatch({loading: false, error: false, resData: resData});
        }, function(errorMsg) {
            _this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };

    //获取客户统计总数
    this.getUserTotal = function(reqData) {
        var _this = this;
        _this.dispatch({loading: true, error: false});
        salesHomeAjax.getUserTotal(reqData).then(function(resData) {
            _this.dispatch({loading: false, error: false, resData: resData});
        }, function(errorMsg) {
            _this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };

    // 获取回访统计总数
    this.getCallBackTotal = function(reqData) {
        this.dispatch({loading: true, error: false});
        salesHomeAjax.getCallBackTotal(reqData)
            .then(resData => {
                this.dispatch({loading: false, error: false, resData: resData});
            },
            errorMsg => {
                this.dispatch({loading: false, error: true, errorMsg: errorMsg});
            });
    };

    //获取销售-客户列表
    this.getSalesCustomerList = function(timeRange) {
        var _this = this;
        salesHomeAjax.getSalesCustomerList(timeRange).then(function(data) {
            _this.dispatch(data);
        }, function(errorMsg) {
            _this.dispatch(errorMsg);
        }
        );
    };
    //获取销售-电话列表
    this.getSalesPhoneList = function(reqData) {
        var _this = this;
        _this.dispatch({loading: true, error: false});
        salesHomeAjax.getSalesPhoneList(reqData).then(function(resData) {
            _this.dispatch({loading: false, error: false, resData: resData});
        }, function(errorMsg) {
            _this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        }
        );
    };
    //获取销售-用户列表
    this.getSalesUserList = function(timeRange) {
        var _this = this;
        salesHomeAjax.getSalesUserList(timeRange).then(function(data) {
            _this.dispatch(data);
        }, function(errorMsg) {
            _this.dispatch(errorMsg);
        }
        );
    };
    //获取销售-合同列表
    this.getSalesContractList = function(timeRange) {
        var _this = this;
        salesHomeAjax.getSalesContractList(timeRange).then(function(data) {
            _this.dispatch(data);
        }, function(errorMsg) {
            _this.dispatch(errorMsg);
        }
        );
    };
    //获取过期用户列表
    this.getExpireUser = function(queryObj) {
        var _this = this;
        _this.dispatch({loading: true, error: false});
        salesHomeAjax.getExpireUser(queryObj).then(function(resData) {
            _this.dispatch({loading: false, error: false, resData: resData});
        }, function(errorMsg) {
            _this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        }
        );
    };
    //获取是否展示邮件激活提示
    this.getShowActiveEmailOrClientConfig = function(isShowPhoneSet) {
        //先获取个人资料
        var user_id = userData.getUserData().user_id;
        UserAjax.getUserByIdAjax().resolvePath({
            user_id: user_id
        }).sendRequest().success((data) => {
            afterGetExtendUserInfo(data, this, isShowPhoneSet);
        });
    };
    //邮箱激活
    this.activeUserEmail = function(callback) {
        salesHomeAjax.activeUserEmail().then(function(data) {
            if (callback) {
                if (data) {
                    callback({error: false, data: data});
                } else {
                    callback({error: true, errorMsg: Intl.get('user.info.active.user.email.failed','激活失败')});
                }
            }
        }, function(errorMsg) {
            if (callback) {
                callback({error: true, errorMsg: errorMsg || Intl.get('user.info.active.user.email.failed','激活失败')});
            }
        });
    };
    //设置邮箱激活不再提醒
    this.setWebsiteConfig = function(queryObj,callback) {
        this.dispatch({emailLoading: true, error: false});
        salesHomeAjax.setWebsiteConfig(queryObj).then((resData) => {
            if (callback && _.isFunction(callback)){
                callback();
            }
        },(errorMsg) => {
            if (callback && _.isFunction(callback)){
                callback(errorMsg || Intl.get('failed.set.no.tip','设置失败'));
            }
        }
        );
    };
    // 获取回访列表
    this.getCallBackList = function(params, filterObj) {
        this.dispatch({loading: true, error: false});
        salesHomeAjax.getCallBackList(params, filterObj)
            .then(resData => {
                scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
                this.dispatch({loading: false, error: false, resData: resData});
            },
            errorMsg => {
                this.dispatch({loading: false, error: true, errorMsg: errorMsg});
            });
    };

    // 获取待我审批的邀请成员列表
    this.getPendingApproveMemberApplyList = function() {
        getWorklistApplyList({type: APPLY_APPROVE_TYPES.MEMBER_INVITE}).then((workList) => {
            this.dispatch({error: false, data: workList});
        }, (errorMsg) => {
            this.dispatch({
                error: true,
                errMsg: errorMsg || Intl.get('member.apply.failed.get.worklist', '获取由我审批的成员申请失败')
            });
        });
    };
}

module.exports = alt.createActions(SalesHomeActions);
