/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/27.
 */
var LeaveApplyAction = require('./action/leave-apply-action');
var LeaveApplyStore = require('./store/leave-apply-store');
var LeaveApplyDetailAction = require('./action/leave-apply-detail-action');
import ApplyDropdownAndAddBtn from 'CMP_DIR/apply-components/apply-dropdown-and-add-btn';
import AddLeaveApplyPanel from './view/add-apply';
import {selectMenuList, APPLY_LIST_LAYOUT_CONSTANTS,APPLY_APPROVE_TYPES,APPLY_TYPE_STATUS_CONST} from 'PUB_DIR/sources/utils/consts';
import Trace from 'LIB_DIR/trace';
var classNames = require('classnames');
var NoMoreDataTip = require('CMP_DIR/no_more_data_tip');
require('./css/index.less');
import {Alert} from 'antd';
import commonMethodUtil from 'PUB_DIR/sources/utils/common-method-util';
import ApplyListItem from 'CMP_DIR/apply-components/apply-list-item';
var Spinner = require('CMP_DIR/spinner');
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import ApplyViewDetail from './view/apply-view-detail';
var LeaveApplyUtils = require('./utils/leave-apply-utils');
let userData = require('../../../public/sources/user-data');
var notificationEmitter = require('PUB_DIR/sources/utils/emitters').notificationEmitter;
var NoData = require('CMP_DIR/analysis-nodata');
import {storageUtil} from 'ant-utils';
const session = storageUtil.session;
import {DIFF_APPLY_TYPE_UNREAD_REPLY} from 'PUB_DIR/sources/utils/consts';
import {SELF_SETTING_FLOW} from 'MOD_DIR/apply_approve_manage/public/utils/apply-approve-utils';
import applyPrivilgeConst from 'MOD_DIR/apply_approve_manage/public/privilege-const';
class LeaveApplyManagement extends React.Component {
    state = {
        showAddApplyPanel: false,//是否展示添加申请面板
        teamTreeList: [],
        ...LeaveApplyStore.getState()
    };

    onStoreChange = () => {
        this.setState(LeaveApplyStore.getState());
    };

    componentDidMount() {
        LeaveApplyStore.listen(this.onStoreChange);
        if(_.get(this.props,'location.state.clickUnhandleNum')){
            this.menuClick({key: 'ongoing'});
        }else if(Oplate && Oplate.unread && !Oplate.unread[APPLY_APPROVE_TYPES.UNHANDLEMEVISISTAPPLY]){
            this.menuClick({key: 'all'});
        }else{
            //不区分角色，都获取全部的申请列表
            this.getAllLeaveApplyList();
        }
        LeaveApplyUtils.emitter.on('updateSelectedItem', this.updateSelectedItem);
        notificationEmitter.on(notificationEmitter.APPLY_UPDATED_VISIT, this.pushDataListener);
        this.getUnreadReplyList();
        notificationEmitter.on(notificationEmitter.DIFF_APPLY_UNREAD_REPLY, this.refreshUnreadReplyList);
    }

    updateSelectedItem = (message) => {
        if(message && message.status === 'success'){
            //通过或者驳回申请后改变申请的状态
            if (message.agree){
                message.approve_details = [{user_name: userData.getUserData().user_name, status: message.agree,nick_name: userData.getUserData().nick_name,comment_time: moment().valueOf()}];
                message.update_time = moment().valueOf();
                LeaveApplyAction.changeApplyAgreeStatus(message);
            }else if (message.cancel){
                //撤销的申请成功后改变状态
                LeaveApplyAction.updateAllApplyItemStatus({id: message.id, status: 'cancel'});
                LeaveApplyDetailAction.hideCancelBtns();
            }
        }
    };

