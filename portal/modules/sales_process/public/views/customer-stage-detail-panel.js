/**
 * Created by hzl on 2019/9/2.
 * 客户阶段详情面板
 */
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import {Button, Icon, message} from 'antd';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import BasicEditInputField from 'CMP_DIR/basic-edit-field-new/input';
import SalesProcessStore from '../store';
import SalesProcessAjax from '../ajax';
import {nameRule} from 'PUB_DIR/sources/utils/validate-util';
import GeminiScrollBar from 'CMP_DIR/react-gemini-scrollbar';
import CustomerStageTimeLine from './customer-stage-timeline';
import CustomerStageForm from 'CMP_DIR/basic-form';
import { CUSTOMER_STAGE_COLOR } from 'PUB_DIR/sources/utils/consts';
import StageSelectTeamUser from './stage-select-team-user';
import classNames from 'classnames';
import { DragDropContext, Droppable} from 'react-beautiful-dnd';
import customerStagePrivilege from '../privilege-const';

import Trace from 'LIB_DIR/trace';

const EDIT_FEILD_LESS_WIDTH = 420;

class CustomerStageDetailPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentCustomerStage: props.currentCustomerStage, // 当前客户阶段信息
            customerStageList: _.get(props, 'currentCustomerStage.customer_stages'), // 阶段列表
            salesProcessList: props.salesProcessList, // （销售流程列表）
            isDeleteFlag: false, // 是否删除，默认false不删除
            customerStageNameShowType: 'text', // 客户阶段名称显示的类型,默认text
            isShowCustomerStageTransferOrder: false, // 是否变更客户阶段顺序
            isShowAddCustomerStage: false, // 是否显示添加客户阶段
            isloading: false, // 添加或是编辑阶段时的加载loading
            isDeletingStageLoading: false, // 删除某个客户阶段中具体的客户阶段
            isEditCustomerScope: false, // 是否编辑适用范围，默认false
            ...SalesProcessStore.getState(),
        };
    }

    componentWillReceiveProps(nextProps) {
        if (_.get(nextProps, 'currentCustomerStage.id') !== this.state.currentCustomerStage.id) {
            this.setState({
                currentCustomerStage: nextProps.currentCustomerStage,
                salesProcessList: nextProps.salesProcessList,
                customerStageList: _.get(nextProps, 'currentCustomerStage.customer_stages')
            });
        }
    }

    componentDidMount() {
        SalesProcessStore.listen(this.onChange);
    }

    componentWillUnmount() {
        SalesProcessStore.unlisten(this.onChange);
    }

    onChange = () => {
        this.setState(SalesProcessStore.getState());
    };

    changeSaleProcessFieldSuccess = (saleProcess) => {
        _.isFunction(this.props.changeSaleProcessFieldSuccess) && this.props.changeSaleProcessFieldSuccess(saleProcess);
    };

    saveEditCustomerStageName = (type, saveObj, successFunc, errorFunc) => {
        Trace.traceEvent(ReactDOM.findDOMNode(this), `保存客户阶段${type}的修改`);
        SalesProcessAjax.updateSalesProcess(saveObj).then((result) => {
            if (result) {
                if (_.isFunction(successFunc)) successFunc();
                this.changeSaleProcessFieldSuccess(saveObj);
            } else {
                if (_.isFunction(errorFunc)) errorFunc();
            }
        }, (errorMsg) => {
            if (_.isFunction(errorFunc)) errorFunc(errorMsg);
        });
    };

    handleCancel = (event) => {
        event.preventDefault();
        Trace.traceEvent(event, '关闭编辑客户阶段面板');
        this.props.closeCustomerStagePanel();
    };

    getContainerHeight = () => {
        const PADDING = 100;
        return $('body').height()
            - $('.member-detail-container .right-panel-modal-title').outerHeight(true)
            - $('.member-detail-container .ant-tabs-bar').outerHeight(true)
            - PADDING;
    };

    // 添加客户阶段
    handleAddCustomerStage = () => {
        let customerStageList = this.state.customerStageList;
        let length = customerStageList.length;
        customerStageList.push({order: length + 1});
        this.setState({
            isShowAddCustomerStage: true,
            customerStageList: customerStageList
        });
    };

    handleCancelCustomerStageForm = () => {
        let customerStageList = this.state.customerStageList;
        customerStageList.pop();
        this.setState({
            isShowAddCustomerStage: false,
            customerStageList: customerStageList
        });
    };

    // 提交保存表单
    handleSubmitCustomerStageForm = (submitObj) => {
        let saleProcessId = this.state.currentCustomerStage.id;
        this.setState({
            isloading: true
        });
        if (submitObj.id) { // 编辑客户阶段
            SalesProcessAjax.editCustomerStage(submitObj, saleProcessId).then( (result) => {
                let customerStageList = this.state.customerStageList;
                let changeStage = _.find(customerStageList, item => item.id === submitObj.id);
                let order = -1;
                if (changeStage) {
                    order = changeStage.order;
                }
                submitObj.order = order;
                this.setState({
                    isloading: false
                });
                if (result) {
                    customerStageList[order - 1] = submitObj;
                    this.setState({
                        customerStageList: customerStageList,
                    });
                    let updateObj = {
                        id: saleProcessId,
                        customerStages: this.state.customerStageList
                    };
                    // 更新列表中阶段的值
                    this.changeSaleProcessFieldSuccess(updateObj);
                    message.success(Intl.get('crm.218', '修改成功！'));
                } else {
                    message.error(Intl.get('crm.219', '修改失败！'));
                }
            }, (errMsg) => {
                this.setState({
                    isloading: false
                });
                message.error(errMsg || Intl.get('crm.219', '修改失败！'));
            } );
        } else { // 添加一个客户阶段
            let customerStageList = this.state.customerStageList;
            let order = _.get(customerStageList, 'length');
            submitObj.color = CUSTOMER_STAGE_COLOR[order];
            submitObj.order = order; // 需要传客户阶段的序号
            SalesProcessAjax.addCustomerStage(submitObj, saleProcessId).then( (result) => {
                if (result && result.id) {
                    customerStageList[order - 1] = result;
                    this.setState({
                        customerStageList: customerStageList,
                        isShowAddCustomerStage: false,
                    });
                    let updateObj = {
                        id: saleProcessId,
                        customerStages: this.state.customerStageList
                    };
                    // 更新列表中阶段的值
                    this.changeSaleProcessFieldSuccess(updateObj);
                    message.success(Intl.get('crm.216', '添加成功！'));
                } else {
                    this.setState({
                        isShowAddCustomerStage: false,
                    });
                    message.error(Intl.get('member.add.failed', '添加失败！'));
                }
            }, (errMsg) => {
                this.setState({
                    isShowAddCustomerStage: false,
                });
                message.error(errMsg || Intl.get('member.add.failed', '添加失败！'));
            });
        }
    };


    // 添加客户阶段
    renderAddCustomerStage = () => {
        let currentData = {};
        return (
            <CustomerStageForm
                isShowSaveBtn={true}
                currentData={currentData}
                loading={this.state.isloading}
                customerStageList={this.state.customerStageList}
                handleCancel={this.handleCancelCustomerStageForm}
                handleSubmit={this.handleSubmitCustomerStageForm}
            />
        );
    };

    // 确认删除某个客户阶段中的具体的某个阶段
    handleConfirmDeleteStage = (customerStage, cb) => {
        let customerStageId = customerStage.id;
        let saleProcessId = this.state.currentCustomerStage.id;
        let customerStageList = this.state.customerStageList;
        let changeStageList = _.cloneDeep(customerStageList);
        let deleteCustomerStage = _.find(changeStageList, item => item.id === customerStageId);
        _.remove(changeStageList, customerStage); // 删除后的客户阶段
        let stageColorsArray = [];
        _.each(changeStageList, (item, index) => {
            stageColorsArray.push({id: item.id, color: CUSTOMER_STAGE_COLOR[index]});
        });
        let order = deleteCustomerStage.order; // 删除客户阶段的位置
        let submitObj = {
            delete_ids: customerStageId,
            stage_colors: stageColorsArray
        };
        this.setState({
            isDeletingStageLoading: true
        });
        SalesProcessAjax.deleteCustomerStageColor(submitObj, saleProcessId).then( (result) => {
            if (result === 'true') {
                this.setState({
                    customerStageList: changeStageList,
                    isDeletingStageLoading: false
                });
                let updateObj = {
                    id: saleProcessId,
                    customerStages: changeStageList
                };
                // 更新列表中阶段的值
                this.changeSaleProcessFieldSuccess(updateObj);
                message.success(Intl.get('crm.138', '删除成功！'));
                _.isFunction(cb) && cb();
            } else {
                message.error(Intl.get('crm.139', '删除失败！'));
                this.setState({
                    isDeletingStageLoading: false
                });
            }
        }, (errMsg) => {
            this.setState({
                isDeletingStageLoading: false
            });
            message.error(errMsg || Intl.get('crm.139', '删除失败！'));
        } );
    };

    // 编辑客户阶段的适用范围
    handleEditCustomerScope = () => {
        this.setState({
            isEditCustomerScope: true
        });
    };

    // 取消客户阶段的适用范围
    handleCancelEditCustomerScope = () => {
        this.setState({
            isEditCustomerScope: false
        });
    };

    handleTransferOrderCustomerStage = (source, destination, draggableId) => {
        let customerStageList = this.state.customerStageList;
        let sourceIndex = source.index;
        let destinationIndex = destination.index;
        // 被移动的阶段数据
        let destinationStage = _.find(customerStageList, stage => stage.order === destinationIndex + 1);
        destinationStage.order = sourceIndex + 1;
        destinationStage.color = CUSTOMER_STAGE_COLOR[sourceIndex];
        // 拖动的阶段数据
        let dragStage = _.find(customerStageList, stage => stage.id === draggableId);
        dragStage.order = destinationIndex + 1;
        dragStage.color = CUSTOMER_STAGE_COLOR[destinationIndex];

        customerStageList = customerStageList.sort((item1, item2) => {
            return item1.order - item2.order;
        });
        SalesProcessAjax.changeCustomerStageOrder(customerStageList).then( (result) => {
            if (result) {
                let updateObj = {
                    id: this.state.currentCustomerStage.id,
                    customerStages: customerStageList
                };
                // 更新列表中阶段的值
                this.changeSaleProcessFieldSuccess(updateObj);
                message.success(Intl.get('sales.process.change.order.success', '变更客户阶段顺序成功'));
            } else {
                message.error(Intl.get('sales.process.change.order.failed', '变更客户阶段顺序失败'));
            }
        }, (errMsg) => {
            message.error(errMsg || Intl.get('sales.process.change.order.failed', '变更客户阶段顺序失败'));
        } );
    }

    onDragEnd = (dragResult) => {
        const {source, destination, draggableId} = dragResult;
        // dropped outside the list
        if (!destination) return;
        if (source.index === destination.index && destination.droppableId === source.droppableId) {
            return;
        } else {
            this.handleTransferOrderCustomerStage(source, destination, draggableId);
        }
    };

    // 渲染右侧面板内容区的值
    renderContent(){
        const currentCustomerStage = this.state.currentCustomerStage;
        let customerStages = this.state.customerStageList;
        const length = customerStages.length;
        let teams = _.map(currentCustomerStage.teams, 'name');
        let users = _.map(currentCustomerStage.users, 'name');
        let scope = _.concat(teams, users);
        let height = this.getContainerHeight();
        return (
            <div className="stage-detail-wrap" style={{height: height}}>
                <GeminiScrollBar style={{height: height}}>
                    <div className="stage-content-set-stage">
                        <div className="stage-set-title-zone">
                            <div className="stage-label">
                                {Intl.get('customer.stage.stage.title', '阶段设置')}
                            </div>
                            <div className="operate-zone">
                                {
                                    hasPrivilege(customerStagePrivilege.CREATE_SPECIFIC_STAGE) ? (
                                        length > 7 ? null : (
                                            <span
                                                onClick={this.handleAddCustomerStage}
                                                className="add-stage"
                                            >
                                                <i className='iconfont icon-plus' />
                                            </span>
                                        )
                                    ) : null
                                }
                            </div>
                        </div>
                        <DragDropContext onDragEnd={this.onDragEnd}>
                            <Droppable droppableId={_.get(currentCustomerStage, 'id', '')}>
                                {(provided, snapshot) => (
                                    <div className='stage-board-wrap' ref={provided.innerRef}>
                                        <div className={classNames('stage-content', {'dragging-over-style': snapshot.isDraggingOver})}>
                                            <div className="customer-stage-table-block">
                                                <ul className="customer-stage-timeline">
                                                    {
                                                        _.map(customerStages, (item, idx) => {
                                                            let cls = 'customer-stage-timeline-item-head';
                                                            cls += ' customer-stage-color-lump' + idx;
                                                            return (
                                                                <li className="customer-stage-timeline-item" key={idx}>
                                                                    <div className="customer-stage-timeline-item-tail"></div>
                                                                    <div className={cls}>
                                                                        <i className='iconfont icon-order-arrow-down'></i>
                                                                    </div>
                                                                    <div className="customer-stage-timeline-item-right"></div>
                                                                    <CustomerStageTimeLine
                                                                        index={idx}
                                                                        customerStage={item}
                                                                        customerStageList={this.state.customerStageList}
                                                                        handleCancelCustomerStageForm={this.handleCancelCustomerStageForm}
                                                                        handleSubmitCustomerStageForm={this.handleSubmitCustomerStageForm}
                                                                        isDeletingStageLoading={this.state.isDeletingStageLoading}
                                                                        handleConfirmDeleteStage={this.handleConfirmDeleteStage}
                                                                        isEditLoading={this.state.isloading}
                                                                    />
                                                                </li>
                                                            );
                                                        })
                                                    }
                                                </ul>
                                                {
                                                    this.state.isShowAddCustomerStage ? (
                                                        <div className="add-customer-stage-zone">
                                                            {this.renderAddCustomerStage()}
                                                        </div>
                                                    ) : null
                                                }
                                            </div>
                                        </div>
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>

                    </div>
                    <div className="stage-content-team-user">
                        <div className="stage-set-title-zone">
                            <div className="stage-label">
                                {Intl.get('sales.process.suitable.objects', '适用范围')}
                            </div>
                            <div className="operate-zone">
                                {
                                    hasPrivilege(customerStagePrivilege.UPDATE_SPECIFIC_STAGE) ? (
                                        <span onClick={this.handleEditCustomerScope}>
                                            <i className='icon-update iconfont handle-btn-item' />
                                        </span>
                                    ) : null
                                }

                            </div>
                        </div>
                        {
                            this.state.isEditCustomerScope ? (
                                <div className="select-zone">
                                    <StageSelectTeamUser
                                        treeSelectData={this.props.treeSelectData}
                                        changeSaleProcessFieldSuccess={this.changeSaleProcessFieldSuccess}
                                        cancelEditCustomerScope={this.handleCancelEditCustomerScope}
                                        currentCustomerStage={this.state.currentCustomerStage}
                                    />
                                </div>
                            ) : (
                                <div className="stage-content">
                                    {_.join(scope, '、')}
                                </div>
                            )
                        }

                    </div>
                </GeminiScrollBar>
            </div>
        );
    }

    // 客户阶段唯一性校验
    getValidator = () => {
        return (rule, value, callback) => {
            let stageName = _.trim(value); // 文本框中的值
            if (stageName) {
                let salesProcessList = this.state.salesProcessList; // 已存在的客户阶段
                let isExist = _.find(salesProcessList, item => item.name === stageName);
                if (isExist && stageName !== this.state.currentCustomerStage.name) { // 和已存在的客户阶段名称是相同
                    callback(Intl.get('sales.process.name.verify.exist', '该客户阶段已存在'));
                } else {
                    callback();
                }
            } else {
                callback(Intl.get('common.name.rule', '{name}名称只能包含汉字、字母、数字、横线、下划线、点、中英文括号，且长度在1到50（包括50）之间', {name: Intl.get('weekly.report.customer.stage', '客户阶段')}));
            }
        };
    };

    handleDeleteCustomerStage = () => {
        this.setState({
            isDeleteFlag: true
        });
    };

    handleConfirmDeleteCustomerStage = (currentCustomerStage) => {
        this.props.handleConfirmDeleteCustomerStage(currentCustomerStage);
        this.setState({
            isDeleteFlag: false
        }, () => {
            this.props.closeCustomerStagePanel();
        });
    };

    cancelDeleteCustomerStage = (currentCustomerStage) => {
        this.setState({
            isDeleteFlag: false
        });
        this.props.cancelDeleteCustomerStage(currentCustomerStage);
    };

    handleDisplayTypeChange = (type) => {
        this.setState({
            customerStageNameShowType: type
        });
    }

    // 渲染客户阶段名称
    renderRightPanelTitle = () => {
        const currentCustomerStage = this.state.currentCustomerStage;
        const id = currentCustomerStage.id;
        const name = currentCustomerStage.name;
        let cls = classNames('customer-stage-zone', {
            'edit-content-zone': this.state.customerStageNameShowType === 'edit',
        });
        return (
            <div className="right-panel-title-zone">
                <div className={cls}>
                    <BasicEditInputField
                        width={EDIT_FEILD_LESS_WIDTH}
                        id={id}
                        displayType={this.state.customerStageNameShowType}
                        value={name}
                        field='name'
                        type="text"
                        hasEditPrivilege={hasPrivilege(customerStagePrivilege.UPDATE_SPECIFIC_STAGE)}
                        validators={[{validator: this.getValidator()}]}
                        placeholder={Intl.get('customer.stage.name.placeholder', '请输入客户阶段')}
                        saveEditInput={this.saveEditCustomerStageName.bind(this, 'name')}
                        onDisplayTypeChange={this.handleDisplayTypeChange}
                    />
                </div>
                {
                    this.state.customerStageNameShowType === 'text' ? (
                        <div className="delete-operator">
                            {
                                this.state.isDeleteFlag ? (
                                    <span className="delete-buttons">
                                        <Button
                                            className="delete-confirm"
                                            disabled={this.props.isDeletingLoading}
                                            onClick={this.handleConfirmDeleteCustomerStage.bind(this, currentCustomerStage)}
                                        >
                                            {
                                                this.props.isDeletingLoading ? <Icon type="loading"/> : null
                                            }
                                            {Intl.get('crm.contact.delete.confirm', '确认删除')}
                                        </Button>
                                        <Button
                                            className="delete-cancel"
                                            onClick={this.cancelDeleteCustomerStage.bind(this, currentCustomerStage)}
                                        >
                                            {Intl.get('common.cancel', '取消')}
                                        </Button>
                                    </span>
                                ) : (
                                    <span
                                        title={Intl.get('customer.stage.delete.stage', '删除客户阶段')}
                                        onClick={this.handleDeleteCustomerStage}
                                        data-tracename={'点击删除' + name + '客户阶段按钮'}
                                    >
                                        <i className="iconfont icon-delete handle-btn-item"></i>
                                    </span>
                                )
                            }
                        </div>
                    ) : null
                }
            </div>
        );
    };

    render() {
        return (
            <RightPanelModal
                className="customer-stage-detail-container"
                isShowMadal={false}
                isShowCloseBtn={true}
                onClosePanel={this.handleCancel.bind(this)}
                title={this.renderRightPanelTitle()}
                content={this.renderContent()}
                dataTracename='编辑客户阶段'
            />);
    }

}

CustomerStageDetailPanel.propTypes = {
    currentCustomerStage: PropTypes.object,
    salesProcessList: PropTypes.array,
    changeSaleProcessFieldSuccess: PropTypes.func,
    closeCustomerStagePanel: PropTypes.func,
    handleConfirmDeleteCustomerStage: PropTypes.func,
    cancelDeleteCustomerStage: PropTypes.func,
    isDeletingLoading: PropTypes.boolean,
    treeSelectData: PropTypes.array,
};

export default CustomerStageDetailPanel;