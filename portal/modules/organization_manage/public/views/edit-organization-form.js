var React = require('react');
var createReactClass = require('create-react-class');
const Validation = require('rc-form-validation-for-react16');
const Validator = Validation.Validator;
/**
 * Created by wangliping on 2016/10/18.
 */

import {Radio,Form,Input,Button,Icon} from 'antd';
import { AntcSelect } from 'antc';
const Option = AntcSelect.Option;
const RadioGroup = Radio.Group;
var FormItem = Form.Item;
var classNames = require('classnames');
var AlertTimer = require('../../../../components/alert-timer');
var OrganizationActions = require('../action/organization-actions');
var language = require('PUB_DIR/language/getLanguage');
import {FormattedMessage,defineMessages,injectIntl} from 'react-intl';
import reactIntlMixin from '../../../../components/react-intl-mixin';
import { ignoreCase } from 'LIB_DIR/utils/selectUtil';
const CATEGORY_TYPE = oplateConsts.CATEGORY_TYPE;
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

var OrganizationForm = createReactClass({
    displayName: 'OrganizationForm',
    mixins: [Validation.FieldMixin, reactIntlMixin],

    getDefaultProps: function() {
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

    getFormData: function(organization) {
        if (organization.isEditGroup) {
            return {
                ...organization,
                saveOrganizationMsg: '',
                saveOrganizationResult: '',
                isOrganizationSaving: false
            };
        } else {
            return {
                title: '',
                category: CATEGORY_TYPE.DEPARTMENT,
                saveOrganizationMsg: '',
                saveOrganizationResult: '',
                isOrganizationSaving: false
            };
        }
    },

    getInitialState: function() {
        return {
            status: {
                key: {},
                title: {},
                superiorTeam: {}
            },
            formData: this.getFormData(this.props.organization),
        };
    },

    componentWillReceiveProps: function(nextProps) {
        this.refs.validation.reset();
        this.setState({formData: this.getFormData(nextProps.organization)});
    },

    componentDidUpdate: function() {
        if (this.state.formData.id) {
            this.refs.validation.validate(noop);
        }
    },

    renderValidateStyle: function(item) {
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
    handleCancel: function() {
        this.props.cancelOrganizationForm();
    },

    //保存角色信息
    handleSubmit: function() {
        var _this = this;
        var validation = this.refs.validation;
        validation.validate(function(valid) {
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
                    OrganizationActions.saveEditGroup(editGroupData, result => {
                        //保存结果
                        formData.saveOrganizationMsg = result.saveMsg;
                        formData.saveOrganizationResult = result.saveResult;
                        formData.isOrganizationSaving = false;
                        _this.setState({formData: formData});
                        if (result.saveResult == 'success') {
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
                        if (_this.props.organization.key) {
                            addGroupData.parentGroup = _this.props.organization.key;//上级
                        }
                        if (_this.props.organization.category == CATEGORY_TYPE.ORGANIZATION) {
                            // 组织上添加（团队、部门）时
                            addGroupData.category = formData.category;
                        } else if (_this.props.organization.category == CATEGORY_TYPE.DEPARTMENT) {
                            //部门上添加子部门时
                            addGroupData.category = CATEGORY_TYPE.DEPARTMENT;
                        }
                    }
                    formData.isOrganizationSaving = true;
                    _this.setState({formData: formData});
                    OrganizationActions.saveAddGroup(addGroupData, (result, addGroup) => {
                        //保存结果
                        formData.saveOrganizationMsg = result.saveMsg;
                        formData.saveOrganizationResult = result.saveResult;
                        formData.isOrganizationSaving = false;
                        _this.setState({formData: formData});
                        if (result.saveResult === 'success') {
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
    findChildren: function(id, curOrganization) {
        if (id == curOrganization.key) {
            return true;
        } else {
            if (_.isArray(curOrganization.children) && curOrganization.children.length > 0) {
                //子组织中是否含有此组织
                return _.some(curOrganization.children, organization => this.findChildren(id, organization));
            } else {
                return false;
            }
        }
    },

    //渲染上级部门列表
    renderSuperiorTeam: function() {
        var teamOptions = [];
        var organizationList = this.props.organizationList, curOrganization = this.props.organization;
        if (_.isArray(organizationList) && organizationList.length > 0) {
            organizationList.forEach(team => {
                //过滤掉当前部门的下级部门
                if (team.category == CATEGORY_TYPE.DEPARTMENT && !this.findChildren(team.group_id, curOrganization)) {
                    teamOptions.push(<Option key={team.group_id} value={team.group_id}>
                        {team.group_name}
                    </Option>);
                }
            });
        }
        return teamOptions;
    },

    hideSaveTooltip: function() {
        let formData = this.state.formData;
        formData.saveOrganizationResult = '';
        formData.saveOrganizationMsg = '';
        formData.isOrganizationSaving = false;
        this.setState({formData: formData});
    },

    //取消enter事件
    cancelEnter: function(event) {
        event.preventDefault();
    },

    onCategoryChange: function(event) {
        this.state.formData.category = event.target.value;
        this.setState({formData: this.state.formData});
    },

    render: function() {
        var _this = this;
        var formData = this.state.formData;
        var status = this.state.status;
        var formClass = classNames('edit-organization-form', this.props.className, {
            'select': formData.select
        });
        var editResult = this.state.formData.saveOrganizationResult;
        return (
            <div className={formClass}>
                <Form layout='horizontal' className="form" onSubmit={this.cancelEnter}>
                    <Validation ref="validation" onValidate={this.handleValidate}>
                        {//在组织上添加时，需要选择添加的是团队还是部门
                            this.props.organization.isAddGroup && this.props.organization.category == CATEGORY_TYPE.ORGANIZATION ?
                                <FormItem
                                    label=" "
                                    id="category"
                                    labelCol={{span: language.lan() == 'zh' ? 5 : 1}}
                                    wrapperCol={{span: language.lan() == 'zh' ? 18 : 23}}
                                    colon={false}
                                >
                                    <RadioGroup onChange={this.onCategoryChange}
                                        value={formData.category}>
                                        <Radio value={CATEGORY_TYPE.DEPARTMENT}>{Intl.get('crm.113', '部门')}</Radio>
                                        <Radio value={CATEGORY_TYPE.TEAM}>{Intl.get('user.user.team', '团队')}</Radio>
                                    </RadioGroup>
                                </FormItem> : null}
                        <FormItem
                            label={this.formatMessage(messages.common_definition)}
                            id="title"
                            labelCol={{span: 5}}
                            wrapperCol={{span: 18}}
                            validateStatus={this.renderValidateStyle('title')}
                            help={status.title.isValidating ? (this.formatMessage(messages.common_is_validiting)) : (status.title.errors && status.title.errors.join(','))}>
                            <Validator
                                rules={[{required: true, min: 1, max: 20 , message: this.formatMessage(messages.common_input_character_rules)}]} trigger='onBlur'>
                                <Input name="title" id="title" value={formData.title}
                                    onChange={this.setField.bind(this, 'title')}
                                    placeholder={this.formatMessage(messages.common_required_tip)}/>
                            </Validator>
                        </FormItem>
                        {//修改部门，上级也是部门时，可以修改上级部门
                            formData.isEditGroup && formData.category == CATEGORY_TYPE.DEPARTMENT && this.props.parentGroup.category == CATEGORY_TYPE.DEPARTMENT ? (
                                <FormItem
                                    label={Intl.get('organization.parent.department', '上级部门')}
                                    id="superiorTeam"
                                    labelCol={{span: 5}}
                                    wrapperCol={{span: 18}}
                                    validateStatus={this.renderValidateStyle('superiorTeam')}
                                    help={status.superiorTeam.errors ? status.superiorTeam.errors.join(',') : null}
                                >
                                    <Validator
                                        rules={[{required: true, message: Intl.get('organization.select.parent.department', '请选择上级部门')}]} trigger='onBlur'>
                                        <AntcSelect size="large" style={{width: '100%'}}
                                            name="superiorTeam"
                                            value={formData.superiorTeam}
                                            placeholder={Intl.get('organization.select.parent.department', '请选择上级部门')}
                                            showSearch
                                            optionFilterProp="children"
                                            notFoundContent={this.formatMessage(messages.common_not_found)}
                                            searchPlaceholder={this.formatMessage(messages.common_input_keyword)}
                                            filterOption={(input, option) => ignoreCase(input, option)}
                                        >
                                            {this.renderSuperiorTeam()}
                                        </AntcSelect>
                                    </Validator>
                                </FormItem>) : null
                        }

                        <FormItem
                            prefixCls="edit-organization-btn-item ant-form"
                            wrapperCol={{span: 23}}>
                            {this.state.formData.isOrganizationSaving ? (<Icon type="loading"/>) : (
                                editResult ? (<div className="indicator">
                                    <AlertTimer time={editResult == 'error' ? 3000 : 600}
                                        message={this.state.formData.saveOrganizationMsg}
                                        type={editResult} showIcon
                                        onHide={this.hideSaveTooltip}/>
                                </div>) : null)
                            }
                            <Button type="primary" size="default" className="btn-primary-sure member-form-btn"
                                onClick={_this.handleSubmit}>
                                <ReactIntl.FormattedMessage id="common.confirm" defaultMessage="确认"/>
                            </Button>
                            <Button type="ghost" size="default" className="btn-primary-cancel member-form-btn"
                                onClick={_this.handleCancel}>
                                <ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消"/>
                            </Button>
                        </FormItem>
                    </Validation>
                </Form>
            </div>
        );
    },
});

module.exports = injectIntl(OrganizationForm);

