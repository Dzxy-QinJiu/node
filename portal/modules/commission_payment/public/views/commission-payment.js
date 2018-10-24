/**
 * 添加提成发放记录
 * */
var React = require('react');
var createReactClass = require('create-react-class');
const Validation = require('rc-form-validation-for-react16');
const Validator = Validation.Validator;
import ajax from '../../../contract/common/ajax';
import routeList from '../../../contract/common/route';
import {Form, Input, DatePicker, Select, message, Row, Col} from 'antd';
const FormItem = Form.Item;
import ValidateMixin from '../../../../mixins/ValidateMixin';
import rightPanelUtil from 'CMP_DIR/rightPanel';
const RightPanelEdit = rightPanelUtil.RightPanelEdit;
const RightPanelDelete = rightPanelUtil.RightPanelDelete;
const RightPanelSubmit = rightPanelUtil.RightPanelSubmit;
const RightPanelCancel = rightPanelUtil.RightPanelCancel;
const customerAjax = require('../../../common/public/ajax/customer');
const hasPrivilege = require('CMP_DIR/privilege/checker').hasPrivilege;
import {REMARK_LIST, OPERATE} from '../consts';
import {getNumberValidateRule} from 'PUB_DIR/sources/utils/validate-util';

const formItemLayout = {
    labelCol: {span: 4},
    wrapperCol: {span: 12}
};

const formItemLayout2 = {
    labelCol: {span: 4},
    wrapperCol: {span: 6}
};

let queryCustomerTimeout = null;

