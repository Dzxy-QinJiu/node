/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/10.
 */
import Trace from 'LIB_DIR/trace';
var BusinessApplyStore = require('./store/business-apply-store');
var BusinessApplyAction = require('./action/business-apply-action');
var BusinessDetailApplyAction = require('./action/apply-view-detail-action');
require('./css/index.less');
import {Alert} from 'antd';
import AddBusinessWhileApplyPanel from './view/add-business-while';
import commonMethodUtil from 'PUB_DIR/sources/utils/common-method-util';
var Spinner = require('CMP_DIR/spinner');
var GeminiScrollbar = require('CMP_DIR/react-gemini-scrollbar');
var NoMoreDataTip = require('CMP_DIR/no_more_data_tip');
var classNames = require('classnames');
var LeaveApplyUtils = require('./utils/leave-apply-utils');
import ApplyViewDetail from './view/apply-view-detail';
import ApplyListItem from 'CMP_DIR/apply-components/apply-list-item';
import ApplyDropdownAndAddBtn from 'CMP_DIR/apply-components/apply-dropdown-and-add-btn';
import {
    selectMenuList,
    APPLY_LIST_LAYOUT_CONSTANTS,
    APPLY_APPROVE_TYPES,
    APPLY_TYPE_STATUS_CONST,
} from 'PUB_DIR/sources/utils/consts';
let userData = require('../../../public/sources/user-data');
var notificationEmitter = require('PUB_DIR/sources/utils/emitters').notificationEmitter;
var NoData = require('CMP_DIR/analysis-nodata');
import {storageUtil} from 'ant-utils';
const session = storageUtil.session;
import {DIFF_APPLY_TYPE_UNREAD_REPLY} from 'PUB_DIR/sources/utils/consts';
import applyPrivilgeConst from 'MOD_DIR/apply_approve_manage/public/privilege-const';
class BusinessApplyManagement extends React.Component {
    state = {
        showAddApplyPanel: false,//是否展示添加出差申请面板
        teamTreeList: [],
        ...BusinessApplyStore.getState()
    };

    onStoreChange = () => {
        this.setState(BusinessApplyStore.getState());
    };

    componentDidMount() {
        BusinessApplyStore.listen(this.onStoreChange);
        if(_.get(this.props,'location.state.clickUnhandleNum')){
            this.menuClick({key: 'ongoing'});
        }else if(Oplate && Oplate.unread && !Oplate.unread[APPLY_APPROVE_TYPES.UNHANDLE_BUSINESSTRIP_AWHILE_APPLY]){
            this.menuClick({key: 'all'});
        }else{
            //不区分角色，都获取全部的申请列表
            this.getAllBusinessApplyList();
        }
        LeaveApplyUtils.emitter.on('updateSelectedItem', this.updateSelectedItem);
        notificationEmitter.on(notificationEmitter.APPLY_UPDATED_BUSINESS_WHILE, this.pushDataListener);
        this.getUnreadReplyList();
        notificationEmitter.on(notificationEmitter.DIFF_APPLY_UNREAD_REPLY, this.refreshUnreadReplyList);
    }
    refreshPage = (e) => {
        if (!this.state.showUpdateTip) return;
        Trace.traceEvent(e, '点击了刷新');
        BusinessApplyAction.setLastApplyId('');
        setTimeout(() => this.getAllBusinessApplyList());
        BusinessApplyAction.setShowUpdateTip(false);
    };
    //监听推送数据
    pushDataListener = (data) => {
        //有数据，将是否展示更新tip
        if (data){
            BusinessApplyAction.setShowUpdateTip(true);
        }
    };

    updateSelectedItem = (message) => {
        if(message && message.status === 'success'){
            //通过或者驳回申请后改变申请的状态
            if (message.agree){
                message.approve_details = [{user_name: userData.getUserData().user_name, status: message.agree,nick_name: userData.getUserData().nick_name,comment_time: moment().valueOf()}];
                message.update_time = moment().valueOf();
                BusinessApplyAction.changeApplyAgreeStatus(message);
            }else if (message.cancel){
                //撤销的申请成功后改变状态
                BusinessApplyAction.updateAllApplyItemStatus({id: message.id, status: 'cancel'});
                BusinessDetailApplyAction.hideCancelBtns();
            }
        }
    };

