/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/8/8.
 */
var language = require('../../../../public/language/getLanguage');
if (language.lan() === 'es' || language.lan() === 'en') {
    require('../css/user-abnornal-login-zh_CN.less');
    require('../css/user-abnornal-login-es_VE.less');
} else if (language.lan() === 'zh') {
    require('../css/user-abnornal-login-zh_CN.less');
}
var UserAbnormalLoginStore = require('../store/user-abnormal-login-store');
var UserAbnormalLoginAction = require('../action/user-abnormal-login-actions');
import {AntcTimeLine} from 'antc';
//滚动条
var GeminiScrollbar = require('CMP_DIR/react-gemini-scrollbar');
var Spinner = require('CMP_DIR/spinner');
import { Select, Alert, Button } from 'antd';
import UserAbnormalLoginAjax from '../ajax/user-abnormal-login-ajax';
import { hasPrivilege } from 'CMP_DIR/privilege/checker';
import StatusWrapper from 'CMP_DIR/status-wrapper';
import ShearContent from '../../../../components/shear-content';
import USER_MANAGE_PRIVILEGE from '../privilege-const';
var Option = Select.Option;
// 没有消息的提醒
var NoMoreDataTip = require('CMP_DIR/no_more_data_tip');
//用于布局的高度
var LAYOUT_CONSTANTS = {
    TOP_HEIGHT: 90,
    BOTTOM_HEIGHT: 20,
};
const IGNORE_ABNORMAL_SUCCESS = Intl.get('user.login.abnormal.success', '该条异地信息已忽略！');


class UserAbnormalLogin extends React.Component {
    static defaultProps = {
        userId: '1',
        appLists: []
    };

    onStateChange = () => {
        this.setState(this.getStateData());
    };

    getStateData = () => {
        return UserAbnormalLoginStore.getState();
    };

    componentDidMount() {
        UserAbnormalLoginStore.listen(this.onStateChange);
        let appId = this.props.selectedAppId;
        if (appId === '') {
            appId = _.get(this.props.appLists, '[0].app_id');
        }
        UserAbnormalLoginAction.setApp(appId);
        let searchObj = {
            user_id: this.props.userId,
            page_size: this.state.page_size,
        };
        searchObj.app_id = appId;
        this.getAbnormalLoginLists(searchObj);

    }

    getAbnormalLoginLists = (searchObj) => {
        UserAbnormalLoginAction.getUserAbnormalLogin(searchObj);
    };

    componentWillReceiveProps(nextProps) {
        let userId = nextProps.userId;
        if (userId && userId !== this.props.userId) {
            setTimeout(() => {
                UserAbnormalLoginAction.resetState();
                let appId = this.props.selectedAppId;
                if (appId === '') {
                    appId = _.get(this.props.appLists, '[0].app_id');
                }
                UserAbnormalLoginAction.setApp(appId);
                let searchObj = {
                    user_id: userId,
                    page_size: this.state.page_size,
                };
                searchObj.app_id = appId;
                this.getAbnormalLoginLists(searchObj);
            });
        }
    }

    componentWillUnmount() {
        setTimeout(() => {
            UserAbnormalLoginAction.resetState();
        });
        UserAbnormalLoginStore.unlisten(this.onStateChange);
    }


    renderAbnormalLogin = (height) => {
        return this.renderAbnormalLoginList(height);
    };

    //监听下拉加载
    handleScrollBarBottom = () => {
        var length = this.state.abnormalLoginList.length;
        var lastId = this.state.abnormalLoginList[length - 1].id;
        var searchObj = {
            user_id: this.props.userId,
            page_size: this.state.page_size,
            id: lastId,
            app_id: this.state.appId
        };
        if (!searchObj.app_id) {
            delete searchObj.app_id;
        }
        this.getAbnormalLoginLists(searchObj);
    };

    handleChange = (app_id, app_name) => {
        UserAbnormalLoginAction.setApp(app_id);
        var searchObj = {
            user_id: this.props.userId,
            page_size: this.state.page_size,
            app_id: app_id
        };
        if (!searchObj.app_id) {
            delete searchObj.app_id;
        }
        this.getAbnormalLoginLists(searchObj);
    };

