/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/3/5.
 */
var AppUserListStore = require("../store/app-user-list-store");
var AppUserListAction = require("../action/app-user-list-actions");
import Spinner from 'CMP_DIR/spinner';
import {Checkbox, Button} from "antd";
const userData = require("PUB_DIR/sources/user-data");
var classNames = require("classnames");
import CrmUserApplyForm from "MOD_DIR//crm/public/views/order/crm-user-apply-form";
import ApplyOpenAppPanel from "MOD_DIR/app_user_manage/public/views/v2/apply-user";
import {RightPanel} from  "CMP_DIR/rightPanel";
import TimeUtil from 'PUB_DIR/sources/utils/time-format-util';
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
class AppUserLists extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            customerId: this.props.selectedCustomerId,
            ...AppUserListStore.getState()
        };
        this.onStoreChange = this.onStoreChange.bind(this);
    };

    componentDidMount() {
        AppUserListStore.listen(this.onStoreChange);
        //获取某个客户下的用户列表
        setTimeout(()=>{
            this.getCrmUserList();
        })

    };

    //获取某个客户下的用户列表
    getCrmUserList() {
        if (this.state.customerId) {
            AppUserListAction.getCrmUserList({
                customer_id: this.state.customerId,
                page_num: 1,
                page_size: this.state.page_size
            });
        }
    };

    onStoreChange = () => {
        this.setState(AppUserListStore.getState());
    };

    componentWillUnmount() {
        AppUserListStore.unlisten(this.onStoreChange);
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.selectedCustomerId !== this.state.customerId) {
            this.setState({
                customerId: nextProps.selectedCustomerId
            }, () => {
                this.getCrmUserList();

            });
        }
    };

    //用户名前的选择框
    onChangeUserCheckBox = (userId, e) => {
        AppUserListAction.onChangeUserCheckBox({userId: userId, checked: e.target.checked});
    };
    //应用选择的处理
    onChangeAppCheckBox = (userId, appId, e) => {
        AppUserListAction.onChangeAppCheckBox({userId: userId, appId: appId, checked: e.target.checked});
    };
    //用户的应用
    getUserAppOptions(userObj) {
        let appList = userObj.apps;
        let userId = userObj.user ? userObj.user.user_id : "";
        if (_.isArray(appList) && appList.length) {
            return appList.map((app) => {
                let appName = app ? app.app_name || "" : "";
                let overDraftCls = classNames("user-app-over-draft", {"user-app-stopped-status": app.is_disabled === "true"});
                let overDraftDes = this.renderOverDraft(app);
                return (
                    <Checkbox checked={app.checked} onChange={this.onChangeAppCheckBox.bind(this, userId, app.app_id)}>
                        {app.app_logo ?
                            (<img className="crm-user-app-logo" src={app.app_logo || ""} alt={appName}/>)
                            : (<span className="crm-user-app-logo-font">{appName.substr(0, 1)}</span>)
                        }
                        <span className="user-app-name" title={appName}>{appName || ""}</span>
                        <span className="user-app-type">{app.user_type ? userTypeMap[app.user_type] : ""}</span>
                        <span className={overDraftCls} title={overDraftDes}>{overDraftDes}</span>
                    </Checkbox>);
            });
        }
        return [];
    };

    //获取到期后的状态
    getOverDraftStatus(over_draft) {
        let status = Intl.get("user.expire.immutability", "到期不变");
        if (over_draft === "1") {
            status = Intl.get("user.expire.stop", "到期停用");
        } else if (over_draft === "2") {
            status = Intl.get("user.expire.degrade", "到期降级");
        }
        return status;
    };

    renderOverDraft(app) {
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
    };

    renderCrmUserList() {
        if (this.state.userListsOfCustomer.loading) {
            return <Spinner />
        }
        if (this.state.userListsOfCustomer.errMsg) {
            return (
                <div className="get-crm-users-error-tip">
                    <Alert
                        message={this.state.userListsOfCustomer.errMsg}
                        type="error"
                        showIcon={true}
                    />
                </div>);
        }
        let crmUserList = this.state.userListsOfCustomer.data.data;
        if (_.isArray(crmUserList) && crmUserList.length) {
            return crmUserList.map((userObj) => {
                let user = _.isObject(userObj) ? userObj.user : {};
                return (
                    <div className="crm-user-item">
                        <div className="crm-user-name">
                            <Checkbox checked={user.checked}
                                      onChange={this.onChangeUserCheckBox.bind(this, user.user_id)}>
                                <span className="crm-username">
                                    {user.user_name}
                                </span>
                                <span className="crm-nickname">
                                     ({user.nick_name})
                                </span>

                            </Checkbox>
                        </div>
                        <div className="crm-user-apps">
                            <Checkbox>
                                <span className="user-app-name-title">{Intl.get("sales.frontpage.open.app", "已开通应用")}</span>
                                <span className="user-app-type-title">{Intl.get("user.last.login", "最近登录")}</span>
                                <span className="user-app-over-draft-title">{Intl.get("sales.frontpage.expired.date", "到期情况")}</span>
                            </Checkbox>
                            {this.getUserAppOptions(userObj)}
                        </div>
                    </div>
                );
            });
        }
        return null;
    };

    getApplyBtnType = (curApplyType) => {
        return this.state.curApplyType === curApplyType ? "primary" : "";
    };
    handleMenuClick = (curApplyType) => {
        let traceDescr = "";
        if (curApplyType === APPLY_TYPES.STOP_USE) {
            traceDescr = "打开申请停用面板";
        } else if (curApplyType === APPLY_TYPES.EDIT_PASSWORD) {
            traceDescr = "打开申请修改密码面板";
        } else if (curApplyType === APPLY_TYPES.DELAY) {
            traceDescr = "打开申请延期面板"
        } else if (curApplyType === APPLY_TYPES.OTHER) {
            traceDescr = "打开申请其他类型面板";
        } else if (curApplyType === APPLY_TYPES.OPEN_APP) {
            traceDescr = "打开申请开通应用面板";
        }
        // Trace.traceEvent(this.getDOMNode(), traceDescr);
        this.setState({curApplyType});
    };

    getApplyFlag() {
        let crmUserList = this.state.userListsOfCustomer.data.data;
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
    }

    //获取申请下拉菜单
    renderApplyBtns() {
        let applyFlag = this.getApplyFlag();
        //开通应用，只有选择用户后才可用
        let openAppFlag = false;
        let crmUserList = this.state.userListsOfCustomer.data.data;
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
    };

    closeRightPanel = () => {
        AppUserListAction.onChangeApplyType("");
    };

    renderUserContent() {
        var userNum = _.isArray(this.state.userListsOfCustomer.data.data) ? this.state.userListsOfCustomer.data.data.length : "";
        let isApplyButtonShow = false;
        if ((userData.hasRole(userData.ROLE_CONSTANS.SALES) || userData.hasRole(userData.ROLE_CONSTANS.SALES_LEADER))) {
            isApplyButtonShow = true;
        }
        if (userNum) {
            return (
                <div className="crm-user-list-container">
                    <div className="user-number">{Intl.get("crm.158", "用户数")}：{userNum}
                        {isApplyButtonShow ? this.renderApplyBtns()
                            : null}
                    </div>
                    {this.state.curApplyType && this.state.curApplyType !== APPLY_TYPES.OPEN_APP ? (
                        <CrmUserApplyForm applyType={this.state.curApplyType} APPLY_TYPES={APPLY_TYPES}
                                          closeApplyPanel={this.closeRightPanel}
                                          crmUserList={this.state.userListsOfCustomer.data.data}/>
                    ) : null}
                    <ul className="crm-user-list">
                        {this.renderCrmUserList()}
                    </ul>
                </div>
            )
        } else {
            return null;
        }
    };

    getEmailData(checkedUsers) {
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
    };

    renderRightPanel() {
        let rightPanelView = null;
        if (this.state.curApplyType === APPLY_TYPES.OPEN_APP) {
            let checkedUsers = _.filter(this.state.userListsOfCustomer.data.data, userObj => userObj.user && userObj.user.checked);
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
                        customerId={this.props.curCustomer.id || this.props.curCustomer.customer_id}
                        cancelApply={this.closeRightPanel}
                        emailData={emailData}
                    />
                );
            }
        }
        return rightPanelView;
    };

    render() {
        return (
            <div className="app-user-list">
                {this.renderUserContent()}
                <RightPanel className="crm_user_apply_panel white-space-nowrap"
                            showFlag={this.state.curApplyType && this.state.curApplyType === APPLY_TYPES.OPEN_APP}>
                    {this.renderRightPanel()}
                </RightPanel>
            </div>
        )
    }
}
;
AppUserLists.defaultProps = {};
export default AppUserLists;

