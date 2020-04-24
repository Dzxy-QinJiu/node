/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2019/08/27.
 */
import { Form, Select, message, Icon, Popconfirm, Checkbox } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
import DetailCard from 'CMP_DIR/detail-card';
import classNames from 'classnames';
import Spinner from 'CMP_DIR/spinner';
import CustomerPoolAjax from '../../ajax/customer-pool-configs';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';

const DEFAULT_SOURCE_MAPS = {
    team_id: '', //客户原始团队id
    team_name: '', //客户原始团队名称
    customer_label: [], //客户阶段
    labels: [], // 客户标签
};

const FORM_TYPE = {
    ADD: 'add',
    EDIT: 'edit'
};

const RULE_FORM_HEIGHT = 332;

class CustomerPoolRuleForm extends React.Component{
    state = {
        isLoading: false,
        errMsg: '',
        formData: this.getIntialState(), // 规则信息
    };

    componentDidMount() {
        this.getAllCustomerStageList();
    }

    getIntialState() {
        let team_range = _.cloneDeep(this.props.curCustomerRule.team_range) || [_.cloneDeep(DEFAULT_SOURCE_MAPS)];
        team_range = _.map(team_range, (range,index) => {
            range.timeStamp = new Date().valueOf() + index;
            return range;
        });
        return {
            team_id: this.props.curCustomerRule.team_id,
            team_name: this.props.curCustomerRule.team_name,
            team_range,
            show_my_customers: !!this.props.curCustomerRule.show_my_customers
        };
    }

    getAllCustomerStageList = () => {
        _.each(this.state.formData.team_range, (range, index) => {
            // 没有customerStageList，team_id有值时，以及没有在请求客户阶段时
            let isCanReq = !range.customerStageList && range.team_id && !range.isLoading;
            if(isCanReq) {
                this.getCustomerStageList(index, range.team_id);
            }
        });
    };

    getCustomerStageList = (index, teamId) => {
        let formData = this.state.formData;
        let team_range = formData.team_range;
        let curTeamRange = team_range[index];
        curTeamRange.isLoading = true;
        team_range[index] = curTeamRange;
        this.setState({team_range});
        CustomerPoolAjax.getCustomerStageByTeamId({team_id: teamId}).then((res) => {
            delete curTeamRange.isLoading;
            let curPropsTeamRangeIndex = _.findIndex(this.props.curCustomerRule.team_range, range => range.team_id === teamId);
            if(curPropsTeamRangeIndex > -1) {
                this.props.curCustomerRule.team_range[curPropsTeamRangeIndex].customerStageList = res.customer_stages;
            }
            curTeamRange.customerStageList = res.customer_stages;
            team_range[index] = curTeamRange;
            this.setState({formData});
        }, (err) => {
            delete curTeamRange.isLoading;
            team_range[index] = curTeamRange;
            this.setState({formData});
        });
    };

    handleSubmit = () => {
        this.props.form.validateFields((err) => {
            if(err) return false;
            let formData = this.state.formData;
            let saveObj = {
                team_id: formData.team_id,
                team_name: formData.team_name,
                show_my_customers: formData.show_my_customers,
                team_range: _.map(formData.team_range, range => {
                    return {
                        team_id: range.team_id, //客户原始团队id
                        team_name: range.team_name, //客户原始团队名称
                        customer_label: range.customer_label, //客户阶段
                        labels: range.labels, // 客户标签
                    };
                })
            };
            if(this.props.formType === FORM_TYPE.EDIT) {
                saveObj.id = this.props.curCustomerRule.id;
            }
            this.setState({
                isLoading: true,
                errMsg: '',
            });
            let successFunc = () => {
                this.setState({
                    isLoading: false,
                    errMsg: '',
                    formData: this.getIntialState(),
                });
            };
            let errorFunc = (errorMsg) => {
                this.setState({
                    isLoading: false,
                    errMsg: errorMsg,
                });
            };
            this.props.handleSubmit(saveObj, successFunc, errorFunc);
        });
    };

    handleCancel = () => {
        this.setState({
            formData: this.getIntialState()
        }, () => {
            this.props.handleCancel();
        });
    };

    handleEdit = () => {
        this.getAllCustomerStageList();
        this.props.handleEdit();
    };

    handleDelete = () => {
        this.props.handleDelete();
    };

