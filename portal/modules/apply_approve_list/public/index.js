import commonMethodUtil from 'PUB_DIR/sources/utils/common-method-util';

/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2020/02/06.
 */
require('./css/index.less');
import {APPLY_APPROVE_TAB_TYPES, APPLY_TYPE, APPLY_LIST_LAYOUT_CONSTANTS} from './utils/apply_approve_utils';
import classNames from 'classnames';
import {Dropdown, Menu} from 'antd';
import userData from 'PUB_DIR/sources/user-data';

import {APPLY_APPROVE_TYPES} from 'PUB_DIR/sources/utils/consts';
import AddSalesOpportunityApply from 'MOD_DIR/sales_opportunity/public/view/add-sales-opportunity-apply';
import AddBusinessApply from 'MOD_DIR/business-apply/public/view/add-business-apply';
import AddLeaveApply from 'MOD_DIR/leave-apply/public/view/add-leave-apply';
import Spinner from 'CMP_DIR/spinner';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import NoMoreDataTip from 'CMP_DIR/no_more_data_tip';
import Trace from 'LIB_DIR/trace';
import UserApplyActions from 'MOD_DIR/user_apply/public/action/user-apply-actions';

class ApplyApproveList extends React.Component {
    state = {
        activeApplyTab: APPLY_TYPE.APPLY_BY_ME,
        addApplyFormPanel: '',//添加的申请审批的表单类型
        //todo 测试数据
        applyListObj: {
            loadingResult: '',
            list: [
                {
                    approval_state: '0',
                    id: '52360bd9-ad7e-41d6-b5a9-dc28459064ef',
                    message: {sales_team_name: '部门1'},
                    message_type: 'apply',
                    produce_date: 1581040690072,
                    producer: {email: 'liwenjun@eefung.coom', nick_name: 'salesman001', role: 'sales'},
                    realm: '36mvh13nka',
                    topic: '用户延期申请',
                    presenter: 'salesman001',
                    time: 1581040690072,
                    approval_time: '',
                    customer_name: '山东开创信息有限公司',
                    isConsumed: 'false'
                }, {
                    approval_state: '0',
                    id: '4bd6b7ae-89f1-42b8-93af-20c63afd1e33',
                    message: {sales_team_name: '济南平台部', email_user_names: 'fasdfsaf', email_app_names: '无非画画、爱仕达撒所多多非凡哥',},
                    message_type: 'apply',
                    produce_date: 1580982988617,
                    producer: {email: 'tangmaoqin@eefung.com', nick_name: 'xiaoshoueefung', role: 'sales',},
                    realm: '36mvh13nka',
                    topic: '试用用户申请',
                    presenter: 'xiaoshoueefung',
                    time: 1580982988617,
                    approval_time: '',
                    order_id: 'apply_new_users',
                    customer_id: 'ad08980292460795eba3d3a5f2d78dbe_36mvh13nka_c4a457d04b824b0b911394a715e9bc1e',
                    customer_name: '三道律泽（宁夏）知识产权有限公司',
                    isConsumed: 'false',
                }
            ]//申请审批列表
        },
        selectedDetailItem: {
            approval_state: '0',
            id: '52360bd9-ad7e-41d6-b5a9-dc28459064ef',
            message: {sales_team_name: '部门1'},
            message_type: 'apply',
            produce_date: 1581040690072,
            producer: {email: 'liwenjun@eefung.coom', nick_name: 'salesman001', role: 'sales'},
            realm: '36mvh13nka',
            topic: '用户延期申请',
            presenter: 'salesman001',
            time: 1581040690072,
            approval_time: '',
            customer_name: '山东开创信息有限公司',
            isConsumed: 'false'
        }

    };

    onStoreChange = () => {
    };

    componentDidMount() {

    }

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
        // UserApplyActions.setSelectedDetailItem({obj, idx});
    };
    getAddApplyTypeMenu = () => {
        let user = userData.getUserData();
        var workFlowList = _.get(user, 'workFlowConfigs', []);
        return (
            <Menu>
                {_.map(workFlowList, (item, index) => {
                    if (item.type === APPLY_APPROVE_TYPES.USERAPPLY) {
                        return null;
                    }
                    return (
                        <Menu.Item key={index}>
                            <a onClick={this.openAddApplyForm.bind(this, item)}>
                                {Intl.get('common.add', '添加')}
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
                        <Dropdown overlay={this.getAddApplyTypeMenu()} trigger={['click']}>
                            <i className='iconfont icon-other'></i>
                        </Dropdown>
                    </div>
                </div>
                {this.renderApplyTitleLists()}
            </div>
        );
    };
    getApplyListDivHeight = () => {
        if ($(window).width() < Oplate.layout['screen-md']) {
            return 'auto';
        }
        var height = $(window).height() - APPLY_LIST_LAYOUT_CONSTANTS.TOP_DELTA - APPLY_LIST_LAYOUT_CONSTANTS.BOTTOM_DELTA;
        return height;
    };
    renderApplyListError = () => {
        let noData = this.state.applyListObj.loadingResult === '' && this.state.applyListObj.list.length === 0;
        let tipMsg = '';

        if(this.state.applyListObj.loadingResult === 'error'){
            let retry = (
                <span>
                    {this.state.applyListObj.errorMsg}，<a href="javascript:void(0)"
                        onClick={this.retryFetchApplyList}>{Intl.get('common.retry','重试')}</a>
                </span>
            );
            return (
                <div className="app_user_manage_apply_list app_user_manage_apply_list_error">
                    <Alert message={retry} type="error" showIcon={true}/>
                </div>);
        }else if(noData){
            if( this.state.searchKeyword !== ''){
                tipMsg = (
                    <span>
                        {Intl.get('user.apply.no.match.retry','暂无符合查询条件的用户申请')}<span>,</span>
                        <a href="javascript:void(0)" onClick={this.retryFetchApplyList}>
                            {Intl.get('common.get.again','重新获取')}
                        </a>
                    </span>
                );
            }else if(this.state.isCheckUnreadApplyList){
                tipMsg = (
                    <span>
                        {Intl.get('user.apply.no.unread','已无未读回复的申请')}<span>,</span>
                        <a href="javascript:void(0)" onClick={this.retryFetchApplyList}>
                            {Intl.get('common.get.again','重新获取')}
                        </a>
                    </span>
                );
            }else{
                tipMsg = (
                    <span>
                        {Intl.get('user.apply.no.apply','还没有需要审批的用户申请')}<span>,</span>
                        <a href="javascript:void(0)" onClick={this.retryFetchApplyList}>
                            {Intl.get('common.get.again','重新获取')}
                        </a>
                    </span>
                );
            }
            return <div className="app_user_manage_apply_list app_user_manage_apply_list_error">
                <Alert message={tipMsg} type="info" showIcon={true}/>
            </div>;
        }
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
            applyListHeight = this.getApplyListDivHeight();
        }
        return <div className='app_user_manage_apply_list_wrap'>
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
    //申请审批的详情
    renderApplyListDetail = () => {
        return (
            <div className='apply_approve_detail_wrap'>

            </div>
        );
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
                return <AddLeaveApply/>;
        }
    };

    render() {
        return (
            <div className='apply_approve_content_wrap'>
                {this.renderApplyListTab()}
                {this.renderApplyListDetail()}
                {this.renderAddApplyForm()}
            </div>
        );
    }
}

ApplyApproveList.defaultProps = {};
ApplyApproveList.propTypes = {};
module.exports = ApplyApproveList;