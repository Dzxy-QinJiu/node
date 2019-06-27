/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/5/11.
 */
var React = require('react');
var language = require('../../../../public/language/getLanguage');
if (language.lan() === 'es' || language.lan() === 'en') {
    require('../css/user-detail-change-record-zh_CN.less');
    require('../css/user-detail-change-record-es_VE.less');
} else if (language.lan() === 'zh') {
    require('../css/user-detail-change-record-zh_CN.less');
}
var UserDetailChangeRecordStore = require('../store/user-detail-change-record-store');
var UserDetailChangeRecordAction = require('../action/user-detail-change-record-actions');
import {AntcTimeLine} from 'antc';
//滚动条
var GeminiScrollbar = require('../../../../components/react-gemini-scrollbar');
var Spinner = require('../../../../components/spinner');
import { Select, Alert } from 'antd';
import StatusWrapper from 'CMP_DIR/status-wrapper';
import ShearContent from '../../../../components/shear-content';
var Option = Select.Option;

//高度常量
var LAYOUT_CONSTANTS = {
    RIGHT_PANEL_PADDING_TOP: 20,//右侧面板顶部padding
    RIGHT_PANEL_PADDING_BOTTOM: 20,//右侧面板底部padding
    DYNAMIC_LIST_MARGIN_BOTTOM: 20,//列表距离底部margin
    RIGHT_PANEL_TAB_HEIGHT: 36,//右侧面板tab高度
    RIGHT_PANEL_TAB_MARGIN_BOTTOM: 17,//右侧面板tab的margin
    TOP_PADDING: 100,//选择框留白
};

class UserDetailChangeRecord extends React.Component {
    static defaultProps = {
        userId: '1'
    };

    onStateChange = () => {
        this.setState(this.getStateData());
    };

    getStateData = () => {
        return UserDetailChangeRecordStore.getState();
    };

    componentDidMount() {
        UserDetailChangeRecordStore.listen(this.onStateChange);
        let userId = this.props.userId;
        UserDetailChangeRecordAction.getUserApp(userId, (queryObj) => {
            this.showSelectedApp(this.props, queryObj);
        });
    }

    //如果外层有选中的app时，默认为外层选中的app，如果没有，就用app列表中的第一个
    showSelectedApp = (props, queryObj) => {
        var appId = props.selectedAppId;
        //如果外层有选中的app时，默认为外层选中的app，如果没有，就用app列表中的第一个
        if (appId) {
            var selectedApp = _.find(this.state.appLists, (item) => {
                return item.app_id === appId;
            });
            var appName = selectedApp && selectedApp.app_name ? selectedApp.app_name : '';
            if (appName) {
                UserDetailChangeRecordAction.setApp(appName);
            }
        } else {
            appId = queryObj.app_id;
            UserDetailChangeRecordAction.setApp(this.state.app);
        }
        this.getUserDetailChangeRecord({
            app_id: appId + ',everyapp',
            user_id: props.userId,
            page_size: this.state.page_size,
        });

    };

