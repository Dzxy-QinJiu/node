/**
 * Created by wangliping on 2016/10/18.
 */

var Validation = require("antd").Validation;
var Form = require("antd").Form;
var Input = require("antd").Input;
var Select = require("antd").Select;
var Button = require("antd").Button;
var Validator = Validation.Validator;
var FormItem = Form.Item;
var classNames = require("classnames");
var AlertTimer = require("../../../../components/alert-timer");
var Icon = require("antd").Icon;
var OrganizationActions = require("../action/organization-actions");

import {FormattedMessage,defineMessages,injectIntl} from 'react-intl';
import reactIntlMixin from '../../../../components/react-intl-mixin';

const messages = defineMessages({
    common_is_validiting: {id: 'common.is.validiting'},//正在校验中..
    common_input_character_rules: {id: 'common.input.character.rules'},//最少1个字符,最多8个字符
    common_required_tip: {id: 'common.required.tip'},//必填项*
    organization_sub_organization: {id: 'organization.sub.organization'},//上级组织
    common_definition: {id: 'common.definition'},//名称
    organization_select_sub_organization: {id: 'organization.select.sub.organization'},//请选择上级组织
    common_not_found: {id: 'common.not.found'},//无法找到
    common_input_keyword: {id: 'common.input.keyword'},//输入关键词
});

function noop() {
}

