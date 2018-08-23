/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/7/9.
 */
import ContactItem from './contact-item';
import {Button, Input, Icon, Tag, message, Radio} from 'antd';
const {TextArea} = Input;
require('../css/sales-clue-item.less');
import AlertTimer from 'CMP_DIR/alert-timer';
var clueCustomerAction = require('MOD_DIR/clue_customer/public/action/clue-customer-action');
var SalesHomeAction = require('../action/sales-home-actions');
var Spinner = require('CMP_DIR/spinner');
import ClueRightPanel from 'MOD_DIR/clue_customer/public/views/clue-right-detail';
var hasPrivilege = require('CMP_DIR/privilege/checker').hasPrivilege;
const DELAY_TIME = 3000;
var classNames = require('classnames');
import userData from 'PUB_DIR/sources/user-data';
import {phoneMsgEmitter} from 'PUB_DIR/sources/utils/emitters';
import {RightPanel} from '../../../../components/rightPanel';
import AppUserManage from 'MOD_DIR/app_user_manage/public';
import AntcDropdown from 'CMP_DIR/antc-dropdown';
import {SELECT_TYPE, AVALIBILITYSTATUS} from 'MOD_DIR/clue_customer/public/utils/clue-customer-utils';
import crmUtil from 'MOD_DIR/crm/public/utils/crm-util';
var timeoutFunc;//定时方法
var timeout = 1000;//1秒后刷新未读数
var notificationEmitter = require('PUB_DIR/sources/utils/emitters').notificationEmitter;

class SalesClueItem extends React.Component {
    constructor(props) {
        super(props);
        var propsItem = this.props.salesClueItemDetail;
        this.state = {
            salesClueItemDetail: propsItem,
            isEdittingItem: {},//正在编辑的那一条
            submitContent: this.getSubmitContent(propsItem),//要提交的跟进记录的内容
            submitTraceErrMsg: '',//提交跟进记录出错的信息
            submitTraceLoading: false,//正在提交跟进记录
            isRemarkingItem: '',//正在标记线索是否有效的线索
            remarkingErrMsg: '',//标记出错
            isAssocaiteItem: '',//正在关联客户的线索
            isShowClueDetail: false,//正在查看线索详情
            assocaitedItemSuccessItem: '',//正确关联了客户的线索
            showCustomerId: '',//正在展示客户详情的客户id
            isShowCustomerUserListPanel: false,//是否展示该客户下的用户列表
            customerOfCurUser: {},//当前展示用户所属客户的详情
            unSelectDataTip: this.props.unSelectDataTip,//未选择数据就保存的提示信息
            distributeLoading: this.props.distributeLoading,//正在保存分配销售的数据
        };
    }

    getSubmitContent(propsItem) {
        return _.get(propsItem, 'customer_traces[0]', '') ? propsItem.customer_traces[0].remark : '';
    }

    componentWillReceiveProps(nextProps) {
        //如果只改了某些属性，也要把state上的状态更新掉
        this.setState({
            salesClueItemDetail: nextProps.salesClueItemDetail,
            submitContent: this.getSubmitContent(nextProps.salesClueItemDetail),
        });

        if (this.state.distributeLoading !== nextProps.distributeLoading) {
            this.setState({
                distributeLoading: nextProps.distributeLoading
            });
        }
        if (this.state.unSelectDataTip !== nextProps.unSelectDataTip) {
            this.setState({
                unSelectDataTip: nextProps.unSelectDataTip
            });
        }
    }

