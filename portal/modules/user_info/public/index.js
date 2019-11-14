/**
 * Created by xiaojinfeng on  2016/1/14 10:25 .
 */
//顶部导航
var createReactClass = require('create-react-class');
require('./css/index.less');
var UserInfoStore = require('./store/user-info-store');
var UserInfoAction = require('./action/user-info-actions');
var UserInfo = require('./views/user-info-user');
var UserInfoLog = require('./views/user-info-log');
import {NavLink} from 'react-router-dom';
var topHeight = 65;//顶部导航的高度
var logTitleHeight = 40;//登录日志顶部title高度
const logBottomHeight = 40; // 登录日志距离底部高度
var paddingBotton = 50;//距离底部高度
var minUserInfoContainerWidth = 1035;//个人资料界面可并排展示时的最小宽度 低于此宽度时个人资料与登录日志上下展示
var userLogHeight = 690;//如果界面宽度低于最小宽度时，登录日志高度默认值
var minUserInfoHeight = 380;//如果并排展示时，登录日志展示区域最小高度
var PrivilegeChecker = require('../../../components/privilege/checker');
import reactIntlMixin from '../../../components/react-intl-mixin';
import {Tabs} from 'antd';
const TabPane = Tabs.TabPane;
import TradeRecord from './views/trade-record';
import history from 'PUB_DIR/sources/history';
import { getOrganizationInfo } from 'PUB_DIR/sources/utils/common-data-util';

const TAB_KEYS = {
    OPERATE_RECORD_TAB: '1',// 操作记录
    TRADE_TAB: '2',// 交易记录
};

const TAB_HEIGHT = 40; // 标签页占据的高度

var UserInfoPage = createReactClass({
    displayName: 'UserInfoPage',
    mixins: [reactIntlMixin],

    getInitialState: function() {
        return {
            ...UserInfoStore.getState(),
            userInfoContainerHeight: this.userInfoContainerHeightFnc(),
            activeKey: TAB_KEYS.OPERATE_RECORD_TAB,
            organizationName: ''
        };
    },

    onChange: function() {
        this.setState(UserInfoStore.getState());
    },

    getOrganizationName(data) {
        this.setState({
            organizationName: _.get(data, 'name', '')
        });
    },

    componentDidMount: function() {
        var hasPrivilege = PrivilegeChecker.hasPrivilege;
        $(window).on('resize', this.resizeWindow);
        UserInfoStore.listen(this.onChange);
        // 判断是不是跳转过来的，若是的话，显示购买记录界面
        if(_.get(history.location, 'state.show_pay_record')) {
            this.changeActiveKey(TAB_KEYS.TRADE_TAB);
        }
        getOrganizationInfo().then((result) => {
            this.getOrganizationName(result);
        });
        UserInfoAction.getUserInfo();
        UserInfoAction.getLogList({
            load_size: this.state.loadSize
        });
    },

    componentWillUnmount: function() {
        $('body').css('overflow', 'auto');
        $(window).off('resize', this.resizeWindow);
        UserInfoStore.unlisten(this.onChange);
    },

    resizeWindow: function() {
        var height = this.userInfoContainerHeightFnc();
        this.setState({
            userInfoContainerHeight: height
        });
    },

    //获取当前可展示区域的高度
    userInfoContainerHeightFnc: function() {
        var width = $('.user-info-manage-container').width();
        var height = $(window).height() - topHeight - paddingBotton;
        if (width && width < minUserInfoContainerWidth) {
            //如果宽度小于最小宽度时，登录日志高度默认为userLogHeight，界面有竖向滚动条，无横向滚动条
            height = userLogHeight;
            $('body').css('overflow-x', 'hidden');
            $('body').css('overflow-y', 'auto');
        }
        return height < minUserInfoHeight ? minUserInfoHeight : height;
    },

    handleScrollBottom() {
        UserInfoAction.getLogList({
            sort_id: this.state.sortId,
            load_size: this.state.loadSize
        });
    },

    changeActiveKey(key) {
        this.setState({
            activeKey: key
        });
    },

    render: function() {
        let height = this.state.userInfoContainerHeight;

        let containerHeight = height - logTitleHeight - logBottomHeight - TAB_HEIGHT;

        return (
            <div className="user-info-manage-container" data-tracename="个人资料">
                <UserInfo
                    userInfo={this.state.userInfo}
                    managedRealm={this.state.organizationName}
                    userInfoErrorMsg={this.state.userInfoErrorMsg}
                    userInfoLoading={this.state.userInfoLoading}
                />
                <div className="col-md-8 user-record-container-wrap">
                    <Tabs
                        activeKey={this.state.activeKey}
                        onChange={this.changeActiveKey}
                    >
                        <TabPane
                            tab={Intl.get('common.operate.record', '操作记录')}
                            key={TAB_KEYS.OPERATE_RECORD_TAB}
                        >
                            {
                                this.state.activeKey === TAB_KEYS.OPERATE_RECORD_TAB ?
                                    <div className="user-log-div">
                                        <div className="log-div-title">
                                            <label className="log-title-tips">
                                                <ReactIntl.FormattedMessage
                                                    id="user.info.log.record.tip"
                                                    defaultMessage={'以下为您最近的操作记录，若存在异常情况，请在核实后尽快{editpassword}'}
                                                    values={{
                                                        editpassword: <span className="update-pwd">
                                                            <NavLink to="/user_info_manage/user_pwd" activeClassName="active"data-tracename="修改密码">
                                                                <ReactIntl.FormattedMessage id="common.edit.password" defaultMessage="修改密码"/>
                                                            </NavLink>
                                                        </span>
                                                    }}
                                                />
                                            </label>
                                        </div>
                                        <UserInfoLog
                                            logErrorMsg={this.state.logErrorMsg}
                                            logLoading={this.state.logLoading}
                                            logList={this.state.logList}
                                            logTotal={this.state.logTotal}
                                            sortId={this.state.sortId}
                                            loadSize={this.state.loadSize}
                                            listenScrollBottom={this.state.listenScrollBottom}
                                            height={containerHeight}
                                            handleScrollBottom={this.handleScrollBottom}
                                        />
                                    </div>
                                    : null
                            }
                        </TabPane>
                        <TabPane
                            tab={Intl.get('user.trade.record', '购买记录')}
                            key={TAB_KEYS.TRADE_TAB}
                        >
                            {
                                this.state.activeKey === TAB_KEYS.TRADE_TAB ? (
                                    <TradeRecord
                                        height={containerHeight + logTitleHeight}
                                    />
                                ) : null
                            }
                        </TabPane>
                    </Tabs>
                </div>
            </div>
        );
    },
});

module.exports = UserInfoPage;

