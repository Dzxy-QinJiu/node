/**
 * 合同基本资料相关面板共用部分
 *
 * 包括共用状态和方法的定义以及共用字段的渲染
 */

import {Form, Input, Select, DatePicker, Radio, Icon} from 'antd';

const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const Validation = require('rc-form-validation-for-react16');
const Validator = Validation.Validator;
const extend = require('extend');
const AutosizeTextarea = require('../../../components/autosize-textarea');
import ajax from '../common/ajax';
import routeList from '../common/route';

const customerAjax = require('../../common/public/ajax/customer');
import {
    CATEGORY,
    CONTRACT_STAGE,
    STAGE_AUDIT,
    CONTRACT_LABEL,
    LABEL_NEW_SIGNING,
    PURCHASE_TYPE,
    COST_TYPE
} from '../consts';
import rightPanelUtil from '../../../components/rightPanel';

const RightPanelSubmit = rightPanelUtil.RightPanelSubmit;
import {VIEW_TYPE} from '../consts';
import {regex} from 'ant-utils';
import {getNumberValidateRule} from 'PUB_DIR/sources/utils/validate-util';

const formItemLayout = {
    labelCol: {span: 5},
    wrapperCol: {span: 18},
};

const formItemLayout2 = {
    labelCol: {span: 5},
    wrapperCol: {span: 18},
};

let queryCustomerTimeout = null;

