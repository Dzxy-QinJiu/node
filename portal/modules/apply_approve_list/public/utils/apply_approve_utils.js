import {Button} from 'antd';
import {APPLY_APPROVE_TYPES} from 'PUB_DIR/sources/utils/consts';
import userData from 'PUB_DIR/sources/user-data';
let salesmanAjax = require('MOD_DIR/common/public/ajax/salesman');
export const APPLY_TYPE = {
    APPLY_BY_ME: 'apply_by_me',
    APPROVE_BY_ME: 'approve_by_me',
    APPLY_BY_TEAM: 'apply_by_team',
};

export const APPLY_APPROVE_TAB_TYPES = [{
    value: APPLY_TYPE.APPLY_BY_ME,
    name: Intl.get('apply.approve.list.start.by.me', '我申请的')
}, {
    value: APPLY_TYPE.APPROVE_BY_ME,
    name: Intl.get('apply.approve.list.approved.by.me', '我审批的')
}, {
    value: APPLY_TYPE.APPLY_BY_TEAM,
    name: Intl.get('apply.approve.list.approved.by.team', '团队申请')
}];
export const APPLY_LIST_LAYOUT_CONSTANTS = {
    TOP_DELTA: 64,
    BOTTOM_DELTA: 48,
    APPLY_LIST_WIDTH: 336,
    DETAIL_BOTTOM_DELTA: 14,
    NAV_SIDER_BAR: 65//左侧导航的宽度
};
export const getApplyListDivHeight = function() {
    if ($(window).width() < Oplate.layout['screen-md']) {
        return 'auto';
    }
    return $(window).height() - APPLY_LIST_LAYOUT_CONSTANTS.TOP_DELTA - APPLY_LIST_LAYOUT_CONSTANTS.BOTTOM_DELTA;
};
export const getContentWidth = function() {
    return $(window).width() - APPLY_LIST_LAYOUT_CONSTANTS.APPLY_LIST_WIDTH - APPLY_LIST_LAYOUT_CONSTANTS.NAV_SIDER_BAR;
};
export const transferBtnContent = function() {
    return (<Button className='transfer-btn'>
        <i className='iconfont icon-transfer'></i>
        {Intl.get('apply.view.transfer.candidate','转审')}</Button>);
};
export const renderApproveBtn = function() {
    return (<Button
        className='assign-candidate-btn btn-primary-sure agree-btn'><i className='iconfont icon-agree'></i>{Intl.get('user.apply.detail.button.pass', '通过')}</Button>);
};
export const SEARCH = 'search';
export const FILTER = 'filter';
export const UNREPLY = 'unreply';
export const getStatusNum = function(state) {
    let statusNum = '';
    switch (state) {
        case 'ongoing':
            statusNum = '0';
            break;
        case 'pass':
            statusNum = '1';
            break;
        case 'reject':
            statusNum = '2';
            break;
        case 'cancel':
            statusNum = '3';
            break;
    }
    return statusNum;
};
//将用户申请的新数据和旧数据进行统一
export const UnitOldAndNewUserInfo = function(userInfo) {
    //0 代表待审批 1代表已通过，2代表已驳回，3 代表已撤销
    var oldUserInfo = {
        approval_state: getStatusNum(_.get(userInfo,'status')),
        id: _.get(userInfo,'id'),
        producer: _.get(userInfo,'applicant'),
        presenter: _.get(userInfo,'applicant.nick_name'),
        message: {
            sales_team_name: '济南平台部',
            user_name: _.get(userInfo,'detail.user_name'),
            remark: _.get(userInfo,'remark'),
            type: _.get(userInfo,'detail.user_apply_type'),
            products: JSON.stringify(_.get(userInfo,'detail.user_grants_apply',[])),
            sales_name: 'cs-test00',
            nick_name: _.get(userInfo,'detail.nickname'),
            producer_team: '销售部-测试',
            tag: _.get(userInfo,'user_type'),
            customer_name: _.get(userInfo,'customer_name'),
            customer_id: _.get(userInfo,'customer_id'),
            order_id: _.get(userInfo,'order_id')},
        message_type: _.get(userInfo,'workflow_type'),
        customer_name: _.get(userInfo,'detail.customers[0].name'),
        topic: _.get(userInfo,''),
        approval_person: _.get(userInfo,''),
        isConsumed: _.get(userInfo,'isConsumed'),
    };
    return oldUserInfo;
};
//将申请审批的数据统一一下
export const UnitOldAndNewUserDetail = function(detail) {
    return {
        type: _.get(detail,'detail.user_apply_type'),
        sales_name: _.get(detail,'applicant.nick_name'),
        sales_team_name: _.get(detail,''),
        presenter_id: _.get(detail,'applicant.user_id'),
        customer_name: _.get(detail,'detail.customer_name'),
        customer_id: _.get(detail,'detail.customer_id'),
        user_names: [_.get(detail,'detail.user_name','')],
        nick_names: [_.get(detail,'detail.nickname','')],
        // user_names: _.map(_.get(detail,'detail.user_grants_apply',[]),'user_name'),
        user_ids: _.map(_.get(detail,'detail.user_grants_apply',[]),'user_id'),
        comment: _.get(detail,'remarks',''),
        approval_comment: '',
        approval_state: getStatusNum(_.get(detail,'status')),
        approval_person: '张淑娟',
        time: _.get(detail,'create_time'),
        approval_time: 1582096984760,
        id: _.get(detail,'id'),
        isConsumed: 'true',
        presenter: _.get(detail,'applicant.nick_name'),
        topic: _.get(detail,'detail.user_apply_name'),
        last_contact_time: 1581326993094,
        immutable_labels: _.get(detail,'detail.immutable'),
        customer_label: _.get(detail,'detail.customer_label'),
        apps: _.get(detail,'detail.user_grants_apply',[]),
    };
};
export const ALL = 'all';