    getQueryParams() {
        var params = {
            sort_field: this.state.sort_field,//排序字段
            order: this.state.order,
            page_size: this.state.page_size,
            id: this.state.lastApplyId, //用于下拉加载的id
            type: SELF_SETTING_FLOW.VISITAPPLY,
            comment_unread: this.state.isCheckUnreadApplyList,
        };
        //如果是选择的全部类型，不需要传status这个参数
        if (this.state.applyListType !== 'all') {
            params.status = this.state.applyListType;
        }
        //去除查询条件中值为空的项
        commonMethodUtil.removeEmptyItem(params);
        return params;
    }
    refreshPage = (e) => {
        if (!this.state.showUpdateTip) return;
        Trace.traceEvent(e, '点击了刷新');
        LeaveApplyAction.setLastApplyId('');
        setTimeout(() => this.getAllLeaveApplyList());
        LeaveApplyAction.setShowUpdateTip(false);
    };
    //监听推送数据
    pushDataListener = (data) => {
        //有数据，将是否展示更新tip
        if (data){
            LeaveApplyAction.setShowUpdateTip(true);
        }
    };

    //获取全部申请
    getAllLeaveApplyList = () => {
        var queryObj = this.getQueryParams();
        LeaveApplyAction.getAllLeaveApplyList(queryObj,(count) => {
            //如果是待审批的请求，获取到申请列表后，更新下待审批的数量
            if (this.state.applyListType === 'ongoing') {
                //触发更新待审批数
                commonMethodUtil.updateUnapprovedCount(APPLY_APPROVE_TYPES.UNHANDLEMEVISISTAPPLY,'SHOW_UNHANDLE_APPLY_APPROVE_COUNT',count);
            }
        });
    };

    //获取自己发起的申请
    getSelfLeaveApplyList() {
        LeaveApplyAction.getSelfApplyList();
    }

    //获取由自己审批的申请
    getWorklistLeaveApplyList() {
        LeaveApplyAction.getWorklistLeaveApplyList();
    }

    componentWillUnmount() {
        LeaveApplyStore.unlisten(this.onStoreChange);
        LeaveApplyAction.setInitState();
        LeaveApplyUtils.emitter.removeListener('updateSelectedItem', this.updateSelectedItem);
        notificationEmitter.removeListener(notificationEmitter.APPLY_UPDATED_VISIT, this.pushDataListener);
        notificationEmitter.removeListener(notificationEmitter.DIFF_APPLY_UNREAD_REPLY, this.refreshUnreadReplyList);
    }