var OrganizationForm = React.createClass({
    mixins: [Validation.FieldMixin, reactIntlMixin],
    getDefaultProps: function () {
        return {
            submitOrganizationForm: noop,
            cancelOrganizationForm: noop,
            organization: {
                key: '',
                title: '',
                superiorTeam: ''
            }
        };
    },
    getFormData: function (organization) {
        if (organization.isEditGroup) {
            return {
                ...organization,
                saveOrganizationMsg: "",
                saveOrganizationResult: "",
                isOrganizationSaving: false
            };
        } else {
            return {
                title: '',
                saveOrganizationMsg: "",
                saveOrganizationResult: "",
                isOrganizationSaving: false
            };
        }
    },
    getInitialState: function () {
        return {
            status: {
                key: {},
                title: {},
                superiorTeam: {}
            },
            formData: this.getFormData(this.props.organization),
        };
    },
    componentWillReceiveProps: function (nextProps) {
        this.refs.validation.reset();
        this.setState({formData: this.getFormData(nextProps.organization)});
    },

    componentDidUpdate: function () {
        if (this.state.formData.id) {
            this.refs.validation.validate(noop);
        }
    },

    renderValidateStyle: function (item) {
        var formData = this.state.formData;
        var status = this.state.status;

        var classes = classNames({
            'error': status[item].errors,
            'validating': status[item].isValidating,
            'success': formData[item] && !status[item].errors && !status[item].isValidating
        });

        return classes;
    },

    //取消事件
    handleCancel: function () {
        this.props.cancelOrganizationForm();
    },

    //保存角色信息
    handleSubmit: function () {
        var _this = this;
        var validation = this.refs.validation;
        validation.validate(function (valid) {
            if (!valid) {
                return;
            } else {
                var formData = _this.state.formData;
                if (formData.isEditGroup) {
                    var editGroupData = {
                        group_id: formData.key,
                        group_name: formData.title,
                        user_ids: JSON.stringify(formData.userIds),
                        parent_group: formData.superiorTeam//上级组织
                    };
                    formData.isOrganizationSaving = true;
                    _this.setState({formData: formData});
                    OrganizationActions.saveEditGroup(editGroupData, result=> {
                        //保存结果
                        formData.saveOrganizationMsg = result.saveMsg;
                        formData.saveOrganizationResult = result.saveResult;
                        formData.isOrganizationSaving = false;
                        _this.setState({formData: formData});
                        if (result.saveResult == "success") {
                            //保存成功后的处理
                            var organization = _this.props.organization;
                            if (organization && organization.isEditGroup) {
                                OrganizationActions.cancelEditGroup(organization);
                                //刷新组织列表
                                if (organization.superiorTeam == formData.superiorTeam) {
                                    //只修改了组织的名称
                                    OrganizationActions.updateOrganizationNameAfterEdit(formData);
                                } else {
                                    //修改了上级团队后，需要刷新整个组织列表及其结构
                                    OrganizationActions.getOrganizationList();
                                }
                            }
                        }
                    });

                } else {
                    var addGroupData = {
                        groupName: formData.title
                    };
                    if (_this.props.organization) {
                        addGroupData.parentGroup = _this.props.organization.key;//上级组织
                    }
                    formData.isOrganizationSaving = true;
                    _this.setState({formData: formData});
                    OrganizationActions.saveAddGroup(addGroupData, (result, addGroup)=> {
                        //保存结果
                        formData.saveOrganizationMsg = result.saveMsg;
                        formData.saveOrganizationResult = result.saveResult;
                        formData.isOrganizationSaving = false;
                        _this.setState({formData: formData});
                        if (result.saveResult === "success") {
                            //添加成功后的处理
                            if (_this.props.isAddRoot) {
                                //添加根组织时的处理
                                _this.props.cancelOrganizationForm();
                            } else {
                                //添加子组织成功后的处理
                                OrganizationActions.cancelAddGroup(_this.props.organization);
                            }
                            //刷新组织列表
                            OrganizationActions.refreshGroupListAfterAdd(addGroup);
                        }
                    });
                }
            }
        });
    },

    //递归遍历组织树，查树中是否含有此组织
    findChildren: function (id, curOrganization) {
        if (id == curOrganization.key) {
            return true;
        } else {
            if (_.isArray(curOrganization.children) && curOrganization.children.length > 0) {
                //子组织中是否含有此组织
                return _.some(curOrganization.children, organization=>this.findChildren(id, organization));
            } else {
                return false;
            }
        }
    },
    //渲染上级组织列表
    renderSuperiorTeam: function () {
        var teamOptions = [];
        var organizationList = this.props.organizationList, curOrganization = this.props.organization;
        if (_.isArray(organizationList) && organizationList.length > 0) {
            organizationList.forEach(team=> {
                //过滤掉当前组织及其下级组织
                if (!this.findChildren(team.group_id, curOrganization)) {
                    teamOptions.push(<Option key={team.group_id} value={team.group_id}>
                        {team.group_name}
                    </Option>);
                }
            });
        }
        return teamOptions;
    },

    hideSaveTooltip: function () {
        let formData = this.state.formData;
        formData.saveOrganizationResult = "";
        formData.saveOrganizationMsg = "";
        formData.isOrganizationSaving = false;
        this.setState({formData: formData});
    },
    //取消enter事件
    cancelEnter: function (event) {
        event.preventDefault();
    },
    render: function () {
        var _this = this;
        var formData = this.state.formData;
        var status = this.state.status;
        var formClass = classNames('edit-organization-form', this.props.className, {
            'select': formData.select
        });
        var editResult = this.state.formData.saveOrganizationResult;
        return (
            <div className={formClass}>
                <Form horizontal className="form" onSubmit={this.cancelEnter}>
                    <Validation ref="validation" onValidate={this.handleValidate}>
                        <FormItem
                            label={this.formatMessage(messages.common_definition)}
                            id="title"
                            labelCol={{span: 5}}
                            wrapperCol={{span: 18}}
                            validateStatus={this.renderValidateStyle('title')}
                            help={status.title.isValidating ? (this.formatMessage(messages.common_is_validiting)) : (status.title.errors && status.title.errors.join(','))}>
                            <Validator
                                rules={[{required: true, min: 1, max : 20 , message: this.formatMessage(messages.common_input_character_rules)}]}>
                                <Input name="title" id="title" value={formData.title}
                                       onChange={this.setField.bind(this, 'title')}
                                       placeholder={this.formatMessage(messages.common_required_tip)}/>
                            </Validator>
                        </FormItem>
                        {
                            formData.superiorTeam ? (<FormItem
                                label={this.formatMessage(messages.organization_sub_organization)}
                                id="superiorTeam"
                                labelCol={{span: 5}}
                                wrapperCol={{span: 18}}
                                validateStatus={this.renderValidateStyle("superiorTeam")}
                                help={status.superiorTeam.errors ? status.superiorTeam.errors.join(',') : null}
                            >
                                <Validator
                                    rules={[{required: true, message: this.formatMessage(messages.organization_select_sub_organization)}]}>
                                    <Select size="large" style={{width: '100%'}}
                                            name="superiorTeam"
                                            value={formData.superiorTeam}
                                            placeholder={this.formatMessage(messages.organization_select_sub_organization)}
                                            showSearch
                                            optionFilterProp="children"
                                            notFoundContent={this.formatMessage(messages.common_not_found)}
                                            searchPlaceholder={this.formatMessage(messages.common_input_keyword)}
                                    >
                                        {this.renderSuperiorTeam()}
                                    </Select>
                                </Validator>
                            </FormItem>) : null
                        }

                        <FormItem
                            prefixCls="edit-organization-btn-item ant-form"
                            wrapperCol={{span: 24}}>
                            {this.state.formData.isOrganizationSaving ? (<Icon type="loading"/>) : (
                                editResult ? (<div className="indicator">
                                    <AlertTimer time={editResult=="error"?3000:600}
                                                message={this.state.formData.saveOrganizationMsg}
                                                type={editResult} showIcon
                                                onHide={this.hideSaveTooltip}/>
                                </div>) : null)
                            }
                            <Button type="primary" className="btn-primary-sure member-form-btn"
                                    onClick={_this.handleSubmit}>
                                <ReactIntl.FormattedMessage id="common.confirm" defaultMessage="确认"/>
                            </Button>
                            <Button type="ghost" className="btn-primary-cancel member-form-btn"
                                    onClick={_this.handleCancel}>
                                <ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消"/>
                            </Button>
                        </FormItem>
                    </Validation>
                </Form>
            </div>
        );
    }
});

module.exports = injectIntl(OrganizationForm);
