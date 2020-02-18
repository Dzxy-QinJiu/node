import commonMethodUtil from 'PUB_DIR/sources/utils/common-method-util';

/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2020/02/06.
 */
require('./css/index.less');
import {APPLY_APPROVE_TAB_TYPES, APPLY_TYPE, APPLY_LIST_LAYOUT_CONSTANTS, getApplyListDivHeight,FILTER,SEARCH} from './utils/apply_approve_utils';
import classNames from 'classnames';
import {Dropdown, Menu, Alert} from 'antd';
import userData from 'PUB_DIR/sources/user-data';
import {
    APPLY_APPROVE_TYPES,
    DIFF_APPLY_TYPE_UNREAD_REPLY,
    DOCUMENT_TYPE,
    REPORT_TYPE
} from 'PUB_DIR/sources/utils/consts';
import AddSalesOpportunityApply from 'MOD_DIR/sales_opportunity/public/view/add-sales-opportunity-apply';
import AddBusinessApply from 'MOD_DIR/business-apply/public/view/add-business-apply';
import AddLeaveApply from 'MOD_DIR/leave-apply/public/view/add-leave-apply';
import AddDocumentWriteOrReportSendApplyPanel from 'CMP_DIR/add-send-document-template';
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
class ApplyApproveList extends React.Component {
    state = {
        activeApplyTab: APPLY_TYPE.APPLY_BY_ME,
        addApplyFormPanel: '',//添加的申请审批的表单类型
        filterOrSearchType: '',//添加筛选或者搜索的类型
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
        this.getUnreadReplyList();
        this.getAppList();
    }
    componentWillUnmount() {
        ApplyApproveListStore.unlisten(this.onStoreChange);
    }
    getAppList(){
        getAppList(appList => {
            this.setState({appList: appList});
        });
    }
    //从sessionStorage中获取该用户未读的回复列表
    getUnreadReplyList = () => {
        const APPLY_UNREAD_REPLY = DIFF_APPLY_TYPE_UNREAD_REPLY.APPLY_UNREAD_REPLY;
        let unreadReplyList = session.get(APPLY_UNREAD_REPLY);
        if (unreadReplyList) {
            this.refreshUnreadReplyList(JSON.parse(unreadReplyList) || []);
        }
    };
    //刷新未读回复的列表
    refreshUnreadReplyList = (unreadReplyList) => {
        UserApplyActions.refreshUnreadReplyList(unreadReplyList);
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
        // let approval_state = UserData.hasRole(UserData.ROLE_CONSTANS.SECRETARY) ? 'pass' : this.state.applyListType;
        let sort_field = 'produce_date';//全部类型、待审批下按申请时间倒序排
        //[已通过、已驳回、已审批、已撤销
        let approvedTypes = ['pass', 'reject', 'true', 'cancel'];
        //已审批过的按审批时间倒序排
        // if (approvedTypes.indexOf(approval_state) !== -1) {
        //     sort_field = 'consume_date';
        // }
        UserApplyActions.getApplyList({
            id: this.state.lastApplyId,
            page_size: this.state.pageSize,
            // keyword: this.state.searchKeyword,
            isUnreadApply: this.state.isCheckUnreadApplyList,
            // approval_state: approval_state,
            sort_field: sort_field,
            order: 'descend'
        }, (count) => {
            //如果是待审批的请求，获取到申请列表后，更新下待审批的数量
            // if (this.state.applyListType === 'false') {
            //     //触发更新待审批数
            //     commonMethodUtil.updateUnapprovedCount('approve','SHOW_UNHANDLE_APPLY_COUNT',count);
            //     // 解决通过或驳回操作失败（后台其实是成功）后的状态更新
            //     if(this.state.dealApplyError === 'error'){
            //         UserApplyActions.updateDealApplyError('success');
            //     }
            // }
        });
    };
    handleChangeApplyActiveTab = (activeTab) => {
        this.setState({
            activeApplyTab: activeTab
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
        });
    };
    getAddFilterAndSearchMenu = () => {
        var filterAndSearchList = [{
            name: Intl.get('common.filter', '筛选'),
            value: FILTER,
            iconCls: 'icon-filter1'
        },{
            name: Intl.get('common.search', '搜索'),
            iconCls: 'icon-search',
            value: SEARCH
        }];
        return (
            <Menu className='add-search-or-filter-type-list'>
                {_.map(filterAndSearchList, (item, index) => {
                    return (
                        <Menu.Item key={index}>
                            <a onClick={this.openFilterOrSearch.bind(this, item.value)}>
                                <i className={'iconfont ' + _.get(item,'iconCls')}></i>
                                {_.get(item, 'name')}</a>
                        </Menu.Item>
                    );
                })}
            </Menu>
        );
    };
    getAddApplyTypeMenu = () => {
        let user = userData.getUserData();
        var workFlowList = _.get(user, 'workFlowConfigs', []);
        return (
            <Menu className='add-apply-type-list'>
                {_.map(workFlowList, (item, index) => {
                    //用户申请和成员申请暂时不展示
                    if (_.indexOf([APPLY_APPROVE_TYPES.USERAPPLY, APPLY_APPROVE_TYPES.MEMBER_INVITE],item.type) > -1 ) {
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
        let unreadReplyList = this.state.unreadReplyList;
        return (
            <ul className="list-unstyled app_user_manage_apply_list">
                {
                    this.state.applyListObj.list.map((obj, i) => {
                        var btnClass = classNames({
                            processed: obj.isConsumed === 'true'
                        });
                        var currentClass = classNames({
                            current: obj.id === this.state.selectedDetailItem.id && i === this.state.selectedDetailItemIdx
                        });
                        //是否有未读回复
                        let hasUnreadReply = _.find(unreadReplyList, unreadReply => unreadReply.apply_id === obj.id);
                        return (
                            <li key={obj.id} className={currentClass}
                                onClick={this.clickShowDetail.bind(this, obj, i)}
                            >
                                <dl>
                                    <dt>
                                        <span>{obj.topic || Intl.get('user.apply.id', '账号申请')}</span>
                                        {hasUnreadReply ? <span className="iconfont icon-apply-message-tip"
                                            title={Intl.get('user.apply.unread.reply', '有未读回复')}/> : null}
                                        <em className={btnClass}>{commonMethodUtil.getUserApplyStateText(obj)}</em>
                                    </dt>
                                    <dd className="clearfix" title={obj.customer_name}>
                                        <span>{obj.customer_name}</span>
                                    </dd>
                                    <dd className="clearfix">
                                        <span>{Intl.get('user.apply.presenter', '申请人')}:{obj.presenter}</span>
                                        <em>{this.getTimeStr(obj.time, oplateConsts.DATE_TIME_WITHOUT_SECOND_FORMAT)}</em>
                                    </dd>
                                </dl>
                            </li>
                        );
                    })
                }
            </ul>
        );
    };
    //左侧申请审批不同类型列表
    renderApplyListTab = () => {
        var activeApplyTab = this.state.activeApplyTab;
        return (
            <div className='apply_approve_list_wrap'>
                <div className='apply_approve_list_tab'>
                    <ul>
                        {_.map(APPLY_APPROVE_TAB_TYPES, item => {
                            var cls = classNames('apply_type_item', {
                                'active-tab': activeApplyTab === _.get(item, 'value', '')
                            });
                            return <li className={cls}
                                onClick={this.handleChangeApplyActiveTab.bind(this, _.get(item, 'value', ''))}>
                                {_.get(item, 'name', '')}
                            </li>;
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
    //渲染刷新提示或者筛选或者过滤提示
    renderRefreshTip = () => {

    };
    renderFilterSearch = () => {
        var filterOrSearchType = this.state.filterOrSearchType;
        if(filterOrSearchType){
            return (
                <div className='filter-and-search-container'>
                    <i className='iconfont icon-close-tips' onClick={this.closeSearchOrFilterPanel}></i>
                </div>
            );
        }else{
            return null;
        }

    };
    closeSearchOrFilterPanel = () => {
        this.setState({
            filterOrSearchType: ''
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
    //当前展示的详情是否是有未读回复的详情
    getIsUnreadDetail = () => {
        let selectApplyId = this.state.selectedDetailItem ? this.state.selectedDetailItem.id : '';
        if (selectApplyId) {
            return _.some(this.state.unreadReplyList, unreadReply => unreadReply.apply_id === selectApplyId);
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
        switch (_.get(selectedDetailItem,'message_type')) {
            case 'apply':
                applyDetailContent = <UserApplyViewDetailWrap
                    applyData={this.state.applyId ? applyDetail : null}
                    detailItem={this.state.selectedDetailItem}
                    isUnreadDetail={this.getIsUnreadDetail()}
                    showNoData={!this.state.lastApplyId && this.state.applyListObj.loadingResult === 'error'}
                    applyListType={this.state.applyListType}
                    handleOpenApplyDetail={this.handleOpenApplyDetail}
                    appList={this.state.appList}
                    height={$(window).height()}
                />;
                break;
        }
        return applyDetailContent;


    };
    closeAddApplyForm = () => {
        this.setState({
            addApplyFormPanel: ''
        });
    };
    renderAddApplyForm = () => {
        var addApplyFormPanel = this.state.addApplyFormPanel;
        let addApplyPanel = null;
        switch (addApplyFormPanel) {
            case APPLY_APPROVE_TYPES.BUSINESSOPPORTUNITIES:
                return <AddSalesOpportunityApply hideSalesOpportunityApplyAddForm={this.closeAddApplyForm}/>;
            case APPLY_APPROVE_TYPES.BUSSINESSTRIP:
                return <AddBusinessApply hideBusinessApplyAddForm={this.closeAddApplyForm}/>;
            case APPLY_APPROVE_TYPES.LEAVE:
                return <AddLeaveApply hideLeaveApplyAddForm={this.closeAddApplyForm}/>;
            case APPLY_APPROVE_TYPES.DOCUMENTWRITING:
                return <AddDocumentWriteOrReportSendApplyPanel
                    titleType={Intl.get('apply.approve.document.write', '文件撰写申请')}
                    hideApplyAddForm={this.closeAddApplyForm}
                    applyType={DOCUMENT_TYPE}
                    applyAjaxType={APPLY_APPROVE_TYPES.DOCUMENT}
                    // afterAddApplySuccess = {DocumentWriteApplyAction.afterAddApplySuccess}
                    addType='document_type'
                    selectTip={Intl.get('apply.approve.write.select.at.least.one.type', '请选择至少一个文件类型')}
                    selectPlaceholder={Intl.get('apply.approve.document.select.type', '请选择文件报告类型')}
                    applyLabel={Intl.get('apply.approve.document.write.type', '文件类型')}
                    remarkPlaceholder={Intl.get('apply.approve.report.remark', '请填写{type}备注', {type: Intl.get('apply.approve.document.writing', '文件撰写')})}
                />;
            case APPLY_APPROVE_TYPES.OPINIONREPORT:
                return <AddDocumentWriteOrReportSendApplyPanel
                    titleType={Intl.get('apply.approve.report.send', '舆情报告申请')}
                    applyType={REPORT_TYPE}
                    applyAjaxType={APPLY_APPROVE_TYPES.REPORT}
                    // afterAddApplySuccess = {ReportSendApplyAction.afterAddApplySuccess}
                    hideApplyAddForm={this.closeAddApplyForm}
                    addType='report_type'
                    selectTip={Intl.get('leave.apply.select.at.least.one.type', '请选择至少一个舆情报告类型')}
                    selectPlaceholder={Intl.get('apply.approve.report.select.type', '请选择舆情报告类型')}
                    applyLabel={Intl.get('common.type', '类型')}
                    remarkPlaceholder={Intl.get('apply.approve.report.remark', '请填写{type}备注', {type: Intl.get('apply.approve.lyrical.report', '舆情报告')})}
                />;
        }
    };
    getFirstApplyItem = () => {
        return _.get(this.state.applyListObj,'list[0]');
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
                {noShowApplyDetail ? null : <div className='apply_approve_detail_wrap' style={{'width': detailWrapWidth, 'height': divHeight}}>
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