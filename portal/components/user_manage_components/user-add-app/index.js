/**
 * Created by hzl on 2019/12/18.
 * 添加产品 - 选择产品并配置以及设置角色权限
 */
require('./index.less');
import { Form, Icon, Checkbox, Input, Button } from 'antd';
const CheckboxGroup = Checkbox.Group;
import { Carousel, CarouselItem } from 'react-bootstrap';
import OperationSteps from '../operation-steps';
import OperationStepsFooter from '../operation-steps-footer';
import {USER_TYPE_VALUE_MAP} from 'PUB_DIR/sources/utils/consts';
import {getHalfAMonthTime,getMilliseconds,getMillisecondsYesterdayEnd} from 'CMP_DIR/date-selector/utils';
import GeminiScrollBar from '../../react-gemini-scrollbar';
import AppConfigSetting from '../app-config-setting';
// import ApplyUserAppConfig from '../../apply-user-app-config';
import AppConfigForm from '../../apply-user-app-config/app-config-form';
import DefaultUserLogoTitle from '../../default-user-logo-title';
import UserAppConfig from '../../../modules/app_user_manage/public/views/v3/AppPropertySetting';


const CONFIG_TYPE = {
    UNIFIED_CONFIG: 'unified_config',//统一配置
    SEPARATE_CONFIG: 'separate_config'//分别配置
};

//布局常量
const LAYOUT_CONSTANTS = {
    //应用选择组件顶部的高度
    APPS_CHOOSEN_TOPBAR: 106,
    TOP_PADDING: 130,
    APP_SELECTOR_HEIGHT: 180
};

class UserAddApp extends React.Component {
    constructor(props) {
        super(props);
        const appPropSettingsMap = this.createPropertySettingData(props);
        if(!_.isEmpty(appPropSettingsMap)) {
            this.onAppPropertyChange(appPropSettingsMap);
        };
        // 开通时间，默认为半个月
        const defaultSelectedTime = getHalfAMonthTime();
        this.state = {
            appPropSettingsMap,
            currentAppList: props.appList,
            step: 0, // //当前处在第一步 ， 用来控制上一步，下一步  Carousel使用
            stepDirection: 'next', // 一步还是下一步，Carousel使用
            selectedApps: [], //选中的应用列表的数组
            isShowAppSelector: true, //  默认在选择应用面板,
            selectedAppIds: [], // 选择应用id
            defaultSettings: props.defaultSettings,
            formData: {
                //正式、试用
                user_type: USER_TYPE_VALUE_MAP.TRIAL_USER,
                start_time: getMilliseconds(defaultSelectedTime.start_time), //开始时间
                end_time: getMillisecondsYesterdayEnd(getMilliseconds(defaultSelectedTime.end_time)), //结束时间
                range: '0.5m', // 开通周期
                over_draft: '1', // 到期状态，默认是停用
                is_two_factor: '0', // 二步认证
                multilogin: '0' // 多人登录
            },
            configType: CONFIG_TYPE.UNIFIED_CONFIG,// 配置类型, 默认为统一配置
        };
    }

