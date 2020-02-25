/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2019/6/12.
 */
import '../css/my-work-column.less';
import classNames from 'classnames';
import {Dropdown, Icon, Menu, Tag, Popover, Button, message, Input, Radio, Form} from 'antd';
const { TextArea } = Input;
const FormItem = Form.Item;
import ColumnItem from './column-item';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import {getColumnHeight} from './common-util';
import myWorkAjax from '../ajax';
import CrmScheduleForm from 'MOD_DIR/crm/public/views/schedule/form';
import { getReportList, getIsNoLongerShowCheckReportNotice, setIsNoLongerShowCheckReportNotice } from 'MOD_DIR/daily-report/utils';
import DetailCard from 'CMP_DIR/detail-card';
import PhoneCallout from 'CMP_DIR/phone-callout';
import Spinner from 'CMP_DIR/spinner';
import crmUtil, {AUTHS, TAB_KEYS} from 'MOD_DIR/crm/public/utils/crm-util';
import {RightPanel} from 'CMP_DIR/rightPanel';
import AlertTimer from 'CMP_DIR/alert-timer';
import AppUserManage from 'MOD_DIR/app_user_manage/public';
import {scrollBarEmitter, myWorkEmitter, notificationEmitter, phoneMsgEmitter, userDetailEmitter} from 'PUB_DIR/sources/utils/emitters';
import UserApplyDetail from 'MOD_DIR/user_apply/public/views/apply-view-detail';
import OpportunityApplyDetail from 'MOD_DIR/sales_opportunity/public/view/apply-view-detail';
import CustomerVisitApplyDetail from 'MOD_DIR/business-apply/public/view/apply-view-detail';
import LeaveApplyDetail from 'MOD_DIR/leave-apply/public/view/apply-view-detail';
import DocumentApplyDetail from 'MOD_DIR/document_write/public/view/apply-view-detail';
import ReportApplyDetail from 'MOD_DIR/report_send/public/view/apply-view-detail';
import VisitApplyDetail from 'MOD_DIR/self_setting/public/view/apply-view-detail';
import DomainApplyDetail from 'MOD_DIR/domain_application/public/view/apply-view-detail';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import {APPLY_APPROVE_TYPES, AUTO_SIZE_MAP, TRACE_NULL_TIP} from 'PUB_DIR/sources/utils/consts';
import DealDetailPanel from 'MOD_DIR/deal_manage/public/views/deal-detail-panel';
import NoDataIntro from 'CMP_DIR/no-data-intro';
import BootProcess from './boot-process/';
import {getTimeStrFromNow, getFutureTimeStr} from 'PUB_DIR/sources/utils/time-format-util';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import RecommendClues from './boot-process/recommend_clues';
import userData from 'PUB_DIR/sources/user-data';
import {getAllSalesUserList} from 'PUB_DIR/sources/utils/common-data-util';
import salesmanAjax from 'MOD_DIR/common/public/ajax/salesman';
import {formatSalesmanList, subtracteGlobalClue} from 'PUB_DIR/sources/utils/common-method-util';
import clueAjax from 'MOD_DIR/clue_customer/public/ajax/clue-customer-ajax';
import AntcDropdown from 'CMP_DIR/antc-dropdown';
import AlwaysShowSelect from 'CMP_DIR/always-show-select';
import Trace from 'LIB_DIR/trace';
import CustomerLabel from 'CMP_DIR/customer_label';
import AddSchedule from 'CMP_DIR/add-schedule';
import ajax from 'ant-ajax';
import CRMAddForm from 'MOD_DIR/crm/public/views/crm-add-form';
import {SELF_SETTING_FLOW} from 'MOD_DIR/apply_approve_manage/public/utils/apply-approve-utils';
import CustomerRecordActions from 'MOD_DIR/crm/public/action/customer-record-action';
import crmPrivilegeConst from 'MOD_DIR/crm/public/privilege-const';
import cluePrivilegeConst from 'MOD_DIR/clue_customer/public/privilege-const';
//工作类型
const WORK_TYPES = {
    LEAD: 'lead',//待处理线索，区分日程是否是线索的类型
    APPLY: 'apply',//申请消息
    SCHEDULE: 'schedule',//待联系的客户:日程
    DEAL: 'deal',// 待处理的订单deal
    CUSTOMER: 'customer'//用来区分日程是否是客户的类型
};
const WORK_DETAIL_TAGS = {
    SCHEDULE: 'schedule',//日程
    APPLY: 'apply',//申请、审批
    LEAD: 'lead',//待处理线索
    DEAL: 'deal',//订单
    CUSTOMER_VISIT: 'customer_visit', //拜访
    MAJOR_CYCLE: 'major_cycle',//大循环
    MEDIUM_CYCLE: 'medium_cycle',//中循环
    MINIONR_CYCLE: 'minor_cycle',//小循环
    DISTRIBUTION: 'distribution',//新分配未联系
    EXPIRED: 'expired',//近期已过期的试用客户（近十天）
    WILLEXPIRE: 'willexpire',//近期已过期的试用客户（近十天）
};
//联系计划类型
const SCHEDULE_TYPES = {
    LEAD_CALLS: 'lead',//线索中打电话的联系计划
    CALLS: 'calls',//客户中打电话的联系计划
    VISIT: 'visit',//拜访
    OTHER: 'other'//其他
};
//申请状态
const APPLY_STATUS = {
    ONGOING: 'ongoing',//待审批
    REJECT: 'reject',//驳回
    PASS: 'pass',//通过
    CANCEL: 'cancel',//撤销
};

const DISTRIBUTEAUTHS = {
    'DISTRIBUTEALL': 'CLUECUSTOMER_DISTRIBUTE_MANAGER',
    'DISTRIBUTESELF': 'CLUECUSTOMER_DISTRIBUTE_USER'
};