    // 处理忽略的事件
    handleIgnoreAbnormal = (item) => {
        if (item.id) {
            UserAbnormalLoginAjax.ignoreAbnormalLogin(item.id).then((result) => {
                if (result === true) {
                    this.setState({
                        ignoreAbnormalErrorMsg: '',
                        ignoreId: item.id
                    });
                } else {
                    this.setState({
                        ignoreAbnormalErrorMsg: Intl.get('user.login.abnormal.failed', '忽略异常登录地失败！'),
                        ignoreId: item.id
                    });
                }
            }, (errMessage) => {
                this.setState({
                    ignoreAbnormalErrorMsg: errMessage,
                    ignoreId: item.id,
                });
            });
        }
    };

    // 关闭忽略异常登录的提示信息
    onCloseAbnormalIgnoreTips = () => {
        if (!this.state.ignoreAbnormalErrorMsg) {
            UserAbnormalLoginAction.deleteAbnormalLoginInfo(this.state.ignoreId);
        }
    };

    // 点忽略之后的显示提示信息
    showIgnoreAbnormalTips = (tips) => {
        let type = 'info';
        let message = IGNORE_ABNORMAL_SUCCESS;
        if (tips) {
            type = 'error';
            message = tips;
        }
        return (
            <div className="ignore-abnormal-tips">
                <Alert
                    message={message}
                    type={type}
                    closable
                    onClose={this.onCloseAbnormalIgnoreTips}
                />
            </div>
        );
    };

    renderTimeLineItem = (item) => {
        var des = '';
        let title = '';
        var appObj = _.find(this.props.appLists, (app) => { return app.app_id === item.client_id; });
        var appName = appObj ? appObj.app_name : '';
        if (item.type) {
            switch (item.type) {
                case 'appIllegal':
                    title = Intl.get('sales.frontpage.login.after.stop', '停用后登录');
                    des = Intl.get('user.retry.login', '停用后登录。该用户的{appName}账号已经停用，仍尝试登录。', { 'appName': appName });
                    break;
                case 'illegalLocation':
                    title = Intl.get('user.exception.login.location', '登录地异常');
                    des = Intl.get('user.exception.login', '登录地异常。该用户的{client_name}账号，不在常用登录地登录。', { 'client_name': item.client_name });
                    //有常用登录地字段时
                    des += (item.usual_location ? Intl.get('user.usual.location', '常用登录地为{usuallocation}。', { 'usuallocation': item.usual_location }) : '');
                    //有该次登录地字段时
                    des += (item.current_location ? Intl.get('user.current.location', '该次登录地为{currentlocation},', { 'currentlocation': item.current_location }) : '');
                    // 有该次登录的IP字段
                    des += (item.user_ip ? Intl.get('user.current.ip', 'IP为{currentip}。', { 'currentip': item.user_ip }) : '');
                    break;
                case 'loginFailedFrequencyException':
                    title = Intl.get('user.success.frequent.login.short', '登录频率异常');
                    des = Intl.get('user.failed.frequent.login', '登录频率异常。该用户的{appName}账号，1小时内连续登录超过50次，每次都登录失败。', { 'appName': appName });
                    break;
                case 'loginSuccessFrequencyException':
                    title = Intl.get('user.success.frequent.login.short', '登录频率异常');
                    des = Intl.get('user.success.frequent.login', '登录频率异常。该用户的{appName}账号，1小时内连续登录超过50次，每次都登录成功。', { 'appName': appName });
                    break;
            }
        }
        return (
            <dl>
                <dd>
                    {title}
                    {
                        hasPrivilege(USER_MANAGE_PRIVILEGE.USER_QUERY) && item.type === 'illegalLocation' ?
                            <span className="title-btn" onClick={this.handleIgnoreAbnormal.bind(this, item)}>
                                {Intl.get('user.login.abnormal.ignore', '忽略')}
                            </span> : null
                    }
                    {
                        item.id === this.state.ignoreId ? this.showIgnoreAbnormalTips(this.state.ignoreAbnormalErrorMsg) : null
                    }
                </dd>
                <dt>
                    <p>
                        <ShearContent>
                            {des}
                        </ShearContent>
                    </p>
                </dt>
                <dt>{moment(item.timeStamp).format(oplateConsts.TIME_FORMAT)}</dt>
            </dl>
        );
    };

