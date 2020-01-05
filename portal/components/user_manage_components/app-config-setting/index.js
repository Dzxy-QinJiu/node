/**
 * Created by hzl on 2019/12/19.
 */
require('./index.less');
import SquareLogoTag from '../../square-logo-tag';
import DateSelector from '../../date-selector';
import {Tabs, Col, Form, Radio, InputNumber, Checkbox} from 'antd';
const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
const FormItem = Form.Item;
import {USER_TYPE_VALUE_MAP, USER_TYPE_TEXT_MAP, CONFIG_TYPE} from 'PUB_DIR/sources/utils/consts';

class AppConfigSetting extends React.Component {
    constructor(props) {
        super(props);
    }

    changeConfigType(activeKey) {
        if (_.isFunction(this.props.changeConfigType)) {
            this.props.changeConfigType(activeKey);
        }
    }

    renderConfigTabs(apps, appsConfigData) {
        // 判断所选产品中，是否包含多终端信息，要是包含的话，则不展示统一配置信息
        let isHideUnifiedConfig = _.find(apps, item => !_.isEmpty(item.terminals));
        return (
            <div className="app-config-tab-container">
                <Tabs type="card" activeKey={this.props.configType} onChange={this.changeConfigType.bind(this)}>
                    {
                        isHideUnifiedConfig ? null : (
                            <TabPane
                                tab={Intl.get('crm.apply.user.unified.config', '统一配置')}
                                key={CONFIG_TYPE.UNIFIED_CONFIG}>
                                {this.renderAppConfigForm(apps[0], appsConfigData[0])}
                            </TabPane>
                        )
                    }
                    <TabPane
                        tab={
                            isHideUnifiedConfig ?
                                Intl.get('menu.config', '配置') :
                                Intl.get('crm.apply.user.separate.config', '分别配置')
                        }
                        key={CONFIG_TYPE.SEPARATE_CONFIG}
                    >
                        {_.map(apps, app => {
                            let formData = _.find(appsConfigData, data => data.client_id === app.app_id);
                            return (
                                <div className="app-config-item">
                                    <div className="app-config-title">
                                        <SquareLogoTag
                                            name={app ? app.client_name : ''}
                                            logo={app ? app.client_logo : ''}
                                        />
                                    </div>
                                    {this.renderAppConfigForm(app, formData)}
                                </div>);
                        })}
                    </TabPane>
                </Tabs>
            </div>);
    }

    renderAppConfigForm(app, appsConfigData) {
        const formItemLayout = {
            colon: false,
            labelCol: {span: 5},
            wrapperCol: {span: 19},
        };
        let isShowTerminals = !_.isEmpty(app.terminals);
        let terminalsOptions = _.map(app.terminals, 'name');
        let checkedTerminals = [];
        if (!_.isEmpty(appsConfigData.terminals)) {
            checkedTerminals = _.map(appsConfigData.terminals, 'name');
        }
        return (
            <div className="app-config-content">
                {
                    this.props.isShowUserType ? (
                        <FormItem
                            {...formItemLayout}
                            label={Intl.get('oplate.user.analysis.user.type', '用户类型')}
                            className="user-type-radio-form-item"
                        >
                            <Radio.Group
                                value={appsConfigData.user_type}
                                onChange={this.props.onChangeUserType.bind(this, app,appsConfigData)}>
                                {_.map(USER_TYPE_VALUE_MAP, (value, key) => {
                                    return (<Radio.Button value={value}>{USER_TYPE_TEXT_MAP[key]}</Radio.Button>);
                                })
                                }
                            </Radio.Group>
                        </FormItem>
                    ) : null
                }
                {
                    this.props.isShowAppNumber ? (
                        <FormItem
                            {...formItemLayout}
                            label={Intl.get('user.batch.open.count', '开通个数')}
                        >
                            <InputNumber
                                prefixCls={appsConfigData.onlyOneUserTip ? 'number-error-border ant-input-number' : 'ant-input-number'}
                                value={appsConfigData.number}
                                min={1}
                                max={999}
                                onChange={this.props.onCountChange.bind(this, app,appsConfigData)}/>
                        </FormItem>
                    ) : null
                }
                {
                    this.props.isShowSelectedTime ? (
                        <FormItem
                            {...formItemLayout}
                            label={Intl.get('user.open.cycle', '开通周期')}
                        >
                            <DateSelector
                                disableDateBeforeRange={true}
                                disableDateBeforeToday={true}
                                endTimeEndOfDay={false}
                                getEndTimeTip={ (date) => {return Intl.get('user.open.cycle.date.tip','将在{date}的23:59:59过期',{'date': date});}}
                                onSelect={this.props.onSelectDate.bind(this, appsConfigData)}
                                range={appsConfigData.range}
                                start_time={appsConfigData.begin_date}
                                end_time={appsConfigData.end_date}
                                expiredRecalculate={true}
                            >
                                <DateSelector.Option value="1w">{Intl.get('user.time.one.week','1周')}</DateSelector.Option>
                                <DateSelector.Option value="0.5m">{Intl.get('user.time.half.month','半个月')}</DateSelector.Option>
                                <DateSelector.Option value="1m">{Intl.get('user.time.one.month','1个月')}</DateSelector.Option>
                                <DateSelector.Option value="6m">{Intl.get('user.time.six.month','6个月')}</DateSelector.Option>
                                <DateSelector.Option value="12m">{Intl.get('user.time.twelve.month','12个月')}</DateSelector.Option>
                                <DateSelector.Option value="forever">{Intl.get('common.time.forever','永久')}</DateSelector.Option>
                                <DateSelector.Option value="custom">{Intl.get('user.time.custom','自定义')}</DateSelector.Option>
                            </DateSelector>
                        </FormItem>
                    ) : null
                }
                {
                    this.props.isShowExpiredSelect ? (
                        <FormItem
                            {...formItemLayout}
                            label={Intl.get('user.expire.select', '到期可选')}
                        >
                            <RadioGroup
                                onChange={this.props.onOverDraftChange.bind(this, app,appsConfigData)}
                                value={appsConfigData.over_draft ? appsConfigData.over_draft.toString() : '0'}>
                                <Radio key="1" value="1">{Intl.get('user.status.stop', '停用')}</Radio>
                                <Radio key="2" value="2">{Intl.get('user.status.degrade', '降级')}</Radio>
                                <Radio key="0" value="0">{Intl.get('user.status.immutability', '不变')}</Radio>
                            </RadioGroup>
                        </FormItem>
                    ) : null
                }
                {
                    this.props.isShowAppStatus ? (
                        <FormItem
                            {...formItemLayout}
                            label={Intl.get('common.app.status', '开通状态')}
                        >
                            <RadioGroup
                                onChange={this.props.onAppStatusChange.bind(this, app,appsConfigData)}
                                value={appsConfigData.status}
                            >
                                <Radio key="1" value="1">{Intl.get('common.app.status.open', '开启')}</Radio>
                                <Radio key="0" value="0">{Intl.get('common.app.status.close', '关闭')}</Radio>
                            </RadioGroup>
                        </FormItem>
                    ) : null
                }
                {
                    this.props.isShowOther ? (
                        <FormItem
                            {...formItemLayout}
                            label={Intl.get('crm.186', '其他')}
                        >
                            <Checkbox
                                onChange={this.props.onCheckTwoFactor.bind(this, app, appsConfigData)}
                                checked={appsConfigData.is_two_factor === '1'}
                            >
                                {Intl.get('user.two.step.certification', '二步认证')}
                            </Checkbox>
                            <Checkbox
                                onChange={this.props.onCheckMultiLogin.bind(this, app, appsConfigData)}
                                checked={appsConfigData.multilogin === '1'}
                            >
                                {Intl.get('user.multi.login', '多人登录')}
                            </Checkbox>
                        </FormItem>) : null
                }
                {
                    isShowTerminals ? (
                        <FormItem
                            {...formItemLayout}
                            label={Intl.get('common.terminals.type', '终端类型')}
                        >
                            <CheckboxGroup
                                options={terminalsOptions}
                                onChange={this.props.onSelectTerminalChange.bind(this, app, appsConfigData)}
                                value={checkedTerminals}
                            />
                        </FormItem>
                    ) : null
                }
            </div>
        );
    }

