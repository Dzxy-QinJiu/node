/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/10.
 */
import Trace from 'LIB_DIR/trace';
var BusinessApplyStore = require('./store/business-apply-store');
var BusinessApplyAction = require('./action/business-apply-action');
import TopNav from 'CMP_DIR/top-nav';
require('./css/index.less');
var userData = require('PUB_DIR/sources/user-data');
import {Button, Menu, Dropdown, Alert} from 'antd';
import AddBusinessApplyPanel from './view/add-business-apply';
var hasPrivilege = require('CMP_DIR/privilege/checker').hasPrivilege;
var className = require('classnames');
import commonMethodUtil from 'PUB_DIR/sources/utils/common-method-util';
var Spinner = require('CMP_DIR/spinner');
var GeminiScrollbar = require('CMP_DIR/react-gemini-scrollbar');
var NoMoreDataTip = require('CMP_DIR/no_more_data_tip');
var classNames = require('classnames');
var LeaveApplyUtils = require('./utils/leave-apply-utils');
import ApplyViewDetail from './view/apply-view-detail';
class BusinessApplyManagement extends React.Component {
    state = {
        showAddApplyPanel: false,//是否展示添加出差申请面板
        ...BusinessApplyStore.getState()
    };

    onStoreChange = () => {
        this.setState(BusinessApplyStore.getState());
    };

    componentDidMount() {
        BusinessApplyStore.listen(this.onStoreChange);
        //todo 不区分角色，都获取全部的申请列表
        this.getAllBusinessApplyList();
        // //如果是普通销售，就获取自己的申请列表
        // if (userData.getUserData().isCommonSales){
        //     this.getSelfBusinessApplyList();
        // }else{
        // // 如果是管理员或者是销售领导，就获取要由自己审批的申请列表
        // this.getAllBusinessApplyList();
        // }
        // LeaveApplyUtils.emitter.on('updateSelectedItem', this.updateSelectedItem);

    }

    // updateSelectedItem = (message) => {
    //     if(message && message.status === 'success'){
    //         //通过或者驳回申请后改变申请的状态
    //         if (message.agree){
    //             message.approve_details = [{user_name: userData.getUserData().user_name}];
    //             message.update_time = moment().valueOf();
    //             BusinessApplyAction.changeApplyAgreeStatus(message);
    //         }
    //     }
    //     //todo 暂时没用到
    //     //处理申请成功还是失败,"success"/"error"
    //     // BusinessApplyAction.updateDealApplyError(message && message.status || this.state.dealApplyError);
    // };

