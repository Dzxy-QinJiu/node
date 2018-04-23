/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/8/8.
 */
var language = require("../../../../public/language/getLanguage");
if (language.lan() == "es" || language.lan() == "en") {
    require("../css/user-abnornal-login-es_VE.less");
}else if (language.lan() == "zh"){
    require("../css/user-abnornal-login-zh_CN.less");
}
var UserAbnormalLoginStore = require("../store/user-abnormal-login-store");
var UserAbnormalLoginAction = require("../action/user-abnormal-login-actions");
var TimeLine = require("CMP_DIR/time-line");
//滚动条
var GeminiScrollbar = require("CMP_DIR/react-gemini-scrollbar");
var Spinner = require("CMP_DIR/spinner");
import {Select,Alert, Button} from 'antd';
import UserAbnormalLoginAjax from "../ajax/user-abnormal-login-ajax";
import { hasPrivilege } from "CMP_DIR/privilege/checker";

var Option = Select.Option;
// 没有消息的提醒
var NoMoreDataTip = require("CMP_DIR/no_more_data_tip");
//用于布局的高度
var LAYOUT_CONSTANTS = {
    TOP_HEIGHT: 90,
    BOTTOM_HEIGHT: 20,
};
const IGNORE_ABNORMAL_SUCCESS = Intl.get("user.login.abnormal.success", "该条异地信息已忽略！");
var UserAbnormalLogin = React.createClass({
    getDefaultProps: function () {
        return {
            userId: '1',
            appLists: []
        };
    },
    getInitialState: function () {
        return {
            ignoreAbnormalErrorMsg: '', // 忽略异地登录信息的失败的提示信息，默认为空
            ignoreId: '', // 忽略的id
            ...this.getStateData()
        };
    },
    onStateChange: function () {
        this.setState(this.getStateData());
    },
    getStateData: function () {
        return UserAbnormalLoginStore.getState();
    },
    componentDidMount: function () {
        UserAbnormalLoginStore.listen(this.onStateChange);
        var searchObj = {
            user_id: this.props.userId,
            page_size:this.state.page_size,
        };
        let app_id = this.props.selectedAppId;
        if(app_id){
            searchObj.app_id = app_id;
            UserAbnormalLoginAction.setApp(app_id);
        }
        var userId = this.props.userId;
        UserAbnormalLoginAction.getUserApp(userId,()=>{
            this.getAbnormalLoginLists(searchObj);
        });
    },
    getAbnormalLoginLists: function (searchObj) {
        UserAbnormalLoginAction.getUserAbnormalLogin(searchObj);
    },
    componentWillReceiveProps: function (nextProps) {
        if (nextProps.userId !== this.props.userId) {
            var userId = nextProps.userId;
            setTimeout(() => {
                UserAbnormalLoginAction.resetState();
                UserAbnormalLoginAction.getUserApp(userId, ()=> {
                    var searchObj = {
                        user_id: userId,
                        page_size:this.state.page_size,
                    };
                    let app_id = this.props.selectedAppId;
                    if(app_id){
                        searchObj.app_id = app_id;
                        UserAbnormalLoginAction.setApp(app_id);
                    }
                    this.getAbnormalLoginLists(searchObj);
                });
            });
        }
    },
    componentWillUnmount: function () {
        setTimeout(()=>{
            UserAbnormalLoginAction.resetState();
        });
        UserAbnormalLoginStore.unlisten(this.onStateChange);
    },
    retryGetAbnormalLogin: function () {
        var searchObj = {
            user_id: this.props.userId,
            page_size:this.state.page_size,
        };
        var userId = this.props.userId;
        UserAbnormalLoginAction.getUserApp(userId, ()=> {
            this.getAbnormalLoginLists(searchObj);
        });
    },
    renderAbnormalLogin:function () {
        if (this.state.getAppLoading){
            return (<Spinner />);
        }else if (this.state.getAppErrorMsg){
            //加载完成，出错的情况
            var errMsg = <span>{this.state.getAppErrorMsg}
                <a onClick={this.retryGetAbnormalLogin} style={{marginLeft:"20px",marginTop:"20px"}}>
                        <ReactIntl.FormattedMessage id="user.info.retry" defaultMessage="请重试"/>
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
        }else{
            return this.renderAbnormalLoginList();
        }
    },
    //监听下拉加载
    handleScrollBarBottom: function () {
        var length = this.state.abnormalLoginList.length;
        var lastId = this.state.abnormalLoginList[length - 1].id;
        var searchObj = {
            user_id: this.props.userId,
            page_size:this.state.page_size,
            id: lastId,
            app_id:this.state.appId
        };
        if (!searchObj.app_id){
            delete searchObj.app_id;
        }
        this.getAbnormalLoginLists(searchObj);
    },
    handleChange: function (app_id, app_name) {
        UserAbnormalLoginAction.setApp(app_id);
        var searchObj = {
            user_id: this.props.userId,
            page_size:this.state.page_size,
            app_id: app_id
        };
        if (!searchObj.app_id){
            delete searchObj.app_id;
        }
        this.getAbnormalLoginLists(searchObj);
    },
    // 处理忽略的事件
    handleIgnoreAbnormal(item) {
        if (item.id) {
            UserAbnormalLoginAjax.ignoreAbnormalLogin(item.id).then( (result) => {
                if (result == true) {
                    this.setState({
                        ignoreAbnormalErrorMsg: '',
                        ignoreId: item.id
                    });
                } else {
                    this.setState({
                        ignoreAbnormalErrorMsg: Intl.get("user.login.abnormal.failed", "忽略异常登录地失败！"),
                        ignoreId: item.id
                    });
                }
            }, (errMessage) => {
                this.setState({
                    ignoreAbnormalErrorMsg: errMessage,
                    ignoreId: item.id,
                });
            } );
        }
    },
    // 关闭忽略异常登录的提示信息
    onCloseAbnormalIgnoreTips() {
        if (!this.state.ignoreAbnormalErrorMsg) {
            UserAbnormalLoginAction.deleteAbnormalLoginInfo(this.state.ignoreId);
        }
    },
    // 点忽略之后的显示提示信息
    showIgnoreAbnormalTips(tips) {
        let type = "info";
        let message = IGNORE_ABNORMAL_SUCCESS;
        if (tips) {
            type = "error";
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
    },
    renderTimeLineItem: function (item) {
        var des = "";
        var appObj = _.find(this.state.appLists,(app)=>{return app.app_id == item.client_id;});
        var appName = appObj? appObj.app_name : '';
        if (item.type){
            switch (item.type){
                case 'appIllegal':
                    des = Intl.get("user.retry.login","停用后登录。该用户的{appName}账号已经停用，仍尝试登录。",{"appName":appName});
                    break;
                case 'illegalLocation':
                    des = Intl.get("user.exception.login","登录地异常。该用户的{client_name}账号，不在常用登录地登录。",{"client_name":item.client_name});
                    //有常用登录地字段时
                    des += (item.usual_location ? Intl.get("user.usual.location","常用登录地为{usuallocation}。",{"usuallocation":item.usual_location}) :"");
                    //有该次登录地字段时
                    des += (item.current_location ? Intl.get("user.current.location","该次登录地为{currentlocation},",{"currentlocation":item.current_location}) : "");
                    // 有该次登录的IP字段
                    des += (item.user_ip ? Intl.get("user.current.ip","IP为{currentip}。",{"currentip":item.user_ip}) : "");
                    break;
                case 'loginFailedFrequencyException':
                    des = Intl.get("user.failed.frequent.login","登录频率异常。该用户的{appName}账号，1小时内连续登录超过50次，每次都登录失败。",{"appName":appName});
                    break;
                case 'loginSuccessFrequencyException':
                    des = Intl.get("user.success.frequent.login","登录频率异常。该用户的{appName}账号，1小时内连续登录超过50次，每次都登录成功。",{"appName":appName});
                    break;
            }
        }
        return (
            <dl>
                <dd>
                    <p>
                        {des}
                        {
                            hasPrivilege("GET_LOGIN_EXCEPTION_USERS") && item.type == 'illegalLocation' ?
                                <Button type="primary" onClick={this.handleIgnoreAbnormal.bind(this, item)}>
                                    {Intl.get("user.login.abnormal.ignore", "忽略")}
                                </Button> : null
                        }
                    </p>
                    {
                        item.id == this.state.ignoreId ? this.showIgnoreAbnormalTips(this.state.ignoreAbnormalErrorMsg) : null
                    }
                </dd>
                <dt>{moment(item.timeStamp).format(oplateConsts.TIME_FORMAT)}</dt>
            </dl>
        );
    },
    //是否显示没有更多数据了
    showNoMoreDataTip: function () {
        return this.state.isNoMoreTipShow && this.state.abnormalLoginList.length >= 10;
    },
    renderAbnormalLoginList: function () {
        //应用的下拉框
        var appLists = this.state.appLists;
        var list = appLists.map((item) => {
            return (<Option value={item['app_id']} key={item['app_id']} >{item['app_name']}</Option>);
        });
        list.unshift(<Option value="" key="all" title={Intl.get("user.app.all", "全部应用")}><ReactIntl.FormattedMessage id="user.app.all" defaultMessage="全部应用" /></Option>);
        var divHeight = $(window).height() - LAYOUT_CONSTANTS.TOP_HEIGHT - LAYOUT_CONSTANTS.BOTTOM_HEIGHT;
        if (this.state.abnormalLoginLoading && !this.state.abnormalLoginList.length){
            //加载中的情况
            return (
                <div>
                    <Select style={{width:120}}
                            onChange={this.handleChange}
                            value={this.state.appId}
                    >
                        {list}
                    </Select>
                    <Spinner />
                </div>
            );
        }else if (this.state.abnormalLoginErrMsg){
            //加载完成，出错的情况
            var errMsg = <span>{this.state.abnormalLoginErrMsg}
                <a onClick={this.retryGetAbnormalLogin} style={{marginLeft:"20px",marginTop:"20px"}}>
                        <ReactIntl.FormattedMessage id="user.info.retry" defaultMessage="请重试"/>
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
        }else if (this.state.abnormalLoginList.length){
            return (
                <div>
                    <Select style={{width:120}}
                            onChange={this.handleChange}
                            value={this.state.appId}
                    >
                        {list}
                    </Select>
                    <div style={{height:divHeight,marginBottom:40}}>
                        <GeminiScrollbar
                            handleScrollBottom={this.handleScrollBarBottom}
                            listenScrollBottom={this.state.listenScrollBottom}
                        >
                            <TimeLine
                                list={this.state.abnormalLoginList}
                                groupByDay={true}
                                timeField="timeStamp"
                                render={this.renderTimeLineItem}
                            />
                            <NoMoreDataTip
                                fontSize="12"
                                show={this.showNoMoreDataTip}
                            />
                        </GeminiScrollbar>
                    </div>
                </div>
            );
        }else{
            return (
                <div>
                    <Select style={{width:120}}
                            onChange={this.handleChange}
                            value={this.state.appId}
                    >
                        {list}
                    </Select>
                    <Alert
                        message={Intl.get("common.no.data", "暂无数据")}
                        type="info"
                        showIcon={true}
                    />
                </div>
            );
        }
    },
    render: function () {
        return (
            <div className="abnormalLoginList">
                {this.renderAbnormalLogin()}
            </div>
        );
    }
});
module.exports = UserAbnormalLogin;