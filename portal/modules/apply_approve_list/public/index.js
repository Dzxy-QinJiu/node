/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2020/02/06.
 */
require('./css/index.less');
var insertStyle = require('CMP_DIR/insert-style');
import {
    APPLY_APPROVE_TAB_TYPES,
    APPLY_TYPE,
    APPLY_LIST_LAYOUT_CONSTANTS,
    getApplyListDivHeight,
    FILTER,
    SEARCH,
    UnitOldAndNewUserInfo,
    ALL,
    UNREPLY,
    getAllUnhandleApplyCount
} from './utils/apply_approve_utils';
import classNames from 'classnames';
import {Dropdown, Menu, Alert, Select} from 'antd';
import userData from 'PUB_DIR/sources/user-data';
import {
    APPLY_APPROVE_TYPES,
    DIFF_APPLY_TYPE_UNREAD_REPLY,
    DOCUMENT_TYPE,
    REPORT_TYPE
} from 'PUB_DIR/sources/utils/consts';
import AddSalesOpportunityApply from 'MOD_DIR/sales_opportunity/public/view/add-sales-opportunity-apply';
import BusinessOpportunity from 'MOD_DIR/sales_opportunity/public/view/apply-view-detail';
import AddBusinessApply from 'MOD_DIR/business-apply/public/view/add-business-apply';
import BusinessDetail from 'MOD_DIR/business-apply/public/view/apply-view-detail';
import AddLeaveApply from 'MOD_DIR/leave-apply/public/view/add-leave-apply';
import LeaveDetail from 'MOD_DIR/leave-apply/public/view/apply-view-detail';
import AddDocumentWriteOrReportSendApplyPanel from 'CMP_DIR/add-send-document-template';
import DocumentDetail from 'MOD_DIR/document_write/public/view/apply-view-detail';
import ReportDetail from 'MOD_DIR/report_send/public/view/apply-view-detail';
import AddBusinessWhileApply from 'MOD_DIR/business-while/public/view/add-business-while';
import BusinessWhileDetail from 'MOD_DIR/business-while/public/view/apply-view-detail';
import AddDomainApply from 'MOD_DIR/domain_application/public/view/add-apply';
import DomainDetail from 'MOD_DIR/domain_application/public/view/apply-view-detail';
import AddVisitApply from 'MOD_DIR/self_setting/public/view/add-apply';
import VisitDetail from 'MOD_DIR/self_setting/public/view/apply-view-detail';
import Spinner from 'CMP_DIR/spinner';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import NoMoreDataTip from 'CMP_DIR/no_more_data_tip';
import Trace from 'LIB_DIR/trace';
import UserApplyActions from '../public/action/apply_approve_list_action';
import ApplyApproveListStore from '../public/store/apply_approve_list_store';
import UserApplyViewDetailWrap from 'MOD_DIR/user_apply/public/views/apply-view-detail-wrap';


import {storageUtil} from 'ant-utils';

const session = storageUtil.session;
import {getAppList} from 'PUB_DIR/sources/utils/common-data-util';
import {SearchInput} from 'antc';
import UserData from '../../../public/sources/user-data';
import ApplyListItem from 'CMP_DIR/apply-components/apply-list-item';
import {isCommonSalesOrPersonnalVersion} from 'MOD_DIR/clue_customer/public/utils/clue-customer-utils';
import HistoricalApplyViewDetailStore from 'MOD_DIR/user_apply/public/store/historical-apply-view-detail-store';
import HistoricalApplyViewDetailAction from 'MOD_DIR/user_apply/public/action/historical-apply-view-detail-actions';
var notificationEmitter = require('PUB_DIR/sources/utils/emitters').notificationEmitter;
var ApplyApproveUtils = require('./utils/apply_approve_utils');
class ApplyApproveList extends React.Component {
    state = {
        activeApplyTab: APPLY_TYPE.APPLY_BY_ME,
        addApplyFormPanel: '',//添加的申请审批的表单类型
        filterOrSearchType: '',//添加筛选或者搜索的类型
        showRefreshTip: false,//展示刷新列表的提示
        type: '',//申请审批的类型
        status: '',//申请审批的状态
        ...ApplyApproveListStore.getState()

    };

    onStoreChange = () => {
        this.setState(ApplyApproveListStore.getState());
    };


    componentDidMount() {
        ApplyApproveListStore.listen(this.onStoreChange);
        //如果存在url传过来的申请applyId
        if (this.state.applyId) {//从邮件中点击链接进来时，只查看该邮件所对应的申请
            UserApplyActions.getApplyById(this.state.applyId);
            //是通过点击未处理的审批数量跳转过来的
        } else {
            this.fetchApplyList();
        }
        //获取我的申请中的未读回复
        this.getMyUnreadReplyList();
        //获取团队申请中的未读回复
        this.getTeamUnreadReplyList();
        this.getAppList();
        this.showUnhandleApplyTip();
        notificationEmitter.on(notificationEmitter.MY_UNREAD_REPLY, this.refreshMyUnreadReplyList);
        notificationEmitter.on(notificationEmitter.TEAM_UNREAD_REPLY, this.refreshTeamUnreadReplyList);
        notificationEmitter.on(notificationEmitter.CLEAR_UNREAD_REPLY, this.clearUnreadReplyList);
        ApplyApproveUtils.emitter.on('updateSelectedItem', this.updateSelectedItem);
    }
    updateSelectedItem = (message) => {
        if(message && message.status === 'success'){
            //通过或者驳回申请后改变申请的状态
            if (message.agree) {
                message.approve_details = [{user_name: userData.getUserData().user_name, status: message.agree,nick_name: userData.getUserData().nick_name,comment_time: moment().valueOf()}];
                message.update_time = moment().valueOf();
                UserApplyActions.changeApplyAgreeStatus(message);
            }else if (message.cancel){
                //撤销的申请成功后改变状态
                UserApplyActions.updateAllApplyItemStatus({id: message.id, status: 'cancel'});
            }
        }
    };

