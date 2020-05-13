var createReactClass = require('create-react-class');
const Validation = require('rc-form-validation-for-react16');
const Validator = Validation.Validator;
/**
 * 创建用户
 */
//右侧面板样式，上一步、下一步，滑动布局等
var language = require('../../../../../public/language/getLanguage');
if (language.lan() === 'es' || language.lan() === 'en') {
    require('../../../../../components/user_manage_components/css/right-panel-es_VE.less');
    // 表单样式，表单项高度，输入框宽度等
    require('../../../../../components/user_manage_components/css/form-basic-es_VE.less');
} else if (language.lan() === 'zh') {
    require('../../../../../components/user_manage_components/css/right-panel-zh_CN.less');
    // 表单样式，表单项高度，输入框宽度等
    require('../../../../../components/user_manage_components/css/form-basic-zh_CN.less');
}

import {Carousel, CarouselItem} from 'react-bootstrap';
import {RightPanelClose} from '../../../../../components/rightPanel';
import AppUserFormStore from '../../store/v2/app-user-form-store';
import AppUserActions from '../../action/app-user-actions';
import AppUserFormActions from '../../action/v2/app-user-form-actions';
import OperationStepsFooter from '../../../../../components/user_manage_components/operation-steps-footer';
import OperationSteps from '../../../../../components/user_manage_components/operation-steps';
import AppUserUtil from '../../util/app-user-util';
import {Form, Icon, Input, Alert} from 'antd';
const FormItem = Form.Item;
import FieldMixin from '../../../../../components/antd-form-fieldmixin';
import OperationScrollBar from '../../../../../components/user_manage_components/operation-scrollbar';
import UserCountNumberField from '../../../../../components/user_manage_components/user-count-numberfield';
import UserTypeRadioField from '../../../../../components/user_manage_components/user-type-radiofield';
import UserTimeRangeField from '../../../../../components/user_manage_components/user-time-rangefield';
import UserOverDraftField from '../../../../../components/user_manage_components/user-over-draftfield';
import UserTwoFactorField from '../../../../../components/user_manage_components/user-two-factorfield';
import UserMultiLoginField from '../../../../../components/user_manage_components/user-multilogin-radiofield';
import UserDescriptionField from '../../../../../components/user_manage_components/user-description-field';
import UserCustomerSuggestField from '../../../../../components/user_manage_components/user-customer-suggestfield';
import UserExistsAjax from '../../../../../components/user_manage_components/user-name-textfield/ajax';
import SearchIconList from '../../../../../components/search-icon-list';
import AppPropertySetting from '../../../../../components/user_manage_components/app-property-setting';
import AlertTimer from '../../../../../components/alert-timer';
import insertStyle from '../../../../../components/insert-style';
import classNames from 'classnames';
import Organization from './organization';
import autosize from 'autosize';
import UserNameTextFieldUtil from 'CMP_DIR/user_manage_components/user-name-textfield/util';
import AppUserAjax from '../../ajax/app-user-ajax';
import AppUserStore from '../../store/app-user-store';
import SelectFullWidth from 'CMP_DIR/select-fullwidth';
import { userDetailEmitter, noSelectedAppTerminalEmitter } from 'PUB_DIR/sources/utils/emitters';

require('../../css/add-user.less');
//动态添加的样式
var dynamicStyle;
var tempSuggestNames = [];
//布局常量
const LAYOUT_CONSTANTS = {
    //应用选择组件顶部的高度
    APPS_CHOOSEN_TOPBAR: 106
};

