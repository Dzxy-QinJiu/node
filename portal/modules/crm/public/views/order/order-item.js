import {Button, message, Menu, Dropdown, Popconfirm} from 'antd';
import { AntcSelect } from 'antc';
const Option = AntcSelect.Option;
const ModalDialog = require('../../../../../components/ModalDialog');
const Spinner = require('../../../../../components/spinner');
const OrderAction = require('../../action/order-actions');
const history = require('../../../../../public/sources/history');
import SearchIconList from '../../../../../components/search-icon-list';
import routeList from '../../../common/route';
import ajax from '../../../common/ajax';

const hasPrivilege = require('../../../../../components/privilege/checker').hasPrivilege;
import Trace from 'LIB_DIR/trace';
import BasicEditInputField from 'CMP_DIR/basic-edit-field-new/input';
import BasicEditDateField from 'CMP_DIR/basic-edit-field-new/date-picker';
import DetailCard from 'CMP_DIR/detail-card';
import {DetailEditBtn} from 'CMP_DIR/rightPanel';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
import classNames from 'classnames';
import ApplyUserForm from '../apply-user-form';
import StepsBar from 'CMP_DIR/steps-bar';
import {getNumberValidateRule} from 'PUB_DIR/sources/utils/validate-util';
import orderPrivilegeConst from 'MOD_DIR/deal_manage/public/privilege-const';
import {disabledBeforeToday, dealTimeNotLessThanToday} from 'PUB_DIR/sources/utils/common-method-util';
//订单状态
const ORDER_STATUS = {
    WIN: 'win',//赢单
    LOSE: 'lose'//丢单
};
const HAS_DELETE = orderPrivilegeConst.CRM_SALESOPPORTUNITY_DELETE;//删除权限的常量
const HAS_UPDATA = orderPrivilegeConst.SALESOPPORTUNITY_UPDATE;//修改权限的常量
//展示申请签约用户的阶段
const APPLY_OFFICIALL_STAGES = [Intl.get('crm.141', '成交阶段'), Intl.get('crm.142', '执行阶段')];
//展示申请试用用户的阶段
const APPLY_TIAL_STAGES = [Intl.get('crm.143', '试用阶段'), Intl.get('crm.144', '立项报价阶段'), Intl.get('crm.145', '谈判阶段')];

class OrderItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.getInitStateData(props);
    }

    getInitStateData(props = this.props) {
        return {
            modalDialogFlag: false,//是否展示模态框
            modalContent: '',//模态框提示内容
            modalDialogType: 0,//1：删除
            isLoading: false,
            isAlertShow: false,
            isAppPanelShow: false,
            submitErrorMsg: '',//修改应用时的错误提示
            apps: props.order.apps,
            stage: props.order.sale_stages,
            formData: _.cloneDeep(props.order),
            isShowApplyUserForm: false,//是否展示申请用户的表单
            applyType: Intl.get('common.trial.user', '试用用户'),//申请用户的类型：试用用户、正式用户
            applyUserApps: [],//申请用户对应的应用列表
            customerName: props.customerName,//申请用户时用客户名作为昵称
            isClosingOrder: false,//正在关闭订单
            closeOrderErrorMsg: '',//关闭订单失败的错误提示
            curOrderCloseStatus: '',//当前选择的订单的关闭状态
            isExpandDetail: false,//关闭的订单是否展示详情
           
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.state.formData.id !== nextProps.order.id) {
            let stateData = this.getInitStateData(nextProps);
            delete stateData.applyUserApps;
            this.setState(stateData);
        }
    }

    //展示是否删除的模态框
    showDelModalDialog = () => {
        this.setState({
            modalDialogFlag: true,
            modalContent: '确定要删除这个订单吗？',
            modalDialogType: 1,
            isLoading: false
        });
    };

    hideModalDialog = () => {
        this.setState({
            modalDialogFlag: false
        });
    };

    //模态提示框确定后的处理
    handleModalOK = (order) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.modal-footer .btn-ok'), '确定删除订单');
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
                        if (_.isString(result)) {
                            message.error(Intl.get('crm.139', '删除失败'));
                        } else {
                            message.success(Intl.get('crm.138', '删除成功'));
                            OrderAction.afterDelOrder(order.id);
                            //稍后后再去重新获取数据，以防止后端更新未完成从而取到的还是旧数据
                            setTimeout(() => {
                                //删除订单后，更新客户列表中的客户信息
                                _.isFunction(this.props.refreshCustomerList) && this.props.refreshCustomerList(order.customer_id);
                            }, 1000);
                        }
                    });
                }
                break;
        }
    };

    showApplyForm = (applyType, order, apps) => {
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
    };

    cancelApply = () => {
        this.setState({
            isAlertShow: false,
            isShowApplyUserForm: false,
            applyType: Intl.get('common.trial.user', '试用用户'),
            applyUserApps: []
        });
    };

    showStageSelect = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.order-introduce-div .ant-btn-circle'), '编辑销售阶段');
        this.setState({isStageSelectShow: true});
    };

    showAppPanel = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.order-application-list .ant-btn-circle'), '修改应用');
        this.setState({isAppPanelShow: true});
    };

    closeAppPanel = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.order-introduce-div'), '取消应用的修改');
        this.setState({isAppPanelShow: false, apps: this.state.formData.apps});
    };

    onAppsChange = (selectedApps) => {
        let oldAppList = _.isArray(this.state.apps) ? this.state.apps : [];
        if (selectedApps.length > oldAppList.length) {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.search-icon-list-content'), '选中某个应用');
        } else {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.search-icon-list-content'), '取消选中某个应用');
        }
        let submitErrorMsg = _.get(selectedApps, '[0]') && this.state.submitErrorMsg ? '' : this.state.submitErrorMsg;
        this.setState({apps: _.map(selectedApps, 'client_id'), submitErrorMsg});
    };

    //修改订单的预算、备注、预计成交时间, 丢单+丢单原因
    saveOrderBasicInfo = (property, saveObj, successFunc, errorFunc) => {
        //预计成交时间为空时的处理
        if (property === 'predict_finish_time') {
            if(!saveObj.predict_finish_time) {
                if (_.isFunction(errorFunc)) errorFunc(Intl.get('crm.order.expected.deal.placeholder', '请选择预计成交时间'));
                return;
            }
            saveObj.predict_finish_time = dealTimeNotLessThanToday(saveObj.predict_finish_time);
        }
        saveObj.customer_id = this.props.order.customer_id;
        if (property === 'oppo_status') {//丢单+丢单原因
            saveObj.oppo_status = ORDER_STATUS.LOSE;
            saveObj.lose_reason = _.trim(saveObj.lose_reason);
        }
        if (this.props.isMerge) {
            if (_.isFunction(this.props.updateMergeCustomerOrder)) this.props.updateMergeCustomerOrder(saveObj);
            if (_.isFunction(successFunc)) successFunc();
        } else {
            OrderAction.editOrder(saveObj, {property}, (result) => {
                if (result && result.code === 0) {
                    if (_.isFunction(successFunc)) successFunc();
                    OrderAction.afterEditOrder(saveObj);
                    let formData = this.state.formData;
                    _.each(saveObj, (value, key) => {
                        formData[key] = value;
                    });
                    this.setState({formData});
                } else {
                    if (_.isFunction(errorFunc)) errorFunc(result || Intl.get('common.save.failed', '保存失败'));
                }
            });
        }
    };

    //修改订单的销售阶段
    editOrderStage = (sale_stages) => {
        let saveObj = {
            customer_id: _.get(this.props, 'order.customer_id'),
            id: _.get(this.state, 'formData.id'),
            sale_stages: sale_stages,
        };
        if (saveObj.customer_id && saveObj.id) {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.order-introduce-div'), '保存销售阶段的修改');
            if (this.props.isMerge) {
                //合并客户时，修改订单的销售阶段或应用
                if (_.isFunction(this.props.updateMergeCustomerOrder)) this.props.updateMergeCustomerOrder(saveObj);
                if (_.isFunction(successFunc)) successFunc();
            } else {
                OrderAction.editOrder(saveObj, {property: 'sale_stages'}, result => {
                    if (result && result.code === 0) {
                        let formData = this.state.formData;
                        formData.sale_stages = sale_stages;
                        this.setState({formData: formData});
                    } else {
                        message.error(result || Intl.get('common.save.failed', '保存失败'));
                    }
                });
            }
        }
    };

    //修改订单的应用
    editOrderApp = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.order-introduce-div'), '保存应用的修改');
        let reqData = JSON.parse(JSON.stringify(this.props.order));
        reqData.apps = this.state.apps;
        if (!_.get(reqData.apps, '[0]')) {
            this.setState({submitErrorMsg: Intl.get('leave.apply.select.atleast.one.app', '请选择至少一个产品')});
            return;
        }
        if (this.props.isMerge) {
            //合并客户时，修改订单的销售阶段或应用
            if (_.isFunction(this.props.updateMergeCustomerOrder)) this.props.updateMergeCustomerOrder(reqData);
            this.setState({
                isAppPanelShow: false
            });
        } else {
            //客户详情中修改订单的应用
            let {customer_id, id, apps} = reqData;
            this.setState({isLoading: true});
            OrderAction.editOrder({customer_id, id, apps}, {property: 'apps'}, (result) => {
                if (result.code === 0) {
                    let formData = this.state.formData;
                    formData.apps = reqData.apps;
                    this.setState({
                        formData,
                        isAppPanelShow: false,
                        isLoading: false,
                        submitErrorMsg: ''
                    });
                } else {
                    this.setState({
                        isLoading: false,
                        submitErrorMsg: result || Intl.get('common.save.failed', '保存失败')
                    });
                }
            });
        }
    };

    //生成合同
    generateContract = () => {
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
    };

    //转到合同
    gotoContract = () => {
        history.push('/contract/list', {
            contractId: this.props.order.contract_id
        });
    };

    //关闭订单（赢单、丢单）
    closeOrder = (status) => {
        if (this.state.isClosingOrder) return;
        this.setState({isClosingOrder: true});
        let order = this.state.formData;
        let saveOrder = {
            customer_id: order.customer_id,
            id: order.id,
            oppo_status: status
        };
        OrderAction.editOrder(saveOrder, {property: 'oppo_status'}, (result) => {
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
    };

    getSelectedAppList = (order) => {
        let selectedAppList = [];
        if (_.get(order, 'apps[0]')) {
            selectedAppList = _.filter(this.props.appList, app => order.apps.indexOf(app.client_id) > -1);
        }
        return selectedAppList;
    };

    renderOrderContent = () => {
        const order = this.state.formData;
        let selectedAppList = this.getSelectedAppList(order);
        let selectedAppListId = _.map(selectedAppList, 'client_id');

        //区分删除和申请用户的类，用来控制模态框样式的不同
        let className = 'order-item order-view modal-container';
        if (this.state.modalDialogType > 1) {
            className += ' apply-user-modal';
        }

        //todo 这个生成合同的按钮不展示了，所以后台没有给权限
        //是否显示生成合同的按钮
        let showGenerateContractBtn = false;
        if (this.props.order.sale_stages === Intl.get('crm.141', '成交阶段') && !this.props.order.contract_id && hasPrivilege('SALESOPPORTUNITY_CONTRACT')) {
            showGenerateContractBtn = true;
        }
        const EDIT_FEILD_WIDTH = 350;
        //订单关闭或回收站中打开客户详情时，不可修改
        let hasEditPrivilege = !(order.oppo_status || this.props.disableEdit) && hasPrivilege(HAS_UPDATA);
        return (
            <div className="order-item modal-container">
                {
                    this.state.isLoading ?
                        (<Spinner className="isloading"/>) :
                        (null)
                }

                {
                    order.oppo_status === ORDER_STATUS.LOSE ? (
                        <div className="order-item-content">
                            <span
                                className="order-key order-lose-reason">{Intl.get('crm.order.lose.reason', '丢单原因')}:</span>
                            <BasicEditInputField
                                width={EDIT_FEILD_WIDTH}
                                id={order.id}
                                type="textarea"
                                field="lose_reason"
                                value={order.lose_reason}
                                placeholder={Intl.get('crm.order.lose.reason.input', '请输入丢单原因')}
                                hasEditPrivilege={true}
                                saveEditInput={this.saveOrderBasicInfo.bind(this, 'lose_reason')}
                                noDataTip={Intl.get('crm.no.order.lose.reason', '暂无丢单原因')}
                                addDataTip={Intl.get('crm.fill.order.lose.reason', '补充丢单原因')}
                            />
                        </div>) : null
                }
                {!order.oppo_status || (order.oppo_status && this.state.isExpandDetail) ? (//订单未关闭、订单关闭并且展示详情的状态下
                    <div>
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
                                    {hasEditPrivilege && hasPrivilege(HAS_UPDATA) ? <DetailEditBtn onClick={this.showAppPanel}/> : null}
                                </div>
                            )}
                        </div>
                        <div className="order-item-content">
                            <span className="order-key">{Intl.get('crm.148', '预算金额')}:</span>
                            <BasicEditInputField
                                width={EDIT_FEILD_WIDTH}
                                id={order.id}
                                // type="number"
                                field="budget"
                                value={order.budget}
                                afterValTip={Intl.get('contract.82', '元')}
                                placeholder={Intl.get('crm.order.budget.input', '请输入预算金额')}
                                hasEditPrivilege={hasEditPrivilege}
                                validators={[
                                    {required: true, message: Intl.get('crm.order.budget.input', '请输入预算金额')},
                                    getNumberValidateRule()
                                ]}
                                saveEditInput={this.saveOrderBasicInfo.bind(this, 'budget')}
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
                                disabledDate={disabledBeforeToday}
                                placeholder={Intl.get('crm.order.expected.deal.placeholder', '请选择预计成交时间')}
                                hasEditPrivilege={hasEditPrivilege}
                                saveEditDateInput={this.saveOrderBasicInfo.bind(this, 'predict_finish_time')}
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
                                hasEditPrivilege={hasEditPrivilege}
                                saveEditInput={this.saveOrderBasicInfo.bind(this, 'remarks')}
                                noDataTip={Intl.get('crm.basic.no.remark', '暂无备注')}
                                addDataTip={Intl.get('crm.basic.add.remark', '添加备注')}
                            />
                        </div>
                    </div>) : null}
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
    };

    renderOrderStatus = (status) => {
        if (status) {
            let descr = '', statusClass = '', iconClass = '';
            if (status === ORDER_STATUS.WIN) {
                descr = Intl.get('crm.order.status.won', '赢单');
                statusClass = 'order-status-win';
                iconClass = 'iconfont icon-order-win';
            } else if (status === ORDER_STATUS.LOSE) {
                descr = Intl.get('crm.order.status.lost', '丢单');
                statusClass = 'order-status-lose';
                iconClass = 'iconfont icon-order-lose';
            }
            return (
                <span className={`order-status ${statusClass}`}>
                    <span className={iconClass}/>
                    <span className='order-status-descr'>{descr}</span>
                </span>);
        }
        return null;
    };

    selectCloseOrderStatus = ({item, key}) => {
        this.setState({curOrderCloseStatus: key});
    };

    cancelCloseOrder = () => {
        this.setState({curOrderCloseStatus: ''});
    };

    renderOrderStage = (curStage) => {
        let stageList = this.props.stageList;
        let currentStageIndex = _.findIndex(stageList, stage => stage.name === curStage);
        let stageStepList = _.map(stageList, (stage, index) => {
            const stageName = stage.name ? stage.name.split('阶段')[0] : '';
            if (index === currentStageIndex || this.props.disableEdit) {
                //title用于展示
                return {title: stageName};
            } else {
                return {
                    title: stageName,
                    //该步骤的处理元素渲染
                    stepHandleElement: (
                        <Popconfirm title={Intl.get('crm.order.update.confirm', '确定要修改订单阶段？')}
                            onConfirm={this.editOrderStage.bind(this, stage.name)}>
                            <span className="order-stage-name"/>
                        </Popconfirm>)
                };
            }
        });
        const menu = (
            <Menu onClick={this.selectCloseOrderStatus} selectedKeys={[this.state.curOrderCloseStatus]}>
                <Menu.Item key={ORDER_STATUS.WIN}>
                    {Intl.get('crm.order.status.win', '赢单')}
                </Menu.Item>
                <Menu.Item key={ORDER_STATUS.LOSE}>
                    {Intl.get('crm.order.status.lose', '丢单')}
                </Menu.Item>
            </Menu>
        );
        //关闭订单项
        const closeOrderStep = (
            <Dropdown overlay={menu} trigger={['click']} placement="bottomCenter">
                {this.state.curOrderCloseStatus === ORDER_STATUS.WIN ? (
                    <Popconfirm placement="topRight" visible={true} onCancel={this.cancelCloseOrder}
                        onConfirm={this.closeOrder.bind(this, ORDER_STATUS.WIN)}
                        title={Intl.get('crm.order.close.win.confirm', '确定将订单的关闭状态设为赢单吗？')}>
                        <span className="order-stage-win"/>
                    </Popconfirm>) : (<span className="order-stage-name"/>)}
            </Dropdown>);
        if(!this.props.disableEdit){
            stageStepList.push({title: Intl.get('crm.order.close.step', '关闭订单'), stepHandleElement: closeOrderStep});
        }
        return (
            
            <StepsBar stepDataList={stageStepList} 
                currentStepIndex={currentStageIndex}
                onClickStep={this.onClickStep.bind(this)}/> 
        );
    };

    onClickStep = (event) => {
        if(this.props.disableEdit || !hasPrivilege(HAS_UPDATA)) return;
        $(event.target).parents('.step-item').find('.order-stage-name').trigger('click');
    };

    //渲染填写丢单原因的表单
    renderLoseOrderForm = (order) => {
        return (
            <div className="close-order-lose-wrap">
                <BasicEditInputField
                    id={order.id}
                    type="textarea"
                    displayType="edit"
                    field="lose_reason"
                    value={_.get(order, 'lose_reason', ' ')}
                    placeholder={Intl.get('crm.order.lose.reason.input', '请输入丢单原因')}
                    saveEditInput={this.saveOrderBasicInfo.bind(this, 'oppo_status')}
                    okBtnText={Intl.get('crm.order.lose.confirm', '确认丢单')}
                    cancelEditInput={this.cancelCloseOrder}
                />
            </div>);
    };

    toggleOrderDetail = (isExpandDetail) => {
        this.setState({isExpandDetail});
    };

    renderOrderTitle = () => {
        const order = this.state.formData;
        let btnCls = classNames('order-item-buttons', {
            'confirm-delete-buttons': this.state.modalDialogFlag,
            'hidden-btn': this.state.curOrderCloseStatus === ORDER_STATUS.LOSE
        });
        return (
            <span className="order-item-title">
                {order.oppo_status ? (
                    <span>
                        {this.renderOrderStatus(order.oppo_status)}
                    </span>) : (
                    <span>
                        {this.state.curOrderCloseStatus === ORDER_STATUS.LOSE ? this.renderLoseOrderForm(order) :
                            this.state.modalDialogFlag ? null : this.renderOrderStage(order.sale_stages)}
                        <span className={btnCls}>
                            {
                                this.state.modalDialogFlag ? (
                                    <span className="item-delete-buttons">
                                        <Button className="item-delete-cancel delete-button-style"
                                            onClick={this.hideModalDialog.bind(this, order)}>
                                            {Intl.get('common.cancel', '取消')}
                                        </Button>
                                        <Button className="item-delete-confirm delete-button-style"
                                            onClick={this.handleModalOK.bind(this, order)}>
                                            {Intl.get('crm.contact.delete.confirm', '确认删除')}
                                        </Button>
                                    </span>
                                ) : this.props.disableEdit || !hasPrivilege(HAS_DELETE) ? null 
                                    : (<span className="iconfont icon-delete handle-btn-item" 
                                        title={Intl.get('common.delete', '删除')}
                                        data-tracename="点击删除订单按钮" 
                                        onClick={this.showDelModalDialog}/>)
                            }
                        </span>
                    </span>
                )}
            </span>
        );
    };

    renderOrderBottom = () => {
        let order = this.state.formData;
        //申请按钮文字
        let applyBtnText = '';
        //申请类型
        let applyType = Intl.get('common.trial.user', '试用用户');
        if (APPLY_OFFICIALL_STAGES.indexOf(order.sale_stages) > -1) {
            applyBtnText = Intl.get('user.apply.user.official', '申请签约用户');
            applyType = Intl.get('common.trial.official', '正式用户');
        } else if (APPLY_TIAL_STAGES.indexOf(order.sale_stages) > -1) {
            applyBtnText = Intl.get('common.apply.user.trial', '申请试用用户');
        }
        let selectedAppList = this.getSelectedAppList(order);
        let createTime = order.time ? moment(order.time).format(oplateConsts.DATE_FORMAT) : '';
        return (
            <div className="order-bottom-wrap">
                {!this.props.isMerge && !this.props.disableEdit
                && applyBtnText && this.props.isApplyButtonShow &&
                order.oppo_status !== ORDER_STATUS.LOSE ? (//合并、回收站和丢单后不展示申请用户按钮
                        <Button className="order-bottom-button"
                            onClick={this.showApplyForm.bind(this, applyType, order, selectedAppList)}
                        >
                            {applyBtnText}
                        </Button>
                    ) : null}
                {this.state.isAlertShow ? (
                    <span className="add-app-tip"> * {Intl.get('crm.153', '请先添加应用')}</span>
                ) : null}
                <span className="order-add-time">{Intl.get('crm.order.add.to', '添加于{time}', {time: createTime})}</span>
                <span className="order-user">{order.user_name || ''}</span>
            </div>
        );
    };

    render() {
        let isHideWinDetailContent = _.get(this.state, 'formData.oppo_status') === ORDER_STATUS.WIN && !this.state.isExpandDetail;//是否是赢单后隐藏订单详情的状态
        let containerClassName = classNames('order-item-container', {
            'item-delete-border': this.state.modalDialogFlag,
            'order-win-hide-detail': isHideWinDetailContent//赢单后隐藏订单详情时的样式
        });
        let isShowToggleBtn = _.get(this.state, 'formData.oppo_status');
        return (
            <div>
                <DetailCard
                    title={this.renderOrderTitle()}
                    content={isHideWinDetailContent ? null : this.renderOrderContent()}
                    bottom={this.renderOrderBottom()}
                    className={containerClassName}
                    isShowToggleBtn={isShowToggleBtn}
                    handleToggleDetail={this.toggleOrderDetail.bind(this)}
                />
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
}
OrderItem.propTypes = {
    order: PropTypes.obj,
    customerName: PropTypes.string,
    isMerge: PropTypes.bool,
    delMergeCustomerOrder: PropTypes.func,
    refreshCustomerList: PropTypes.func,
    updateMergeCustomerOrder: PropTypes.func,
    appList: PropTypes.array,
    stageList: PropTypes.array,
    isApplyButtonShow: PropTypes.bool,
    disableEdit: PropTypes.bool,
};
module.exports = OrderItem;

