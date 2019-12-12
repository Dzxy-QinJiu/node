var React = require('react');
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
import {tabNameList, TAB_KEYS} from '../utils/crm-util';
import BasicInfo from './basic_info';
import BasicOverview from './basic-overview';
import CustomerUsers from './users';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import UserDetail from 'MOD_DIR/app_user_manage/public/views/user-detail';
import contactUtil from '../utils/contact-util';
const RightPanel = rightPanelUtil.RightPanel;
import {isOpenCash, isCurtao, isSalesRole} from 'PUB_DIR/sources/utils/common-method-util';
import {PRIVILEGE_MAP} from 'PUB_DIR/sources/utils/consts';
let history = require('../../../../public/sources/history');
import crmPrivilegeConst from '../privilege-const';
import {phoneMsgEmitter, userDetailEmitter} from 'PUB_DIR/sources/utils/emitters';

class CrmRightPanel extends React.Component {
    state = {
        activeKey: this.props.activeKey || TAB_KEYS.OVERVIEW_TAB,//tab激活页的key
        apps: [],
        curOrder: {},
        curCustomer: _.cloneDeep(this.props.curCustomer),
        tabsContainerHeight: 'auto',
        getCusomerResultdMsg: '',//获取客户详情后的失败的提示
        getCustomerNoDataMsg: false,//获取客户详情没数据后的提示
        showDetailUserId: ''//展示用户详情的userId
    };

    componentWillMount() {
        if (_.isEmpty(this.props.curCustomer)) {
            if (this.props.currentId) {
                this.getCurCustomer(this.props.currentId);
            }
        }
    }

    componentDidMount() {
        this.setTabsContainerHeight();
        contactUtil.emitter.on('changeActiveTab', this.changeActiveKey);
        $(window).resize(e => {
            e.stopPropagation();
            this.setTabsContainerHeight();
        });
    }

    componentWillReceiveProps(nextProps) {
        if (!_.isEmpty(nextProps.curCustomer)) {
            this.setState({curCustomer: nextProps.curCustomer});
        } else if (nextProps.currentId !== this.props.currentId) {
            this.getCurCustomer(nextProps.currentId);
        }
        this.setTabsContainerHeight();
    }
    componentWillUnmount() {
        contactUtil.emitter.removeListener('changeActiveTab', this.changeActiveKey);
    }


    setTabsContainerHeight = () => {
        let tabsContainerHeight = $('body').height() - $('.basic-info-contianer').outerHeight(true);
        if ($('.phone-alert-modal-title').size()) {
            tabsContainerHeight -= $('.phone-alert-modal-title').outerHeight(true);
        }
        this.setState({tabsContainerHeight: tabsContainerHeight});
    };

    getCurCustomer = (id) => {
        let condition = {id: id};
        crmAjax.queryCustomer({data: JSON.stringify(condition)}).then(resData => {
            if (resData && _.isArray(resData.result) && resData.result.length) {
                this.setState({
                    getCusomerResultdMsg: '',
                    getCustomerNoDataMsg: false,
                    curCustomer: resData.result[0],
                });
            } else {
                this.setState({
                    getCustomerNoDataMsg: true,
                });
            }
        }, () => {
            this.setState({getCusomerResultdMsg: Intl.get('crm.detail.get.error', '获取客户详情失败')});
        });
    };

    //展示申请用户界面
    showApplyUserForm = (type, curOrder, apps) => {
        if (_.isFunction(this.props.showApplyUserForm)) {
            let customerName = this.state.curCustomer ? this.state.curCustomer.name : '';
            this.props.showApplyUserForm(type, curOrder, apps, customerName);
        }
    };