    getQueryParams() {
        var params = {
            sort_field: this.state.sort_field,//排序字段
            order: this.state.order,
            page_size: this.state.page_size,
            id: this.state.lastBusinessApplyId, //用于下拉加载的id
        };
        //如果是选择的全部类型，不需要传status这个参数
        if (this.state.applyListType !== 'all'){
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
        // LeaveApplyUtils.emitter.removeListener('updateSelectedItem', this.updateSelectedItem);
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
    getApplyStateText = (obj) => {
        if (obj.status === 'pass') {
            return Intl.get('user.apply.pass', '已通过');
        } else if (obj.status === 'reject') {
            return Intl.get('user.apply.reject', '已驳回');
        } else {
            return Intl.get('user.apply.false', '待审批');
        }
    };
    getTimeStr = (d, format) => {
        d = parseInt(d);
        if (isNaN(d)) {
            return '';
        }
        return moment(new Date(d)).format(format || oplateConsts.DATE_TIME_WITHOUT_SECOND_FORMAT);
    };

    getApplyListType = () => {
        switch (this.state.applyListType) {
            case 'all':
                return Intl.get('user.apply.all', '全部申请');
            case 'ongoing':
                return Intl.get('user.apply.false', '待审批');
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
        if (obj.key === '') {
            selectType = Intl.get('user.apply.all', '全部申请');
        } else if (obj.key === 'pass') {
            selectType = Intl.get('user.apply.pass', '已通过');
        } else if (obj.key === 'ongoing') {
            selectType = Intl.get('user.apply.false', '待审批');
        } else if (obj.key === 'reject') {
            selectType = Intl.get('user.apply.reject', '已驳回');
        }
        // else if (obj.key === 'cancel') {
        //     selectType = Intl.get('user.apply.backout', '已撤销');
        // }
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.pull-left'), '根据' + selectType + '过滤');
        BusinessApplyAction.changeApplyListType(obj.key);
        setTimeout(() => this.getAllBusinessApplyList());
    };
    renderApplyHeader = () => {
        //如果是从url传入了参数applyId
        if (this.state.applyId) {
            return null;
        } else {
            // 筛选菜单
            var menuList = (
                // UserData.hasRole(UserData.ROLE_CONSTANS.SECRETARY) ? null : (
                <Menu onClick={this.menuClick} className="apply-filter-menu-list">
                    <Menu.Item key="all">
                        <a href="javascript:void(0)">{Intl.get('user.apply.all', '全部申请')}</a>
                    </Menu.Item>
                    <Menu.Item key="ongoing">
                        <a href="javascript:void(0)">{Intl.get('user.apply.false', '待审批')}</a>
                    </Menu.Item>
                    <Menu.Item key="pass">
                        <a href="javascript:void(0)">{Intl.get('user.apply.pass', '已通过')}</a>
                    </Menu.Item>
                    <Menu.Item key="reject">
                        <a href="javascript:void(0)">{Intl.get('user.apply.reject', '已驳回')}</a>
                    </Menu.Item>
                    {/*<Menu.Item key="cancel">*/}
                    {/*<a href="javascript:void(0)">{Intl.get('user.apply.backout', '已撤销')}</a>*/}
                    {/*</Menu.Item>*/}
                </Menu>
                // )
            );
            let unreadReplyList = this.state.unreadReplyList;
            //是否展示有未读申请的提示，后端推送过来的未读回复列表中有数据，并且是在全部类型下可展示，其他待审批、已通过等类型下不展示
            let showUnreadTip = _.isArray(unreadReplyList) && unreadReplyList.length > 0 && this.state.applyListType === 'all' && !this.state.searchKeyword;
            return (
                <div className="searchbar clearfix">
                    <div className="apply-type-filter btn-item" id="apply-type-container">
                        {
                            // UserData.hasRole(UserData.ROLE_CONSTANS.SECRETARY) ? null : (
                            <Dropdown overlay={menuList} placement="bottomLeft"
                                getPopupContainer={() => document.getElementById('apply-type-container')}>
                                <span className="apply-type-filter-btn">
                                    {this.getApplyListType()}
                                    <span className="iconfont icon-arrow-down"/>
                                </span>
                            </Dropdown>
                            // )
                        }
                    </div>
                    {hasPrivilege('BUSINESS_TRIP_APPLY') ?
                        <Button className='pull-right add-leave-btn' onClick={this.showAddApplyPanel}
                        >{Intl.get('add.leave.apply', '添加出差申请')}</Button>
                        : null}
                    {/*<div className="apply-search-wrap btn-item">*/}
                    {/*<SearchInput*/}
                    {/*type="input"*/}
                    {/*className="form-control"*/}
                    {/*searchPlaceHolder={Intl.get('user.apply.search.placeholder', '申请人/客户名/用户名')}*/}
                    {/*searchEvent={this.changeSearchInputValue}*/}
                    {/*/>*/}
                    {/*</div>*/}
                    {/*{this.state.applyListType === 'all' && !this.state.searchKeyword ? (//只有在全部申请和没有搜索时才会展示刷新和查看未读回复的按钮*/}
                    {/*<div className="search-btns">*/}
                    {/*<span onClick={this.refreshPage}*/}
                    {/*className={classNames('iconfont icon-refresh', {'has-new-apply': this.state.showUpdateTip})}*/}
                    {/*title={this.state.showUpdateTip ? Intl.get('user.apply.new.refresh.tip', '有新申请，点此刷新') : Intl.get('user.apply.no.new.refresh.tip', '无新申请')}/>*/}
                    {/*<div className={classNames('check-uread-reply-bg', {*/}
                    {/*'active': this.state.isCheckUnreadApplyList*/}
                    {/*})}>*/}
                    {/*<span onClick={this.toggleUnreadApplyList.bind(this, showUnreadTip)}*/}
                    {/*className={classNames('iconfont icon-apply-message-tip', {*/}
                    {/*'has-unread-reply': showUnreadTip*/}
                    {/*})}*/}
                    {/*title={this.getUnreadReplyTitle(showUnreadTip)}/>*/}
                    {/*</div>*/}
                    {/*</div>) : null}*/}
                </div>
            );
        }
    };

    renderApplyList() {
        let unreadReplyList = this.state.unreadReplyList;
        return (
            <ul className="list-unstyled leave_manage_apply_list">
                {
                    this.state.applyListObj.list.map((obj, i) => {
                        var btnClass = classNames({
                            processed: obj.status !== 'ongoing'
                        });
                        var currentClass = classNames({
                            current: obj.id === this.state.selectedDetailItem.id && i === this.state.selectedDetailItemIdx
                        });
                        return (
                            <li key={obj.id} className={currentClass}
                                onClick={this.clickShowDetail.bind(this, obj, i)}
                            >
                                <dl>
                                    <dt>
                                        <span>{LeaveApplyUtils.getApplyTopicText(obj)}</span>
                                        <em className={btnClass}>{this.getApplyStateText(obj)}</em>
                                    </dt>
                                    <dd className="clearfix" title={_.get(obj, 'detail.customer_name')}>
                                        <span>{_.get(obj, 'detail.customer_name')}</span>
                                    </dd>
                                    <dd className="clearfix">
                                        <span>{Intl.get('user.apply.presenter', '申请人')}:{_.get(obj, 'applicant.user_name')}</span>
                                        <em>{this.getTimeStr(obj.create_time, oplateConsts.DATE_TIME_WITHOUT_SECOND_FORMAT)}</em>
                                    </dd>
                                </dl>
                            </li>
                        );
                    })
                }
            </ul>
        );
    }

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
        var addPanelWrap = className({'show-add-modal': this.state.showAddApplyPanel});
        var applyListHeight = $(window).height() - LeaveApplyUtils.APPLY_LIST_LAYOUT_CONSTANTS.BOTTOM_DELTA - LeaveApplyUtils.APPLY_LIST_LAYOUT_CONSTANTS.TOP_DELTA;
        var applyType = '';
        if (this.state.applyListType === 'ongoing') {
            applyType = Intl.get('user.apply.false', '待审批');
        } else if (this.state.applyListType === 'pass') {
            applyType = Intl.get('user.apply.pass', '已通过');
        } else if (this.state.applyListType === 'reject') {
            applyType = '被驳回';
        }
        // else if (this.state.applyListType === 'cancel') {
        //     applyType = Intl.get('user.apply.backout', '已撤销');
        // }
        var noShowApplyDetail = this.state.applyListObj.list.length === 0;
        //申请详情数据
        var applyDetail = null;
        if (!noShowApplyDetail) {
            applyDetail = {detail: _.get(this.state, 'applyListObj.list[0]'), apps: this.state.allApps};
        }
        return (
            <div className="leave-apply-container">
                <div className="leave-apply-list-detail-wrap">
                    <div className="col-md-4 leave-apply-list" data-tracename="出差申请列表">
                        {this.renderApplyHeader()}
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
                                        {this.renderApplyList()}
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
module.exports = BusinessApplyManagement;