class MyWorkColumn extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            curWorkType: '',//当前筛选类型
            myWorkList: [],
            //我的工作类型
            loading: false,
            load_id: '',//用于下拉加载的id
            totalCount: 0,//共多少条工作
            listenScrollBottom: true,//是否下拉加载
            curOpenDetailWork: null,//当前需要打开详情的工作
            handlingWork: null,//当前正在处理的工作（打电话、看详情写跟进）
            isShowRefreshTip: false,//是否展示刷新数据的提示
            isShowAddToDo: false,//是否展示添加日程面板
            isShowRecormendClue: false,//是否展示推荐线索的面板
            guideConfig: [], // 引导流程列表
            userList: [],//分配线索的成员列表
            isEditingItem: {},//正在编辑的拜访类型工作
            recentThreeTraceContent: [],//最近三条拜访记录
            showTraceRecord: false, //是否展示最近三条记录
            currentRecord: {},//跟进内容对象: value: 跟进的值, validateStatus: 验证状态 'success'/'error', errorMsg: 验证错误信息
            currentSelectRecordId: '',//当前从单选框中选择的跟进记录id
        };
    }

    componentDidMount() {
        getReportList(reportList => { this.setState({reportList}); });
        this.getUserList();
        this.getGuideConfig();
        this.getMyWorkList();
        //关闭详情前，已完成工作处理的监听
        myWorkEmitter.on(myWorkEmitter.HANDLE_FINISHED_WORK, this.handleFinishedWork);
        //打通电话或写了跟进、分配线索后，将当前正在处理的工作改为已完成的监听
        myWorkEmitter.on(myWorkEmitter.SET_WORK_FINISHED, this.setWorkFinished);
        //监听推送的申请、审批消息
        notificationEmitter.emit(notificationEmitter.SHOW_UNHANDLE_APPLY_COUNT);
        notificationEmitter.on(notificationEmitter.APPLY_UPDATED, this.updateRefreshMyWork);
        notificationEmitter.on(notificationEmitter.APPLY_UPDATED_REPORT_SEND, this.updateRefreshMyWork);
        notificationEmitter.on(notificationEmitter.APPLY_UPDATED_DOCUMENT_WRITE, this.updateRefreshMyWork);
        notificationEmitter.on(notificationEmitter.APPLY_UPDATED_CUSTOMER_VISIT, this.updateRefreshMyWork);
        notificationEmitter.on(notificationEmitter.APPLY_UPDATED_SALES_OPPORTUNITY, this.updateRefreshMyWork);
        notificationEmitter.on(notificationEmitter.APPLY_UPDATED_LEAVE, this.updateRefreshMyWork);
        notificationEmitter.on(notificationEmitter.APPLY_UPDATED_MEMBER_INVITE, this.updateRefreshMyWork);
        notificationEmitter.on(notificationEmitter.APPLY_UPDATED_VISIT, this.updateRefreshMyWork);
        notificationEmitter.on(notificationEmitter.APPLY_UPDATED_DOMAIN, this.updateRefreshMyWork);
        //监听待处理线索的消息
        notificationEmitter.on(notificationEmitter.UPDATED_MY_HANDLE_CLUE, this.updateRefreshMyWork);
        notificationEmitter.on(notificationEmitter.UPDATED_HANDLE_CLUE, this.updateRefreshMyWork);
    }

    componentWillUnmount() {
        myWorkEmitter.removeListener(myWorkEmitter.HANDLE_FINISHED_WORK, this.handleFinishedWork);
        myWorkEmitter.removeListener(myWorkEmitter.SET_WORK_FINISHED, this.setWorkFinished);
        notificationEmitter.removeListener(notificationEmitter.APPLY_UPDATED, this.updateRefreshMyWork);
        notificationEmitter.removeListener(notificationEmitter.APPLY_UPDATED_REPORT_SEND, this.updateRefreshMyWork);
        notificationEmitter.removeListener(notificationEmitter.APPLY_UPDATED_DOCUMENT_WRITE, this.updateRefreshMyWork);
        notificationEmitter.removeListener(notificationEmitter.APPLY_UPDATED_CUSTOMER_VISIT, this.updateRefreshMyWork);
        notificationEmitter.removeListener(notificationEmitter.APPLY_UPDATED_SALES_OPPORTUNITY, this.updateRefreshMyWork);
        notificationEmitter.removeListener(notificationEmitter.APPLY_UPDATED_LEAVE, this.updateRefreshMyWork);
        notificationEmitter.removeListener(notificationEmitter.APPLY_UPDATED_MEMBER_INVITE, this.updateRefreshMyWork);
        notificationEmitter.removeListener(notificationEmitter.UPDATED_MY_HANDLE_CLUE, this.updateRefreshMyWork);
        notificationEmitter.removeListener(notificationEmitter.UPDATED_HANDLE_CLUE, this.updateRefreshMyWork);
        notificationEmitter.removeListener(notificationEmitter.APPLY_UPDATED_VISIT, this.updateRefreshMyWork);
        notificationEmitter.removeListener(notificationEmitter.APPLY_UPDATED_DOMAIN, this.updateRefreshMyWork);
    }

    // 获取销售人员
    getUserList() {
        // 管理员，运营获取所有人
        if (this.isManagerOrOperation()) {
            getAllSalesUserList((allUserList) => {
                this.setState({userList: allUserList});
            });
        } else if (!userData.getUserData().isCommonSales) {//销售领导获取我所在团队及下级团队的销售
            salesmanAjax.getSalesmanListAjax().sendRequest({filter_manager: true})
                .success(list => {
                    this.setState({userList: list});
                }).error((xhr) => {
                });
        }
    }

    // 是否是管理员或者运营人员
    isManagerOrOperation = () => {
        return userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN) || userData.hasRole(userData.ROLE_CONSTANS.OPERATION_PERSON);
    };

    //修改刷新我的工作的标识
    updateRefreshMyWork = (data) => {
        //不筛选类型时，再展示有新工作的提示
        if (!this.state.curWorkType) {
            this.setState({isShowRefreshTip: true});
        }
    }

    //关闭、切换详情前，已完成工作的处理
    handleFinishedWork = () => {
        let handlingWork = this.state.handlingWork;
        if (handlingWork && handlingWork.isFinished) {
            this.handleMyWork(this.state.handlingWork, true);
        }
    }

    //打通电话或写了跟进、分配线索后，将当前正在处理的工作改为已完成
    setWorkFinished = () => {
        let handlingWork = this.state.handlingWork;
        if (handlingWork) {
            handlingWork.isFinished = true;
            this.setState({handlingWork});
        }
    }

    getGuideConfig() {
        let guideConfig = _.get(userData.getUserData(), 'guideConfig', []);
        this.setState({guideConfig});
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
                console.log(myWorkList);
            }
            let totalCount = _.get(result, 'total', 0);
            let listenScrollBottom = false;
            if (_.get(myWorkList, 'length') < totalCount) {
                listenScrollBottom = true;
            }
            this.setState({
                loading: false,
                isShowRefreshTip: false,
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



    openClueDetail = (clueId, work) => {
        //打开新详情前先将之前已完成的工作处理掉
        this.handleFinishedWork();
        this.setState({handlingWork: work});
        phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_CLUE_PANEL, {
            clue_params: {
                currentId: clueId,
                hideRightPanel: this.hideClueRightPanel,
                afterDeleteClue: this.afterDeleteClue,
                onConvertToCustomerBtnClick: this.onConvertToCustomerBtnClick
            }
        });
    }
    //删除线索之后
    afterDeleteClue = () => {

    };

    openCustomerDetail(customerId, index, work) {
        if (this.state.curShowUserId) {
            this.closeRightUserPanel();
        }
        //是否是待审批的工作
        let isApplyWork = work.type === WORK_TYPES.APPLY && _.get(work, 'apply.opinion') === APPLY_STATUS.ONGOING;
        //打开新详情前先将之前已完成的工作处理掉
        this.handleFinishedWork();
        this.setState({
            curShowCustomerId: customerId,
            selectedLiIndex: index,
            handlingWork: isApplyWork ? null : work,
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

    openCustomerOrClueDetail(id, index, work) {
        if (!id) return;
        //打开线索详情
        if (!_.isEmpty(work.lead)) {
            this.openClueDetail(id, work);
        } else if (!_.isEmpty(work.customer)) {
            //打开客户详情
            this.openCustomerDetail(id, index, work);
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
        //触发打开用户详情面板
        userDetailEmitter.emit(userDetailEmitter.OPEN_USER_DETAIL, {userId: user_id});
    };
    closeRightUserPanel = () => {
        this.setState({
            curShowUserId: '',
            selectedLiIndex: null
        });
    };

    renderWorkName(item, index) {
        let workObj = {};
        let titleTip = '';
        if (!_.isEmpty(item.customer)) {
            workObj = item.customer;
            titleTip = Intl.get('home.page.work.click.tip', '点击查看{type}详情', {type: Intl.get('call.record.customer', '客户')});
        } else if (!_.isEmpty(item.lead)) {
            workObj = item.lead;
            titleTip = Intl.get('home.page.work.click.tip', '点击查看{type}详情', {type: Intl.get('crm.sales.clue', '线索')});
        } else if (item.type === WORK_TYPES.APPLY && _.get(item, 'apply.apply_type') === APPLY_APPROVE_TYPES.PERSONAL_LEAVE) {
            //请假申请
            workObj = {name: Intl.get('leave.apply.leave.application', '请假申请')};
        }
        //客户阶段标签
        const customer_label = workObj.tag;
        //客户合格标签
        // const qualify_label = workObj.qualify_label;
        //分数
        const score = workObj.score;
        //客户id或线索id
        const id = workObj.id;
        const nameCls = classNames('work-name-text', {
            'customer-clue-name': !!id
        });
        return (
            <div className='work-name'>
                <CustomerLabel label={customer_label} />
                <span className={nameCls} title={titleTip}
                    onClick={this.openCustomerOrClueDetail.bind(this, id, index, item)}>
                    {_.get(workObj, 'name', '')}
                </span>
                {score ? (
                    <span className='custmer-score'>
                        <i className='iconfont icon-customer-score'/>
                        {score}
                    </span>) : null}
            </div>);
    }

    //联系人和联系电话
    renderPopoverContent(contacts, item, id, type) {
        return (
            <div className="contacts-containers">
                {_.map(contacts, (contact) => {
                    //只有一个电话的联系人后面紧跟打电话的按钮，不需要展示电话
                    let onlyOnePhone = _.get(contact, 'phone.length') === 1;
                    const cls = classNames('contacts-item', {
                        'def-contact-item': contact.def_contancts === 'true',
                        'only-one-phone-style': onlyOnePhone
                    });
                    return (
                        <div className={cls}>
                            <div className='contacts-name-content'>
                                <i className="iconfont icon-contact-default"/>
                                {contact.name}
                            </div>
                            <div className="contacts-phone-content" data-tracename="联系人电话列表">
                                {_.map(contact.phone, (phone) => {
                                    return (
                                        <div className="phone-item">
                                            <PhoneCallout
                                                phoneNumber={phone}
                                                contactName={contact.name}
                                                showPhoneIcon={true}
                                                hidePhoneNumber={onlyOnePhone}
                                                onCallSuccess={this.onCallSuccess.bind(this, item)}
                                                type={type}
                                                id={id}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    //联系人及电话的渲染
    renderContactItem(item) {
        let contacts = [];
        //打电话时所需的客户/线索id和type
        let id = '';
        let type = '';
        //是否是通过的用户申请
        let isUserApplyPass = false;
        if (item.type === WORK_TYPES.APPLY && _.get(item, `[${WORK_TYPES.APPLY}].opinion`) === APPLY_STATUS.PASS) {
            //签约用户申请、试用用户申请、开通新应用签约用户申请、开通新应用试用用户申请、用户延期申请、修改密码申请、禁用用户申请、其他申请
            const USER_APPLY_TYPES = ['apply_user_official', 'apply_user_trial', 'apply_app_official', 'apply_app_trial',
                'apply_grant_delay_multiapp', 'apply_pwd_change', 'apply_grant_status_change_multiapp', 'apply_sth_else'];
            let applyType = _.get(item, 'apply.apply_type');
            if (applyType && _.includes(USER_APPLY_TYPES, applyType)) {
                isUserApplyPass = true;
            }
        }
        //拜访类型的时候不展示打电话的图标
        if (item.type === WORK_TYPES.CUSTOMER && !_.includes(item.tags, WORK_DETAIL_TAGS.CUSTOMER_VISIT) || isUserApplyPass) {
            contacts = _.get(item, 'customer.contacts', []);
            type = 'customer';
            id = _.get(item, 'customer.id', '');
        } else if (item.type === WORK_TYPES.LEAD) {
            contacts = _.get(item, 'lead.contacts', []);
            type = 'lead';
            id = _.get(item, 'lead.id', '');
        }
        let phones = [];
        _.each(contacts, contact => {
            if (_.get(contact, 'phone[0]')) {
                phones.push(contact.phone);
            }
        });
        //将各个电话数组整合到一个数组中进行判断
        let phoneNumArray = _.flatten(phones);
        if (!_.isEmpty(contacts) && !_.isEmpty(phoneNumArray)) {
            let contactsContent = this.renderPopoverContent(contacts, item, id, type);
            let phoneCount = _.get(phoneNumArray, 'length');
            let phoneContactName = '';
            //只有一个电话时，点击拨号按钮可以直接拨打出去
            if (phoneCount === 1) {
                let contact = _.find(contacts, con => _.includes(con.phone, phoneNumArray[0]));
                phoneContactName = _.get(contact, 'name', '');
            }
            return (
                <div className='work-hover-show-detail' onClick={this.preventOpenDetail}>
                    {phoneCount === 1 ? (
                        <span className='work-contact-phone only-one-phone-btn'>
                            <PhoneCallout
                                phoneNumber={phoneNumArray[0]}
                                contactName={phoneContactName}
                                showPhoneIcon={true}
                                hidePhoneNumber={true}
                                onCallSuccess={this.onCallSuccess.bind(this, item)}
                                type={type}
                                id={id}
                            />
                        </span>
                    ) : (
                        <Popover content={contactsContent} placement="bottom"
                            overlayClassName='contact-phone-popover'
                            getPopupContainer={() => document.getElementById(`home-page-work${item.id}`)}>
                            <span className='work-contact-phone'>
                                <i className="iconfont icon-active-call-records-ico"/>
                            </span>
                        </Popover>)}
                </div>);
        }
    }

    preventOpenDetail = (event) => {
        if (event) {
            event.stopPropagation();
        }
    }

    //拨打电话成功后，记住当前正在拨打电话的工作,以便打通电话写完跟进后将此项工作去掉
    onCallSuccess(item) {
        //线索中拨打电话时
        if (item.type === WORK_TYPES.LEAD) {
            this.openClueDetail(_.get(item, 'lead.id'), item);
        } else {
            //打开新电话弹屏前先将之前已完成的工作处理掉
            this.handleFinishedWork();
            this.setState({handlingWork: item});
        }
    }

    //是否是已审批的申请
    isApprovedApply(item) {
        let applyStatus = _.get(item, `[${WORK_TYPES.APPLY}].opinion`);
        return item.type === WORK_TYPES.APPLY && applyStatus === APPLY_STATUS.PASS || applyStatus === APPLY_STATUS.REJECT;
    }

    //能否打开工作详情
    enableOpenWorkDetail(item) {
        //订单详情、已审批的申请详情能否打开的判断
        return _.includes(item.tags, WORK_TYPES.DEAL) || this.isApprovedApply(item);
    }

    //添加跟进记录
    addVisitTrace(item, event) {
        if(event){
            event.stopPropagation();
            Trace.traceEvent(event, '点击添加跟进记录按钮');
        }

        //获取客户跟踪列表
        //只获取前三条
        let queryObj = {
            page_size: 3
        };
        let bodyData = {
            customer_id: _.get(item, 'customer_visit.id', ''),
            type: 'visit'
        };
        CustomerRecordActions.getCustomerTraceList(queryObj, bodyData, (result) => {
            this.setState({
                recentThreeTraceContent: result.result
            });
        });
        this.setState({
            isEditingItem: item,
            showTraceRecord: false
        });
    }

    //取消编辑跟进内容
    hideTraceAddingContent() {
        this.setState({
            isEditingItem: {},
            recentThreeTraceContent: [],
            showTraceRecord: false,
            currentRecord: {}
        });
    }

    //展示最近三条跟进记录
    toggleShowingRecentThreeTraceRecord() {
        let showTraceRecord = this.state.showTraceRecord;
        this.setState({
            showTraceRecord: !showTraceRecord
        });
    }

    //渲染最近三条跟进记录
    renderRecentThreeRecord() {
        let records = this.state.recentThreeTraceContent;
        let radios = _.map(records, record => {
            return(<Radio id={record.id} value={record.remark}>{record.remark}</Radio>);
        });
        return (
            <Radio.Group onChange={this.onSelectRecord.bind(this)}>
                {radios}
            </Radio.Group>
        );
    }

    onSelectRecord(e) {
        let currentRecord = _.cloneDeep(this.state.currentRecord);
        currentRecord.value = e.target.value;
        this.setState({
            currentRecord,
            currentSelectRecordId: e.target.id
        });
    }

    onRecordChange(e) {
        let currentRecord = _.cloneDeep(this.state.currentRecord);
        currentRecord.value = e.target.value;
        this.setState({
            currentRecord
        });
    }

    deleteVisitWork(currentWork) {
        let myWorkList = _.filter(_.get(this.state, 'myWorkList',[]), work => {
            return !_.isEqual(work.id, currentWork.id);
        });
        this.setState({
            myWorkList
        });
    }

    //保存跟进内容
    saveTraceContent() {
        let trace = _.cloneDeep(this.state.currentRecord);
        let curRecord = this.state.isEditingItem;
        if(!_.isEmpty(trace.value)) {
            //判断当前是从单选框中选择的跟进记录还是自己手动输入的跟进记录
            //如果有当前选择的跟进记录的id，则识别为更新记录
            if(!_.isEmpty(_.get(this.state, 'currentSelectRecordId', ''))) {
                let queryObj = {
                    id: _.get(this.state, 'currentSelectRecordId'),
                    customer_id: _.get(curRecord, 'customer_visit.id', ''),
                    type: 'visit',
                    remark: trace.value,
                    apply_id: _.get(curRecord, 'apply.id', '')
                };
                CustomerRecordActions.updateCustomerTrace(queryObj, () => {
                    trace.validateStatus = 'success';
                    trace.errorMsg = null;
                    this.deleteVisitWork(curRecord);
                }, (errorMsg) => {
                    trace.validateStatus = 'error';
                    trace.errorMsg = errorMsg;
                });
            } else { //添加跟进记录
                let queryObj = {
                    customer_id: _.get(curRecord, 'customer_visit.id', ''),
                    type: 'visit',
                    remark: trace.value,
                    apply_id: _.get(curRecord, 'apply.id', '')
                };
                CustomerRecordActions.addCustomerTrace(queryObj, () => {
                    trace.validateStatus = 'success';
                    trace.errorMsg = null;
                    this.deleteVisitWork(curRecord);
                },(errorMsg) => {
                    trace.validateStatus = 'error';
                    trace.errorMsg = errorMsg;
                });
            }
        } else {
            trace.validateStatus = 'error';
            trace.errorMsg = TRACE_NULL_TIP;
        }
        this.setState({
            currentRecord: trace
        });
    }

    //渲染添加跟进记录内容
    renderTraceAddingContent() {
        let arrowCls = classNames('iconfont', {
            'icon-arrow-up': this.state.showTraceRecord,
            'icon-arrow-down': !this.state.showTraceRecord
        });
        return(
            <div className='visit-add-container'>
                <div className='visit-add-textarea'>
                    <Form className="add-customer-trace">
                        <FormItem
                            validateStatus={_.get(this.state, 'currentRecord.validateStatus', 'success')}
                            help={_.get(this.state, 'currentRecord.errorMsg', '')}
                        >
                            <TextArea
                                placeholder={Intl.get('home.page.my.work.add.visit.trace.content', '添加拜访内容')}
                                value={_.get(this.state, 'currentRecord.value')}
                                onChange={this.onRecordChange.bind(this)}
                                autoFocus={true}
                                autosize={AUTO_SIZE_MAP}
                            />
                        </FormItem>
                    </Form>
                </div>
                <div className='visit-add-options'>
                    {!_.isEmpty(_.get(this.state, 'recentThreeTraceContent', [])) ?
                        <div className='recent-three-traces' onClick={this.toggleShowingRecentThreeTraceRecord.bind(this)}>
                            <div className='traces-tip'>
                                {Intl.get('home.page.my.work.select.from.trace,record', '从拜访跟进记录中选择')}
                            </div>
                            <div className={arrowCls}></div>
                        </div> : null
                    }
                    <div className='visit-add-btns'>
                        <Button type="primary" onClick={this.saveTraceContent.bind(this)}>{Intl.get('home.page.my.work.save.visit.trace.content', '保存拜访记录')}</Button>
                        <Button onClick={this.hideTraceAddingContent.bind(this)}>{Intl.get('common.cancel', '取消')}</Button>
                    </div>
                </div>
                {this.state.showTraceRecord ? this.renderRecentThreeRecord() : null}
            </div>
        );
    }

    getScheduleType(type) {
        let typeDescr = '';
        switch (type) {
            case 'visit'://客户拜访的日程类型
                typeDescr = Intl.get('customer.visit', '拜访');
                break;
            case 'calls'://客户打电话的日程类型
                typeDescr = Intl.get('crm.schedule.call', '打电话');
                break;
            case 'lead'://线索打电话的日程类型
                typeDescr = Intl.get('crm.schedule.call', '打电话');
                break;
            case 'other'://其他
                typeDescr = '';
                break;
        }
        return typeDescr;
    }

    getApplyType(type) {
        const APPLY_TYPE_MAP = {
            'visitapply': Intl.get('apply.my.self.setting.work.flow', '拜访申请'),
            'business_opportunities': Intl.get('leave.apply.sales.oppotunity', '机会申请'),
            'customer_visit': Intl.get('leave.apply.add.leave.apply', '出差申请'),
            'personal_leave': Intl.get('leave.apply.leave.application', '请假申请'),
            'opinion_report': Intl.get('home.page.user.application.for', '{type}申请', {type: Intl.get('apply.approve.lyrical.report', '舆情报告')}),
            'document_writing': Intl.get('home.page.user.application.for', '{type}申请', {type: Intl.get('apply.approve.document.writing', '文件撰写')}),
            'domainName': Intl.get('apply.domain.application.work.flow', '舆情平台申请'),
            'apply_user_official': Intl.get('home.page.user.formal.apply', '签约用户申请'),
            'apply_user_trial': Intl.get('home.page.user.trial.apply', '试用用户申请'),
            'apply_app_official': Intl.get('home.page.user.formal.apply', '签约用户申请'),
            'apply_app_trial': Intl.get('home.page.user.trial.apply', '试用用户申请'),
            'apply_grant_delay_multiapp': Intl.get('home.page.user.delay.apply', '用户延期申请'),
            'apply_pwd_change': Intl.get('home.page.user.password.apply', '修改密码申请'),
            'apply_grant_status_change_multiapp': Intl.get('home.page.user.status.apply', '禁用用户申请'),
            'apply_sth_else': Intl.get('home.page.user.other.apply', '其他申请')
        };
        let typeDescr = APPLY_TYPE_MAP[type];
        return typeDescr;
    }

    getApplyRemark(item, tag) {
        let remark = '';
        //businesstrip_awhile：外出申请 domainName: 域名申请 visitapply： 拜访申请（除识微域外）/联合跟进申请（识微域） 类型的申请会返回apply_type_name字段，展示申请类型的描述，其他类型用原来的映射
        let type = _.get(item,`[${tag}].apply_type_name`) || this.getApplyType(_.get(item, `[${tag}].apply_type`, ''));
        switch (_.get(item, `[${tag}].opinion`, '')) {
            case APPLY_STATUS.ONGOING://待审批
                remark = _.get(item, `[${tag}].applicant`, '') + ' ' + type;
                break;
            case APPLY_STATUS.PASS://通过
                remark = Intl.get('home.page.approve.pass.tip', '{user}通过了您的{applyType}', {
                    user: _.get(item, `[${tag}].approver`, ''),
                    applyType: type
                });
                break;
            case APPLY_STATUS.REJECT://驳回
                remark = Intl.get('home.page.approve.reject.tip', '{user}驳回了您的{applyType}', {
                    user: _.get(item, `[${tag}].approver`, ''),
                    applyType: type
                });
                break;
            case APPLY_STATUS.CANCEL://撤销
                remark = Intl.get('home.page.approve.cancel.tip', '{user}撤回了{applyType}', {
                    user: _.get(item, `[${tag}].applicant`, ''),
                    applyType: type
                });
                break;
        }
        return remark;
    }

    getLastTrace(item) {
        return moment(_.get(item, 'customer.last_contact_time')).format(oplateConsts.DATE_TIME_WITHOUT_SECOND_FORMAT) + ' ' + _.get(item, 'customer.customer_trace', '');
    }

    renderWorkRemarks(tag, item, index) {
        let tagDescr = '', remark = '', startTime = '', endTime = '', type = '';
        switch (tag) {
            case WORK_DETAIL_TAGS.SCHEDULE://日程
                tagDescr = Intl.get('menu.shortName.schedule', '日程');
                startTime = _.get(item, `[${tag}].start_time`) ? moment(item[tag].start_time).format(oplateConsts.HOUR_MUNITE_FORMAT) : '';
                endTime = _.get(item, `[${tag}].end_time`) ? moment(item[tag].end_time).format(oplateConsts.HOUR_MUNITE_FORMAT) : '';
                type = this.getScheduleType(_.get(item, `[${tag}].schedule_type`, ''));
                //xxx-xxx 打电话 联系内容的备注
                remark = startTime + ' - ' + endTime + ' ';
                if (type) {
                    remark += type + ' ';
                }
                remark += _.get(item, `[${tag}].content`);
                break;
            case WORK_DETAIL_TAGS.APPLY://申请、审批
                tagDescr = Intl.get('home.page.apply.type', '申请');
                //xxx 试用用户申请
                //xxx 驳回了您的 试用用户申请
                remark = this.getApplyRemark(item, tag);
                break;
            case WORK_DETAIL_TAGS.LEAD://待处理线索
                tagDescr = Intl.get('home.page.new.clue', '新线索');
                //线索描述
                remark = _.get(item, `[${tag}].source`, '');
                break;
            case WORK_DETAIL_TAGS.DEAL://订单
                tagDescr = Intl.get('user.apply.detail.order', '订单');
                //订单预算
                remark = Intl.get('leave.apply.buget.count', '预算') + ': ' + Intl.get('contract.159', '{num}元', {num: _.get(item, `[${tag}].budget`, '0')});
                break;
            case WORK_DETAIL_TAGS.MAJOR_CYCLE://大循环设置的联系频率
                tagDescr = Intl.get('home.page.contact.great.cycle', '大循环');
                //最后一次跟进时间与跟进内容
                remark = this.getLastTrace(item);
                break;
            case WORK_DETAIL_TAGS.MEDIUM_CYCLE://中循环设置的联系频率
                tagDescr = Intl.get('home.page.contact.medium.cycle', '中循环');
                //最后一次跟进时间与跟进内容
                remark = this.getLastTrace(item);
                break;
            case WORK_DETAIL_TAGS.MINIONR_CYCLE://小循环设置的联系频率
                tagDescr = Intl.get('home.page.contact.minor.cycle', '小循环');
                //最后一次跟进时间与跟进内容
                remark = this.getLastTrace(item);
                break;
            case WORK_DETAIL_TAGS.DISTRIBUTION://新分配未联系
                tagDescr = Intl.get('home.page.new.customer', '新客户');
                break;
            case WORK_DETAIL_TAGS.WILLEXPIRE://即将到期
                tagDescr = Intl.get('home.page.will.expire.customer', '即将到期');
                //xxx时间到期
                remark = this.getExpireTip(item, tag);
                break;
            case WORK_DETAIL_TAGS.EXPIRED://已到期
                tagDescr = Intl.get('home.page.expired.customer', '已过期');
                //xxx时间已到期
                remark = this.getExpireTip(item, tag);
                break;
            case WORK_DETAIL_TAGS.CUSTOMER_VISIT: //拜访
                tagDescr = Intl.get('common.visit', '拜访');
                remark = this.getVisitTip(item);
                break;
        }
        return (
            // 对于拜访类型的工作，后端tags字段会返回['APPLY', 'customer_visit']
            // 这里的'APPLY'是后端用来标识工作不做合并的操作，前端遇到这样的tags自己处理为空
            _.isEmpty(tagDescr) && _.isEmpty(remark) ? null :
                <div className='work-remark-content'>
                    【{tagDescr}】{remark}
                </div>
        );
    }

    getExpireTip(item, tag) {
        let time = _.get(item, `[${tag}][0].end_date`), timeStr = '';
        if (tag === WORK_DETAIL_TAGS.WILLEXPIRE) {
            //今天、明天、后天、xxx天后到期
            timeStr = getFutureTimeStr(time);
        } else if (tag === WORK_DETAIL_TAGS.EXPIRED) {
            //今天、昨天、前天、xxx天前到期
            timeStr = getTimeStrFromNow(time);
        }
        return _.get(item, `[${tag}][0].user_name`, '') + ' ' + timeStr + ' ' + Intl.get('apply.delay.endTime', '到期');
    }

    getVisitTip(item) {
        let customerVisit = item.customer_visit;
        let startTime = customerVisit.visit_time.start.split('_');
        let timePeriod = _.isEqual(startTime[1], 'AM') ? Intl.get('apply.approve.leave.am', '上午') : Intl.get('apply.approve.leave.pm', '下午');
        let date = startTime[0].split('-');
        let tip = Intl.get('home.page.my.work.visit.tips', '{month}月{day}日{time}拜访客户', {month: date[1], day: date[2],time: timePeriod});
        let city = _.get(customerVisit, 'city') ? `/${customerVisit.city}` : '';
        let county = _.get(customerVisit, 'county') ? `/${customerVisit.county}` : '';
        let address = '';
        if(customerVisit.province || city || county || customerVisit.address) {
            address = `, ${Intl.get('common.address', '地址')}: ${customerVisit.province}${city}${county} ${customerVisit.address}`;
        }
        return `${tip}${address}`;
    }

    renderWorkCard(item, index) {
        const contentCls = classNames('work-content-wrap', {
            'open-work-detail-style': this.enableOpenWorkDetail(item)
        });
        let clickTip = '';
        let openWorkDetailFunc = () => {
        };
        if (this.enableOpenWorkDetail(item)) {
            openWorkDetailFunc = this.openWorkDetail;
            const isDealWork = _.includes(item.tags, WORK_TYPES.DEAL);
            //订单、通过、驳回工作需要点击工作打开订单详情
            if (isDealWork) {
                clickTip = Intl.get('home.page.work.click.tip', '点击查看{type}详情', {type: Intl.get('user.apply.detail.order', '订单')});
            } else {
                clickTip = Intl.get('home.page.work.click.tip', '点击查看{type}详情', {type: Intl.get('home.page.apply.type', '申请')});
            }
        }
        let hoverCls = classNames('my-work-item-hover', {'hide-my-work-item-hover': _.isEqual(_.get(this.state, 'isEditingItem.id'), _.get(item, 'id'))});
        return (
            <div className='my-work-card-container'>
                <div className={contentCls} id={`home-page-work${item.id}`}>
                    <div onClick={openWorkDetailFunc.bind(this, item)}
                        title={clickTip}>
                        {this.renderWorkName(item, index)}
                        {_.isEqual(_.get(this.state, 'isEditingItem.id'), _.get(item, 'id')) ? this.renderTraceAddingContent() :
                            <div className='work-remark'>
                                {_.map(item.tags, (tag, index) => this.renderWorkRemarks(tag, item, index))}
                            </div>
                        }
                    </div>
                    <div className={hoverCls}>
                        {this.renderContactItem(item)}
                        {this.renderHandleWorkBtn(item)}
                    </div>
                </div>
            </div>);
    }

    //打开工作详情
    openWorkDetail = (item, event) => {
        //点击到客户名或线索名时，打开客户或线索详情，不触发打开工作详情的处理
        if (event) {
            event.stopPropagation();
            if ($(event.target).hasClass('customer-clue-name')) return;
            Trace.traceEvent(event, '点击审批按钮');
        }
        //打开申请详情
        this.setState({curOpenDetailWork: item});
    }
    //获取已选销售的id
    onSalesmanChange = (salesMan) => {
        this.setState({salesMan});
    };
    setSelectContent = (salesManNames) => {
        this.setState({salesManNames});
    };
    clearSelectSales = () => {
        this.setState({salesMan: '', salesManNames: ''});
    };
    renderSalesBlock = () => {
        //主管分配线索时，负责人是自己的不能分配给自己
        let userList = _.cloneDeep(this.state.userList);
        userList = _.filter(userList, user => !_.isEqual(_.get(user, 'user_info.user_id'), userData.getUserData().user_id));
        let dataList = formatSalesmanList(userList);
        return (
            <div className="op-pane change-salesman">
                <AlwaysShowSelect
                    placeholder={Intl.get('sales.team.search', '搜索')}
                    value={this.state.salesMan}
                    onChange={this.onSalesmanChange}
                    getSelectContent={this.setSelectContent}
                    notFoundContent={dataList.length ? Intl.get('crm.29', '暂无销售') : Intl.get('crm.30', '无相关销售')}
                    dataList={dataList}
                />
            </div>
        );
    };
    //分配线索时，发请求前的处理
    handleBeforeSumitChangeSales = (itemId) => {
        if (!this.state.salesMan) {
            this.setState({unSelectDataTip: Intl.get('crm.17', '请选择销售人员')});
        } else {
            let sale_id = '', team_id = '', sale_name = '', team_name = '';
            //销售id和所属团队的id 中间是用&&连接的  格式为销售id&&所属团队的id
            let idArray = this.state.salesMan.split('&&');
            if (_.isArray(idArray) && idArray.length) {
                sale_id = idArray[0];//销售的id
                team_id = idArray[1] || '';//团队的id
            }
            //销售的名字和团队的名字 格式是 销售名称 -团队名称
            let nameArray = this.state.salesManNames.split('-');
            if (_.isArray(nameArray) && nameArray.length) {
                sale_name = nameArray[0];//销售的名字
                team_name = _.trim(nameArray[1]) || '';//团队的名字
            }
            var submitObj = {
                'sale_id': sale_id,
                'sale_name': sale_name,
                'team_id': team_id,
                'team_name': team_name,
            };
            if (itemId) {
                submitObj.customer_id = itemId;
            }
            return submitObj;
        }
    };
    handleSubmitAssignSales = (item) => {
        let submitObj = this.handleBeforeSumitChangeSales(item.lead.id);
        if (_.isEmpty(submitObj)) {
            return;
        } else {
            this.setState({distributeLoading: true});
            clueAjax.distributeCluecustomerToSale(submitObj).then((result) => {
                this.setState({distributeLoading: false});
                this.handleMyWork(item, true);
            }, (errorMsg) => {
                this.setState({distributeLoading: false});
                message.error(errorMsg || Intl.get('failed.distribute.cluecustomer.to.sales', '把线索客户分配给对应的销售失败'));
            });
        }
    };

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
            //不是普通销售的线索类型，需要展示分配按钮（线索tags中需要有lead，线索的日程不需要要展示分配按钮）
            if (item.type === WORK_TYPES.LEAD && _.includes(item.tags, WORK_TYPES.LEAD) && !userData.getUserData().isCommonSales) {
                const distributeBtn = (
                    <div className='handle-work-finish' data-tracename="点击分配线索按钮">
                        <span className='work-finish-text approval-btn'>
                            {Intl.get('clue.customer.distribute', '分配')}
                        </span>
                    </div>);
                return (<AntcDropdown content={distributeBtn} key={`antc-dropdwon${item.id}`}
                    datatraceContainer='我的工作线索分配按钮'
                    triggerEventStr='hover'
                    popupContainerId={`home-page-work${item.id}`}
                    overlayTitle={Intl.get('user.salesman', '销售人员')}
                    okTitle={Intl.get('common.confirm', '确认')}
                    cancelTitle={Intl.get('common.cancel', '取消')}
                    isSaving={this.state.distributeLoading}
                    overlayContent={this.renderSalesBlock()}
                    handleSubmit={this.handleSubmitAssignSales.bind(this, item)}
                    unSelectDataTip={this.state.unSelectDataTip}
                    clearSelectData={this.clearSelectSales}
                    btnAtTop={false}/>);
            } else {
                let handleFunc = null;
                let btnCls = 'work-finish-text';
                let btnTitle = '';
                let btnDesc = '';
                //申请、审批
                if (item.type === WORK_TYPES.APPLY) {
                    let applyStatus = _.get(item, `[${WORK_TYPES.APPLY}].opinion`);
                    btnCls += ' approval-btn';
                    //待审批的申请
                    if (applyStatus === APPLY_STATUS.ONGOING) {
                        // 展示审批按钮
                        handleFunc = this.openWorkDetail;
                        btnDesc = Intl.get('home.page.apply.approve', '审批');
                    } else {//已审批的申请（通过、驳回、撤销），展示知道了按钮
                        handleFunc = this.handleMyWork;
                        btnDesc = Intl.get('guide.finished.know', '知道了');
                    }
                } else if(item.type === WORK_TYPES.CUSTOMER && _.includes(item.tags, WORK_DETAIL_TAGS.CUSTOMER_VISIT)) { //出差提醒
                    btnCls += ' ant-btn ant-btn-primary visit-btn';
                    handleFunc = this.addVisitTrace;
                    btnDesc = Intl.get('home.page.my.work.visit.finished', '我已拜访');
                } else {//其他的展示对号已完成的按钮
                    handleFunc = this.handleMyWork;
                    btnTitle = Intl.get('home.page.my.work.finished', '点击设为已完成');
                    btnDesc = (<i className="iconfont icon-select-member"/>);
                }
                return (
                    <div className='handle-work-finish' onClick={handleFunc.bind(this, item)}>
                        <span className={btnCls} title={btnTitle}>
                            {btnDesc}
                        </span>
                    </div>);
            }
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

    handleMyWork = (item, omitAjax, event) => {
        if (event) {
            event.stopPropagation();
            Trace.traceEvent(event, '点击我已完成的按钮');
        }
        if (!_.get(item, 'id')) return;
        let myWorkList = this.state.myWorkList;
        _.each(myWorkList, work => {
            if (work.id === item.id) {
                work.isEidtingWorkStatus = true;
                return false;
            }
        });
        this.setState({myWorkList});
        if(_.isBoolean(omitAjax) && omitAjax) {
            this.filterMyWork(myWorkList, item);
        } else {
            //status '1':已处理, '0'待处理
            myWorkAjax.handleMyWorkStatus({id: item.id, status: '1'}).then(result => {
                if (result) {
                    this.filterMyWork(myWorkList, item);
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
    }

    filterMyWork(myWorkList, item) {
        //过滤掉已处理的工作
        var targetObj = _.find(myWorkList, work => work.id === item.id);
        myWorkList = _.filter(myWorkList, work => work.id !== item.id);
        //已处理的工作就是之前记录的正在处理的工作，将正在处理的工作置空
        let handlingWork = this.state.handlingWork;
        if (handlingWork && item.id === handlingWork.id) {
            handlingWork = null;
        }
        this.setState({myWorkList, handlingWork});
        let workListLength = _.get(myWorkList, 'length');
        //如果当前展示的工作个数小于一页获取的数据，并且小于总工作数时需要继续加载一页数据，以防处理完工作后下面的工作没有及时补上来
        if (workListLength < 20 && workListLength < this.state.totalCount) {
            this.getMyWorkList();
        }
        //如果是处理的线索，处理完后线索左边的数字要减一
        var leadId = _.get(targetObj,'lead.id','');
        if(leadId){
            subtracteGlobalClue({id: leadId});
        }
    }


    renderMyWorkList() {
        //等待效果的渲染
        if (this.state.loading && !this.state.load_id) {
            return <Spinner className='home-loading'/>;
        } else {
            let workList = [];
            //有新工作，请刷新后再处理
            if (this.state.isShowRefreshTip) {
                workList.push(
                    <div className="refresh-data-tip">
                        <ReactIntl.FormattedMessage
                            id="home.page.new.work.tip"
                            defaultMessage={'工作有变动，点此{refreshTip}'}
                            values={{
                                'refreshTip': <a
                                    onClick={this.refreshMyworkList}>{Intl.get('common.refresh', '刷新')}</a>
                            }}
                        />
                    </div>);
            }

            const isShowCheckReportNotice = !getIsNoLongerShowCheckReportNotice();

            //没数据时的渲染,
            if (_.isEmpty(this.state.myWorkList)) {
                if (isShowCheckReportNotice) {
                    this.renderCheckReportNotice(workList);
                //需判断是否还有引导流程,没有时才显示无数据
                } else if (_.isEmpty(this.state.guideConfig)) {
                    workList.push(
                        <NoDataIntro
                            noDataAndAddBtnTip={Intl.get('home.page.no.work.tip', '暂无工作')}
                            renderAddAndImportBtns={this.renderAddAndImportBtns}
                            showAddBtn={true}
                            noDataTip={Intl.get('home.page.no.work.tip', '暂无工作')}
                        />);
                }
            } else {//工作列表的渲染
                if (isShowCheckReportNotice) {
                    this.renderCheckReportNotice(workList);
                }

                _.each(this.state.myWorkList, (item, index) => {
                    workList.push(this.renderWorkCard(item, index));
                });
            }
            return workList;
        }
    }

    renderCheckReportNotice(workList) {
        let item = {};

        workList.push(this.renderWorkCard(item));
    }

    showAddSchedulePanel = (event) => {
        if (event) {
            Trace.traceEvent(event, '点击添加日程');
        }
        this.setState({isShowAddToDo: true});
    }
    showRecommendCluePanel = (event) => {
        if (event) {
            Trace.traceEvent(event, '点击推荐线索');
        }
        this.setState({isShowRecormendClue: true});
    }
    renderAddAndImportBtns = () => {
        if (hasPrivilege(crmPrivilegeConst.CUSTOMER_ADD)) {
            return (
                <div className="btn-containers">
                    <Button type='primary' className='import-btn'
                        onClick={this.showAddSchedulePanel}>{Intl.get('home.page.add.schedule', '添加日程')}</Button>
                    {!userData.hasRole(userData.ROLE_CONSTANS.OPERATION_PERSON) && hasPrivilege(cluePrivilegeConst.CURTAO_CRM_COMPANY_STORAGE) ? (
                        <Button className='add-clue-btn'
                            onClick={this.showRecommendCluePanel}>{Intl.get('clue.customer.recommend.clue.lists', '推荐线索')}</Button>
                    ) : null}
                </div>
            );
        } else {
            return null;
        }
    };
    closeGuidDetailPanel = () => {
        this.setState({isShowRecormendClue: false});
    };

    // 提取线索
    renderExtractClue() {
        if (!this.state.isShowRecormendClue) return null;
        let detailContent = (
            <RecommendClues
                onClosePanel={this.closeGuidDetailPanel}
            />);
        return (
            <RightPanelModal
                isShowMadal
                isShowCloseBtn
                onClosePanel={this.closeGuidDetailPanel}
                content={detailContent}
                dataTracename="推荐线索"
            />
        );
    }

    refreshMyworkList = () => {
        this.setState({
            load_id: '',
            isShowRefreshTip: false,
        }, () => {
            this.getMyWorkList();
        });
    }
    handleScrollBottom = () => {
        this.getMyWorkList();
    }

    // 关闭引导
    closeGuideMark = (key) => {
        let list = _.filter(this.state.guideConfig, guide => key !== guide.content);
        this.setState({guideConfig: list}, () => {
            userData.setUserData('guideConfig', list);
        });
    };

    renderBootProcessBlock = () => {
        if (_.isEmpty(this.state.guideConfig)) {
            return null;
        } else {
            return (
                <BootProcess
                    guideConfig={this.state.guideConfig}
                    closeGuideMark={this.closeGuideMark}
                />
            );
        }
    };

    renderWorkContent() {
        let customerOfCurUser = this.state.customerOfCurUser;
        return (
            <div className='my-work-content' style={{height: getColumnHeight()}} data-tracename="我的工作列表">
                <GeminiScrollbar className="srollbar-out-card-style"
                    listenScrollBottom={this.state.listenScrollBottom}
                    handleScrollBottom={this.handleScrollBottom}
                    itemCssSelector=".my-work-content .detail-card-container">
                    {this.renderBootProcessBlock()}
                    {this.renderMyWorkList()}
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
                {this.state.curOpenDetailWork ? this.renderWorkDetail() : null}
                {/*添加日程*/}
                <AddSchedule 
                    isShowAddToDo={this.state.isShowAddToDo}
                    handleCancelAddToDo={this.handleCancel}
                    handleScheduleAdd={this.afterAddSchedule}
                />
                {this.renderExtractClue()}
            </div>);
    }

    afterAddSchedule = () => {
        setTimeout(() => {
            this.refreshMyworkList();
        }, 1500);
    }

    //处理添加日程的关闭事件
    handleCancel = () => {
        this.setState({
            isShowAddToDo: false
        });
    };

    renderWorkDetail() {
        const work = this.state.curOpenDetailWork;
        //订单详情
        if (_.includes(work.tags, WORK_TYPES.DEAL)) {
            return (
                <DealDetailPanel
                    currDealId={_.get(work, 'deal.id')}
                    hideDetailPanel={this.closeWorkDetailPanel}/>);
        } else {//申请详情
            let detailContent = null;
            const applyInfo = {
                id: _.get(work, 'apply.id'),
                approval_state: '0',
                //businesstrip_awhile：外出申请 domainName: 域名申请 visitapply： 拜访申请（除识微域外）/联合跟进申请（识微域） 类型的申请会返回apply_type_name字段，展示申请类型的描述，其他类型用原来的映射
                topic: _.get(work,'apply.apply_type_name') || this.getApplyType(_.get(work, 'apply.apply_type', ''))
            };
            switch (_.get(work, 'apply.apply_type')) {
                case SELF_SETTING_FLOW.VISITAPPLY: //拜访申请
                    detailContent = (
                        <VisitApplyDetail
                            isHomeMyWork={true}
                            detailItem={applyInfo}
                            applyListType='false'//待审批状态
                            afterApprovedFunc={this.afterFinishApplyWork}
                        />);
                    break;
                case APPLY_APPROVE_TYPES.BUSINESS_OPPORTUNITIES://销售机会申请
                    detailContent = (
                        <OpportunityApplyDetail
                            isHomeMyWork={true}
                            detailItem={applyInfo}
                            applyListType='false'//待审批状态
                            afterApprovedFunc={this.afterFinishApplyWork}
                        />);
                    break;
                case APPLY_APPROVE_TYPES.CUSTOMER_VISIT://出差申请
                    detailContent = (
                        <CustomerVisitApplyDetail
                            isHomeMyWork={true}
                            detailItem={applyInfo}
                            applyListType='false'//待审批状态
                            afterApprovedFunc={this.afterFinishApplyWork}
                        />);
                    break;
                case APPLY_APPROVE_TYPES.PERSONAL_LEAVE://请假申请
                    detailContent = (
                        <LeaveApplyDetail
                            isHomeMyWork={true}
                            detailItem={applyInfo}
                            applyListType='false'//待审批状态
                            afterApprovedFunc={this.afterFinishApplyWork}
                        />);
                    break;
                case APPLY_APPROVE_TYPES.OPINION_REPORT://舆情报告申请
                    detailContent = (
                        <ReportApplyDetail
                            isHomeMyWork={true}
                            detailItem={applyInfo}
                            applyListType='false'//待审批状态
                            afterApprovedFunc={this.afterFinishApplyWork}
                        />);
                    break;
                case APPLY_APPROVE_TYPES.DOCUMENT_WRITING://文件撰写申请
                    detailContent = (
                        <DocumentApplyDetail
                            isHomeMyWork={true}
                            detailItem={applyInfo}
                            applyListType='false'//待审批状态
                            afterApprovedFunc={this.afterFinishApplyWork}
                        />);
                    break;
                case APPLY_APPROVE_TYPES.DOMAINAPPLY: //舆情平台申请
                    detailContent = (
                        <DomainApplyDetail
                            isHomeMyWork={true}
                            detailItem={applyInfo}
                            applyListType='false'//待审批状态
                            afterApprovedFunc={this.afterFinishApplyWork}
                        />);
                    break;
                default://用户申请（试用、签约用户申请、修改密码、延期、其他）
                    detailContent = (
                        <UserApplyDetail
                            isHomeMyWork={true}
                            detailItem={applyInfo}
                            applyListType='false'//待审批状态
                            afterApprovedFunc={this.afterFinishApplyWork}
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
    }

    afterFinishApplyWork = () => {
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
        // if (this.state.totalCount) {
        //     title += this.state.totalCount;
        // }
        return (
            <ColumnItem contianerClass='my-work-wrap'
                title={title}
                content={this.renderWorkContent()}
            />);
    }
}

export default MyWorkColumn;