    //是否显示没有更多数据了
    showNoMoreDataTip = () => {
        return this.state.isNoMoreTipShow && this.state.abnormalLoginList.length >= 10;
    };

    renderAbnormalLoginList = (height) => {
        //应用的下拉框
        let list = _.map(this.props.appLists, item =>
            <Option value={item['app_id']} key={item['app_id']} >{item['app_name']}</Option>);
        list.unshift(<Option value="" key="all" title={Intl.get('user.product.all','全部产品')}><ReactIntl.FormattedMessage id="'user.product.all" defaultMessage="全部产品" /></Option>);
        if (this.state.abnormalLoginLoading && !this.state.abnormalLoginList.length) {
            //加载中的情况
            return (
                <div>
                    <Select style={{ width: 120 }}
                        onChange={this.handleChange}
                        value={this.state.appId}
                    >
                        {list}
                    </Select>
                    <StatusWrapper loading={true} height={height - 100} />
                </div>
            );
        } else if (this.state.abnormalLoginErrMsg) {
            //加载完成，出错的情况
            var errMsg = <span>{this.state.abnormalLoginErrMsg}
                <a onClick={this.retryGetAbnormalLogin} style={{ marginLeft: '20px', marginTop: '20px' }}>
                    <ReactIntl.FormattedMessage id="user.info.retry" defaultMessage="请重试" />
                </a>
            </span>;
            return (
                <div className="alert-wrap">
                    <Alert
                        message={errMsg}
                        type="error"
                        showIcon={true}
                    />
                </div>
            );
        } else if (this.state.abnormalLoginList.length) {
            return (
                <div>
                    <Select style={{ width: 120 }}
                        onChange={this.handleChange}
                        value={this.state.appId}
                    >
                        {list}
                    </Select>
                    <AntcTimeLine
                        className="icon-yellow"
                        data={this.state.abnormalLoginList}
                        groupByDay={true}
                        timeField="timeStamp"
                        contentRender={this.renderTimeLineItem}
                        dot={<span className="iconfont icon-deactivate-customer-login"></span>}
                    />
                    <NoMoreDataTip
                        fontSize="12"
                        show={this.showNoMoreDataTip}
                        message={Intl.get('common.no.more.abnormal.login', '没有更多异常登录了')}
                    />
                </div>
            );
        } else {
            return (
                <div>
                    <Select style={{ width: 120 }}
                        onChange={this.handleChange}
                        value={this.state.appId}
                    >
                        {list}
                    </Select>
                    <Alert
                        message={Intl.get('common.no.data', '暂无数据')}
                        type="info"
                        showIcon={true}
                    />
                </div>
            );
        }
    };

    state = {
        ignoreAbnormalErrorMsg: '', // 忽略异地登录信息的失败的提示信息，默认为空
        ignoreId: '', // 忽略的id
        ...this.getStateData()
    };

    render() {
        var divHeight = $(window).height()
            - LAYOUT_CONSTANTS.RIGHT_PANEL_PADDING_TOP //右侧面板顶部padding
            - LAYOUT_CONSTANTS.RIGHT_PANEL_PADDING_BOTTOM //右侧面板底部padding
            - LAYOUT_CONSTANTS.DYNAMIC_LIST_MARGIN_BOTTOM //列表距离底部margin
            - LAYOUT_CONSTANTS.RIGHT_PANEL_TAB_HEIGHT //右侧面板tab高度
            - LAYOUT_CONSTANTS.RIGHT_PANEL_TAB_MARGIN_BOTTOM //右侧面板tab的margin
            ;
        return (
            <div className="abnormalLoginList">
                <div style={{ height: this.props.height, marginBottom: 40 }}>
                    <GeminiScrollbar
                        handleScrollBottom={this.handleScrollBarBottom}
                        listenScrollBottom={this.state.listenScrollBottom}
                    >
                        {this.renderAbnormalLogin(divHeight)}
                    </GeminiScrollbar>
                </div>
            </div>
        );
    }
}
UserAbnormalLogin.propTypes = {
    userId: PropTypes.string,
    selectedAppId: PropTypes.string,
    height: PropTypes.number,
    appLists: PropTypes.array
};
module.exports = UserAbnormalLogin;
