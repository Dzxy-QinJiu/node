var React = require('react');
var createReactClass = require('create-react-class');
const Validation = require('rc-form-validation-for-react16');
const Validator = Validation.Validator;
/**
 * 费用信息添加、展示及编辑页面
 */

import routeList from '../common/route';
import ajax from '../common/ajax';
import { Form, Input, Icon, DatePicker, Button, Select, message, Row, Col, Radio, Modal } from 'antd';
const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
import ValidateMixin from '../../../mixins/ValidateMixin';
import rightPanelUtil from 'CMP_DIR/rightPanel';
const RightPanelEdit = rightPanelUtil.RightPanelEdit;
const RightPanelDelete = rightPanelUtil.RightPanelDelete;
const RightPanelSubmit = rightPanelUtil.RightPanelSubmit;
const RightPanelCancel = rightPanelUtil.RightPanelCancel;
const hasPrivilege = require('CMP_DIR/privilege/checker').hasPrivilege;
import { DATE_FORMAT, OPERATE, COST_TYPE, DISPLAY_TYPES, OPERATE_INFO } from '../consts';
import {getNumberValidateRule} from 'PUB_DIR/sources/utils/validate-util';
import DetailCostBasic from './detail-cost-basic';
const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 12 },
};

const formItemLayout2 = {
    labelCol: { span: 5 },
    wrapperCol: { span: 17 },
};

