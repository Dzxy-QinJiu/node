var React = require('react');
/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/4/17.
 */
require('../../css/customer-users.less');
import {Button, Checkbox, Alert} from 'antd';
import Trace from 'LIB_DIR/trace';
import Spinner from 'CMP_DIR/spinner';
import {RightPanel} from 'CMP_DIR/rightPanel';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import TimeUtil from 'PUB_DIR/sources/utils/time-format-util';
import {scrollBarEmitter} from 'PUB_DIR/sources/utils/emitters';
import PropTypes from 'prop-types';
import userData from 'PUB_DIR/sources/user-data';
import ApplyOpenAppPanel from 'MOD_DIR/app_user_manage/public/views/v2/apply-user';
import ApplyUserForm from '../apply-user-form';
import CrmUserApplyForm from './crm-user-apply-form';
import crmAjax from '../../ajax';
import classNames from 'classnames';
import ErrorDataTip from '../components/error-data-tip';
import RightPanelScrollBar from '../components/rightPanelScrollBar';
import commonDataUtil from 'PUB_DIR/sources/utils/common-data-util';
import NoDataIconTip from 'CMP_DIR/no-data-icon-tip';
const PAGE_SIZE = 20;
const APPLY_TYPES = {
    STOP_USE: 'stopUse',//停用
    DELAY: 'Delay',//延期
    EDIT_PASSWORD: 'editPassword',//修改密码
    OTHER: 'other',//其他类型
    OPEN_APP: 'openAPP',//开通应用
    NEW_USERS: 'newUsers'//开通新用户
};

