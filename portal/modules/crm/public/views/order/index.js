require('../../css/order.less');
import {Icon, Button, Checkbox, Menu, Dropdown, Alert} from 'antd';
import TimeUtil from 'PUB_DIR/sources/utils/time-format-util';
const GeminiScrollbar = require('../../../../../components/react-gemini-scrollbar');
const OrderStore = require('../../store/order-store');
const OrderAction = require('../../action/order-actions');
const OrderItem = require('./order-item');
const OrderForm = require('./order-form');
const history = require('../../../../../public/sources/history');
const userData = require('../../../../../public/sources/user-data');
import Trace from 'LIB_DIR/trace';
import {RightPanel} from 'CMP_DIR/rightPanel';
import Spinner from 'CMP_DIR/spinner';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import classNames from 'classnames';
import NoDataIconTip from 'CMP_DIR/no-data-icon-tip';
//高度常量
const LAYOUT_CONSTANTS = {
    MERGE_SELECT_HEIGHT: 30,//合并面板下拉框的高度
    TOP_NAV_HEIGHT: 36 + 8,//36：头部导航的高度，8：导航的下边距
    MARGIN_BOTTOM: 8, //跟进记录页的下边距
    ADD_ORDER_HEIGHHT: 155,//添加订单面板的高度
    TOP_TOTAL_HEIGHT: 30//共xxx条的高度
};
//用户类型的转换对象
const userTypeMap = {
    '正式用户': Intl.get('common.official', '签约'),
    '试用用户': Intl.get('common.trial', '试用'),
    'special': Intl.get('user.type.presented', '赠送'),
    'training': Intl.get('user.type.train', '培训'),
    'internal': Intl.get('user.type.employee', '员工')
};
const APPLY_TYPES = {
    STOP_USE: 'stopUse',//停用
    DELAY: 'Delay',//延期
    EDIT_PASSWORD: 'editPassword',//修改密码
    OTHER: 'other',//其他类型
    OPEN_APP: 'openAPP'//开通应用
};

