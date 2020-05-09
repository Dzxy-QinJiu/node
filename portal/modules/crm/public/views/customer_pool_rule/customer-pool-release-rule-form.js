/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2020/03/12.
 */
//添加、编辑释放规则
import { Form, Col, Select, message, Icon, Popconfirm, InputNumber, Switch } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
import DetailCard from 'CMP_DIR/detail-card';
import classNames from 'classnames';
import Spinner from 'CMP_DIR/spinner';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';

const FORM_TYPE = {
    ADD: 'add',
    EDIT: 'edit'
};

const INTERVAL_KEYS = [
    {name: Intl.get('contract.79','日'), value: 'D'},
    {name: Intl.get('common.time.unit.week','周'), value: 'W'},
    {name: Intl.get('common.time.unit.month','月'), value: 'M'},
];

//未跟进时长默认为7天
const INTERVER_TIME = 7;

//负责类型
const RESPONSIBLE_TYPE = [{
    name: Intl.get('crm.6', '负责人'),
    value: 'release_owner',
}, {
    name: Intl.get('crm.second.sales', '联合跟进人'),
    value: 'release_followup',
}];

const RULE_FORM_HEIGHT = 225;

class CustomerPoolReleaseRuleForm extends React.Component {
    state = {
        isLoading: false,
        errMsg: '',
        formData: this.getIntialState(), // 规则信息
    };

    getIntialState() {
        let curRule = this.props.curRule;
        //autoReleasePeriod: '20D'/'4M'/'5Y'
        let autoReleasePeriod = _.get(curRule,'auto_release_period', '');

        //取出数字和间隔单位
        let auto_release_period = INTERVER_TIME;
        let interval = INTERVAL_KEYS[0].value;
        if(autoReleasePeriod) {
            auto_release_period = autoReleasePeriod.replace(/[a-z]+/ig, '');
            interval = autoReleasePeriod.replace(/[0-9]+/ig, '');
            //取余7得0，说明是7的倍数，转为周
            let isWeek = auto_release_period % INTERVER_TIME;
            if(!isWeek) {
                auto_release_period = auto_release_period / INTERVER_TIME;
                interval = INTERVAL_KEYS[1].value;
            }
        }

        //处理释放负责类型
        let responsible_type = [];
        if(curRule.release_owner) {
            responsible_type.push(RESPONSIBLE_TYPE[0]);
        }
        if(curRule.release_followup) {
            responsible_type.push(RESPONSIBLE_TYPE[1]);
        }

        return {
            team_id: curRule.team_id,
            team_name: curRule.team_name,
            auto_release: _.get(curRule, 'auto_release', true),
            auto_release_period,
            interval,
            responsible_type
        };
    }

    handleSelectTeam = (value) => {
        let formData = this.state.formData;
        let team = _.find(this.props.visibleTeamList, item => item.group_id === value);
        formData.team_id = team.group_id;
        formData.team_name = team.group_name;
        this.setState({formData});
    };

    handleSelectInterval = (value) => {
        let { formData } = this.state;
        formData.interval = value;
        this.setState({formData});
    };