const LAYOUT = {
    TOP_NAV_HEIGHT: 36 + 8,//36：头部导航的高度，8：导航的下边距
    TOTAL_HEIGHT: 24 + 8,// 24:共xxx个的高度,8:共xxx个的下边距
    APPLY_FORM_HEIGHT: 198 + 10,//198:申请表单的高度,10:表单的上边距
    APPLY_FORM_SAVE_BTN_H: 34,//申请用户面板，保存取消按钮的高度
    APPLY_PANEL_PADDING: 12//申请面板的边距
};
//用户类型的转换对象
const USER_TYPE_MAP = {
    '正式用户': Intl.get('common.official', '签约'),
    '试用用户': Intl.get('common.trial', '试用'),
    'special': Intl.get('user.type.presented', '赠送'),
    'training': Intl.get('user.type.train', '培训'),
    'internal': Intl.get('user.type.employee', '员工')
};
class CustomerUsers extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,//是否正在获取用户列表
            lastUserId: '',//用于下拉加载的最后一个用户id
            crmUserList: [],
            total: 0,
            errorMsg: '',//获取客户开通的用户列表的错误提示
            curCustomer: this.props.curCustomer,
            applyType: '',//申请用户的类型
            listenScrollBottom: true,//是否监听滚动
            appList: [],
            ... this.getLayoutHeight() //用户列表、申请用户面板的高度
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
            this.setState({curCustomer: nextProps.curCustomer, lastUserId: '', ...this.getLayoutHeight()});
            setTimeout(() => {
                this.getCrmUserList();
            });
        }
    }

    //获取客户开通的用户列表
    getCrmUserList() {
        if (!this.state.curCustomer.id) return;
        if (!this.state.lastUserId) {
            this.setState({isLoading: true});
        }
        crmAjax.getCrmUserList({
            customer_id: this.state.curCustomer.id,
            id: this.state.lastUserId,
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
        let lastUserId = this.state.lastUserId;
        let totalSize = this.state.total;
        if (result && _.isArray(result.data)) {
            if (!lastUserId) {
                crmUserList = result.data;
            } else {
                crmUserList = crmUserList.concat(result.data);
            }
            totalSize = result.total || 0;
            let lastData = crmUserList[crmUserList.length - 1];
            if (lastData && lastData.user && lastData.user.user_id) {
                lastUserId = lastData.user.user_id;
            }
        }
        this.setState({
            isLoading: false,
            errorMsg: '',
            lastUserId: lastUserId,
            crmUserList: crmUserList,
            total: totalSize,
            listenScrollBottom: totalSize > crmUserList.length
        });
        scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
    }

    getAppList() {
        commonDataUtil.getAppList(appList => {
            this.setState({
                appList: _.map(appList, app => {
                    return {
                        client_id: app.app_id,
                        client_name: app.app_name,
                        client_logo: app.app_logo
                    };
                })
            });
        });
    }

    closeRightPanel() {
        this.setState({applyType: ''});
        if (_.isFunction(this.props.closeOpenAppPanel)) {
            this.props.closeOpenAppPanel();
        }
        setTimeout(() => {
            this.setState(this.getLayoutHeight());
        });
    }

    getBatchApplyFlag() {
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
        let appName = app && app.app_name || '';
        let overDraftCls = classNames('user-app-over-draft', {'user-app-stopped-status': app.is_disabled === 'true'});
        let lastLoginTime = TimeUtil.getTimeStrFromNow(app.last_login_time);
        return (
            <span>
                {app.app_logo ?
                    (<img className="crm-user-app-logo" src={app.app_logo || ''} alt={appName}/>)
                    : (<span className="crm-user-app-logo-font">{appName.substr(0, 1)}</span>)
                }
                <span className="user-app-name">{appName || ''}</span>
                <span className="user-app-type">{app.user_type ? USER_TYPE_MAP[app.user_type] : ''}</span>
                <span className="user-last-login">{lastLoginTime}</span>
                <span className={overDraftCls}>{this.renderOverDraft(app)}</span>
            </span>);
    }

    //用户的应用
    getUserAppOptions(userObj, isShowCheckbox) {
        let appList = userObj.apps;
        let userId = userObj.user ? userObj.user.user_id : '';
        if (_.isArray(appList) && appList.length) {
            return appList.map((app, index) => {
                if (isShowCheckbox) {
                    return (
                        <Checkbox checked={app.checked} key={index}
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
        let status = Intl.get('user.expire.immutability', '到期不变');
        if (over_draft === '1') {
            status = Intl.get('user.expire.stop', '到期停用');
        } else if (over_draft === '2') {
            status = Intl.get('user.expire.degrade', '到期降级');
        }
        return status;
    }

    getApplyBtnType(applyType) {
        return this.state.applyType === applyType ? 'primary' : '';
    }

    handleMenuClick(applyType) {
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
            // if (_.isFunction(this.props.showOpenAppForm)) {
            //     this.props.showOpenAppForm(applyType);
            // }
        }
        Trace.traceEvent('客户详情', traceDescr);
        this.setState({applyType: applyType});
        setTimeout(() => {
            this.setState(this.getLayoutHeight());
        });
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
        //是否可以批量申请（停用、延期、修改密码、其他）的操作，只要有选择的用户或应用就可以
        let batchApplyFlag = this.getBatchApplyFlag();
        //开通应用，只有选择用户后才可用
        let openAppFlag = false;
        let crmUserList = this.state.crmUserList;
        if (_.isArray(crmUserList) && crmUserList.length) {
            openAppFlag = _.some(crmUserList, userObj => userObj && userObj.user && userObj.user.checked);
        }
        if (!batchApplyFlag && !openAppFlag) {
            //申请新用户
            return (
                <div className="crm-user-apply-btns" data-tracename="申请新用户">
                    <Button className='crm-detail-add-btn' type={this.getApplyBtnType(APPLY_TYPES.NEW_USERS)}
                        onClick={this.handleMenuClick.bind(this, APPLY_TYPES.NEW_USERS) }>
                        {Intl.get('crm.apply.user.new', '申请新用户')}
                    </Button>
                </div>);
        } else {//其他申请
            return (
                <div className="crm-user-apply-btns">
                    <Button className='crm-detail-add-btn' type={this.getApplyBtnType(APPLY_TYPES.STOP_USE)}
                        onClick={this.handleMenuClick.bind(this, APPLY_TYPES.STOP_USE)}
                        disabled={!batchApplyFlag}>
                        {Intl.get('common.stop', '停用')}
                    </Button>
                    <Button className='crm-detail-add-btn' type={this.getApplyBtnType(APPLY_TYPES.DELAY)}
                        onClick={this.handleMenuClick.bind(this, APPLY_TYPES.DELAY)} disabled={!batchApplyFlag}>
                        {Intl.get('crm.user.delay', '延期')}
                    </Button>
                    <Button className='crm-detail-add-btn' type={this.getApplyBtnType(APPLY_TYPES.EDIT_PASSWORD)}
                        onClick={this.handleMenuClick.bind(this, APPLY_TYPES.EDIT_PASSWORD)}
                        disabled={!batchApplyFlag}>
                        {Intl.get('common.edit.password', '修改密码')}
                    </Button>
                    <Button className='crm-detail-add-btn' type={this.getApplyBtnType(APPLY_TYPES.OTHER)}
                        onClick={this.handleMenuClick.bind(this, APPLY_TYPES.OTHER)} disabled={!batchApplyFlag}>
                        {Intl.get('crm.186', '其他')}
                    </Button>
                    <Button className='crm-detail-add-btn' type={this.getApplyBtnType(APPLY_TYPES.OPEN_APP)}
                        onClick={this.handleMenuClick.bind(this, APPLY_TYPES.OPEN_APP)} disabled={!openAppFlag}>
                        {Intl.get('user.app.open', '开通应用')}
                    </Button>
                </div>);
        }
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
    getLayoutHeight(){
        let divHeight = $(window).height() - LAYOUT.TOP_NAV_HEIGHT - LAYOUT.TOTAL_HEIGHT;
        //减头部的客户基本信息高度
        divHeight -= parseInt($('.basic-info-contianer').outerHeight(true));
        if ($('.phone-alert-modal-title').size()) {
            divHeight -= $('.phone-alert-modal-title').outerHeight(true);
        }
        let userListHeight = divHeight;
        //减去申请用户面板的高度
        if($('.apply-user-form-container').size()){
            userListHeight -= $('.apply-user-form-container').outerHeight(true);
        }
        let applyFormMaxHeight = divHeight - LAYOUT.APPLY_FORM_SAVE_BTN_H - 2 * LAYOUT.APPLY_PANEL_PADDING;
        return {userListHeight,applyFormMaxHeight};
    }
    renderUserApplyForm() {
        //有选择用户时，是已有用户开通新用户；无选择的应用时，是开通新用户
        let checkedUsers = _.filter(this.state.crmUserList, userObj => userObj.user && userObj.user.checked);
        //发邮件使用的数据
        let emailData = this.getEmailData(checkedUsers);
        return (
            <ApplyUserForm
                applyFrom="crmUserList"
                apps={[]}
                appList={this.state.appList}
                users={checkedUsers}
                customerName={this.props.curCustomer.name}
                customerId={this.props.curCustomer.id}
                cancelApply={this.closeRightPanel.bind(this)}
                emailData={emailData}
                maxHeight={this.state.applyFormMaxHeight}
            />
        );
    }

    renderOverDraft(app) {
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
                        let timeObj = TimeUtil.secondsToHourMinuteSecond(Math.floor(duration / 1000));
                        let timeDescr = '';
                        if (timeObj.hours) {//xx小时
                            timeDescr = timeObj.hours + Intl.get('user.time.hour', '小时');
                        } else if (timeObj.minutes) {//xx分
                            timeDescr = timeObj.minutes + Intl.get('common.app.minute', '分钟');
                        } else if (timeObj.second) {//xx秒
                            timeDescr = timeObj.minutes + Intl.get('user.time.second', '秒');
                        }
                        return `${Intl.get('oplate.user.analysis.40', '{time}后', {time: timeDescr})}${over_draft_status}`;
                    }
                } else {
                    return Intl.get('user.status.expired', '已到期');
                }
            } else {
                return '';
            }
        }
    }

    renderUserAppTitle() {
        return (
            <span>
                <span className="user-app-name">{Intl.get('sales.frontpage.open.app', '已开通应用')}</span>
                <span className="user-app-type">{Intl.get('common.type', '类型')}</span>
                <span className="user-last-login">{Intl.get('user.last.login', '最近登录')}</span>
                <span className="user-app-over-draft">{Intl.get('sales.frontpage.expired.date', '到期情况')}</span>
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
            return (
                <ul className="crm-user-list">
                    {crmUserList.map((userObj, index) => {
                        let user = _.isObject(userObj) ? userObj.user : {};
                        return (
                            <div className="crm-user-item" key={index}>
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
                                    className={classNames('crm-user-apps-container', {'no-checkbox-apps-container': !isShowCheckbox})}>
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
                    })}
                </ul>);
        } else if(this.state.applyType !== APPLY_TYPES.NEW_USERS ){//没有用户时，展开申请用户面板时，不展示暂无用户的提示
            //加载完成，没有数据的情况
            return (<NoDataIconTip tipContent={Intl.get('crm.detail.no.user', '暂无用户')}/>);
        }
    }

    //展示按客户搜索到的用户列表
    triggerUserList(userNum) {
        if (this.props.isMerge || !userNum) return;
        if (_.isFunction(this.props.ShowCustomerUserListPanel)) {
            this.props.ShowCustomerUserListPanel({customerObj: this.state.curCustomer || {}});
        }
    }

    handleScrollBottom() {
        this.getCrmUserList();
    }

    render() {
        const userNum = this.state.total || 0;
        let isApplyButtonShow = false;
        if ((userData.hasRole(userData.ROLE_CONSTANS.SALES) || userData.hasRole(userData.ROLE_CONSTANS.SALES_LEADER))) {
            isApplyButtonShow = true;
        }
        let userNumClass = classNames('user-total-tip', {'user-total-active': !this.props.isMerge && userNum});
        return (<div className="crm-user-list-container" data-tracename="用户页面">
            <div className="user-number">
                {this.state.isLoading ? null : userNum ? (
                    <span className={userNumClass} onClick={this.triggerUserList.bind(this, userNum)}>
                        <ReactIntl.FormattedMessage
                            id="sales.home.total.count"
                            defaultMessage={'共{count}个'}
                            values={{'count': userNum || '0'}}
                        />
                    </span>) : (
                    <span className="crm-detail-total-tip">
                        {Intl.get('crm.overview.apply.user.tip', '该客户还没有用户')}
                    </span>)}
                {isApplyButtonShow && !this.props.isMerge ? this.renderApplyBtns()
                    : null}
            </div>
            {this.state.applyType ?
                this.state.applyType === APPLY_TYPES.OPEN_APP || this.state.applyType === APPLY_TYPES.NEW_USERS ?
                    this.renderUserApplyForm() : (
                        <CrmUserApplyForm applyType={this.state.applyType} APPLY_TYPES={APPLY_TYPES}
                            closeApplyPanel={this.closeRightPanel.bind(this)}
                            crmUserList={this.state.crmUserList}/>)
                : null
            }
            <div className="crm-user-scroll-wrap" style={{height: this.state.userListHeight}}>
                <GeminiScrollbar className="srollbar-out-card-style"
                    listenScrollBottom={this.state.listenScrollBottom}
                    handleScrollBottom={this.handleScrollBottom.bind(this)}>
                    {this.renderCrmUserList(isApplyButtonShow)}
                </GeminiScrollbar>
            </div>
            {/*<RightPanel className="crm_user_apply_panel white-space-nowrap"*/}
            {/*showFlag={this.state.applyType && this.state.applyType === APPLY_TYPES.OPEN_APP}>*/}
            {/*{this.renderRightPanel()}*/}
            {/*</RightPanel>*/}
        </div>);
    }

}

CustomerUsers.defaultProps = {
    isMerge: false,
    curCustomer: {}
};

CustomerUsers.propTypes = {
    isMerge: PropTypes.bool,
    curCustomer: PropTypes.object,
    closeOpenAppPanel: PropTypes.func,
    ShowCustomerUserListPanel: PropTypes.func
};
export default CustomerUsers;