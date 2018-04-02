var AppUserUtil = require("../util/app-user-util");
var GeminiScrollbar = require("../../../../components/react-gemini-scrollbar");
var Spinner = require("../../../../components/spinner");
import UserApplyActions from "../action/user-apply-actions";
import UserApplyStore from "../store/user-apply-store";
var Alert = require("antd").Alert;
var classNames = require("classnames");
var Dropdown = require("antd").Dropdown;
var Menu = require("antd").Menu;
var NoData = require("../../../../components/analysis-nodata");
import ApplyViewDetail from "./apply-view-detail";
var notificationEmitter = require("../../../../public/sources/utils/emitters").notificationEmitter;
var UserData = require("../../../../public/sources/user-data");
var NoMoreDataTip = require("../../../../components/no_more_data_tip");
var SearchInput = require("../../../../components/searchInput");
var topNavEmitter = require("../../../../public/sources/utils/emitters").topNavEmitter;
import Trace from "LIB_DIR/trace";


var timeoutFunc;//定时方法
var timeout = 1000;//1秒后刷新未读数
//更新申请的待审批数
function updateUnapprovedCount(count) {
    if (Oplate && Oplate.unread) {
        Oplate.unread.approve = count;
        if (timeoutFunc) {
            clearTimeout(timeoutFunc);
        }
        timeoutFunc = setTimeout(function () {
            //触发展示的组件待审批数的刷新
            notificationEmitter.emit(notificationEmitter.SHOW_UNHANDLE_APPLY_COUNT);
        }, timeout);
    }
}
var ApplyTabContent = React.createClass({

    fetchApplyList: function () {
        //如果是待审批的请求，获取到申请列表后，更新下待审批的数量。
        // 解决通过或驳回操作失败（后台其实是成功）后，刷新没有待审批的申请但数量不变的问题
        UserApplyActions.getApplyList({
            id: this.state.lastApplyId,
            page_size: this.state.pageSize,
            keyword: this.state.searchKeyword,
            isUnreadApply: this.state.isCheckUnreadApplyList,
            approval_state: UserData.hasRole(UserData.ROLE_CONSTANS.SECRETARY) ? "pass" : this.state.applyListType
        }, (count) => {
            //处理申请有过失败的情况，并且是筛选待审批的申请时,重新获取消息数；否则不发请求
            if (this.state.dealApplyError == "error" && this.state.applyListType === 'false') {
                //触发更新待审批数
                updateUnapprovedCount(count);
                UserApplyActions.updateDealApplyError("success");
            }
        });
    },

    componentDidMount: function () {
        UserApplyStore.listen(this.onStoreChange);
        $(window).on('resize', this.onWindowResize);
        //如果存在url传过来的申请applyId
        if (this.state.applyId) {//从邮件中点击链接进来时，只查看该邮件所对应的申请
            UserApplyActions.getApplyById(this.state.applyId);
        } else {
            this.fetchApplyList();
        }
        this.getUnreadReplyList();
        AppUserUtil.emitter.on("updateSelectedItem", this.updateSelectedItem);
        notificationEmitter.on(notificationEmitter.APPLY_UPDATED, this.pushDataListener);
        notificationEmitter.on(notificationEmitter.APPLY_UNREAD_REPLY, this.refreshUnreadReplyList);
        topNavEmitter.emit(topNavEmitter.RELAYOUT);
    },
    componentWillReceiveProps: function (nextProps) {
        if (nextProps.applyId !== this.props.applyId) {
            this.setState({applyId: nextProps.applyId}, () => {
                if (!this.state.applyId) {
                    //重新获取列表
                    this.retryFetchApplyList();
                }
            })
        }
    },
    //从sessionStorage中获取该用户未读的回复列表
    getUnreadReplyList: function () {
        const APPLY_UNREAD_REPLY = "apply_unread_reply";
        let userId = UserData.getUserData().user_id;
        //将未读回复列表分用户存入sessionStorage（session失效时会自动清空数据）
        let applyUnreadReply = sessionStorage.getItem(APPLY_UNREAD_REPLY);
        if (applyUnreadReply) {
            let applyUnreadReplyObj = JSON.parse(applyUnreadReply);
            let applyUnreadReplyList = _.isArray(applyUnreadReplyObj[userId]) ? applyUnreadReplyObj[userId] : [];
            this.refreshUnreadReplyList(applyUnreadReplyList);
        }
    },
    //刷新未读回复的列表
    refreshUnreadReplyList: function (unreadReplyList) {
        UserApplyActions.refreshUnreadReplyList(unreadReplyList);
    },
    updateSelectedItem: function (message) {
        const selectedDetailItem = this.state.selectedDetailItem;
        selectedDetailItem.isConsumed = 'true';
        selectedDetailItem.approval_state = message && message.approval || selectedDetailItem.approval_state;
        this.setState({selectedDetailItem});
        //处理申请成功还是失败,"success"/"error"
        UserApplyActions.updateDealApplyError(message && message.status || this.state.dealApplyError);
    },
    onWindowResize: function () {
        this.setState(this.getStoreData());
    },
    getInitialState: function () {
        var state = this.getStoreData();
        state.applyId = this.props.applyId;
        return state;
    },
    getStoreData: function () {
        return UserApplyStore.getState();
    },
    onStoreChange: function () {
        this.setState(this.getStoreData());
    },
    componentWillUnmount: function () {
        $('body').css({
            'overflow-x': 'visible',
            'overflow-y': 'visible'
        });
        $(window).off('resize', this.onWindowResize);
        UserApplyStore.unlisten(this.onStoreChange);
        AppUserUtil.emitter.removeListener("updateSelectedItem", this.updateSelectedItem);
        //销毁时，删除申请消息监听器
        notificationEmitter.removeListener(notificationEmitter.APPLY_UPDATED, this.pushDataListener);
        notificationEmitter.removeListener(notificationEmitter.APPLY_UNREAD_REPLY, this.refreshUnreadReplyList);
    },

    retryFetchApplyList: function (e) {
        if (this.state.applyListObj.errorMsg) {
            Trace.traceEvent(e, '点击了重试');
        } else {
            Trace.traceEvent(e, '点击了重新获取');
        }
        setTimeout(() => this.fetchApplyList());
    },
    renderApplyListError: function () {
        var noData = this.state.applyListObj.loadingResult === '' && this.state.applyListObj.list.length === 0 && this.state.applyListType !== 'all';
        var noDataSearch = this.state.applyListObj.loadingResult === '' && this.state.applyListObj.list.length === 0 && this.state.searchKeyword != '';
        if (this.state.applyListObj.loadingResult === 'error' || noData || noDataSearch) {
            var retry = (
                <span>
                    {this.state.applyListObj.errorMsg}，<a href="javascript:void(0)"
                                                          onClick={this.retryFetchApplyList}><ReactIntl.FormattedMessage
                    id="common.retry" defaultMessage="重试"/></a>
                </span>
            );
            var noDataMsg = (
                <span>
                <ReactIntl.FormattedMessage id="user.apply.no.match.retry"
                                            defaultMessage="暂无符合查询条件的用户申请"/><span>,</span>
                <a href="javascript:void(0)" onClick={this.retryFetchApplyList}>
                    <ReactIntl.FormattedMessage id="common.get.again" defaultMessage="重新获取"/>
                </a>
                </span>
            );
            var noDataBlock, errorBlock;
            if (noData || noDataSearch) {
                noDataBlock = (<Alert
                    message={noDataMsg}
                    type="info"
                    showIcon={true}
                />);
            } else {
                errorBlock = (
                    <Alert
                        message={retry}
                        type="error"
                        showIcon={true}
                    />
                );
            }
            return (
                <div className="app_user_manage_apply_list app_user_manage_apply_list_error">
                    {(noData || noDataSearch) ? noDataBlock : errorBlock}
                </div>);
        }
        return null;
    },
    getApplyStateText: function (obj) {
        if (obj.isConsumed == 'true') {
            if (obj.approval_state === "1") {
                return Intl.get("user.apply.pass", "已通过");
            } else if (obj.approval_state === "2") {
                return Intl.get("user.apply.reject", "已驳回");
            } else if (obj.approval_state === "3") {
                return Intl.get("user.apply.backout", "已撤销");
            }
        } else {
            return Intl.get("user.apply.false", "待审批");
        }
    },
    getTimeStr: function (d, format) {
        d = parseInt(d);
        if (isNaN(d)) {
            return '';
        }
        return moment(new Date(d)).format(format || oplateConsts.DATE_TIME_WITHOUT_SECOND_FORMAT);
    },
    //(取消)展示有未读回复的申请列表
    toggleUnreadApplyList: function () {
        UserApplyActions.setIsCheckUnreadApplyList(!this.state.isCheckUnreadApplyList);
        UserApplyActions.setLastApplyId("");
        setTimeout(() => {
            if (this.state.isCheckUnreadApplyList) {
                Trace.traceEvent($(this.getDOMNode()).find(".app_user_manage_apply_list"), "查看有未读回复的申请");
            } else {
                Trace.traceEvent($(this.getDOMNode()).find(".app_user_manage_apply_list"), "取消有未读回复申请的查看");
            }
            this.fetchApplyList()
        });
    },
    //点击展示详情
    clickShowDetail: function (obj, idx) {
        Trace.traceEvent($(this.getDOMNode()).find(".app_user_manage_apply_list"), "查看申请详情");
        UserApplyActions.setSelectedDetailItem({obj, idx});
    },
    renderApplyList: function () {
        let unreadReplyList = this.state.unreadReplyList;
        //是否展示有未读申请的提示，后端推送过来的未读回复列表中有数据，并且是在全部类型下可展示，其他待审批、已通过等类型下不展示
        let showUnreadTip = _.isArray(unreadReplyList) && unreadReplyList.length > 0 && this.state.applyListType == "all" && !this.state.searchKeyword;
        return (
            <ul className="list-unstyled app_user_manage_apply_list">
                {showUnreadTip ? (
                    <li className="has-unread-reply-tip">
                        <ReactIntl.FormattedMessage
                            id="user.apply.unread.reply.check"
                            defaultMessage={`有未读回复的申请，{check}`}
                            values={{
                                "check": <a onClick={this.toggleUnreadApplyList}>
                                    {this.state.isCheckUnreadApplyList ? Intl.get("user.apply.cancel.check", "取消查看") : Intl.get("user.apply.check", "查看")}</a>
                            }}
                        />
                    </li>
                ) : this.state.isCheckUnreadApplyList ? (<li className="has-unread-reply-tip">
                    <ReactIntl.FormattedMessage
                        id="user.apply.unread.reply.null"
                        defaultMessage={`已无未读回复的申请，{return}`}
                        values={{"return": <a onClick={this.toggleUnreadApplyList}>{Intl.get("crm.52", "返回")}</a>}}
                    />
                </li>) : null}
                {
                    this.state.applyListObj.list.map((obj, i) => {
                        var btnClass = classNames({
                            processed: obj.isConsumed == 'true'
                        });
                        var currentClass = classNames({
                            current: obj.id == this.state.selectedDetailItem.id && i == this.state.selectedDetailItemIdx
                        });
                        //是否有未读回复
                        let hasUnreadReply = _.find(unreadReplyList, unreadReply => unreadReply.apply_id == obj.id);
                        return (
                            <li key={obj.id} className={currentClass}
                                onClick={this.clickShowDetail.bind(this, obj, i)}
                            >
                                <dl>
                                    <dt>
                                        <span>{obj.topic || Intl.get("user.apply.id", "账号申请")}</span>
                                        {hasUnreadReply ? <span className="iconfont icon-apply-message-tip"
                                                                title={Intl.get("user.apply.unread.reply", "有未读回复")}/> : null}
                                        <em className={btnClass}>{this.getApplyStateText(obj)}</em>
                                    </dt>
                                    <dd className="clearfix" title={obj.customer_name}>
                                        <span>{obj.customer_name}</span>
                                    </dd>
                                    <dd className="clearfix">
                                        <span>{Intl.get("user.apply.presenter", "申请人")}:{obj.presenter}</span>
                                        <em>{this.getTimeStr(obj.time, oplateConsts.DATE_TIME_FORMAT)}</em>
                                    </dd>
                                </dl>
                            </li>
                        );
                    })
                }
            </ul>
        );
    },
    getApplyListDivHeight: function () {
        if ($(window).width() < Oplate.layout['screen-md']) {
            return 'auto';
        }
        var height = $(window).height() - AppUserUtil.APPLY_LIST_LAYOUT_CONSTANTS.TOP_DELTA - AppUserUtil.APPLY_LIST_LAYOUT_CONSTANTS.BOTTOM_DELTA + 30;
        return height;
    },
    getApplyListType: function () {
        switch (this.state.applyListType) {
            case 'all':
                return this.state.ifClickedFilterLabel ? Intl.get("common.all", "全部") : Intl.get("user.apply.list", "申请列表");
            case 'false':
                return Intl.get("user.apply.false", "待审批");
            case 'pass':
                return Intl.get("user.apply.pass", "已通过");
            case 'reject':
                return Intl.get("user.apply.reject", "已驳回");
            case 'true':
                return Intl.get("user.apply.applied", "已审批");
            case 'cancel':
                return Intl.get("user.apply.backout", "已撤销");
        }
    },
    menuClick: function (obj) {
        let selectType = '';
        if (obj.key == 'all') {
            selectType = Intl.get("common.all", "全部");
        } else if (obj.key == 'pass') {
            selectType = Intl.get("user.apply.pass", "已通过");
        } else if (obj.key == 'false') {
            selectType = Intl.get("user.apply.false", "待审批");
        } else if (obj.key == 'reject') {
            selectType = Intl.get("user.apply.reject", "已驳回");
        } else if (obj.key == 'cancel') {
            selectType = Intl.get("user.apply.backout", "已撤销");
        }
        Trace.traceEvent($(this.getDOMNode()).find(".pull-left"), "根据" + selectType + "过滤");
        UserApplyActions.changeApplyListType(obj.key);
        setTimeout(() => this.fetchApplyList());
    },
    changeSearchInputValue: function (value) {
        value = value ? value : '';
        if (value.trim() !== this.state.searchKeyword.trim()) {
            Trace.traceEvent($(this.getDOMNode()).find(".pull-right"), "根据申请人/客户名/用户名搜索");
            UserApplyActions.changeSearchInputValue(value);
            setTimeout(() => this.fetchApplyList());
        }
    },
    refreshPage: function (e) {
        Trace.traceEvent(e, "点击了刷新");
        UserApplyActions.setLastApplyId("");
        setTimeout(() => this.fetchApplyList());
        UserApplyActions.setShowUpdateTip(false);
    },
    //展示更新提示
    getUpdateTip: function () {
        if (this.state.showUpdateTip) {
            return (<div className="app_user_manage_apply_update"><ReactIntl.FormattedMessage
                id="user.apply.show.update.tip" defaultMessage="数据已更新,是否"/>
                <a href="javascript:void(0)" onClick={this.refreshPage}><ReactIntl.FormattedMessage id="common.refresh"
                                                                                                    defaultMessage="刷新"/></a>
            </div> );
        }
    },
    //监听推送数据
    pushDataListener: function (data) {
        //有数据，将是否展示更新tip
        if (UserData.hasRole(UserData.ROLE_CONSTANS.SECRETARY)) {
            if (data && data.approval_state == "pass") {
                UserApplyActions.setShowUpdateTip(true);
            }
        } else if (data) {
            UserApplyActions.setShowUpdateTip(true);
        }
    },

    //下拉加载
    handleScrollBarBottom: function () {
        this.fetchApplyList();
    },

    renderApplyHeader: function () {
        //如果是从url传入了参数applyId
        if (this.state.applyId) {
            return null;
        } else {
            // 筛选菜单
            var menuList = (
                UserData.hasRole(UserData.ROLE_CONSTANS.SECRETARY) ? null : (
                    <Menu onClick={this.menuClick} className="app_user_manage_apply_list_filter">
                        <Menu.Item key="all">
                            <a href="javascript:void(0)"><ReactIntl.FormattedMessage id="common.all"
                                                                                     defaultMessage="全部"/></a>
                        </Menu.Item>
                        <Menu.Item key="pass">
                            <a href="javascript:void(0)"><ReactIntl.FormattedMessage id="user.apply.pass"
                                                                                     defaultMessage="已通过"/></a>
                        </Menu.Item>
                        <Menu.Item key="reject">
                            <a href="javascript:void(0)"><ReactIntl.FormattedMessage id="user.apply.reject"
                                                                                     defaultMessage="已驳回"/></a>
                        </Menu.Item>
                        <Menu.Item key="false">
                            <a href="javascript:void(0)"><ReactIntl.FormattedMessage id="user.apply.false"
                                                                                     defaultMessage="待审批"/></a>
                        </Menu.Item>
                        <Menu.Item key="cancel">
                            <a href="javascript:void(0)"><ReactIntl.FormattedMessage id="user.apply.backout"
                                                                                     defaultMessage="已撤销"/></a>
                        </Menu.Item>
                    </Menu>
                )
            );
            //为了显示输入框而设置的class
            var searchBarClass = classNames({
                'input-group': true,
                'input-group-sm': true,
                'active': this.state.searchInputShow
            });
            return (
                <div className="searchbar clearfix">
                    {this.getUpdateTip()}
                    <div className="pull-left">
                        <div className={searchBarClass}>
                            <SearchInput
                                type="input"
                                className="form-control"
                                searchPlaceHolder={Intl.get("user.apply.search.placeholder", "申请人/客户名/用户名")}
                                searchEvent={this.changeSearchInputValue}
                            />
                        </div>
                    </div>
                    <span className="pull-right">
                            {
                                UserData.hasRole(UserData.ROLE_CONSTANS.SECRETARY) ? null : (
                                    <Dropdown overlay={menuList}>
                                        <a className="ant-dropdown-link" href="#">
                                            {this.getApplyListType()} <span
                                            className="glyphicon glyphicon-triangle-bottom"></span>
                                        </a>
                                    </Dropdown>
                                )
                            }
                    </span>
                </div>
            )
        }
    },

    //是否显示没有更多数据了
    showNoMoreDataTip: function () {
        return !this.state.applyListObj.loadingResult &&
            this.state.applyListObj.list.length >= 10 && !this.state.listenScrollBottom;
    },
    //当前展示的详情是否是有未读回复的详情
    getIsUnreadDetail: function () {
        let selectApplyId = this.state.selectedDetailItem ? this.state.selectedDetailItem.id : "";
        if (selectApplyId) {
            return _.some(this.state.unreadReplyList, unreadReply => unreadReply.apply_id == selectApplyId);
        } else {
            return false;
        }
    },

    render: function () {
        //根本就没有用户审批的时候，显示没数据的提示
        if (this.state.applyListObj.loadingResult === '' && this.state.applyListObj.list.length === 0 && this.state.applyListType === 'all' && this.state.searchKeyword === '') {
            let noDataTip = this.state.isCheckUnreadApplyList ? (<ReactIntl.FormattedMessage
                id="user.apply.unread.reply.null"
                defaultMessage={`已无未读回复的申请，{return}`}
                values={{"return": <a onClick={this.toggleUnreadApplyList}>{Intl.get("crm.52", "返回")}</a>}}
            />) : Intl.get("user.apply.no.apply", "还没有用户审批诶...");
            return (
                <div className="app_user_manage_apply_wrap">
                    <NoData msg={noDataTip}/>
                </div>
            );
        }
        //列表高度
        //详情高度
        var applyListHeight = 'auto';
        //判断是否屏蔽窗口的滚动条
        if ($(window).width() < Oplate.layout['screen-md']) {
            $('body').css({
                'overflow-x': 'visible',
                'overflow-y': 'visible'
            });
        } else {
            $('body').css({
                'overflow-x': 'hidden',
                'overflow-y': 'hidden'
            });
            //计算列表高度
            applyListHeight = this.getApplyListDivHeight();
        }
        var applyType = "";
        if (this.state.applyListType == 'false') {
            applyType = Intl.get("user.apply.false", "待审批");
        } else if (this.state.applyListType == 'pass') {
            applyType = Intl.get("user.apply.pass", "已通过");
        } else if (this.state.applyListType == 'reject') {
            applyType = '被驳回';
        } else if (this.state.applyListType == 'true') {
            applyType = '已审批';
        } else if (this.state.applyListType == 'cancel') {
            applyType = Intl.get("user.apply.backout", "已撤销");
        }
        var noShowApplyDetail = this.state.applyListObj.list.length === 0;
        //申请详情数据
        var applyDetail = null;
        if (!noShowApplyDetail) {
            applyDetail = {detail: this.state.applyListObj.list[0], apps: this.state.allApps};
        }

        return (
            <div className="app_user_manage_apply_wrap clearfix user-manage-v2">
                <div className="col-md-4 app_user_manage_apply_list_wrap" data-tracename="申请列表">
                    {this.renderApplyHeader()}
                    {this.renderApplyListError()}
                    {
                        this.state.applyListObj.loadingResult === 'loading' && !this.state.lastApplyId ? (
                            <Spinner/>) : (<div className="app_user_apply_list_style">
                                <div style={{height: applyListHeight}}>
                                    <GeminiScrollbar
                                        handleScrollBottom={this.handleScrollBarBottom}
                                        listenScrollBottom={this.state.listenScrollBottom}
                                        itemCssSelector=".app_user_manage_apply_list>li"
                                    >
                                        {this.renderApplyList()}
                                        <NoMoreDataTip
                                            fontSize="12"
                                            show={this.showNoMoreDataTip}
                                        />
                                    </GeminiScrollbar>
                                </div>
                                {this.state.applyId ? null : (
                                    <div className="summary_info">
                                        <ReactIntl.FormattedMessage
                                            id="user.apply.total.apply"
                                            defaultMessage={`共{number}条申请{apply_type}`}
                                            values={{
                                                'number': this.state.totalSize,
                                                'apply_type': applyType
                                            }}
                                        />
                                    </div>)
                                }
                            </div>
                        )
                    }
                </div>
                {noShowApplyDetail ? null : (
                    <ApplyViewDetail
                        applyData={this.state.applyId ? applyDetail : null}
                        detailItem={this.state.selectedDetailItem}
                        isUnreadDetail={this.getIsUnreadDetail()}
                        showNoData={!this.state.lastApplyId && this.state.applyListObj.loadingResult === 'error'}
                    />
                )}

            </div>
        );
    }
});


module.exports = ApplyTabContent;