    createPropertySettingData(props) {
        //选中的应用
        const selectedApps = props.selectedApps;
        //默认配置，添加的情况下会传
        const defaultSettings = props.defaultSettings;
        //修改的情况下会传appsSetting
        const appsSetting = props.appsSetting;
        //当前的各个应用的设置
        const appPropSettingsMap = props && props.appPropSettingsMap || {};
        //最终生成的数据
        const finalResult = {};
        const createPropertySettingByDefaultSettings = () => {
            _.each(selectedApps, (currentApp) => {
                //当前应用的id
                const appId = currentApp.app_id;
                //当前应用的设置
                const originAppSetting = appPropSettingsMap[appId] || {};
                //检查角色、权限
                function checkRolePermission() {
                    if (!originAppSetting.roles) {
                        originAppSetting.roles = [];
                    }
                    if (!originAppSetting.permissions) {
                        originAppSetting.permissions = [];
                    }
                    //角色、权限，赋值，不会出现在全局设置里，直接设置
                    if (defaultSettings.roles && _.isArray(defaultSettings.roles)) {
                        originAppSetting.roles = defaultSettings.roles;
                    }
                    if (defaultSettings.permissions && _.isArray(defaultSettings.permissions)) {
                        originAppSetting.permissions = defaultSettings.permissions;
                    }
                }
                // 多终端类型，不会出现在默认配置中，是根据所选应用确定是否包含多终端类型
                if (!_.isEmpty(currentApp.terminals)) {
                    defaultSettings.terminals = currentApp.terminals;
                }
                //检查单个属性，如果没有重新设置值，用defaultSettings里的值，重新生成
                function checkSingleProp(prop) {
                    if (!originAppSetting[prop]) {
                        originAppSetting[prop] = {
                            setted: false
                        };
                    }
                    if (!originAppSetting[prop].setted) {
                        // 若是多终端属性，则用选择当前应用的多终端的值
                        if (prop === 'terminals') {
                            originAppSetting[prop].value = currentApp.terminals;
                        } else {
                            originAppSetting[prop].value = defaultSettings[prop];
                        }
                    }
                }
                //检查时间,时间格式比较特殊
                function checkTime() {
                    if (!originAppSetting.time) {
                        originAppSetting.time = {
                            setted: false
                        };
                    }
                    if (!originAppSetting.time.setted) {
                        originAppSetting.time.start_time = defaultSettings.time.start_time;
                        originAppSetting.time.end_time = defaultSettings.time.end_time;
                        originAppSetting.time.range = defaultSettings.time.range;
                    }
                }
                //检查用户类型
                checkSingleProp('user_type');
                //检查到期停用
                checkSingleProp('over_draft');
                //检查用户状态（启用、停用）
                checkSingleProp('status');
                // 检查多终端类型
                if (!_.isEmpty(currentApp.terminals)) {
                    checkSingleProp('terminals');
                }
                //检查角色、权限
                checkRolePermission();
                //检查时间
                checkTime();
                //添加到map中
                finalResult[appId] = originAppSetting;
            });
        };
        //如果有默认配置，用默认配置
        if(!_.isEmpty(defaultSettings)) {
            createPropertySettingByDefaultSettings();
            return finalResult;
        } else {
            //什么都没有，则什么都没有
            return appPropSettingsMap;
        }
    }

    //当应用的个性设置改变的时候触发
    onAppPropertyChange(appsSetting) {
        let newAppsSetting = _.get(this.state, 'appPropSettingsMap');
        _.each(newAppsSetting, (value, appId) => {
            value.roles = _.get(appsSetting[appId], 'roles', []);
            value.permissions = _.get(appsSetting[appId], 'permissions', []);
        });
    }

    //选中的应用发生变化的时候
    onSelectedAppsChange = (appIds) => {
        this.setState({
            selectedAppIds: appIds
        });
    }

    // 选择应用界面，取消选择的应用
    handleCancelSelectedApp = () => {
        this.setState({
            isShowAppSelector: false,
            selectedAppIds: [],
            selectedApps: []
        });
    }

    // 选择应用界面，点击确认按钮
    handleFinishSelectApp = () => {
        let selectedAppIds = this.state.selectedAppIds;
        //检验通过了，切换到下一步
        const selectedApps = selectedAppIds.map(id => this.state.currentAppList.find(x => x.app_id === id));
        this.setState({
            selectedApps: selectedApps,
            isShowAppSelector: false
        }, () => {
            this.handleSetConfigType(selectedAppIds, selectedApps);
        });
    }
    handleInputChange(event) {
        const keyWords = event.target.value;
        setTimeout(() => {
            this.filterApps(keyWords);
        }, 100);
    }
    // 过滤产品
    filterApps(keyWords) {
        let currentAppList = this.props.appList;
        let matchAppList = _.filter(currentAppList, item => _.includes(item.app_name, keyWords));
        if (matchAppList) {
            this.setState({
                currentAppList: matchAppList
            });
        }
    }

    renderAppSelector = () => {
        return (
            <div className="app-selector-container">
                <div className="input-container">
                    <Input
                        onChange={this.handleInputChange.bind(this)}
                        placeHolder={Intl.get('user.detail.tip.searchApp', '输入关键字自动搜索')}
                    />
                </div>
                <div className="app-list-container" style={{ height: LAYOUT_CONSTANTS.APP_SELECTOR_HEIGHT }}>
                    <GeminiScrollBar>
                        <CheckboxGroup
                            defaultValue={this.state.selectedAppIds}
                            options={this.state.currentAppList.map(x => ({
                                value: x.app_id,
                                label: x.app_name
                            }))}
                            onChange={this.onSelectedAppsChange}
                        />
                    </GeminiScrollBar>
                </div>
                <div className="btn-bar">
                    <Button onClick={this.handleCancelSelectedApp}>{Intl.get('common.cancel', '取消')}</Button>
                    <Button
                        type="primary"
                        disabled={_.isEmpty(this.state.selectedAppIds)}
                        onClick={this.handleFinishSelectApp}
                    >{Intl.get('common.sure', '确定')}</Button>
                </div>
            </div>
        );
    }