export default {
    getInitialState: function() {
        let formData = _.extend(true,{}, this.props.contract);
        //所属客户是否是选择的，以数组的形式记录了各个所属客户在输入后是否经过了点击选择的过程
        let belongCustomerIsChoosen = [];

        if (!formData.customers) {
            formData.customers = [{}];
        } else {
            //编辑已有所属客户时，将选中状态都设为true
            belongCustomerIsChoosen = _.map(formData.customers, customer => true);
        }

        return {
            formData,
            customerList: [],
            belongCustomerErrMsg: [''],
            belongCustomerIsChoosen,
            buyerList: [],
        };
    },
    //输入客户名
    enterCustomer: function(field, e) {
        const value = _.trim(e.target.value);
        let {formData} = this.state;

        formData[field] = value;
        //复制到甲方
        if (field === 'customer_name') {
            formData['buyer'] = value;
        }
        this.setState({formData});
    },
    queryCustomer: function(index, keyword) {
        const fieldName = 'belong_customer' + index;

        let stateObj = {
            formData: this.state.formData,
            belongCustomerIsChoosen: this.state.belongCustomerIsChoosen,
        };


        //更新输入框内容
        stateObj.formData.customers[index].customer_name = keyword;

        //将客户状态设为未选择
        stateObj.belongCustomerIsChoosen[index] = false;

        this.setState(stateObj);

        if (queryCustomerTimeout) {
            clearTimeout(queryCustomerTimeout);
        }

        queryCustomerTimeout = setTimeout(() => {
            customerAjax.getCustomerSuggestListAjax().sendRequest({
                q: keyword
            }).success(list => {
                let newState = {
                    customerList: list,
                    belongCustomerErrMsg: _.clone(this.state.belongCustomerErrMsg),
                };

                if (_.isArray(list) && list.length) {
                    newState.belongCustomerErrMsg[index] = '';
                } else {
                    newState.belongCustomerErrMsg[index] = Intl.get('contract.177', '没有找到符合条件的客户，请更换关键词查询');
                }

                this.setState(newState, () => {
                    this.refs.validation.forceValidate([fieldName]);
                });
            }).error(() => {
                let newState = {
                    belongCustomerErrMsg: _.clone(this.state.belongCustomerErrMsg),
                };

                newState.belongCustomerErrMsg[index] = Intl.get('errorcode.61', '获取客户列表失败');

                this.setState(newState, () => {
                    this.refs.validation.forceValidate([fieldName]);
                });
            });
        }, 500);
    },
    renderNumField: function() {
        let rules = [{required: true, message: Intl.get('contract.57', '请填写合同号')}];

        if (this.props.validateNumRepeat) {
            rules.push({validator: this.checkNumExist});
        }

        return (
            <FormItem
                {...formItemLayout}
                label={Intl.get('contract.24', '合同号')}
                validateStatus={this.getValidateStatus('num')}
                help={this.getHelpMessage('num')}
                required
            >
                <Validator trigger="onBlur" rules={rules}>
                    <Input
                        ref="num"
                        name="num"
                        value={this.state.formData.num}
                        onChange={this.setField.bind(this, 'num')}
                    />
                </Validator>
            </FormItem>
        );
    },
    getCustomerOptions: function() {
        return this.state.customerList.map((customer, index) => {
            return <Option key={index} value={customer.customer_id}>{customer.customer_name}</Option>;
        });
    },
    getBuyerOptions: function() {
        return this.state.buyerList.map(buyer => {
            return <Option key={buyer.customer_name} value={buyer.customer_name}>{buyer.customer_name}</Option>;
        });
    },
    renderCustomerField: function() {
        return (
            <FormItem
                {...formItemLayout}
                label={Intl.get('crm.41', '客户名')}
                validateStatus={this.getValidateStatus('customer_name')}
                help={this.getHelpMessage('customer_name')}
                required
            >
                <Validator rules={[{
                    required: true,
                    message: Intl.get('contract.58', '请填写客户名')
                }, {
                    pattern: regex.customerNameRegex,
                    message: Intl.get('crm.197', '客户名称只能包含汉字、字母、数字、横线、下划线、点、中英文括号等字符，且长度在1到50（包括50）之间')
                }]}>
                    <Input
                        name="customer_name"
                        value={this.state.formData.customer_name}
                        onChange={this.enterCustomer.bind(this, 'customer_name')}
                    />
                </Validator>
            </FormItem>
        );
    },
    //获取所属客户验证规则
    getBelongCustomerValidateRules(index) {
        return [{
            validator: (rule, value, callback) => {
                if (this.state.belongCustomerErrMsg[index]) {
                    callback(this.state.belongCustomerErrMsg[index]);
                } else {
                    if (this.state.belongCustomerIsChoosen[index]) {
                        callback();
                    } else {
                        callback(Intl.get('contract.176', '请选择所属客户'));
                    }
                }
            }
        }];
    },
    scrollBottom() {
        const scrollView = $('.belong-customer-form').closest('.gm-scroll-view');
        const scrollContent = scrollView.children();
        const scrollHeight = scrollContent.height();
        scrollView.scrollTop(scrollHeight);
    },
    addBelongCustomer() {
        let {formData,belongCustomerErrMsg,belongCustomerIsChoosen} = this.state;

        formData.customers.push({});
        belongCustomerErrMsg.push('');
        belongCustomerIsChoosen.push(false);

        this.setState({
            formData,
            belongCustomerErrMsg,
            belongCustomerIsChoosen
        }, () => {
            // this.scrollBottom();
        });
    },
    deleteBelongCustomer(index) {
        let {formData,belongCustomerErrMsg,belongCustomerIsChoosen} = this.state;

        formData.customers.splice(index, 1);
        belongCustomerErrMsg.splice(index, 1);
        belongCustomerIsChoosen.splice(index, 1);

        this.setState({
            formData,
            belongCustomerErrMsg,
            belongCustomerIsChoosen
        });
    },
    //渲染所属客户表单项
    renderBelongCustomerField: function(popupContainer = document.getElementById('contractRightPanel')) {
        const customers = this.state.formData.customers || [{}];

        return (
            <div className="belong-customer-form">
                {customers.map((customer, index) => {
                    const fieldName = 'belong_customer' + index;

                    return (
                        <FormItem
                            key={index}
                            validateStatus={this.getValidateStatus(fieldName)}
                            help={this.getHelpMessage(fieldName)}
                            required
                        >
                            <Validator rules={this.getBelongCustomerValidateRules(index)}>
                                <Select
                                    name={fieldName}
                                    combobox
                                    filterOption={false}
                                    placeholder={Intl.get('customer.search.by.customer.name', '请输入客户名称搜索')}
                                    value={customer.customer_name}
                                    onSearch={this.queryCustomer.bind(this, index)}
                                    onSelect={this.onCustomerChoosen.bind(this, index)}
                                    getPopupContainer={() => popupContainer}
                                >
                                    {this.getCustomerOptions()}
                                </Select>
                            </Validator>
                            {index > 0 ? (
                                <div className="circle-button circle-button-minus"
                                    title={Intl.get('common.delete', '删除')}
                                    onClick={this.deleteBelongCustomer.bind(this, index)}>
                                    <Icon type="minus"/>
                                </div>
                            ) : (
                                <div className="circle-button circle-button-plus"
                                    title={Intl.get('common.add', '添加')}
                                    onClick={this.addBelongCustomer.bind(this, index)}>
                                    <Icon type="plus"/>
                                </div>
                            )}
                        </FormItem>
                    );
                })}
            </div>
        );
    },
    renderBuyerField: function() {
        return (
            <FormItem
                {...formItemLayout}
                label={Intl.get('contract.4', '甲方')}
                validateStatus={this.getValidateStatus('buyer')}
                help={this.getHelpMessage('buyer')}
                required
            >
                <Validator rules={[{
                    required: true,
                    message: Intl.get('crm.contract.party.name', '请输入甲方名称')
                }, {
                    pattern: regex.customerNameRegex,
                    message: Intl.get('contract.193', '客户名称只能包含汉字、字母、数字、横线、下划线、点、中英文括号等字符，且长度在1到50（包括50）之间')
                }]}>
                    <Input
                        name="buyer"
                        value={this.state.formData.buyer}
                        onChange={this.enterCustomer.bind(this, 'buyer')}
                    />
                </Validator>
            </FormItem>
        );
    },

    // 将输入设置为state
    handleInputToState(type, keyword) {
        switch (type) {
            case 'user':
                this.state.formData.user_id = '';
                this.state.formData.user_name = keyword;
                break;
            case 'team':
                this.state.formData.sales_team_id = '';
                this.state.formData.sales_team = keyword;
                break;
        }
        this.setState(this.state);
    },
    renderUserField: function() {
        const userOptions = this.props.userList.map(user => {
            return <Option key={user.user_id} value={user.user_id}>{user.nick_name + ' - ' + user.group_name}</Option>;
        });

        const validateName = 'user_id';

        return (
            <FormItem
                {...formItemLayout}
                label={Intl.get('crm.6', '负责人')}
                validateStatus={this.getValidateStatus(validateName)}
                help={this.getHelpMessage(validateName)}
                required
            >
                <Validator rules={[{required: true, message: Intl.get('contract.63', '请选择负责人')}]}>
                    <Select
                        // className='ant-select-inline'
                        name={validateName}
                        showSearch
                        optionFilterProp='children'
                        placeholder={Intl.get('contract.63', '请选择负责人')}
                        value={this.state.formData.user_id}
                        onChange={this.onUserChoosen}
                        notFoundContent={Intl.get('contract.64', '暂无负责人')}
                    >
                        {userOptions}
                    </Select>
                </Validator>
                {this.props.isGetUserSuccess ? null : (
                    <div
                        className="no-user-list-tip">{Intl.get('contract.65', '获取负责人列表失败')}，{Intl.get('contract.66', '点击')}<a
                            href="javascript:void(0)"
                            onClick={this.props.getUserList}>{Intl.get('common.get.again', '重新获取')}</a></div>
                )}
            </FormItem>
        );
    },
    renderTeamField: function() {
        const teamOptions = this.props.teamList.map(team => {
            return <Option key={team.groupId} value={team.groupId}>{team.groupName}</Option>;
        });

        return (
            <FormItem
                {...formItemLayout}
                label={Intl.get('crm.113', '部门')}
                required
            >
                <Select
                    combobox
                    showSearch
                    optionFilterProp='children'
                    placeholder={Intl.get('contract.67', '请选择部门')}
                    value={this.state.formData.sales_team}
                    onSearch={this.handleInputToState.bind(this, 'team')}
                    onSelect={this.onTeamChoosen}
                    notFoundContent={Intl.get('contract.68', '暂无部门')}
                >
                    {teamOptions}
                </Select>
            </FormItem>
        );
    },
    //渲染销售代表表单项
    renderSalesRepField: function() {
        const userOptions = this.props.userList.map(user => {
            return <Option key={user.user_id} value={user.user_id}>{user.nick_name + '-' + user.group_name}</Option>;
        });

        return (
            <FormItem
                {...formItemLayout}
                label={Intl.get('sales.commission.role.representative', '销售代表')}
            >
                <Select
                    showSearch
                    optionFilterProp='children'
                    placeholder={Intl.get('choose.sales.representative', '请选择销售代表')}
                    value={this.state.formData.sales_rep_id}
                    onChange={this.onSalesRepChoosen}
                    notFoundContent={Intl.get('no.sales.representative', '暂无销售代表')}
                >
                    {userOptions}
                </Select>
            </FormItem>
        );
    },
    //渲染销售代表所属团队表单项
    renderSalesRepTeamField: function(type) {
        const teamOptions = this.props.teamList.map(team => {
            return <Option key={team.groupId} value={team.groupId}>{team.groupName}</Option>;
        });

        return (
            <FormItem
                {...formItemLayout}
                label={Intl.get('user.user.team', '团队')}
            >
                <Select
                    showSearch
                    optionFilterProp='children'
                    placeholder={Intl.get('member.select.group', '请选择团队')}
                    value={this.state.formData.sales_rep_team_id}
                    onSelect={this.onSalesRepTeamChoosen}
                    notFoundContent={Intl.get('member.no.groups', '暂无团队')}
                >
                    {teamOptions}
                </Select>
            </FormItem>
        );
    },
    renderAmountField: function() {
        return (
            <FormItem
                {...formItemLayout2}
                label={Intl.get('contract.25', '合同额')}
                validateStatus={this.getValidateStatus('contract_amount')}
                help={this.getHelpMessage('contract_amount')}
                className="form-item-append-icon-container"
                required
            >
                <Validator rules={[{
                    required: true,
                    message: Intl.get('contract.69', '请填写合同金额')
                }, getNumberValidateRule()]}>
                    <Input
                        name="contract_amount"
                        value={this.parseAmount(this.state.formData.contract_amount)}
                        onChange={this.setField.bind(this, 'contract_amount')}
                    />
                </Validator>
                <span className="ant-form-text">{Intl.get('contract.155', '元')}</span>
            </FormItem>
        );
    },
    renderDateField: function() {
        if (!this.state.formData.date) {
            let formData = this.state.formData;
            formData.date = moment().valueOf();
        }

        return (
            <FormItem
                {...formItemLayout}
                label={Intl.get('contract.34', '签订时间')}
                required
            >
                <DatePicker
                    value={moment(this.state.formData.date)}
                    onChange={this.setField.bind(this, 'date')}
                />
            </FormItem>
        );
    },
    handleFieldChange: function(field, e) {
        this.setField(field, e, () => {
            if (_.isFunction(this.handleSubmit)) this.handleSubmit();
        });
    },
    renderStageField: function() {
        /*const stageOptions = CONTRACT_STAGE.map(stage => {
            return <Option key={stage} value={stage}>{stage}</Option>;
        });*/
        const stageOptions = CONTRACT_STAGE.map(stage => {
            return <RadioButton key={stage} value={stage}>{stage}</RadioButton>;
        });

        if (!this.state.formData.stage) {
            let formData = this.state.formData;
            formData.stage = CONTRACT_STAGE[0];
        }

        return (
            <FormItem
                {...formItemLayout2}
                label={Intl.get('contract.36', '合同阶段')}
                required
            >
                <RadioGroup
                    size="small"
                    value={this.state.formData.stage}
                    onChange={this.handleFieldChange.bind(this,'stage')}
                >
                    {stageOptions}
                </RadioGroup>
                {/*<Select
                    placeholder={Intl.get('contract.70', '请选择合同阶段')}
                    value={this.state.formData.stage}
                    onChange={this.handleFieldChange.bind(this, 'stage')}
                    notFoundContent={Intl.get('contract.71', '暂无合同阶段')}
                >
                    {stageOptions}
                </Select>*/}
            </FormItem>
        );
    },
    renderLabelField: function() {
        /*const labelOptions = CONTRACT_LABEL.map(label => {
            return <Option key={label.value} value={label.value}>{label.name}</Option>;
        });*/
        const labelOptions = CONTRACT_LABEL.map(label => {
            return <RadioButton key={label.value} value={label.value}>{label.name}</RadioButton>;
        });

        if (!this.state.formData.label) {
            let formData = this.state.formData;
            formData.label = LABEL_NEW_SIGNING.value;
        }

        return (
            <FormItem
                {...formItemLayout2}
                label={Intl.get('contract.164', '签约类型')}
                required
            >
                <RadioGroup
                    size="small"
                    value={this.state.formData.label}
                    onChange={this.handleFieldChange.bind(this,'label')}
                >
                    {labelOptions}
                </RadioGroup>
                {/*<Select
                    placeholder={Intl.get('contract.70', '请选择签约类型')}
                    value={this.state.formData.label}
                    onChange={this.handleFieldChange.bind(this, 'label')}
                    notFoundContent={Intl.get('contract.71', '暂无签约类型')}
                >
                    {labelOptions}
                </Select>*/}
            </FormItem>
        );
    },
    renderCategoryField: function() {
        const categoryOptions = CATEGORY.map(category => {
            return <Option key={category} value={category}>{category}</Option>;
        });

        return (
            <FormItem
                {...formItemLayout2}
                label={Intl.get('contract.37', '合同类型')}
                required
            >
                <Select
                    placeholder={Intl.get('contract.72', '请选择合同类型')}
                    value={this.state.formData.category}
                    onChange={this.setField.bind(this, 'category')}
                    notFoundContent={Intl.get('contract.73', '暂无合同类型')}
                >
                    {categoryOptions}
                </Select>
            </FormItem>
        );
    },
    renderRemarksField: function() {
        return (
            <FormItem
                {...formItemLayout}
                label={Intl.get('common.remark', '备注')}
            >
                <AutosizeTextarea
                    value={this.state.formData.remarks}
                    onChange={this.setField.bind(this, 'remarks')}
                />
            </FormItem>
        );
    },
    onCustomerChoosen: function(index, value) {
        let {formData,belongCustomerIsChoosen} = this.state;

        let belongCustomer = formData.customers[index];
        const selectedCustomer = _.find(this.state.customerList, customer => customer.customer_id === value);

        belongCustomer.customer_id = selectedCustomer.customer_id;
        belongCustomer.customer_name = selectedCustomer.customer_name;
        belongCustomer.customer_sales_id = selectedCustomer.sales_id;
        belongCustomer.customer_sales_name = selectedCustomer.sales_name;
        belongCustomer.customer_sales_team_id = selectedCustomer.sales_team_id;
        belongCustomer.customer_sales_team_name = selectedCustomer.sales_team_name;

        //暂存表单数据
        const formDataCopy = JSON.parse(JSON.stringify(formData));

        belongCustomerIsChoosen[index] = true;

        this.setState({
            formData,
            belongCustomerIsChoosen
        }, () => {
            //用暂存的表单数据更新一下验证后的表单数据
            //以解决选中了客户时在输入框里显示的是客户id而非客户名的问题
            this.handleValidate(this.state.status, formDataCopy);
        });
    },
    onUserChoosen: function(value) {
        const selectedUser = _.find(this.props.userList, user => user.user_id === value);
        let { formData } = this.state;
        formData.user_id = value;
        formData.user_name = selectedUser ? selectedUser.nick_name : '';
        formData.sales_team_id = selectedUser.group_id;
        formData.sales_team = selectedUser.group_name;
        this.setState({formData});
        /*if (selectedUser && selectedUser.group_id) {
            this.onTeamChoosen(selectedUser.group_id);
        }*/
    },
    onTeamChoosen: function(value) {
        const selectedTeam = _.find(this.props.teamList, team => team.groupId === value);
        this.state.formData.sales_team_id = value;
        this.state.formData.sales_team = selectedTeam.groupName;
        const formDataCopy = JSON.parse(JSON.stringify(this.state.formData));
        this.setState(this.state, () => {
            // this.handleValidate(this.state.status, formDataCopy);
            // this.onUserChoosen();
        });
    },
    //处理销售代表变更
    onSalesRepChoosen: function(value) {
        const selectedUser = _.find(this.props.userList, user => user.user_id === value);
        let {formData} = this.state;
        formData.sales_rep_id = value;
        formData.sales_rep = selectedUser ? selectedUser.nick_name : '';
        formData.sales_rep_team_id = selectedUser.group_id;
        formData.sales_rep_team = selectedUser.group_name;
        this.setState({formData});
        /*if (selectedUser && selectedUser.group_id) {
            this.onSalesRepTeamChoosen(selectedUser.group_id);
        }*/
    },
    //处理销售代表所属团队变更
    onSalesRepTeamChoosen: function(value) {
        const selectedTeam = _.find(this.props.teamList, team => team.groupId === value);
        this.state.formData.sales_rep_team_id = value;
        this.state.formData.sales_rep_team = selectedTeam.groupName;
        const formDataCopy = JSON.parse(JSON.stringify(this.state.formData));
        this.setState(this.state, () => {
            this.handleValidate(this.state.status, formDataCopy);
        });
    },
    //检查合同号是否已存在
    checkNumExist: function(rule, value, callback) {
        value = _.trim(value);

        if (!value) {
            callback();
            return;
        }

        const route = _.find(routeList, route => route.handler === 'checkNumExist');
        const arg = {
            url: route.path,
            type: route.method,
            data: {num: value},
        };

        ajax(arg).then(result => {
            if (result && result.result === 'true') {
                callback(new Error(Intl.get('contract.74', '该合同号已存在')));
            } else {
                callback();
            }
        }, (errMsg) => {
            callback();
        });
    },
    // 渲染采购合同分类
    renderPurchaseTypeField() {
        const purchaseTypeOptions = PURCHASE_TYPE.map(item => {
            return <Option key={item.dataIndex} value={item.dataIndex}>{item.name}</Option>;
        });

        let formData = this.state.formData;

        // 这个属性只有采购合同有，别的合同没有，当用到这个组件的时候说明是采购合同，然后加上这个属性
        if (formData.purchase_contract_type) {
            // 如果已经存在这个属性，说明是从后端获取的采购合同数据，将其转化成字符串
            formData.purchase_contract_type += '';
        } else {
            // 如果不存在则添加这个属性
            formData.purchase_contract_type = undefined;
        }

        return (
            <FormItem
                {...formItemLayout}
                label={Intl.get('contract.purchase.contract.type', '分类')}
                validateStatus={this.getValidateStatus('purchase_contract_type')}
                help={this.getHelpMessage('purchase_contract_type')}
                required
            >
                <Validator rules={[{
                    required: true,
                    message: Intl.get('contract.purchase.contract.type.select.tips', '请选择分类')
                }]}>
                    <Select
                        showSearch
                        name='purchase_contract_type'
                        optionFilterProp='children'
                        placeholder={Intl.get('contract.purchase.contract.type.select.tips', '请选择分类')}
                        value={this.state.formData.purchase_contract_type}
                        onChange={this.setField.bind(this, 'purchase_contract_type')}
                        notFoundContent={Intl.get('contract.purchase.contract.type.select.not.found.content', '暂无分类')}
                    >
                        {purchaseTypeOptions}
                    </Select>
                </Validator>
            </FormItem>
        );
    },
    // 验证起始时间是否小于结束时间
    validateStartAndEndTime(timeType) {
        return (rule, value, callback) => {
            // 如果没有值，则没有错误
            if (!value) {
                callback();
                return;
            }

            const startTime = this.state.formData.start_time;
            const endTime = this.state.formData.end_time;
            const isStartTime = timeType === 'start_time' ? true : false;
            if (endTime && startTime) {
                if (moment(endTime).isBefore(startTime)) {
                    if (isStartTime) {
                        callback(Intl.get('contract.start.time.greater.than.end.time.warning', '起始时间不能大于结束时间'));
                    } else {
                        callback(Intl.get('contract.end.time.less.than.start.time.warning', '结束时间不能小于起始时间'));
                    }
                } else {
                    callback();
                }
            } else {
                callback();
            }
        };
    },
};
