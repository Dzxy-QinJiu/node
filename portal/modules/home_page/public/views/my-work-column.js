/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2019/6/12.
 */
import '../css/my-work-column.less';
import classNames from 'classnames';
import {Dropdown, Icon, Menu, Tag} from 'antd';
import ColumnItem from './column-item';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import {getColumnHeight} from './common-util';
import myWorkAjax from '../ajax';
import DetailCard from 'CMP_DIR/detail-card';
import PhoneCallout from 'CMP_DIR/phone-callout';
import Spinner from 'CMP_DIR/spinner';
import crmUtil from 'MOD_DIR/crm/public/utils/crm-util';
import {phoneMsgEmitter} from 'PUB_DIR/sources/utils/emitters';
import {RightPanel} from 'CMP_DIR/rightPanel';
import AlertTimer from 'CMP_DIR/alert-timer';
import AppUserManage from 'MOD_DIR/app_user_manage/public';
import UserDetail from 'MOD_DIR/app_user_manage/public/views/user-detail';
import {scrollBarEmitter} from 'PUB_DIR/sources/utils/emitters';
import UserApplyDetail from 'MOD_DIR/user_apply/public/views/apply-view-detail';
import OpportunityApplyDetail from 'MOD_DIR/sales_opportunity/public/view/apply-view-detail';
import CustomerVisitApplyDetail from 'MOD_DIR/business-apply/public/view/apply-view-detail';
import LeaveApplyDetail from 'MOD_DIR/leave-apply/public/view/apply-view-detail';
import DocumentApplyDetail from 'MOD_DIR/document_write/public/view/apply-view-detail';
import ReportApplyDetail from 'MOD_DIR/report_send/public/view/apply-view-detail';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import {APPLY_APPROVE_TYPES} from 'PUB_DIR/sources/utils/consts';
//工作类型
const WORK_TYPES = {
    LEAD: 'lead',//待处理线索
    APPLY: 'apply',//申请消息
    SCHEDULE: 'schedule',//待联系的客户:日程
    DEAL: 'deal'// 待处理的订单deal
};
//联系计划类型
const SCHEDULE_TYPES = {
    LEAD_CALLS: 'lead',//线索中打电话的联系计划
    CALLS: 'calls',//客户中打电话的联系计划
    VISIT: 'visit',//拜访
    OTHER: 'other'//其他
};
//需要打开详情的类型
const OPEN_DETAIL_TYPES = [WORK_TYPES.DEAL, WORK_TYPES.APPLY];