    // 根据选中app的ids，设置配置界面
    handleSetConfigType(selectedAppIds, selectedApps) {
        // 若所选应用包括多终端类型，则直接显示分别配置界面
        if (selectedAppIds.length > 1) {
            if (_.find(selectedApps, item => !_.isEmpty(item.terminals))) {
                this.setState({
                    configType: CONFIG_TYPE.SEPARATE_CONFIG
                });
            } else {
                this.setState({
                    configType: CONFIG_TYPE.UNIFIED_CONFIG
                });
            }
        } else {
            this.setState({
                configType: CONFIG_TYPE.UNIFIED_CONFIG
            });
        }
        setTimeout(() => {
            this.setState({
                appPropSettingsMap: this.createPropertySettingData(this.state)
            });
        });
    }

    // 选择后的产品，再次删除的处理
    handleRemoveApp = (app) => {
        const removeAppId = app.app_id;
        let selectedAppIds = this.state.selectedAppIds;
        selectedAppIds = selectedAppIds.filter(x => x !== removeAppId);
        const appList = this.state.currentAppList;
        const selectedApps = selectedAppIds.map(id => appList.find(x => x.app_id === id));
        this.setState({
            selectedAppIds: selectedAppIds,
            selectedApps: selectedApps
        }, () => {
            this.handleSetConfigType(selectedAppIds, selectedApps);
        });
    }

    showAppSelector = () => {
        this.setState({
            isShowAppSelector: true
        });
    }

    changeConfigType = (configType) => {
        this.setState({
            configType: configType
        });
    }

    handleFormItemEdit(field, app, appFormData, e) {
        let value = null;
        //处理多终端
        if (field === 'terminals') {
            let checkedValue = e;
            let terminals = [];
            if (!_.isEmpty(checkedValue)) {
                _.each(checkedValue, checked => {
                    if (checked) {
                        let selectedTerminals = _.find(app.terminals, item => item.name === checked);
                        terminals.push(selectedTerminals);
                    }
                });
                value = terminals;
            } else {
                value = [];
            }
        } else {
            if (e.target.type === 'checkbox') {
                value = e.target.checked ? '1' : '0';
            } else {
                value = e.target.value;
            }
        }

        if (this.state.configType === CONFIG_TYPE.UNIFIED_CONFIG) {
            const appPropSettingsMap = this.state.appPropSettingsMap;
            _.each(appPropSettingsMap, item => {
                const formData = item || {};
                formData[field].value = value;
            });
            this.setState({ appPropSettingsMap });
        } else {
            const appPropSettingsMap = this.state.appPropSettingsMap;
            const formData = appPropSettingsMap[appFormData.client_id] || {};
            formData[field].value = value;
            this.setState({ appPropSettingsMap });
        }
    }

    handleSelectDate( field, appFormData, start_time, end_time, range,) {
        if (this.state.configType === CONFIG_TYPE.UNIFIED_CONFIG) {
            const appPropSettingsMap = this.state.appPropSettingsMap;
            _.each(appPropSettingsMap, item => {
                const formData = item || {};
                formData[field] = {
                    start_time: start_time,
                    end_time: end_time,
                    range: range
                };
            });
            this.setState({ appPropSettingsMap });
        } else {
            const appPropSettingsMap = this.state.appPropSettingsMap;
            const formData = appPropSettingsMap[appFormData.client_id] || {};
            formData[field] = {
                start_time: start_time,
                end_time: end_time,
                range: range
            };
            this.setState({ appPropSettingsMap });
        }
    }

    getAppConfigSetting() {
        return _.map(this.state.selectedApps, app => {
            let matchedApp = this.state.appPropSettingsMap[app.app_id];
            let configInfo = {
                begin_date: _.get(matchedApp, 'time.start_time' || moment()),
                client_id: app.app_id,
                end_date: _.get(matchedApp, 'time.end_time' || moment().add(0.5, 'm')),
                range: _.get(matchedApp, 'time.range' || '0.5m'),
                number: 1,
                over_draft: +_.get(matchedApp, 'over_draft.value' || 1),
                user_type: _.get(matchedApp, 'user_type.value', USER_TYPE_VALUE_MAP.TRIAL_USER),
                status: _.get(matchedApp, 'status.value', 'true')
            };
            if (!_.isEmpty(app.terminals)) {
                configInfo.terminals = _.get(matchedApp, 'terminals.value', app.terminals);
            }
            return configInfo;
        });
    }
    