    componentWillUpdate() {
        this.showUnhandleApplyTip();
    }

    componentWillUnmount() {
        notificationEmitter.removeListener(notificationEmitter.MY_UNREAD_REPLY, this.refreshMyUnreadReplyList);
        notificationEmitter.removeListener(notificationEmitter.TEAM_UNREAD_REPLY, this.refreshTeamUnreadReplyList);
        notificationEmitter.removeListener(notificationEmitter.CLEAR_UNREAD_REPLY, this.clearUnreadReplyList);
        ApplyApproveUtils.emitter.removeListener('updateSelectedItem', this.updateSelectedItem);
        ApplyApproveListStore.unlisten(this.onStoreChange);
    }

    getAppList() {
        getAppList(appList => {
            this.setState({appList: appList});
        });
    }

    clearUnreadReplyList = (applyId) => {
        UserApplyActions.clearUnreadReply(applyId);
    };

    //从sessionStorage中获取该用户未读的回复列表
    getMyUnreadReplyList = () => {
        const MY_UNREAD_REPLY = DIFF_APPLY_TYPE_UNREAD_REPLY.MY_UNREAD_REPLY;
        let unreadReplyList = session.get(MY_UNREAD_REPLY);
        if (unreadReplyList) {
            this.refreshMyUnreadReplyList(JSON.parse(unreadReplyList) || []);
        }
    };
    //从sessionStorage中获取该用户未读的回复列表
    getTeamUnreadReplyList = () => {
        const TEAM_UNREAD_REPLY = DIFF_APPLY_TYPE_UNREAD_REPLY.TEAM_UNREAD_REPLY;
        let unreadReplyList = session.get(TEAM_UNREAD_REPLY);
        if (unreadReplyList) {
            this.refreshTeamUnreadReplyList(JSON.parse(unreadReplyList) || []);
        }
    };
    //刷新未读回复的列表
    // refreshUnreadReplyList = (unreadReplyList) => {
    //     UserApplyActions.refreshUnreadReplyList(unreadReplyList);
    // };
    refreshMyUnreadReplyList = (unreadReplyList) => {
        UserApplyActions.refreshMyUnreadReplyList(unreadReplyList);
    };
    refreshTeamUnreadReplyList = (unreadReplyList) => {
        UserApplyActions.refreshTeamUnreadReplyList(unreadReplyList);
    };


