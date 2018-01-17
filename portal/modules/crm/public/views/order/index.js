require("../../css/order.less");
import {Icon, Button, Checkbox, Menu, Dropdown, Alert} from "antd";
import TimeUtil from 'PUB_DIR/sources/utils/time-format-util';
const GeminiScrollbar = require('../../../../../components/react-gemini-scrollbar');
const OrderStore = require("../../store/order-store");
const OrderAction = require("../../action/order-actions");
const OrderItem = require("./order-item");
const OrderForm = require("./order-form");
const history = require("../../../../../public/sources/history");
const userData = require("../../../../../public/sources/user-data");
import Trace from "LIB_DIR/trace";
import {RightPanel} from  "CMP_DIR/rightPanel";
import Spinner from "CMP_DIR/spinner";
import ApplyOpenAppPanel from "MOD_DIR/app_user_manage/public/views/v2/apply-user";
import CrmUserApplyForm from "./crm-user-apply-form";
import {hasPrivilege} from "CMP_DIR/privilege/checker";
import classNames from "classnames";

//高度常量
const LAYOUT_CONSTANTS = {
    MERGE_SELECT_HEIGHT: 30,//合并面板下拉框的高度
    RIGHT_PANEL_PADDING_TOP: 20,//右侧面板顶部padding
    RIGHT_PANEL_PADDING_BOTTOM: 20,//右侧面板底部padding
    CONTACT_LIST_MARGIN_BOTTOM: 20,//列表距离底部margin
    RIGHT_PANEL_TAB_HEIGHT: 36,//右侧面板tab高度
    RIGHT_PANEL_TAB_MARGIN_BOTTOM: 17,//右侧面板tab的margin
    CONTACT_ADD_BUTTON_HEIGHT: 34  //添加按钮高度
};
//用户类型的转换对象
const userTypeMap = {
    "正式用户": Intl.get("common.official", "签约"),
    "试用用户": Intl.get("common.trial", "试用"),
    "special": Intl.get("user.type.presented", "赠送"),
    "training": Intl.get("user.type.train", "培训"),
    "internal": Intl.get("user.type.employee", "员工")
};
const APPLY_TYPES = {
    STOP_USE: "stopUse",//停用
    DELAY: "Delay",//延期
    EDIT_PASSWORD: "editPassword",//修改密码
    OTHER: "other",//其他类型
    OPEN_APP: "openAPP"//开通应用
};