    renderAppConfig = () => {
        return (
            <div style={{ height: this.props.height - LAYOUT_CONSTANTS.TOP_PADDING}}>
                <GeminiScrollBar>
                    <div className="app-config-container">
                        <div className="selected-app-container">
                            <ul>
                                {
                                    this.state.selectedApps.map(app => (
                                        <li key={app.app_id}>
                                            <div className="title-container">
                                                <span className="logo-container" title={app.app_name}>
                                                    <DefaultUserLogoTitle
                                                        nickName={app.app_name}
                                                        userLogo={app.app_logo}
                                                    />
                                                </span>
                                                <p title={app.app_name}>{app.app_name}</p>
                                                <span className="icon-bar">
                                                    <Icon onClick={this.handleRemoveApp.bind(this, app)} type="close" />
                                                </span>
                                            </div>
                                        </li>
                                    ))
                                }
                            </ul>
                            <p className="btn-text" onClick={this.showAppSelector}>
                                {Intl.get('common.add.product','添加产品')}
                            </p>
                        </div>
                        <AppConfigSetting
                            selectedApp={this.state.selectedApps.map(x => ({
                                client_name: x.app_name,
                                client_logo: x.app_logo,
                                ...x
                            }))}
                            appsConfigData={this.getAppConfigSetting()}
                            configType={this.state.configType}
                            changeConfigType={this.changeConfigType}
                            isShowAppStatus={true}
                            onOverDraftChange={this.handleFormItemEdit.bind(this, 'over_draft')}
                            onChangeUserType={this.handleFormItemEdit.bind(this, 'user_type')}
                            onAppStatusChange={this.handleFormItemEdit.bind(this, 'status')}
                            onCheckTwoFactor={this.handleFormItemEdit.bind(this, 'is_two_factor')}
                            onSelectDate={this.handleSelectDate.bind(this, 'time')}
                            onCheckMultiLogin={this.handleFormItemEdit.bind(this, 'multilogin')}
                            onSelectTerminalChange={this.handleFormItemEdit.bind(this, 'terminals')}
                        />
                    </div>
                </GeminiScrollBar>
            </div>
        );
    }

    // 渲染“选择应用”步骤
    renderAppsCarousel = () => {
        return (
            <div className="select-apps-carousel-wrap">
                <div className="left-nav-container">{Intl.get('user.user.product.select','选择产品')}：</div>
                <div className="add-app-content">
                    {
                        this.state.isShowAppSelector ?
                            this.renderAppSelector() : this.renderAppConfig()
                    }
                </div>
            </div>
        );
    }

    // 渲染应用角色步骤
    renderRolesCarousel = () => {
        return (
            <div className="app-role-config-container">
                <UserAppConfig
                    defaultSettings={this.state.defaultSettings}
                    selectedApps={this.state.selectedApps}
                    onAppPropertyChange={this.onAppPropertyChange.bind(this)}
                    height={this.props.height}
                    hideSingleApp={true}
                />
            </div>
        );
    }

    turnStep(direction) {
        //获取到当前是第几步
        let step = _.get(this.state, 'step', 0);
        if (direction === 'next') {
            if (step === 0) {
                //第一部“选择应用”检查选中应用个数
                if (_.isEmpty(this.state.selectedApps)) {
                    return;
                } else {
                    this.clickTurnStep(direction);
                }
            } else {
                this.clickTurnStep(direction);
            }
        } else {
            this.clickTurnStep(direction);
        }
    }

    //上一步、下一步
    clickTurnStep = (direction) => {
        let step = this.state.step;
        if (direction === 'next') {
            step += 1;
        } else {
            step -= 1;
        }
        this.setState({
            stepDirection: direction,
            step: step
        });
    }

