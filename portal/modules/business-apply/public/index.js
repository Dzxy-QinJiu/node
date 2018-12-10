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
import AddBusinessApplyPanel from './view/add-business-apply';
import commonMethodUtil from 'PUB_DIR/sources/utils/common-method-util';
var Spinner = require('CMP_DIR/spinner');
var GeminiScrollbar = require('CMP_DIR/react-gemini-scrollbar');
var NoMoreDataTip = require('CMP_DIR/no_more_data_tip');
var classNames = require('classnames');
var LeaveApplyUtils = require('./utils/leave-apply-utils');
import ApplyViewDetail from './view/apply-view-detail';
import ApplyListItem from 'CMP_DIR/apply-list';
import ApplyDropdownAndAddBtn from 'CMP_DIR/apply-dropdown-and-add-btn';
import {selectMenuList, APPLY_LIST_LAYOUT_CONSTANTS,APPLY_APPROVE_TYPES} from 'PUB_DIR/sources/utils/consts';
let userData = require('../../../public/sources/user-data');
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
        }else if(Oplate && Oplate.unread && !Oplate.unread[APPLY_APPROVE_TYPES.UNHANDLECUSTOMERVISIT]){
            this.menuClick({key: 'all'});
        }else{
            //不区分角色，都获取全部的申请列表
            this.getAllBusinessApplyList();
        }
        LeaveApplyUtils.emitter.on('updateSelectedItem', this.updateSelectedItem);
    }
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
            sort_field: this.state.sort_field,//排序字段
            order: this.state.order,
            page_size: this.state.page_size,
            id: this.state.lastBusinessApplyId, //用于下拉加载的id
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
    getAllBusinessApplyList = () => {
        var queryObj = this.getQueryParams();
        BusinessApplyAction.getAllApplyList(queryObj);
    }

    //获取自己发起的请假申请
    getSelfBusinessApplyList() {
        BusinessApplyAction.getSelfApplyList();
    }

    //获取由自己审批的请假申请
    getWorklistBusinessApplyList() {
        BusinessApplyAction.getWorklistBusinessApplyList();
    }

    componentWillUnmount() {
        BusinessApplyStore.unlisten(this.onStoreChange);
        BusinessApplyAction.setInitState();
        LeaveApplyUtils.emitter.removeListener('updateSelectedItem', this.updateSelectedItem);
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
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.app_user_manage_apply_list'), '查看申请详情');
        BusinessApplyAction.setSelectedDetailItem({obj, idx});
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
            // case 'true':
            //     return Intl.get('user.apply.applied', '已审批');
            // case 'cancel':
            //     return Intl.get('user.apply.backout', '已撤销');
        }
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
                    {Intl.get('leave.apply.no.filter.leave.list', '暂无符合查询条件的出差申请')}
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
        var addPanelWrap = classNames({'show-add-modal': this.state.showAddApplyPanel});
        var applyListHeight = $(window).height() - APPLY_LIST_LAYOUT_CONSTANTS.BOTTOM_DELTA - APPLY_LIST_LAYOUT_CONSTANTS.TOP_DELTA;
        var applyType = commonMethodUtil.getApplyStatusDscr(this.state.applyListType);
        var noShowApplyDetail = this.state.applyListObj.list.length === 0;
        return (
            <div className="bussiness-apply-container">
                <div className="leave-apply-list-detail-wrap">
                    <div className="col-md-4 leave-apply-list" data-tracename="出差申请列表">
                        <ApplyDropdownAndAddBtn
                            menuClick={this.menuClick}
                            getApplyListType= {this.getApplyListType}
                            addPrivilege='BUSINESS_TRIP_APPLY'
                            showAddApplyPanel={this.showAddApplyPanel}
                            addApplyMessage={Intl.get('add.leave.apply', '添加申请')}
                            menuList={selectMenuList}
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
                                        <ApplyListItem
                                            processedStatus='ongoing'
                                            applyListObj={this.state.applyListObj}
                                            selectedDetailItem={this.state.selectedDetailItem}
                                            selectedDetailItemIdx={this.state.selectedDetailItemIdx}
                                            clickShowDetail={this.clickShowDetail}
                                        />
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
                        />
                    )}
                </div>
                {this.state.showAddApplyPanel ?
                    <div className={addPanelWrap}>
                        <AddBusinessApplyPanel
                            hideBusinessApplyAddForm={this.hideBusinessApplyAddForm}
                            getAllApplyList={this.getAllBusinessApplyList}
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