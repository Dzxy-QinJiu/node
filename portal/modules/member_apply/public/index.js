/**
 * Created by hzl on 2019/3/1.
 */
var MemberApplyAction = require('./action/member-apply-action');
var MemberApplyStore = require('./store/member-apply-store');
var MemberApplyDetailAction = require('./action/member-apply-detail-action');
import ApplyDropdownAndAddBtn from 'CMP_DIR/apply-components/apply-dropdown-and-add-btn';
import {selectMenuList, APPLY_LIST_LAYOUT_CONSTANTS,APPLY_APPROVE_TYPES,APPLY_TYPE_STATUS_CONST} from 'PUB_DIR/sources/utils/consts';
import Trace from 'LIB_DIR/trace';
var NoMoreDataTip = require('CMP_DIR/no_more_data_tip');
require('./css/index.less');
import {Alert} from 'antd';
import commonMethodUtil from 'PUB_DIR/sources/utils/common-method-util';
import ApplyListItem from 'CMP_DIR/apply-components/apply-list-item';
var Spinner = require('CMP_DIR/spinner');
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import ApplyViewDetail from './view/member-view-detail';
import { memberApplyEmitter } from 'PUB_DIR/sources/utils/emitters';
let userData = require('../../../public/sources/user-data');
var notificationEmitter = require('PUB_DIR/sources/utils/emitters').notificationEmitter;

class MemberApply extends React.Component {
    state = {
        teamTreeList: [],
        ...MemberApplyStore.getState()
    };

    onStoreChange = () => {
        this.setState(MemberApplyStore.getState());
    };

    componentDidMount() {
        MemberApplyStore.listen(this.onStoreChange);
        if(_.get(this.props,'location.state.clickUnhandleNum')){
            this.menuClick({key: 'ongoing'});
        }else if(Oplate && Oplate.unread && !Oplate.unread[APPLY_APPROVE_TYPES.UNHANDLEMEMBERINIVTE]){
            this.menuClick({key: 'all'});
        }else{
            //不区分角色，都获取全部的申请列表
            this.getAllMemberApplyList();
        }
        memberApplyEmitter.on('updateSelectedItem', this.updateSelectedItem);
        notificationEmitter.on(notificationEmitter.APPLY_UPDATED_MEMBER_INVITE, this.pushDataListener);
    }

    updateSelectedItem = (message) => {
        if(message && message.status === 'success'){
            //通过或者驳回申请后改变申请的状态
            if (message.agree){
                message.approve_details = [{user_name: userData.getUserData().user_name, status: message.agree,nick_name: userData.getUserData().nick_name,comment_time: moment().valueOf()}];
                message.update_time = moment().valueOf();
                MemberApplyAction.changeApplyAgreeStatus(message);
            }else if (message.cancel){
                //撤销的申请成功后改变状态
                MemberApplyAction.updateAllApplyItemStatus({id: message.id, status: 'cancel'});
                MemberApplyDetailAction.hideCancelBtns();
            }
        }
    };

    getQueryParams() {
        var params = {
            sort_field: this.state.sort_field,//排序字段
            order: this.state.order,
            page_size: this.state.page_size,
            id: this.state.lastApplyId, //用于下拉加载的id
            type: APPLY_APPROVE_TYPES.MEMBER_INVITE
        };
        //如果是选择的全部类型，不需要传status这个参数
        if (this.state.selectedApplyStatus !== 'all') {
            params.status = this.state.selectedApplyStatus;
        }
        //去除查询条件中值为空的项
        commonMethodUtil.removeEmptyItem(params);
        return params;
    }
    refreshPage = (e) => {
        if (!this.state.showUpdateTip) return;
        Trace.traceEvent(e, '点击了刷新');
        MemberApplyAction.setLastApplyId('');
        setTimeout(() => this.getAllMemberApplyList());
        MemberApplyAction.setShowUpdateTip(false);
    };
    //监听推送数据
    pushDataListener = (data) => {
        //有数据，将是否展示更新tip
        if (data){
            MemberApplyAction.setShowUpdateTip(true);
        }
    };