export const getAllUnhandleApplyCount = () => {
    return Oplate.unread[APPLY_APPROVE_TYPES.UNHANDLEAPPLY];
};
//对数据进行处理
export const addCancelBtnPrivliege = (worklist) => {
    _.forEach(worklist, (workItem) => {
        if(workItem.status === 'ongoing'){
            //如果是我申请的，除了可以审批之外，我也可以撤回
            if (_.get(workItem, 'applicant.user_id') === userData.getUserData().user_id) {
                workItem.showCancelBtn = true;
            }
            var unhandleApplyList = Oplate.unread['unhandleApplyList'];
            var targetObj = _.find(unhandleApplyList, list => list.id === workItem.id);
            if(targetObj){
                workItem.showApproveBtn = true;
            }
        }

    });
};
var EventEmitter = require('events');
//暴露一个emitter，做自定义事件
exports.emitter = new EventEmitter();
//获取销售人员列表
const getSalesManList = function() {
    var Deferred = $.Deferred();
    salesmanAjax.getSalesmanListAjax().sendRequest({filter_manager: true})
        .success(list => {
            Deferred.resolve(list);
        }).error((xhr) => {//xhr:XMLHttpRequest
            Deferred.reject(xhr.responseJSON);
        });
    return Deferred.promise();
};
exports.getSalesManList = getSalesManList;

// 用户申请类型
export const userApplyType = [{
    value: 'apply_app_trial',
    title: Intl.get('home.page.user.trial.apply', '试用用户申请')
}, {
    value: 'apply_user_official',
    title: Intl.get('home.page.user.formal.apply', '签约用户申请')
}, {
    value: 'apply_grant_delay_multiapp',
    title: Intl.get('home.page.user.delay.apply', '用户延期申请')
},{
    value: 'apply_pwd_change',
    title: Intl.get('home.page.user.password.apply', '修改密码申请')
}, {
    value: 'apply_grant_status_change_multiapp',
    title: Intl.get('home.page.user.status.apply', '禁用用户申请')
}, {
    value: 'apply_sth_else',
    title: Intl.get('home.page.user.other.apply', '其他申请')
}];