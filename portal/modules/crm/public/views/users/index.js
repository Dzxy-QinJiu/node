/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/4/17.
 */
require("../../css/customer-users.less");
import {Button, Checkbox, Alert} from "antd";
import Trace from "LIB_DIR/trace";
import Spinner from "CMP_DIR/spinner";
import {RightPanel} from  "CMP_DIR/rightPanel";
import GeminiScrollbar from "CMP_DIR/react-gemini-scrollbar";
import TimeUtil from 'PUB_DIR/sources/utils/time-format-util';
import {scrollBarEmitter} from "PUB_DIR/sources/utils/emitters";
import userData from "PUB_DIR/sources/user-data";
import ApplyOpenAppPanel from "MOD_DIR/app_user_manage/public/views/v2/apply-user";
import CrmUserApplyForm from "./crm-user-apply-form";
import crmAjax from "../../ajax";
import appAjaxTrans from "MOD_DIR/common/public/ajax/app";
import classNames from "classnames";
import NoDataTip from "../components/no-data-tip";
import ErrorDataTip from "../components/error-data-tip";
const PAGE_SIZE = 20;
const APPLY_TYPES = {
    STOP_USE: "stopUse",//停用
    DELAY: "Delay",//延期
    EDIT_PASSWORD: "editPassword",//修改密码
    OTHER: "other",//其他类型
    OPEN_APP: "openAPP"//开通应用
};