    getQueryParams() {
        var params = {
            sort_field: this.state.sortField,//排序字段
            order: this.state.order,
            page_size: this.state.page_size,
            id: this.state.lastApplyId, //用于下拉加载的id
            type: APPLY_APPROVE_TYPES.BUSINESSTRIPAWHILE,
            comment_unread: this.state.isCheckUnreadApplyList,
        };
        //如果是选择的全部类型，不需要传status这个参数
        if (this.state.selectedApplyStatus !== 'all') {
            params.status = this.state.selectedApplyStatus;
        }
        //去除查询条件中值为空的项
        commonMethodUtil.removeEmptyItem(params);
        return params;
    }

    //获取全部请假申请
    getAllBusinessApplyList = () => {
        var queryObj = this.getQueryParams();
        BusinessApplyAction.getAllApplyList(queryObj,(count) => {
            //如果是待审批的请求，获取到申请列表后，更新下待审批的数量
            if (this.state.selectedApplyStatus === 'ongoing') {
                //触发更新待审批数
                commonMethodUtil.updateUnapprovedCount(APPLY_APPROVE_TYPES.UNHANDLE_BUSINESSTRIP_AWHILE_APPLY,'SHOW_UNHANDLE_APPLY_APPROVE_COUNT',count);
            }
        });
    };

    componentWillUnmount() {
        BusinessApplyStore.unlisten(this.onStoreChange);
        BusinessApplyAction.setInitState();
        LeaveApplyUtils.emitter.removeListener('updateSelectedItem', this.updateSelectedItem);
        notificationEmitter.removeListener(notificationEmitter.APPLY_UPDATED_BUSINESS_WHILE, this.pushDataListener);
        notificationEmitter.removeListener(notificationEmitter.DIFF_APPLY_UNREAD_REPLY, this.refreshUnreadReplyList);
    }