const CommissionPayment = createReactClass({
    displayName: 'CommissionPayment',
    mixins: [ValidateMixin],

    getInitialState() {
        const isAdd = _.isEmpty(this.props.commission);
        return {
            formData: {},
            isFormShow: isAdd,
            isAdd: isAdd,
            customerList: [],
            customerErrMsg: '',
        };
    },

    componentWillReceiveProps(nextProps) {
        this.clearState();
    },

    showForm() {
        this.setState({
            isFormShow: true,
            formData: _.clone(this.props.commission),
        });
    },

    hideForm() {
        this.setState({
            isFormShow: false,
        });
    },

    handleSubmit(type, id) {
        let data, params;

        if (type === 'delete') {
            params = {id: id};
            this.editCommission(type, data, params);
        } else if (type === 'add' || type === 'update') {
            data = this.state.formData;
            let qualifiedArray = _.first(REMARK_LIST, 2);
            let index = _.indexOf(qualifiedArray, data.remark);
            if (index > -1) {
                data.type = 'qualified';
            } else {
                data.type = 'grant';
            }
            this.refs.validation.validate(valid => {
                if (!valid) {
                    return;
                } else {
                    this.editCommission(type, data, params);
                }
            });
        }
    },

    editCommission(type, data, params) {
        this.props.showLoading();

        const handler = type + 'Commission';
        const route = _.find(routeList, route => route.handler === handler);
        const arg = {
            url: route.path,
            type: route.method,
            data: data || {},
        };

        if (params) arg.params = params;

        ajax(arg).then(result => {
            this.props.hideLoading();

            if (result.code === 0) {
                message.success(OPERATE[type] + Intl.get('sales.commission.success', '提成信息成功'));

                if (type === 'add') {
                    this.props.addCommission(result.result);
                    this.props.hideRightPanel();
                }

                if (type === 'update') {
                    this.props.refreshCurrentCommission(result.result);
                    this.hideForm();
                }

                if (type === 'delete') {
                    this.props.deleteCommission(this.props.commission.id);
                    this.props.hideRightPanel();
                }
            } else {
                message.error(result.msg || OPERATE[type] + Intl.get('sales.commission.failed', '提成信息失败'));
            }
        });
    },

    renderDateField() {
        let state = this.state;
        if (!state.formData.grant_time) {
            state.formData.grant_time = moment().valueOf();
            this.setState(state);
        }
        return (
            <FormItem
                {...formItemLayout}
                label={Intl.get('sales.commission.grant.time', '发放时间')}
            >
                {this.state.isFormShow ? (
                    <DatePicker
                        value={moment(state.formData.grant_time)}
                        onChange={this.setField.bind(this, 'grant_time')}
                    />
                ) : (
                    <span className="value-text">
                        {this.props.commission.grant_time ? moment(this.props.commission.grant_time).format(oplateConsts.DATE_FORMAT) : null}
                    </span>
                )}
            </FormItem>
        );
    },

    renderRoleField() {
        return (
            <FormItem
                {...formItemLayout2}
                label={Intl.get('common.role', '角色')}
                validateStatus={this.getValidateStatus('role')}
                help={this.getHelpMessage('role')}
            >
                {this.state.isFormShow ? (
                    <Validator rules={[{required: true, message: Intl.get('sales.commission.add.role', '请添加销售人员的角色')}]}>
                        <Input
                            name="commission"
                            value={this.state.formData.role}
                            onChange={this.setField.bind(this, 'role')}
                        />
                    </Validator>
                ) : (
                    <span className="value-text">
                        {this.props.commission.role}
                    </span>
                )}
            </FormItem>
        );
    },

    renderUserField() {
        const userOptions = this.props.userList.map(user => {
            return <Option key={user.user_id} value={user.user_id}>{user.nick_name}</Option>;
        });

        return (
            <FormItem
                {...formItemLayout}
                label={Intl.get('user.salesman', '销售人员')}
                validateStatus={this.getValidateStatus('user_id')}
                help={this.getHelpMessage('user_id')}
            >
                {this.state.isFormShow ? (
                    <Validator rules={[{required: true, message: Intl.get('crm.17', '请选择销售人员')}]}>
                        <Select
                            name="user_id"
                            showSearch
                            optionFilterProp="children"
                            placeholder={Intl.get('crm.17', '请选择销售人员')}
                            value={this.state.formData.user_id}
                            onSelect={this.onUserChoose}
                            notFoundContent={Intl.get('crm.29', '暂无销售人员')}
                        >
                            {userOptions}
                        </Select>
                    </Validator>
                ) : (
                    <span className="value-text">
                        {this.props.commission.user_name}
                    </span>
                )}

                {this.props.isGetUserSuccess ? null : (
                    <div className="no-user-list-tip"><ReactIntl.FormattedMessage id="user.get.sales.failed"
                        defaultMessage="获取销售人员列表失败"/>，<a
                        href="javascript:void(0)" onClick={this.props.getUserList}><ReactIntl.FormattedMessage
                            id="contract.138" defaultMessage="点击重新获取"/></a></div>
                )}
            </FormItem>
        );
    },

    onUserChoose(value) {
        const selectedUser = _.find(this.props.userList, user => user.user_id === value);
        this.state.formData.user_id = value;
        this.state.formData.user_name = selectedUser.nick_name;
        this.onTeamChoose(selectedUser.group_id);
    },

    renderTeamField() {
        const teamOptions = this.props.teamList.map(team => {
            return <Option key={team.groupId} value={team.groupId}>{team.groupName}</Option>;
        });

        return (
            <FormItem
                {...formItemLayout}
                label={Intl.get('user.sales.team', '销售团队')}
            >
                {this.state.isFormShow ? (
                    <Select
                        showSearch
                        optionFilterProp="children"
                        placeholder={Intl.get('crm.31', '请选择销售团队')}
                        value={this.state.formData.sales_team_id}
                        onSelect={this.onTeamChoose}
                        notFoundContent={Intl.get('sale.home.no.team', '暂无销售团队')}
                    >
                        {teamOptions}
                    </Select>
                ) : (
                    <span className="value-text">
                        {this.props.commission.sales_team}
                    </span>
                )}
            </FormItem>
        );
    },

    onTeamChoose(value) {
        const selectedTeam = _.find(this.props.teamList, team => team.groupId === value);
        this.state.formData.sales_team_id = value;
        this.state.formData.sales_team = selectedTeam.groupName;
        //暂存表单数据
        const formDataCopy = JSON.parse(JSON.stringify(this.state.formData));
        this.setState(this.state, () => {
            //用暂存的表单数据更新一下验证后的表单数据
            //解决选择客户名后自动选择负责人时选不上的问题
            this.handleValidate(this.state.status, formDataCopy);
        });
    },

    renderAmountField() {
        return (
            <FormItem
                {...formItemLayout2}
                label={Intl.get('sales.commission.amount', '提成金额')}
                validateStatus={this.getValidateStatus('amount')}
                help={this.getHelpMessage('amount')}
            >
                {this.state.isFormShow ? (
                    <Validator rules={[{
                        required: true,
                        message: Intl.get('sales.commission.add.amount', '请添加提成金额')
                    }, getNumberValidateRule()]}>
                        <Input
                            name="commission"
                            value={this.parseAmount(this.state.formData.amount)}
                            onChange={this.setField.bind(this, 'amount')}
                        />
                    </Validator>
                ) : (
                    <span className="value-text">
                        {this.props.commission.amount}
                    </span>
                )}
            </FormItem>
        );
    },

    onRemarkChoose(value) {
        this.state.formData.remark = value;
        //暂存表单数据
        const formDataCopy = JSON.parse(JSON.stringify(this.state.formData));
        this.setState(this.state, () => {
            //用暂存的表单数据更新一下验证后的表单数据
            //解决选择客户名后自动选择负责人时选不上的问题
            this.handleValidate(this.state.status, formDataCopy);
        });
    },

    //输入客户名
    queryCustomer: function(keyword) {
        this.state.formData.customer_name = keyword;
        this.setState(this.state);

        if (queryCustomerTimeout) {
            clearTimeout(queryCustomerTimeout);
        }

        queryCustomerTimeout = setTimeout(() => {
            customerAjax.getCustomerSuggestListAjax().sendRequest({
                q: keyword
            }).success(list => {
                let newState = {
                    customerList: list,
                    customerErrMsg: _.clone(this.state.customerErrMsg),
                };

                if (_.isArray(list) && list.length) {
                    newState.customerErrMsg = '';
                } else {
                    newState.customerErrMsg = Intl.get('contract.177', '没有找到符合条件的客户，请更换关键词查询');
                }
                this.setState(newState, () => {
                    this.getValidateStatus('customer_id');
                });
            }).error(() => {
                let newState = {
                    customerErrMsg: _.clone(this.state.customerErrMsg),
                };
                newState.customerErrMsg = Intl.get('errorcode.61', '获取客户列表失败');
                this.setState(newState, () => {
                    this.getValidateStatus('customer_id');
                });
            });
        }, 500);
    },

    getCustomerOptions: function() {
        if (this.state.customerList.length) {
            return this.state.customerList.map((customer) => {
                return <Option key={customer.customer_id}
                    value={customer.customer_id}>{customer.customer_name}</Option>;
            });
        }
    },

    onCustomerChoose(value) {
        const selectedCustomer = _.find(this.state.customerList, customer => customer.customer_id === value);
        this.state.formData.customer_id = value;
        this.state.formData.customer_name = selectedCustomer.customer_name;

    },

    getCustomerValidateRules() {
        return [{
            validator: (rule, value, callback) => {
                if (this.state.customerErrMsg) {
                    callback(this.state.customerErrMsg);
                } else {
                    if (!value) {
                        callback(Intl.get('contract.176', '请选择所属客户'));
                    } else {
                        callback();
                    }
                }
            }
        }];
    },

    renderCustomerField() {
        return (
            <FormItem
                {...formItemLayout}
                label={Intl.get('call.record.customer', '客户')}
                validateStatus={this.getValidateStatus('customer_id')}
                help={this.getHelpMessage('customer_id')}
            >
                {this.state.isFormShow ? (
                    <Validator rules={this.getCustomerValidateRules()}>
                        <Select
                            name="customer_id"
                            mode="combobox"
                            filterOption={false}
                            placeholder={Intl.get('customer.search.by.customer.name', '请输入客户名称搜索')}
                            value={this.state.formData.customer_name}
                            onSearch={this.queryCustomer}
                            onSelect={this.onCustomerChoose}
                        >
                            {this.getCustomerOptions()}
                        </Select>
                    </Validator>
                ) : (
                    <span className="value-text">
                        {this.props.commission.customer_name}
                    </span>
                )}

                {this.props.isGetUserSuccess ? null : (
                    <div className="no-user-list-tip"><ReactIntl.FormattedMessage id="user.get.sales.failed"
                        defaultMessage="获取销售人员列表失败"/>，<a
                        href="javascript:void(0)" onClick={this.props.getUserList}><ReactIntl.FormattedMessage
                            id="contract.138" defaultMessage="点击重新获取"/></a></div>
                )}
            </FormItem>
        );
    },

    remarkContent(value) {
        this.state.formData.remark = value;
        this.setState(this.state);
    },

    renderRemarkField() {
        const remarkOptions = REMARK_LIST.map(remark => {
            return <Option key={remark} value={remark}>{remark}</Option>;
        });
        return (
            <FormItem
                {...formItemLayout2}
                label={Intl.get('common.remark', '备注')}
                validateStatus={this.getValidateStatus('remark')}
                help={this.getHelpMessage('remark')}
            >
                {this.state.isFormShow ? (
                    <Select
                        showSearch
                        mode="combobox"
                        optionFilterProp="children"
                        placeholder={Intl.get('sales.commission.add.remark', '请输入或选择备注信息')}
                        value={this.state.formData.remark}
                        onSearch={this.remarkContent}
                        onSelect={this.onRemarkChoose}
                    >
                        {remarkOptions}
                    </Select>
                ) : (
                    <span className="value-text">
                        {this.props.commission.remark}
                    </span>
                )}
            </FormItem>
        );
    },

    render() {
        //编辑按钮是否显示
        const isEditBtnShow = !this.state.isFormShow && hasPrivilege('OPLATE_CONTRACT_SALERS_COMMISSION');
        const detailOp = this.state.formData.id ? 'update' : 'add';

        return (
            <div className="commission-detail">
                {isEditBtnShow ? (
                    <div>
                        <RightPanelEdit
                            onClick={this.showForm}
                        />
                        <RightPanelDelete
                            onClick={this.handleSubmit.bind(this, 'delete', this.props.commission.id)}
                        />
                    </div>
                ) : null}

                <Form layout='horizontal'>
                    <Validation ref="validation" onValidate={this.handleValidate}>
                        {this.renderDateField()}
                        {this.renderUserField()}
                        {this.renderRoleField()}
                        {this.renderTeamField()}
                        {this.renderAmountField()}
                        {this.renderCustomerField()}
                        {this.renderRemarkField()}
                        {this.state.isFormShow ? (
                            <Row>
                                <Col span="14" offset="4">
                                    {this.state.isAdd ? null : (
                                        <RightPanelCancel onClick={this.hideForm}><ReactIntl.FormattedMessage
                                            id="common.cancel" defaultMessage="取消"/></RightPanelCancel>
                                    )}
                                    <RightPanelSubmit
                                        onClick={this.handleSubmit.bind(this, detailOp)}><ReactIntl.FormattedMessage
                                            id="common.sure" defaultMessage="确定"/></RightPanelSubmit>
                                </Col>
                            </Row>
                        ) : null}
                    </Validation>
                </Form>
            </div>
        );
    },
});

module.exports = CommissionPayment;


