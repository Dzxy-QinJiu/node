/**
 * Created by hzl on 2019/12/18.
 * 添加产品 - 选择产品并配置以及设置角色权限
 */
import { Form, Icon, Alert, Checkbox, Input, Button } from 'antd';
const CheckboxGroup = Checkbox.Group;
import { Carousel, CarouselItem } from 'react-bootstrap';
import OperationSteps from '../operation-steps';
import OperationStepsFooter from '../operation-steps-footer';
import {USER_TYPE_VALUE_MAP} from 'PUB_DIR/sources/utils/consts';
import DateSelectorUtils from '../../date-selector/utils';
import GeminiScrollBar from '../../react-gemini-scrollbar';
import AppConfigSetting from '../app-config-setting';
// import ApplyUserAppConfig from '../../apply-user-app-config';
import AppConfigForm from '../../apply-user-app-config/app-config-form';
import DefaultUserLogoTitle from '../../default-user-logo-title';
import UserAppConfig from '../../../modules/app_user_manage/public/views/v3/AppPropertySetting';
// 开通时间，默认为半个月
const defaultSelectedTime = DateSelectorUtils.getHalfAMonthTime();

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
        }
        this.state = {
            appPropSettingsMap,
            step: 0, // //当前处在第一步 ， 用来控制上一步，下一步  Carousel使用
            stepDirection: 'next', // 一步还是下一步，Carousel使用
            selectedApps: [], //选中的应用列表的数组
            isShowAppSelector: true, //  默认在选择应用面板,
            selectedAppIds: [], // 选择应用id
            formData: {
                //正式、试用
                user_type: USER_TYPE_VALUE_MAP.TRIAL_USER,
                start_time: DateSelectorUtils.getMilliseconds(defaultSelectedTime.start_time), //开始时间
                end_time: DateSelectorUtils.getMilliseconds(defaultSelectedTime.end_time), //结束时间
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
        const appPropSettingsMap = this.state && this.state.appPropSettingsMap || {};
        //最终生成的数据
        const finalResult = {};
        //根据默认属性生成配置(添加用户，添加应用)
        const createPropertySettingByDefaultSettings = () => {
            _.each(selectedApps , (currentApp) => {
                //当前应用的id
                const appId = currentApp.app_id;
                let key = this.getAppSettingKey(currentApp.app_id, currentApp.user_id);
                //当前应用的设置
                const originAppSetting = appPropSettingsMap[key] || {};
                //检查角色、权限
                function checkRolePermission() {
                    if(!originAppSetting.roles) {
                        originAppSetting.roles = [];
                    }
                    if(!originAppSetting.permissions) {
                        originAppSetting.permissions = [];
                    }
                    //角色、权限，赋值，不会出现在全局设置里，直接设置
                    if(defaultSettings.roles && _.isArray(defaultSettings.roles)) {
                        originAppSetting.roles = defaultSettings.roles;
                    }
                    if(defaultSettings.permissions && _.isArray(defaultSettings.permissions)) {
                        originAppSetting.permissions = defaultSettings.permissions;
                    }
                }
                //检查单个属性，如果没有重新设置值，用defaultSettings里的值，重新生成
                function checkSingleProp(prop) {
                    if(!originAppSetting[prop]) {
                        originAppSetting[prop] = {
                            setted: false
                        };
                    }
                    if(!originAppSetting[prop].setted) {
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
                    if(!originAppSetting.time) {
                        originAppSetting.time = {
                            setted: false
                        };
                    }
                    if(!originAppSetting.time.setted) {
                        originAppSetting.time.start_time = defaultSettings.time.start_time;
                        originAppSetting.time.end_time = defaultSettings.time.end_time;
                        originAppSetting.time.range = defaultSettings.time.range;
                    }
                }
                //检查用户类型
                checkSingleProp('user_type');
                //检查到期停用
                checkSingleProp('over_draft');
                //检查二步验证
                checkSingleProp('is_two_factor');
                //检查用户状态（启用、停用）
                checkSingleProp('status');
                //检查多人登录
                checkSingleProp('multilogin');
                // 判断当前选择的应用，是否有多终端类型
                if ( !_.isEmpty(currentApp.terminals)) {
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
        let newAppsSetting = _.get(this.state, 'appsSetting');
        _.each(newAppsSetting, (value, appId) => {
            value.roles = _.get(appsSetting[appId], 'roles', []);
            value.rolesInfo = _.get(appsSetting[appId], 'rolesInfo', []);
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
        const selectedApps = selectedAppIds.map(id => this.props.appList.find(x => x.app_id === id));
        this.setState({
            selectedApps: selectedApps,
            isShowAppSelector: false
        }, () => {
            this.handleSetConfigType(selectedAppIds, selectedApps);
        });
    }

    // 应用搜索框
    handleInputChange = () => {

    }

    renderAppSelector = () => {
        return (
            <div className="app-selector-container">
                <div className="input-container">
                    <Input
                        onChange={this.handleInputChange}
                        placeHolder={Intl.get('user.detail.tip.searchApp', '输入关键字自动搜索')}
                    />
                </div>
                <div className="app-list-container" style={{ height: LAYOUT_CONSTANTS.APP_SELECTOR_HEIGHT }}>
                    <GeminiScrollBar>
                        <CheckboxGroup
                            defaultValue={this.state.selectedAppIds}
                            options={this.props.appList.map(x => ({
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
    }

    // 选择后的产品，再次删除的处理
    handleRemoveApp = (app) => {
        const removeAppId = app.app_id;
        let selectedAppIds = this.state.selectedAppIds;
        selectedAppIds = selectedAppIds.filter(x => x !== removeAppId);
        const appList = this.props.appList;
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
                            // todo defaultAppSettings
                            appsConfigData={this.state.selectedApps.map(x => ({
                                client_id: x.app_id,
                                begin_date: moment(),
                                end_date: moment().add(0.5, 'm'),
                                number: 1,
                                over_draft: 1,
                                range: '0.5m',
                                appStatus: 'true',
                                terminals: x.terminals
                            }))}
                            configType={this.state.configType}
                            changeConfigType={this.changeConfigType}
                            isShowAppStatus={true}
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
        const formData = this.state.formData;
        const height = this.props.height - OperationSteps.height - OperationStepsFooter.height;
        return (
            <div className="app-role-config-container">
                <UserAppConfig
                    defaultSettings={this.state.defaultSettings}
                    selectedApps={this.state.selectedApps}
                    onAppPropertyChange={this.onAppPropertyChange}
                    height={height}
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
                    const { appPropSettingsMap } = this.state;
                    //统一配置时将formData数据同步到appSettingMap中
                    if (this.state.configType === CONFIG_TYPE.UNIFIED_CONFIG) {
                        const { range, end_time, start_time } = this.state.formData;
                        _.each(appPropSettingsMap, item => {
                            item.time = {
                                range,
                                end_time,
                                start_time
                            };
                        });
                    }
                    this.setState({
                        appPropSettingsMap
                    }, () => {
                        //点击下一步时存储应用设置map
                        // UserDetailAddAppActions.saveAppsSetting(this.state.appPropSettingsMap);
                    });
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

    onStepFinish = () => {

    }

    renderIndicator = () => {

    }

    render() {
        return (
            <div className="user-add-app-wrap">
                <Form layout='horizontal'>
                    <div className="add-app-container">
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
                            onStepChange={this.turnStep}
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
    containerTitle: Intl.get('user.user.add', '添加用户'),
    appList: [],
    handleFinish: noop,
};

UserAddApp.propTypes = {
    containerTitle: PropTypes.string,
    appList: PropTypes.array,
    handleFinish: PropTypes.func,
    height: PropTypes.number,
};

export default UserAddApp;