    showAddApplyPanel = () => {
        this.setState({
            showAddApplyPanel: true
        });
    };
    hideLeaveApplyAddForm = () => {
        this.setState({
            showAddApplyPanel: false
        });
    };
    //下拉加载
    handleScrollBarBottom = () => {
        this.getAllLeaveApplyList();
    };
    //是否显示没有更多数据了
    showNoMoreDataTip = () => {
        return !this.state.applyListObj.loadingResult &&
            this.state.applyListObj.list.length >= 10 && !this.state.listenScrollBottom;
    };
    //点击展示详情
    clickShowDetail = (obj, idx) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.list-unstyled'), '查看申请详情');
        LeaveApplyAction.setSelectedDetailItem({obj, idx});
    };

    getApplyListType = () => {
        return commonMethodUtil.getApplyListTypeDes(this.state.applyListType);
    };
    menuClick = (obj) => {
        let selectType = '';
        var targetObj = _.find(selectMenuList, menu => menu.key === obj.key);
        if (targetObj){
            selectType = targetObj.value;
        }
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.pull-left'), '根据' + selectType + '过滤');
        LeaveApplyAction.changeApplyListType(obj.key);
        setTimeout(() => this.getAllLeaveApplyList());
    };

    retryFetchApplyList = (e) => {
        if (this.state.applyListObj.errorMsg) {
            Trace.traceEvent(e, '点击了重试');
        } else {
            Trace.traceEvent(e, '点击了重新获取');
        }
        setTimeout(() => this.getAllLeaveApplyList());
    };
    renderApplyListError = () => {
        var noData = this.state.applyListObj.loadingResult === '' && this.state.applyListObj.list.length === 0 && this.state.applyListType !== '';
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
        LeaveApplyAction.setIsCheckUnreadApplyList(!this.state.isCheckUnreadApplyList);
        LeaveApplyAction.setLastApplyId('');
        setTimeout(() => {
            if (this.state.isCheckUnreadApplyList) {
                Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.apply_manage_wrap'), '查看有未读回复的申请');
            } else {
                Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.apply_manage_wrap'), '取消有未读回复申请的查看');
            }
            this.getAllLeaveApplyList();
        });
    };
    getUnreadTip = () => {
        let unreadReplyList = this.state.unreadReplyList;
        let applyListType = this.state.applyListType;
        //是否展示有未读申请的提示，后端推送过来的未读回复列表中有数据，并且是在全部类型下可展示，其他待审批、已通过等类型下不展示
        return _.isArray(unreadReplyList) && unreadReplyList.length > 0 && applyListType === 'all' && !this.state.searchKeyword;
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
        var unreadList = _.filter(unreadReplyList, item => item.type === APPLY_APPROVE_TYPES.VISITAPPLY);
        LeaveApplyAction.refreshUnreadReplyList(unreadList);
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
        if (this.state.applyListObj.loadingResult === '' && this.state.applyListObj.list.length === 0 && this.state.applyListType === 'all' && this.state.searchKeyword === '') {
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
        var applyListType = this.state.applyListType;
        var applyType = commonMethodUtil.getApplyStatusDscr(applyListType);
        var noShowApplyDetail = this.state.applyListObj.list.length === 0;
        //申请详情数据
        var applyDetail = null;
        if (!noShowApplyDetail) {
            applyDetail = {detail: _.get(this.state, 'applyListObj.list[0]'), apps: this.state.allApps};
        }
        return (
            <div className="sales-opportunity-apply-container apply_manage_wrap">
                <div className="leave-apply-list-detail-wrap">
                    <div className="col-md-4 leave-apply-list" data-tracename="拜访申请列表">
                        <ApplyDropdownAndAddBtn
                            menuClick={this.menuClick}
                            getApplyListType= {this.getApplyListType}
                            addPrivilege='WORKFLOW_BASE_PERMISSION'
                            showAddApplyPanel={this.showAddApplyPanel}
                            addApplyMessage={Intl.get('add.leave.apply', '添加申请')}
                            menuList={selectMenuList}
                            refreshPage={this.refreshPage}
                            showUpdateTip={this.state.showUpdateTip}
                            showRefreshIcon={applyListType === APPLY_TYPE_STATUS_CONST.ALL || applyListType === APPLY_TYPE_STATUS_CONST.ONGOING}
                            showApplyMessageIcon = {applyListType === APPLY_TYPE_STATUS_CONST.ALL}
                            isCheckUnreadApplyList = {this.state.isCheckUnreadApplyList}
                            toggleUnreadApplyList= {this.toggleUnreadApplyList}
                            showUnreadTip= {this.getUnreadTip()}
                        />
                        {this.renderApplyListError()}
                        {this.state.applyListObj.loadingResult === 'loading' && !this.state.lastApplyId ? (
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
                            applyListType={this.state.applyListType}
                            isUnreadDetail={this.getIsUnreadDetail()}
                        />
                    )}
                </div>
                {this.state.showAddApplyPanel ?
                    <div className={addPanelWrap}>
                        <AddLeaveApplyPanel
                            hideLeaveApplyAddForm={this.hideLeaveApplyAddForm}
                        />
                    </div>
                    : null}
            </div>
        );
    }
}
LeaveApplyManagement.defaultProps = {
    location: {},
};
LeaveApplyManagement.propTypes = {
    location: PropTypes.object
};
module.exports = LeaveApplyManagement;