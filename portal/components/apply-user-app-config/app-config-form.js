/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/5/31.
 */
require('./css/app-config-from.less');
import {USER_TYPE_VALUE_MAP, USER_TYPE_TEXT_MAP} from 'PUB_DIR/sources/utils/consts';
import {Form, Radio, InputNumber, Checkbox} from 'antd';
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
const FormItem = Form.Item;
class AppConfigForm extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let appFormData = this.props.appFormData;
        const timePickerConfig = this.props.timePickerConfig;
        const formItemLayout = {
            colon: false,
            labelCol: {span: 5},
            wrapperCol: {span: 19},
        };
        let terminalsOptions = _.map(this.props.selectedApp.terminals, 'name');
        let checkedTerminals = [];
        if (!_.isEmpty(appFormData.terminals)) {
            checkedTerminals = _.map(appFormData.terminals, 'name');
        }
        return (
            <div className="app-config-content">
                {this.props.needUserType ? (
                    <FormItem
                        {...formItemLayout}
                        label={Intl.get('oplate.user.analysis.user.type', '用户类型')}
                        className="user-type-radio-form-item"
                    >
                        <Radio.Group value={appFormData.user_type}
                            onChange={this.props.onChangeUserType.bind(this, appFormData)}>
                            {_.map(USER_TYPE_VALUE_MAP, (value, key) => {
                                return (<Radio.Button value={value}>{USER_TYPE_TEXT_MAP[key]}</Radio.Button>);
                            })
                            }
                        </Radio.Group>
                    </FormItem>) : null}
                {this.props.needApplyNum ? (<div>
                    <FormItem
                        {...formItemLayout}
                        label={Intl.get('user.batch.open.count', '开通个数')}
                    >
                        <InputNumber
                            prefixCls={appFormData.onlyOneUserTip ? 'number-error-border ant-input-number' : 'ant-input-number'}
                            value={appFormData.number}
                            min={1}
                            max={999}
                            onChange={this.props.onCountChange.bind(this, appFormData)}/>
                    </FormItem>
                    {appFormData.onlyOneUserTip ?
                        <div className="only-one-user-tip">
                            {Intl.get('crm.201', '用户名是邮箱格式时，只能申请1个用户')}</div> : null}
                </div>) : null}
                <FormItem
                    {...formItemLayout}
                    label={this.props.needEndTimeOnly ? Intl.get('user.time.end', '到期时间') : Intl.get('user.open.cycle', '开通周期')}
                >
                    {this.props.renderUserTimeRangeBlock(timePickerConfig, appFormData)}
                </FormItem>
                {this.props.hideExpiredSelect ? null : <FormItem
                    {...formItemLayout}
                    label={Intl.get('user.expire.select', '到期可选')}
                >
                    <RadioGroup onChange={this.props.onOverDraftChange.bind(this, appFormData)}
                        value={appFormData.over_draft ? appFormData.over_draft.toString() : '0'}>
                        <Radio key="1" value="1"><ReactIntl.FormattedMessage
                            id="user.status.stop" defaultMessage="停用"/></Radio>
                        <Radio key="2" value="2"><ReactIntl.FormattedMessage
                            id="user.status.degrade" defaultMessage="降级"/></Radio>
                        <Radio key="0" value="0"><ReactIntl.FormattedMessage
                            id="user.status.immutability"
                            defaultMessage="不变"/></Radio>
                    </RadioGroup>
                </FormItem>}
                {this.props.needTwoFactorMultiLogin ? (
                    <FormItem
                        {...formItemLayout}
                        label={Intl.get('crm.186', '其他')}
                    >
                        <Checkbox
                            onChange={this.props.onCheckTwoFactor.bind(this, appFormData)}
                            checked={appFormData.is_two_factor === '1'}
                        >
                            {Intl.get('user.two.step.certification', '二步认证')}
                        </Checkbox>
                        <Checkbox
                            onChange={this.props.onCheckMultiLogin.bind(this, appFormData)}
                            checked={appFormData.multilogin === '1'}
                        >
                            {Intl.get('user.multi.login', '多人登录')}
                        </Checkbox>
                    </FormItem>) : null}
                {
                    this.props.isShowTerminals ? (
                        <FormItem
                            {...formItemLayout}
                            label={Intl.get('common.terminals.type', '终端类型')}
                            className="app-terminals-item"
                        >
                            <CheckboxGroup
                                options={terminalsOptions}
                                onChange={this.props.onSelectTerminalChange.bind(this, this.props.selectedApp, appFormData, )}
                                value={checkedTerminals}
                            />
                        </FormItem>
                    ) : null
                }
            </div>
        );
    }
}
AppConfigForm.propTypes = {
    appFormData: PropTypes.object,//应用配置表单数据
    needUserType: PropTypes.bool,//是否需要用户类型表单项
    onChangeUserType: PropTypes.func,//用户类型修改事件
    timePickerConfig: PropTypes.object,//开通周期的配置项
    renderUserTimeRangeBlock: PropTypes.func,//渲染开通周期的方法
    needApplyNum: PropTypes.bool,//是否需要用户个数表单项
    onCountChange: PropTypes.func,//用户个数修改事件
    onOverDraftChange: PropTypes.func,//到期可选的修改事件
    needTwoFactorMultiLogin: PropTypes.bool,//是否需要二步认证与多人登录的配置项
    onCheckTwoFactor: PropTypes.func,//二步认证修改事件
    onCheckMultiLogin: PropTypes.func,//多人登录修改事件
    needEndTimeOnly: PropTypes.bool, //是否只传结束时间
    hideExpiredSelect: PropTypes.bool, //是否展示到期可选
    isShowTerminals: PropTypes.bool, //是否显示终端类型
    onSelectTerminalChange: PropTypes.func,
    selectedApp: PropTypes.array, // 选择的应用列表
};
AppConfigForm.defaultProps = {
    appFormData: {
        user_type: '试用用户',//用户类型，试用用户：试用，正式用户：签约， special：赠送，training：培训，internal：员工
        number: 1,//开通个数
        onlyOneUserTip: false,//是否展示只允许申请一个用户（邮箱格式）的提示
        over_draft: '0',//到期可选, ‘0’：不变，‘1’：停用，‘2’：降级
        multilogin: false, //是否允许多人登录
        is_two_factor: false,//是否是二步认证
    },//应用配置表单数据
    needUserType: false,//是否需要用户类型表单项
    needEndTimeOnly: false, //是否只传结束时间
    hideExpiredSelect: false, //是否展示到期可选
    onChangeUserType: function() {
    },//用户类型修改事件
    timePickerConfig: {},//开通周期的配置项
    renderUserTimeRangeBlock: function() {
    },//渲染开通周期的方法
    needApplyNum: false,//是否需要用户个数表单项
    onCountChange: function() {
    },//用户个数修改事件
    onOverDraftChange: function() {
    },//到期可选的修改事件
    needTwoFactorMultiLogin: false,//是否需要二步认证与多人登录的配置项
    onCheckTwoFactor: function() {
    },//二步认证修改事件
    onCheckMultiLogin: function() {
    },//多人登录修改事件
    isShowTerminals: false, // 默认不显示
    onSelectTerminalChange: function() {
    },// 多终端选择
    selectedApp: [], // 默认为空
};
export default AppConfigForm;