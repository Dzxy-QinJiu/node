import AppUserAjax from '../ajax/app-user-ajax';
import UserAjax from '../../../common/public/ajax/user';
import AppUserUtil from '../util/app-user-util';
import UserData from '../../../../public/sources/user-data';
import UserApplyAction from './user-apply-actions';
var notificationEmitter = require('../../../../public/sources/utils/emitters').notificationEmitter;
import {message} from 'antd';
var timeoutFunc;//定时方法
var timeout = 1000;//1秒后刷新未读数
import { APPLY_MULTI_TYPE_VALUES } from 'PUB_DIR/sources/utils/consts';

//更新申请的待审批数，通过、驳回、撤销后均减一
function updateUnapprovedCount() {
    if (Oplate && Oplate.unread) {
        Oplate.unread.approve -= 1;
        if (timeoutFunc) {
            clearTimeout(timeoutFunc);
        }
        timeoutFunc = setTimeout(function() {
            //触发展示的组件待审批数的刷新
            notificationEmitter.emit(notificationEmitter.SHOW_UNHANDLE_APPLY_COUNT);
        }, timeout);
    }
}
class ApplyViewDetailActions {
    constructor() {
        this.generateActions(
            //显示详情加载中
            'showDetailLoading',
            //取消审批
            'cancelSendApproval',
            //切换审批详情是否是展开的
            'toggleApplyExpanded',
            //将用户名设置为编辑状态
            'setUserNameEdit',
            //确定用户名
            'saveUserName',
            //取消用户名
            'cancelUserName',
            //将昵称设置为编辑状态
            'setNickNameEdit',
            //确定昵称
            'saveNickName',
            //取消昵称
            'cancelNickName',
            //显示用户详情
            'showUserDetail',
            //显示客户详情
            'showCustomerDetail',
            // 延期时间设置为可修改
            'setDelayTimeModify',
            // 保存延期时间的修改
            'saveModifyDelayTime',
            // 取消延期时间的修改
            'cancelModifyDelayTime',
            // 延迟时间
            'delayTimeNumberModify',
            // 延迟单位，比如：天、周、月、年
            'delayTimeUnitModify',
            //关闭右侧面板
            'closeRightPanel',
            //显示回复输入框为空的错误
            'showReplyCommentEmptyError',
            //隐藏回复输入框为空的错误
            'hideReplyCommentEmptyError',
            //恢复添加回复表单到默认状态
            'resetReplyFormResult',
            //角色没有设置的时候是否显示模态框
            'setRolesNotSettingModalDialog',
            //没有设置角色，仍然提交
            'rolesNotSettingContinueSubmit',
            // 显示应用配置面板
            'showAppConfigPanel',
            'showAppConfigRightPanle',
            // 应用配置取消时
            'handleCancel',
            // 应用配置保存成功时
            'handleSaveAppConfig',
            // 将延期时间设置为截止时间（具体到xx年xx月xx日）
            'setDelayDeadlineTime',
            'setBottomDisplayType',
        );
    }

    //获取用户头像
    getUserLogo(user_id) {
        UserAjax.getUserByIdAjax().resolvePath({
            user_id: user_id
        }).sendRequest().success((userInfo) => {
            this.dispatch(userInfo);
        }).error();
    }

    //获取审批单详情
    getApplyDetail(id, applyData) {        
        //如果已获取了某个详情数据，针对从url中的申请id获取的详情数据
        if (applyData) {
            this.dispatch({loading: false, error: false, detail: applyData.detail});
        } else {
            this.dispatch({loading: true, error: false});
            AppUserAjax.getApplyDetail(id).then((detail, apps) => {
                this.dispatch({loading: false, error: false, detail: detail});
            }, (errorMsg) => {
                this.dispatch({loading: false, error: true, errorMsg: errorMsg});
            });
        }
    }
 
    //获取回复列表
    getReplyList(id) {
        this.dispatch({loading: true, error: false, list: [], errorMsg: ''});
        AppUserAjax.getReplyList(id).then((list) => {
            this.dispatch({loading: false, error: false, list: list, errorMsg: ''});
            //清除未读回复列表中已读的回复
            UserApplyAction.clearUnreadReply(id);
            //针对reply中的user_id，排重
            var user_ids = _.chain(list).map('user_id').uniq().value();
            //针对每一个user_id，获取用户信息
            _.each(user_ids, (user_id) => {
                this.actions.getUserLogo(user_id);
            });
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, list: [], errorMsg: errorMsg});
        });
    }

    //提交审批
    submitApply(obj) {
        this.dispatch({loading: true, error: false});
        let promise = null;
        //延期、停用审批用新接口
        if (APPLY_MULTI_TYPE_VALUES.includes(obj.type)) {
            promise = AppUserAjax.submitMultiAppApply({
                data: {
                    message_id: obj.message_id,
                    approval_state: obj.approval,
                    data: obj.data || ''
                }
            });
        }
        else {
            promise = AppUserAjax.submitApply(obj);
        }
        promise.then((data) => {
            this.dispatch({loading: false, error: false, data: data, approval: obj.approval});
            //更新选中的申请单类型
            AppUserUtil.emitter.emit('updateSelectedItem', {id: obj.message_id, approval: obj.approval, status: 'success'});
            //刷新用户审批未处理数
            updateUnapprovedCount();
        }, (errorMsg) => {
            //更新选中的申请单类型
            AppUserUtil.emitter.emit('updateSelectedItem', {status: 'error'});
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    }

    //添加回复
    addReply(obj) {
        this.dispatch({loading: true, error: false});
        AppUserAjax.addReply(obj).then((replyData) => {
            if (_.isObject(replyData)) {
                //创建回复数据，直接添加到store的回复数组后面
                let userData = UserData.getUserData();
                let replyTime = replyData.comment_time ? moment(replyData.comment_time) : moment();
                let replyItem = {
                    user_id: replyData.user_id || '',
                    user_name: replyData.nick_name || '',
                    user_logo: userData.user_logo || '',
                    message: replyData.comment || '',
                    date: replyTime.format(oplateConsts.DATE_TIME_FORMAT)
                };
                //滚动条定位到最后
                AppUserUtil.emitter.emit(AppUserUtil.EMITTER_CONSTANTS.REPLY_LIST_SCROLL_TO_BOTTOM);
                this.dispatch({loading: false, error: false, reply: replyItem});
            }
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    }

    // 撤销申请
    saleBackoutApply(obj) {
        this.dispatch({loading: true, error: false});
        AppUserAjax.saleBackoutApply(obj).then((data) => {
            if (data) {
                this.dispatch({loading: false, error: false});
                message.success(Intl.get('user.apply.detail.backout.success', '撤销成功'));
                AppUserUtil.emitter.emit('updateSelectedItem', {id: obj.apply_id, approval: '3', status: 'success'});
                //刷新用户审批未处理数(左侧导航中待审批数)
                updateUnapprovedCount();
            }
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true});
            AppUserUtil.emitter.emit('updateSelectedItem', {status: 'error'});
            message.error(errorMsg || Intl.get('user.apply.detail.backout.error', '撤销申请失败'));
            this.dispatch(errorMsg);
        });
    }

}

export default alt.createActions(ApplyViewDetailActions);