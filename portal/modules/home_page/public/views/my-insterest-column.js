/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2019/6/12.
 */
import '../css/my-insterest-column.less';
import classNames from 'classnames';
import {Alert, Icon, Button, Tag, Popover, message} from 'antd';
import {STATUS} from 'PUB_DIR/sources/utils/consts';
import {scrollBarEmitter} from 'PUB_DIR/sources/utils/emitters';
import {phoneMsgEmitter, userDetailEmitter} from 'PUB_DIR/sources/utils/emitters';
import TimeUtil from 'PUB_DIR/sources/utils/time-format-util';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import Spinner from 'CMP_DIR/spinner';
// 没有消息的提醒
import NoMoreDataTip from 'CMP_DIR/no_more_data_tip';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import userData from 'PUB_DIR/sources/user-data';
import AlertTimer from 'CMP_DIR/alert-timer';
import Trace from 'LIB_DIR/trace';
import {RightPanel} from 'CMP_DIR/rightPanel';
import AppUserManage from 'MOD_DIR/app_user_manage/public';
import myInterestAjax from '../ajax';
import CardColumnItem from 'CMP_DIR/card-column-item';
import {getColumnHeight} from './common-util';
import NoDataIntro from 'CMP_DIR/no-data-intro';
import crmUtil from 'MOD_DIR/crm/public/utils/crm-util';
import PhoneCallout from 'CMP_DIR/phone-callout';
import CustomerLabel from 'CMP_DIR/customer_label';
import adaptiveHeightHoc from 'CMP_DIR/adaptive-height-hoc';
const LOGIN_TYPES = {
    INTEREST_LOGIN: 'interest_login_success',//关注客户登录
    LOGIN_AFTER_STOPPED: 'login_after_stopped',//停用登录
    LOGIN_FAIL: 'login_fail',//登录失败
    LOGIN_LAST_DAYS: 'login_last_days'//近期登录
};
class MyInsterestColumn extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            //用来下拉加载的id
            lastSystemNoticeId: '',
            isLoadingSystemNotices: false,
            loadSystemNoticesErrorMsg: '',
            systemNotices: [],
            totalSize: 0,
        };
    }

    componentDidMount() {
        this.getMyInsterestSystemNotice();
    }

    getMyInsterestSystemNotice() {
        let queryObj = {
            page_size: 20
        };
        if (this.state.lastSystemNoticeId) {
            //用来下拉加载的id
            queryObj.id = this.state.lastSystemNoticeId;
        }
        this.setState({isLoadingSystemNotices: true});
        myInterestAjax.getMyInterestData(queryObj).then(result => {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            let stateData = this.state;
            stateData.isLoadingSystemNotices = false;
            stateData.loadSystemNoticesErrorMsg = '';
            if (result && _.isArray(result.list)) {
                if (stateData.lastSystemNoticeId) {
                    //下拉加载时
                    stateData.systemNotices = this.state.systemNotices.concat(result.list);
                } else {
                    //首次获取数据时
                    stateData.systemNotices = result.list;
                }
                stateData.totalSize = result.total || stateData.systemNotices.length;
                stateData.lastSystemNoticeId = stateData.systemNotices.length ? _.last(stateData.systemNotices).id : '';
            }
            //如果当前已获取的数据还不到总数，继续监听下拉加载，否则不监听下拉加载
            stateData.listenScrollBottom = stateData.totalSize > stateData.systemNotices.length;
            this.setState(stateData);
        }, errorMsg => {
            this.setState({
                isLoadingSystemNotices: false,
                loadSystemNoticesErrorMsg: errorMsg || Intl.get('errorcode.118','获取数据失败')
            });
        });
    }

    //下拉加载
    handleScrollBarBottom = () => {
        if (this.state.totalSize > this.state.systemNotices.length) {
            this.getMyInsterestSystemNotice();
        }
    };

    renderInterestContent() {
        return (
            <div className='my-insterest-content' style={{height: getColumnHeight(this.props.adaptiveHeight)}} data-tracename="我的关注列表">
                <GeminiScrollbar handleScrollBottom={this.handleScrollBarBottom}
                    className="srollbar-out-card-style"
                    listenScrollBottom={this.state.listenScrollBottom}
                    itemCssSelector=".my-insterest-content .system_message_list >li">
                    {this.renderNoticeList()}
                </GeminiScrollbar>
            </div>);
    }

    //是否显示没有更多数据了
    showNoMoreDataTip = () => {
        return !this.state.isLoadingSystemNotices &&
            this.state.systemNotices.length >= 10 && !this.state.listenScrollBottom;
    };


    renderNoticeList = () => {
        let systemNotices = this.state.systemNotices;
        if (this.state.isLoadingSystemNotices && !this.state.lastSystemNoticeId) {//等待状态
            return <Spinner className='home-loading'/>;
        } else if (_.isArray(systemNotices) && systemNotices.length) {//系统消息列表
            let customerOfCurUser = this.state.customerOfCurUser;
            return (<div>
                <ul className="system_message_list">
                    {_.map(this.state.systemNotices, (notice, idx) => {
                        return this.renderUnHandledNotice(notice, idx);
                    })}
                </ul>
                <NoMoreDataTip
                    fontSize="12"
                    show={this.showNoMoreDataTip}
                    message={Intl.get('common.no.more.data', '没有更多数据了')}
                />
                {/*该客户下的用户列表*/}
                <RightPanel
                    className="customer-user-list-panel"
                    showFlag={this.state.isShowCustomerUserListPanel}
                >
                    { this.state.isShowCustomerUserListPanel ?
                        <AppUserManage
                            customer_id={customerOfCurUser.id}
                            hideCustomerUserList={this.closeCustomerUserListPanel}
                            customer_name={customerOfCurUser.name}
                        /> : null
                    }
                </RightPanel>
            </div>);
        } else if (this.state.loadSystemNoticesErrorMsg) {//错误提示
            return (
                <NoDataIntro
                    noDataTip={this.state.loadSystemNoticesErrorMsg}
                />);
        } else {//暂无数据
            return (
                <NoDataIntro
                    noDataTip={Intl.get('common.no.data', '暂无数据')}
                />);
        }
    };
    closeRightCustomerPanel = () => {
        this.setState({
            curShowCustomerId: '',
            selectedLiIndex: null
        });
    };

    openUserDetail = (user_id, idx) => {
        if (this.state.curShowCustomerId) {
            this.closeRightCustomerPanel();
        }
        this.setState({
            curShowUserId: user_id,
            selectedLiIndex: idx
        });
        //触发打开用户详情面板
        userDetailEmitter.emit(userDetailEmitter.OPEN_USER_DETAIL, {userId: user_id});
    };
    closeRightUserPanel = () => {
        this.setState({
            curShowUserId: '',
            selectedLiIndex: null
        });
    };
    openCustomerDetail = (customer_id, index) => {
        if (this.state.curShowUserId) {
            this.closeRightUserPanel();
        }
        this.setState({
            curShowCustomerId: customer_id,
            selectedLiIndex: index
        });
        //触发打开带拨打电话状态的客户详情面板
        phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
            customer_params: {
                currentId: customer_id,
                ShowCustomerUserListPanel: this.ShowCustomerUserListPanel,
                hideRightPanel: this.closeRightCustomerPanel
            }
        });
    };
    ShowCustomerUserListPanel = (data) => {
        this.setState({
            isShowCustomerUserListPanel: true,
            customerOfCurUser: data.customerObj
        });

    };

    closeCustomerUserListPanel = () => {
        this.setState({
            isShowCustomerUserListPanel: false,
            customerOfCurUser: {}
        });
    };
    //处理系统消息
    handleSystemNotice = (notice, e) => {
        Trace.traceEvent(e, '处理我的关注');
        if (notice.isHandling) {
            return;
        }
        this.setHandlingFlag(notice, true);
        myInterestAjax.updateMyInterestStatus({id: notice.id}).then(result => {
            if (result) {
                let systemNotices = this.state.systemNotices;
                //处理成功后，将该消息从未处理消息中删除,随处理失败的提示消失
                systemNotices = _.filter(systemNotices, item => item.id !== notice.id);
                let totalSize = this.state.totalSize - 1;
                this.setState({
                    systemNotices,
                    totalSize
                });
            }
        }, errorMsg => {
            this.setHandlingFlag(notice, false);
            message.error(errorMsg || Intl.get('notification.system.handled.error', '处理失败'));
        });
    };

    getLoginAppDescr(item) {
        let loginAppDescr = '';
        if (item.app_name) {
            switch (item.type) {
                case LOGIN_TYPES.INTEREST_LOGIN://关注登录
                case LOGIN_TYPES.LOGIN_LAST_DAYS://近期登录
                    loginAppDescr = Intl.get('notification.system.login', '登录了') + item.app_name;
                    break;
                case LOGIN_TYPES.LOGIN_AFTER_STOPPED://停用登录
                    loginAppDescr = Intl.get('home.page.stopped.login', '停用后登录了{app}', {app: item.app_name});
                    break;
                case LOGIN_TYPES.LOGIN_FAIL://登录失败
                    loginAppDescr = Intl.get('home.page.login.failed', '登录{app}失败', {app: item.app_name});
                    break;
            }
        }
        return loginAppDescr;
    }

    renderLoginDetailContent = (notice, idx) => {
        let detailList = [];
        _.each(notice.users, (item, index) => {
            if (item) {
                let loginAppDescr = this.getLoginAppDescr(item);
                let titleTip = _.get(item, 'app_user_name', '') + loginAppDescr;
                detailList.push(
                    <div className="system-notice-item" key={index}
                        title={titleTip}>
                        < span className="system-notice-time">
                            {TimeUtil.transTimeFormat(item.time)}
                        </span>
                        <a onClick={this.openUserDetail.bind(this, item.app_user_id, idx)}>{item.app_user_name}</a>
                        {item.app_name ?
                            <span>{loginAppDescr}</span> : ''}
                    </div>
                );
            }
        });
        _.each(notice.contracts, (item, index) => {
            if (item) {
                let contractDescr = Intl.get('home.page.contract.expires', '{contract} 合同到期', {contract: item.num});
                detailList.push(
                    <div className="system-notice-item" key={index}
                        title={contractDescr}>
                        < span className="system-notice-time">
                            {TimeUtil.transTimeFormat(item.time)}
                        </span>
                        <span>{contractDescr}</span>
                    </div>
                );
            }
        });
        return detailList;
    };

    setHandlingFlag = (notice, flag) => {
        let systemNotices = this.state.systemNotices;
        _.each(systemNotices, item => {
            if (item.id === notice.id) {
                item.isHandling = flag;
                return false;
            }
        });
        this.setState({systemNotices});
    };

    renderCustomerName(item, index) {
        let customer_label = _.get(item, 'customer_label');
        //客户合格标签
        // const qualify_label = workObj.qualify_label;
        //分数
        const score = item.customer_score;
        // const interestCls = classNames('iconfont icon-concern-customer-login', {'is-insterested-style': item.is_interested === 'true'});
        return (
            <div className='customer-name'>
                {/* <i className={interestCls}/> */}
                <CustomerLabel label={customer_label}/>
                <span className='customer-name-text'
                    title={Intl.get('home.page.work.click.tip', '点击查看{type}详情', {type: Intl.get('call.record.customer', '客户')})}
                    onClick={this.openCustomerDetail.bind(this, item.customer_id, index)}>
                    {_.get(item, 'customer_name', '')}
                </span>
                {score ? (
                    <span className='custmer-score'>
                        <i className='iconfont icon-customer-score'/>
                        {score}
                    </span>) : null}
            </div>);
    }

    //联系人和联系电话
    renderPopoverContent(contacts, item) {
        return (
            <div className="contacts-containers">
                {_.map(contacts, (contact) => {
                    var cls = classNames('contacts-item',
                        {'def-contact-item': contact.def_contancts === 'true'});
                    return (
                        <div className={cls}>
                            <div className="contacts-name-content">
                                <i className="iconfont icon-contact-default"/>
                                {contact.name}
                            </div>
                            <div className="contacts-phone-content" data-tracename="联系人电话列表">
                                {_.map(contact.phone, (phone) => {
                                    return (
                                        <div className="phone-item">
                                            <PhoneCallout
                                                phoneNumber={phone}
                                                contactName={contact.name}
                                                showPhoneIcon={true}
                                                // onCallSuccess={this.onCallSuccess.bind(this, item)}
                                                type='customer'
                                                id={_.get(item, 'customer_id','')}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    //联系人及电话的渲染
    renderContactItem(item) {
        let contacts = _.get(item, 'contacts', []);
        let phones = _.map(contacts, 'phone');
        if (!_.isEmpty(contacts) && !_.isEmpty(phones)) {
            let contactsContent = this.renderPopoverContent(contacts, item);
            return (
                <div className='my-insterest-contact-wrap'>
                    <Popover content={contactsContent} placement="bottom"
                        overlayClassName='contact-phone-popover'
                        getPopupContainer={() => document.getElementById(`my-interest-item${item.id}`)}>
                        <span className='work-contact-phone'>
                            <i className="iconfont icon-phone-call-out"/>
                        </span>
                    </Popover>
                </div>);
        }
    }

    //未处理的系统消息
    renderUnHandledNotice = (notice, idx) => {
        let loginUser = userData.getUserData();
        let loginUserId = loginUser ? loginUser.user_id : '';//只可以处理自己的系统消息
        let unhandleNoticeLiItemClass = classNames({
            'system-notice-unhandled-item': true,
            'select-li-item': idx === this.state.selectedLiIndex,
        });
        return (
            <li key={idx} className={unhandleNoticeLiItemClass} id={`my-interest-item${notice.id}`}>
                <div className="system-notice-title">
                    <div className="customer-name" title={notice.customer_name}>
                        {this.renderCustomerName(notice, idx)}
                    </div>
                </div>
                <div className="system-notice-content">
                    {this.renderLoginDetailContent(notice, idx)}
                    <div className='notice-handle-wrap'>
                        {this.renderContactItem(notice)}
                        {
                            loginUserId === notice.member_id ?
                                <Button className="notice-handled-set" disabled={notice.isHandling}
                                    onClick={this.handleSystemNotice.bind(this, notice)}
                                    title={Intl.get('home.page.my.interest.handled', '点击设为已处理')}
                                >
                                    <i className="iconfont icon-select-member"/>
                                    {notice.isHandling ? <Icon type="loading"/> : null}
                                </Button> : null
                        }
                    </div>
                </div>
            </li>
        );
    };

    render() {
        let title = (<React.Fragment><i className='iconfont icon-my-interest column-title-icon'/> {Intl.get('home.page.my.interest', '我的关注')}</React.Fragment>);
        return (
            <CardColumnItem contianerClass='my-insterest-wrap'
                title={title}
                content={this.renderInterestContent()}
            />);
    }
}
export default adaptiveHeightHoc(MyInsterestColumn);