    handleSelectVisibelRange = (value) => {
        let formData = this.state.formData;
        let team = _.find(this.props.visibleTeamList, item => item.group_id === value);
        formData.team_id = team.group_id;
        formData.team_name = team.group_name;
        this.setState({formData});
    };

    handleVisibleChange = (e) => {
        let formData = this.state.formData;
        formData.show_my_customers = !e.target.checked;
        this.setState({formData});
    };

    handleSelectSource = (index, key, value) => {
        let formData = this.state.formData;
        let team_range = formData.team_range;
        let team = {};
        let curTeamRange = team_range[index];
        switch (key) {
            case 'team_id':
                this.getCustomerStageList(index, value);
                team = _.find(this.props.teamList, item => item.group_id === value);
                curTeamRange.team_id = value;
                curTeamRange.team_name = team.group_name;
                if(curTeamRange.team_id === _.get(this.props.curCustomerRule,'team_range[index].team_id')) {
                    curTeamRange.customer_label = this.props.curCustomerRule.team_range[index].customer_label;
                }else {
                    curTeamRange.customer_label = [];
                }
                team_range[index] = curTeamRange;
                this.setState({formData});
                break;
            case 'stage':
                curTeamRange.customer_label = value;
                this.setState({formData});
                break;
            case 'label':
                curTeamRange.labels = value;
                this.setState({formData});
                break;
        }
    };

    // 增加来源
    handleAddSource = () => {
        let formData = this.state.formData;
        if(_.get(formData,'team_range.length') === 5) {
            message.warning(Intl.get('crm.customer.pool.rule.source.max.length.tip', '客户来源设置最多5个'));
            return false;
        }
        formData.team_range.push({..._.cloneDeep(DEFAULT_SOURCE_MAPS), timeStamp: new Date().valueOf()});
        this.setState({
            formData
        });
    };

    // 删除来源
    handleDeleteSource = (index) => {
        let formData = _.cloneDeep(this.state.formData);

        formData.team_range.splice(index, 1);
        this.setState({formData});
    };

    renderBtnBlock = () => {
        // 是否是展示状态
        let isShowBtn = !this.props.isEdit && this.props.formType === FORM_TYPE.EDIT;
        if(isShowBtn) {
            if(this.props.curCustomerRule.isDelete) {
                return <Spinner/>;
            }else {
                return (
                    <div className="rule-form-btns">
                        <Popconfirm
                            title={Intl.get('crm.customer.pool.rule.sure.delete.tip', '确认要删除此项规则吗？')}
                            onConfirm={this.handleDelete}
                        >
                            <i
                                className="iconfont icon-delete handle-btn-item"
                                title={Intl.get('common.delete', '删除')}
                            />
                        </Popconfirm>
                        <i
                            className="iconfont icon-edit-btn handle-btn-item"
                            title={Intl.get('common.edit', '编辑')}
                            onClick={this.handleEdit}
                        />
                    </div>
                );
            }
        }else {return null;}
    };