    handleEditTrace = (updateItem) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.foot-text-content'), '点击添加/编辑跟进内容');
        this.setState({
            isEdittingItem: updateItem
        });
    };
    handleCancelBtn = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.foot-text-content'), '取消保存跟进内容');
        this.setState({
            submitTraceErrMsg: '',
            isEdittingItem: {},
            submitContent: this.getSubmitContent(this.state.salesClueItemDetail)
        });
    };
    handleInputChange = (e) => {
        this.setState({
            submitContent: e.target.value
        });
    };
    handleSubmitContent = (item) => {
        if (this.state.submitTraceLoading) {
            return;
        }
        var value = _.get(item, 'customer_traces[0].remark', '');
        if (Oplate && Oplate.unread && !value && userData.hasRole(userData.ROLE_CONSTANS.SALES)) {
            Oplate.unread['unhandleClue'] -= 1;
            if (timeoutFunc) {
                clearTimeout(timeoutFunc);
            }
            timeoutFunc = setTimeout(function() {
                //触发展示的组件待审批数的刷新
                notificationEmitter.emit(notificationEmitter.SHOW_UNHANDLE_CLUE_COUNT);
            }, timeout);
        }
        //获取填写的保存跟进记录的内容
        var textareVal = $.trim(this.state.submitContent);
        if (!textareVal) {
            this.setState({
                submitTraceErrMsg: Intl.get('cluecustomer.content.not.empty', '跟进内容不能为空')
            });
        } else {
            var submitObj = {
                'customer_id': item.id,
                'remark': textareVal
            };
            this.setState({
                submitTraceLoading: true,
            });
            clueCustomerAction.addCluecustomerTrace(submitObj, (result) => {
                if (result && result.error) {
                    this.setState({
                        submitTraceLoading: false,
                        submitTraceErrMsg: Intl.get('common.save.failed', '保存失败')
                    });
                } else {
                    //如果是待跟进状态,需要在列表中删除，其他状态
                    var clueItem = this.state.salesClueItemDetail;
                    clueItem.status = SELECT_TYPE.HAS_TRACE;
                    var userId = userData.getUserData().user_id || '';
                    var userName = userData.getUserData().nick_name;
                    var addTime = moment().valueOf();
                    if (!clueItem.customer_traces) {
                        clueItem.customer_traces = [
                            {
                                remark: textareVal,
                                user_id: userId,
                                nick_name: userName,
                                add_time: addTime
                            }];
                    } else {
                        //原来有customer_traces这个属性时，数组中除了remark还有别的属性
                        clueItem.customer_traces[0].remark = textareVal;
                        clueItem.customer_traces[0].user_id = userId;
                        clueItem.customer_traces[0].nick_name = userName;
                        clueItem.customer_traces[0].add_time = addTime;
                    }
                    this.setState({
                        submitTraceLoading: false,
                        submitTraceErrMsg: '',
                        salesClueItemDetail: clueItem,
                        isEdittingItem: {},
                    });
                    _.isFunction(this.props.afterAddClueTrace) && this.props.afterAddClueTrace(item.id);
                }
            });
        }
    };

    renderEditTraceContent(salesClueItem) {
        //点击增加按钮 补充跟进记录
        var hide = () => {
            this.setState({
                submitTraceErrMsg: '',
            });
        };
        return (
            <div className="edit-trace-content">
                {this.state.submitTraceErrMsg ? (
                    <div className="has-error">
                        <AlertTimer
                            time={DELAY_TIME}
                            message={this.state.submitTraceErrMsg}
                            type="error"
                            showIcon
                            onHide={hide}
                        />
                    </div>
                ) : null}
                <TextArea type='textarea' value={this.state.submitContent}
                    placeholder={Intl.get('sales.home.fill.in.trace.content', '请输入跟进内容')}
                    onChange={this.handleInputChange}/>
                <div className="save-cancel-btn">
                    <Button type='primary' onClick={this.handleSubmitContent.bind(this, salesClueItem)}
                        disabled={this.state.submitTraceLoading} data-tracename="保存跟进内容">
                        {Intl.get('common.save', '保存')}
                        {this.state.submitTraceLoading ? <Icon type="loading"/> : null}
                    </Button>
                    <Button className='cancel-btn'
                        onClick={this.handleCancelBtn}>{Intl.get('common.cancel', '取消')}</Button>
                </div>
            </div>
        );
    }

    //关联客户
    handleAssociateCustomer = (salesClueItem) => {
        this.setState({
            isAssocaiteItem: salesClueItem
        });
        _.isFunction(this.props.showClueDetailOut) && this.props.showClueDetailOut(salesClueItem);
    };

    afterModifiedAssocaitedCustomer = (updateItem) => {
        this.setState({
            assocaitedItemSuccessItem: updateItem
        });
    };
    hideRightPanel = () => {
        //关闭后，主要是判断一下刚才是否有对该线索进行过关联，如果成功关联了客户，那么在手动关闭右侧面板后，在列表中删除该条记录，在列表中会有一个loading状态
        this.setState({
            isAssocaiteItem: '',
        }, () => {
            var assocaiteItem = this.state.assocaitedItemSuccessItem;
            if (assocaiteItem) {
                this.setState({
                    isRemarkingItem: assocaiteItem
                });
                setTimeout(() => {
                    _.isFunction(this.props.afterRemarkClue) && this.props.afterRemarkClue({id: item.id});
                    this.setState({
                        isRemarkingItem: '',
                        isShowClueDetail: false,
                        salesClueItemDetail: assocaiteItem
                    });
                }, DELAY_TIME);
            } else {
                this.setState({
                    isRemarkingItem: '',
                    isShowClueDetail: false
                });
            }
        });
    };
    handleShowClueDetail = (item) => {
        if (_.isFunction(this.props.showClueDetailOut)){
            this.props.showClueDetailOut(item);
            this.setState({
                isAssocaiteItem: item
            });
            return;
        }
        this.setState({
            isShowClueDetail: true,
            isAssocaiteItem: item
        });
    };
    showCustomerDetail = (customerId) => {
        this.setState({
            showCustomerId: customerId
        });
        //触发打开带拨打电话状态的客户详情面板
        phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
            customer_params: {
                currentId: customerId,
                ShowCustomerUserListPanel: this.ShowCustomerUserListPanel,
                hideRightPanel: this.closeRightPanel
            }
        });
    };
    closeRightPanel = () => {
        this.setState({
            showCustomerId: ''
        });
    };
    ShowCustomerUserListPanel = (data) => {
        this.setState({
            isShowCustomerUserListPanel: true,
            customerOfCurUser: data.customerObj
        });

    };
    closeCustomerUserListPanel = () => {
        this.setState({
            isShowCustomerUserListPanel: false
        });
    };

    //获得已选销售的名字
    getSelectSalesName = (salesManNames) => {
        clueCustomerAction.setSalesManName({'salesManNames': salesManNames});
    };
    renderClueFoot(salesClueItem) {
        let user = userData.getUserData();
        let status = salesClueItem.status;
        //是待分配状态的线索，只展示分配按钮就可以
        let isWillDistributeClue = salesClueItem.status === '0';
        let member_id = user.user_id || '';
        //是有效线索
        let availability = salesClueItem.availability !== '1';
        //是无效线索且有判定线索无效的相关信息
        let inValidClue = salesClueItem.availability === '1' && salesClueItem.invalid_info;
        //是否有更改跟进记录的权限
        let canEditTrace = (member_id === _.get(salesClueItem, 'customer_traces[0].user_id', ''));
        //关联客户
        var associatedCustomer = salesClueItem.customer_name;
        var traceContent = _.get(salesClueItem, 'customer_traces[0].remark', '');//该线索的跟进内容
        var traceAddTime = _.get(salesClueItem, 'customer_traces[0].add_time');//跟进时间
        var tracePersonId = _.get(salesClueItem, 'customer_traces[0].user_id', '');//跟进人的id
        var tracePersonName = _.get(salesClueItem, 'customer_traces[0].nick_name', '');//跟进人的名字
        var handlePersonName = _.get(salesClueItem,'user_name');//当前跟进人
        var cls = 'foot-text-content';
        //是否有标记线索无效的权限
        var avalibility = hasPrivilege('CLUECUSTOMER_UPDATE_AVAILABILITY_MANAGER') || hasPrivilege('CLUECUSTOMER_UPDATE_AVAILABILITY_USER');
        //分配线索给销售的权限
        var hasAssignedPrivilege = hasPrivilege('CLUECUSTOMER_DISTRIBUTE_MANAGER') || (hasPrivilege('CLUECUSTOMER_DISTRIBUTE_USER') && !user.isCommonSales);
        //是否有修改线索关联客户的权利
        var associatedPrivilege = (hasPrivilege('CRM_MANAGER_CUSTOMER_CLUE_ID') || hasPrivilege('CRM_USER_CUSTOMER_CLUE_ID')) && salesClueItem.availability !== '1';
        return <div className={cls} data-tracename="线索详情操作区域">
            {/*有跟进记录*/}
            {traceContent ?
                <div className="record-trace-container">
                    <span>
                        {traceAddTime ? moment(traceAddTime).format(oplateConsts.DATE_FORMAT) : ''}
                    </span>
                    {traceContent ? <span>
                        <span className="trace-author">
                            {tracePersonId === member_id ? Intl.get('sales.home.i.trace', '我') : tracePersonName} {Intl.get('clue.add.trace.follow', '跟进')}
                        :
                        </span>
                        {traceContent}
                        {canEditTrace ? <i className="iconfont icon-edit-btn"
                            onClick={this.handleEditTrace.bind(this, salesClueItem)}
                        ></i> : null}
                    </span> : null }</div>
                : null}

            {/*是有效线索并且有关联客户*/}
            {availability && associatedCustomer ?
                <div className="associate-customer">
                    {salesClueItem.customer_label ? <Tag className={crmUtil.getCrmLabelCls(salesClueItem.customer_lable)}>{salesClueItem.customer_label}</Tag> : null}
                    <b className="customer-name" onClick={this.showCustomerDetail.bind(this, salesClueItem.customer_id)} data-tracename="点击查看关联客户详情">{associatedCustomer}</b></div> : null}
            {/*是无效线索且有判定无效的相关信息*/}
            {inValidClue ?
                <div className="clue-info-item">
                    <span className="invalid-time">
                        {moment(salesClueItem.invalid_info.time).format(oplateConsts.DATE_FORMAT)}
                    </span>
                    <span className="invalid-person">
                        {salesClueItem.invalid_info.user_name}
                    </span>
                    <span className="invalid-des">
                        {Intl.get('clue.set.invalid','判定无效')}
                    </span>
                </div>
                : null}
            <div className="handle-clue">
                <div className="handle-and-trace">
                    {handlePersonName ? <span className="current-trace-person">{Intl.get('clue.handle.clue.person', '当前跟进人')}: {handlePersonName}</span> : null}
                    {/*有分配权限*/}
                    {hasAssignedPrivilege ?
                        <AntcDropdown
                            ref={'changesale' + salesClueItem.id}
                            content={<span
                                data-tracename="点击分配线索客户按钮"
                                className='assign-btn'>{Intl.get('clue.customer.distribute', '分配')}</span>}
                            overlayTitle={Intl.get('user.salesman', '销售人员')}
                            okTitle={Intl.get('common.confirm', '确认')}
                            cancelTitle={Intl.get('common.cancel', '取消')}
                            isSaving={this.state.distributeLoading}
                            overlayContent={this.props.renderSalesBlock()}
                            handleSubmit={this.props.handleSubmitAssignSales.bind(this, salesClueItem)}
                            unSelectDataTip={this.state.unSelectDataTip}
                            clearSelectData={this.props.clearSelectSales}
                            btnAtTop={false}
                        /> : null
                    }
                </div>
                {!traceContent && hasPrivilege('CLUECUSTOMER_ADD_TRACE') && !isWillDistributeClue ?
                    <Button className='add-trace-content'
                        onClick={this.handleEditTrace.bind(this, salesClueItem)}>{Intl.get('clue.add.trace.content', '添加跟进内容')}</Button>
                    : null}
                {associatedPrivilege && !isWillDistributeClue ? <Button onClick={this.handleAssociateCustomer.bind(this, salesClueItem)} data-tracename="点击关联客户按钮">{Intl.get('clue.customer.associate.customer', '关联客户')}</Button> : null}
            </div>
        </div>;
    }

    renderClueStatus(status) {
        var statusDes = '';
        switch (status) {
            case '0':
                statusDes = <span
                    className="clue-stage will-distribute">{Intl.get('clue.customer.will.distribution', '待分配')}</span>;
                break;
            case '1':
                statusDes =
                    <span className="clue-stage has-distribute">{Intl.get('sales.home.will.trace', '待跟进')}</span>;
                break;
            case '2':
                statusDes =
                    <span className="clue-stage has-follow">{Intl.get('clue.customer.has.follow', '已跟进')}</span>;
                break;
        }
        return statusDes;
    }

    render() {
        var salesClueItem = this.state.salesClueItemDetail;
        //联系人的相关信息
        var contacts = salesClueItem.contacts ? salesClueItem.contacts : [];
        var hasRecordTrace = _.isArray(salesClueItem.customer_traces) && salesClueItem.customer_traces.length;
        var hide = () => {
            this.setState({
                remarkingErrMsg: '',
            });
        };
        //如果是点击关联客户的时候有模态框，点击查看详情的时候没有模态框
        var associateCls = classNames({
            'associate-wrap': !this.state.isShowClueDetail
        });
        var itemCls = classNames('sales-clue-item-container customer-detail-item', {
            'cur-clue': this.state.isShowClueDetail || this.props.currentId === this.state.isAssocaiteItem.id
        });
        return (
            <div className={itemCls} data-tracename="线索概览信息">
                <div className="clue-top-title">
                    <span className="hidden record-id">{salesClueItem.id}</span>
                    {this.renderClueStatus(salesClueItem.status)}
                    <span className="clue-name" data-tracename="查看线索详情"
                        onClick={this.handleShowClueDetail.bind(this, salesClueItem)}>{salesClueItem.name}</span>
                    {salesClueItem.availability === '1' ? <Tag>{Intl.get('sales.clue.is.enable', '无效')}</Tag> : null}
                </div>
                <div className="clue-content">
                    <div className="clue-trace-content">
                        <span>{moment(salesClueItem.source_time).format(oplateConsts.DATE_FORMAT)}</span>
                        <span className="clue-access-channel">{salesClueItem.access_channel || Intl.get('clue.unknown.access.channel','未知接入渠道')}:</span>
                        <span>{salesClueItem.source}</span>
                    </div>
                    {_.isArray(contacts) && contacts.length ? <ContactItem
                        contacts={contacts}
                        customerData={salesClueItem}
                        showContactLabel={false}
                        callNumber={this.props.callNumber}
                        errMsg={this.props.errMsg}
                    /> : null}
                </div>
                <div className="clue-foot" id="clue-foot">
                    {_.isEmpty(this.state.isEdittingItem) ? this.renderClueFoot(salesClueItem) :
                        this.renderEditTraceContent(salesClueItem)}
                </div>
                {this.state.isRemarkingItem ?
                    <div className="loading-container-wrap">
                        <div className="is-loading">
                            <Spinner/>
                            {this.props.showFrontPageTip ?
                                <p>{Intl.get('sales.home.no.show.frontpage', '本条线索处理完毕后，将不在首页展示')}</p> : null}
                        </div>
                    </div>
                    : null}
                {this.state.remarkingErrMsg ?
                    <div className="remark-error">
                        <AlertTimer
                            time={DELAY_TIME}
                            message={this.state.remarkingErrMsg}
                            type="error"
                            showIcon
                            onHide={hide}
                        />
                    </div>
                    : null}
                {this.state.isAssocaiteItem && !this.props.showClueDetailOut ?
                    <div className={associateCls}>
                        <ClueRightPanel
                            showFlag={true}
                            currentId={this.state.isAssocaiteItem.id}
                            hideRightPanel={this.hideRightPanel}
                            curCustomer={this.state.isAssocaiteItem}
                        />
                    </div>
                    : null}
                {/*该客户下的用户列表*/}
                {
                    this.state.isShowCustomerUserListPanel ?
                        <RightPanel
                            className="customer-user-list-panel"
                            showFlag={this.state.isShowCustomerUserListPanel}
                        >
                            {this.state.isShowCustomerUserListPanel ?
                                <AppUserManage
                                    customer_id={this.state.customerOfCurUser.id}
                                    hideCustomerUserList={this.closeCustomerUserListPanel}
                                    customer_name={this.state.customerOfCurUser.name}
                                    user_size={customerUserSize}
                                /> : null
                            }
                        </RightPanel> : null
                }
            </div>
        );
    }
}

