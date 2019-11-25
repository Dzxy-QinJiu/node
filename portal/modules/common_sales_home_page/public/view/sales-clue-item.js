var React = require('react');
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
import PropTypes from 'prop-types';
import userData from 'PUB_DIR/sources/user-data';
import {phoneMsgEmitter, clueToCustomerPanelEmitter} from 'PUB_DIR/sources/utils/emitters';
import {RightPanel} from '../../../../components/rightPanel';
import AppUserManage from 'MOD_DIR/app_user_manage/public';
import AntcDropdown from 'CMP_DIR/antc-dropdown';
import {SELECT_TYPE, AVALIBILITYSTATUS} from 'MOD_DIR/clue_customer/public/utils/clue-customer-utils';
import {renderClueStatus, subtracteGlobalClue} from 'PUB_DIR/sources/utils/common-method-util';
import Trace from 'LIB_DIR/trace';
import commonSalesHomePrivilegeConst from '../privilege-const';
import cluePrivilegeConst from 'MOD_DIR/clue_customer/public/privilege-const';
import CustomerLabel from 'CMP_DIR/customer_label';
import {assignSalesPrivilege} from 'MOD_DIR/clue_customer/public/utils/clue-customer-utils';
class SalesClueItem extends React.Component {
    constructor(props) {
        super(props);
        var propsItem = this.props.salesClueItemDetail;
        this.state = {
            salesClueItemDetail: propsItem,
            isEdittingItem: {},//正在编辑的那一条
            submitContent: '',//要提交的跟进记录的内容
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

    componentWillReceiveProps(nextProps) {
        //如果只改了某些属性，也要把state上的状态更新掉
        this.setState({
            salesClueItemDetail: nextProps.salesClueItemDetail,
            submitContent: '',
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
            submitContent: ''
        });
    };
    handleInputChange = (e) => {
        this.setState({
            submitContent: e.target.value
        });
    };
    updateRemarks = (remarks) => {
        var salesClueItemDetail = this.state.salesClueItemDetail;
        salesClueItemDetail['customer_traces'][0].remark = remarks;
        salesClueItemDetail['status'] = SELECT_TYPE.HAS_TRACE;
        this.setState({
            salesClueItemDetail,
            submitContent: ''
        });
    };
    handleSubmitContent = (item) => {
        //获取填写的保存跟进记录的内容
        var textareVal = _.trim(this.state.submitContent);
        if (this.state.submitTraceLoading) {
            return;
        }
        if (!textareVal) {
            this.setState({
                submitTraceErrMsg: Intl.get('cluecustomer.content.not.empty', '跟进内容不能为空')
            });
        } else {
            subtracteGlobalClue(item);
            var submitObj = {
                'lead_id': item.id,
                'remark': textareVal,
                'type': 'other'
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
                    _.isFunction(this.props.afterAddClueTrace) && this.props.afterAddClueTrace(item);
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
    };
    //标记线索无效或者有效
    handleClickInvalidBtn = (item) => {
        var updateValue = AVALIBILITYSTATUS.INAVALIBILITY;
        if (item.availability === AVALIBILITYSTATUS.INAVALIBILITY) {
            updateValue = AVALIBILITYSTATUS.AVALIBILITY;
        }
        var submitObj = {
            id: item.id,
            availability: updateValue
        };
        this.setState({
            isInvalidClue: true,
        });
        clueCustomerAction.updateCluecustomerDetail(submitObj, (result) => {
            if (_.isString(result)) {
                this.setState({
                    isInvalidClue: false,
                });
            } else {
                var salesClueItemDetail = this.state.salesClueItemDetail;
                salesClueItemDetail.invalid_info = {
                    user_name: userData.getUserData().nick_name,
                    time: moment().valueOf()
                };
                salesClueItemDetail.availability = updateValue;
                clueCustomerAction.updateClueProperty({
                    id: item.id,
                    availability: updateValue,
                    status: SELECT_TYPE.HAS_TRACE
                });
                this.setState({
                    isInvalidClue: false,
                    salesClueItemDetail: salesClueItemDetail
                });
            }
        });
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
        phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_CLUE_PANEL, {
            clue_params: {
                currentId: item.id,
                hideRightPanel: this.hideRightPanel,
                afterDeleteClue: this.afterDeleteClue,
                afterTransferClueSuccess: this.hideCurClue,
                removeUpdateClueItem: this.removeUpdateClueItem,
                updateRemarks: this.updateRemarks
            }
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
            isShowCustomerUserListPanel: false,
            customerOfCurUser: {}
        });
    };

    //获得已选销售的名字
    getSelectSalesName = (salesManNames) => {
        clueCustomerAction.setSalesManName({'salesManNames': salesManNames});
    };
    //在列表中隐藏当前操作的线索
    hideCurClue = (clue) => {
        this.props.removeClueItem(clue);
    }
    renderClueFoot(salesClueItem) {
        let user = userData.getUserData();
        let status = salesClueItem.status;
        //是待分配状态的线索，只展示分配按钮就可以
        let isWillDistributeClue = salesClueItem.status === '0';
        //是已跟进状态的线索
        let hasTraceClue = salesClueItem.status === '2';
        let member_id = user.user_id || '';
        //是有效线索
        let availability = salesClueItem.availability !== '1';
        //是无效线索且有判定线索无效的相关信息
        let inValidClue = salesClueItem.availability === '1' && salesClueItem.invalid_info;
        //是否有更改跟进记录的权限
        let canEditTrace = hasPrivilege('CLUECUSTOMER_ADD_TRACE');
        //关联客户
        var associatedCustomer = salesClueItem.customer_name;
        var traceContent = _.get(salesClueItem, 'customer_traces[0].remark', '');//该线索的跟进内容
        var traceAddTime = _.get(salesClueItem, 'customer_traces[0].add_time');//跟进时间
        var tracePersonId = _.get(salesClueItem, 'customer_traces[0].user_id', '');//跟进人的id
        var tracePersonName = _.get(salesClueItem, 'customer_traces[0].nick_name', '');//跟进人的名字
        var handlePersonName = _.get(salesClueItem,'user_name');//当前跟进人
        var cls = 'foot-text-content';
        //是否有标记线索无效的权限
        var avalibilityPrivilege = hasPrivilege(commonSalesHomePrivilegeConst.CURTAO_CRM_LEAD_UPDATE_AVAILABILITY_SELF) || hasPrivilege(commonSalesHomePrivilegeConst.CURTAO_CRM_LEAD_UPDATE_AVAILABILITY_ALL);
        //是否有修改线索关联客户的权利
        var associatedPrivilege = (hasPrivilege(cluePrivilegeConst.LEAD_TRANSFER_MERGE_CUSTOMER)) && salesClueItem.availability !== '1';
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
                    </span> : null }</div>
                : null}

            {/*是有效线索并且有关联客户*/}
            {availability && associatedCustomer ?
                <div className="associate-customer">
                    <CustomerLabel label={salesClueItem.customer_lable} />
                    <b className="customer-name" onClick={this.showCustomerDetail.bind(this, salesClueItem.customer_id)} data-tracename="点击查看关联客户详情">{associatedCustomer}<span className="arrow-right">&gt;</span></b></div> : null}
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
                    {handlePersonName ? <span className="current-trace-person">{Intl.get('crm.6', '负责人')}: {handlePersonName}</span> : null}
                    {/*有分配权限*/}
                    {assignSalesPrivilege(salesClueItem) ?
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
                {hasPrivilege(commonSalesHomePrivilegeConst.CURTAO_CRM_TRACE_ADD) ?
                    <Button className='add-trace-content handle-btn-item'  
                        onClick={this.handleEditTrace.bind(this, salesClueItem)}>{Intl.get('clue.add.trace.content', '添加跟进内容')}</Button>
                    : null}
                {associatedPrivilege && hasTraceClue ? <Button onClick={() => { clueToCustomerPanelEmitter.emit(clueToCustomerPanelEmitter.OPEN_PANEL, {clue: salesClueItem, afterConvert: this.hideCurClue}); }} data-tracename="点击关联客户按钮">{Intl.get('common.convert.to.customer', '转为客户')}</Button> : null}

                {avalibilityPrivilege ? (salesClueItem.availability === '1' ?

                    <Button className="cancel-invalid" onClick={this.handleClickInvalidBtn.bind(this, salesClueItem)}
                        data-tracename="取消判定线索无效">
                        {Intl.get('clue.cancel.set.invalid', '改为有效')}
                    </Button> : <Button onClick={this.handleClickInvalidBtn.bind(this, salesClueItem)} data-tracename="点击线索无效" disabled={this.state.isInvalidClue}>{Intl.get('sales.clue.is.enable', '无效')}{this.state.isInvalidClue ? <Icon type="loading"/> : null}</Button>) : null}
            </div>
        </div>;
    }

    removeUpdateClueItem = () => {
        //需要把这条线索在列表中去掉
        var salesClueItemDetail = this.state.salesClueItemDetail;
        this.props.removeClueItem(salesClueItemDetail);
        this.setState({
            isAssocaiteItem: '',
            isShowClueDetail: false
        });
    };

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
                    {renderClueStatus(salesClueItem)}
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
    currentId: '',
    removeClueItem: function() {

    }

};
SalesClueItem.propTypes = {
    salesClueItemDetail: PropTypes.object,
    showFrontPageTip: PropTypes.bool,
    afterAddClueTrace: PropTypes.func,
    unSelectDataTip: PropTypes.string,
    distributeLoading: PropTypes.bool,
    clueCustomerTypeFilter: PropTypes.object,
    afterRemarkClue: PropTypes.func,
    renderSalesBlock: PropTypes.func,
    handleSubmitAssignSales: PropTypes.func,
    clearSelectSales: PropTypes.func,
    currentId: PropTypes.string,
    removeClueItem: PropTypes.func,

};
export default SalesClueItem;