    render() {
        let apps = this.props.selectedApp || [];
        let appsConfigData = this.props.appsConfigData || [];
        return (
            <div className="apply-app-user-config">
                <Col span={20} className="app-config-wrap">
                    {apps.length === 1 ? this.renderAppConfigForm(apps[0], appsConfigData[0]) :
                        apps.length > 1 ? this.renderConfigTabs(apps, appsConfigData) : null}
                </Col>
            </div>);
    }
}

function noop() {

}

AppConfigSetting.defaultProps = {
    selectedApp: [],//选择的需要配置的应用列表
    appsConfigData: {},//应用配置的form数据列表
    configType: CONFIG_TYPE.UNIFIED_CONFIG, //配置类型，unified_config：统一配置，separate_config：分别配置
    //配置类型修改事件
    changeConfigType: noop,
    onChangeUserType: noop,
    onCountChange: noop,
    onSelectDate: noop,
    onOverDraftChange: noop,
    onAppStatusChange: noop,
    onCheckTwoFactor: noop,
    onCheckMultiLogin: noop,
    onSelectTerminalChange: noop,
    isShowUserType: true, // 是否显示用户类型，默认显示
    isShowAppNumber: false, // 是否显示产品数量，默认不显示
    isShowSelectedTime: true, // 是否显示开通时间，默认显示
    isShowExpiredSelect: true, // 是否显示到期可选，默认显示
    isShowAppStatus: false, // 是否显示产品的开通状态，默认不显示
    isShowOther: false, // 是否显示其他配置（多人登入，二步认证）， 默认不显示
};

AppConfigSetting.propTypes = {
    selectedApp: PropTypes.array,
    appsConfigData: PropTypes.object,
    configType: PropTypes.string,
    changeConfigType: PropTypes.func,
    isShowUserType: PropTypes.boolean,
    isShowAppNumber: PropTypes.boolean,
    isShowSelectedTime: PropTypes.boolean,
    isShowExpiredSelect: PropTypes.boolean,
    isShowAppStatus: PropTypes.boolean,
    isShowOther: PropTypes.boolean,
    onChangeUserType: PropTypes.func,
    onCountChange: PropTypes.func,
    onSelectDate: PropTypes.func,
    onOverDraftChange: PropTypes.func,
    onAppStatusChange: PropTypes.func,
    onCheckTwoFactor: PropTypes.func,
    onCheckMultiLogin: PropTypes.func,
    onSelectTerminalChange: PropTypes.func,
};

export default AppConfigSetting;