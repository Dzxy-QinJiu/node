const Validation = require('rc-form-validation');
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
import Trace from 'LIB_DIR/trace';

function noop() {
}

var SalesTeamForm = React.createClass({
    mixins: [Validation.FieldMixin],
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
            formData: this.getFormData(this.props.salesTeam)
        };
    },
    componentWillReceiveProps: function(nextProps) {
        this.refs.validation.reset();
        this.setState({
            formData: this.getFormData(nextProps.salesTeam)
        });
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
        var _this = this;
        var validation = this.refs.validation;
        validation.validate(function(valid) {
            if (!valid) {
                return;
            } else {
                Trace.traceEvent(e,'保存添加或编辑团队的修改');
                let formData = _this.state.formData;
                if (formData.isEditGroup) {
                    let editGroupData = {
                        group_id: formData.key,
                        group_name: formData.title,
                        user_ids: JSON.stringify(formData.userIds),
                        parent_group: formData.superiorTeam//上级团队
                    };
                    formData.isTeamSaving = true;
                    _this.setState({formData: formData});
                    SalesTeamActions.saveEditGroup(editGroupData, result => {
                        //保存结果
                        formData.saveTeamMsg = result.saveMsg;
                        formData.saveTeamResult = result.saveResult;
                        formData.isTeamSaving = false;
                        _this.setState({formData: formData});
                        if (result.saveResult == 'success') {
                            //保存成功后的处理
                            var salesTeam = _this.props.salesTeam;
                            if (salesTeam && salesTeam.isEditGroup) {
                                SalesTeamActions.cancelEditGroup(salesTeam);
                                //刷新团队列表
                                if (salesTeam.superiorTeam == formData.superiorTeam) {
                                    //只修改了团队的名称
                                    SalesTeamActions.updateTeamNameAfterEdit(formData);
                                } else {
                                    //修改了上级团队后，需要刷新整个团队列表及其结构
                                    SalesTeamActions.getSalesTeamList();
                                }
                            }
                        }
                    });
                } else {
                    let addGroupData = {
                        groupName: formData.title
                    };
                    if (_this.props.salesTeam) {
                        addGroupData.parentGroup = _this.props.salesTeam.key;//上级组织
                    }
                    formData.isTeamSaving = true;
                    _this.setState({formData: formData});
                    SalesTeamActions.saveAddGroup(addGroupData, (result, addTeam) => {
                        //保存结果
                        formData.saveTeamMsg = result.saveMsg;
                        formData.saveTeamResult = result.saveResult;
                        formData.isTeamSaving = false;
                        _this.setState({formData: formData});
                        //添加成功后的处理
                        if (result.saveResult === 'success') {
                            if (_this.props.isAddRoot) {
                                //添加根组织时的处理
                                _this.props.cancelSalesTeamForm();
                            } else {
                                //添加子团队成功后的处理
                                SalesTeamActions.cancelAddGroup(_this.props.salesTeam);
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
        if (id == curSalesTeam.key) {
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
        Trace.traceEvent(this.getDOMNode(),'选择上级团队');
    },
    render: function() {
        var _this = this;
        var formData = this.state.formData;
        var status = this.state.status;
        var formClass = classNames('edit-sales-team-form', this.props.className, {
            'select': formData.select
        });
        var editResult = this.state.formData.saveTeamResult;
        return (
            <div className={formClass} data-tracename ="编辑/添加团队表单">
                <Form horizontal className="form">
                    <Validation ref="validation" onValidate={this.handleValidate}>
                        <FormItem
                            label={Intl.get('common.definition', '名称')}
                            id="title"
                            labelCol={{span: 5}}
                            wrapperCol={{span: 18}}
                            validateStatus={this.renderValidateStyle('title')}
                            help={status.title.isValidating ? Intl.get('common.is.validiting', '正在校验中..') : (status.title.errors && status.title.errors.join(','))}>
                            <Validator
                                rules={[{required: true, min: 1, max: 20 , message: Intl.get('common.input.character.rules', '最少1个字符,最多8个字符')}]}>
                                <Input name="title" id="title" value={formData.title}
                                    onChange={this.setField.bind(this, 'title')}
                                    placeholder={Intl.get('common.required.tip', '必填项*')}
                                    data-tracename="填写团队名称"
                                />
                            </Validator>
                        </FormItem>
                        {
                            formData.superiorTeam ? (<FormItem
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
                                        optionFilterProp="children"
                                        notFoundContent={Intl.get('common.not.found', '无法找到')}
                                        searchPlaceholder={Intl.get('common.input.keyword', '输入关键词')}
                                        onChange={this.handleSelect}
                                    >
                                        {this.renderSuperiorTeam()}
                                    </Select>
                                </Validator>
                            </FormItem>) : null
                        }

                        <FormItem
                            prefixCls="edit-sales-team-btn-item ant-form"
                            wrapperCol={{span: 24}}>
                            {this.state.formData.isTeamSaving ? (<Icon type="loading"/>) : (
                                editResult ? (<div className="indicator">
                                    <AlertTimer time={editResult == 'error' ? 3000 : 600}
                                        message={this.state.formData.saveTeamMsg}
                                        type={editResult} showIcon
                                        onHide={this.hideSaveTooltip}/>
                                </div>) : null)
                            }
                            <Button type="primary" className="btn-primary-sure member-form-btn"
                                onClick={(e) => {_this.handleSubmit(e);}}
                            >
                                <ReactIntl.FormattedMessage id="common.confirm" defaultMessage="确认"/>
                            </Button>
                            <Button type="ghost" className="btn-primary-cancel member-form-btn"
                                onClick={(e) => {_this.handleCancel(e);}}

                            >
                                <ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消"/>
                            </Button>
                        </FormItem>
                    </Validation>
                </Form>
            </div>
        );
    }
});

module.exports = SalesTeamForm;