    getSubmitData() {
        //选中的应用列表
        const selectedApps = this.state.selectedApps;
        //各个应用的配置
        const products = [];
        //遍历应用列表，添加应用配置
        _.each(selectedApps, (appInfo) => {
            const customAppSetting = {};
            //应用id
            const app_id = appInfo.app_id;
            //存下来的配置对象
            const savedAppSetting = this.state.appPropSettingsMap[app_id];
            //应用id
            customAppSetting.client_id = app_id;
            // 角色，注意：角色不是空时，才传角色字段
            if (!_.isEmpty(savedAppSetting.roles)) {
                customAppSetting.roles = savedAppSetting.roles;
            }

            // 角色名称
            // customAppSetting.rolesInfo = savedAppSetting.rolesInfo;
            //权限，注意：权限不是空时，才传权限字段
            if (!_.isEmpty(savedAppSetting.permissions)) {
                customAppSetting.permissions = savedAppSetting.permissions;
            }

            //开通状态
            customAppSetting.status = +savedAppSetting.status.value;
            //到期停用
            customAppSetting.over_draft = +savedAppSetting.over_draft.value;
            //开始时间
            customAppSetting.begin_date = savedAppSetting.time.start_time;
            //结束时间
            customAppSetting.end_date = savedAppSetting.time.end_time;
            // 多终端类型
            let terminals = _.get(savedAppSetting.terminals, 'value');
            if (!_.isEmpty(terminals)) {
                customAppSetting.terminals = _.map(terminals, 'id');
            }
            //正式、试用（后端要求：类型使用tags字段）
            customAppSetting.tags = savedAppSetting.user_type.value;

            //添加到列表中
            products.push(customAppSetting);
        });
        return products;
    }

    onStepFinish = () => {
    //获取提交数据
        const productionData = this.getSubmitData();
        var userList = this.props.initialUser;
        var userIds = userList.map( (obj) => {
            return obj.user.user_id;
        });
        // 要提交的数据
        let submitData = [];
        _.each(productionData, product => {
            _.each(userIds, item => {
                let newObj = _.cloneDeep(product);
                newObj.user_id = item;
                submitData.push(newObj);
            });
        });
        this.props.handleSubmitData(submitData);
    }

    renderIndicator = () => {

    }

    render() {
        return (
            <div className="user-add-app-wrap" style={{height: this.props.height}}>
                <Form layout='horizontal' style={{height: this.props.height}}>
                    <div className="add-app-container" style={{height: this.props.height}}>
                        <OperationSteps
                            title={this.props.containerTitle}
                            current={this.state.step}
                        >
                            <OperationSteps.Step
                                action={<span className={this.state.step === 0 ? 'active' : ''}>
                                    {Intl.get( 'user.detail.addProduct.selectAndConfig', '选择产品并配置')}
                                    <span className="icon-ellipsis">....</span>
                                </span>
                                }
                            >
                            </OperationSteps.Step>
                            <OperationSteps.Step
                                action={<span className={this.state.step === 1 ? 'active' : ''}>
                                    {Intl.get('user.detail.addApp.setRolePermissions', '设置角色权限')}
                                </span>
                                }
                            >
                            </OperationSteps.Step>
                        </OperationSteps>
                        <Carousel
                            interval={0}
                            indicators={false}
                            controls={false}
                            activeIndex={this.state.step}
                            direction={this.state.stepDirection}
                            slide={false}
                        >
                            <CarouselItem>
                                {this.renderAppsCarousel()}
                            </CarouselItem>
                            <CarouselItem>
                                {this.renderRolesCarousel()}
                            </CarouselItem>
                        </Carousel>
                        <OperationStepsFooter
                            currentStep={this.state.step}
                            totalStep={2}
                            onStepChange={this.turnStep.bind(this)}
                            onFinish={this.onStepFinish}
                        >
                            {this.renderIndicator()}
                        </OperationStepsFooter>
                    </div>
                </Form>
            </div>
        );
    }
}

function noop() {}

UserAddApp.defaultProps = {
    containerTitle: '',
    appList: [],
    handleSubmitData: noop,
    defaultSettings: {
        user_type: USER_TYPE_VALUE_MAP.TRIAL_USER, // 用户类型
        time: {
            start_time: getMilliseconds(getHalfAMonthTime().start_time),
            //结束时间
            end_time: getMillisecondsYesterdayEnd(getMilliseconds(getHalfAMonthTime().end_time)),
            //开通周期
            range: '0.5m',
        },
        over_draft: '1', // 到期状态，默认是停用
        status: '1', // 开通状态
        is_two_factor: '0', // 二步认证
        multilogin: '0' // 多人登录
    },
    appsSetting: {},
};

UserAddApp.propTypes = {
    containerTitle: PropTypes.string,
    appList: PropTypes.array,
    handleSubmitData: PropTypes.func,
    height: PropTypes.number,
    defaultSettings: PropTypes.Object,
    appsSetting: PropTypes.Object,
    initialUser: PropTypes.Object,
};

export default UserAddApp;