const AddOrEditUser = createReactClass({
    displayName: 'AddOrEditUser',

    mixins: [FieldMixin,
        UserCountNumberField,
        UserTypeRadioField,
        UserTimeRangeField,
        UserOverDraftField,
        UserTwoFactorField,
        UserMultiLoginField,
        UserDescriptionField,
        UserCustomerSuggestField
    ],

    getInitialState() {
        let realmList = AppUserStore.getState().realmList;
        let selectRealmName = '', selectRealmId = '';
        if (realmList.length) {
            selectRealmName = realmList[0].realm_name;
            selectRealmId = realmList[0].realm_id;
        }
        return {
            suggestNames: '', // 建议用户名
            sugNamesErrorMsg: '', // 建议用户名出错的信息
            selectRealmId: selectRealmId, // 选择的安全域的id
            selectRealmName: selectRealmName, // 选择的安全域的名称
            userId: '', // 用户id
            ...AppUserFormStore.getState()
        };
    },

    onStoreChange() {
        this.setState(AppUserFormStore.getState());
    },

    componentDidMount() {
        AppUserFormStore.listen(this.onStoreChange);
        $(window).on('resize', this.onStoreChange);
        // 没有选择应用的多终端信息
        noSelectedAppTerminalEmitter.on(noSelectedAppTerminalEmitter.NO_SELECTED_APP_TERMINAL, this.getNoSelectedAppTerminals);
        AppUserFormActions.getCurrentRealmApps();
        var $textarea = $(this.refs.descriptionBlock).find('textarea');
        autosize($textarea[0]);
    },

    componentWillUnmount() {
        AppUserFormStore.unlisten(this.onStoreChange);
        $(window).off('resize', this.onStoreChange);
        noSelectedAppTerminalEmitter.removeListener(noSelectedAppTerminalEmitter.NO_SELECTED_APP_TERMINAL, this.getNoSelectedAppTerminals);
        dynamicStyle && dynamicStyle.destroy();
        dynamicStyle = null;
        tempSuggestNames = [];
    },

    getNoSelectedAppTerminals(flag = false) {
        setTimeout( () => {
            this.setState({
                disabled: flag
            });
        } );
    },

    //是否只能添加一个用户的判断
    isAddOnlyOneUser(){
        let formData = this.state.formData;
        //用户名为邮箱格式时，只能添加一个用户
        return formData.user_name.indexOf('@') !== -1 && +formData.count_number > 1;
    },

    // 添加一个用户时，是否渲染建议用户名
    renderAddOneUserIsTips(direction) {
        const formData = this.state.formData;

        let obj = {
            user_name: formData.user_name,
            customer_id: formData.customer_id
        };
        AppUserAjax.addOneUserSuggestName(obj).then((result) => {
            // 保存建议的用户名
            tempSuggestNames = _.clone(result);
            if (_.isArray(result)) {
                if (result.length === 1 && result[0] === formData.user_name) { // 建议用户名和添加用户名一致时，则点击下一步时通过
                    AppUserFormActions.turnStep(direction);
                } else { // 否则，则不通过
                    this.setState({
                        suggestNames: result
                    });
                }
            }

        }, (errMsg) => { // 建议用户名接口，出错的情况
            this.setState({
                sugNamesErrorMsg: errMsg
            });
        });
    },

    checkBasicInfoValidator(direction){
        const formData = this.state.formData;
        var validation = this.refs.validation;
        //首先检查表单
        validation.validate((valid) => {
            let hasError = false;
            let onlyOneUser = formData.user_name.indexOf('@') !== -1 && +formData.count_number > 1;
            if (!valid || this.isAddOnlyOneUser()) {
                hasError = true;
            }
            // 检查开通时间
            if (formData.start_time < moment().startOf('day').valueOf()) {
                AppUserFormActions.showOpenTimeErrorTips(true);
                hasError = true;
            }
            //检查用户属于
            if (this.state.formData.user_type === AppUserUtil.USER_TYPE_VALUE_MAP.SIGN_USER) {
                //如果客户输入框有值，但是没有选中的客户，提示客户问题
                if (this.getCustomerInputValue() && !formData.customer_id) {
                    AppUserFormActions.showCustomerError();
                    hasError = true;
                }
            }
            if (hasError) {
                return;
            }

            // 选择了建议的用户名，则不用再次发送请求
            if (tempSuggestNames.length && _.indexOf(tempSuggestNames, formData.user_name) !== -1) {
                //检验通过了，切换到下一步
                AppUserFormActions.turnStep(direction);
            } else if (+formData.count_number === 1) { // 申请一个用户名时，提示用户名
                if (formData.customer_id) { // 存在customer_id，才提示用户名
                    this.renderAddOneUserIsTips(direction);
                } else { // customer_id为空时，根据添加的用户名查询用户信息，看是否存在
                    UserExistsAjax.userExists(formData.user_name).then((userInfo) => { // 存在重复的用户名
                        if (userInfo && userInfo.user_id) {
                            this.setState({
                                userId: userInfo.user_id
                            });
                        } else {
                            //检验通过了，切换到下一步
                            AppUserFormActions.turnStep(direction);
                            Trace.traceEvent('已有用户-添加用户','点击了下一步的按钮');
                        }
                    }, () => {
                        AppUserFormActions.turnStep(direction);
                        Trace.traceEvent('已有用户-添加用户','点击了下一步的按钮');
                    });
                }
            } else { // 添加多个用户时
                //检验通过了，切换到下一步
                AppUserFormActions.turnStep(direction);
                Trace.traceEvent('已有用户-添加用户','点击了下一步的按钮');
            }
        });
    },

    turnStep(direction) {
        if (this.state.submitResult === 'loading' || this.state.submitResult === 'success') {
            return;
        }
        let step = this.state.step;
        const formData = this.state.formData;
        //点击下一步的时候进行检查
        if (direction === 'next') {
            //检查基本信息，检验通过再进行下一步
            if (step === 0) {
                this.checkBasicInfoValidator(direction);
            } else if (step === 1) {
                //检查是否至少选择了一个应用
                if (!this.state.selectedApps.length) {
                    //没选择应用，显示提示
                    AppUserFormActions.showSelectedAppsError();
                    return;
                } else {
                    //检验通过了，切换到下一步
                    AppUserFormActions.turnStep(direction);
                    Trace.traceEvent('已有用户-添加用户','点击了下一步的按钮');
                }
            } else if (step === 2) {
                //检验通过了，切换到下一步
                AppUserFormActions.turnStep(direction);
                Trace.traceEvent('已有用户-添加用户','点击了下一步的按钮');
            }
        } else {
            //上一步的时候直接切换
            AppUserFormActions.turnStep(direction);
            Trace.traceEvent('已有用户-添加用户','点击了上一步的按钮');
        }
    },

    //获取批量更新使用的额外数据
    getExtraData() {
        var extra = {};
        //添加客户id
        extra.customer_name = this.state.formData.customer_name || '';
        //添加销售id
        extra.sales_id = this.state.formData.sales.id || '';
        //添加销售名称
        extra.sales_name = this.state.formData.sales.name || '';
        //返回额外数据
        return extra;
    },

    //获取提交的数据
    getSubmitData() {
        //要提交的数据
        const result = {};
        //formData
        const formData = this.state.formData;
        //用户名
        result.user_name = _.trim(formData.user_name);
        // 按添加的用户，生成用户名
        result.force = _.trim(formData.user_name);
        //个数
        result.number = formData.count_number + '';
        //客户
        result.customer = formData.customer_id || '';
        //备注
        result.description = _.trim(formData.description) || '';
        //组织
        result.group_id = this.state.organization || '';
        if (result.number === '1') {
            var nick_name = _.trim(formData.nick_name);
            if (nick_name) {
                result.nick_name = nick_name;
            }
            var phone = _.trim(formData.phone);
            if (phone) {
                result.phone = phone;
            }
            var email = _.trim(formData.email);
            if (email) {
                result.email = email;
            }
        }
        //用户类型
        const user_type = formData.user_type;
        //开通状态（开通）
        const status = '1';
        //选中的应用列表
        const selectedApps = this.state.selectedApps;
        //各个应用的配置
        result.products = [];
        //遍历应用列表，添加应用配置
        _.each(selectedApps, (appInfo) => {
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
            //开始时间(为了避免，放置超过一晚，直接输入密码，请求时间，还是以前的时间)
            customAppSetting.begin_date = _.max([savedAppSetting.time.start_time, moment().startOf('day').valueOf()]);
            //结束时间
            customAppSetting.end_date = savedAppSetting.time.end_time;
            //两步验证
            customAppSetting.is_two_factor = savedAppSetting.is_two_factor.value;
            //正式、试用
            customAppSetting.user_type = user_type;
            //多人登录
            customAppSetting.mutilogin = savedAppSetting.multilogin.value;
            if (savedAppSetting.terminals) {
                // 应用多终端选择
                customAppSetting.terminals = _.map(savedAppSetting.terminals.value, 'id');
            }
            //添加到列表中
            result.products.push(customAppSetting);
        });
        result.products = JSON.stringify(result.products);
        // 所选择的安全域
        if (this.state.selectRealmId) {
            result.manage_realm = this.state.selectRealmId;
            result.description = this.state.selectRealmName + '的成员';
        }
        return result;
    },

    //完成的时候，调用
    onStepFinish() {
        if (this.state.submitResult === 'loading' || this.state.submitResult === 'success') {
            return;
        }
        //获取提交数据
        const submitData = this.getSubmitData();
        let products = JSON.parse(submitData.products);
        //选中的应用列表
        const selectedApps = this.state.selectedApps;

        //获取批量更新使用的额外数据
        const extraData = this.getExtraData();
        //添加用户
        AppUserFormActions.addAppUser(submitData, extraData, () => {
            //500毫秒的时间，看清楚添加成功的提示
            setTimeout(() => {
                //关闭面板，并重置表单到默认状态
                this.closeAppUserForm();
            }, 500);
        });
    },

    onCustomerChoosen: function(info) {
        AppUserFormActions.customerChoosen(info);
    },

    hideCustomerError: function() {
        AppUserFormActions.hideCustomerError();
    },

    //检查单个字段对应的用户是否存在
    checkRestField: function(field, value) {
        var Deferred = $.Deferred();
        this.restFieldAjaxMap[field] = $.ajax({
            url: '/rest/appuser/exist/' + field + '/' + encodeURIComponent(value),
            dataType: 'json',
            success: function(result) {
                if (result === true) {
                    Deferred.resolve();
                } else {
                    Deferred.reject();
                }
            },
            error: function() {
                Deferred.reject();
            }
        });
        return Deferred.promise();
    },

    //ajax缓存，用于abort
    restFieldAjaxMap: {},

    //timeout,用户clearTimeout
    restFieldTimeoutMap: {},

    //获取验证方法
    getRestFieldValidator: function(field) {
        var _this = this;
        var TEXT_MAP = {
            'phone': Intl.get('user.phone', '手机号'),
            'email': Intl.get('common.email', '邮箱')
        };
        return function(rule, value, callback) {
            clearTimeout(_this.restFieldTimeoutMap[field]);
            var lastAjax = _this.restFieldAjaxMap[field];
            lastAjax && lastAjax.abort();
            var trimValue = _.trim(value);
            if (!trimValue) {
                callback();
                return;
            }
            if (field === 'phone') {
                if (!(/^1[3|4|5|7|8][0-9]\d{8}$/.test(trimValue))) {
                    callback(Intl.get('user.phone.validate.tip', '请输入正确格式的手机号'));
                    return;
                }
            } else if (field === 'email') {
                if (!/^(((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(,((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)*$/i
                    .test(trimValue)) {
                    callback(Intl.get('user.email.validate.tip', '请输入正确格式的邮箱'));
                    return;
                }
            }
            _this.restFieldTimeoutMap[field] = setTimeout(() => {
                _this.checkRestField(field, trimValue).then((userInfo) => {
                    callback(TEXT_MAP[field] + '已存在');
                }, () => {
                    callback();
                });
            }, 1000);
        };
    },

    organizationSelect(organization) {
        AppUserFormActions.setSelectedOrganization(organization);
    },

    // 校验用户名的合法性
    checkUserValid(rule, value, callback){
        var trimValue = _.trim(value);
        // 用户名的不合法时的信息提示
        UserNameTextFieldUtil.validatorMessageTips(trimValue, callback);
    },

    // 选择建议的用户名，选择后，鼠标聚焦到输入框中
    selectSuggestUserName(value) {
        let formData = this.state.formData;
        formData.user_name = value;
        $('#user_name').focus();
        this.setState({formData});
    },

    // 渲染添加用户名的提示信息
    renderAddUserNameTips() {
        let suggestNames = this.state.suggestNames;
        let user_name = this.state.formData && this.state.formData.user_name ? this.state.formData.user_name : '';
        // 建议用户名接口出错的情况
        if (this.state.sugNamesErrorMsg) {
            return (
                <div className="suggest-name-tips">
                    {Intl.get('user.check.fail', '用户名校验出错！')}
                </div>
            );
        } else if (suggestNames) {
            let length = suggestNames.length;
            if (length === 2) {
                return (
                    <div className="suggest-name-tips">
                        <ReactIntl.FormattedMessage
                            id="user.suggest.name.two"
                            defaultMessage={'创建{user01}或{user02}?'}
                            values={{
                                'user01': <a
                                    onClick={this.selectSuggestUserName.bind(this, suggestNames[0])}>{suggestNames[0]}</a>,
                                'user02': <a
                                    onClick={this.selectSuggestUserName.bind(this, suggestNames[1])}>{suggestNames[1]}</a>
                            }}
                        />
                    </div>
                );
            } else if (length === 1) {
                return (
                    <div className="suggest-name-tips">
                        <ReactIntl.FormattedMessage
                            id="user.exist.suggest.name"
                            defaultMessage={'用户名{user}已存在，是否创建{user01}?'}
                            values={{
                                'user': user_name,
                                'user01': <a
                                    onClick={this.selectSuggestUserName.bind(this, suggestNames[0])}>{suggestNames[0]}</a>
                            }}
                        />

                    </div>
                );
            } else {
                return (
                    <div className="suggest-name-tips">
                        {Intl.get('user.exist.name', '用户名{user}已存在，请重新命名', {user: user_name})}
                    </div>
                );
            }
        } else {
            return null;
        }
    },

    handleClickShowUserDetail() {
        //关闭面板，并重置表单到默认状态
        this.closeAppUserForm();
        // 触发用户详情界面
        userDetailEmitter.emit(userDetailEmitter.OPEN_USER_DETAIL,{
            userId: this.state.userId
        });
    },

    // 没有选择客户名，添加用户名重复的提示信息
    renderAddOnerUserDuplicateTips() {
        return (
            <div className="suggest-name-tips">
                <ReactIntl.FormattedMessage
                    id="user.user.exist.check.tip"
                    defaultMessage={'用户名已存在，用户已存在，{check}?'}
                    values={{
                        'check': <a href='javascript:void(0)'
                            onClick={this.handleClickShowUserDetail}
                            className="handle-btn-item"
                        >
                            {Intl.get('user.user.check', '查看该用户')}
                        </a>
                    }}
                />
            </div>
        );
    },

    renameUser(){
        this.setState({
            suggestNames: '',
            sugNamesErrorMsg: '',
            userId: ''
        });
    },

    //渲染基本信息
    renderBasicCarousel() {
        const status = this.state.status;
        const formData = this.state.formData;
        var customerLabelClass = classNames({
            'form-item-label': true,
            required_label: this.state.user_type === AppUserUtil.USER_TYPE_VALUE_MAP.SIGN_USER
        });
        return (
            <OperationScrollBar className="basic-data-form-wrap">
                <div className="basic-data-form">                    
                    <div className="form-item">
                        <div className="form-item-label required_label"><ReactIntl.FormattedMessage id="common.username"
                            defaultMessage="用户名"/>
                        </div>
                        <div className="form-item-content user-name-textfield-block">
                            <FormItem
                                label=""
                                labelCol={{span: 0}}
                                wrapperCol={{span: 24}}
                                validateStatus={this.renderValidateStyle('user_name')}
                                help={status.user_name.isValidating ? Intl.get('common.is.validiting', '正在校验中..') : (status.user_name.errors && status.user_name.errors.join(','))}
                            >
                                <Validator rules={{validator: this.checkUserValid}} trigger='onBlur' ref="userNameValidator">
                                    <Input name="user_name"
                                        id="user_name"
                                        placeholder={Intl.get('user.username.write.tip', '请填写用户名')}
                                        value={formData.user_name}
                                        onChange={this.setField.bind(this, 'user_name')}
                                        onFocus={this.renameUser}
                                    />
                                </Validator>
                                {this.state.userId ? this.renderAddOnerUserDuplicateTips() : this.renderAddUserNameTips()}
                            </FormItem>
                        </div>
                    </div>
                    <div className="form-item">
                        <div className="form-item-label"><ReactIntl.FormattedMessage id="common.app.count"
                            defaultMessage="数量"/></div>
                        <div
                            className={this.isAddOnlyOneUser() ? 'form-item-content only-one-user-border' : 'form-item-content'}>
                            {this.renderUserCountNumberField()}
                            {this.isAddOnlyOneUser() ? <div className="only-one-user-tip">

                                <ReactIntl.FormattedMessage id="user.add.only.one" defaultMessage="用户名是邮箱格式时，只能添加1个用户"/>
                            </div> : null}
                        </div>
                    </div>
                    {
                        +formData.count_number === 1 ? (
                            <div>
                                <div className="form-item">
                                    <div className="form-item-label required_label"><ReactIntl.FormattedMessage
                                        id="common.nickname" defaultMessage="昵称"/></div>
                                    <div className="form-item-content input-item user-nickname-textfield-block">
                                        <FormItem
                                            label=""
                                            labelCol={{span: 0}}
                                            wrapperCol={{span: 24}}
                                            validateStatus={this.renderValidateStyle('nick_name')}
                                            help={status.nick_name.isValidating ? Intl.get('common.is.validiting', '正在校验中..') : (status.nick_name.errors && status.nick_name.errors.join(','))}
                                        >
                                            <Validator rules={[{
                                                required: true,
                                                message: Intl.get('user.nickname.write.tip', '请填写昵称')
                                            }]} trigger='onBlur'>
                                                <Input name="nick_name"
                                                    placeholder={Intl.get('user.nickname.write.tip', '请填写昵称')}
                                                    value={formData.nick_name}
                                                    onChange={this.setField.bind(this, 'nick_name')}/>
                                            </Validator>
                                        </FormItem>
                                    </div>
                                </div>
                                <div className="form-item">
                                    <div className="form-item-label"><ReactIntl.FormattedMessage id="user.phone"
                                        defaultMessage="手机号"/>
                                    </div>
                                    <div className="form-item-content input-item user-phone-textfield-block">
                                        <FormItem
                                            label=""
                                            labelCol={{span: 0}}
                                            wrapperCol={{span: 24}}
                                            validateStatus={this.renderValidateStyle('phone')}
                                            help={status.phone.isValidating ? Intl.get('common.is.validiting', '正在校验中..') : (status.phone.errors && status.phone.errors.join(','))}
                                        >
                                            <Validator rules={[{validator: this.getRestFieldValidator('phone')}]} trigger='onBlur'>
                                                <Input name="phone"
                                                    placeholder={Intl.get('user.phone.write.tip', '请填写手机号')}
                                                    value={formData.phone}
                                                    onChange={this.setField.bind(this, 'phone')}/>
                                            </Validator>
                                        </FormItem>
                                    </div>
                                </div>
                                <div className="form-item">
                                    <div className="form-item-label"><ReactIntl.FormattedMessage id="common.email"
                                        defaultMessage="邮箱"/>
                                    </div>
                                    <div className="form-item-content input-item user-email-textfield-block">
                                        <FormItem
                                            label=""
                                            labelCol={{span: 0}}
                                            wrapperCol={{span: 24}}
                                            validateStatus={this.renderValidateStyle('email')}
                                            help={status.email.isValidating ? Intl.get('common.is.validiting', '正在校验中..') : (status.email.errors && status.email.errors.join(','))}
                                        >
                                            <Validator rules={[{validator: this.getRestFieldValidator('email')}]} trigger='onBlur'>
                                                <Input name="email"
                                                    placeholder={Intl.get('user.email.write.tip', '请填写邮箱')}
                                                    value={formData.email}
                                                    onChange={this.setField.bind(this, 'email')}/>
                                            </Validator>
                                        </FormItem>
                                    </div>
                                </div>
                            </div>
                        ) : null
                    }
                    {/**委内维拉项目,不显示所属客户*/}
                    {Oplate.hideSomeItem ? null : (
                        <div className="form-item">
                            <div className={customerLabelClass}><ReactIntl.FormattedMessage id="common.belong.customer"
                                defaultMessage="所属客户"/>
                            </div>
                            <div className="form-item-content">
                                {this.renderUserCustomerSuggestBlock()}
                            </div>
                        </div>
                    )}

                    {
                        this.state.formData.sales_team.id ?
                            (
                                <div className="form-item form-item-text">
                                    <div className="form-item-label"><ReactIntl.FormattedMessage id="user.sales.team"
                                        defaultMessage="销售团队"/>
                                    </div>
                                    <div className="form-item-content">
                                        {this.state.formData.sales_team.name}
                                    </div>
                                </div>
                            ) : null
                    }
                    {
                        this.state.formData.sales.id ?
                            (
                                <div className="form-item form-item-text">
                                    <div className="form-item-label"><ReactIntl.FormattedMessage id="user.salesman"
                                        defaultMessage="销售人员"/>
                                    </div>
                                    <div className="form-item-content">
                                        {this.state.formData.sales.name}
                                    </div>
                                </div>
                            ) : null
                    }
                    <div className="form-item">
                        <div className="form-item-label"><ReactIntl.FormattedMessage id="user.organization"
                            defaultMessage="组织"/></div>
                        <div className="form-item-content">
                            <Organization
                                onChange={this.organizationSelect}
                            />
                        </div>
                    </div>
                    {/**委内维拉项目,不显示类型*/}
                    {Oplate.hideSomeItem ? null : (
                        <div className="form-item">
                            <div className="form-item-label"><ReactIntl.FormattedMessage id="common.type"
                                defaultMessage="类型"/></div>
                            <div className="form-item-content">
                                {this.renderUserTypeRadioBlock()}
                            </div>
                        </div>
                    )}
                    <div className="form-item">
                        <div className="form-item-label"><ReactIntl.FormattedMessage id="user.open.cycle"
                            defaultMessage="开通周期"/></div>
                        <div className="form-item-content">
                            {this.renderUserTimeRangeBlock()}
                        </div>
                    </div>
                    <div className="form-item">
                        <div className="form-item-label"><ReactIntl.FormattedMessage id="user.expire.select"
                            defaultMessage="到期可选"/></div>
                        <div className="form-item-content">
                            {this.renderUserOverDraftBlock()}
                        </div>
                    </div>
                    {
                        !Oplate.hideSomeItem && <div className="form-item">
                            <div className="form-item-label">{Intl.get('crm.186', '其他')}</div>
                            <div className="form-item-content other-config-content">
                                {this.renderMultiLoginRadioBlock({showCheckbox: true})}
                                {this.renderUserTwoFactorBlock({showCheckbox: true})}
                            </div>
                        </div>
                    }
                    <div className="form-item" ref="descriptionBlock">
                        <div className="form-item-label"><ReactIntl.FormattedMessage id="common.remark"
                            defaultMessage="备注"/></div>
                        <div className="form-item-content user-description-textarea-block">
                            {this.renderUserDescriptionBlock()}
                        </div>
                    </div>
                </div>
            </OperationScrollBar>
        );
    },

    onAppsChange(apps) {
        AppUserFormActions.setSelectedApps(apps);
        // 获取所选应用的默认配置信息
        AppUserFormActions.getSelectedAppsDefault(apps);
        //当只有一个应用的时候，并且这个应用没有多终端类型时，需要把特殊设置的应用属性隐藏掉，
        // 这个时候，要把第三步的应用属性同步到通用配置属性上
        if (apps.length === 1 && _.isEmpty(apps[0].terminals)) {
            //渲染是异步的，加setTimeout能够获取到最新的配置信息
            setTimeout(() => {
                //将应用的特殊设置同步到全局设置
                AppUserFormActions.syncCustomAppSettingToGlobalSetting();
            });
        }
    },

    //渲染选择应用
    renderAppsCarousel() {
        const isSubmitError = this.state.isSelectedAppsError;
        const appsListError = this.state.currentRealmAppsResult === 'error';
        const appsListLoading = this.state.currentRealmAppsResult === 'loading';
        //高度限制，让页面出现滚动条
        var height = $(window).height() -
            OperationSteps.height -
            OperationStepsFooter.height -
            LAYOUT_CONSTANTS.APPS_CHOOSEN_TOPBAR;
        dynamicStyle && dynamicStyle.destroy();
        dynamicStyle = insertStyle(`.user-manage-adduser .search-icon-list-content{max-height:${height}px;overflow-y:auto;overflow-x:hidden;`);
        return (
            <div className="apps-carousel">
                {
                    appsListLoading ? (
                        <Icon type="loading"/>
                    ) : (
                        appsListError ? (
                            <Alert type="error" showIcon
                                message={<span>
                                    <ReactIntl.FormattedMessage
                                        id="user.app.list.error.tip"
                                        defaultMessage={'应用列表获取失败，{retry}'}
                                        values={{
                                            'retry': <a href="javascript:void(0)"
                                                onClick={AppUserFormActions.getCurrentRealmApps}><ReactIntl.FormattedMessage
                                                    id="common.get.again" defaultMessage="重新获取"/></a>
                                        }}
                                    />
                                </span>}/>
                        ) : (
                            <SearchIconList
                                totalList={this.state.currentRealmApps}
                                onItemsChange={this.onAppsChange}
                                notFoundContent={Intl.get('user.no.related.product','无相关产品')}
                            />
                        )
                    )
                }
                {
                    isSubmitError ? (
                        <div className="has-error">
                            <div className="ant-form-explain"><ReactIntl.FormattedMessage id="user.product.select.tip"
                                defaultMessage="至少选择一个产品"/>
                            </div>
                        </div>
                    ) : null
                }
            </div>
        );
    },

    onAppPropertyChange(appsSetting) {
        AppUserFormActions.saveAppsSetting(appsSetting);
    },

    //渲染应用设置
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
                appsDefaultSetting={this.state.appsDefaultSetting}
                defaultSettings={defaultSettings}
                selectedApps={this.state.selectedApps}
                onAppPropertyChange={this.onAppPropertyChange}
                height={height}
                hideSingleApp={true}
            />
        );
    },

    closeAppUserForm() {
        AppUserActions.closeRightPanel();
        AppUserFormActions.resetState();
    },

    hideOpenTimeErrorTips() {
        AppUserFormActions.showOpenTimeErrorTips(false);
    },

    renderIndicator() {
        if (this.state.submitResult === 'loading') {
            return (
                <Icon type="loading"/>
            );
        }
        var hide = function() {
            AppUserFormActions.hideSubmitTip();
        };
        if (this.state.isShowOpenTimeErrorTips) {
            return (
                <div className="open-period-time">
                    <AlertTimer
                        time={3000}
                        message={Intl.get('user.open.cycle.tips', '开通周期的起始时间不能小于今天')}
                        type="error"
                        showIcon
                        onHide={this.hideOpenTimeErrorTips}
                    />
                </div>
            );
        }
        if (this.state.submitResult === 'success') {
            return (
                <AlertTimer time={3000} message={Intl.get('user.user.add.success', '添加成功')} type="success" showIcon
                    onHide={hide}/>
            );
        }
        if (this.state.submitResult === 'error') {
            return (
                <div className="alert-timer">
                    <Alert message={this.state.submitErrorMsg} type="error" showIcon/>
                </div>
            );
        }
        // 添加应用时，没有选择角色的错误提示
        if (this.state.submitResult === 'selectRoleError') {
            return (
                <div className="apps-no-select-role">
                    <AlertTimer time={6000} message={this.state.submitErrorMsg} type="error" showIcon onHide={hide}/>
                </div>
            );
        }
        return null;
    },

    // 选择的安全域
    onSelectedRealm(value) {
        let realmList = AppUserStore.getState().realmList;
        let selectObj = _.find(realmList, (item) => {
            return item.realm_id === value;
        });
        this.setState({
            selectRealmId: value,
            selectRealmName: selectObj.realm_name
        });
    },

    // 渲染安全域
    renderSelectRealm() {
        let realmList = AppUserStore.getState().realmList;
        let options = realmList.map((item, index) => {
            return (<Option value={item.realm_id} key={index}>{item.realm_name}</Option>);
        });
        return (
            <div className="realm-list">
                <span className="realm-list-title">{Intl.get('user.select.realm.title', '安全域')}</span>
                <SelectFullWidth
                    value={this.state.selectRealmId}
                    onSelect={this.onSelectedRealm}
                >
                    {options}
                </SelectFullWidth>
            </div>

        );
    },

    render() {
        return (
            <div className="user-manage-v2 user-manage-adduser">
                <RightPanelClose onClick={this.closeAppUserForm}/>
                <Form layout='horizontal'>
                    <Validation ref="validation" onValidate={this.handleValidate}>
                        <OperationSteps
                            title={Intl.get('user.user.add', '添加用户')}
                            current={this.state.step}
                        >
                            <OperationSteps.Step action={Intl.get('user.user.basic', '基本信息')}></OperationSteps.Step>
                            <OperationSteps.Step
                                action={Intl.get('user.user.product.select','选择产品')}></OperationSteps.Step>
                            <OperationSteps.Step action={Intl.get('user.user.product.set','产品设置')}></OperationSteps.Step>
                            {this.state.selectRealmId ?
                                <OperationSteps.Step
                                    action={Intl.get('user.select.realm', '选择安全域')}></OperationSteps.Step> : null}
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
                                {this.renderBasicCarousel()}
                            </CarouselItem>
                            <CarouselItem>
                                {this.renderAppsCarousel()}
                            </CarouselItem>
                            <CarouselItem>
                                {this.renderRolesCarousel()}
                            </CarouselItem>
                        </Carousel>
                        <OperationStepsFooter
                            currentStep={this.state.step}
                            totalStep={this.state.selectRealmId ? 4 : 3}
                            onStepChange={this.turnStep}
                            onFinish={this.onStepFinish}
                            disabled={this.state.disabled}
                        >
                            <span
                                className="operator_person">{Intl.get('user.operator', '操作人')}:{this.state.operator}</span>
                            {this.renderIndicator()}
                        </OperationStepsFooter>
                    </Validation>
                </Form>
            </div>
        );
    },
});

export default AddOrEditUser;

