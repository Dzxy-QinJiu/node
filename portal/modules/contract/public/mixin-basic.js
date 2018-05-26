const Validation = require("rc-form-validation");
const Validator = Validation.Validator;
/**
 * 合同基本资料相关面板共用部分
 *
 * 包括共用状态和方法的定义以及共用字段的渲染
 */

import { Form, Input, Select, DatePicker, Radio } from "antd";
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const AutosizeTextarea = require("../../../components/autosize-textarea");
import ajax from "../common/ajax";
import routeList from "../common/route";
const customerAjax = require("../../common/public/ajax/customer");
import { CATEGORY, CONTRACT_STAGE, STAGE_AUDIT, CONTRACT_LABEL, LABEL_NEW_SIGNING } from "../consts";

const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 12 },
};

const formItemLayout2 = {
    labelCol: { span: 4 },
    wrapperCol: { span: 6 },
};

let queryCustomerTimeout = null;

export default {
    getInitialState: function() {
        return {
            formData: JSON.parse(JSON.stringify(this.props.contract)),
            customerList: [],
            buyerList: [],
        };
    },
    //输入客户名
    enterCustomer: function(field, e) {
        const value = e.target.value.trim();

        this.state.formData[field] = value;
        //复制到甲方
        if (field === "customer_name") {
            this.state.formData["buyer"] = value;
        }
        this.setState(this.state);
    },
    queryCustomer: function(field, keyword) {
        this.state.formData[field] = keyword;
        this.setState(this.state);

        if (queryCustomerTimeout) {
            clearTimeout(queryCustomerTimeout);
        }

        queryCustomerTimeout = setTimeout(() => {
            customerAjax.getCustomerSuggestListAjax().sendRequest({
                q: keyword
            }).success(list => {
                this.setState({
                    customerList: list
                });
            });
        }, 500);
    },
    renderNumField: function() {
        let rules = [{required: true, message: Intl.get("contract.57", "请填写合同号")}];

        if (this.props.validateNumRepeat) {
            rules.push({validator: this.checkNumExist});
        }

        return (
            <FormItem 
                {...formItemLayout}
                label={Intl.get("contract.24", "合同号")}
                validateStatus={this.getValidateStatus("num")}
                help={this.getHelpMessage("num")}
            >
                <Validator trigger="onBlur" rules={rules}>
                    <Input
                        ref="num"
                        name="num"
                        value={this.state.formData.num}
                        onChange={this.setField.bind(this, "num")}
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
                label={Intl.get("crm.41", "客户名")}
                validateStatus={this.getValidateStatus("customer_name")}
                help={this.getHelpMessage("customer_name")}
            >
                <Validator rules={[{required: true, message: Intl.get("contract.58", "请填写客户名")}]}>
                    <Input
                        name="customer_name"
                        value={this.state.formData.customer_name}
                        onChange={this.enterCustomer.bind(this, "customer_name")}
                    />
                </Validator>
            </FormItem>
        );
    },
    renderBelongCustomerField: function() {
        return (
            <FormItem 
                {...formItemLayout}
                label={Intl.get("common.belong.customer", "所属客户")}
                validateStatus={this.getValidateStatus("oplate_customer_name")}
                help={this.getHelpMessage("oplate_customer_name")}
            >
                <Validator rules={[{required: true, message: Intl.get("contract.58", "请填写客户名")}]}>
                    <Select
                        name="oplate_customer_name"
                        combobox
                        filterOption={false}
                        searchPlaceholder={Intl.get("customer.search.by.customer.name", "请输入客户名称搜索")}
                        value={this.state.formData.oplate_customer_name}
                        onSearch={this.queryCustomer.bind(this, "oplate_customer_name")}
                        onSelect={this.onCustomerChoosen}
                        notFoundContent={Intl.get("contract.60", "暂无客户")}
                    >
                        {this.getCustomerOptions()}
                    </Select>
                </Validator>
            </FormItem>
        );
    },
    renderBuyerField: function() {
        return (
            <FormItem 
                {...formItemLayout}
                label={Intl.get("contract.4", "甲方")}
            >
                <Input
                    name="buyer"
                    value={this.state.formData.buyer}
                    onChange={this.enterCustomer.bind(this, "buyer")}
                />
            </FormItem>
        );
    },
    renderUserField: function() {
        const userOptions = this.props.userList.map(user => {
            return <Option key={user.user_id} value={user.user_id}>{user.nick_name}</Option>;
        });

        return (
            <FormItem 
                {...formItemLayout}
                label={Intl.get("crm.6", "负责人")}
                validateStatus={this.getValidateStatus("user_id")}
                help={this.getHelpMessage("user_id")}
            >
                <Validator rules={[{required: true, message: Intl.get("contract.63", "请选择负责人")}]}>
                    <Select
                        name="user_id"
                        showSearch
                        optionFilterProp="children"
                        placeholder={Intl.get("contract.63", "请选择负责人")}
                        value={this.state.formData.user_id}
                        onSelect={this.onUserChoosen}
                        notFoundContent={Intl.get("contract.64", "暂无负责人")}
                    >
                        {userOptions}
                    </Select>
                </Validator>

                {this.props.isGetUserSuccess ? null : (
                    <div className="no-user-list-tip"><ReactIntl.FormattedMessage id="contract.65" defaultMessage="获取负责人列表失败" />，<ReactIntl.FormattedMessage id="contract.66" defaultMessage="点击" /><a href="javascript:void(0)" onClick={this.props.getUserList}><ReactIntl.FormattedMessage id="common.get.again" defaultMessage="重新获取" /></a></div>
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
                label={Intl.get("crm.113", "部门")}
            >
                <Select
                    showSearch
                    optionFilterProp="children"
                    placeholder={Intl.get("contract.67", "请选择部门")}
                    value={this.state.formData.sales_team_id}
                    onSelect={this.onTeamChoosen}
                    notFoundContent={Intl.get("contract.68", "暂无部门")}
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
                label="合同额"
                validateStatus={this.getValidateStatus("contract_amount")}
                help={this.getHelpMessage("contract_amount")}
            >
                <Validator rules={[{required: true, message: Intl.get("contract.69", "请填写合同金额")}, this.getNumberValidateRule()]}>
                    <Input
                        name="contract_amount"
                        value={this.parseAmount(this.state.formData.contract_amount)}
                        onChange={this.setField.bind(this, "contract_amount")}
                    />
                </Validator>
            </FormItem>
        );
    },
    renderDateField: function() {
        if (!this.state.formData.date) {
            this.state.formData.date = new Date;
        }

        return (
            <FormItem 
                {...formItemLayout}
                label={Intl.get("contract.34", "签订时间")}
            >
                <DatePicker
                    value={moment(this.state.formData.date)}
                    onChange={this.setField.bind(this, "date")}
                />
            </FormItem>
        );
    },
    renderStageField: function() {
        const stageOptions = CONTRACT_STAGE.map(stage => {
            return <Option key={stage} value={stage}>{stage}</Option>;
        });

        if (!this.state.formData.stage) {
            this.state.formData.stage = STAGE_AUDIT;
        }

        return (
            <FormItem 
                {...formItemLayout2}
                label={Intl.get("contract.36", "合同阶段")}
            >
                <Select
                    placeholder={Intl.get("contract.70", "请选择合同阶段")}
                    value={this.state.formData.stage}
                    onChange={this.setField.bind(this, "stage")}
                    notFoundContent={Intl.get("contract.71", "暂无合同阶段")}
                >
                    {stageOptions}
                </Select>
            </FormItem>
        );
    },
    renderLabelField: function() {
        const labelOptions = CONTRACT_LABEL.map(label => {
            return <Option key={label.value} value={label.value}>{label.name}</Option>;
        });

        if (!this.state.formData.label) {
            this.state.formData.label = LABEL_NEW_SIGNING.value;
        }

        return (
            <FormItem 
                {...formItemLayout2}
                label={Intl.get("contract.164", "签约类型")}
            >
                <Select
                    placeholder={Intl.get("contract.70", "请选择签约类型")}
                    value={this.state.formData.label}
                    onChange={this.setField.bind(this, "label", "")}
                    notFoundContent={Intl.get("contract.71", "暂无签约类型")}
                >
                    {labelOptions}
                </Select>
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
                label={Intl.get("contract.37", "合同类型")}
            >
                <Select
                    placeholder={Intl.get("contract.72", "请选择合同类型")}
                    value={this.state.formData.category}
                    onChange={this.setField.bind(this, "category")}
                    notFoundContent={Intl.get("contract.73", "暂无合同类型")}
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
                label={Intl.get("common.remark", "备注")}
            >
                <AutosizeTextarea
                    value={this.state.formData.remarks}
                    onChange={this.setField.bind(this, "remarks")}
                />
            </FormItem>
        );
    },
    onCustomerChoosen: function(value) {
        const selectedCustomer = _.find(this.state.customerList, customer => customer.customer_id === value);

        this.state.formData.oplate_customer_name = selectedCustomer.customer_name;
        this.state.formData.customer_id = value;
        //暂存表单数据
        const formDataCopy = JSON.parse(JSON.stringify(this.state.formData));
        this.setState(this.state, () => {
            //用暂存的表单数据更新一下验证后的表单数据
            //以解决选中了客户时在输入框里显示的是客户id而非客户名的问题
            this.handleValidate(this.state.status, formDataCopy);
        });
    },
    onUserChoosen: function(value) {
        const selectedUser = _.find(this.props.userList, user => user.user_id === value);

        this.state.formData.user_id = value;
        this.state.formData.user_name = selectedUser ? selectedUser.nick_name : "";
        if (selectedUser && selectedUser.group_id) {
            this.onTeamChoosen(selectedUser.group_id);
        }
    },
    onTeamChoosen: function(value) {
        const selectedTeam = _.find(this.props.teamList, team => team.groupId === value);
        this.state.formData.sales_team_id = value;
        this.state.formData.sales_team = selectedTeam.groupName;
        this.setState(this.state);
    },
    //检查合同号是否已存在
    checkNumExist: function(rule, value, callback) {
        value = value ? value.trim() : "";

        if (!value) {
            callback();
            return;
        }

        const route = _.find(routeList, route => route.handler === "checkNumExist");
        const arg = {
            url: route.path,
            type: route.method,
            data: {num: value},
        };
        
        ajax(arg).then(result => {
            if (result && result.result === "true") {
                callback(new Error( Intl.get("contract.74", "该合同号已存在")));
            } else {
                callback();
            }
        }, (errMsg) => {
            callback();
        });
    },
};