    renderRuleForm = () => {
        const formItemLayout = {
            labelCol: { span: 5 },
            wrapperCol: { span: 19 }
        };
        const teamRangeLength = _.get(this.state.formData.team_range,'length');
        const CustomerSourceFormLayout = {
            labelCol: { span: teamRangeLength > 1 ? 7 : 6 },
            wrapperCol: { span: teamRangeLength > 1 ? 17 : 18 }
        };
        const formData = this.state.formData;
        const { getFieldDecorator } = this.props.form;
        const teamOptions = _.map(this.props.teamList, team => (
            <Option key={team.group_id} value={team.group_id}>{team.group_name}</Option>
        ));
        const visibleTeamOptions = _.map(this.props.visibleTeamList, team => (
            <Option key={team.group_id} value={team.group_id}>{team.group_name}</Option>
        ));
        const customerLabelOptions = _.map(this.props.customerLabelList, label => (
            <Option key={label} value={label}>{label}</Option>
        ));

        const rangeCls = classNames('customer-source-item', {
            'has-range-more': teamRangeLength > 1
        });

        const visibleText = this.props.curCustomerRule.show_my_customers ? '' : (<span className="visible-text">({Intl.get('crm.customer.pool.rule.own.visible', '自己释放的自己不可见')})</span>);

        const formContent = (
            <React.Fragment>
                <FormItem {...formItemLayout} label={Intl.get('crm.customer.pool.rule.form.name', '规则名称')}>
                    <div className="rule-form-title-wrapper">
                        <span className="rule-form-label">{Intl.get('crm.customer.pool.rule.name', '{name}客户池', {name: _.get(formData,'team_name', '')})}</span>
                        {this.renderBtnBlock()}
                    </div>
                </FormItem>
                <FormItem {...formItemLayout} label={Intl.get('crm.customer.visible.range', '可见范围')}>
                    {this.props.isEdit ? (
                        <div>
                            {
                                this.props.formType === FORM_TYPE.ADD ? getFieldDecorator('team_id', {
                                    initialValue: formData.team_id,
                                    rules: [
                                        {required: true, message: Intl.get('crm.customer.pool.select.range', '请选择可见范围')},
                                    ],
                                })(
                                    <Select
                                        showSearch
                                        optionFilterProp="children"
                                        placeholder={Intl.get('crm.customer.pool.rule.range.tip', '请选择客户能被哪些团队或者成员看到')}
                                        onChange={this.handleSelectVisibelRange}
                                    >
                                        {visibleTeamOptions}
                                    </Select>
                                ) : (<div className="customer-info-text">{_.get(formData,'team_name', '')}</div>)
                            }
                            {
                                getFieldDecorator('show_my_customers', {
                                    initialValue: !formData.show_my_customers,
                                    valuePropName: 'checked'
                                })(
                                    <Checkbox
                                        onChange={this.handleVisibleChange}
                                    >
                                        {Intl.get('crm.customer.pool.rule.own.visible', '自己释放的自己不可见')}
                                    </Checkbox>
                                )
                            }
                        </div>
                    ) : (
                        <span className="customer-info-text">{_.get(formData,'team_name', '')}{visibleText}</span>
                    )}
                </FormItem>
                <FormItem {...formItemLayout} label={Intl.get('crm.customer.pool.source', '客户来源')}>
                    <div className="customer-source-wrapper">
                        <div className="customer-source-content">
                            {_.map(formData.team_range, (source, index) => {
                                const customerStageOptions = _.map(source.customerStageList, stage => (
                                    <Option key={stage.id} value={stage.id}>{stage.name}</Option>
                                ));
                                let customer_label = [];
                                if(!this.props.isEdit && this.props.formType === FORM_TYPE.EDIT) {
                                    customer_label = _.chain(source.customerStageList)
                                        .filter(stage => _.includes(source.customer_label, stage.id))
                                        .map(item => item.name)
                                        .value();
                                }
                                const timeStamp = source.timeStamp;
                                return (
                                    <div className={rangeCls} key={'source' + timeStamp}>
                                        {this.props.isEdit && teamRangeLength > 1 ? (
                                            <div className="circle-button circle-button-minus"
                                                title={Intl.get('common.delete', '删除')}
                                                onClick={this.handleDeleteSource.bind(this, index)}>
                                                <Icon type="minus"/>
                                            </div>
                                        ) : null}
                                        <FormItem {...CustomerSourceFormLayout} label={Intl.get('crm.customer.pool.rule.original.team', '原始团队')}>
                                            {this.props.isEdit ? (getFieldDecorator('team_id' + timeStamp, {
                                                initialValue: source.team_id,
                                                rules: [
                                                    {required: true, message: Intl.get('crm.customer.pool.rule.original.team.select.tip', '请选择原始团队')},
                                                ],
                                            })(
                                                <Select
                                                    showSearch
                                                    optionFilterProp="children"
                                                    placeholder={Intl.get('contract.choose', '请选择')}
                                                    onChange={this.handleSelectSource.bind(this, index, 'team_id')}
                                                >
                                                    {teamOptions}
                                                </Select>
                                            )) : (
                                                <span className="customer-info-text">{_.get(source, 'team_name', '')}</span>
                                            )}
                                        </FormItem>
                                        <FormItem {...CustomerSourceFormLayout} label={Intl.get('weekly.report.customer.stage', '客户阶段')}>
                                            {source.isLoading ? (
                                                <div className="customer-stage-list-loading">
                                                    {Intl.get('crm.customer.pool.rule.get.stage.lists', '正在获取客户阶段列表')}
                                                    <Icon type="loading"/>
                                                </div>) : (
                                                this.props.isEdit ? (getFieldDecorator('stage' + timeStamp, {
                                                    initialValue: source.customer_label,
                                                    rules: [
                                                        // {required: true, message: Intl.get('crm.customer.pool.rule.select.customer.stage', '请选择客户阶段')},
                                                    ],
                                                })(
                                                    <Select
                                                        showSearch
                                                        optionFilterProp="children"
                                                        mode="multiple"
                                                        placeholder={Intl.get('contract.choose', '请选择')}
                                                        onChange={this.handleSelectSource.bind(this, index, 'stage')}
                                                    >
                                                        {customerStageOptions}
                                                    </Select>
                                                )) : (
                                                    <span className="customer-info-text">{customer_label.join(',') || Intl.get('crm.customer.pool.unlimited', '不限')}</span>
                                                )
                                            )}
                                        </FormItem>
                                        <FormItem {...CustomerSourceFormLayout} label={Intl.get('crm.customer.label', '客户标签')}>
                                            {this.props.isEdit ? (getFieldDecorator('label' + timeStamp, {
                                                initialValue: source.labels,
                                                rules: [
                                                    // {required: true, message: Intl.get('crm.customer.pool.rule.select.customer.label', '请选择客户标签')},
                                                ],
                                            })(
                                                <Select
                                                    showSearch
                                                    optionFilterProp="children"
                                                    mode="multiple"
                                                    placeholder={Intl.get('contract.choose', '请选择')}
                                                    onChange={this.handleSelectSource.bind(this, index, 'label')}
                                                >
                                                    {customerLabelOptions}
                                                </Select>
                                            )) : (
                                                <span className="customer-info-text">{_.get(source, 'labels',[]).join(',') || Intl.get('crm.customer.pool.unlimited', '不限')}</span>
                                            )}
                                        </FormItem>
                                    </div>
                                );
                            })}
                        </div>
                        {
                            this.props.isEdit ? (
                                <div className="customer-source-btn">
                                    <span onClick={this.handleAddSource}><i className="iconfont icon-add"/>{Intl.get('crm.customer.pool.rule.add.source', '增加来源')}</span>
                                </div>
                            ) : null
                        }
                    </div>
                </FormItem>
            </React.Fragment>
        );

        let content = null;

        if(this.props.isUseGeminiScrollbar) {
            content = (
                <GeminiScrollbar ref="geminiScrollbarRef" className="scrollbar-out-card-style">
                    {formContent}
                </GeminiScrollbar>
            );
        }else {
            content = formContent;
        }

        return (
            <Form style={{height: this.props.isUseGeminiScrollbar ? this.props.height : 'auto'}}>
                {content}
            </Form>
        );
    };