    retryFetchApplyList = (e) => {
        if (this.state.applyListObj.errorMsg) {
            Trace.traceEvent(e, '点击了重试');
        } else {
            Trace.traceEvent(e, '点击了重新获取');
        }
        setTimeout(() => this.fetchApplyList());
    };
    //下拉加载
    handleScrollBarBottom = () => {
        this.fetchApplyList();
    };
    //获取申请审批列表
    fetchApplyList = () => {
        var submitObj = {
            id: this.state.lastApplyId,
            page_size: this.state.pageSize,
            keyword: this.state.searchKeyword,
            comment_unread: this.state.isCheckUnreadApplyList,
            sort_field: 'create_time',
            order: 'descend'
        };
        if (this.state.selectedApplyStatus !== ALL) {
            submitObj.status = this.state.selectedApplyStatus;
        }
        if (this.state.selectedApplyType !== ALL) {
            submitObj.type = this.state.selectedApplyType;
        }
        if (this.state.activeApplyTab === APPLY_TYPE.APPLY_BY_ME) {
            UserApplyActions.getApplyListStartSelf(submitObj, (count) => {
                //如果是待审批的请求，获取到申请列表后，更新下待审批的数量
                // if (this.state.selectedApplyStatus === 'false') {
                //     //触发更新待审批数
                //     commonMethodUtil.updateUnapprovedCount('approve','SHOW_UNHANDLE_APPLY_COUNT',count);
                //     // 解决通过或驳回操作失败（后台其实是成功）后的状态更新
                //     if(this.state.dealApplyError === 'error'){
                //         UserApplyActions.updateDealApplyError('success');
                //     }
                // }
            });

        } else if (this.state.activeApplyTab === APPLY_TYPE.APPROVE_BY_ME) {//获取待我审批的及我审批过的申请
            if (!submitObj.id) {
                delete submitObj.id;
            }
            UserApplyActions.getMyApplyLists(submitObj, (count) => {
                //如果是待审批的请求，获取到申请列表后，更新下待审批的数量
                // if (this.state.selectedApplyStatus === 'false') {
                //     //触发更新待审批数
                //     commonMethodUtil.updateUnapprovedCount('approve','SHOW_UNHANDLE_APPLY_COUNT',count);
                //     // 解决通过或驳回操作失败（后台其实是成功）后的状态更新
                //     if(this.state.dealApplyError === 'error'){
                //         UserApplyActions.updateDealApplyError('success');
                //     }
                // }
            });
        } else {
            UserApplyActions.getAllApplyLists(submitObj, (count) => {
                //如果是待审批的请求，获取到申请列表后，更新下待审批的数量
                // if (this.state.selectedApplyStatus === 'false') {
                //     //触发更新待审批数
                //     commonMethodUtil.updateUnapprovedCount('approve','SHOW_UNHANDLE_APPLY_COUNT',count);
                //     // 解决通过或驳回操作失败（后台其实是成功）后的状态更新
                //     if(this.state.dealApplyError === 'error'){
                //         UserApplyActions.updateDealApplyError('success');
                //     }
                // }
            });
        }


    };
    handleChangeApplyActiveTab = (activeTab) => {
        if (activeTab !== this.state.activeApplyTab) {
            this.setState({
                activeApplyTab: activeTab,
                filterOrSearchType: ''
            }, () => {
                this.clearDataBeforeGetApplyList();
            });
        }
    };
    //在获取数据前先把之前的数据置空一下
    clearDataBeforeGetApplyList = () => {
        UserApplyActions.resetState();
        setTimeout(() => {
            this.fetchApplyList();
        });
    };
    //打开添加申请的面板
    openAddApplyForm = (item) => {
        this.setState({
            addApplyFormPanel: item.type
        });
    };
    //点击展示详情
    clickShowDetail = (obj, idx) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.list-unstyled'), '查看申请详情');
        UserApplyActions.setSelectedDetailItem({obj, idx});
    };
    openFilterOrSearch = (value) => {
        this.setState({
            filterOrSearchType: value
        }, () => {
            //如果是选中的有未读回复的
            if (value === UNREPLY) {
                UserApplyActions.setIsCheckUnreadApplyList(true);
                setTimeout(() => {
                    this.fetchApplyList();
                });
            }
        });
    };
    isActiveTabMyApproveList = () => {
        return this.state.activeApplyTab === APPLY_TYPE.APPROVE_BY_ME;
    };
    getAddFilterAndSearchMenu = () => {
        var filterAndSearchList = [{
            name: Intl.get('common.filter', '筛选'),
            value: FILTER,
            iconCls: 'icon-filter1'
        }];
        //如果有未读回复列表的时候，这个未读回复的样式才是激活状态，才可以点击
        //我审批的申请这个tab，没有筛选status、根据关键词筛选和根据未读回复筛选
        var unreplyLiCls = '';
        if (!this.isActiveTabMyApproveList()) {
            filterAndSearchList.push({
                name: Intl.get('common.search', '搜索'),
                iconCls: 'icon-search',
                value: SEARCH
            });
            var unreadReplyList = this.getUnreadReplyList();
            unreplyLiCls = _.get(unreadReplyList, 'length') > 0 ? 'active-unreply' : 'inactive-unreply';
            filterAndSearchList.push({
                name: Intl.get('apply.list.has.unreply', '未读回复'),
                iconCls: 'icon-apply-message-tip',
                value: UNREPLY
            });
        }
        return (
            <Menu className='add-search-or-filter-type-list'>
                {_.map(filterAndSearchList, (item, index) => {
                    //带有未读回复的没有数值的时候，不允许点击
                    var replyType = item.value === UNREPLY;
                    var cannotClick = unreplyLiCls.indexOf('inactive-unreply') > -1 && replyType;//是否可以点击带未读回复的下拉选项
                    return (
                        <Menu.Item key={index} className={replyType ? unreplyLiCls : ''}>
                            <a onClick={cannotClick ? () => {} : this.openFilterOrSearch.bind(this, item.value)}>
                                <i className={'iconfont ' + _.get(item, 'iconCls', '')}></i>
                                {_.get(item, 'name')}</a>
                        </Menu.Item>
                    );
                })}
            </Menu>
        );
    };
    getWorkFlowList = () => {
        let user = userData.getUserData();
        return _.get(user, 'workFlowConfigs', []);
    };
    getAddApplyTypeMenu = () => {
        var workFlowList = this.getWorkFlowList();
        return (
            <Menu className='add-apply-type-list'>
                {_.map(workFlowList, (item, index) => {
                    //用户申请和成员申请暂时不展示
                    if (_.indexOf([APPLY_APPROVE_TYPES.USERAPPLY, APPLY_APPROVE_TYPES.MEMBER_INVITE, APPLY_APPROVE_TYPES.USER_OR_GRANT], item.type) > -1) {
                        return null;
                    }
                    return (
                        <Menu.Item key={index}>
                            <a onClick={this.openAddApplyForm.bind(this, item)}>
                                {_.get(item, 'description')}</a>
                        </Menu.Item>
                    );
                })}
            </Menu>
        );
    };
    getTimeStr = (d, format) => {
        d = parseInt(d);
        if (isNaN(d)) {
            return '';
        }
        return moment(new Date(d)).format(format || oplateConsts.DATE_TIME_WITHOUT_SECOND_FORMAT);
    };
    renderApplyList = () => {
        return (
            <ul className="list-unstyled app_user_manage_apply_list">
                {
                    _.map(this.state.applyListObj.list, (obj, index) => {
                        //不同tab下的获取的未读回复的列表是不一样的
                        var unreadReplyList = this.getUnreadReplyList();
                        //是否有未读回复
                        let hasUnreadReply = _.find(unreadReplyList, unreadReply => unreadReply.id === obj.id);
                        return (
                            <ApplyListItem
                                key={index}
                                obj={obj}
                                index={index}
                                clickShowDetail={this.clickShowDetail}
                                processedStatus='ongoing'
                                selectedDetailItem={this.state.selectedDetailItem}
                                selectedDetailItemIdx={this.state.selectedDetailItemIdx}
                                hasUnreadReply={hasUnreadReply}
                            />
                        );
                    })
                }
            </ul>
        );
    };
    showUnhandleApplyTip = () => {
        const {unreadMyReplyList, unreadTeamReplyList} = this.state;
        var unreadMyReplyCount = _.get(unreadMyReplyList, 'length'),
            unreadTeamReplyCount = _.get(unreadTeamReplyList, 'length'),
            unreadMyApproveCount = getAllUnhandleApplyCount();
        _.each(APPLY_APPROVE_TAB_TYPES, (item) => {
            var val = _.get(item, 'value');
            if (APPLY_TYPE.APPLY_BY_ME === val && unreadMyReplyCount > 0) {
                this.renderUnhandleNum(val, unreadMyReplyCount, false);
            }
            if (APPLY_TYPE.APPLY_BY_TEAM === val && unreadTeamReplyCount > 0) {
                this.renderUnhandleNum(val, unreadTeamReplyCount, false);
            }
            if (APPLY_TYPE.APPROVE_BY_ME === val && unreadMyApproveCount > 0) {
                this.renderUnhandleNum(val, unreadMyApproveCount, true);
            }
        });
    };
    renderUnhandleNum = (val, count, showNum) => {

        var style = `unhandle${val}NumStyle`, cls = `${val}_container`;
        if (this[style]) {
            this[style].destroy();
            this[style] = null;
        }
        var styleText = '';
        //设置数字
        if (count > 0) {
            if (showNum) {
                var len = (count + '').length;
                if (len >= 3) {
                    styleText = `.${cls}:before{content:\'99+\';display:block;padding:0 2px 0 2px;}`;
                } else {
                    styleText = `.${cls}:before{content:'${count}';display:block}`;
                }
            } else {
                styleText = `.${cls}:before{content:\'\';display:block;padding:0 2px 0 2px;}`;
            }
        } else {
            styleText = `.${cls}:before{content:\'\';display:none}`;
        }
        //展示数字
        this[style] = insertStyle(styleText);
    };
    //左侧申请审批不同类型列表
    renderApplyListTab = () => {
        const {activeApplyTab} = this.state;
        return (
            <div className='apply_approve_list_wrap'>
                <div className='apply_approve_list_tab'>
                    <ul>
                        {_.map(APPLY_APPROVE_TAB_TYPES, item => {
                            var val = _.get(item, 'value', '');
                            var cls = classNames(`apply_type_item ${val}_container`, {
                                'active-tab': activeApplyTab === _.get(item, 'value', '')
                            });
                            //如果是普通销售或者是个人版，不需要展示团队这个tab
                            if(item.value === APPLY_TYPE.APPLY_BY_TEAM && isCommonSalesOrPersonnalVersion()){
                                return null;
                            }else{
                                //只有我的审批上加红色数字
                                return <li className={cls}
                                    onClick={this.handleChangeApplyActiveTab.bind(this, val)}>
                                    {_.get(item, 'name', '')}
                                </li>;
                            }

                        })}
                    </ul>
                    <div className='add_apply_type_icon'>
                        <Dropdown overlay={this.getAddApplyTypeMenu()} trigger={['click']}>
                            <i className='iconfont icon-plus'></i>
                        </Dropdown>
                        <Dropdown overlay={this.getAddFilterAndSearchMenu()} trigger={['click']}>
                            <i className='iconfont icon-other'></i>
                        </Dropdown>
                    </div>
                </div>
                {this.renderApplyTitleLists()}
            </div>
        );
    };
    renderApplyListError = () => {
        let noData = this.state.applyListObj.loadingResult === '' && this.state.applyListObj.list.length === 0;
        let tipMsg = '';

        if (this.state.applyListObj.loadingResult === 'error') {
            let retry = (
                <span>
                    {this.state.applyListObj.errorMsg}，<a href="javascript:void(0)"
                        onClick={this.retryFetchApplyList}>{Intl.get('common.retry', '重试')}</a>
                </span>
            );
            return (
                <div className="app_user_manage_apply_list app_user_manage_apply_list_error">
                    <Alert message={retry} type="error" showIcon={true}/>
                </div>);
        } else if (noData) {
            if (this.state.searchKeyword !== '') {
                tipMsg = (
                    <span>
                        {Intl.get('user.apply.no.match.retry', '暂无符合查询条件的用户申请')}<span>,</span>
                        <a href="javascript:void(0)" onClick={this.retryFetchApplyList}>
                            {Intl.get('common.get.again', '重新获取')}
                        </a>
                    </span>
                );
            } else if (this.state.isCheckUnreadApplyList) {
                tipMsg = (
                    <span>
                        {Intl.get('user.apply.no.unread', '已无未读回复的申请')}<span>,</span>
                        <a href="javascript:void(0)" onClick={this.retryFetchApplyList}>
                            {Intl.get('common.get.again', '重新获取')}
                        </a>
                    </span>
                );
            } else {
                tipMsg = (
                    <span>
                        {Intl.get('user.apply.no.apply', '还没有需要审批的用户申请')}<span>,</span>
                        <a href="javascript:void(0)" onClick={this.retryFetchApplyList}>
                            {Intl.get('common.get.again', '重新获取')}
                        </a>
                    </span>
                );
            }
            return <div className="app_user_manage_apply_list app_user_manage_apply_list_error">
                <Alert message={tipMsg} type="info" showIcon={true}/>
            </div>;
        }
    };
    //渲染刷新提示
    renderRefreshTip = () => {
        if (this.state.showRefreshTip) {
            return (
                <div className='refresh-tip-panel'>
                    <span className="iconfont icon-warn-icon"></span>
                    <ReactIntl.FormattedMessage
                        id="apply.list.new.refresh.tip"
                        defaultMessage={'有新申请，{refresh}查看'}
                        values={{
                            'refresh': <a data-tracename="点击刷新页面按钮"
                                onClick={this.clearDataBeforeGetApplyList}>{Intl.get('clue.customer.refresh.page', '刷新页面')}</a>
                        }}
                    />
                </div>
            );
        } else {
            return null;
        }
    };
    changeSearchInputValue = (value) => {
        value = _.trim(value) || '';
        if (_.trim(value) !== _.trim(this.state.searchKeyword)) {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.pull-right'), '根据申请人/客户名/用户名搜索');
            UserApplyActions.changeSearchInputValue(value);
            setTimeout(() => this.fetchApplyList());
        }
    };
    //渲染搜索的界面
    renderSearchPanel = () => {
        return <div className="apply-search-wrap btn-item">
            <SearchInput
                type="input"
                autocomplete="off"
                className="form-control"
                searchPlaceHolder={Intl.get('user.apply.search.placeholder', '申请人/客户名/用户名')}
                searchEvent={this.changeSearchInputValue}
            />
        </div>;
    };
    getApplyListType = () => {
        switch (this.state.selectedApplyStatus) {
            case 'all':
                return Intl.get('user.apply.all', '全部申请');
            case 'false':
                return Intl.get('leave.apply.my.worklist.apply', '待我审批');
            case 'pass':
                return Intl.get('user.apply.pass', '已通过');
            case 'reject':
                return Intl.get('user.apply.reject', '已驳回');
            case 'true':
                return Intl.get('user.apply.applied', '已审批');
            case 'cancel':
                return Intl.get('user.apply.backout', '已撤销');
        }
    };
    handleChangeSelectedApplyStatus = (value) => {
        UserApplyActions.changeApplyStatus(value);
        setTimeout(() => this.fetchApplyList());
    };
    handleChangeSelectedApplyType = (value) => {
        UserApplyActions.changeApplyType(value);
        setTimeout(() => this.fetchApplyList());
    };
    //渲染筛选的界面
    renderFilterPanel = () => {
        var allStatusList = [{
            name: Intl.get('user.online.all.status', '全部状态'),
            value: ALL
        }, {
            name: Intl.get('leave.apply.my.worklist.apply', '待我审批'),
            value: 'ongoing'
        }, {
            name: Intl.get('user.apply.pass', '已通过'),
            value: 'pass'
        }, {
            name: Intl.get('user.apply.reject', '已驳回'),
            value: 'reject'
        }, {
            name: Intl.get('user.apply.backout', '已撤销'),
            value: 'cancel'
        }];
        var allTypeList = [{
            name: Intl.get('oplate_customer_analysis.type.all', '全部类型'),
            value: ALL
        }];
        var workFlowList = this.getWorkFlowList();

        _.each(workFlowList, (workItem) => {
            //有几种特殊的类型，添加的时候的type和详情中的type的值不一样，后期这里会改掉
            var type = _.get(workItem, 'type');
            if (_.indexOf([APPLY_APPROVE_TYPES.USERAPPLY, APPLY_APPROVE_TYPES.MEMBER_INVITE], type) === -1) {
                if (type === APPLY_APPROVE_TYPES.OPINIONREPORT) {
                    type = APPLY_APPROVE_TYPES.OPINION_REPORT;
                }
                if (type === APPLY_APPROVE_TYPES.DOCUMENTWRITING) {
                    type = APPLY_APPROVE_TYPES.DOCUMENT_WRITING;
                }
                if (type === APPLY_APPROVE_TYPES.BUSINESSOPPORTUNITIES) {
                    type = APPLY_APPROVE_TYPES.BUSINESS_OPPORTUNITIES;
                }
                allTypeList.push({
                    name: _.get(workItem, 'description'),
                    value: type
                });
            }

        });

        return (
            <div className="apply-type-filter btn-item" id="apply-type-container">
                {
                    UserData.hasRole(UserData.ROLE_CONSTANS.SECRETARY) || this.isActiveTabMyApproveList() ? null : (
                        <Select
                            className='apply-status-select'
                            value={this.state.selectedApplyStatus}
                            onChange={this.handleChangeSelectedApplyStatus}
                        >
                            {_.map(allStatusList, item => {
                                return <Option value={_.get(item, 'value')}>{_.get(item, 'name')}</Option>;
                            })}
                        </Select>
                    )
                }
                <Select
                    className='apply-type-select'
                    value={this.state.selectedApplyType}
                    onChange={this.handleChangeSelectedApplyType}
                >
                    {_.map(allTypeList, item => {
                        return <Option value={_.get(item, 'value')}>{_.get(item, 'name')}</Option>;
                    })}
                </Select>
            </div>
        );
    };
    renderFilterSearch = () => {
        var filterOrSearchType = this.state.filterOrSearchType;
        if (!filterOrSearchType) {
            return null;
        }
        if (filterOrSearchType !== UNREPLY) {
            return (
                <div className='filter-and-search-container'>
                    {filterOrSearchType === SEARCH ? this.renderSearchPanel() : this.renderFilterPanel()}
                    <i className='iconfont icon-close-tips' onClick={this.closeSearchOrFilterPanel}></i>
                </div>
            );
        } else {
            return <div className='filter-and-search-container return-back' onClick={this.closeSearchOrFilterPanel}>
                <i className='iconfont icon-left-arrow'></i>
                {Intl.get('apply.list.return.back', '返回')}
            </div>;
        }

    };
    closeSearchOrFilterPanel = () => {
        this.setState({
            filterOrSearchType: ''
        }, () => {
            this.clearDataBeforeGetApplyList();
        });
    };
    //左侧申请审批标题列表
    renderApplyTitleLists = () => {
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
            applyListHeight = getApplyListDivHeight();
            //如果展示筛选或者搜索，或者刷新的提示，滚动条区域的高度要再减少提示区域的高度
            if (this.state.showRefreshTip || this.state.filterOrSearchType) {
                applyListHeight -= APPLY_LIST_LAYOUT_CONSTANTS.BOTTOM_DELTA;
            }
        }
        return <div className='app_user_manage_apply_list_wrap'>
            {this.renderFilterSearch()}
            {this.renderRefreshTip()}
            {this.renderApplyListError()}
            {
                this.state.applyListObj.loadingResult === 'loading' && !this.state.lastApplyId ? (
                    <Spinner/>) : (<div className='app_user_apply_list_style'>
                    <div style={{height: applyListHeight}}>
                        <GeminiScrollbar
                            handleScrollBottom={this.handleScrollBarBottom}
                            listenScrollBottom={this.state.listenScrollBottom}
                            itemCssSelector='.app_user_manage_apply_list>li'
                        >
                            {this.renderApplyList()}
                            <NoMoreDataTip
                                fontSize="12"
                                show={this.showNoMoreDataTip}
                            />
                        </GeminiScrollbar>
                    </div>
                    {this.state.applyId ? null : (
                        <div className='summary_info'>
                            {Intl.get('user.apply.total.apply', '共{number}条申请{apply_type}', {
                                'number': this.state.totalSize,
                                'apply_type': ''
                            })}
                        </div>)
                    }
                </div>
                )
            }
        </div>;
    };
    handleOpenApplyDetail = (applyItem) => {
        this.setState({
            showHistoricalItem: applyItem
        });
    };
    hideHistoricalApplyItem = () => {
        this.setState({
            showHistoricalItem: {}
        });
    };
    //todo 申请审批查看详情
    renderHistoricalContent = () => {
        // return <ApplyViewDetailWrap
        //     isHomeMyWork={true}
        //     detailItem={this.state.showHistoricalItem}
        //     selectedApplyStatus='false'//待审批状态
        //     afterApprovedFunc={this.afterFinishApplyWork}
        //     ApplyViewDetailStore={HistoricalApplyViewDetailStore}
        //     ApplyViewDetailAction={HistoricalApplyViewDetailAction}
        //     appList={this.state.appList}
        // />;
    };
    afterTransferApplySuccess = (id) => {
        UserApplyActions.afterTransferApplySuccess(id);
    };
    getUnreadReplyList = () => {
        const {activeApplyTab, unreadMyReplyList, unreadTeamReplyList} = this.state;
        return activeApplyTab === APPLY_TYPE.APPLY_BY_ME ? unreadMyReplyList : unreadTeamReplyList;
    };
    //当前展示的详情是否是有未读回复的详情
    getIsUnreadDetail = () => {
        const {selectedDetailItem} = this.state;
        let selectApplyId = _.get(selectedDetailItem, 'id');
        var unreadReplyList = this.getUnreadReplyList();
        if (selectApplyId) {
            return _.some(unreadReplyList, unreadReply => unreadReply.id === selectApplyId);
        } else {
            return false;
        }
    };
    //申请审批的详情，不同类型的申请申请，展示不同的详情
    renderApplyListDetail = () => {
        //申请详情数据
        var applyDetail = {detail: this.getFirstApplyItem(), apps: this.state.allApps};
        var selectedDetailItem = this.state.selectedDetailItem;
        var applyDetailContent = null;
        //todo 不同的审批类型展示不同的右侧详情
        switch (_.get(selectedDetailItem, 'workflow_type')) {
            case APPLY_APPROVE_TYPES.USER_OR_GRANT://新的用户申请
                applyDetailContent = <UserApplyViewDetailWrap
                    applyData={this.state.applyId ? applyDetail : null}
                    detailItem={this.state.selectedDetailItem}
                    isUnreadDetail={this.getIsUnreadDetail()}
                    showNoData={!this.state.lastApplyId && this.state.applyListObj.loadingResult === 'error'}
                    selectedApplyStatus={this.state.selectedApplyStatus}
                    handleOpenApplyDetail={this.handleOpenApplyDetail}
                    appList={this.state.appList}
                    height={$(window).height()}
                    afterTransferApplySuccess={this.afterTransferApplySuccess}
                />;
                break;
            case APPLY_APPROVE_TYPES.BUSINESS_OPPORTUNITIES://销售机会
                applyDetailContent = <BusinessOpportunity
                    applyData={this.state.applyId ? applyDetail : null}
                    detailItem={this.state.selectedDetailItem}
                    showNoData={!this.state.lastApplyId && this.state.applyListObj.loadingResult === 'error'}
                    selectedApplyStatus={this.state.selectedApplyStatus}
                    isUnreadDetail={this.getIsUnreadDetail()}
                    appList={this.state.appList}
                    height={$(window).height()}
                    afterTransferApplySuccess={this.afterTransferApplySuccess}
                />;
                break;
            case APPLY_APPROVE_TYPES.CUSTOMER_VISIT://出差申请
                applyDetailContent = <BusinessDetail
                    applyData={this.state.applyId ? applyDetail : null}
                    detailItem={this.state.selectedDetailItem}
                    showNoData={!this.state.lastApplyId && this.state.applyListObj.loadingResult === 'error'}
                    selectedApplyStatus={this.state.selectedApplyStatus}
                    isUnreadDetail={this.getIsUnreadDetail()}
                    height={$(window).height()}
                    afterTransferApplySuccess={this.afterTransferApplySuccess}
                />;
                break;
            case APPLY_APPROVE_TYPES.BUSINESSTRIPAWHILE://外出申请
                applyDetailContent = <BusinessWhileDetail
                    applyData={this.state.applyId ? applyDetail : null}
                    detailItem={this.state.selectedDetailItem}
                    showNoData={!this.state.lastApplyId && this.state.applyListObj.loadingResult === 'error'}
                    selectedApplyStatus={this.state.selectedApplyStatus}
                    isUnreadDetail={this.getIsUnreadDetail()}
                    height={$(window).height()}
                    afterTransferApplySuccess={this.afterTransferApplySuccess}
                />;
                break;
            case APPLY_APPROVE_TYPES.PERSONAL_LEAVE://请假申请
                applyDetailContent = <LeaveDetail
                    applyData={this.state.applyId ? applyDetail : null}
                    detailItem={this.state.selectedDetailItem}
                    showNoData={!this.state.lastApplyId && this.state.applyListObj.loadingResult === 'error'}
                    selectedApplyStatus={this.state.selectedApplyStatus}
                    isUnreadDetail={this.getIsUnreadDetail()}
                    height={$(window).height()}
                    afterTransferApplySuccess={this.afterTransferApplySuccess}
                />;
                break;
            case APPLY_APPROVE_TYPES.OPINION_REPORT://舆情报告
                applyDetailContent = <ReportDetail
                    applyData={this.state.applyId ? applyDetail : null}
                    detailItem={this.state.selectedDetailItem}
                    showNoData={!this.state.lastApplyId && this.state.applyListObj.loadingResult === 'error'}
                    selectedApplyStatus={this.state.selectedApplyStatus}
                    isUnreadDetail={this.getIsUnreadDetail()}
                    height={$(window).height()}
                    afterTransferApplySuccess={this.afterTransferApplySuccess}
                />;
                break;
            case APPLY_APPROVE_TYPES.DOCUMENT_WRITING://文件撰写
                applyDetailContent = <DocumentDetail
                    applyData={this.state.applyId ? applyDetail : null}
                    detailItem={this.state.selectedDetailItem}
                    showNoData={!this.state.lastApplyId && this.state.applyListObj.loadingResult === 'error'}
                    selectedApplyStatus={this.state.selectedApplyStatus}
                    isUnreadDetail={this.getIsUnreadDetail()}
                    height={$(window).height()}
                    afterTransferApplySuccess={this.afterTransferApplySuccess}
                />;
                break;
            //联合跟进申请和拜访申请
            case APPLY_APPROVE_TYPES.VISITAPPLY:
                applyDetailContent = <VisitDetail
                    applyData={this.state.applyId ? applyDetail : null}
                    detailItem={this.state.selectedDetailItem}
                    showNoData={!this.state.lastApplyId && this.state.applyListObj.loadingResult === 'error'}
                    selectedApplyStatus={this.state.selectedApplyStatus}
                    isUnreadDetail={this.getIsUnreadDetail()}
                    height={$(window).height()}
                    afterTransferApplySuccess={this.afterTransferApplySuccess}
                />;
                break;
            case APPLY_APPROVE_TYPES.DOMAINAPPLY://舆情平台申请
                applyDetailContent = <DomainDetail
                    applyData={this.state.applyId ? applyDetail : null}
                    detailItem={this.state.selectedDetailItem}
                    showNoData={!this.state.lastApplyId && this.state.applyListObj.loadingResult === 'error'}
                    selectedApplyStatus={this.state.selectedApplyStatus}
                    isUnreadDetail={this.getIsUnreadDetail()}
                    height={$(window).height()}
                    afterTransferApplySuccess={this.afterTransferApplySuccess}
                />;
                break;
        }
        //如果是旧版的用户审批
        if (_.get(selectedDetailItem, 'message_type') === APPLY_APPROVE_TYPES.USERAPPLY) {
            applyDetailContent = <UserApplyViewDetailWrap
                applyData={this.state.applyId ? applyDetail : null}
                detailItem={this.state.selectedDetailItem}
                isUnreadDetail={this.getIsUnreadDetail()}
                showNoData={!this.state.lastApplyId && this.state.applyListObj.loadingResult === 'error'}
                selectedApplyStatus={this.state.selectedApplyStatus}
                handleOpenApplyDetail={this.handleOpenApplyDetail}
                appList={this.state.appList}
                height={$(window).height()}
                afterTransferApplySuccess={this.afterTransferApplySuccess}
            />;
        }
        return applyDetailContent;
    };
    renderAddApplyForm = () => {
        var addApplyFormPanel = this.state.addApplyFormPanel;
        switch (addApplyFormPanel) {
            case APPLY_APPROVE_TYPES.BUSINESSOPPORTUNITIES://销售机会申请
                return <AddSalesOpportunityApply hideSalesOpportunityApplyAddForm={this.closeAddApplyForm}/>;
            case APPLY_APPROVE_TYPES.BUSSINESSTRIP://出差申请
                return <AddBusinessApply hideBusinessApplyAddForm={this.closeAddApplyForm}/>;
            case APPLY_APPROVE_TYPES.BUSINESSTRIPAWHILE://外出申请
                return <AddBusinessWhileApply
                    hideBusinessApplyAddForm={this.closeAddApplyForm}
                />;
            case APPLY_APPROVE_TYPES.LEAVE://请假申请
                return <AddLeaveApply hideLeaveApplyAddForm={this.closeAddApplyForm}/>;
            case APPLY_APPROVE_TYPES.OPINIONREPORT://舆情报告
                return <AddDocumentWriteOrReportSendApplyPanel
                    titleType={Intl.get('apply.approve.report.send', '舆情报告申请')}
                    applyType={REPORT_TYPE}
                    applyAjaxType={APPLY_APPROVE_TYPES.REPORT}
                    hideApplyAddForm={this.closeAddApplyForm}
                    addType='report_type'
                    selectTip={Intl.get('leave.apply.select.at.least.one.type', '请选择至少一个舆情报告类型')}
                    selectPlaceholder={Intl.get('apply.approve.report.select.type', '请选择舆情报告类型')}
                    applyLabel={Intl.get('common.type', '类型')}
                    remarkPlaceholder={Intl.get('apply.approve.report.remark', '请填写{type}备注', {type: Intl.get('apply.approve.lyrical.report', '舆情报告')})}
                />;
            case APPLY_APPROVE_TYPES.DOCUMENTWRITING://文件撰写申请
                return <AddDocumentWriteOrReportSendApplyPanel
                    titleType={Intl.get('apply.approve.document.write', '文件撰写申请')}
                    hideApplyAddForm={this.closeAddApplyForm}
                    applyType={DOCUMENT_TYPE}
                    applyAjaxType={APPLY_APPROVE_TYPES.DOCUMENT}
                    addType='document_type'
                    selectTip={Intl.get('apply.approve.write.select.at.least.one.type', '请选择至少一个文件类型')}
                    selectPlaceholder={Intl.get('apply.approve.document.select.type', '请选择文件报告类型')}
                    applyLabel={Intl.get('apply.approve.document.write.type', '文件类型')}
                    remarkPlaceholder={Intl.get('apply.approve.report.remark', '请填写{type}备注', {type: Intl.get('apply.approve.document.writing', '文件撰写')})}
                />;
            //联合跟进申请和拜访申请
            case APPLY_APPROVE_TYPES.VISITAPPLY:
                return (
                    <AddVisitApply
                        hideLeaveApplyAddForm={this.closeAddApplyForm}
                    />
                );
            case APPLY_APPROVE_TYPES.DOMAINAPPLY://舆情平台申请
                return <AddDomainApply
                    hideLeaveApplyAddForm={this.closeAddApplyForm}
                />;

        }
    };
    closeAddApplyForm = (result) => {
        this.setState({
            addApplyFormPanel: ''
        }, () => {
            //看一下当前选中的tab是不是我申请的或者我团队的列表
            if (_.indexOf([APPLY_TYPE.APPLY_BY_TEAM, APPLY_TYPE.APPLY_BY_ME], this.state.activeApplyTab) > -1 && _.get(result,'id')) {
                //立刻获取有时候会获取不到
                setTimeout(() => {
                    UserApplyActions.afterAddApplySuccess(result);
                }, 1000);

            }
        });
    };
    getFirstApplyItem = () => {
        return _.get(this.state.applyListObj, 'list[0]');
    };


    render() {
        //展示右侧申请审批的详情
        var noShowApplyDetail = !this.getFirstApplyItem();
        let detailWrapWidth = $('.user_apply_page').width() - APPLY_LIST_LAYOUT_CONSTANTS.APPLY_LIST_WIDTH;
        let divHeight = $(window).height();
        // //不是首页我的工作中打开的申请详情（申请列表中），高度需要-头部导航的高度
        // if (!this.props.isHomeMyWork) {
        //     divHeight -= TOP_NAV_HEIGHT;
        // }
        return (
            <div className='apply_approve_content_wrap user_apply_page'>
                {this.renderApplyListTab()}
                {noShowApplyDetail ? null :
                    <div className='apply_approve_detail_wrap' style={{'width': detailWrapWidth, 'height': divHeight}}>
                        {this.renderApplyListDetail()}
                    </div>}
                {this.renderAddApplyForm()}
            </div>
        );
    }
}

ApplyApproveList.defaultProps = {};
ApplyApproveList.propTypes = {};
module.exports = ApplyApproveList;