const DetailCost = createReactClass({
    displayName: 'DetailCost',
    mixins: [ValidateMixin],

    getInitialState: function() {
        const isAdd = _.isEmpty(this.props.cost);
        const formData = _.clone({...this.props.cost,type: isAdd ? COST_TYPE[0] : this.props.cost.type || COST_TYPE[0]});
        return {
            formData,
            isFormShow: true,
            isAdd: isAdd,
        };
    },
    propTypes: {
        cost: PropTypes.object,
        userList: PropTypes.array,
        showLoading: PropTypes.func,
        hideLoading: PropTypes.func,
        addContract: PropTypes.func,
        hideRightPanel: PropTypes.func,
        refreshCurrentContract: PropTypes.func,
        deleteContract: PropTypes.func,
        getUserList: PropTypes.func,
        isGetUserSuccess: PropTypes.bool,
        teamList: PropTypes.array,
    },

    componentWillReceiveProps: function(nextProps) {
        if(!_.get(nextProps,'cost','') && _.get(nextProps.cost,'id') !== this.state.formData.id || !_.isEqual(this.props.cost, nextProps.cost)){
            const formData = _.clone({...nextProps.cost,type: _.get(nextProps,'cost.type', COST_TYPE[0])});
            this.setState({
                formData,
                isAdd: false,
            });
        }
    },

    showForm: function() {
        this.setState({
            isFormShow: true,
            formData: _.clone(this.props.cost),
        });
    },

    hideForm: function(e) {
        e && e.preventDefault();
        this.props.hideRightPanel();
    },

    handleSubmit: function(type, id) {
        let data, params;

        if (type === DISPLAY_TYPES.DELETE) {
            Modal.confirm({
                title: Intl.get('contract.192', '是否删除此费用？'),
                onOk: () => {
                    params = {id: id};
                    this.editCost(type, data, params);
                }
            });
        } else if (type === DISPLAY_TYPES.ADD || type === DISPLAY_TYPES.UPDATE) {
            data = this.state.formData;

            this.refs.validation.validate(valid => {
                if (!valid) {
                    return false;
                } else {
                    this.editCost(type, data, params);
                }
            });
        }
    },

    editCost: function(type, data, params) {
        this.props.showLoading();

        const handler = type + 'Cost';
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
                message.success(OPERATE_INFO[type].success);

                if (type === DISPLAY_TYPES.ADD) {
                    this.props.addContract(result.result);
                }else if (type === DISPLAY_TYPES.UPDATE) {
                    this.props.refreshCurrentContract(this.props.cost.id);
                }else if (type === DISPLAY_TYPES.DELETE) {
                    this.props.deleteContract(this.props.cost.id);
                }
                this.props.hideRightPanel();
            } else {
                message.error(result.msg || OPERATE_INFO[type].faild);
            }
        });
    },

    renderUserField: function() {
        const userOptions = this.props.userList.map(user => {
            return <Option key={user.user_id} value={user.user_id}>{user.nick_name + ' - ' + user.group_name}</Option>;
        });

        return (
            <FormItem 
                {...formItemLayout2}
                label={Intl.get('user.salesman', '销售人员')}
                validateStatus={this.getValidateStatus('sales_id')}
                help={this.getHelpMessage('sales_id')}
                required
            >
                {this.state.isFormShow ? (
                    <Validator rules={[{required: true, message: Intl.get('crm.17', '请选择销售人员')}]}>
                        <Select
                            name="sales_id"
                            showSearch
                            optionFilterProp="children"
                            placeholder={Intl.get('crm.17', '请选择销售人员')}
                            value={this.state.formData.sales_id}
                            onSelect={this.onUserChoosen}
                            notFoundContent={Intl.get('crm.29', '暂无销售人员')}
                        >
                            {userOptions}
                        </Select>
                    </Validator>
                ) : (
                    <span className="value-text">
                        {this.props.cost.sales_name}
                    </span>
                )}

                {this.props.isGetUserSuccess ? null : (
                    <div className="no-user-list-tip"><ReactIntl.FormattedMessage id="user.get.sales.failed" defaultMessage="获取销售人员列表失败" />，<a href="javascript:void(0)" onClick={this.props.getUserList}><ReactIntl.FormattedMessage id="contract.138" defaultMessage="点击重新获取" /></a></div>
                )}
            </FormItem>
        );
    },

    onUserChoosen: function(value) {
        const selectedUser = _.find(this.props.userList, user => user.user_id === value);
        let {formData} = this.state;
        formData.sales_id = value;
        formData.sales_name = selectedUser.nick_name;
        formData.sales_team_id = selectedUser.group_id;
        formData.sales_team = selectedUser.group_name;
        this.setState({formData});
    },

    renderTeamField: function() {
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
                        onSelect={this.onTeamChoosen}
                        notFoundContent={Intl.get('sale.home.no.team', '暂无销售团队')}
                    >
                        {teamOptions}
                    </Select>
                ) : (
                    <span className="value-text">
                        {this.props.cost.sales_team}
                    </span>
                )}
            </FormItem>
        );
    },

    onTeamChoosen: function(value) {
        const selectedTeam = _.find(this.props.teamList, team => team.groupId === value);
        let state = this.state;
        state.formData.sales_team_id = value;
        state.formData.sales_team = selectedTeam.groupName;
        //暂存表单数据
        const formDataCopy = JSON.parse(JSON.stringify(this.state.formData));
        this.setState(state, () => {
            //用暂存的表单数据更新一下验证后的表单数据
            //解决选择客户名后自动选择负责人时选不上的问题
            this.handleValidate(this.state.status, formDataCopy);
        });
    },

    renderAmountField: function() {
        return (
            <FormItem 
                {...formItemLayout2}
                label={Intl.get('contract.133', '费用')}
                validateStatus={this.getValidateStatus('cost')}
                help={this.getHelpMessage('cost')}
                required
            >
                {this.state.isFormShow ? (
                    <Validator rules={[{required: true, message: Intl.get('contract.134', '请填写费用')}, getNumberValidateRule()]}>
                        <Input
                            name="cost"
                            placeholder={Intl.get('contract.82', '元')}
                            value={this.parseAmount(this.state.formData.cost)}
                            onChange={this.setField.bind(this, 'cost')}
                        />
                    </Validator>
                ) : (
                    <span className="value-text">
                        {this.props.cost.cost}
                    </span>
                )}
            </FormItem>
        );
    },

    renderDateField: function() {
        let formData = this.state.formData;
        if (!formData.date) {
            formData.date = moment().valueOf();
        }

        return (
            <FormItem 
                {...formItemLayout2}
                label={Intl.get('common.login.time', '时间')}
                required
            >
                {this.state.isFormShow ? (
                    <DatePicker
                        value={moment(this.state.formData.date)}
                        onChange={this.setField.bind(this, 'date')}
                    />
                ) : (
                    <span className="value-text">
                        {this.props.cost.date ? moment(this.props.cost.date).format(DATE_FORMAT) : null}
                    </span>
                )}
            </FormItem>
        );
    },

    renderTypeField: function() {
        const typeOptions = COST_TYPE.map(type => {
            return <RadioButton key={type} value={type}>{type}</RadioButton>;
        });

        return (
            <FormItem 
                {...formItemLayout2}
                label={Intl.get('contract.135', '费用类型')}
                required
            >
                {this.state.isFormShow ? (
                    <RadioGroup
                        value={this.state.formData.type}
                        size='small'
                        onChange={this.setField.bind(this,'type')}
                    >
                        {typeOptions}
                    </RadioGroup>
                ) : (
                    <span className="value-text">
                        {this.props.cost.type}
                    </span>
                )}
            </FormItem>
        );
    },

    render: function() {
        //编辑按钮是否显示
        const isEditBtnShow = hasPrivilege('OPLATE_SALES_COST_ADD');
        const detailOp = this.state.formData.id ? DISPLAY_TYPES.UPDATE : DISPLAY_TYPES.ADD;
        return (
            <div className="detail-cost" data-tracename='添加费用页面'>
                {
                    detailOp === DISPLAY_TYPES.ADD ? (
                        <Form layout='horizontal' >
                            <Validation ref="validation" onValidate={this.handleValidate}>
                                {this.renderUserField()}
                                {this.renderDateField()}
                                {this.renderTypeField()}
                                {this.renderAmountField()}
                                {this.state.isFormShow ? (
                                    <Row>
                                        <Col span="22" className='footer-btn'>
                                            <RightPanelSubmit onClick={this.handleSubmit.bind(this, detailOp)}><ReactIntl.FormattedMessage id="common.sure" defaultMessage="确定" /></RightPanelSubmit>
                                            <RightPanelCancel onClick={this.hideForm}><ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消" /></RightPanelCancel>
                                        </Col>
                                    </Row>
                                ) : null}
                            </Validation>
                        </Form>
                    ) : (
                        <DetailCostBasic
                            className='detail-cost-basic'
                            enableEdit={isEditBtnShow}
                            cost={this.props.cost}
                            teamList={this.props.teamList}
                            userList={this.props.userList}
                            getUserList={this.props.getUserList}
                            isGetUserSuccess={this.props.isGetUserSuccess}
                            showLoading={this.props.showLoading}
                            hideLoading={this.props.hideLoading}
                            refreshCurrentContract={this.props.refreshCurrentContract}
                            deleteContract={this.props.deleteContract}
                            hideRightPanel={this.props.hideRightPanel}
                        />
                    )
                }
            </div>
        );
    },
});

module.exports = DetailCost;