    getUserDetailChangeRecord = (queryObj) => {
        UserDetailChangeRecordAction.getUserDetailChangeRecord(queryObj);
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.userId !== this.props.userId) {
            //dispatch过程中不能再dispatch，加延时，两个dispatch发送错开时间
            var userId = nextProps.userId;
            setTimeout(() => {
                UserDetailChangeRecordAction.getUserApp(userId, (queryObj) => {
                    this.showSelectedApp(nextProps, queryObj);
                });
            });
        }
    }

    componentWillUnmount() {
        UserDetailChangeRecordStore.unlisten(this.onStateChange);
    }

    renderTimeLineItem = (item) => {
        var desc = item.operator_aka;
        //角色 类型 状态 昵称 密码 邮箱 电话 备注
        var role = '', tags = '', tagName = '', status = '', nickname = '', password = '', email = '', phone = '', description = '', timerange = '', begin = ' ', end = ' ', overdraft = '', istwofactor = '', mutilogin = '';
        if (item.detail.tags) {
            switch (item.detail.tags) {
                case 'internal':
                    tagName = '员工';
                    break;
                case 'special':
                    tagName = '赠送';
                    break;
                case 'training':
                    tagName = '培训';
                    break;
                case '正式用户':
                    tagName = '签约';
                    break;
                case '试用用户':
                    tagName = '试用';
                    break;
                default:
                    tagName = '';
                    break;
            }
        }
        if (item.operate === 'GrantCreate' && item.detail) {
            //授权的创建
            desc += Intl.get('user.create.this.user', '创建了该用户');
            //角色描述
            item.detail.roles && (role += Intl.get('user.role.is', '角色为{role}。', { 'role': item.detail.roles }));
            //类型描述
            item.detail.tags && (tags += Intl.get('user.tag.is', '类型为{tag}。', { 'tag': tagName }));
            desc = desc + role + tags;
        } else if (item.operate === 'GrantUpdate' && item.detail) {
            //授权的更新
            //修改了用户的状态
            item.detail.status && (item.detail.status === '0' ? (status += Intl.get('user.disabled.this.user.on.app', '停用了该用户在此应用的授权')) : (status += Intl.get('user.enabled.this.user.on.app', '启用了该用户在此应用的授权')));
            //修改了用户的角色
            item.detail.roles && (role += Intl.get('user.change.role.to', '修改了该用户的角色，改为{role}。', { 'role': item.detail.roles }));
            //修改了用户的类型
            item.detail.tags && (tags += Intl.get('user.change.tag.to', '修改了该用户的类型，改为{tag}。', { 'tag': tagName }));
            //授权时间
            if (item.detail.begin) {
                begin = moment(parseFloat(item.detail.begin)).format(oplateConsts.DATE_FORMAT);
            }
            if (item.detail.end) {
                end = moment(parseFloat(item.detail.end)).format(oplateConsts.DATE_FORMAT);
            }
            (item.detail.begin || item.detail.end) && (timerange += Intl.get('user.change.grant.time', '将该用户的授权时间改为从{begin}到{end}。', { 'begin': begin, 'end': end }));
            //是否过期停用
            item.detail.overDraft && (item.detail.overDraft === '0' ? (overdraft += Intl.get('user.cancel.overdraft', '取消了到期停用。')) : (overdraft += Intl.get('user.setting.overdraft', '设置了到期停用。')));
            //是否二步认证
            item.detail.isTwoFactor && (item.detail.isTwoFactor === '0' ? (istwofactor += Intl.get('user.close.twofactor', '关闭了二步认证。')) : (istwofactor += Intl.get('user.open.twofactor', '开启了二步认证。')));
            //是否多人登录
            item.detail.mutilogin && (item.detail.mutilogin === '0' ? (mutilogin += Intl.get('user.close.multilogin', '关闭了多人登录。')) : (mutilogin += Intl.get('user.open.multilogin', '开启了多人登录。')));

            desc = desc + status + role + tags + timerange + overdraft + istwofactor + mutilogin;
        } else if (item.operate === 'UserInfoUpdate' && item.detail) {
            //基本信息的修改
            //修改了用户的状态
            item.detail.status && (item.detail.status === '0' ? (status += Intl.get('user.disabled.this.user', '关闭了在该应用下的授权。')) : (status += Intl.get('user.enabled.this.user', '启用了在该应用下的授权。')));
            //修改了昵称
            item.detail.nick_name && (nickname += Intl.get('user.change.nick_name.to', '修改了该用户的昵称，改为{nick_name}。', { 'nick_name': item.detail.nick_name }));
            // 修改了密码
            item.detail.password && (password += Intl.get('user.change.user.password', '修改了该用户的密码。'));
            // 修改了邮箱
            item.detail.email && (email += Intl.get('user.change.email.to', '修改了该用户的邮箱，改为{email}。', { 'email': item.detail.email }));
            // 修改了备注
            item.detail.phone && (phone += Intl.get('user.change.phone.to', '修改了该用户的电话，改为{phone}。', { 'phone': item.detail.phone }));
            // 修改了备注
            item.detail.description && (description += Intl.get('user.change.desc.to', '修改了该用户的备注，改为{description}。', { 'description': item.detail.description }));
            //

            desc = desc + status + nickname + password + email + phone + description;
        }
        return (
            <dl>
                <dd>
                    <p>
                        <ShearContent>
                            {desc}
                        </ShearContent>
                    </p>
                </dd>
                <dt>{moment(item.record_time).format(oplateConsts.TIME_FORMAT)}</dt>
            </dl>
        );
    };

    handleChange = (value) => {
        const app = _.find(this.state.appLists, item => item.app_id === value);
        const appName = app ? app.app_name : '';
        let queryObj = {
            user_id: this.props.userId,
            app_id: value + ',' + 'everyapp',
            page_size: this.state.page_size,
        };
        UserDetailChangeRecordAction.getUserDetailChangeRecord(queryObj);
        UserDetailChangeRecordAction.setApp(appName);
    };

    retryChangeRecord = () => {
        let queryObj = {
            user_id: this.props.userId,
        };
        UserDetailChangeRecordAction.getUserDetailChangeRecord(queryObj);
    };

    getSelectOptions = () => {
        var appLists = this.state.appLists;
        var list = appLists.map((item) => {
            return (<Option value={item['app_id']} key={item['app_id']}>{item['app_name']}</Option>);
        });
        return list;
    };

    retryRenderTraceRecord = () => {
        var userId = this.props.userId;
        UserDetailChangeRecordAction.getUserApp(userId, (queryObj) => {
            UserDetailChangeRecordAction.setApp(this.state.app);
            this.getUserDetailChangeRecord({
                app_id: queryObj.app_id + ',everyapp',
                user_id: this.props.userId,
                page_size: this.state.page_size,
            });
        });

    };

    renderTraceRecord = (height) => {
        if (this.state.getAppLoading) {
            return (<StatusWrapper loading={true} height={height} />);
        } else if (this.state.getAppErrorMsg) {
            //加载完成，出错的情况
            var errMsg = <span>{this.state.getAppErrorMsg}
                <a onClick={this.retryRenderTraceRecord} style={{ marginLeft: '20px', marginTop: '20px' }}>
                    <ReactIntl.FormattedMessage id="user.info.retry" defaultMessage="请重试" />
                </a>
            </span>;
            return (
                <div className="intial-alert-wrap">
                    <Alert
                        message={errMsg}
                        type="error"
                        showIcon={true}
                    />
                </div>
            );
        } else {
            return this.renderRecordBlock(height);
        }
    };

    renderRecordBlock = (height) => {
        var recordLength = this.state.changeRecord.length;
        var width = 120;
        if (this.state.changeRecordLoading && this.state.app) {
            //加载中的情况
            return (
                <div>
                    <Select value={this.state.app} style={{ width: width }}
                        onChange={this.handleChange}>
                        {this.getSelectOptions()}
                    </Select>
                    <StatusWrapper loading={true} height={height - LAYOUT_CONSTANTS.TOP_PADDING} />
                </div>
            );
        } else if (recordLength === 0 && !this.state.changeRecordLoading) {
            //加载完成，没有数据的情况
            return (
                <div>
                    <Select showSearch value={this.state.app} style={{ width: width }}
                        onChange={this.handleChange}>
                        {this.getSelectOptions()}
                    </Select>
                    <Alert
                        message={Intl.get('common.no.data', '暂无数据')}
                        type="info"
                        showIcon={true}
                    />
                </div>
            );
        } else if (recordLength !== 0 && !this.state.changeRecordLoading) {
            //加载完成，有数据的情况
            return (
                <div id="change-record-area">
                    <Select showSearch value={this.state.app} style={{ width: width }}
                        onChange={this.handleChange} getPopupContainer={() => document.getElementById('change-record-area')}>
                        {this.getSelectOptions()}
                    </Select>
                    <AntcTimeLine
                        className="icon-blue"
                        data={this.state.changeRecord}
                        groupByDay={true}
                        timeField="record_time"
                        contentRender={this.renderTimeLineItem}
                        dot={<span className="iconfont icon-change"></span>}
                    />
                </div>
            );
        } else if (this.state.changeRecordErrMsg && !this.state.changeRecordLoading) {
            //加载完成，出错的情况
            var errMsg = <span>{this.state.changeRecordErrMsg}
                <a onClick={this.retryChangeRecord} style={{ marginLeft: '20px', marginTop: '20px' }}>
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
        }

    };

    state = this.getStateData();

    render() {
        var divHeight = $(window).height()
            - LAYOUT_CONSTANTS.RIGHT_PANEL_PADDING_TOP //右侧面板顶部padding
            - LAYOUT_CONSTANTS.RIGHT_PANEL_PADDING_BOTTOM //右侧面板底部padding
            - LAYOUT_CONSTANTS.DYNAMIC_LIST_MARGIN_BOTTOM //列表距离底部margin
            - LAYOUT_CONSTANTS.RIGHT_PANEL_TAB_HEIGHT //右侧面板tab高度
            - LAYOUT_CONSTANTS.RIGHT_PANEL_TAB_MARGIN_BOTTOM //右侧面板tab的margin
            ;
        return (
            <div style={{ height: this.props.height }} className="recordList">
                <GeminiScrollbar>
                    {this.renderTraceRecord(divHeight)}
                </GeminiScrollbar>
            </div>
        );

    }
}
UserDetailChangeRecord.propTypes = {
    height: PropTypes.number,
    userId: PropTypes.string
};
module.exports = UserDetailChangeRecord;

