/**
 * Created by xiaojinfeng on  2016/1/14 10:25 .
 */
//顶部导航
var React = require('react');
var createReactClass = require('create-react-class');
var TopNav = require('../../../components/top-nav');
require('./css/user-info-zh_CN.less');
var language = require('../../../public/language/getLanguage');
if (language.lan() === 'es' || language.lan() === 'en') {
    require('./css/user-info-es_VE.less');
} else if (language.lan() === 'zh') {
    require('./css/user-info-zh_CN.less');
}
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


import {FormattedMessage, defineMessages, injectIntl} from 'react-intl';
import reactIntlMixin from '../../../components/react-intl-mixin';

var UserInfoPage = createReactClass({
    displayName: 'UserInfoPage',
    mixins: [reactIntlMixin],

    getInitialState: function() {
        return {
            ...UserInfoStore.getState(),
            userInfoContainerHeight: this.userInfoContainerHeightFnc()
        };
    },

    onChange: function() {
        this.setState(UserInfoStore.getState());
    },

    componentDidMount: function() {
        var hasPrivilege = PrivilegeChecker.hasPrivilege;
        $(window).on('resize', this.resizeWindow);
        UserInfoStore.listen(this.onChange);
        UserInfoAction.getUserInfo();
        if (hasPrivilege('GET_MANAGED_REALM')) {
            UserInfoAction.getManagedRealm();
        }

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
        if (width < minUserInfoContainerWidth) {
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

    render: function() {
        var height = this.state.userInfoContainerHeight;
        return (
            <div className="userInfoManage_userInfo_content" data-tracename="个人资料">
                <div className="user-info-manage-container">
                    <TopNav>
                        <TopNav.MenuList />
                    </TopNav>
                    <UserInfo
                        userInfoFormShow={this.state.userInfoFormShow}
                        userInfo={this.state.userInfo}
                        managedRealm={this.state.managedRealm}
                        realmErrorMsg={this.state.realmErrorMsg}
                        realmLoading={this.state.realmLoading}
                        userInfoErrorMsg={this.state.userInfoErrorMsg}
                        userInfoLoading={this.state.userInfoLoading}
                    />
                    <div className="col-md-8 user-log-container-div">
                        <div className="user-log-div" style={{height: height}}>
                            <div className="log-div-title">
                                <label className="log-title">
                                    <ReactIntl.FormattedMessage id="common.operate.record" defaultMessage="操作记录"/>
                                </label>
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
                                logLoading={this.state.logLoading}
                                logErrorMsg={this.state.logErrorMsg}
                                logList={this.state.logList}
                                logTotal={this.state.logTotal}
                                sortId={this.state.sortId}
                                loadSize={this.state.loadSize}
                                listenScrollBottom={this.state.listenScrollBottom}
                                height={height - logTitleHeight - logBottomHeight}
                                handleScrollBottom={this.handleScrollBottom}
                            >
                            </UserInfoLog>
                        </div>

                    </div>
                </div>
            </div>
        );
    },
});

module.exports = UserInfoPage;

