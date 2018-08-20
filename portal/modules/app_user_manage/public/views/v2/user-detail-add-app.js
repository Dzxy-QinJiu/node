const Validation = require('rc-form-validation');
const Validator = Validation.Validator;
/**
 * Oplate.hideSomeItem 用来判断西语的运行环境
 * */
import {RightPanelClose,RightPanelReturn} from '../../../../../components/rightPanel';
import {Form,Icon,Alert} from 'antd';
import Spinner from '../../../../../components/spinner';
import AlertTimer from '../../../../../components/alert-timer';
import {Carousel,CarouselItem} from 'react-bootstrap';
import FieldMixin from '../../../../../components/antd-form-fieldmixin';

import UserDetailAddAppActions from '../../action/v2/user-detail-add-app-actions';
import AppUserDetailAction from '../../action/app-user-detail-actions';
import AppUserPanelSwitchAction from '../../action/app-user-panelswitch-actions';
import AppUserAction from '../../action/app-user-actions';
import AppUserUtil from '../../util/app-user-util';

import UserDetailAddAppStore from '../../store/v2/user-detail-add-app-store';
import OperationSteps from '../../../../../components/user_manage_components/operation-steps';
import OperationStepsFooter from '../../../../../components/user_manage_components/operation-steps-footer';
import OperationScrollBar from '../../../../../components/user_manage_components/operation-scrollbar';
import SearchIconList from '../../../../../components/search-icon-list';

import AppPropertySetting from '../../../../../components/user_manage_components/app-property-setting';
import UserTypeRadioField from '../../../../../components/user_manage_components/user-type-radiofield';
import UserTimeRangeField from '../../../../../components/user_manage_components/user-time-rangefield';
import UserOverDraftField from '../../../../../components/user_manage_components/user-over-draftfield';
import UserTwoFactorField from '../../../../../components/user_manage_components/user-two-factorfield';
import UserMultiLoginField from '../../../../../components/user_manage_components/user-multilogin-radiofield';
import insertStyle from '../../../../../components/insert-style';
import UserData from '../../../../../public/sources/user-data';

//动态添加的样式
var dynamicStyle;
//布局常量
const LAYOUT_CONSTANTS = {
    //应用选择组件顶部的高度
    APPS_CHOOSEN_TOPBAR: 106
};