const OrderIndex = React.createClass({
    getInitialState: function() {
        return {...OrderStore.getState(), curCustomer: this.props.curCustomer};
    },

    onChange: function() {
        this.setState(OrderStore.getState());
    },

    componentDidMount: function() {
        OrderStore.listen(this.onChange);
        OrderAction.getAppList();
        this.getOrderList(this.props.curCustomer, this.props.isMerge);
        OrderAction.getSysStageList();
    },
    getOrderList: function(curCustomer, isMerge) {
        if (isMerge) {
            OrderAction.getMergeOrderList(curCustomer);
        } else {
            let type = 'user';//CRM_USER_LIST_SALESOPPORTUNITY
            if (hasPrivilege('CRM_MANAGER_LIST_SALESOPPORTUNITY')) {
                type = 'manager';
            }
            OrderAction.setOrderListLoading(true);
            OrderAction.getOrderList({customer_id: curCustomer.id}, {type: type});
        }
    },
    componentWillReceiveProps: function(nextProps) {
        let oldCustomerId = this.state.curCustomer.id;
        if (nextProps.isMerge || nextProps.curCustomer && nextProps.curCustomer.id !== oldCustomerId) {
            this.state.orderList = nextProps.curCustomer.sales_opportunities || [];
            this.setState({curCustomer: nextProps.curCustomer});
            setTimeout(() => {
                this.getOrderList(nextProps.curCustomer, nextProps.isMerge);
            });
        }
    },

    componentWillUnmount: function() {
        OrderStore.unlisten(this.onChange);
    },

    showForm: function(id) {
        var message = id ? '编辑订单' : '添加订单';
        Trace.traceEvent($(this.getDOMNode()).find('.crm-right-panel-addbtn'), message);
        OrderAction.showForm(id);
    },
    //获取到期后的状态
    getOverDraftStatus: function(over_draft) {
        let status = Intl.get('user.expire.immutability', '到期不变');
        if (over_draft === '1') {
            status = Intl.get('user.expire.stop', '到期停用');
        } else if (over_draft === '2') {
            status = Intl.get('user.expire.degrade', '到期降级');
        }
        return status;
    },

    renderOverDraft: function(app) {
        if (app.is_disabled === 'true') {
            return Intl.get('user.status.stopped', '已停用');
        } else {
            let end_time = app.end_time;
            if (end_time === 0) {
                return Intl.get('user.overdue.not.forever', '永不过期');
            } else if (end_time) {
                const over_draft_status = this.getOverDraftStatus(app.over_draft);
                let duration = moment.duration(end_time - moment().valueOf());
                if (duration > 0) {
                    let over_draft_days = duration.days(); //天
                    if (duration.months() > 0) {//月
                        over_draft_days += duration.months() * 30;
                    }
                    if (duration.years() > 0) {//年
                        over_draft_days += duration.years() * 365;
                    }
                    if (over_draft_days > 0) {
                        return `${Intl.get('oplate.user.analysis.25', '{count}天后', {count: over_draft_days})}${over_draft_status}`;
                    } else {
                        //x时x分x秒
                        let timeObj = TimeUtil.secondsToHourMinuteSecond(Math.floor(duration / 1000));
                        return `${Intl.get('oplate.user.analysis.40', '{time}后', {time: timeObj.timeDescr})}${over_draft_status}`;
                    }
                } else {
                    return Intl.get('user.status.expired', '已到期');
                }
            } else {
                return '';
            }
        }
    },

    //应用选择的处理
    onChangeAppCheckBox: function(userId, appId, e) {
        OrderAction.onChangeAppCheckBox({userId: userId, appId: appId, checked: e.target.checked});
    },
    //用户的应用
    getUserAppOptions: function(userObj) {
        let appList = userObj.apps;
        let userId = userObj.user ? userObj.user.user_id : '';
        if (_.isArray(appList) && appList.length) {
            return appList.map((app,index) => {
                let appName = app ? app.app_name || '' : '';
                let overDraftCls = classNames('user-app-over-draft', {'user-app-stopped-status': app.is_disabled === 'true'});
                return (
                    <Checkbox key={index} checked={app.checked} onChange={this.onChangeAppCheckBox.bind(this, userId, app.app_id)}>
                        {app.app_logo ?
                            (<img className="crm-user-app-logo" src={app.app_logo || ''} alt={appName}/>)
                            : (<span className="crm-user-app-logo-font">{appName.substr(0, 1)}</span>)
                        }
                        <span className="user-app-name">{appName || ''}</span>
                        <span className="user-app-type">{app.user_type ? userTypeMap[app.user_type] : ''}</span>
                        <span className={overDraftCls}>{this.renderOverDraft(app)}</span>
                    </Checkbox>);
            });
        }
        return [];
    },
    //用户名前的选择框
    onChangeUserCheckBox: function(userId, e) {
        OrderAction.onChangeUserCheckBox({userId: userId, checked: e.target.checked});
    },
    handleMenuClick: function(applyType) {
        let traceDescr = '';
        if (applyType === APPLY_TYPES.STOP_USE) {
            traceDescr = '打开申请停用面板';
        } else if (applyType === APPLY_TYPES.EDIT_PASSWORD) {
            traceDescr = '打开申请修改密码面板';
        } else if (applyType === APPLY_TYPES.DELAY) {
            traceDescr = '打开申请延期面板';
        } else if (applyType === APPLY_TYPES.OTHER) {
            traceDescr = '打开申请其他类型面板';
        } else if (applyType === APPLY_TYPES.OPEN_APP) {
            traceDescr = '打开申请开通应用面板';
        }
        Trace.traceEvent(this.getDOMNode(), traceDescr);
        OrderAction.onChangeApplyType(applyType);
    },
    getApplyBtnType: function(applyType) {
        return this.state.applyType === applyType ? 'primary' : '';
    },
    //发邮件使用的参数
    getEmailData: function(checkedUsers) {
        let email_customer_names = [];
        let email_user_names = [];

        if (!_.isArray(checkedUsers)) {
            checkedUsers = [];
        }
        _.each(checkedUsers, (obj) => {
            email_customer_names.push(obj.customer && obj.customer.customer_name || '');
            email_user_names.push(obj.user && obj.user.user_name || '');
        });
        return {
            email_customer_names: email_customer_names.join('、'),
            email_user_names: email_user_names.join('、')
        };
    },

    render: function() {
        const _this = this;
        const appList = this.state.appList;
        let divHeight = $(window).height() - LAYOUT_CONSTANTS.TOP_NAV_HEIGHT - LAYOUT_CONSTANTS.MARGIN_BOTTOM;
        //减头部的客户基本信息高度
        divHeight -= parseInt($('.basic-info-contianer').outerHeight(true));
        if ($('.phone-alert-modal-title').size()) {
            divHeight -= $('.phone-alert-modal-title').outerHeight(true);
        }
        //减添加订单面版的高度
        if (this.state.isShowAddContactForm) {
            divHeight -= LAYOUT_CONSTANTS.ADD_ORDER_HEIGHHT;
        } else {//减共xxx条的高度
            divHeight -= LAYOUT_CONSTANTS.TOP_TOTAL_HEIGHT;
        }
        //合并面板，去掉客户选择框的高度
        if (this.props.isMerge) {
            divHeight -= LAYOUT_CONSTANTS.MERGE_SELECT_HEIGHT;
        }
        let isApplyButtonShow = false;
        if ((userData.hasRole(userData.ROLE_CONSTANS.SALES) || userData.hasRole(userData.ROLE_CONSTANS.SALES_LEADER))) {
            isApplyButtonShow = true;
        }

        let orderListLength = _.isArray(this.state.orderList) ? this.state.orderList.length : 0;
        return (
            <div className="order-container" data-tracename="订单页面">
                {this.state.isAddFormShow ? null : (<div className="order-top-block">
                    <span className="total-tip crm-detail-total-tip">
                        {this.state.orderListLoading ? null : orderListLength ? (
                            <ReactIntl.FormattedMessage
                                id="sales.frontpage.total.list"
                                defaultMessage={'共{n}条'}
                                values={{'n': orderListLength + ''}}/>) :
                            Intl.get('crm.no.order.tip', '该客户还没有添加过订单')}
                    </span>
                    {this.props.isMerge ? null : (
                        <Button className='crm-detail-add-btn'
                            onClick={this.showForm.bind(this, '')}>
                            {Intl.get('crm.161', '添加订单')}
                        </Button>
                    )}
                </div>)
                }
                <div className="order-container-scroll" style={{height: divHeight}} ref="scrollOrderList">
                    <GeminiScrollbar>
                        {this.state.isAddFormShow ? (
                            <OrderForm order={{}}
                                stageList={_this.state.stageList}
                                appList={appList}
                                isMerge={_this.props.isMerge}
                                customerId={_this.props.curCustomer.id}
                                refreshCustomerList={_this.props.refreshCustomerList}
                                updateMergeCustomerOrder={_this.props.updateMergeCustomerOrder}/>) : null}
                        {this.state.orderListLoading ? (
                            <Spinner />) : orderListLength ? (this.state.orderList.map(function(order, i) {
                            return (
                                order.isEdit ?
                                    (<OrderForm key={i}
                                        order={order}
                                        stageList={_this.state.stageList}
                                        appList={appList}
                                        isMerge={_this.props.isMerge}
                                        customerId={_this.props.curCustomer.id}
                                        refreshCustomerList={_this.props.refreshCustomerList}
                                        updateMergeCustomerOrder={_this.props.updateMergeCustomerOrder}
                                    />) :
                                    (<OrderItem key={i}
                                        appList={appList}
                                        isMerge={_this.props.isMerge}
                                        stageList={_this.state.stageList}
                                        showApplyUserForm={_this.props.showApplyUserForm}
                                        closeRightPanel={_this.props.closeRightPanel}
                                        showForm={_this.showForm}
                                        refreshCustomerList={_this.props.refreshCustomerList}
                                        updateMergeCustomerOrder={_this.props.updateMergeCustomerOrder}
                                        delMergeCustomerOrder={_this.props.delMergeCustomerOrder}
                                        customerName={_this.props.curCustomer.name}
                                        isApplyButtonShow={isApplyButtonShow}
                                        onChange={_this.onChange}
                                        order={order}/>)
                            );
                        })) : this.state.isAddFormShow ? null : <NoDataIconTip tipContent={Intl.get('common.no.more.order', '暂无订单')}/>
                        }
                    </GeminiScrollbar>
                </div>
            </div>
        );
    }
})
;

module.exports = OrderIndex;
