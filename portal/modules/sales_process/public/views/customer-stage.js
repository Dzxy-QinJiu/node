/**
 * Created by hzl on 2019/8/6.
 * 客户阶段
 */
require('../css/customer-stage.less');
import Trace from 'LIB_DIR/trace';
import rightPanelUtil from 'CMP_DIR/rightPanel/index';
const RightPanel = rightPanelUtil.RightPanel;
const RightPanelClose = rightPanelUtil.RightPanelClose;
import {message, Button, Popover, Icon, Form, Input} from 'antd';
const FormItem = Form.Item;
import NoDataIntro from 'CMP_DIR/no-data-intro';
import {BACKGROUG_LAYOUT_CONSTANTS} from 'PUB_DIR/sources/utils/consts';
import GeminiScrollBar from 'CMP_DIR/react-gemini-scrollbar';
import CustomerStageAction from '../action/customer-stage-action';
import CustomerStageStore from '../store/customer-stage-store';
import CustomerStageAjax from '../ajax';
import CustomerStageForm from './customer-stage-form';
import {PrivilegeChecker} from 'CMP_DIR/privilege/checker';
import Spinner from 'CMP_DIR/spinner';
import CustomerStageInfo from './customer-stage-info';
import {nameRule} from 'PUB_DIR/sources/utils/validate-util';
import { CUSTOMER_STAGE_COLOR } from 'PUB_DIR/sources/utils/consts';
import CUSTOMER_STAGE_PRIVILEGE from '../privilege-const';

