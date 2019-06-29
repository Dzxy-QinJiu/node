/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2019/6/12.
 */
import '../css/my-work-column.less';
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
import AppUserManage from 'MOD_DIR/app_user_manage/public';
import UserDetail from 'MOD_DIR/app_user_manage/public/views/user-detail';
import {scrollBarEmitter} from 'PUB_DIR/sources/utils/emitters';
//工作类型
const WORK_TYPES = {
    LEAD: 'lead',//待处理线索
    APPLY: 'apply',//申请消息
    SCHEDULE: 'schedule',//待联系的客户:日程
    DEAL: 'deal'// 待处理的订单deal
};
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
            listenScrollBottom: true//是否下拉加载

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

    renderClueCard(item) {
        const clueTitle = (
            <span className='clue-title work-item-title'>
                <i className='iconfont icon-clue work-title-icon'/>
                <span className='work-title-text'>{Intl.get('sales.home.sales.clue', '待处理的线索')}</span>
            </span>);
        const clueContent = (
            <div className='clue-content-wrap'>
                <div className='clue-name work-name'
                    onClick={this.openClueDetail.bind(this, _.get(item, 'clue_id'))}>{_.get(item, 'name', '')}</div>
                <div className='clue-description work-detail'>{_.get(item, 'detail.source', '')}</div>
                {this.renderContactItem(item)}
            </div>);
        return (<DetailCard title={clueTitle}
            content={clueContent}
            className='clue-work-card'/>);
    }

    openClueDetail = (clueId) => {
        if (!clueId) return;
        phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_CLUE_PANEL, {
            clue_params: {
                currentId: clueId,
                // hideRightPanel: this.hideRightPanel,
                // afterDeleteClue: this.afterDeleteClue,
                // removeUpdateClueItem: this.removeUpdateClueItem,
                // updateRemarks: this.updateRemarks
            }
        });
    };


    renderApplyCard(item) {
        const applyTitle = (
            <span className='work-item-title'>
                <i className='iconfont icon-application-ico work-title-icon'/>
                <span className='work-title-text'>{Intl.get('menu.apply.notification', '申请消息')}</span>
            </span>);
        const applyContent = (
            <div className='work-content-wrap'>
                <div className='work-name'>{_.get(item, 'name', '')}</div>
                <div className='work-detail'>
                    <span className='apply-person'>
                        {Intl.get('user.apply.presenter', '申请人')} : {_.get(item, 'detail.applicant.nick_name', '')}
                    </span>
                    <span className='apply-time'>
                        {_.get(item, 'detail.apply_time') ? moment(_.get(item, 'detail.apply_time')).format(oplateConsts.DATE_TIME_FORMAT) : null}
                    </span>
                </div>
                {/*<div className='work-hover-show-detail'></div>*/}
            </div>);
        return (<DetailCard title={applyTitle}
            content={applyContent}
            className='apply-work-card'/>);
    }

    getScheduleShowObj(itemDetail) {
        let scheduleShowOb = {
            iconClass: 'icon-schedule_management-ico',
            title: '',
            startTime: itemDetail.start_time ? moment(itemDetail.start_time).format(oplateConsts.TIME_FORMAT_WITHOUT_SECOND_FORMAT) : '',
            endTime: itemDetail.end_time ? moment(itemDetail.end_time).format(oplateConsts.TIME_FORMAT_WITHOUT_SECOND_FORMAT) : '',
        };
        switch (itemDetail.schedule_type) {
            case 'visit':
                scheduleShowOb.iconClass = 'icon-visit-briefcase';
                scheduleShowOb.title = Intl.get('customer.visit', '拜访');
                break;
            case 'calls':
                scheduleShowOb.iconClass = 'icon-phone-call-out';
                scheduleShowOb.title = Intl.get('crm.schedule.call', '打电话');
                break;
            case 'other':
                scheduleShowOb.iconClass = 'icon-trace-other';
                scheduleShowOb.title = Intl.get('customer.other', '其他');
                break;
        }
        return scheduleShowOb;
    }

    renderScheduleWork(item, index) {
        const scheduleObj = this.getScheduleShowObj(item.detail);
        const title = (
            <span className='clue-title work-item-title'>
                <i className={'iconfont ' + scheduleObj.iconClass}/>
                <span className='work-title-time'>{scheduleObj.startTime} - {scheduleObj.endTime}</span>
                <span className='work-title-text'>{scheduleObj.title}</span>
            </span>);
        const content = (
            <div className='work-content-wrap'>
                {this.renderCustomerName(item, index)}
                <div className='schedule-description work-detail'>
                    {_.get(item, 'detail.remark', '')}
                </div>
                {this.renderContactItem(item)}
            </div>);
        return (<DetailCard title={title}
            content={content}
            className='my-work-card schedule-work'/>);
    }

    //待处理的订单
    renderDealWork(item, index) {
        const clueTitle = (
            <span className='work-item-title'>
                <i className='iconfont icon-deal_manage-ico work-title-icon'/>
                <span className='work-title-text'>{Intl.get('home.page.deal.handle', '待处理的订单')}</span>
            </span>);

        let lastContactTime = _.get(item, 'detail.last_contact_time') ?
            moment(_.get(item, 'detail.last_contact_time')).format(oplateConsts.DATE_TIME_WITHOUT_SECOND_FORMAT) : null;
        const clueContent = (
            <div className='deal-content-wrap'>
                {this.renderCustomerName(item, index)}
                <div className='deal-description work-detail'>
                    {lastContactTime ? <span className='last-contact-time'>{lastContactTime}</span> : null}
                    {_.get(item, 'detail.customer_trace', '')}
                </div>
                {this.renderContactItem(item)}
            </div>);
        return (<DetailCard title={clueTitle}
            content={clueContent}
            className='deal-work-card'/>);
    }

    openCustomerDetail(customerId, index) {
        if (customerId) {
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

    renderCustomerName(item, index) {
        const customer_label = _.get(item, 'detail.customer_label');
        const qualify_label = _.get(item, 'detail.qualify_label');
        const score = _.get(item, 'detail.score');
        const customerId = _.get(item, 'customer_ids[0]');
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
                <span className='customer-name'
                    onClick={this.openCustomerDetail.bind(this, customerId, index)}>{_.get(item, 'name', '')}</span>
                {score ? (
                    <span className='custmer-score'>
                        <i className='iconfont icon-customer-score'/>
                        {score}
                    </span>) : null}
            </div>);
    }

    //联系人及电话的渲染
    renderContactItem(item) {
        let contacts = _.get(item, 'detail.contacts', []);
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

    renderMyWorkList() {
        return _.map(this.state.myWorkList, (item, index) => {
            let workTypeCard;
            switch (item.type) {
                case WORK_TYPES.LEAD:
                    //待处理线索
                    workTypeCard = this.renderClueCard(item);
                    break;
                case WORK_TYPES.APPLY:
                    //申请消息
                    workTypeCard = this.renderApplyCard(item);
                    break;
                case WORK_TYPES.SCHEDULE:
                    //待处理客户（日程）
                    workTypeCard = this.renderScheduleWork(item, index);
                    break;
                case WORK_TYPES.DEAL:
                    //待处理订单
                    workTypeCard = this.renderDealWork(item, index);
                    break;
            }
            return workTypeCard;
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
            </div>);
    }

    render() {
        let title = Intl.get('home.page.my.work', '我的助手');
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