const OrderIndex = React.createClass({
        getInitialState: function () {
            return {...OrderStore.getState(), curCustomer: this.props.curCustomer};
        },

        onChange: function () {
            this.setState(OrderStore.getState());
        },

        componentDidMount: function () {
            OrderStore.listen(this.onChange);
            OrderAction.getAppList();
            this.getOrderList(this.props.curCustomer, this.props.isMerge);
            OrderAction.getSysStageList();
            if (!this.props.isMerge) {//合并客户时，不需要获取客户的用户列表
                OrderAction.setPageNum(1);
                setTimeout(() => this.getCrmUserList());
            }
        },
        getOrderList: function (curCustomer, isMerge) {
            if (isMerge) {
                OrderAction.getMergeOrderList(curCustomer);
            } else {
                let type = 'user';//CRM_USER_LIST_SALESOPPORTUNITY
                if (hasPrivilege("CRM_MANAGER_LIST_SALESOPPORTUNITY")) {
                    type = 'manager';
                }
                OrderAction.setOrderListLoading(true);
                OrderAction.getOrderList({customer_id: curCustomer.id}, {type: type});
            }
        },
        componentWillReceiveProps: function (nextProps) {
            let oldCustomerId = this.state.curCustomer.id;
            if (nextProps.isMerge || nextProps.curCustomer && nextProps.curCustomer.id !== oldCustomerId) {
                this.state.orderList = nextProps.curCustomer.sales_opportunities || [];
                this.setState({curCustomer: nextProps.curCustomer});
                setTimeout(() => {
                    this.getOrderList(nextProps.curCustomer, nextProps.isMerge);
                    if (!nextProps.isMerge) {//合并客户时，不需要获取客户的用户列表
                        OrderAction.setPageNum(1);
                        this.getCrmUserList();
                    }
                });
            }
        },

        componentWillUnmount: function () {
            OrderStore.unlisten(this.onChange);
        },

        getCrmUserList: function () {
            if (this.state.pageNum === 1) {
                OrderAction.setCrmUsersLoading(true);
            }
            OrderAction.getCrmUserList({
                customer_id: this.state.curCustomer.id,
                page_num: this.state.pageNum,
                page_size: this.state.pageSize
            });
        },

        showForm: function (id) {
            var message = id ? "编辑订单":"添加订单";
            Trace.traceEvent($(this.getDOMNode()).find(".crm-right-panel-addbtn"), message);
            OrderAction.showForm(id);
        },
        //获取到期后的状态
        getOverDraftStatus: function (over_draft) {
            let status = Intl.get("user.expire.immutability", "到期不变");
            if (over_draft === "1") {
                status = Intl.get("user.expire.stop", "到期停用");
            } else if (over_draft === "2") {
                status = Intl.get("user.expire.degrade", "到期降级");
            }
            return status;
        },

        renderOverDraft: function (app) {
            if (app.is_disabled === "true") {
                return Intl.get("user.status.stopped", "已停用");
            } else {
                let end_time = app.end_time;
                if (end_time == 0) {
                    return Intl.get("user.overdue.not.forever", "永不过期");
                } else if (end_time) {
                    const over_draft_status = this.getOverDraftStatus(app.over_draft);
                    let duration = moment.duration(end_time - moment().valueOf());
                    if (duration > 0) {
                        let over_draft_days = duration.days();  //天
                        if (duration.months() > 0) {//月
                            over_draft_days += duration.months() * 30;
                        }
                        if (duration.years() > 0) {//年
                            over_draft_days += duration.years() * 365;
                        }
                        if (over_draft_days > 0) {
                            return `${Intl.get("oplate.user.analysis.25", "{count}天后", {count: over_draft_days})}${over_draft_status}`;
                        } else {
                            //x时x分x秒
                            let timeObj = TimeUtil.secondsToHourMinuteSecond(Math.floor(duration / 1000));
                            return `${Intl.get("oplate.user.analysis.40", "{time}后", {time: timeObj.timeDescr})}${over_draft_status}`;
                        }
                    } else {
                        return Intl.get("user.status.expired", "已到期");
                    }
                } else {
                    return "";
                }
            }
        },

        //应用选择的处理
        onChangeAppCheckBox: function (userId, appId, e) {
            OrderAction.onChangeAppCheckBox({userId: userId, appId: appId, checked: e.target.checked});
        },
        //用户的应用
        getUserAppOptions: function (userObj) {
            let appList = userObj.apps;
            let userId = userObj.user ? userObj.user.user_id : "";
            if (_.isArray(appList) && appList.length) {
                return appList.map((app) => {
                    let appName = app ? app.app_name || "" : "";
                    let overDraftCls = classNames("user-app-over-draft", {"user-app-stopped-status": app.is_disabled === "true"});
                    return (
                        <Checkbox checked={app.checked} onChange={this.onChangeAppCheckBox.bind(this, userId, app.app_id)}>
                            {app.app_logo ?
                                (<img className="crm-user-app-logo" src={app.app_logo || ""} alt={appName}/>)
                                : (<span className="crm-user-app-logo-font">{appName.substr(0, 1)}</span>)
                            }
                            <span className="user-app-name">{appName || ""}</span>
                            <span className="user-app-type">{app.user_type ? userTypeMap[app.user_type] : ""}</span>
                            <span className={overDraftCls}>{this.renderOverDraft(app)}</span>
                        </Checkbox>);
                });
            }
            return [];
        },
        //用户名前的选择框
        onChangeUserCheckBox: function (userId, e) {
            OrderAction.onChangeUserCheckBox({userId: userId, checked: e.target.checked});
        },
        renderCrmUserList: function () {
            if (this.state.isLoadingCrmUsers) {
                return <Spinner />
            }
            if (this.state.crmUsersErrorMsg) {
                return (
                    <div className="get-crm-users-error-tip">
                        <Alert
                            message={this.state.crmUsersErrorMsg}
                            type="error"
                            showIcon={true}
                        />
                    </div>);
            }
            let crmUserList = this.state.crmUserList;
            if (_.isArray(crmUserList) && crmUserList.length) {
                return crmUserList.map((userObj) => {
                    let user = _.isObject(userObj) ? userObj.user : {};
                    return (
                        <div className="crm-user-item">
                            <div className="crm-user-name">
                                <Checkbox checked={user.checked}
                                          onChange={this.onChangeUserCheckBox.bind(this, user.user_id)}>
                                    {user.user_name}({user.nick_name})
                                </Checkbox>
                            </div>
                            <div className="crm-user-apps">
                                {this.getUserAppOptions(userObj)}
                            </div>
                        </div>
                    );
                });
            }
            return null;
        },
        handleMenuClick: function (applyType) {
            let traceDescr = "";
            if (applyType === APPLY_TYPES.STOP_USE) {
                traceDescr = "打开申请停用面板";
            } else if (applyType === APPLY_TYPES.EDIT_PASSWORD) {
                traceDescr = "打开申请修改密码面板";
            } else if (applyType === APPLY_TYPES.DELAY) {
                traceDescr = "打开申请延期面板"
            } else if (applyType === APPLY_TYPES.OTHER) {
                traceDescr = "打开申请其他类型面板";
            } else if (applyType === APPLY_TYPES.OPEN_APP) {
                traceDescr = "打开申请开通应用面板";
            }
            Trace.traceEvent(this.getDOMNode(), traceDescr);
            OrderAction.onChangeApplyType(applyType);
        },
        getApplyBtnType: function (applyType) {
            return this.state.applyType === applyType ? "primary" : "";
        },
        //获取申请下拉菜单
        renderApplyBtns: function () {
            let applyFlag = this.getApplyFlag();
            //开通应用，只有选择用户后才可用
            let openAppFlag = false;
            let crmUserList = this.state.crmUserList;
            if (_.isArray(crmUserList) && crmUserList.length) {
                openAppFlag = _.some(crmUserList, userObj => userObj && userObj.user && userObj.user.checked);
            }
            return (
                <div className="crm-user-apply-btns">
                    <span className="crm-user-apply-label">{Intl.get("crm.109", "申请")}: </span>
                    <Button type={this.getApplyBtnType(APPLY_TYPES.STOP_USE)}
                            onClick={this.handleMenuClick.bind(this, APPLY_TYPES.STOP_USE)}
                            disabled={!applyFlag}>
                        {Intl.get("common.stop", "停用")}
                    </Button>
                    <Button type={this.getApplyBtnType(APPLY_TYPES.DELAY)}
                            onClick={this.handleMenuClick.bind(this, APPLY_TYPES.DELAY)} disabled={!applyFlag}>
                        {Intl.get("crm.user.delay", "延期")}
                    </Button>
                    <Button type={this.getApplyBtnType(APPLY_TYPES.EDIT_PASSWORD)}
                            onClick={this.handleMenuClick.bind(this, APPLY_TYPES.EDIT_PASSWORD)} disabled={!applyFlag}>
                        {Intl.get("common.edit.password", "修改密码")}
                    </Button>
                    <Button type={this.getApplyBtnType(APPLY_TYPES.OTHER)}
                            onClick={this.handleMenuClick.bind(this, APPLY_TYPES.OTHER)} disabled={!applyFlag}>
                        {Intl.get("crm.186", "其他")}
                    </Button>
                    <Button type={this.getApplyBtnType(APPLY_TYPES.OPEN_APP)}
                            onClick={this.handleMenuClick.bind(this, APPLY_TYPES.OPEN_APP)} disabled={!openAppFlag}>
                        {Intl.get("user.app.open", "开通应用")}
                    </Button>
                </div>);
        },
        getApplyFlag: function () {
            let crmUserList = this.state.crmUserList;
            let flag = false;//申请按钮是否可用
            if (_.isArray(crmUserList) && crmUserList.length) {
                flag = _.some(crmUserList, userObj => {
                    //有选择的用户
                    if (userObj && userObj.user && userObj.user.checked) {
                        return true;
                    }
                    //有选择的应用
                    if (userObj && _.isArray(userObj.apps) && userObj.apps.length) {
                        let checkedApp = _.find(userObj.apps, app => app.checked);
                        if (checkedApp) {
                            return true;
                        }
                    }
                });
            }
            return flag;
        },
        //发邮件使用的参数
        getEmailData: function (checkedUsers) {
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
        closeRightPanel: function () {
            OrderAction.onChangeApplyType("");
        },
        renderRightPanel: function () {
            let rightPanelView = null;
            if (this.state.applyType === APPLY_TYPES.OPEN_APP) {
                let checkedUsers = _.filter(this.state.crmUserList, userObj => userObj.user && userObj.user.checked);
                if (_.isArray(checkedUsers) && checkedUsers.length) {
                    //发邮件使用的数据
                    let emailData = this.getEmailData(checkedUsers);
                    //应用列表
                    var appList = this.state.appList.map((obj) => {
                        return {
                            client_id: obj.client_id,
                            client_name: obj.client_name,
                            client_image: obj.client_logo
                        };
                    });
                    rightPanelView = (
                        <ApplyOpenAppPanel
                            appList={appList}
                            users={checkedUsers}
                            customerId={this.props.curCustomer.id}
                            cancelApply={this.closeRightPanel}
                            emailData={emailData}
                        />
                    );
                }
            }
            return rightPanelView;
        },
        render: function () {
            const _this = this;
            const appList = this.state.appList;
            const curCustomer = this.props.curCustomer;
            const userNum = curCustomer && curCustomer.app_user_ids && curCustomer.app_user_ids.length;
            let divHeight = $(window).height() -
                LAYOUT_CONSTANTS.RIGHT_PANEL_PADDING_TOP - //右侧面板顶部padding
                LAYOUT_CONSTANTS.RIGHT_PANEL_PADDING_BOTTOM - //右侧面板底部padding
                LAYOUT_CONSTANTS.CONTACT_LIST_MARGIN_BOTTOM -//列表距离底部margin
                LAYOUT_CONSTANTS.RIGHT_PANEL_TAB_HEIGHT -//右侧面板tab高度
                LAYOUT_CONSTANTS.RIGHT_PANEL_TAB_MARGIN_BOTTOM;//右侧面板tab的margin

            //合并面板，去掉客户选择框的高度
            if (this.props.isMerge) {
                divHeight -= LAYOUT_CONSTANTS.MERGE_SELECT_HEIGHT;
            } else {
                //添加按钮高度
                divHeight -= LAYOUT_CONSTANTS.CONTACT_ADD_BUTTON_HEIGHT;
            }
            let isApplyButtonShow = false;
            if ((userData.hasRole(userData.ROLE_CONSTANS.SALES) || userData.hasRole(userData.ROLE_CONSTANS.SALES_LEADER))) {
                isApplyButtonShow = true;
            }
            //查找是否有添加或编辑面板展示
            const hasFormShow = _.some(this.state.orderList, order => order.isEdit);
            return (
                <div className="order-container" data-tracename="订单页面">
                    <div className="order-container-scroll" style={{height: divHeight}} ref="scrollOrderList">
                        <GeminiScrollbar className="geminiScrollbar-vertical"
                                         listenScrollBottom={this.state.listenScrollBottom}
                                         handleScrollBottom={this.getCrmUserList.bind(this)}
                                         itemCssSelector=".crm-user-list-container .crm-user-list>.crm-user-item"
                        >
                            {this.state.orderListLoading ? (<Spinner />) : (this.state.orderList.map(function (order, i) {
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
                            }))}
                            {userNum ? (
                                <div className="crm-user-list-container">
                                    <div className="user-number">{Intl.get("crm.158", "用户数")}：{userNum}
                                        {isApplyButtonShow ? this.renderApplyBtns()
                                            : null}
                                    </div>
                                    {this.state.applyType && this.state.applyType !== APPLY_TYPES.OPEN_APP ? (
                                        <CrmUserApplyForm applyType={this.state.applyType} APPLY_TYPES={APPLY_TYPES}
                                                          closeApplyPanel={this.closeRightPanel}
                                                          crmUserList={this.state.crmUserList}/>) : null}
                                    <ul className="crm-user-list">
                                        {this.renderCrmUserList()}
                                    </ul>
                                </div>
                            ) : null}
                        </GeminiScrollbar>
                    </div>
                    {this.props.isMerge || hasFormShow ? null : (
                        // 正在加载订单列表或有订单列表展示或有用户列表展示时，添加订单按钮在底部显示
                        <div className={this.state.orderListLoading || this.state.orderList.length || userNum ?
                            "crm-right-panel-addbtn" : "crm-right-panel-addbtn go-top"}
                             onClick={this.showForm.bind(this, "")}>
                            <Icon type="plus"/><span><ReactIntl.FormattedMessage id="crm.161" defaultMessage="添加订单"/></span>
                        </div>)}

                    <RightPanel className="crm_user_apply_panel white-space-nowrap"
                                showFlag={this.state.applyType && this.state.applyType === APPLY_TYPES.OPEN_APP}>
                        {this.renderRightPanel()}
                    </RightPanel>
                </div>
            );
        }
    })
;

module.exports = OrderIndex;