    //获取全部成员申请
    getAllMemberApplyList = () => {
        var queryObj = this.getQueryParams();
        MemberApplyAction.getAllMemberApplyList(queryObj,(count) => {
            //如果是待审批的请求，获取到申请列表后，更新下待审批的数量
            if (this.state.selectedApplyStatus === 'ongoing') {
                //触发更新待审批数
                commonMethodUtil.updateUnapprovedCount('unhandlePersonalMember','SHOW_UNHANDLE_APPLY_APPROVE_COUNT',count);
            }
        });
    };

    //获取自己发起的成员申请
    getSelfMemberApplyList() {
        MemberApplyAction.getSelfApplyList();
    }

    //获取由自己审批的成员申请
    getWorklistMemberApplyList() {
        MemberApplyAction.getWorklistMemberApplyList();
    }

    componentWillUnmount() {
        MemberApplyStore.unlisten(this.onStoreChange);
        MemberApplyAction.setInitState();
        memberApplyEmitter.removeListener('updateSelectedItem', this.updateSelectedItem);
        notificationEmitter.removeListener(notificationEmitter.APPLY_UPDATED_MEMBER_INVITE, this.pushDataListener);
    }
    //下拉加载
    handleScrollBarBottom = () => {
        this.getAllMemberApplyList();
    };
    //是否显示没有更多数据了
    showNoMoreDataTip = () => {
        return !this.state.applyListObj.loadingResult &&
            this.state.applyListObj.list.length >= 10 && !this.state.listenScrollBottom;
    };
    //点击展示详情
    clickShowDetail = (obj, idx) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.list-unstyled'), '查看申请详情');
        MemberApplyAction.setSelectedDetailItem({obj, idx});
    };

    getApplyListType = () => {
        switch (this.state.selectedApplyStatus) {
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
        MemberApplyAction.changeApplyListType(obj.key);
        setTimeout(() => this.getAllMemberApplyList());
    };

    retryFetchApplyList = (e) => {
        if (this.state.applyListObj.errorMsg) {
            Trace.traceEvent(e, '点击了重试');
        } else {
            Trace.traceEvent(e, '点击了重新获取');
        }
        setTimeout(() => this.getAllMemberApplyList());
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
                    {Intl.get('member.apply.no.member.apply','暂无符合条件的成员申请')}
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
        var applyListHeight = $(window).height() - APPLY_LIST_LAYOUT_CONSTANTS.BOTTOM_DELTA - APPLY_LIST_LAYOUT_CONSTANTS.TOP_DELTA;
        var selectedApplyStatus = this.state.selectedApplyStatus;
        var applyType = commonMethodUtil.getApplyStatusDscr(selectedApplyStatus);
        var noShowApplyDetail = this.state.applyListObj.list.length === 0;
        //申请详情数据
        var applyDetail = null;
        if (!noShowApplyDetail) {
            applyDetail = {detail: _.get(this.state, 'applyListObj.list[0]'), apps: this.state.allApps};
        }
        return (
            <div className="member-apply-container">
                <div className="member-apply-list-detail-wrap">
                    <div className="col-md-4 member-apply-list" data-tracename="成员申请列表">
                        <ApplyDropdownAndAddBtn
                            menuClick={this.menuClick}
                            getApplyListType= {this.getApplyListType}
                            menuList={selectMenuList}
                            refreshPage={this.refreshPage}
                            showUpdateTip={this.state.showUpdateTip}
                            showRefreshIcon={selectedApplyStatus === APPLY_TYPE_STATUS_CONST.ALL || selectedApplyStatus === APPLY_TYPE_STATUS_CONST.ONGOING}
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
                        )
                        }
                    </div>
                    {noShowApplyDetail ? null : (
                        <ApplyViewDetail
                            detailItem={this.state.selectedDetailItem}
                            showNoData={!this.state.lastApplyId && this.state.applyListObj.loadingResult === 'error'}
                            selectedApplyStatus={this.state.selectedApplyStatus}
                        />
                    )}
                </div>
            </div>
        );
    }
}
MemberApply.defaultProps = {
    location: {},
};
MemberApply.propTypes = {
    location: PropTypes.object
};
module.exports = MemberApply;