const UserDetailAddApp = React.createClass({
    //mixin
    mixins: [
        FieldMixin,
        UserTypeRadioField,
        UserTimeRangeField,
        UserOverDraftField,
        UserTwoFactorField,
        UserMultiLoginField
    ],
    getInitialState() {
        return UserDetailAddAppStore.getState();
    },
    onStateChange() {
        this.setState(UserDetailAddAppStore.getState());
    },
    componentDidMount() {
        UserDetailAddAppStore.listen(this.onStateChange);
        UserDetailAddAppActions.getCurrentRealmApps();
        $(window).on('resize' , this.onStateChange);
    },
    componentWillUnmount() {
        UserDetailAddAppStore.unlisten(this.onStateChange);
        dynamicStyle && dynamicStyle.destroy();
        dynamicStyle = null;
    },
    //取消添加单个应用
    cancel() {
        UserDetailAddAppActions.resetState();
        AppUserPanelSwitchAction.resetState();
        //面板向右滑
        AppUserUtil.emitter.emit(AppUserUtil.EMITTER_CONSTANTS.PANEL_SWITCH_RIGHT);
    },
    //关闭右侧面板
    closeRightPanel() {
        AppUserDetailAction.dismiss();
        AppUserPanelSwitchAction.resetState();
        //面板向右滑
        AppUserUtil.emitter.emit(AppUserUtil.EMITTER_CONSTANTS.PANEL_SWITCH_RIGHT);
        AppUserAction.closeRightPanel();
        UserDetailAddAppActions.resetState();
    },
    //选中的应用发生变化的时候
    onSelectedAppsChange(apps) {
        UserDetailAddAppActions.setSelectedApps(apps);
        //当只有一个应用的时候，需要把特殊设置的应用属性隐藏掉，
        // 这个时候，要把第三步的应用属性同步到通用配置属性上
        if(apps.length === 1) {
            //渲染是异步的，加setTimeout能够获取到最新的配置信息
            setTimeout(() => {
                //将应用的特殊设置同步到全局设置
                UserDetailAddAppActions.syncCustomAppSettingToGlobalSetting();
            });
        }
    },
    //渲染“选择应用”步骤
    renderAppsCarousel() {

        const isSubmitError = this.state.isSelectedAppsError;
        const appsListError = this.state.currentRealmAppsResult === 'error';
        const appsListLoading = this.state.currentRealmAppsResult === 'loading';

        if(appsListLoading) {
            return (
                <div className="user-manage-v2-load8">
                    <Spinner />
                </div>
            );
        }
        if(appsListError) {
            return (
                <Alert type="error" showIcon message={<span>
                    <ReactIntl.FormattedMessage
                        id="user.app.list.error.tip"
                        defaultMessage={'应用列表获取失败，{retry}'}
                        values={{
                            'retry': <a href="javascript:void(0)" onClick={UserDetailAddAppActions.getCurrentRealmApps}><ReactIntl.FormattedMessage id="common.get.again" defaultMessage="重新获取" /></a>}}
                    />
                </span>}/>
            );
        }
        //高度限制，让页面出现滚动条
        var height = $(window).height() -
            OperationSteps.height -
            OperationStepsFooter.height -
            LAYOUT_CONSTANTS.APPS_CHOOSEN_TOPBAR;
        dynamicStyle = insertStyle(`.user-detail-add-app-v2 .search-icon-list-content{max-height:${height}px;overflow-y:auto;overflow-x:hidden;`);
        return (
            <div>
                <SearchIconList
                    totalList={this.state.currentRealmApps}
                    onItemsChange={this.onSelectedAppsChange}
                />
                {
                    isSubmitError ? (
                        <div className="has-error">
                            <div className="ant-form-explain"><ReactIntl.FormattedMessage id="user.app.select.tip" defaultMessage="至少选择一个应用" /></div>
                        </div>
                    ) : null
                }
            </div>
        );
    },
    //渲染“开通信息”步骤
    renderBasicCarousel() {
        return (
            <OperationScrollBar className="basic-data-form-wrap">
                <div className="basic-data-form">
                    { !Oplate.hideSomeItem && <div className="form-item">
                        <div className="form-item-label"><ReactIntl.FormattedMessage id="common.type" defaultMessage="类型" /></div>
                        <div className="form-item-content">
                            {this.renderUserTypeRadioBlock()}
                        </div>
                    </div> }
                    <div className="form-item">
                        <div className="form-item-label"><ReactIntl.FormattedMessage id="user.open.cycle" defaultMessage="开通周期" /></div>
                        <div className="form-item-content">
                            {this.renderUserTimeRangeBlock()}
                        </div>
                    </div>
                    <div className="form-item">
                        <div className="form-item-label"><ReactIntl.FormattedMessage id="user.expire.select" defaultMessage="到期可选" /></div>
                        <div className="form-item-content">
                            {this.renderUserOverDraftBlock()}
                        </div>
                    </div>
                    { !Oplate.hideSomeItem && <div className="form-item">
                        <div className="form-item-label"><ReactIntl.FormattedMessage id="user.two.step.certification" defaultMessage="二步认证" /></div>
                        <div className="form-item-content">
                            {this.renderUserTwoFactorBlock()}
                        </div>
                    </div> }
                    { !Oplate.hideSomeItem && <div className="form-item">
                        <div className="form-item-label"><ReactIntl.FormattedMessage id="user.multi.login" defaultMessage="多人登录" /></div>
                        <div className="form-item-content">
                            {this.renderMultiLoginRadioBlock()}
                        </div>
                    </div> }
                </div>
            </OperationScrollBar>
        );
    },
    //渲染“应用设置”步骤
    renderRolesCarousel() {
        const formData = this.state.formData;
        const defaultSettings = {
            user_type: formData.user_type,
            over_draft: formData.over_draft,
            is_two_factor: formData.is_two_factor,
            multilogin: formData.multilogin,
            time: {
                start_time: formData.start_time,
                end_time: formData.end_time,
                range: formData.range
            }
        };
        const height = $(window).height() - OperationSteps.height - OperationStepsFooter.height;
        return (
            <AppPropertySetting
                defaultSettings={defaultSettings}
                selectedApps={this.state.selectedApps}
                onAppPropertyChange={this.onAppPropertyChange}
                height={height}
                hideSingleApp={true}
            />
        );
    },
    //当应用的个性设置改变的时候触发
    onAppPropertyChange(appsSetting) {
        UserDetailAddAppActions.saveAppsSetting(appsSetting);
    },
    //渲染loading，错误，成功提示
    renderIndicator() {
        if(this.state.submitResult === 'loading') {
            return (
                <Icon type="loading" />
            );
        }
        var hide = function() {
            UserDetailAddAppActions.hideSubmitTip();
        };
        if(this.state.submitResult === 'success') {
            return (
                <AlertTimer time={3000} message={Intl.get('user.app.add.success', '添加应用成功')} type="success" showIcon onHide={hide}/>
            );
        }
        if(this.state.submitResult === 'error') {
            return (
                <AlertTimer time={3000} message={this.state.submitErrorMsg} type="error" showIcon onHide={hide}/>
            );
        }
        // 添加应用时，没有选择角色的错误提示
        if(this.state.submitResult === 'selectRoleError') {
            return (
                <div className="apps-no-select-role">
                    <AlertTimer time={6000} message={this.state.submitErrorMsg} type="error" showIcon onHide={hide}/>
                </div>
            );
        }
        return null;
    },
    turnStep(direction) {
        if(this.state.submitResult === 'loading' || this.state.submitResult === 'success') {
            return;
        }
        //获取到当前是第几步
        let step = this.state.step;
        if(direction === 'next') {
            if(step === 0) {
                //第一部“选择应用”检查选中应用个数
                if(!this.state.selectedApps.length) {
                    UserDetailAddAppActions.showSelectedAppsError();
                    return;
                } else {
                    //检验通过了，切换到下一步
                    UserDetailAddAppActions.turnStep(direction);
                    Trace.traceEvent('用户详情','添加应用-点击了下一步的按钮');
                }
            } else {
                UserDetailAddAppActions.turnStep(direction);
                Trace.traceEvent('用户详情','添加应用-点击了下一步的按钮');
            }
        } else {
            //上一步直接切换
            UserDetailAddAppActions.turnStep(direction);
            Trace.traceEvent('用户详情','添加应用-点击了上一步的按钮');
        }
    },
    //获取提交的数据
    getSubmitData() {
        //formData
        const formData = this.state.formData;
        //用户类型
        let user_type = formData.user_type;
        if (Oplate.hideSomeItem) {
            user_type = '正式用户';
        }
        //开通状态（开通）
        const status = '1';
        //选中的应用列表
        const selectedApps = this.state.selectedApps;
        //各个应用的配置
        const products = [];
        //遍历应用列表，添加应用配置
        _.each(selectedApps , (appInfo) => {
            const customAppSetting = {};
            //应用id
            const app_id = appInfo.app_id;
            //存下来的配置对象
            const savedAppSetting = this.state.appsSetting[app_id];
            //应用id
            customAppSetting.client_id = app_id;
            //角色
            customAppSetting.roles = savedAppSetting.roles;
            //权限
            customAppSetting.permissions = savedAppSetting.permissions;
            //开通状态
            customAppSetting.status = status;
            //到期停用
            customAppSetting.over_draft = savedAppSetting.over_draft.value;
            //开始时间
            customAppSetting.begin_date = savedAppSetting.time.start_time;
            //结束时间
            customAppSetting.end_date = savedAppSetting.time.end_time;
            //两步验证
            customAppSetting.is_two_factor = savedAppSetting.is_two_factor.value;
            //多人登录
            customAppSetting.mutilogin = savedAppSetting.multilogin.value;
            //正式、试用
            customAppSetting.user_type = user_type;
            //设置user_id
            customAppSetting.user_id = this.props.initialUser.user.user_id;
            //添加到列表中
            products.push(customAppSetting);
        });
        return products;
    },
    //完成
    onStepFinish() {
        if(this.state.submitResult === 'loading' || this.state.submitResult === 'success') {
            return;
        }
        //获取提交数据
        const submitData = this.getSubmitData();
        //选中的应用列表
        const selectedApps = this.state.selectedApps;
        let noSelectRoleApps = AppUserUtil.handleNoSelectRole(submitData, selectedApps);
        if (noSelectRoleApps.length) {
            UserDetailAddAppActions.someAppsNoSelectRoleError(Intl.get('user.add.apps.role.select.tip', '{appName}未设置角色', {appName: noSelectRoleApps.join('、') }));
            return;
        } else {
            UserDetailAddAppActions.noSelectRoleError('');
        }
        //添加应用
        UserDetailAddAppActions.addUserApps(submitData,(apps) => {
            if(apps && _.isArray(apps)) {
                //添加一个应用之后，更新应用列表
                AppUserUtil.emitter.emit(AppUserUtil.EMITTER_CONSTANTS.UPDATE_ADD_APP_INFO , {
                    user_id: this.props.initialUser.user.user_id,
                    app_info_array: apps
                });
            }

            //面板向右滑
            AppUserUtil.emitter.emit(AppUserUtil.EMITTER_CONSTANTS.PANEL_SWITCH_RIGHT);
            //添加应用成功后，返回详情页面
            AppUserPanelSwitchAction.resetState();
            setTimeout(() => {
                UserDetailAddAppActions.resetState();
            });
        });
    },
    //render函数
    render() {
        return (
            <div className="user-manage-v2 user-detail-add-app-v2" data-tracename="用户详情">
                <RightPanelReturn onClick={this.cancel} data-tracename ='点击返回按钮'/>
                <RightPanelClose onClick={this.closeRightPanel} data-tracename ='点击关闭添加应用按钮'/>
                <Form horizontal>
                    <Validation ref="validation" onValidate={this.handleValidate}>
                        <OperationSteps
                            title={Intl.get('user.user.add', '添加用户')}
                            current={this.state.step}
                        >
                            <OperationSteps.Step action={Intl.get('user.user.app.select', '选择应用')}></OperationSteps.Step>
                            <OperationSteps.Step action={Intl.get('user.user.info', '开通信息')}></OperationSteps.Step>
                            <OperationSteps.Step action={Intl.get('user.user.app.set', '应用设置')}></OperationSteps.Step>
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
                                <div className="user-detail-add-app-v2-apps apps-carousel">
                                    {this.renderAppsCarousel()}
                                </div>
                            </CarouselItem>
                            <CarouselItem>
                                {this.renderBasicCarousel()}
                            </CarouselItem>
                            <CarouselItem>
                                {this.renderRolesCarousel()}
                            </CarouselItem>
                        </Carousel>
                        <OperationStepsFooter
                            currentStep={this.state.step}
                            totalStep={3}
                            onStepChange={this.turnStep}
                            onFinish={this.onStepFinish}
                        >
                            <span className="operator_person">{Intl.get('user.operator','操作人')}:{this.state.operator}</span>
                            {this.renderIndicator()}
                        </OperationStepsFooter>
                    </Validation>
                </Form>
            </div>
        );
    }
});

export default UserDetailAddApp;
