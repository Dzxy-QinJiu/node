// require('../css/crm-right-panel.less');

var Tabs = require('antd').Tabs;
var TabPane = Tabs.TabPane;
var rightPanelUtil = require('../../../../components/rightPanel/index');
var Contacts = require('./contacts');
var Dynamic = require('./dynamic');
var CrmSchedule = require('./schedule');
var Order = require('./order');
import Contract from './contract';
var CustomerRecord = require('./customer_record');
var crmAjax = require('../ajax');
import Trace from 'LIB_DIR/trace';
import {tabNameList} from '../utils/crm-util';
import BasicInfo from './basic_info';
import BasicOverview from './basic-overview';
import CustomerUsers from './users';
import {isEqualArray} from 'LIB_DIR/func';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';

const TAB_KEYS = {
    OVERVIEW_TAB: '1',//概览页
    CONTACT_TAB: '2',//联系人
    TRACE_TAB: '3',//跟进记录
    USER_TAB: '4',//用户
    ORDER_TAB: '5',//订单
    CONTRACT_TAB: '6', // 合同
    DYNAMIC_TAB: '7',//动态
    SCHEDULE_TAB: '8'//日程



    // （联系计划）
};
var CrmRightPanel = React.createClass({
    getInitialState: function() {
        return {
            activeKey: TAB_KEYS.OVERVIEW_TAB,//tab激活页的key
            apps: [],
            curOrder: {},
            curCustomer: this.props.curCustomer,
            tabsContainerHeight: 'auto',
            getCusomerResultdMsg: ''//获取客户详情后的失败或无数据的提示
        };
    },

    componentWillMount: function() {
        if (!this.state.curCustomer) {
            if (this.props.currentId) {
                this.getCurCustomer(this.props.currentId);
            }
        }
    },
    componentDidMount: function() {
        this.setTabsContainerHeight();
        $(window).resize(e => {
            e.stopPropagation();
            this.setTabsContainerHeight();
        });
    },

    componentWillReceiveProps: function(nextProps) {
        if (nextProps.curCustomer) {
            this.setState({curCustomer: nextProps.curCustomer});
        } else if (nextProps.currentId !== this.props.currentId) {
            this.getCurCustomer(nextProps.currentId);
        }
        this.setTabsContainerHeight();
    },

    setTabsContainerHeight: function() {
        let tabsContainerHeight = $('body').height() - $('.basic-info-contianer').outerHeight(true);
        if ($('.phone-alert-modal-title').size()) {
            tabsContainerHeight -= $('.phone-alert-modal-title').outerHeight(true);
        }
        this.setState({tabsContainerHeight: tabsContainerHeight});
    },

    getCurCustomer: function(id) {
        let condition = {id: id};
        crmAjax.queryCustomer(condition).then(resData => {
            if (resData && _.isArray(resData.result) && resData.result.length) {
                this.state.curCustomer = resData.result[0];
                this.state.getCusomerResultdMsg = '';
            } else {
                this.state.getCusomerResultdMsg = Intl.get('crm.detail.no.data', '该客户已被删除或转走');
            }
            this.setState(this.state);
        }, () => {
            this.state.getCusomerResultdMsg = Intl.get('crm.detail.get.error', '获取客户详情失败');
            this.setState(this.state);
        });
    },

    //展示申请用户界面
    showApplyUserForm: function(type, curOrder, apps) {
        if (_.isFunction(this.props.showApplyUserForm)) {
            let customerName = this.state.curCustomer ? this.state.curCustomer.name : '';
            this.props.showApplyUserForm(type, curOrder, apps, customerName);
        }
    },
    hideRightPanel: function(e) {
        Trace.traceEvent(e, '关闭客户详情');
        this.props.hideRightPanel();
        this.setState({
            activeKey: TAB_KEYS.OVERVIEW_TAB
        });
    },
    //切换tab时的处理
    changeActiveKey: function(key) {
        Trace.traceEvent($(this.getDOMNode()).find('.ant-tabs-nav-wrap .ant-tabs-nav'), '查看' + tabNameList[key]);
        this.setState({
            activeKey: key
        });
    },
    render: function() {
        if (this.state.getCusomerResultdMsg) {//未获取到详情及获取出错时的提示
            return (<div className="no-data-tip">{this.state.getCusomerResultdMsg}</div>);
        }
        return (
            <div className="customer-detail-content">
                <BasicInfo isRepeat={this.props.isRepeat}
                    curCustomer={this.state.curCustomer}
                    refreshCustomerList={this.props.refreshCustomerList}
                    editCustomerBasic={this.props.editCustomerBasic}
                    handleFocusCustomer={this.props.handleFocusCustomer}
                    setTabsContainerHeight={this.setTabsContainerHeight}
                    showRightPanel={this.props.showRightPanel}
                />
                <div className="crm-right-panel-content" style={{height: this.state.tabsContainerHeight}}>
                    {this.state.curCustomer ? (
                        <Tabs
                            defaultActiveKey={TAB_KEYS.OVERVIEW_TAB}
                            activeKey={this.state.activeKey}
                            onChange={this.changeActiveKey}
                        >
                            <TabPane
                                tab={Intl.get('crm.basic.overview', '概览')}
                                key={TAB_KEYS.OVERVIEW_TAB}
                            >
                                {this.state.activeKey === TAB_KEYS.OVERVIEW_TAB ? (
                                    <BasicOverview
                                        isRepeat={this.props.isRepeat}
                                        curCustomer={this.state.curCustomer}
                                        refreshCustomerList={this.props.refreshCustomerList}
                                        editCustomerBasic={this.props.editCustomerBasic}
                                        changeActiveKey={this.changeActiveKey}
                                        callNumber={this.props.callNumber}
                                        getCallNumberError={this.props.getCallNumberError}
                                    />
                                ) : null}
                            </TabPane>
                            <TabPane
                                tab={Intl.get('call.record.contacts', '联系人')}
                                key={TAB_KEYS.CONTACT_TAB}
                            >
                                {this.state.activeKey === TAB_KEYS.CONTACT_TAB ? (
                                    <Contacts
                                        updateCustomerDefContact={this.props.updateCustomerDefContact}
                                        refreshCustomerList={this.props.refreshCustomerList}
                                        curCustomer={this.state.curCustomer}
                                        callNumber={this.props.callNumber}
                                        getCallNumberError={this.props.getCallNumberError}
                                    />
                                ) : null}
                            </TabPane>
                            <TabPane
                                tab={Intl.get('menu.trace', '跟进记录')}
                                key={TAB_KEYS.TRACE_TAB}
                            >
                                {this.state.activeKey === TAB_KEYS.TRACE_TAB ? (
                                    <CustomerRecord
                                        curCustomer={this.state.curCustomer}
                                        refreshCustomerList={this.props.refreshCustomerList}
                                        callNumber={this.props.callNumber}
                                        getCallNumberError={this.props.getCallNumberError}
                                    />
                                ) : null}
                            </TabPane>
                            <TabPane
                                tab={Intl.get('crm.detail.user', '用户')}
                                key={TAB_KEYS.USER_TAB}
                            >
                                {this.state.activeKey === TAB_KEYS.USER_TAB ? (
                                    <CustomerUsers
                                        curCustomer={this.state.curCustomer}
                                        refreshCustomerList={this.props.refreshCustomerList}
                                        ShowCustomerUserListPanel={this.props.ShowCustomerUserListPanel}
                                        userViewShowCustomerUserListPanel={this.props.userViewShowCustomerUserListPanel}
                                        showOpenAppForm={this.props.showOpenAppForm}
                                        closeOpenAppPanel={this.props.returnInfoPanel}
                                    />
                                ) : null}
                            </TabPane>
                            <TabPane
                                tab={Intl.get('user.apply.detail.order', '订单')}
                                key={TAB_KEYS.ORDER_TAB}
                            >
                                {this.state.activeKey === TAB_KEYS.ORDER_TAB ? (
                                    <Order
                                        closeRightPanel={this.props.hideRightPanel}
                                        curCustomer={this.state.curCustomer}
                                        refreshCustomerList={this.props.refreshCustomerList}
                                        showApplyUserForm={this.showApplyUserForm}
                                    />
                                ) : null}
                            </TabPane>
                            {
                                hasPrivilege('OPLATE_CONTRACT_QUERY') ? (
                                    <TabPane
                                        tab={Intl.get('contract.125', '合同')}
                                        key={TAB_KEYS.CONTRACT_TAB}
                                    >
                                        {this.state.activeKey === TAB_KEYS.CONTRACT_TAB ? (
                                            <Contract
                                                curCustomer={this.state.curCustomer}
                                            />
                                        ) : null}
                                    </TabPane>
                                ) : null
                            }
                            <TabPane
                                tab={Intl.get('crm.39', '动态')}
                                key={TAB_KEYS.DYNAMIC_TAB}

                            >
                                {this.state.activeKey === TAB_KEYS.DYNAMIC_TAB ? (
                                    <Dynamic
                                        currentId={this.state.curCustomer.id}
                                    />
                                ) : null}
                            </TabPane>
                            <TabPane
                                tab={Intl.get('crm.right.schedule', '联系计划')}
                                key={TAB_KEYS.SCHEDULE_TAB}
                            >
                                {this.state.activeKey === TAB_KEYS.SCHEDULE_TAB ? (
                                    <CrmSchedule
                                        curCustomer={this.state.curCustomer}
                                        callNumber={this.props.callNumber}
                                        getCallNumberError={this.props.getCallNumberError}
                                    />
                                ) : null}
                            </TabPane>
                        </Tabs>
                    ) : null}
                </div>
            </div>
        );
    }
});

module.exports = CrmRightPanel;

