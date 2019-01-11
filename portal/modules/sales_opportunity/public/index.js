/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/27.
 */
var SalesOpportunityApplyAction = require('./action/sales-opportunity-apply-action');
var SalesOpportunityApplyStore = require('./store/sales-opportunity-apply-store');
var SalesOpportunityApplyDetailAction = require('./action/sales-opportunity-apply-detail-action');
import ApplyDropdownAndAddBtn from 'CMP_DIR/apply-components/apply-dropdown-and-add-btn';
import AddSalesOpportunityApplyPanel from './view/add-sales-opportunity-apply';
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
var SalesOpportunityApplyUtils = require('./utils/sales-oppotunity-utils');
let userData = require('../../../public/sources/user-data');
import {getMyTeamTreeList} from 'PUB_DIR/sources/utils/common-data-util';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
var notificationEmitter = require('PUB_DIR/sources/utils/emitters').notificationEmitter;
class SalesOpportunityApplyManagement extends React.Component {
    state = {
        showAddApplyPanel: false,//是否展示添加销售机会申请面板
        teamTreeList: [],
        getErrMsg: '',//获取节点失败
        processConfig: {},
        ...SalesOpportunityApplyStore.getState()
    };

    onStoreChange = () => {
        this.setState(SalesOpportunityApplyStore.getState());
    };

    componentDidMount() {
        SalesOpportunityApplyStore.listen(this.onStoreChange);
        if(_.get(this.props,'location.state.clickUnhandleNum')){
            this.menuClick({key: 'ongoing'});
        }else if(Oplate && Oplate.unread && !Oplate.unread[APPLY_APPROVE_TYPES.UNHANDLEBUSINESSOPPORTUNITIES]){
            this.menuClick({key: 'all'});
        }else{
            //不区分角色，都获取全部的申请列表
            this.getAllSalesOpportunityApplyList();
        }
        getMyTeamTreeList(data => {
            this.setState({
                teamTreeList: data.teamTreeList
            });
        });
        SalesOpportunityApplyUtils.emitter.on('updateSelectedItem', this.updateSelectedItem);
        notificationEmitter.on(notificationEmitter.APPLY_UPDATED_SALES_OPPORTUNITY, this.pushDataListener);
    }
    refreshPage = (e) => {
        if (!this.state.showUpdateTip) return;
        Trace.traceEvent(e, '点击了刷新');
        SalesOpportunityApplyAction.setLastApplyId('');
        setTimeout(() => this.getAllSalesOpportunityApplyList());
        SalesOpportunityApplyAction.setShowUpdateTip(false);
    };
    //监听推送数据
    pushDataListener = (data) => {
        //有数据，将是否展示更新tip
        if (data){
            SalesOpportunityApplyAction.setShowUpdateTip(true);
        }
    };
    componentWillReceiveProps(nextProps) {
        if (_.get(nextProps,'history.action') === 'PUSH'){
            if (_.get(nextProps,'location.state.clickUnhandleNum')){
                delete nextProps.location.state.clickUnhandleNum;
                //取待审批的审批数
                this.menuClick({key: 'ongoing'});
            }
        }
    }

    updateSelectedItem = (message) => {
        if(message && message.status === 'success'){
            //通过或者驳回申请后改变申请的状态  
            if (message.agree) {
                message.approve_details = [{user_name: userData.getUserData().user_name, status: message.agree,nick_name: userData.getUserData().nick_name,comment_time: moment().valueOf()}];
                message.update_time = moment().valueOf();
                SalesOpportunityApplyAction.changeApplyAgreeStatus(message);
            }else if (message.cancel){
                //撤销的申请成功后改变状态
                SalesOpportunityApplyAction.updateAllApplyItemStatus({id: message.id, status: 'cancel'});
                SalesOpportunityApplyDetailAction.hideCancelBtns();
            }
        }
    };

    getQueryParams() {
        var params = {
            sort_field: this.state.sort_field,//排序字段
            order: this.state.order,
            page_size: this.state.page_size,
            id: this.state.lastApplyId, //用于下拉加载的id
            type: 'business_opportunities'
        };
        //如果是选择的全部类型，不需要传status这个参数
        if (this.state.applyListType !== 'all') {
            params.status = this.state.applyListType;
        }
        //去除查询条件中值为空的项
        commonMethodUtil.removeEmptyItem(params);
        return params;
    }

    //获取全部请假申请
    getAllSalesOpportunityApplyList = () => {
        var queryObj = this.getQueryParams();
        SalesOpportunityApplyAction.getAllSalesOpportunityApplyList(queryObj);
    };

    //获取自己发起的请假申请
    getSelfSalesOpportunityApplyList() {
        SalesOpportunityApplyAction.getSelfApplyList();
    }