    render() {
        let cls = classNames('customer-rule-form-container', {
            'hover-show-edit': !this.props.isEdit && this.props.formType === FORM_TYPE.EDIT
        });
        return (
            <DetailCard
                content={this.renderRuleForm()}
                isEdit={this.props.isEdit}
                className={cls}
                loading={this.state.isLoading}
                saveErrorMsg={this.state.errMsg}
                handleSubmit={this.handleSubmit}
                handleCancel={this.handleCancel}
            />
        );
    }

}
CustomerPoolRuleForm.defaultProps = {
    isEdit: false,
    curCustomerRule: {},
    teamList: [],
    visibleTeamList: [],
    customerLabelList: [],
    formType: 'add',
    handleCancel: function() {},
    handleEdit: function() {},
    handleDelete: function() {},
    handleSubmit: function() {},
    height: RULE_FORM_HEIGHT,
    //是否使用滚动条，默认不使用
    isUseGeminiScrollbar: false,
};
CustomerPoolRuleForm.propTypes = {
    isEdit: PropTypes.bool,
    key: PropTypes.string,
    curCustomerRule: PropTypes.object,
    form: PropTypes.object,
    teamList: PropTypes.array,
    visibleTeamList: PropTypes.array,
    customerLabelList: PropTypes.array,
    formType: PropTypes.string,
    handleCancel: PropTypes.func,
    handleEdit: PropTypes.func,
    handleDelete: PropTypes.func,
    handleSubmit: PropTypes.func,
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    isUseGeminiScrollbar: PropTypes.bool,
};

export default Form.create()(CustomerPoolRuleForm);