const LAYOUT = {
    TOP_NAV_HEIGHT: 52 + 8,//52：头部导航的高度，8：导航的下边距
    TOTAL_HEIGHT: 24 + 8,// 24:共xxx个的高度,8:共xxx个的下边距
    APPLY_FORM_HEIGHT: 198 + 10//198:申请表单的高度,10:表单的上边距
};
//用户类型的转换对象
const USER_TYPE_MAP = {
    "正式用户": Intl.get("common.official", "签约"),
    "试用用户": Intl.get("common.trial", "试用"),
    "special": Intl.get("user.type.presented", "赠送"),
    "training": Intl.get("user.type.train", "培训"),
    "internal": Intl.get("user.type.employee", "员工")
};
class CustomerUsers extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,//是否正在获取用户列表
            pageNum: 1,
            crmUserList: [],
            total: 0,
            errorMsg: "",//获取客户开通的用户列表的错误提示
            curCustomer: this.props.curCustomer,
            applyType: "",//申请类型
            listenScrollBottom: true,//是否监听滚动
            appList: []
        };
    }

    componentDidMount() {
        //获取客户开通的用户列表
        this.getCrmUserList();
        //获取应用列表
        this.getAppList();
    }

    componentWillReceiveProps(nextProps) {
        let oldCustomerId = this.state.curCustomer.id;
        if (nextProps.curCustomer && nextProps.curCustomer.id !== oldCustomerId) {
            this.setState({curCustomer: nextProps.curCustomer, pageNum: 1});
            setTimeout(() => {
                this.getCrmUserList();
            });
        }
    }

    //获取客户开通的用户列表
    getCrmUserList() {
        if (!this.state.curCustomer.id) return;
        if (this.state.pageNum === 1) {
            this.setState({isLoading: true});
        }
        crmAjax.getCrmUserList({
            customer_id: this.state.curCustomer.id,
            page_num: this.state.pageNum,
            page_size: PAGE_SIZE
        }).then((result) => {
            this.setCrmUserData(result);
        }, (errorMsg) => {
            this.setState({
                isLoading: false,
                errorMsg: errorMsg,
                listenScrollBottom: false
            });
        });
    }

    //获取客户开通的用户列表后的数据设置
    setCrmUserData(result) {
        let crmUserList = this.state.crmUserList;
        if (result && _.isArray(result.data)) {
            if (this.state.pageNum === 1) {
                crmUserList = result.data;
            } else {
                crmUserList = crmUserList.concat(result.data);
            }
            this.state.pageNum++;
            this.state.total = result.total || 0;
        }
        this.setState({
            isLoading: false,
            errorMsg: "",
            pageNum: this.state.pageNum,
            crmUserList: crmUserList,
            total: this.state.total,
            listenScrollBottom: this.state.total > crmUserList.length
        });
        scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
    }

    getAppList() {
        appAjaxTrans.getGrantApplicationListAjax().sendRequest().success(result => {
            let list = [];
            if (_.isArray(result) && result.length) {
                list = result.map(function (app) {
                    return {
                        client_id: app.app_id,
                        client_name: app.app_name,
                        client_image: app.app_logo
                    };
                });
            }
            this.setState({appList: list});
        }).error(errorMsg => {
            this.setState({appList: []});
        });
    }

    closeRightPanel() {
        this.setState({applyType: ""});
    }

    getApplyFlag() {
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
    }

    //（取消）选择用户时，（取消）选择用户下的所有应用
    onChangeUserCheckBox(userId, e) {
        let checked = e.target.checked;
        let userObj = _.find(this.state.crmUserList, (obj) => obj.user.user_id === userId);
        if (userObj) {
            //用户的（取消）选择处理
            userObj.user.checked = checked;
            //用户下应用的（取消）选择处理
            if (_.isArray(userObj.apps) && userObj.apps.length) {
                _.each(userObj.apps, app => {
                    app.checked = checked;
                });
            }
            this.setState({crmUserList: this.state.crmUserList});
        }
    }

    //应用选择的处理
    onChangeAppCheckBox(userId, appId, e) {
        let checked = e.target.checked;
        let userObj = _.find(this.state.crmUserList, (obj) => obj.user.user_id === userId);
        if (userObj) {
            //应用的（取消）选择处理
            if (_.isArray(userObj.apps) && userObj.apps.length) {
                let app = _.find(userObj.apps, app => app.app_id === appId);
                if (app) {
                    app.checked = checked;
                }
            }
            //用户的（取消）选择处理
            if (checked) {//选中时
                let notCheckedApp = _.find(userObj.apps, app => !app.checked);
                //该用户下没有未选中的应用时，将用户的checked设为选中
                if (!notCheckedApp) {
                    userObj.user.checked = checked;
                }
            } else {//取消选中时
                delete userObj.user.checked;
            }
            this.setState({crmUserList: this.state.crmUserList});
        }
    }

    renderUserAppItem(app) {
        let appName = app && app.app_name || "";
        let overDraftCls = classNames("user-app-over-draft", {"user-app-stopped-status": app.is_disabled === "true"});
        let lastLoginTime = TimeUtil.getTimeStrFromNow(app.last_login_time);
        return (
            <span>
                {app.app_logo ?
                    (<img className="crm-user-app-logo" src={app.app_logo || ""} alt={appName}/>)
                    : (<span className="crm-user-app-logo-font">{appName.substr(0, 1)}</span>)
                }
                <span className="user-app-name">{appName || ""}</span>
                {/*<span className="user-app-type">{app.user_type ? USER_TYPE_MAP[app.user_type] : ""}</span>*/}
                <span className="user-last-login">{lastLoginTime}</span>
                <span className={overDraftCls}>{this.renderOverDraft(app)}</span>
            </span>);
    }

    //用户的应用
    getUserAppOptions(userObj, isShowCheckbox) {
        let appList = userObj.apps;
        let userId = userObj.user ? userObj.user.user_id : "";
        if (_.isArray(appList) && appList.length) {
            return appList.map((app) => {
                if (isShowCheckbox) {
                    return (
                        <Checkbox checked={app.checked}
                                  onChange={this.onChangeAppCheckBox.bind(this, userId, app.app_id)}>
                            {this.renderUserAppItem(app)}
                        </Checkbox>);
                } else {
                    return (<label>{this.renderUserAppItem(app)}</label>);
                }
            });
        }
        return [];
    }

    //获取到期后的状态
    getOverDraftStatus(over_draft) {
        let status = Intl.get("user.expire.immutability", "到期不变");
        if (over_draft === "1") {
            status = Intl.get("user.expire.stop", "到期停用");
        } else if (over_draft === "2") {
            status = Intl.get("user.expire.degrade", "到期降级");
        }
        return status;
    }

    getApplyBtnType(applyType) {
        return this.state.applyType === applyType ? "primary" : "";
    }

    handleMenuClick(applyType) {
        let traceDescr = "";
        if (applyType === APPLY_TYPES.STOP_USE) {
            traceDescr = "打开申请停用面板";
        } else if (applyType === APPLY_TYPES.EDIT_PASSWORD) {
            traceDescr = "打开申请修改密码面板";
        } else if (applyType === APPLY_TYPES.DELAY) {
            traceDescr = "打开申请延期面板";
        } else if (applyType === APPLY_TYPES.OTHER) {
            traceDescr = "打开申请其他类型面板";
        } else if (applyType === APPLY_TYPES.OPEN_APP) {
            traceDescr = "打开申请开通应用面板";
        }
        Trace.traceEvent("客户详情", traceDescr);
        this.setState({applyType: applyType});
    }

    //发邮件使用的参数
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
    }

    renderApplyBtns() {
        let applyFlag = this.getApplyFlag();
        //开通应用，只有选择用户后才可用
        let openAppFlag = false;
        let crmUserList = this.state.crmUserList;
        if (_.isArray(crmUserList) && crmUserList.length) {
            openAppFlag = _.some(crmUserList, userObj => userObj && userObj.user && userObj.user.checked);
        }
        return (
            <div className="crm-user-apply-btns">
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
    }

    renderRightPanel() {
        let rightPanelView = null;
        if (this.state.applyType === APPLY_TYPES.OPEN_APP) {
            let checkedUsers = _.filter(this.state.crmUserList, userObj => userObj.user && userObj.user.checked);
            if (_.isArray(checkedUsers) && checkedUsers.length) {
                //发邮件使用的数据
                let emailData = this.getEmailData(checkedUsers);
                rightPanelView = (
                    <ApplyOpenAppPanel
                        appList={this.state.appList}
                        users={checkedUsers}
                        customerId={this.props.curCustomer.id}
                        cancelApply={this.closeRightPanel.bind(this)}
                        emailData={emailData}
                    />
                );
            }
        }
        return rightPanelView;
    }

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
                        let timeObj = TimeUtil.secondsToHourMinuteSecond(Math.floor(duration / 1000));
                        let timeDescr = "";
                        if (timeObj.hours) {//xx小时
                            timeDescr = timeObj.hours + Intl.get("user.time.hour", "小时");
                        } else if (timeObj.minutes) {//xx分
                            timeDescr = timeObj.minutes + Intl.get("common.app.minute", "分钟");
                        } else if (timeObj.second) {//xx秒
                            timeDescr = timeObj.minutes + Intl.get("user.time.second", "秒");
                        }
                        return `${Intl.get("oplate.user.analysis.40", "{time}后", {time: timeDescr})}${over_draft_status}`;
                    }
                } else {
                    return Intl.get("user.status.expired", "已到期");
                }
            } else {
                return "";
            }
        }
    }

    renderUserAppTitle() {
        return (
            <span>
                <span className="user-app-name">{Intl.get("sales.frontpage.open.app", "已开通应用")}</span>
                {/*<span className="user-app-type">{Intl.get("user.user.type", "用户类型")}</span>*/}
                <span className="user-last-login">{Intl.get("user.last.login", "最近登录")}</span>
                <span className="user-app-over-draft">{Intl.get("sales.frontpage.expired.date", "到期情况")}</span>
            </span>
        );
    }

    renderCrmUserList(isApplyButtonShow) {
        if (this.state.isLoading) {
            return <Spinner />;
        }
        if (this.state.errorMsg) {
            return <ErrorDataTip errorMsg={this.state.errorMsg} isRetry={true}
                                 retryFunc={this.getCrmUserList.bind(this)}/>;
        }
        let isShowCheckbox = isApplyButtonShow && !this.props.isMerge;
        let crmUserList = this.state.crmUserList;
        if (_.isArray(crmUserList) && crmUserList.length) {
            return crmUserList.map((userObj) => {
                let user = _.isObject(userObj) ? userObj.user : {};
                return (
                    <div className="crm-user-item">
                        <div className="crm-user-name">
                            {isShowCheckbox ? (
                                <Checkbox checked={user.checked}
                                          onChange={this.onChangeUserCheckBox.bind(this, user.user_id)}>
                                    {user.user_name}({user.nick_name})
                                </Checkbox>) :
                                <span className="no-checkbox-text">{user.user_name}({user.nick_name})</span>
                            }
                        </div>
                        <div
                            className={classNames("crm-user-apps-container", {"no-checkbox-apps-container": !isShowCheckbox})}>
                            <div className="crm-user-apps">
                                <div className="apps-top-title">
                                    {isShowCheckbox ? (
                                        <Checkbox checked={user.checked}
                                                  onChange={this.onChangeUserCheckBox.bind(this, user.user_id)}>
                                            {this.renderUserAppTitle()}
                                        </Checkbox>
                                    ) : (<label>{this.renderUserAppTitle()}</label>)}
                                </div>
                                {this.getUserAppOptions(userObj, isShowCheckbox)}
                            </div>
                        </div>
                    </div>
                );
            });
        } else {
            //加载完成，没有数据的情况
            return (<NoDataTip tipContent={Intl.get("common.no.data", "暂无数据")}/>);
        }
    }

    //展示按客户搜索到的用户列表
    triggerUserList(userNum) {
        if (this.props.isMerge || !userNum) return;
        if (_.isFunction(this.props.ShowCustomerUserListPanel)) {
            this.props.ShowCustomerUserListPanel({customerObj: this.state.curCustomer || {}});
        }
    }

    render() {
        const userNum = _.isArray(this.state.crmUserList) ? this.state.crmUserList.length : 0;
        let isApplyButtonShow = false;
        if ((userData.hasRole(userData.ROLE_CONSTANS.SALES) || userData.hasRole(userData.ROLE_CONSTANS.SALES_LEADER))) {
            isApplyButtonShow = true;
        }
        let divHeight = $(window).height() - LAYOUT.TOP_NAV_HEIGHT - LAYOUT.TOTAL_HEIGHT;
        //减头部的客户基本信息高度
        divHeight -= parseInt($(".basic-info-contianer").outerHeight(true));
        //减去申请延期\停用等表单的高度
        if (this.state.applyType && this.state.applyType !== APPLY_TYPES.OPEN_APP) {
            divHeight -= LAYOUT.APPLY_FORM_HEIGHT;
        }
        let userNumClass = classNames("user-total-tip", {"user-total-active": !this.props.isMerge && userNum});
        return (<div className="crm-user-list-container" data-tracename="通用户页面">
            <div className="user-number">
                <span className={userNumClass} onClick={this.triggerUserList.bind(this, userNum)}>
                     <ReactIntl.FormattedMessage
                         id="sales.home.total.count"
                         defaultMessage={`共{count}个`}
                         values={{"count": userNum || "0"}}
                     />
                </span>
                {isApplyButtonShow && !this.props.isMerge ? this.renderApplyBtns()
                    : null}
            </div>
            {this.state.applyType && this.state.applyType !== APPLY_TYPES.OPEN_APP ? (
                <CrmUserApplyForm applyType={this.state.applyType} APPLY_TYPES={APPLY_TYPES}
                                  closeApplyPanel={this.closeRightPanel.bind(this)}
                                  crmUserList={this.state.crmUserList}/>) : null}
            <ul className="crm-user-list" style={{height: divHeight}}>
                <GeminiScrollbar>
                    {this.renderCrmUserList(isApplyButtonShow)}
                </GeminiScrollbar>
            </ul>
            <RightPanel className="crm_user_apply_panel white-space-nowrap"
                        showFlag={this.state.applyType && this.state.applyType === APPLY_TYPES.OPEN_APP}>
                {this.renderRightPanel()}
            </RightPanel>
        </div>);
    }

}

CustomerUsers.defaultProps = {
    isMerge: false,
    curCustomer: {}
};
export default  CustomerUsers;