class MyWorkColumn extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            curWorkType: '',//当前筛选类型
            myWorkList: [],
            //我的工作类型
            myWorkTypes: [{name: Intl.get('home.page.work.all', '全部事务'), value: ''}],
            loading: false,
            load_id: '',//用于下拉加载的id
            totalCount: 0,//共多少条工作
            listenScrollBottom: true,//是否下拉加载
            curOpenDetailWork: null,//当前需要打开详情的工作
        };
    }

    componentDidMount() {
        this.getMyWorkTypes();
        this.getMyWorkList();
    }

    getMyWorkTypes() {
        myWorkAjax.getMyWorkTypes().then((typeList) => {
            let workTypes = _.map(typeList, item => {
                return {name: item.name, value: item.key};
            });
            workTypes.unshift({name: Intl.get('home.page.work.all', '全部事务'), value: ''});
            this.setState({myWorkTypes: workTypes});
        }, (errorMsg) => {

        });
    }

    getMyWorkList() {
        let queryParams = {
            page_size: 20,
            type: this.state.curWorkType,
            load_id: this.state.load_id,
            // sort_id: '',
            //order:'desc'
        };
        if (this.state.curWorkType) {
            queryParams.type = this.state.curWorkType;
        }
        this.setState({loading: true});
        myWorkAjax.getMyWorkList(queryParams).then((result) => {
            scrollBarEmitter.emit(scrollBarEmitter.STOP_LOADED_DATA);
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            let myWorkList = this.state.myWorkList;
            if (this.state.load_id) {//下拉加载时
                myWorkList = _.concat(myWorkList, _.get(result, 'list', []));
            } else {//首次加载
                myWorkList = _.get(result, 'list', []);
            }
            let totalCount = _.get(result, 'total', 0);
            let listenScrollBottom = false;
            if (_.get(myWorkList, 'length') < totalCount) {
                listenScrollBottom = true;
            }
            this.setState({
                loading: false,
                load_id: _.get(_.last(myWorkList), 'id', ''),
                myWorkList,
                totalCount,
                listenScrollBottom
            });
        }, (errorMsg) => {
            scrollBarEmitter.emit(scrollBarEmitter.STOP_LOADED_DATA);
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            this.setState({loading: false});
        });
    }

    onChangeWorkType = ({key}) => {
        this.setState({curWorkType: key, myWorkList: [], load_id: ''}, () => {
            this.getMyWorkList();
        });
    }

    getWorkTypeDropdown() {
        const workTypeMenu = (
            <Menu onClick={this.onChangeWorkType}>
                {_.map(this.state.myWorkTypes, item => {
                    return (<Menu.Item key={item.value}>{item.name}</Menu.Item>);
                })}
            </Menu>);
        const curWorkType = _.find(this.state.myWorkTypes, item => item.value === this.state.curWorkType);
        const curWorkTypeName = _.get(curWorkType, 'name', this.state.myWorkTypes[0].name);
        return (
            <Dropdown overlay={workTypeMenu} trigger={['click']} placement='bottomRight'>
                <span className='my-work-dropdown-trigger'>
                    {curWorkTypeName}
                    <Icon type='down' className='dropdown-icon'/>
                </span>
            </Dropdown>);
    }

    openClueDetail = (clueId) => {
        phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_CLUE_PANEL, {
            clue_params: {
                currentId: clueId,
                hideRightPanel: this.hideClueRightPanel,
                afterDeleteClue: this.afterDeleteClue,
            }
        });
    }
    hideClueRightPanel = () => {

    }
    //删除线索之后
    afterDeleteClue = () => {

    };

    openCustomerDetail(customerId, index) {
        if (this.state.curShowUserId) {
            this.closeRightUserPanel();
        }
        this.setState({
            curShowCustomerId: customerId,
            selectedLiIndex: index
        });
        phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
            customer_params: {
                currentId: customerId,
                ShowCustomerUserListPanel: this.showCustomerUserListPanel,
                showRightPanel: this.showRightPanel,
                hideRightPanel: this.closeRightCustomerPanel
            }
        });
    }

    openCustomerOrClueDetail(id, modelType, index) {
        if (!id) return;
        //打开线索详情
        if (modelType === 'lead') {
            this.openClueDetail(id);
        } else if (modelType === 'customer') {
            //打开客户详情
            this.openCustomerDetail(id, index);
        }
    }

    closeRightCustomerPanel = () => {
        this.setState({
            curShowCustomerId: '',
            selectedLiIndex: null
        });
    };
    showCustomerUserListPanel = (data) => {
        this.setState({
            isShowCustomerUserListPanel: true,
            customerOfCurUser: data.customerObj
        });

    };

    closeCustomerUserListPanel = () => {
        this.setState({
            isShowCustomerUserListPanel: false,
            customerOfCurUser: {}
        });
    };
    openUserDetail = (user_id, idx) => {
        if (this.state.curShowCustomerId) {
            this.closeRightCustomerPanel();
        }
        this.setState({
            curShowUserId: user_id,
            selectedLiIndex: idx
        });
    };
    closeRightUserPanel = () => {
        this.setState({
            curShowUserId: '',
            selectedLiIndex: null
        });
    };

    renderWorkName(item, index) {
        //客户阶段标签
        const customer_label = _.get(item, 'details[0].tag');
        //客户合格标签
        const qualify_label = _.get(item, 'detail.qualify_label');
        //分数
        const score = _.get(item, 'details[0].score');
        //客户id或线索id
        const id = _.get(item, 'details[0].id');
        const nameCls = classNames('work-name-text', {
            'customer-clue-name': !!id
        });
        //日程通过modelType来判断当前是线索还是客户
        const modelType = _.get(item, 'details[0].model_type');
        return (
            <div className='work-name'>
                {customer_label ? (
                    <Tag
                        className={crmUtil.getCrmLabelCls(customer_label)}>
                        {customer_label}</Tag>) : null
                }
                {qualify_label ? (
                    <Tag className={crmUtil.getCrmLabelCls(qualify_label)}>
                        {qualify_label === 1 ? crmUtil.CUSTOMER_TAGS.QUALIFIED :
                            qualify_label === 2 ? crmUtil.CUSTOMER_TAGS.HISTORY_QUALIFIED : ''}</Tag>) : null
                }
                <span className={nameCls}
                    onClick={this.openCustomerOrClueDetail.bind(this, id, modelType, index)}>
                    {_.get(item, 'details[0].name', '')}
                </span>
                {score ? (
                    <span className='custmer-score'>
                        <i className='iconfont icon-customer-score'/>
                        {score}
                    </span>) : null}
            </div>);
    }

    //联系人及电话的渲染
    renderContactItem(item) {
        let contacts = _.get(item, 'details[0].contacts', []);
        //默认展示的联系人及电话(有默认联系人时展示默认联系人，没有时展示第一个联系人)
        let defaultContact = {};
        if (!_.isEmpty(contacts)) {
            defaultContact = _.find(contacts, contact => contact.def_contancts === 'true');
            if (!defaultContact) {
                defaultContact = contacts[0];
            }
        }
        let defaultContactName = _.get(defaultContact, 'name', '');
        let defaultPhone = _.get(defaultContact, 'phone[0]', '');
        if (defaultContactName || defaultPhone) {
            return (
                <div className='clue-contacts work-hover-show-detail'>
                    <span className='clue-contact-name work-contact-name'>{defaultContactName}</span>
                    {defaultPhone ? (
                        <span className='work-contact-phone'>
                            <PhoneCallout
                                phoneNumber={defaultPhone}
                                contactName={defaultContactName}
                            />
                        </span>) : null}
                </div>);
        }
    }

    getWorkIconCls(item) {
        let iconCls = '';
        switch (item.type) {
            case WORK_TYPES.LEAD://待处理线索
                iconCls = 'icon-clue';
                break;
            case WORK_TYPES.APPLY://申请消息
                iconCls = 'icon-application-ico';
                break;
            case WORK_TYPES.SCHEDULE://联系计划
                switch (item.key) {
                    case SCHEDULE_TYPES.VISIT://拜访
                        iconCls = 'icon-visit-briefcase';
                        break;
                    case SCHEDULE_TYPES.CALLS://打电话
                        iconCls = 'icon-phone-call-out';
                        break;
                    case SCHEDULE_TYPES.LEAD_CALLS://线索中打电话的联系计划
                        iconCls = 'icon-phone-call-out';
                        break;
                    case SCHEDULE_TYPES.OTHER://其他
                        iconCls = 'icon-trace-other';
                        break;
                }
                break;
            case WORK_TYPES.DEAL://新订单
                iconCls = 'icon-deal_manage-ico';
                break;
        }
        return iconCls;
    }

    renderWorkCard(item, index) {
        const iconCls = this.getWorkIconCls(item);
        const titleCls = classNames('work-item-title', {
            'priority-high-work': _.get(item, 'priority') <= 1//前两级的工作标题需要高亮
        });
        const title = (
            <span className={titleCls}>
                <i className={'iconfont ' + iconCls}/>
                <span className='work-title-text'>{item.name}</span>
            </span>);
        const content = (
            <div className='work-content-wrap' id={`home-page-work${item.id}`}>
                {this.renderWorkName(item, index)}
                <div className='work-remark'>
                    {_.get(item, 'remark', '')}
                </div>
                {this.renderContactItem(item)}
                {this.renderHandleWorkBtn(item)}
            </div>);
        const containerCls = classNames('my-work-card-container', {
            'open-work-detail-style': _.includes(OPEN_DETAIL_TYPES, item.type) && item.opinion === 'ongoing'
        });
        return (
            <div className={containerCls} onClick={this.openWorkDetail.bind(this, item)}>
                <DetailCard title={title}
                    content={content}
                    className='my-work-card'/>
            </div>);
    }

    //打开工作详情
    openWorkDetail = (item, event) => {
        //点击到客户名或线索名时，打开客户或线索详情，不触发打开工作详情的处理
        if ($(event.target).hasClass('customer-clue-name')) return;
        //打开订单详情、申请详情
        if (_.includes(OPEN_DETAIL_TYPES, item.type) && item.opinion === 'ongoing') {
            this.setState({curOpenDetailWork: item});
        }
    }

    renderHandleWorkBtn(item) {
        //当前工作是否正在编辑
        if (item.isEidtingWorkStatus) {
            return ( <div className='handle-work-finish'>(<Icon type="loading"/></div>);
        } else if (item.editWorkStatusErrorMsg) {
            return (<AlertTimer time={3000}
                message={item.editWorkStatusErrorMsg}
                type="error"
                showIcon
                onHide={this.hideEditStatusTip.bind(this, item)}/>);
        } else {
            return (
                <div className='handle-work-finish' onClick={this.handleMyWork.bind(this, item)}>
                    <i className='iconfont icon-finish icon-select-member'/>
                    <span className='work-finish-text'>{Intl.get('notification.system.handled', '已处理')}</span>
                </div>);
        }
    }

    hideEditStatusTip = (item) => {
        let myWorkList = this.state.myWorkList;
        _.each(myWorkList, work => {
            if (work.id === item.id) {
                delete work.editWorkStatusErrorMsg;
                return false;
            }
        });
        this.setState({myWorkList});
    }

    handleMyWork = (item) => {
        if (!_.get(item, 'id')) return;
        let myWorkList = this.state.myWorkList;
        _.each(myWorkList, work => {
            if (work.id === item.id) {
                work.isEidtingWorkStatus = true;
                return false;
            }
        });
        this.setState({myWorkList});
        myWorkAjax.handleMyWorkStatus({id: item.id, status: 1}).then(result => {
            if (result) {
                myWorkList = _.filter(myWorkList, work => work.id !== item.id);
                this.setState({myWorkList});
                let workListLength = _.get(myWorkList, 'length');
                //如果当前展示的工作个数小于一页获取的数据，并且小于总工作数时需要继续加载一页数据，以防处理完工作后下面的工作没有及时补上来
                if (workListLength < 20 && workListLength < this.state.totalCount) {
                    this.getMyWorkList();
                }
            } else {
                _.each(myWorkList, work => {
                    if (work.id === item.id) {
                        work.isEidtingWorkStatus = false;
                        work.editWorkStatusErrorMsg = Intl.get('notification.system.handled.error', '处理失败');
                        return false;
                    }
                });
                this.setState({myWorkList});
            }
        }, (errorMsg) => {
            _.each(myWorkList, work => {
                if (work.id === item.id) {
                    work.isEidtingWorkStatus = false;
                    work.editWorkStatusErrorMsg = errorMsg || Intl.get('notification.system.handled.error', '处理失败');
                    return false;
                }
            });
            this.setState({myWorkList});
        });
    }

    renderMyWorkList() {
        return _.map(this.state.myWorkList, (item, index) => {
            return this.renderWorkCard(item, index);
        });
    }

    handleScrollBottom = () => {
        this.getMyWorkList();
    }

    renderWorkContent() {
        let customerOfCurUser = this.state.customerOfCurUser;
        return (
            <div className='my-work-content' style={{height: getColumnHeight()}}>
                <GeminiScrollbar
                    listenScrollBottom={this.state.listenScrollBottom}
                    handleScrollBottom={this.handleScrollBottom}
                    itemCssSelector=".my-work-content .detail-card-container">
                    {this.state.loading && !this.state.load_id ? <Spinner/> : this.renderMyWorkList()}
                </GeminiScrollbar>
                {/*该客户下的用户列表*/}
                <RightPanel
                    className="customer-user-list-panel"
                    showFlag={this.state.isShowCustomerUserListPanel}
                >
                    { this.state.isShowCustomerUserListPanel ?
                        <AppUserManage
                            customer_id={customerOfCurUser.id}
                            hideCustomerUserList={this.closeCustomerUserListPanel}
                            customer_name={customerOfCurUser.name}
                        /> : null
                    }
                </RightPanel>
                {
                    this.state.curShowUserId ?
                        <RightPanel
                            className="app_user_manage_rightpanel white-space-nowrap right-pannel-default right-panel detail-v3-panel"
                            showFlag={this.state.curShowUserId}>
                            <UserDetail userId={this.state.curShowUserId}
                                closeRightPanel={this.closeRightUserPanel}/>
                        </RightPanel>
                        : null
                }
                {this.state.curOpenDetailWork ? this.renderWorkDetail() : null}
            </div>);
    }

    renderWorkDetail() {
        const work = this.state.curOpenDetailWork;
        let detailContent = null;
        const applyInfo = {id: work.related_id, approval_state: '0', topic: work.name};
        switch (work.key) {
            case APPLY_APPROVE_TYPES.BUSINESS_OPPORTUNITIES://销售机会申请
                detailContent = (
                    <OpportunityApplyDetail
                        isHomeMyWork={true}
                        detailItem={applyInfo}
                        applyListType='false'//待审批状态
                        afterApprovedFunc={this.afterFinishWork}
                    />);
                break;
            case APPLY_APPROVE_TYPES.CUSTOMER_VISIT://出差申请
                detailContent = (
                    <CustomerVisitApplyDetail
                        isHomeMyWork={true}
                        detailItem={applyInfo}
                        applyListType='false'//待审批状态
                        afterApprovedFunc={this.afterFinishWork}
                    />);
                break;
            case APPLY_APPROVE_TYPES.PERSONAL_LEAVE://请假申请
                detailContent = (
                    <LeaveApplyDetail
                        isHomeMyWork={true}
                        detailItem={applyInfo}
                        applyListType='false'//待审批状态
                        afterApprovedFunc={this.afterFinishWork}
                    />);
                break;
            case APPLY_APPROVE_TYPES.OPINION_REPORT://舆情报告申请
                detailContent = (
                    <ReportApplyDetail
                        isHomeMyWork={true}
                        detailItem={applyInfo}
                        applyListType='false'//待审批状态
                        afterApprovedFunc={this.afterFinishWork}
                    />);
                break;
            case APPLY_APPROVE_TYPES.DOCUMENT_WRITING://文件撰写申请
                detailContent = (
                    <DocumentApplyDetail
                        isHomeMyWork={true}
                        detailItem={applyInfo}
                        applyListType='false'//待审批状态
                        afterApprovedFunc={this.afterFinishWork}
                    />);
                break;
            default://用户申请（试用、签约用户申请、修改密码、延期、其他）
                detailContent = (
                    <UserApplyDetail
                        isHomeMyWork={true}
                        detailItem={applyInfo}
                        applyListType='false'//待审批状态
                        afterApprovedFunc={this.afterFinishWork}
                    />);
                break;
        }
        return (
            <RightPanelModal
                className="my-work-detail-panel"
                isShowMadal={false}
                isShowCloseBtn={true}
                onClosePanel={this.closeWorkDetailPanel}
                content={detailContent}
                dataTracename="申请详情"
            />);
    }

    afterFinishWork = () => {
        const work = this.state.curOpenDetailWork;
        //过滤掉处理完的工作
        const myWorkList = _.filter(this.state.myWorkList, item => item.id !== work.id);
        this.setState({curOpenDetailWork: null, myWorkList});
    }
    closeWorkDetailPanel = () => {
        this.setState({curOpenDetailWork: null});
    }

    render() {
        let title = Intl.get('home.page.my.work', '我的工作');
        if (this.state.totalCount) {
            title += this.state.totalCount;
        }
        return (
            <ColumnItem contianerClass='my-work-wrap'
                title={title}
                titleHandleElement={this.getWorkTypeDropdown()}
                content={this.renderWorkContent()}
                width='50%'
            />);
    }
}

export default MyWorkColumn;