/**
 * Created by hzl on 2019/8/13.
 * 销售行为
 */
import {Icon } from 'antd';
import { AntcSelect } from 'antc';
const Option = AntcSelect.Option;
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
import CustomerStageAjax from '../ajax';
import CustomerStageAction from '../action/customer-stage-action';

class SaleBehaviorPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            customerStage: props.customerStage, // 客户阶段
            itemKeys: this.getInitItemKeys(props.customerStage),// 用来处理增删数据的key
            sourceSalesBehaviorList: _.cloneDeep(props.salesBehaviorList),
            salesBehaviorList: props.salesBehaviorList, // 销售行为列表
            taskNames: this.getInitTaskNames(props.customerStage), // 选择的任务名称
            actionNames: this.getInitActionNames(props.customerStage), // 选择的动作名称
            loading: false, // loading
            submitErrorMsg: '', // 保存失败提示信息
        };
    }

    // 用来处理增删数据的key
    getInitItemKeys = (customerStage) => {
        let salesActivities = customerStage.sales_activities;
        let length = _.get(salesActivities, 'length');
        if (length) {
            return _.map(salesActivities, (item, index) => index);
        } else {
            return [0];
        }
    };

    getInitTaskNames = (customerStage) => {
        let salesActivities = customerStage.sales_activities;
        let length = _.get(salesActivities, 'length');
        if (length) {
            return _.map(salesActivities, 'name');
        } else {
            return [];
        }
    };

    getInitActionNames = (customerStage) => {
        let salesActivities = customerStage.sales_activities;
        let length = _.get(salesActivities, 'length');
        if (length) {
            let salesActions = _.map(salesActivities, 'sales_actions');
            return _.flatten(salesActions);
        } else {
            return [];
        }
    };

    // 删除元素
    handleDelItem = (key, index, size) => {
        if (index === 0 && size === 1) return;
        let itemKeys = this.state.itemKeys;
        itemKeys.splice(key, 1);
        // 删除选中的销售行为
        let customerStage = this.state.customerStage;
        let salesActivities = customerStage.sales_activities;
        salesActivities.splice(key, 1);
        let salesBehaviorList = _.cloneDeep(this.state.sourceSalesBehaviorList);
        let length = salesActivities.length;
        if (length) {
            _.each(salesActivities, taskItem => {
                let selectedBehavior = _.find(salesBehaviorList, item => item.name === taskItem.name);
                if (selectedBehavior) {
                    _.remove(salesBehaviorList, selectedBehavior);
                }
            });
        }
        let taskNames = this.state.taskNames;
        taskNames.splice(key, 1);

        let actionNames = this.state.actionNames;
        actionNames.splice(key, 1);
        this.setState({
            itemKeys: itemKeys,
            customerStage: customerStage,
            salesBehaviorList: salesBehaviorList,
            taskNames: taskNames,
            actionNames: actionNames

        });
    };

    // 添加元素
    handleAddItem = () => {
        let itemKeys = this.state.itemKeys;
        // 元素key数组中最后一个元素的key
        let lastItemKey = _.get(itemKeys, `[${itemKeys.length - 1}]`, 0);
        // 新加元素的key
        let addItemKey = lastItemKey + 1;
        let customerStage = this.state.customerStage;
        let salesActivities = customerStage.sales_activities;
        let salesBehaviorList = _.cloneDeep(this.state.sourceSalesBehaviorList);
        let length = salesActivities.length;
        if (length) {
            _.each(salesActivities, taskItem => {
                let selectedBehavior = _.find(salesBehaviorList, item => item.name === taskItem.name);
                if (selectedBehavior) {
                    _.remove(salesBehaviorList, selectedBehavior);
                }
            });
        }
        itemKeys.push(addItemKey);
        this.setState({
            itemKeys: itemKeys,
            salesBehaviorList: salesBehaviorList
        });
    };

    handleSelectTask = (property, id, key, value) => {
        let customerStage = this.state.customerStage;
        let salesActivities = _.get(customerStage, 'sales_activities');
        if (id) { // 修改
            let target = _.find(salesActivities, item => item.id === id);
            if (target) {
                if (property === 'task') {
                    target.name = value;
                    target.sales_actions[0].name = '';
                    this.state.taskNames[key] = value;
                } else if (property === 'action'){
                    target.sales_actions[0].name = value;
                    this.state.actionNames[key].name = value;
                    // 获取需要遍历的销售行为列表
                    let salesBehaviorList = this.state.salesBehaviorList;
                    // 查找选中的销售任务项，是为了根据选中的动作找到对应action的值
                    let matchTaskObj = _.find(salesBehaviorList, item => item.name === target.name);
                    let salesActions = matchTaskObj && matchTaskObj.sales_action_templates || [];
                    if (salesActions.length) {
                        let actionObj = _.find(salesActions, item => item.name === value);
                        if (actionObj) {
                            target.sales_actions[0].action = actionObj.action;
                            this.state.actionNames[key].action = actionObj.action;
                        }
                    }
                }
            }

        } else { // 添加
            if (property === 'task') {
                this.state.taskNames[key] = value;
                salesActivities.push({name: value, sales_actions: []});
            } else if (property === 'action') {
                this.state.actionNames.push({name: value, action: ''});
                // 获取需要遍历的销售行为列表
                let salesBehaviorList = this.state.salesBehaviorList;
                salesActivities[key].sales_actions.push({name: value, action: ''});

                // 查找选中的销售任务项，是为了根据选中的动作找到对应action的值
                let matchTaskObj = _.find(salesBehaviorList, item => item.name === this.state.taskNames[key]);

                let salesActions = matchTaskObj && matchTaskObj.sales_action_templates || [];
                if (salesActions.length) {
                    let actionObj = _.find(salesActions, item => item.name === value);
                    if (actionObj) {
                        this.state.actionNames[key].action = actionObj.action;
                        salesActivities[key].sales_actions[0].action = actionObj.action;
                    }
                }
            }
        }

        this.setState({
            customerStage: customerStage,
            taskNames: this.state.taskNames,
            actionNames: this.state.actionNames
        });

    };

    // 获取销售行为的列表，已经选中的，在下面选项中不应该再次出现
    getSalesBehaviorList = () => {
        let salesActivities = this.state.customerStage.sales_activities;
        let salesBehaviorList = _.cloneDeep(this.state.salesBehaviorList);
        let length = salesActivities.length;
        if (length) {
            _.each(salesActivities, taskItem => {
                let selectedBehavior = _.find(salesBehaviorList, item => item.name === taskItem.name);
                if (selectedBehavior) {
                    _.remove(salesBehaviorList, selectedBehavior);
                }
            });
        }
        return salesBehaviorList;
    };

    getSalesActionOptions = (taskName) => {
        let salesBehaviorList = this.state.salesBehaviorList;
        let matchTaskObj = _.find(salesBehaviorList, item => item.name === taskName);
        if (matchTaskObj) {
            return _.map(matchTaskObj.sales_action_templates, actionItem =>
                <Option value={actionItem.name}>{actionItem.name}</Option>
            );
        } else {
            return null;
        }
    };

    renderItemContent = (key, index) => {
        let salesActivities = this.state.customerStage.sales_activities;
        let salesBehaviorList = this.state.salesBehaviorList;
        let length = salesActivities.length;
        let id = _.get(salesActivities[key], 'id');
        if (key < length && id) {
            let taskName = this.state.taskNames[key];
            let salesActionOptions = this.getSalesActionOptions(taskName); // 销售动作下拉框
            let actionName = _.get(salesActivities[key], 'sales_actions[0].name');
            return (
                <div className="item-select">
                    <AntcSelect
                        value={taskName}
                        style={{width: 150 }}
                        onChange={this.handleSelectTask.bind(this,'task', id, key)}
                        className="select-task"
                    >
                        {
                            _.map(salesBehaviorList, taskItem =>
                                <Option value={taskItem.name}>{taskItem.name}</Option>
                            )
                        }
                    </AntcSelect>
                    <AntcSelect
                        style={{width: 150 }}
                        value={actionName}
                        onChange={this.handleSelectTask.bind(this, 'action', id, key)}
                        className="select-action"
                    >
                        {salesActionOptions}
                    </AntcSelect>
                </div>
            );
        } else {
            return (
                <div className="item-select">
                    <AntcSelect
                        style={{width: 150 }}
                        placeholder={Intl.get('sales.process.select.task.placeholder', '请选择任务')}
                        onChange={this.handleSelectTask.bind(this, 'task', '', key)}
                        className="select-task"
                    >
                        {
                            _.map(salesBehaviorList, taskItem =>
                                <Option value={taskItem.name}>{taskItem.name}</Option>
                            )
                        }
                    </AntcSelect>
                    <AntcSelect
                        style={{width: 150 }}
                        placeholder={Intl.get('sales.process.select.action.placeholder', '请选择动作')}
                        onChange={this.handleSelectTask.bind(this, 'action', '', key)}
                        className="select-action"
                    >
                        {this.getSalesActionOptions(this.state.taskNames[key])}
                    </AntcSelect>
                </div>
            );
        }
    };

    handleSubmitSaleBehavior = () => {
        let customerStage = this.state.customerStage;
        const salesActivities = customerStage.sales_activities;
        const stageId = customerStage.id;
        const params = {
            saleProcessId: this.props.saleProcessId,
            stageId: stageId
        };
        this.setState({
            loading: true,
        });
        CustomerStageAjax.addCustomerStageSaleBehavior( salesActivities ,params).then( (result) => {
            this.setState({
                loading: false,
            });
            if (_.isArray(result)) {
                const updateSalesActivitiesObj = {
                    id: stageId,
                    flag: 'editBehavior',
                    salesActivities: result
                };
                CustomerStageAction.updateCustomerStageList(updateSalesActivitiesObj);
            } else {
                this.setState({
                    submitErrorMsg: Intl.get('sales.process.add.activity.failed', '添加销售行为失败')
                });
            }

        }, (errMsg) => {
            this.setState({
                loading: false,
                submitErrorMsg: errMsg || Intl.get('sales.process.add.activity.failed', '添加销售行为失败')
            });
        } );
    };

    closeCustomerStageDetail = () => {
        this.setState({
            customerStage: {}, // 客户阶段
            itemKeys: {},// 用来处理增删数据的key
            salesBehaviorList: [], // 销售行为列表
            taskNames: [], // 选择的任务名称
            actionNames: [], // 选择的动作名称
            loading: false, // loading
            submitErrorMsg: '', // 保存失败提示信息
        });
        this.props.closeCustomerStageDetail();
    };

    // 渲染销售行为的内容
    renderSalesBehaviorContent = () => {
        const itemKeys = this.state.itemKeys;
        let itemSize = _.get(itemKeys, 'length');
        return (
            <div className="dynamic-item-form">
                {_.map(itemKeys, (key, index) => {
                    return (
                        <div className="item-wrap" key={key}>
                            <div className="item-content">
                                {this.renderItemContent(key, index)}
                            </div>
                            {
                                index === 0 && itemSize === 1 ? null : (
                                    <div
                                        className="item-minus-button"
                                        onClick={this.handleDelItem.bind(this, key, index, itemSize)}
                                    >
                                        <Icon type="minus"/>
                                    </div>)
                            }
                        </div>);
                })}
                <div
                    className="item-plus-button"
                    onClick={this.handleAddItem.bind(this)}
                >
                    <Icon type="plus"/>
                </div>
                <SaveCancelButton
                    loading={this.state.loading}
                    saveErrorMsg={this.state.submitErrorMsg}
                    handleSubmit={this.handleSubmitSaleBehavior}
                    handleCancel={this.closeCustomerStageDetail}
                />
            </div>);
    };

    render = () => {
        return (
            <div className="sales-behavior-wrap">
                {this.renderSalesBehaviorContent()}
            </div>
        );
    }

}

function noop() {
}
SaleBehaviorPanel.defaultProps = {
    closeCustomerStageDetail: noop,
    saleProcessId: '',
    customerStage: {},
    salesBehaviorList: []
};
SaleBehaviorPanel.propTypes = {
    closeCustomerStageDetail: PropTypes.func,
    saleProcessId: PropTypes.string,
    customerStage: PropTypes.object,
    salesBehaviorList: PropTypes.array,
};


export default SaleBehaviorPanel;