    hideRightPanel = (e) => {
        Trace.traceEvent(e, '关闭客户详情');
        this.props.hideRightPanel();
        this.setState({
            activeKey: TAB_KEYS.OVERVIEW_TAB
        });
    };
    //切换tab时的处理
    changeActiveKey = (key) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.ant-tabs-nav-wrap .ant-tabs-nav'), '查看' + tabNameList[key]);
        this.setState({
            activeKey: key
        });
    };
    closeUserDetail = () => {
        //触发打开用户详情面板
        userDetailEmitter.emit(userDetailEmitter.CLOSE_USER_DETAIL);
    };
    showUserDetail = (userId) => {
        //触发打开用户详情面板
        userDetailEmitter.emit(userDetailEmitter.OPEN_USER_DETAIL, {userId: userId});
    };

    renderCustomerDetail(){
        return (
            <div className="customer-detail-content">
                <BasicInfo isRepeat={this.props.isRepeat}
                    curCustomer={this.state.curCustomer}
                    refreshCustomerList={this.props.refreshCustomerList}
                    editCustomerBasic={this.props.editCustomerBasic}
                    handleFocusCustomer={this.props.handleFocusCustomer}
                    setTabsContainerHeight={this.setTabsContainerHeight}
                    showRightPanel={this.props.showRightPanel}
                    disableEdit={this.props.disableEdit}
                    hideRightPanel={this.props.hideRightPanel}
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
                                        disableEdit={this.props.disableEdit}
                                        hideContactWay={this.props.hideContactWay}
                                        updateCustomerLastContact={this.props.updateCustomerLastContact}
                                        showUserDetail={this.showUserDetail}
                                        getNewDistributeCustomer={this.props.getNewDistributeCustomer}
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
                                        disableEdit={this.props.disableEdit}
                                        hideContactWay={this.props.hideContactWay}
                                        isUseCustomerContacts={this.props.isUseCustomerContacts}
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
                                        disableEdit={this.props.disableEdit}
                                        hideContactWay={this.props.hideContactWay}
                                        updateCustomerLastContact={this.props.updateCustomerLastContact}
                                    />
                                ) : null}
                            </TabPane>
                            {//用获取客户的用户列表的权限并且有获取用户列表的权限，并且不是从回收站中打开客户详情,并且不是csm.curtao.com域名下，才展示用户列表
                                hasPrivilege(crmPrivilegeConst.APP_USER_QUERY) && !this.props.disableEdit && !isCurtao() ? (
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
                                                disableEdit={this.props.disableEdit}
                                                showUserDetail={this.showUserDetail}
                                            />
                                        ) : null}
                                    </TabPane>
                                ) : null}
                            {//csm.curtao.com域名下不展示订单
                                isCurtao() ? null : (
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
                                                disableEdit={this.props.disableEdit}
                                            />
                                        ) : null}
                                    </TabPane>
                                )}
                            {//有合同查询权限并且开通了营收中心时，才展示合同列表
                                hasPrivilege(crmPrivilegeConst.CRM_CONTRACT_QUERY_COMMON_BASE) && isOpenCash() ? (
                                    <TabPane
                                        tab={Intl.get('contract.125', '合同')}
                                        key={TAB_KEYS.CONTRACT_TAB}
                                    >
                                        {this.state.activeKey === TAB_KEYS.CONTRACT_TAB ? (
                                            <Contract
                                                curCustomer={this.state.curCustomer}
                                                disableEdit={this.props.disableEdit}
                                            />
                                        ) : null}
                                    </TabPane>
                                ) : null
                            }
                            <TabPane
                                tab={Intl.get('user.change.record', '变更记录')}
                                key={TAB_KEYS.DYNAMIC_TAB}

                            >
                                {this.state.activeKey === TAB_KEYS.DYNAMIC_TAB ? (
                                    <Dynamic
                                        currentId={this.state.curCustomer.id}
                                    />
                                ) : null}
                            </TabPane>
                            {//从回收站中打开客户详情时，不展示联系计划
                                this.props.disableEdit ? null : (
                                    <TabPane
                                        tab={Intl.get('crm.right.schedule', '联系计划')}
                                        key={TAB_KEYS.SCHEDULE_TAB}
                                    >
                                        {this.state.activeKey === TAB_KEYS.SCHEDULE_TAB ? (
                                            <CrmSchedule
                                                curCustomer={this.state.curCustomer}
                                            />
                                        ) : null}
                                    </TabPane>)}
                        </Tabs>
                    ) : null}
                </div>
            </div>
        );
    }
    handleClickCustomerPool = () => {
        //跳转到客户界面的客户池
        history.push('/accounts', {showCustomerPool: true, condition: {name: _.get(this, 'props.currentName')}});
    }
    handleClickCustomerRecycle = () => {
        //跳转到客户界面的回收站
        history.push('/accounts', {
            showCustomerRecycle: true, condition: {
                field: 'name',
                value: _.get(this, 'props.currentName')
            }
        });
    };
    render() {

        if (this.state.getCusomerResultdMsg || this.state.getCustomerNoDataMsg){
            return (
                <div className="crm-detail-no-data-tip">
                    <div className="iconfont icon-phone-call-out-tip"></div>
                    {this.state.getCusomerResultdMsg || ''}
                    {this.state.getCustomerNoDataMsg ?
                        isSalesRole() ? <ReactIntl.FormattedMessage
                            id="crm.search.customer.detail.customer.pool"
                            defaultMessage={'客户已被删除或已被释放到{customerpool}'}
                            values={{
                                'customerpool': <a
                                    style={{textDecoration: 'underline'}}
                                    onClick={this.handleClickCustomerPool.bind(this)}>
                                    {Intl.get('crm.customer.pool', '客户池')}</a>
                            }}
                        /> : <ReactIntl.FormattedMessage
                            id="crm.search.customer.no.customer.pool.dash"
                            defaultMessage={'客户已被删除或已被释放到客户池，请到{recycle}或{customerpool}查看'}
                            values={{
                                'recycle': <a
                                    style={{textDecoration: 'underline'}}
                                    onClick={this.handleClickCustomerRecycle.bind(this)}>
                                    {Intl.get('crm.customer.recycle.bin', '回收站')}</a>,
                                'customerpool': <a
                                    style={{textDecoration: 'underline'}}
                                    onClick={this.handleClickCustomerPool.bind(this)}>
                                    {Intl.get('crm.customer.pool', '客户池')}</a>
                            }}
                        />
                        : null}
                </div>
            );
        } else {
            return this.renderCustomerDetail();
        }
    }
}
CrmRightPanel.propTypes = {
    curCustomer: PropTypes.object,
    currentId: PropTypes.string,
    activeKey: PropTypes.string,
    showApplyUserForm: PropTypes.func,
    hideRightPanel: PropTypes.func,
    isRepeat: PropTypes.bool,
    refreshCustomerList: PropTypes.array,
    editCustomerBasic: PropTypes.func,
    handleFocusCustomer: PropTypes.func,
    showRightPanel: PropTypes.func,
    disableEdit: PropTypes.bool,
    hideContactWay: PropTypes.bool,
    updateCustomerDefContact: PropTypes.func,
    ShowCustomerUserListPanel: PropTypes.func,
    userViewShowCustomerUserListPanel: PropTypes.func,
    showOpenAppForm: PropTypes.func,
    returnInfoPanel: PropTypes.func,
    updateCustomerLastContact: PropTypes.func,
    isUseCustomerContacts: PropTypes.bool,
    getNewDistributeCustomer: PropTypes.func,
};
module.exports = CrmRightPanel;