class CustomerStage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            saleProcessId: props.saleProcessId,
            editCustomerNameLoading: false, // 修改客户阶段名称的loading
            editCustomerNameMsgTips: '', // 修改客户阶段名称的信息提示
            ...CustomerStageStore.getState(),
        };
    }

    onChange = () => {
        this.setState({...CustomerStageStore.getState()});
    };

    componentDidMount() {
        CustomerStageStore.listen(this.onChange);
        let saleProcessId = this.state.saleProcessId;
        if (saleProcessId) {
            setTimeout( () => {
                CustomerStageAction.getCustomerStageList(saleProcessId);
            }, 0);
        }
        // TODO 隐藏  获取销售行为和获取客户阶段的自动变更条件
        // CustomerStageAction.getCustomerStageSaleBehavior(); // 获取销售行为
        // CustomerStageAction.getCustomerStageAutoConditions();// 获取客户阶段的自动变更条件
    }

    componentWillUnmount() {
        CustomerStageStore.unlisten(this.onChange);
    }

    // 显示客户阶段详情
    showCustomerStageDetail(customerStage) {
        CustomerStageAction.showCustomerStageDetail(customerStage);
    }

    // 关闭客户阶段详情
    closeCustomerStageDetail(customerStage) {
        CustomerStageAction.closeCustomerStageDetail(customerStage);
    }

    saveCustomerStageSettingPlay = (type, saveObj, successFunc, errorFunc) => {
        let saleProcessId = this.state.saleProcessId;
        CustomerStageAjax.editCustomerStage(saveObj, saleProcessId).then( (result) => {
            if (result) {
                if (_.isFunction(successFunc)) successFunc();
                saveObj.flag = 'editPlay';
                CustomerStageAction.updateCustomerStageList(saveObj);
            } else {
                if (_.isFunction(errorFunc)) errorFunc();
            }
        }, (errMsg) => {
            if (_.isFunction(errorFunc)) errorFunc(errMsg);
        } );
    }

    // 显示客户阶段表单
    showCustomerStageForm = (customerStage) => {
        CustomerStageAction.showCustomerStageForm(customerStage);
    };

    // 关闭客户阶段表单
    closeCustomerStageForm = () => {
        CustomerStageAction.closeCustomerStageForm();
    };

    // 提交客户阶段表单数据（添加一个客户阶段和编辑客户阶段）
    submitCustomerStageForm = (customerStage) => {
        let saleProcessId = this.state.saleProcessId;
        if (customerStage.id) { // 编辑客户阶段
            CustomerStageAjax.editCustomerStage(customerStage, saleProcessId).then( (result) => {
                if (result) {
                    customerStage.flag = 'edit';
                    CustomerStageAction.updateCustomerStageList(customerStage);
                    CustomerStageAction.closeCustomerStageForm();
                    message.success(Intl.get('crm.218', '修改成功！'));
                } else {
                    CustomerStageAction.closeCustomerStageForm();
                    message.success(Intl.get('crm.219', '修改失败！'));
                }
            }, (errMsg) => {
                CustomerStageAction.closeCustomerStageForm();
                message.success(errMsg || Intl.get('crm.219', '修改失败！'));
            } );
        } else { // 添加一个客户阶段
            let order = _.get(this.state.customerStageList, 'length');
            customerStage.color = CUSTOMER_STAGE_COLOR[order];
            customerStage.order = order + 1; // 需要传客户阶段的序号
            CustomerStageAjax.addCustomerStage(customerStage, saleProcessId).then( (result) => {
                if (result && result.id) {
                    CustomerStageAction.updateCustomerStageList(result);
                    CustomerStageAction.closeCustomerStageForm();
                    message.success(Intl.get('crm.216', '添加成功！'));
                } else {
                    CustomerStageAction.closeCustomerStageForm();
                    message.error(Intl.get('member.add.failed', '添加失败！'));
                }
            }, (errMsg) => {
                CustomerStageAction.closeCustomerStageForm();
                message.error(errMsg || Intl.get('member.add.failed', '添加失败！'));
            });
        }
    };

    // 显示客户阶段模态框
    showCustomerStageModalDialog = (customerStage) => {
        CustomerStageAction.showCustomerStageModalDialog(customerStage);
    };

    // 关闭客户阶段模态
    closeCustomerStageModalDialog = (customerStage) => {
        CustomerStageAction.closeCustomerStageModalDialog(customerStage);
    };

    // 删除客户阶段
    deleteCustomerStage = (customerStage) => {
        let id = customerStage.id;
        let deleteStage = _.cloneDeep(customerStage);
        CustomerStageAjax.deleteCustomerStage(id).then( (result) => {
            if (result) {
                customerStage.flag = 'delete';
                CustomerStageAction.updateCustomerStageList(customerStage);
                this.closeCustomerStageModalDialog(deleteStage);
                message.success(Intl.get('crm.138', '删除成功！'));
            } else {
                this.closeCustomerStageModalDialog(customerStage);
                message.error(Intl.get('crm.139', '删除失败！'));
            }
        }, (errMsg) => {
            this.closeCustomerStageModalDialog(customerStage);
            message.error(errMsg || Intl.get('crm.139', '删除失败！'));
        });
    };

    // 显示客户阶段变更顺序
    showCustomerStageTransferOrder = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.topNav .customer-stage-top-div:first-child span'), '变更客户阶段顺序');
        CustomerStageAction.showCustomerStageTransferOrder();
    };

    // 关闭客户阶段变更顺序
    closeCustomerStageTransferOrder = (isTransferOrderSuccess) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.topNav .customer-stage-top-btn:last-child span'), '取消对客户阶段顺序更改的保存');
        CustomerStageAction.closeCustomerStageTransferOrder(isTransferOrderSuccess);
    };

    // 上移客户阶段
    customerStageOrderUp = (customerStage) => {
        CustomerStageAction.customerStageOrderUp(customerStage);
    };

    // 下移客户阶段
    customerStageOrderDown = (customerStage) => {
        CustomerStageAction.customerStageOrderDown(customerStage);
    };

    handleChangeCustomerStageOrder = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.topNav .customer-stage-top-btn:last-child span'), '保存对客户阶段的更改');
        let customerStageList = this.state.customerStageList;
        _.each(customerStageList, (item, index) => {
            item.color = CUSTOMER_STAGE_COLOR[index];
        });
        CustomerStageAjax.changeCustomerStageOrder(customerStageList).then( (result) => {
            if (result) {
                this.closeCustomerStageTransferOrder(true);
            } else {
                this.closeCustomerStageTransferOrder();
            }
        }, (errMsg) => {
            this.closeCustomerStageTransferOrder();
            message.error(errMsg || Intl.get('sales.process.change.order.failed', '变更客户阶段顺序失败'));
        } );
    };

    // 客户阶段唯一性校验
    getValidator = () => {
        return (rule, value, callback) => {
            let processValue = _.trim(value); // 文本框中的值
            let salesProcessList = this.props.salesProcessList; // 已存在的销售流程
            let isExist = _.find(salesProcessList, item => item.name === processValue);
            if (isExist && processValue !== this.props.saleProcesTitle) { // 和已存在的客户阶段名称是相同
                callback(Intl.get('customer.stage.exist.stage.tips', '该客户阶段已存在'));
            } else {
                callback();
            }
        };
    };

    // 编辑客户阶段（销售流程）的名称
    handleEditCustomerName = () => {
        this.props.form.validateFields((err, values) => {
            if (err) return;
            let customerName = _.trim(values.name);
            // 鼠标点击输入框，不做修改，则不需要发请求
            if (customerName === this.props.saleProcesTitle) {
                return;
            }
            this.setState({
                editCustomerNameLoading: true
            });
            let submitObj = {
                name: customerName,
                id: this.state.saleProcessId
            };
            CustomerStageAjax.updateSalesProcess(submitObj).then( (result) => {
                if (result) {
                    this.setState({
                        editCustomerNameLoading: false
                    });
                    this.props.changeSaleProcessFieldSuccess(submitObj);
                } else {
                    this.setState({
                        editCustomerNameLoading: false,
                        editCustomerNameMsgTips: Intl.get('common.edit.failed', '修改失败')
                    });
                }
            }, (errMsg) => {
                this.setState({
                    editCustomerNameLoading: false,
                    editCustomerNameMsgTips: errMsg || Intl.get('common.edit.failed', '修改失败')
                });
            } );
        });
    };
    // 鼠标移入输入框
    handleFocusInput = () => {
        this.setState({
            editCustomerNameMsgTips: ''
        });
    };

    // 处理添加客户阶段
    handleAddCustomerStage = () => {
        this.props.form.validateFields((err, values) => {
            if (err) return;
            let customerName = _.trim(values.name);
            let submitObj = {
                name: customerName,
                status: '1', // 默认是启用的状态
            };
            CustomerStageAjax.addSalesProcess(submitObj).then( (result) => {
                if (result && result.id) {
                    this.setState({
                        editCustomerNameLoading: false,
                        saleProcessId: result.id,
                    }, () => {
                        this.props.upDateSalesProcessList(result);
                    });
                } else {
                    this.setState({
                        editCustomerNameLoading: false,
                        editCustomerNameMsgTips: errMsg || Intl.get('common.save.failed', '保存失败')
                    });
                }
            }, (errMsg) => {
                this.setState({
                    editCustomerNameLoading: false,
                    editCustomerNameMsgTips: errMsg || Intl.get('common.save.failed', '保存失败')
                });
            } );
        });
    };

    // 渲染客户阶段名称
    renderCustomerStageName = () => {
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {
            colon: false,
            labelCol: {span: 2},
            wrapperCol: {span: 20},
        };
        const editCustomerNameMsgTips = this.state.editCustomerNameMsgTips;

        return (
            <Form layout='horizontal' className="form">
                <FormItem
                    {...formItemLayout}
                    label={Intl.get('common.definition', '名称')}
                >
                    {getFieldDecorator('name', {
                        initialValue: this.props.saleProcesTitle,
                        rules: [{
                            validator: this.getValidator()
                        }, nameRule(Intl.get('weekly.report.customer.stage', '客户阶段'))]
                    })(
                        <Input
                            placeholder={Intl.get('crm.order.stage.name.placeholder', '请输入阶段名称')}
                            className={this.state.editCustomerNameMsgTips ? 'input-red-border' : ''}
                            onBlur={this.handleEditCustomerName}
                            onFocus={this.handleFocusInput}
                        />
                    )}
                    {
                        this.state.editCustomerNameLoading ? <Icon type="loading"/> : null
                    }
                </FormItem>
                {
                    this.state.saleProcessId === '' ? (
                        <Button
                            type="ghost"
                            className="add-customer-stage-btn"
                            onClick={this.handleAddCustomerStage}
                        >
                            {Intl.get('common.save', '保存')}
                        </Button>
                    ) : null
                }
                {
                    editCustomerNameMsgTips ? (
                        <div className="customer-name-check">
                            {editCustomerNameMsgTips}
                        </div>
                    ) : null
                }
            </Form>
        );
    };

    //渲染操作按钮区
    renderTopNavOperation = () => {
        let length = _.get(this.state.customerStageList, 'length');
        let disabled = false;
        let title = '';
        if (length > 7) {
            disabled = true;
            title = Intl.get('sales.process.customer.stage.toplimit', '客户阶段个数已达上限（8个）');
        }
        return (
            <div className='condition-operator'>
                <div className="customer-stage-operator">
                    <PrivilegeChecker
                        check={CUSTOMER_STAGE_PRIVILEGE.CREATE_SPECIFIC_STAGE}
                        className="add-customer-stage-btn"
                    >
                        {title ? (
                            <Popover content={title}>
                                <Button
                                    type="ghost"
                                    className="customer-stage-top-btn btn-item"
                                    disabled={disabled}
                                >
                                    <Icon type="plus" />
                                    {Intl.get('customer.stage.add.stage', '添加一个客户阶段')}
                                </Button>
                            </Popover>
                        ) : (
                            <Button
                                type="ghost"
                                className="customer-stage-top-btn btn-item"
                                onClick={this.showCustomerStageForm.bind(this, 'addCustomerStage')}
                                data-tracename="添加一个客户阶段"
                            >
                                <Icon type="plus" />
                                {Intl.get('customer.stage.add.stage', '添加一个客户阶段')}
                            </Button>
                        )}
                    </PrivilegeChecker>
                    <div className="customer-stage-change-order">
                        {
                            this.state.isShowCustomerStageTransferOrder ?
                                (<div className="customer-stage-top-div-group">
                                    <div className="customer-stage-top-div">
                                        <Button
                                            type="ghost"
                                            className="customer-stage-top-btn btn-item"
                                            onClick={this.closeCustomerStageTransferOrder.bind(this)}
                                        >
                                            {Intl.get('common.cancel', '取消')}
                                        </Button>
                                    </div>
                                    <div className="customer-stage-top-div">
                                        <Button
                                            type="ghost"
                                            className="customer-stage-top-btn btn-item"
                                            onClick={this.handleChangeCustomerStageOrder.bind(this)}
                                        >
                                            {Intl.get('common.save', '保存')}
                                        </Button>
                                    </div>
                                </div>) : (
                                    <PrivilegeChecker
                                        check={CUSTOMER_STAGE_PRIVILEGE.UPDATE_SPECIFIC_STAGE}
                                    >
                                        <Button
                                            type="ghost"
                                            className="customer-stage-top-btn btn-item"
                                            onClick={this.showCustomerStageTransferOrder.bind(this)}
                                        >
                                            <i className='iconfont icon-transfer'></i>
                                            {Intl.get('sales.stage.change.sort', '变更顺序')}
                                        </Button>
                                    </PrivilegeChecker>
                                )
                        }
                    </div>
                </div>
            </div>
        );
    };

    retryGetOrderList = () => {
        let saleProcessId = this.state.saleProcessId;
        CustomerStageAction.getCustomerStageList(saleProcessId);
    };

    renderMsgTips = (errMsg) => {
        return (
            <div>
                <span>{errMsg},</span>
                <a className="retry-btn" onClick={this.retryGetOrderList}>
                    {Intl.get('user.info.retry', '请重试')}
                </a>
            </div>
        );
    };

    renderNoDataTipsOrErrMsg = () => {
        let noDataTips = Intl.get('sales.process.customer.stage.nodata.tips', '暂无客户阶段，请先添加');
        let errMsg = this.state.getCustomerStageListErrMsg;
        if (errMsg) {
            noDataTips = this.renderMsgTips(errMsg);
        }
        return (
            <NoDataIntro noDataTip={noDataTips}/>
        );
    };

    // 展开收起客户阶段详情（剧本、销售行为）
    toggleCustomerStageDetail = (item) => {
        CustomerStageAction.toggleCustomerStageDetail(item);
    };

    closeCustomerStagePanel = () => {
        let saleProcessId = this.state.saleProcessId;
        if (saleProcessId) {
            let upDateObj = {
                id: this.state.saleProcessId,
                customerStages: this.state.customerStageList
            };
            this.props.changeSaleProcessFieldSuccess(upDateObj);

        }
        CustomerStageAction.setInitialData();
        this.props.closeCustomerStagePanel();
    };

    render() {
        let customerStageList = this.state.customerStageList;
        let length = _.get(customerStageList, 'length');
        let height = $(window).height() - BACKGROUG_LAYOUT_CONSTANTS.PADDING_HEIGHT;
        let containerHeight = height - 2 * BACKGROUG_LAYOUT_CONSTANTS.TOP_ZONE_HEIGHT;
        if (this.props.saleProcessType === 'default') {
            containerHeight += BACKGROUG_LAYOUT_CONSTANTS.TOP_ZONE_HEIGHT;
        }
        const width = this.props.containerWidth - 100;
        return (
            <RightPanel
                showFlag={this.props.isShowCustomerStage}
                className="customer-stage-panel"
                data-tracename="客户阶段管理"
                style={{height: height, width: this.props.containerWidth}}
            >
                <RightPanelClose onClick={this.closeCustomerStagePanel}/>
                <div className="customer-stage-container">
                    <div className="customer-stage-content" style={{height: height}}>
                        <div className="customer-stage-top-name">
                            {
                                this.props.saleProcessType === 'custom' ? (
                                    this.renderCustomerStageName()
                                ) : (
                                    <span className="default-name">{this.props.saleProcesTitle}</span>
                                )
                            }
                        </div>
                        {
                            this.state.saleProcessId ? (
                                <div>
                                    {
                                        this.props.saleProcessType === 'custom' ? (
                                            <div className="customer-stage-top">
                                                {this.renderTopNavOperation()}
                                            </div>
                                        ) : null
                                    }

                                    <GeminiScrollBar style={{height: containerHeight}}>
                                        {
                                            this.state.loading ? (
                                                <Spinner/>
                                            ) : null
                                        }
                                        {
                                            !this.state.loading && (length === 0 || this.state.getCustomerStageListErrMsg) ?
                                                this.renderNoDataTipsOrErrMsg() : null
                                        }
                                        <div className="customer-stage-table-block">
                                            <ul className="customer-stage-timeline">
                                                {
                                                    _.map(customerStageList, (item, idx) => {
                                                        return (
                                                            <li className="customer-stage-timeline-item" key={idx}>
                                                                <div className="customer-stage-timeline-item-tail"></div>
                                                                <div className="customer-stage-timeline-item-head">
                                                                    <i className='iconfont icon-order-arrow-down'></i>
                                                                </div>
                                                                <div className="customer-stage-timeline-item-right"></div>
                                                                <CustomerStageInfo
                                                                    width={width}
                                                                    customerStage={item}
                                                                    toggleCustomerStageDetail={this.toggleCustomerStageDetail}
                                                                    showCustomerStageModalDialog={this.showCustomerStageModalDialog}
                                                                    closeCustomerStageModalDialog={this.closeCustomerStageModalDialog}
                                                                    showCustomerStageForm={this.showCustomerStageForm}
                                                                    deleteCustomerStage={this.deleteCustomerStage}
                                                                    customerStageOrderUp={this.customerStageOrderUp}
                                                                    customerStageOrderDown={this.customerStageOrderDown}
                                                                    isShowCustomerStageTransferOrder={this.state.isShowCustomerStageTransferOrder}
                                                                    showCustomerStageDetail={this.showCustomerStageDetail}
                                                                    closeCustomerStageDetail={this.closeCustomerStageDetail}
                                                                    saveCustomerStageSettingPlay={this.saveCustomerStageSettingPlay}
                                                                    salesBehaviorList={this.state.salesBehaviorList}
                                                                    saleProcessId={this.state.saleProcessId}
                                                                    autoConditionsList={this.state.autoConditionsList}
                                                                    saleProcessType={this.props.saleProcessType}
                                                                />
                                                            </li>
                                                        );
                                                    })
                                                }
                                            </ul>
                                        </div>
                                    </GeminiScrollBar>
                                </div>
                            ) : null
                        }
                    </div>
                    {
                        this.state.isShowCustomerStageForm ? (
                            <CustomerStageForm
                                customerStage={this.state.currentCustomerStage}
                                isShowCustomerStageForm={this.state.isShowCustomerStageForm}
                                cancelCustomerStageForm={this.closeCustomerStageForm}
                                submitCustomerStageForm={this.submitCustomerStageForm}
                            />) : null
                    }
                </div>
            </RightPanel>
        );
    }
}

CustomerStage.propTypes = {
    saleProcessId: PropTypes.string,
    closeCustomerStagePanel: PropTypes.func,
    containerWidth: PropTypes.number,
    isShowCustomerStage: PropTypes.bool,
    saleProcesTitle: PropTypes.string,
    salesProcessList: PropTypes.array,
    form: PropTypes.object,
    changeSaleProcessFieldSuccess: PropTypes.func,
    upDateSalesProcessList: PropTypes.func,
    saleProcessType: PropTypes.string,
};

export default Form.create()(CustomerStage);