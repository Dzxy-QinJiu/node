var createReactClass = require('create-react-class');
const Validation = require('rc-form-validation-for-react16');
const Validator = Validation.Validator;
/**
 * Created by xiaojinfeng on 2016/04/19.
 */

var Form = require('antd').Form;
var Input = require('antd').Input;
var Select = require('antd').Select;
var Button = require('antd').Button;
var FormItem = Form.Item;
var classNames = require('classnames');
var AlertTimer = require('../../../../components/alert-timer');
var Icon = require('antd').Icon;
var SalesTeamActions = require('../action/sales-team-actions');
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
import Trace from 'LIB_DIR/trace';
import {ignoreCase} from 'LIB_DIR/utils/selectUtil';
import salesTeamAjax from '../ajax/sales-team-ajax';
import { validatorNameRuleRegex } from 'PUB_DIR/sources/utils/validate-util';

function noop() {
}

var SalesTeamForm = createReactClass({
    displayName: 'SalesTeamForm',
    mixins: [Validation.FieldMixin],
    propTypes: {
        salesTeam: PropTypes.object,
        cancelSalesTeamForm: PropTypes.func,
        salesTeamList: PropTypes.array,
        className: PropTypes.string,
        handleSubmitTeamForm: PropTypes.func,
        isAddRoot: PropTypes.boolean
    },
    getDefaultProps: function() {
        return {
            submitSalesTeamForm: noop,
            cancelSalesTeamForm: noop,
            salesTeamFormShow: false,
            salesTeam: {
                key: '',
                title: '',
                superiorTeam: ''
            }
        };
    },

    getFormData: function(salesTeam) {
        if (salesTeam.isEditGroup) {
            return {
                ...salesTeam,
                saveTeamMsg: '',
                saveTeamResult: '',
                isTeamSaving: false
            };
        } else {
            return {
                title: '',
                saveTeamMsg: '',
                saveTeamResult: '',
                isTeamSaving: false
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
            formData: this.getFormData(this.props.salesTeam),
            checkNameError: false,
            checkNameExist: false,
        };
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
    handleCancel: function(e) {
        Trace.traceEvent(e,'取消添加或编辑团队的修改');
        this.props.cancelSalesTeamForm();
    },

    //保存角色信息
    handleSubmit: function(e) {
        const validation = this.refs.validation;
        validation.validate( (valid) => {
            if (!valid || this.state.checkNameExist || this.state.checkNameError) {
                return;
            } else {
                Trace.traceEvent(e,'保存添加或编辑团队的修改');
                let formData = this.state.formData;
                if (formData.isEditGroup) { // 编辑部门或是组织
                    let editGroupData = {
                        group_id: formData.key,
                        group_name: formData.title,
                        user_ids: JSON.stringify(formData.userIds),
                        parent_group: formData.superiorTeam//上级团队
                    };
                    if (formData.isOrganizationFlag) { // 修改组织名称
                        editGroupData = {
                            id: formData.key,
                            official_name: formData.title,
                            isOrganizationFlag: true
                        };
                    }
                    formData.isTeamSaving = true;
                    this.setState({formData: formData});
                    SalesTeamActions.saveEditGroup(editGroupData, result => {
                        //保存结果
                        formData.saveTeamMsg = result.saveMsg;
                        formData.saveTeamResult = result.saveResult;
                        formData.isTeamSaving = false;
                        this.setState({formData: formData});
                        if (result.saveResult === 'success') {
                            //保存成功后的处理
                            const salesTeam = this.props.salesTeam;
                            if (salesTeam && salesTeam.isEditGroup) {
                                SalesTeamActions.cancelEditGroup(salesTeam);
                                //刷新团队列表
                                if (salesTeam.superiorTeam === formData.superiorTeam) {
                                    //只修改了团队的名称
                                    SalesTeamActions.updateTeamNameAfterEdit(formData);
                                } else {
                                    //修改了上级团队后，需要刷新整个团队列表及其结构
                                    SalesTeamActions.getSalesTeamList();
                                }
                            }
                        }
                    });
                } else { // 添加子部门
                    let addGroupData = {
                        groupName: formData.title
                    };
                    if (this.props.salesTeam) {
                        addGroupData.parentGroup = this.props.salesTeam.key;//上级组织
                    }
                    formData.isTeamSaving = true;
                    this.setState({formData: formData});
                    SalesTeamActions.saveAddGroup(addGroupData, (result, addTeam) => {
                        //保存结果
                        formData.saveTeamMsg = result.saveMsg;
                        formData.saveTeamResult = result.saveResult;
                        formData.isTeamSaving = false;
                        this.setState({formData: formData});
                        //添加成功后的处理
                        if (result.saveResult === 'success') {
                            if (this.props.isAddRoot) {
                                //添加根组织时的处理
                                this.props.cancelSalesTeamForm();
                            } else {
                                //添加子团队成功后的处理
                                SalesTeamActions.cancelAddGroup(this.props.salesTeam);
                            }
                            //刷新团队列表
                            SalesTeamActions.refreshTeamListAfterAdd(addTeam);
                        }
                    });
                }
            }
        });
    },

    //递归遍历团队树，查树中是否含有此团队
    findChildren: function(id, curSalesTeam) {
        if (id === curSalesTeam.key) {
            return true;
        } else {
            if (_.isArray(curSalesTeam.children) && curSalesTeam.children.length > 0) {
                //子团队中是否含有此团队
                return _.some(curSalesTeam.children, team => this.findChildren(id, team));
            } else {
                return false;
            }
        }
    },

    //渲染上级团队列表
    renderSuperiorTeam: function() {
        var teamOptions = [];
        var salesTeamList = this.props.salesTeamList, curTeam = this.props.salesTeam;
        if (_.isArray(salesTeamList) && salesTeamList.length > 0) {
            salesTeamList.forEach(team => {
                //过滤掉当前团队及其下级团队
                if (!this.findChildren(team.group_id, curTeam)) {
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
        formData.saveTeamResult = '';
        formData.saveTeamMsg = '';
        formData.isTeamSaving = false;
        this.setState({formData: formData});
    },

    handleSelect: function() {
        Trace.traceEvent(ReactDOM.findDOMNode(this),'选择上级团队');
    },
    //团队名的修改
    onChangeTeamName: function(event) {
        let formData = this.state.formData;
        formData.title = _.trim(event.target.value);
        formData.saveTeamMsg = '';
        this.setState({formData});
    },

    // 校验组织名称
    checkOrganizationName: function(){
        const isOrganizationFlag = _.get(this.state, 'formData.isOrganizationFlag');
        const organizationName = _.trim(this.state.formData.title);
        //满足验证条件后再进行唯一性验证
        if (organizationName) {
            salesTeamAjax.getOrganizationInfoByName({name: organizationName}).then( (data) => {
                if (_.isString(data)) {
                    //唯一性验证出错了
                    this.setState({
                        checkNameExist: false,
                        checkNameError: true
                    });
                } else {
                    if (data) {
                        // 已存在
                        this.setState({
                            checkNameExist: true,
                            checkNameError: false
                        });
                    } else {
                        //不存在
                        this.setState({
                            checkNameExist: false,
                            checkNameError: false
                        });
                    }
                }
            });

        } else {
            this.setState({
                checkNameExist: false,
                checkNameError: false
            });
        }
    },

    handleFocueInput: function() {
        this.setState({
            checkNameExist: false,
            checkNameError: false
        });
    },

    // 渲染校验名称提示信息
    renderCheckNameTips: function() {
        if (this.state.checkNameExist || this.state.checkNameError) {
            return (
                <div className="organizaion-check">
                    {
                        this.state.checkNameExist ? Intl.get('organization.name.existed', '组织名称已存在！') :
                            Intl.get('organization.name.is.unique', '组织名称唯一性校验出错！')
                    }
                </div>
            );
        }
    },

    render: function() {
        let formData = this.state.formData;
        let status = this.state.status;
        let formClass = classNames('edit-sales-team-form', this.props.className, {
            'select': formData.select,
            'edit-form': formData.isEditGroup
        });
        let name = Intl.get('crm.113', '部门');
        if (formData.isOrganizationFlag) {
            name = Intl.get('user.organization', '组织');
        }
        return (
            <div className={formClass} data-tracename ="编辑/添加团队表单">
                <Form layout='horizontal' className="form">
                    <Validation ref="validation" onValidate={this.handleValidate}>
                        <FormItem
                            colon={false}
                            label={formData.isEditGroup ? Intl.get('common.definition', '名称') : null}
                            id="title"
                            labelCol={{span: formData.isEditGroup ? 5 : 0}}
                            wrapperCol={{span: formData.isEditGroup ? 18 : 24}}
                            validateStatus={this.renderValidateStyle('title')}
                            help={status.title.isValidating ? Intl.get('common.is.validiting', '正在校验中..') : (status.title.errors && status.title.errors.join(','))}>
                            <Validator
                                rules={[{required: true, message: Intl.get('organization.tree.name.placeholder', '请输入{name}名称', {name: name})},
                                    validatorNameRuleRegex(10, name)]}
                            >
                                <Input
                                    name="title"
                                    id="title"
                                    value={formData.title}
                                    onChange={this.onChangeTeamName.bind(this)}
                                    className={this.state.checkNameExist || this.state.checkNameError ? 'input-red-border' : ''}
                                    placeholder={Intl.get('organization.tree.name.placeholder', '请输入{name}名称', {name: name})}
                                    data-tracename="填写团队名称"
                                    onBlur={(e) => {
                                        this.checkOrganizationName(e);
                                    }}
                                    onFocus={(e) => {
                                        this.handleFocueInput(e);
                                    }}
                                />
                            </Validator>
                        </FormItem>
                        {this.renderCheckNameTips()}
                        {
                            formData.superiorTeam ? (
                                <FormItem
                                    colon={false}
                                    label={Intl.get('sales.team.sub.group', '上级团队')}
                                    id="superiorTeam"
                                    labelCol={{span: 5}}
                                    wrapperCol={{span: 18}}
                                    validateStatus={this.renderValidateStyle('superiorTeam')}
                                    help={status.superiorTeam.errors ? status.superiorTeam.errors.join(',') : null}
                                >
                                    <Validator
                                        rules={[{required: true, message: Intl.get('sales.team.select.sub.group', '请选择上级团队')}]}>
                                        <Select size="large" style={{width: '100%'}}
                                            name="superiorTeam"
                                            value={formData.superiorTeam}
                                            placeholder={Intl.get('sales.team.select.sub.group', '请选择上级团队')}
                                            showSearch
                                            filterOption={(input, option) => ignoreCase(input, option)}
                                            optionFilterProp="children"
                                            notFoundContent={Intl.get('common.not.found', '无法找到')}
                                            searchPlaceholder={Intl.get('common.input.keyword', '输入关键词')}
                                            onChange={this.handleSelect}
                                        >
                                            {this.renderSuperiorTeam()}
                                        </Select>
                                    </Validator>
                                </FormItem>
                            ) : null
                        }

                        <FormItem
                            prefixCls="edit-sales-team-btn-item ant-form"
                            wrapperCol={{span: 24}}>
                            <SaveCancelButton loading={formData.isTeamSaving}
                                saveErrorMsg={formData.saveTeamMsg}
                                handleSubmit={this.handleSubmit.bind(this)}
                                handleCancel={this.handleCancel.bind(this)}
                            />
                        </FormItem>
                    </Validation>
                </Form>
            </div>
        );
    },
});

module.exports = SalesTeamForm;