SalesClueItem.defaultProps = {
    salesClueItemDetail: {},
    callNumber: '',
    errMsg: '',
    showFrontPageTip: false,
    afterAddClueTrace: function() {

    },
    unSelectDataTip: '',
    distributeLoading: false,
    clueCustomerTypeFilter: {},
    afterRemarkClue: function() {

    },
    renderSalesBlock: function() {

    },
    handleSubmitAssignSales: function() {

    },
    clearSelectSales: function() {

    },
    showClueDetailOut: function() {

    },
    currentId: ''

};
SalesClueItem.propTypes = {
    salesClueItemDetail: React.PropTypes.object,
    callNumber: React.PropTypes.string,
    errMsg: React.PropTypes.string,
    showFrontPageTip: React.PropTypes.bool,
    afterAddClueTrace: React.PropTypes.func,
    unSelectDataTip: React.PropTypes.string,
    distributeLoading: React.PropTypes.bool,
    clueCustomerTypeFilter: React.PropTypes.object,
    afterRemarkClue: React.PropTypes.func,
    renderSalesBlock: React.PropTypes.func,
    handleSubmitAssignSales: React.PropTypes.func,
    clearSelectSales: React.PropTypes.func,
    currentId: React.PropTypes.string,
    showClueDetailOut: React.PropTypes.func,

};
export default SalesClueItem;