    handleSubmit = () => {
        this.props.form.validateFields((err, values) => {
            if(err) return false;
            let formData = this.state.formData;
            let saveObj = {
                team_id: formData.team_id,
                team_name: formData.team_name,
                auto_release: values.auto_release
            };

            //处理未跟进时长，格式化为：'2D'/'3M'形式
            let auto_release_period = values.auto_release_period;
            let interval = formData.interval;
            if(interval === INTERVAL_KEYS[1].value) {//如果为周的话，需要转为天
                auto_release_period = auto_release_period * INTERVER_TIME;
                interval = INTERVAL_KEYS[0].value;
            }
            saveObj.auto_release_period = auto_release_period + interval;

            //处理释放负责类型
            //负责人
            saveObj[RESPONSIBLE_TYPE[0].value] = !!_.includes(values.responsible_type, RESPONSIBLE_TYPE[0].value);
            //联合跟进人
            saveObj[RESPONSIBLE_TYPE[1].value] = !!_.includes(values.responsible_type, RESPONSIBLE_TYPE[1].value);

            if(this.props.formType === FORM_TYPE.EDIT) {
                saveObj.id = this.props.curRule.id;
                if(this.props.isDefaultRuleConfig(this.props.curRule)) {//默认规则
                    delete saveObj.team_id;
                    delete saveObj.team_name;
                }
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
        this.props.handleEdit();
    };

    handleDelete = () => {
        this.props.handleDelete();
    };

    renderBtnBlock = (isDefaultRuleConfig) => {
        // 是否是展示状态,不是处于编辑状态并且能展示按钮
        let isShowBtn = !this.props.isEdit && this.props.showBtn && this.props.formType === FORM_TYPE.EDIT;
        if(isShowBtn) {
            if(this.props.curRule.isDelete) {
                return <Spinner/>;
            }else {
                return (
                    <div className="rule-form-btns">
                        {isDefaultRuleConfig ? null : (
                            <Popconfirm
                                title={Intl.get('crm.customer.pool.rule.sure.delete.tip', '确认要删除此项规则吗？')}
                                onConfirm={this.handleDelete}
                            >
                                <i
                                    className="iconfont icon-delete handle-btn-item"
                                    title={Intl.get('common.delete', '删除')}
                                />
                            </Popconfirm>
                        )}
                        <i
                            className="iconfont icon-edit-btn handle-btn-item"
                            title={Intl.get('common.edit', '编辑')}
                            onClick={this.handleEdit}
                        />
                    </div>
                );
            }
        }
        return null;
    };

    renderRuleForm = () => {
        const isDefaultRuleConfig = this.props.isDefaultRuleConfig(this.props.curRule);
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 18 }
        };

        const defaultFormLayout = {
            wrapperCol: { span: 24 },
            colon: false,
        };

        const ruleNameFormLayout = isDefaultRuleConfig ? defaultFormLayout : {...formItemLayout, label: Intl.get('crm.customer.pool.rule.form.name', '规则名称')};

        const formData = this.state.formData;
        const { getFieldDecorator } = this.props.form;
        const visibleTeamOptions = _.map(this.props.visibleTeamList, team => (
            <Option key={team.group_id} value={team.group_id}>{team.group_name}</Option>
        ));

        const statusText = formData.auto_release ? Intl.get('common.enabled', '启用') : Intl.get('common.not.enabled', '未启用');
        const curInterval = _.find(INTERVAL_KEYS, item => item.value === formData.interval);
        const noFollowUpTimeText = _.get(formData,'auto_release_period', '') + curInterval.name;
        const cls = classNames({
            'default-edit-form-content': isDefaultRuleConfig && this.props.isEdit
        });

        const formContent = (
            <React.Fragment>
                <FormItem {...ruleNameFormLayout}>
                    <div className="rule-form-title-wrapper">
                        <span className="rule-form-label">{Intl.get('crm.pool.release.rules.name', '{name}释放规则', {name: _.get(formData,'team_name', '')})}</span>
                        {this.renderBtnBlock(isDefaultRuleConfig)}
                    </div>
                </FormItem>
                <div className={cls}>
                    <FormItem {...formItemLayout} label={Intl.get('sales.process.suitable.objects', '适用范围')}>
                        {this.props.formType === FORM_TYPE.ADD && !isDefaultRuleConfig ? (
                            <React.Fragment>
                                {
                                    getFieldDecorator('team_id', {
                                        initialValue: formData.team_id,
                                        rules: [
                                            {required: true, message: Intl.get('crm.pool.select.team.placeholder', '选择适用团队')},
                                        ],
                                    })(
                                        <Select
                                            showSearch
                                            optionFilterProp="children"
                                            placeholder={Intl.get('crm.pool.select.team.placeholder', '选择适用团队')}
                                            onChange={this.handleSelectTeam}
                                        >
                                            {visibleTeamOptions}
                                        </Select>
                                    )
                                }
                            </React.Fragment>
                        ) : (
                            <span className="customer-info-text">{isDefaultRuleConfig ? Intl.get('user.list.all.teamlist', '全部团队') : _.get(formData,'team_name', '')}</span>
                        )}
                    </FormItem>
                    <FormItem {...formItemLayout} label={Intl.get('crm.pool.release.rule.non.followup.time', '未跟进时长')}>
                        {this.props.isEdit ? (
                            <React.Fragment>
                                <Col span={7}>
                                    <FormItem className="auto-release-period-item">
                                        {
                                            getFieldDecorator('auto_release_period', {
                                                initialValue: formData.auto_release_period,
                                                rules: [
                                                    {required: true, message: Intl.get('contract.44', '不能为空')}
                                                ],
                                            })(
                                                <InputNumber min={1}/>
                                            )
                                        }
                                    </FormItem>
                                </Col>
                                <Col span={4}>
                                    <Select
                                        value={formData.interval}
                                        onChange={this.handleSelectInterval}
                                    >
                                        {INTERVAL_KEYS.map(item => (<Option key={item.value} value={item.value}>{item.name}</Option>))}
                                    </Select>
                                </Col>
                            </React.Fragment>
                        ) : (
                            <span className="customer-info-text">{noFollowUpTimeText}</span>
                        )}
                    </FormItem>
                    <FormItem {...formItemLayout} label={Intl.get('crm.pool.responsible.type', '负责类型')}>
                        {/*负责人release_owner、联合跟进人release_followup可多选*/}
                        {this.props.isEdit ? (
                            getFieldDecorator('responsible_type', {
                                initialValue: _.map(formData.responsible_type,'value'),
                                rules: [
                                    {required: true, message: Intl.get('crm.pool.responsible.type.placeholder', '请选择负责类型')},
                                ]
                            })(
                                <Select
                                    mode="multiple"
                                    placeholder={Intl.get('crm.pool.responsible.type.placeholder', '请选择负责类型')}
                                >
                                    {RESPONSIBLE_TYPE.map(item => (<Option key={item.value} value={item.value}>{item.name}</Option>))}
                                </Select>
                            )
                        ) : (
                            <span className="customer-info-text">{_.map(formData.responsible_type,'name').join(',')}</span>
                        )}
                    </FormItem>
                    <FormItem {...formItemLayout} label={Intl.get('common.status', '状态')}>
                        {this.props.isEdit ? (
                            <React.Fragment>
                                {
                                    getFieldDecorator('auto_release', {
                                        initialValue: formData.auto_release,
                                        valuePropName: 'checked'
                                    })(
                                        <Switch
                                            checkedChildren={Intl.get('common.enabled', '启用')}
                                            unCheckedChildren={Intl.get('common.not.enabled', '未启用')}
                                        />
                                    )
                                }
                            </React.Fragment>
                        ) : (
                            <span className="customer-info-text">{statusText}</span>
                        )}
                    </FormItem>
                </div>
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

CustomerPoolReleaseRuleForm.defaultProps = {
    isEdit: false,
    showBtn: true,
    curRule: {},
    visibleTeamList: [],
    formType: FORM_TYPE.ADD,
    isDefaultRuleConfig: function() {},
    handleCancel: function() {},
    handleEdit: function() {},
    handleDelete: function() {},
    handleSubmit: function() {},
    height: RULE_FORM_HEIGHT,
    //是否使用滚动条，默认不使用
    isUseGeminiScrollbar: false,
};
CustomerPoolReleaseRuleForm.propTypes = {
    isEdit: PropTypes.bool,
    showBtn: PropTypes.bool,
    key: PropTypes.string,
    curRule: PropTypes.object,
    form: PropTypes.object,
    visibleTeamList: PropTypes.array,
    formType: PropTypes.string,
    isDefaultRuleConfig: PropTypes.func,
    handleCancel: PropTypes.func,
    handleEdit: PropTypes.func,
    handleDelete: PropTypes.func,
    handleSubmit: PropTypes.func,
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    isUseGeminiScrollbar: PropTypes.bool,
};
export default Form.create()(CustomerPoolReleaseRuleForm);