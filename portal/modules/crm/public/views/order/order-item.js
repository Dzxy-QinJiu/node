import {Button, Radio, message, Alert, Select, Icon} from 'antd';
const Option = Select.Option;
const ModalDialog = require('../../../../../components/ModalDialog');
const Spinner = require('../../../../../components/spinner');
const OrderAction = require('../../action/order-actions');
const history = require('../../../../../public/sources/history');
import SearchIconList from '../../../../../components/search-icon-list';
import routeList from '../../../common/route';
import ajax from '../../../common/ajax';
const hasPrivilege = require('../../../../../components/privilege/checker').hasPrivilege;
import Trace from 'LIB_DIR/trace';
import BasicEditSelectField from 'CMP_DIR/basic-edit-field-new/select';
import BasicEditInputField from 'CMP_DIR/basic-edit-field-new/input';
import BasicEditDateField from 'CMP_DIR/basic-edit-field-new/date-picker';
import DetailCard from 'CMP_DIR/detail-card';
import {DetailEditBtn} from 'CMP_DIR/rightPanel';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
import classNames from 'classnames';
import ApplyUserForm from '../apply-user-form';
//订单状态
const ORDER_STATUS = {
    WIN: 'win',//赢单
    LOSE: 'lose'//丢单
};
const OrderItem = React.createClass({
    getInitialState: function() {
        return {
            modalDialogFlag: false,//是否展示模态框
            modalContent: '',//模态框提示内容
            modalDialogType: 0,//1：删除
            isLoading: false,
            isAlertShow: false,
            isAppPanelShow: false,
            submitErrorMsg: '',//修改应用时的错误提示
            apps: this.props.order.apps,
            stage: this.props.order.sale_stages,
            formData: JSON.parse(JSON.stringify(this.props.order)),
            isShowApplyUserForm: false,//是否展示申请用户的表单
            applyType: Intl.get('common.trial.user', '试用用户'),//申请用户的类型：试用用户、正式用户
            applyUserApps: [],//申请用户对应的应用列表
            customerName: this.props.customerName,//申请用户时用客户名作为昵称
            isClosingOrder: false,//正在关闭订单
            closeOrderErrorMsg: '',//关闭订单失败的错误提示
        };
    },

    componentWillReceiveProps: function(nextProps) {
        this.setState({
            formData: JSON.parse(JSON.stringify(nextProps.order)),
            stage: nextProps.order.sale_stages,
            apps: nextProps.order.apps,
            customerName: nextProps.customerName
        });
    },

    //展示是否删除的模态框
    showDelModalDialog: function() {
        this.setState({
            modalDialogFlag: true,
            modalContent: '确定要删除这个订单吗？',
            modalDialogType: 1,
            isLoading: false
        });
    },

    hideModalDialog: function() {
        this.setState({
            modalDialogFlag: false
        });
    },

    //模态提示框确定后的处理
    handleModalOK: function(order) {
        Trace.traceEvent($(this.getDOMNode()).find('.modal-footer .btn-ok'), '确定删除订单');
        switch (this.state.modalDialogType) {
            case 1:
                //删除订单
                if (this.props.isMerge) {
                    //合并客户时，删除订单
                    this.props.delMergeCustomerOrder(order.id);
                } else {
                    this.setState({isLoading: true});
                    OrderAction.deleteOrder({}, {id: order.id}, result => {
                        this.setState({isLoading: false});
                        if (result.code === 0) {
                            message.success(Intl.get('crm.138', '删除成功'));
                            OrderAction.afterDelOrder(order.id);
                            //稍后后再去重新获取数据，以防止后端更新未完成从而取到的还是旧数据
                            setTimeout(() => {
                                //删除订单后，更新客户列表中的客户信息
                                _.isFunction(this.props.refreshCustomerList) && this.props.refreshCustomerList(order.customer_id);
                            }, 1000);
                        }
                        else {
                            message.error(Intl.get('crm.139', '删除失败'));
                        }
                    });
                }
                break;
        }
    },

    showApplyForm: function(applyType, order, apps) {
        if (apps && !apps.length) {
            this.setState({isAlertShow: true});
            setTimeout(() => {
                this.setState({isAlertShow: false});
            }, 3000);
            return;
        }
        this.setState({
            isShowApplyUserForm: true,
            applyType: applyType,
            applyUserApps: apps
        });
        // this.props.showApplyUserForm(applyType, order, apps);
    },
    cancelApply: function() {
        this.setState({
            isAlertShow: false,
            isShowApplyUserForm: false,
            applyType: Intl.get('common.trial.user', '试用用户'),
            applyUserApps: []
        });
    },
    showStageSelect: function() {
        Trace.traceEvent($(this.getDOMNode()).find('.order-introduce-div .ant-btn-circle'), '编辑销售阶段');
        this.setState({isStageSelectShow: true});
    },

    showAppPanel: function() {
        Trace.traceEvent($(this.getDOMNode()).find('.order-application-list .ant-btn-circle'), '修改应用');
        this.setState({isAppPanelShow: true});
    },

    closeAppPanel: function() {
        Trace.traceEvent($(this.getDOMNode()).find('.order-introduce-div'), '取消应用的修改');
        this.setState({isAppPanelShow: false, apps: this.state.formData.apps});
    },

    onAppsChange: function(selectedApps) {
        let oldAppList = _.isArray(this.state.apps) ? this.state.apps : [];
        if (selectedApps.length > oldAppList.length) {
            Trace.traceEvent($(this.getDOMNode()).find('.search-icon-list-content'), '选中某个应用');
        } else {
            Trace.traceEvent($(this.getDOMNode()).find('.search-icon-list-content'), '取消选中某个应用');
        }
        this.state.apps = _.map(selectedApps, 'client_id');

        this.setState(this.state);
    },

    //修改订单的预算、备注
    saveOrderBasicInfo: function(saveObj, successFunc, errorFunc) {
        saveObj.customer_id = this.props.order.customer_id;
        if (this.props.isMerge) {
            if (_.isFunction(this.props.updateMergeCustomerOrder)) this.props.updateMergeCustomerOrder(saveObj);
            if (_.isFunction(successFunc)) successFunc();
        } else {
            OrderAction.editOrder(saveObj, {}, (result) => {
                if (result && result.code === 0) {
                    if (_.isFunction(successFunc)) successFunc();
                    OrderAction.afterEditOrder(saveObj);
                } else {
                    if (_.isFunction(errorFunc)) errorFunc(result || Intl.get('common.save.failed', '保存失败'));
                }
            });
        }
    },

    //修改订单的销售阶段
    editOrderStage: function(saveObj, successFunc, errorFunc) {
        let {customer_id, id, sale_stages} = {...saveObj, customer_id: this.props.order.customer_id};
        Trace.traceEvent($(this.getDOMNode()).find('.order-introduce-div'), '保存销售阶段的修改');
        if (this.props.isMerge) {
            //合并客户时，修改订单的销售阶段或应用
            if (_.isFunction(this.props.updateMergeCustomerOrder)) this.props.updateMergeCustomerOrder({
                customer_id,
                id,
                sale_stages
            });
            if (_.isFunction(successFunc)) successFunc();
        } else {
            OrderAction.editOrderStage({customer_id, id, sale_stages}, {}, result => {
                if (result && result.code === 0) {
                    if (_.isFunction(successFunc)) successFunc();
                    this.state.formData.sale_stages = sale_stages;
                    this.setState(this.state);
                } else {
                    if (_.isFunction(errorFunc)) errorFunc(result || Intl.get('common.save.failed', '保存失败'));
                }
            });
        }
    },
    //修改订单的应用
    editOrderApp: function() {
        Trace.traceEvent($(this.getDOMNode()).find('.order-introduce-div'), '保存应用的修改');
        let reqData = JSON.parse(JSON.stringify(this.props.order));
        reqData.apps = this.state.apps;
        if (this.props.isMerge) {
            //合并客户时，修改订单的销售阶段或应用
            if (_.isFunction(this.props.updateMergeCustomerOrder)) this.props.updateMergeCustomerOrder(reqData);
            this.state.isAppPanelShow = false;
        } else {
            //客户详情中修改订单的应用
            let {customer_id, id, apps} = reqData;
            this.setState({isLoading: true});
            OrderAction.editOrder({customer_id, id, apps}, {}, (result) => {
                this.state.isLoading = false;
                if (result.code === 0) {
                    this.state.formData.apps = reqData.apps;
                    this.state.isAppPanelShow = false;
                    this.state.submitErrorMsg = '';
                } else {
                    this.state.submitErrorMsg = result || Intl.get('common.save.failed', '保存失败');
                }
                this.setState(this.state);
            });
        }
    },

    //生成合同
    generateContract: function() {
        this.setState({isLoading: true});

        const route = _.find(routeList, route => route.handler === 'generateContract');

        const params = {
            id: this.props.order.id
        };

        const arg = {
            url: route.path,
            type: route.method,
            params: params
        };

        ajax(arg).then(result => {
            this.setState({isLoading: false});

            message.success(Intl.get('crm.140', '生成合同成功'));
            //稍等一会儿再去重新获取数据，以防止更新未完成从而取到的还是旧数据

            setTimeout(() => {
                _.isFunction(this.props.refreshCustomerList) && this.props.refreshCustomerList(this.props.order.customer_id);
            }, 1000);
        },
        errorMsg => {
            this.setState({isLoading: false});

            message.error(errorMsg);
        });
    },

    //转到合同
    gotoContract: function() {
        history.pushState({
            contractId: this.props.order.contract_id
        }, '/contract/list', {});
    },
    //关闭订单（赢单、丢单）
    closeOrder: function(status) {
        if (this.state.isClosingOrder) return;
        this.setState({isClosingOrder: true});
        let order = this.state.formData;
        let saveOrder = {
            customer_id: order.customer_id,
            id: order.id,
            oppo_status: status
        };
        OrderAction.editOrder(saveOrder, {}, (result) => {
            if (result && result.code === 0) {
                order.oppo_status = status;
                this.setState({
                    isClosingOrder: false,
                    closeOrderErrorMsg: '',
                    formData: order
                });
                OrderAction.afterEditOrder(saveOrder);
            } else {
                this.setState({
                    isClosingOrder: false,
                    closeOrderErrorMsg: result || Intl.get('crm.order.close.failed', '关闭订单失败')
                });
            }
        });
    },

    getSelectedAppList(order){
        let selectedAppList = [];
        if (_.get(order, 'apps[0]')) {
            selectedAppList = _.filter(this.props.appList, app => order.apps.indexOf(app.client_id) > -1);
        }
        return selectedAppList;
    },
    //不能选今天之前的时间
    disabledDate(current) {
        return current && current < moment().subtract(1, 'days').endOf('day');
    },

    renderOrderContent() {
        const order = this.state.formData;
        let selectedAppList = this.getSelectedAppList(order);
        let selectedAppListId = _.map(selectedAppList, 'client_id');

        //区分删除和申请用户的类，用来控制模态框样式的不同
        let className = 'order-item order-view modal-container';
        if (this.state.modalDialogType > 1) {
            className += ' apply-user-modal';
        }

        //是否显示生成合同的按钮
        let showGenerateContractBtn = false;
        if (this.props.order.sale_stages === Intl.get('crm.141', '成交阶段') && !this.props.order.contract_id && hasPrivilege('SALESOPPORTUNITY_CONTRACT')) {
            showGenerateContractBtn = true;
        }


        let stageOptions = _.map(this.props.stageList, (stage, index) => {
            return (<Option value={stage.name} key={index}>{stage.name}</Option>);
        });
        const EDIT_FEILD_WIDTH = 350;
        return (
            <div className="order-item modal-container">
                {
                    this.state.isLoading ?
                        (<Spinner className="isloading"/>) :
                        (null)
                }
                <div className="order-item-content">
                    <span className="order-key">{Intl.get('crm.order.id', '订单编号')}:</span>
                    <span className="order-value">{order.id}</span>
                </div>
                <div className="order-item-content">
                    <span className="order-key">{Intl.get('sales.stage.sales.stage', '销售阶段')}:</span>
                    <BasicEditSelectField
                        width={EDIT_FEILD_WIDTH}
                        id={order.id}
                        displayText={order.sale_stages}
                        value={order.sale_stages}
                        field="sale_stages"
                        selectOptions={stageOptions}
                        hasEditPrivilege={order.oppo_status ? false : true}
                        placeholder={Intl.get('crm.155', '请选择销售阶段')}
                        saveEditSelect={this.editOrderStage}
                        noDataTip={Intl.get('crm.order.no.stage', '暂无销售阶段')}
                        addDataTip={Intl.get('crm.order.add.stage', '添加销售阶段')}
                    />
                </div>
                <div className="order-item-content order-application-list">
                    <span className="order-key">{Intl.get('call.record.application.product', '应用产品')}:</span>
                    {this.state.isAppPanelShow ? (
                        <div className="order-app-edit-block">
                            <SearchIconList
                                totalList={this.props.appList}
                                selectedList={selectedAppList}
                                selectedListId={selectedAppListId}
                                id_field="client_id"
                                name_field="client_name"
                                image_field="client_image"
                                search_fields={['client_name']}
                                onItemsChange={this.onAppsChange}
                            />
                            <SaveCancelButton loading={this.state.isLoading}
                                saveErrorMsg={this.state.submitErrorMsg}
                                handleSubmit={this.editOrderApp}
                                handleCancel={this.closeAppPanel}
                            />
                        </div>
                    ) : (
                        <div className="order-application-div">
                            {selectedAppList.map(function(app, i) {
                                return (
                                    <div className="app-item" key={i}>
                                        {app.client_name}
                                    </div>
                                );
                            })}
                            {order.oppo_status ? null : <DetailEditBtn onClick={this.showAppPanel}/>}
                        </div>
                    )}
                </div>
                <div className="order-item-content">
                    <span className="order-key">{Intl.get('crm.148', '预算金额')}:</span>
                    <BasicEditInputField
                        width={EDIT_FEILD_WIDTH}
                        id={order.id}
                        type="number"
                        field="budget"
                        value={order.budget}
                        afterValTip={Intl.get('contract.139', '万')}
                        placeholder={Intl.get('crm.order.budget.input', '请输入预算金额')}
                        hasEditPrivilege={order.oppo_status ? false : true}
                        saveEditInput={this.saveOrderBasicInfo}
                        noDataTip={Intl.get('crm.order.no.budget', '暂无预算')}
                        addDataTip={Intl.get('crm.order.add.budget', '添加预算')}
                    />
                </div>
                <div className="order-item-content">
                    <span className="order-key">{Intl.get('crm.order.expected.deal', '预计成交')}:</span>
                    <BasicEditDateField
                        width={EDIT_FEILD_WIDTH}
                        id={order.id}
                        field="predict_finish_time"
                        value={order.predict_finish_time}
                        placeholder={Intl.get('crm.order.expected.deal.placeholder', '请选择预计成交时间')}
                        hasEditPrivilege={order.oppo_status ? false : true}
                        saveEditDateInput={this.saveOrderBasicInfo}
                        disabledDate={this.disabledDate}
                        noDataTip={Intl.get('crm.order.no.expected.deal.time', '暂无预计成交时间')}
                        addDataTip={Intl.get('crm.order.add.expected.deal.time', '添加预计成交时间')}
                    />
                </div>
                <div className="order-item-content">
                    <span className="order-key">{Intl.get('crm.order.remarks', '订单备注')}:</span>
                    <BasicEditInputField
                        width={EDIT_FEILD_WIDTH}
                        id={order.id}
                        type="textarea"
                        field="remarks"
                        value={order.remarks}
                        editBtnTip={Intl.get('user.remark.set.tip', '设置备注')}
                        placeholder={Intl.get('user.input.remark', '请输入备注')}
                        hasEditPrivilege={order.oppo_status ? false : true}
                        saveEditInput={this.saveOrderBasicInfo}
                        noDataTip={Intl.get('crm.basic.no.remark', '暂无备注')}
                        addDataTip={Intl.get('crm.basic.add.remark', '添加备注')}
                    />
                </div>
                {/*<div className="order-introduce">*/}
                {/*{this.props.order.contract_id ? (*/}
                {/*<Button type="ghost" className="order-introduce-btn pull-right"*/}
                {/*onClick={this.gotoContract}*/}
                {/*>*/}
                {/*{Intl.get("crm.151", "查看合同")}*/}
                {/*</Button>*/}
                {/*) : null}*/}

                {/*{showGenerateContractBtn ? (*/}
                {/*<Button type="ghost" className="order-introduce-btn pull-right"*/}
                {/*onClick={this.generateContract}>*/}
                {/*{Intl.get("crm.152", "生成合同")}*/}
                {/*</Button>*/}
                {/*) : null}*/}
                {/*</div>*/}
            </div>
        );
    },
    renderOrderStatus(status){
        let descr = Intl.get('crm.order.status.underway', '进行中'), statusClass = 'order-status-underway';
        if (status) {
            if (status === ORDER_STATUS.WIN) {
                descr = Intl.get('crm.order.status.won', '已赢单');
                statusClass = 'order-status-win';
            } else if (status === ORDER_STATUS.LOSE) {
                descr = Intl.get('crm.order.status.lost', '已丢单');
                statusClass = 'order-status-lose';
            }
        }
        return (<span className={`order-status ${statusClass}`}> {descr}</span>);
    },
    renderOrderTitle(){
        const order = this.state.formData;
        return (
            <span className="order-item-title">
                {this.renderOrderStatus(order.oppo_status)}
                <span className="order-time">
                    {order.time ? moment(order.time).format(oplateConsts.DATE_TIME_WITHOUT_SECOND_FORMAT) : ''}
                </span>
                {order.oppo_status ? null : <span className="order-item-buttons">
                    {this.state.modalDialogFlag ? (
                        <span className="item-delete-buttons">
                            <Button className="item-delete-cancel delete-button-style"
                                onClick={this.hideModalDialog.bind(this, order)}>
                                {Intl.get('common.cancel', '取消')}
                            </Button>
                            <Button className="item-delete-confirm delete-button-style"
                                onClick={this.handleModalOK.bind(this, order)}>
                                {Intl.get('crm.contact.delete.confirm', '确认删除')}
                            </Button>
                        </span>) : (
                        <span className="iconfont icon-delete" title={Intl.get('common.delete', '删除')}
                            data-tracename="点击删除订单按钮" onClick={this.showDelModalDialog}/>)
                    }
                </span>}
            </span>
        );
    },
    renderOrderBottom(){
        let order = this.state.formData;
        //申请按钮文字
        let applyBtnText = '';
        //申请类型
        let applyType = Intl.get('common.trial.user', '试用用户');
        if ([Intl.get('crm.141', '成交阶段'), Intl.get('crm.142', '执行阶段')].indexOf(order.sale_stages) > -1) {
            applyBtnText = Intl.get('user.apply.user.official', '申请签约用户');
            applyType = Intl.get('common.trial.official', '正式用户');
        } else if ([Intl.get('crm.143', '试用阶段'), Intl.get('crm.144', '立项报价阶段'), Intl.get('crm.145', '谈判阶段')].indexOf(order.sale_stages) > -1) {
            applyBtnText = Intl.get('common.apply.user.trial', '申请试用用户');
        }
        let selectedAppList = this.getSelectedAppList(order);
        return (
            <div className="order-bottom-wrap">
                {applyBtnText && this.props.isApplyButtonShow && order.oppo_status !== ORDER_STATUS.LOSE ? (//丢单后不展示申请用户按钮
                    <Button className="order-bottom-button"
                        onClick={this.showApplyForm.bind(this, applyType, order, selectedAppList)}
                    >
                        {applyBtnText}
                    </Button>
                ) : null}
                {this.state.isClosingOrder ? (
                    <span>
                        {Intl.get('crm.order.closing', '订单关闭中')}<Icon type="loading"/>
                    </span>) : order.oppo_status ? null : (
                    <span>
                        <Button className='order-bottom-button' onClick={this.closeOrder.bind(this, ORDER_STATUS.WIN)}>
                            {Intl.get('crm.order.status.win', '赢单')}
                        </Button>
                        <Button className='order-bottom-button' onClick={this.closeOrder.bind(this, ORDER_STATUS.LOSE)}>
                            {Intl.get('crm.order.status.lose', '丢单')}
                        </Button>
                        {this.state.closeOrderErrorMsg ? (
                            <span className="order-close-error-tip">{this.state.closeOrderErrorMsg}</span>) : null}
                    </span>)}
                <span className="order-user">{order.user_name || ''}</span>
            </div>
        );
    },
    render(){
        let containerClassName = classNames('order-item-container', {
            'item-delete-border': this.state.modalDialogFlag
        });
        return (
            <div>
                <DetailCard title={this.renderOrderTitle()}
                    content={this.renderOrderContent()}
                    bottom={this.renderOrderBottom()}
                    className={containerClassName}/>
                {this.state.isShowApplyUserForm ? (
                    <ApplyUserForm
                        userType={this.state.applyType}
                        apps={this.state.applyUserApps}
                        order={this.state.formData}
                        customerName={this.state.customerName}
                        cancelApply={this.cancelApply}
                        applyFrom="order"
                        appList={this.props.appList}
                    />
                ) : null}
            </div>);
    }
});

module.exports = OrderItem;