    //获取由自己审批的请假申请
    getWorklistSalesOpportunityApplyList() {
        SalesOpportunityApplyAction.getWorklistSalesOpportunityApplyList();
    }

    componentWillUnmount() {
        SalesOpportunityApplyStore.unlisten(this.onStoreChange);
        SalesOpportunityApplyAction.setInitState();
        SalesOpportunityApplyUtils.emitter.removeListener('updateSelectedItem', this.updateSelectedItem);
        notificationEmitter.removeListener(notificationEmitter.APPLY_UPDATED_SALES_OPPORTUNITY, this.pushDataListener);
    }

    showAddApplyPanel = () => {
        this.setState({
            showAddApplyPanel: true
        });
    };
    hideSalesOpportunityApplyAddForm = () => {
        this.setState({
            showAddApplyPanel: false
        });
    };
    //下拉加载
    handleScrollBarBottom = () => {
        this.getAllSalesOpportunityApplyList();
    };
    //是否显示没有更多数据了
    showNoMoreDataTip = () => {
        return !this.state.applyListObj.loadingResult &&
            this.state.applyListObj.list.length >= 10 && !this.state.listenScrollBottom;
    };
    //点击展示详情
    clickShowDetail = (obj, idx) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.app_user_manage_apply_list'), '查看申请详情');
        SalesOpportunityApplyAction.setSelectedDetailItem({obj, idx});
    };

    getApplyListType = () => {
        switch (this.state.applyListType) {
            case 'all':
                return Intl.get('user.apply.all', '全部申请');
            case 'ongoing':
                return Intl.get('leave.apply.my.worklist.apply', '待我审批');
            case 'pass':
                return Intl.get('user.apply.pass', '已通过');
            case 'reject':
                return Intl.get('user.apply.reject', '已驳回');
            case 'cancel':
                return Intl.get('user.apply.backout', '已撤销');
        }
    };
    menuClick = (obj) => {
        let selectType = '';
        var targetObj = _.find(selectMenuList, menu => menu.key === obj.key);
        if (targetObj){
            selectType = targetObj.value;
        }
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.pull-left'), '根据' + selectType + '过滤');
        SalesOpportunityApplyAction.changeApplyListType(obj.key);
        setTimeout(() => this.getAllSalesOpportunityApplyList());
    };

    retryFetchApplyList = (e) => {
        if (this.state.applyListObj.errorMsg) {
            Trace.traceEvent(e, '点击了重试');
        } else {
            Trace.traceEvent(e, '点击了重新获取');
        }
        setTimeout(() => this.getAllSalesOpportunityApplyList());
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
                    {Intl.get('leave.apply.no.filter.business.list', '暂无符合查询条件的销售机会申请')}
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

    render() {
        var userDetail = userData.getUserData();
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
            <div className="sales-opportunity-apply-container">
                <div className="leave-apply-list-detail-wrap">
                    <div className="col-md-4 leave-apply-list" data-tracename="销售机会申请列表">
                        <ApplyDropdownAndAddBtn
                            menuClick={this.menuClick}
                            getApplyListType= {this.getApplyListType}
                            addPrivilege='MEMBER_BUSINESSOPPO_APPLY'
                            showAddApplyPanel={this.showAddApplyPanel}
                            addApplyMessage={Intl.get('add.leave.apply', '添加申请')}
                            menuList={selectMenuList}
                            refreshPage={this.refreshPage}
                            showUpdateTip={this.state.showUpdateTip}
                            showRefreshIcon = {applyListType === APPLY_TYPE_STATUS_CONST.ALL || applyListType === APPLY_TYPE_STATUS_CONST.ONGOING}
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
                                                return (
                                                    <ApplyListItem
                                                        key={index}
                                                        obj={obj}
                                                        index= {index}
                                                        clickShowDetail={this.clickShowDetail}
                                                        processedStatus='ongoing'
                                                        selectedDetailItem={this.state.selectedDetailItem}
                                                        selectedDetailItemIdx={this.state.selectedDetailItemIdx}
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
                        )}
                    </div>
                    {noShowApplyDetail ? null : (
                        <ApplyViewDetail
                            detailItem={this.state.selectedDetailItem}
                            showNoData={!this.state.lastApplyId && this.state.applyListObj.loadingResult === 'error'}
                            applyListType={this.state.applyListType}

                        />
                    )}
                </div>
                {this.state.showAddApplyPanel ?
                    <div className={addPanelWrap}>
                        <AddSalesOpportunityApplyPanel
                            hideSalesOpportunityApplyAddForm={this.hideSalesOpportunityApplyAddForm}
                        />
                    </div>
                    : null}
            </div>
        );
    }
}
SalesOpportunityApplyManagement.defaultProps = {
    location: {},
};
SalesOpportunityApplyManagement.propTypes = {
    location: PropTypes.object
};
module.exports = SalesOpportunityApplyManagement;