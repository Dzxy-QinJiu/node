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
import { ignoreCase } from 'LIB_DIR/utils/selectUtil';
var Option = Select.Option;
import {CHANGE_RECORD_TYPE} from 'PUB_DIR/sources/utils/consts';
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
        let appLists = this.props.appLists;
        this.showSelectedApp(this.props, appLists);
    }

    //如果外层有选中的app时，默认为外层选中的app，如果没有，就用app列表中的第一个
    showSelectedApp = (props, queryObj) => {
        var appId = props.selectedAppId;
        //如果外层有选中的app时，默认为外层选中的app，如果没有，就用app列表中的第一个
        if (appId) {
            var selectedApp = _.find(this.props.appLists, (item) => {
                return item.app_id === appId;
            });
            var appName = selectedApp && selectedApp.app_name ? selectedApp.app_name : '';
            if (appName) {
                UserDetailChangeRecordAction.setApp(appName);
            }
        } else {
            if (!_.isEmpty(queryObj)) {
                appId = queryObj[0].app_id;
                UserDetailChangeRecordAction.setApp(queryObj[0].app_name);
            }
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
        const userId = nextProps.userId;
        if (userId !== this.props.userId) {
            //dispatch过程中不能再dispatch，加延时，两个dispatch发送错开时间
            setTimeout(() => {
                this.showSelectedApp(nextProps, nextProps.appLists);
            });
        }
    }

    componentWillUnmount() {
        UserDetailChangeRecordStore.unlisten(this.onStateChange);
    }

    renderTimeLineItem = (item) => {

        let operatePerson = _.get(item, 'operator_aka'); // 谁做了变更
        let operateType = _.get(item, 'operate'); // 变更类型
        let operateDetail = _.get(item, 'detail'); // 具体变更了什么
        let operateTime = _.get(item, 'record_time'); // 具体变的时间

        let userType = _.get(operateDetail, 'tags');
        let tagName = '';
        if (userType) {
            switch (userType) {
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
            }
        }

        let role = _.get(operateDetail, 'roles'); // 修改用户角色
        let status = _.get(operateDetail, 'status'); // 修改用户状态
        let beginTime = _.get(operateDetail, 'begin'); // 修改授权的开始时间
        let endTime = _.get(operateDetail, 'end'); // 修改授权的结束时间
        let overDraft = _.get(operateDetail, 'overDraft'); // 修改了过期停用
        let isTwoFactor = _.get(operateDetail, 'isTwoFactor'); // 修改了二步认证
        let mutilogin = _.get(operateDetail, 'mutilogin'); // 修改了多人登录

        let nickName = _.get(operateDetail, 'nick_name'); // 修改用户昵称
        let password = _.get(operateDetail, 'password'); // 修改了密码
        let email = _.get(operateDetail, 'email'); // 修改了邮箱
        let phone = _.get(operateDetail, 'phone'); // 修改了手机号
        let description = _.get(operateDetail, 'description'); // 修改了备注


        if (operateDetail) {
            switch (operateType) {
                case CHANGE_RECORD_TYPE.grantCreate: //授权的创建
                {
                    operatePerson += Intl.get('user.create.this.user', '创建了该用户');
                    if (role) {
                        operatePerson += Intl.get('user.role.is', '角色为{role}。', { 'role': role });
                    }
                    if (userType) {
                        operatePerson += Intl.get('user.tag.is', '类型为{tag}。', { 'tag': tagName });
                    }
                    break;
                }
                case CHANGE_RECORD_TYPE.grantUpdate: //授权的更新
                {
                    if (status) { // 修改了用户的状态
                        if (status === '0') {
                            operatePerson += Intl.get('user.disabled.this.user.on.app', '停用了该用户在此应用的授权');
                        } else {
                            operatePerson += Intl.get('user.enabled.this.user.on.app', '启用了该用户在此应用的授权');
                        }
                    }
                    if (role) { // 修改了用户的角色
                        operatePerson += Intl.get('user.change.role.to', '修改了该用户的角色，改为{role}。', { 'role': role });
                    }
                    if (userType) { // 修改了用户的类型
                        operatePerson += Intl.get('user.change.tag.to', '修改了该用户的类型，改为{tag}。', { 'tag': tagName });
                    }
                    if (beginTime || endTime) { // 授权时间
                        operatePerson += Intl.get('user.change.grant.time', '将该用户的授权时间改为从{begin}到{end}。',
                            {'begin': moment(parseFloat(beginTime)).format(oplateConsts.DATE_FORMAT), 'end': moment(parseFloat(endTime)).format(oplateConsts.DATE_FORMAT)});
                    }
                    if (overDraft) { // 修改了过期停用
                        if (overDraft === '0') {
                            operatePerson += Intl.get('user.change.expired.status', '将该用户的到期状态改为{statue}。', {status: Intl.get('user.status.immutability', '不变')});
                        } else if( overDraft === '1'){
                            operatePerson += Intl.get('user.change.expired.status', '将该用户的到期状态改为{statue}。', {status: Intl.get('user.status.stop', '停用')});
                        } else if( overDraft === '2'){
                            operatePerson += Intl.get('user.change.expired.status', '将该用户的到期状态改为{statue}。', {status: Intl.get('user.status.degrade', '降级')});
                        }
                    }
                    if (isTwoFactor) { // 修改了二步认证
                        if (isTwoFactor === '0') {
                            operatePerson += Intl.get('user.close.twofactor', '关闭了二步认证。');
                        } else {
                            operatePerson += Intl.get('user.open.twofactor', '开启了二步认证。');
                        }
                    }
                    if (mutilogin) { // 修改了多人登录
                        if (mutilogin === '0') {
                            operatePerson += Intl.get('user.close.multilogin', '关闭了多人登录。');
                        } else {
                            operatePerson += Intl.get('user.open.multilogin', '开启了多人登录。');
                        }
                    }
                    break;
                }
                case CHANGE_RECORD_TYPE.userInfoUpdate: // 修改用户的基本信息
                    if (status) { // 修改了用户的状态
                        if (status === '0') {
                            operatePerson += Intl.get('user.disabled.this.user.on.app', '停用了该用户在此应用的授权');
                        } else {
                            operatePerson += Intl.get('user.enabled.this.user.on.app', '启用了该用户在此应用的授权');
                        }
                    } else if (nickName) { //修改了昵称
                        operatePerson += Intl.get('user.change.nick_name.to', '修改了该用户的昵称，改为{nick_name}。', { 'nick_name': nickName });
                    } else if (password) { //修改了密码
                        operatePerson += Intl.get('user.change.user.password', '修改了该用户的密码。');
                    } else if (email) { //修改了邮箱
                        operatePerson += Intl.get('user.change.email.to', '修改了该用户的邮箱，改为{email}。', { 'email': email });
                    } else if (phone) { //修改了手机号
                        operatePerson += Intl.get('user.change.phone.to', '修改了该用户的电话，改为{phone}。', { 'phone': phone });
                    } else if (description) { //修改了备注
                        operatePerson += Intl.get('user.change.desc.to', '修改了该用户的备注，改为{description}。', { 'description': description });
                    }
                    break;
            }
        }

        return (
            <dl>
                <dd>
                    <p>
                        <ShearContent>
                            {operatePerson}
                        </ShearContent>
                    </p>
                </dd>
                <dt>{moment(operateTime).format(oplateConsts.TIME_FORMAT)}</dt>
            </dl>
        );
    };

    handleChange = (value) => {
        const app = _.find(this.props.appLists, item => item.app_id === value);
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
        var appLists = this.props.appLists;
        var list = appLists.map((item) => {
            return (<Option value={item['app_id']} key={item['app_id']}>{item['app_name']}</Option>);
        });
        return list;
    };

    renderTraceRecord = (height) => {
        return this.renderRecordBlock(height);
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
                        onChange={this.handleChange}
                        filterOption={(input, option) => ignoreCase(input, option)}>
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
                        onChange={this.handleChange}
                        getPopupContainer={() => document.getElementById('change-record-area')}
                        filterOption={(input, option) => ignoreCase(input, option)}>
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
    userId: PropTypes.string,
    appLists: PropTypes.array
};

module.exports = UserDetailChangeRecord;