    showAddApplyPanel = () => {
        this.setState({
            showAddApplyPanel: true
        });
    };
    hideBusinessApplyAddForm = () => {
        this.setState({
            showAddApplyPanel: false
        });
    };
    //下拉加载
    handleScrollBarBottom = () => {
        this.getAllBusinessApplyList();
    };
    //是否显示没有更多数据了
    showNoMoreDataTip = () => {
        return !this.state.applyListObj.loadingResult &&
            this.state.applyListObj.list.length >= 10 && !this.state.listenScrollBottom;
    };
    //点击展示详情
    clickShowDetail = (obj, idx) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.list-unstyled'), '查看申请详情');
        BusinessApplyAction.setSelectedDetailItem({obj, idx});
    };


    getApplyListType = () => {
        return commonMethodUtil.getApplyListTypeDes(this.state.selectedApplyStatus);
    };
    menuClick = (obj) => {
        let selectType = '';
        var targetObj = _.find(selectMenuList, menu => menu.key === obj.key);
        if (targetObj){
            selectType = targetObj.value;
        }
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.pull-left'), '根据' + selectType + '过滤');
        BusinessApplyAction.changeApplyListType(obj.key);
        setTimeout(() => this.getAllBusinessApplyList());
    };
    retryFetchApplyList = (e) => {
        if (this.state.applyListObj.errorMsg) {
            Trace.traceEvent(e, '点击了重试');
        } else {
            Trace.traceEvent(e, '点击了重新获取');
        }
        setTimeout(() => this.getAllBusinessApplyList());
    };
    renderApplyListError = () => {
        var noData = this.state.applyListObj.loadingResult === '' && this.state.applyListObj.list.length === 0 && this.state.selectedApplyStatus !== '';
        if (this.state.applyListObj.loadingResult === 'error' || noData) {
            var retry = (
                <span>
                    {this.state.applyListObj.errorMsg}，<a href="javascript:void(0)"
                        onClick={this.retryFetchApplyList}>
                        {Intl.get('common.retry', '重试')}
                    </a>
                </span>
            );
            var noDataMsg = (
                <span>
                    {Intl.get('self.setting.has.no.apply', '暂无符合条件的申请')}
                    <span>,</span>
                    <a href="javascript:void(0)" onClick={this.retryFetchApplyList}>
                        {Intl.get('common.get.again', '重新获取')}
                    </a>
                </span>
            );
            var noDataBlock, errorBlock;
            if (noData) {
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
                    {(noData) ? noDataBlock : errorBlock}
                </div>);
        }
        return null;
    };
    //(取消)展示有未读回复的申请列表
    toggleUnreadApplyList = (showUnreadTip) => {
        //没有未读回复，并且没有在查看未读回复列表下时，点击按钮不做处理
        if (!showUnreadTip && !this.state.isCheckUnreadApplyList) return;
        BusinessApplyAction.setIsCheckUnreadApplyList(!this.state.isCheckUnreadApplyList);
        BusinessApplyAction.setLastApplyId('');
        setTimeout(() => {
            if (this.state.isCheckUnreadApplyList) {
                Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.apply_manage_wrap'), '查看有未读回复的申请');
            } else {
                Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.apply_manage_wrap'), '取消有未读回复申请的查看');
            }
            this.getAllBusinessApplyList();
        });
    };
    getUnreadTip = () => {
        let unreadReplyList = this.state.unreadReplyList;
        let selectedApplyStatus = this.state.selectedApplyStatus;
        //是否展示有未读申请的提示，后端推送过来的未读回复列表中有数据，并且是在全部类型下可展示，其他待审批、已通过等类型下不展示
        return _.isArray(unreadReplyList) && unreadReplyList.length > 0 && selectedApplyStatus === 'all' && !this.state.searchKeyword;
    };
    //从sessionStorage中获取该用户未读的回复列表
    getUnreadReplyList = () => {
        const DIFF_APPLY_UNREAD_REPLY = DIFF_APPLY_TYPE_UNREAD_REPLY.DIFF_APPLY_UNREAD_REPLY;
        let unreadReplyList = session.get(DIFF_APPLY_UNREAD_REPLY);
        if (unreadReplyList) {
            this.refreshUnreadReplyList(JSON.parse(unreadReplyList) || []);
        }
    };

    //刷新未读回复的列表
    refreshUnreadReplyList = (unreadReplyList) => {
        var unreadList = _.filter(unreadReplyList, item => item.type === APPLY_APPROVE_TYPES.CUSTOMER_VISIT);
        BusinessApplyAction.refreshUnreadReplyList(unreadList);
    };
    //当前展示的详情是否是有未读回复的详情
    getIsUnreadDetail = () => {
        let selectApplyId = this.state.selectedDetailItem ? this.state.selectedDetailItem.id : '';
        if (selectApplyId) {
            return _.some(this.state.unreadReplyList, unreadReply => unreadReply.apply_id === selectApplyId);
        } else {
            return false;
        }
    };
    render() {
        //根本就没有用户审批的时候，显示没数据的提示
        if (this.state.applyListObj.loadingResult === '' && this.state.applyListObj.list.length === 0 && this.state.selectedApplyStatus === 'all' && this.state.searchKeyword === '') {
            let noDataTip = this.state.isCheckUnreadApplyList ? (<ReactIntl.FormattedMessage
                id="user.apply.unread.reply.null"
                defaultMessage={'已无未读回复的申请，{return}'}
                values={{'return': <a onClick={this.toggleUnreadApplyList}>{Intl.get('crm.52', '返回')}</a>}}
            />) : Intl.get('user.apply.no.apply', '还没有用户审批诶...');
            return (
                <div className="apply_manage_wrap">
                    <NoData msg={noDataTip}/>
                </div>
            );
        }
        var addPanelWrap = classNames({'show-add-modal': this.state.showAddApplyPanel});
        var applyListHeight = $(window).height() - APPLY_LIST_LAYOUT_CONSTANTS.BOTTOM_DELTA - APPLY_LIST_LAYOUT_CONSTANTS.TOP_DELTA;
        var selectedApplyStatus = this.state.selectedApplyStatus;
        var applyType = commonMethodUtil.getApplyStatusDscr(selectedApplyStatus);
        var noShowApplyDetail = this.state.applyListObj.list.length === 0;
        return (
            <div className="bussiness-apply-container apply_manage_wrap">
                <div className="leave-apply-list-detail-wrap">
                    <div className="col-md-4 leave-apply-list" data-tracename="出差申请列表">
                        <ApplyDropdownAndAddBtn
                            menuClick={this.menuClick}
                            getApplyListType= {this.getApplyListType}
                            addPrivilege={applyPrivilgeConst.BUSINESS_TRIP_APPLY_APPROVE}
                            showAddApplyPanel={this.showAddApplyPanel}
                            addApplyMessage={Intl.get('add.leave.apply', '添加申请')}
                            menuList={selectMenuList}
                            refreshPage={this.refreshPage}
                            showUpdateTip={this.state.showUpdateTip}
                            showRefreshIcon = {selectedApplyStatus === APPLY_TYPE_STATUS_CONST.ALL || selectedApplyStatus === APPLY_TYPE_STATUS_CONST.ONGOING}
                            showApplyMessageIcon = {selectedApplyStatus === APPLY_TYPE_STATUS_CONST.ALL}
                            isCheckUnreadApplyList = {this.state.isCheckUnreadApplyList}
                            toggleUnreadApplyList= {this.toggleUnreadApplyList}
                            showUnreadTip= {this.getUnreadTip()}
                        />
                        {this.renderApplyListError()}
                        {
                            this.state.applyListObj.loadingResult === 'loading' && !this.state.lastApplyId ? (
                                <Spinner/>) : (<div className="leave_apply_list_style">
                                <div style={{height: applyListHeight}}>
                                    <GeminiScrollbar
                                        handleScrollBottom={this.handleScrollBarBottom}
                                        listenScrollBottom={this.state.listenScrollBottom}
                                        itemCssSelector=".leave_manage_apply_list>li"
                                    >
                                        <ul className="list-unstyled leave_manage_apply_list">
                                            {
                                                _.map(this.state.applyListObj.list,(obj, index) => {
                                                    let unreadReplyList = this.state.unreadReplyList;
                                                    //是否有未读回复
                                                    let hasUnreadReply = _.find(unreadReplyList, unreadReply => unreadReply.apply_id === obj.id);
                                                    return (
                                                        <ApplyListItem
                                                            key={index}
                                                            obj={obj}
                                                            index= {index}
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
                                        <NoMoreDataTip
                                            fontSize="12"
                                            show={this.showNoMoreDataTip}
                                        />
                                    </GeminiScrollbar>
                                </div>
                                <div className="summary_info">
                                    {Intl.get('user.apply.total.apply', '共{number}条申请{apply_type}', {
                                        'number': this.state.totalSize,
                                        'apply_type': applyType
                                    })}
                                </div>

                            </div>
                            )
                        }
                    </div>
                    {noShowApplyDetail ? null : (
                        <ApplyViewDetail
                            detailItem={this.state.selectedDetailItem}
                            showNoData={!this.state.lastApplyId && this.state.applyListObj.loadingResult === 'error'}
                            selectedApplyStatus={this.state.selectedApplyStatus}
                            isUnreadDetail={this.getIsUnreadDetail()}
                        />
                    )}
                </div>
                {this.state.showAddApplyPanel ?
                    <div className={addPanelWrap}>
                        <AddBusinessWhileApplyPanel
                            hideBusinessApplyAddForm={this.hideBusinessApplyAddForm}
                        />
                    </div>
                    : null}

            </div>
        );
    }
}
BusinessApplyManagement.defaultProps = {
    location: {},
};
BusinessApplyManagement.propTypes = {
    location: PropTypes.object
};
module.exports = BusinessApplyManagement;