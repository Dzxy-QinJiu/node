/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/2/15.
 */
// 添加用户类型配置
var React = require('react');
var createReactClass = require('create-react-class');
const language = require('PUB_DIR/language/getLanguage');
require('../css/user-type-config.less');
require('CMP_DIR/user_manage_components/css/form-basic-zh_CN.less');
if (language.lan() === 'es' || language.lan() === 'en') {
    require('CMP_DIR/user_manage_components/css/form-basic-es_VE.less');
}
import {Button, Icon} from 'antd';
import { AntcSelect } from 'antc';
const Option = AntcSelect.Option;
import UserOverDraftField from 'CMP_DIR/user_manage_components/user-over-draftfield';
import UserMultiLoginField from 'CMP_DIR/user_manage_components/user-multilogin-radiofield';
import AppRolePermission from 'CMP_DIR/user_manage_components/app-role-permission';
import FieldMixin from 'CMP_DIR/antd-form-fieldmixin';
var AlertTimer = require('CMP_DIR/alert-timer');
var timer = null;
var GeminiScrollbar = require('CMP_DIR/react-gemini-scrollbar');
import Trace from 'LIB_DIR/trace';

//高度常量
var LAYOUT_CONSTANTS = {
    RIGHT_PANEL_PADDING_TOP: 60,
    RIGHT_PANEL_PADDING_BOTTOM: 0
};

var UserTypeConfigForm = createReactClass({
    displayName: 'UserTypeConfigForm',

    mixins: [FieldMixin,
        UserOverDraftField,
        UserMultiLoginField
    ],

    getDefaultProps: function() {
        return {
            handleCancel: function() {
            },
            handleSaveAppConfig: function() {
            },
            appName: ''
        };
    },

    getInitialState: function() {
        return {
            //向后台提交的数据
            formData: {
                id: this.props.item.id,
                client_id: this.props.appId,
                //组件中用的是字符串的0，后端需要的是数字0
                over_draft: this.props.item.over_draft + '',
                multilogin: this.props.item.mutilogin + '',
                is_two_factor: this.props.item.is_two_factor + '',
                user_type: this.props.item.user_type,
                //开通周期 默认选中半个月
                range: this.props.item.range,
                //配置名称
                config_name: this.props.item.config_name,
                selectedRoles: this.props.item.roles,
                selectedPermissions: this.props.item.permissions,
                valid_period: this.props.item.valid_period
            },
            //出错时的提示
            errorMessage: '',
            //修改或添加成功后的提示
            successMessage: '',
            //点击提交按钮时的loading效果
            isLoading: false
        };
    },

    componentWillReceiveProps: function(nextProps) {
        var appId = nextProps.appId;
        if (appId !== this.state.appId) {
            //切换到上一个界面
            this.props.togglePageChange(false);
        }
    },

    // 提交用户类型配置数据
    handleSubmit: function(e) {
        var _this = this;
        var data = {};
        data.config_name = this.state.formData.config_name;
        //校验配置名称是否是必填
        data.client_id = this.state.formData.client_id;
        data.over_draft = parseInt(this.state.formData.over_draft);
        data.is_two_factor = parseInt(this.state.formData.is_two_factor);
        data.mutilogin = parseInt(this.state.formData.multilogin);
        data.user_type = this.state.formData.user_type;
        data.roles = this.state.formData.selectedRoles;
        data.permissions = this.state.formData.selectedPermissions;
        data.valid_period = parseInt(this.getTimeMillis());
        _this.setState({
            isLoading: true
        });
        $('#usertypeconfigsave').attr('disabled', 'disabled');
        e.preventDefault();
        Trace.traceEvent(e, '保存配置用户类型');
        //修改类型
        if (this.state.formData.id !== '') {
            data.id = this.state.formData.id;
            $.ajax({
                url: '/rest/update_usertypeconfig',
                type: 'put',
                contentType: 'application/json',
                dateType: 'json',
                data: JSON.stringify(data),
                success: function(result) {
                    _this.setState({
                        isLoading: false,
                        successMessage: '保存成功'
                    });
                    $('#usertypeconfigsave').removeAttr('disabled');
                    if (timer) {
                        clearTimeout(timer);
                    }
                    //2s以后，跳转页面
                    timer = setTimeout(function() {
                        _this.props.togglePageChange(false);
                    }, 2000);
                },
                error: function(errorInfo) {
                    _this.setState({
                        isLoading: false,
                        errorMessage: errorInfo.responseText
                    });
                    $('#usertypeconfigsave').removeAttr('disabled');
                }
            });
        } else {
            //添加类型
            $.ajax({
                url: '/rest/add_usertypeconfig',
                type: 'post',
                contentType: 'application/json',
                dateType: 'json',
                data: JSON.stringify(data),
                success: function(result) {
                    _this.setState({
                        isLoading: false,
                        successMessage: '保存成功'
                    });
                    $('#usertypeconfigsave').removeAttr('disabled');
                    setTimeout(function() {
                        _this.props.togglePageChange(false);
                    }, 2000);
                },
                error: function(errorInfo) {
                    _this.setState({
                        isLoading: false,
                        errorMessage: errorInfo.responseText
                    });
                    $('#usertypeconfigsave').removeAttr('disabled');
                }
            });
        }
    },

    // 计算开通周期的毫秒数，如果为永久，就传0
    getTimeMillis: function() {
        var range = this.state.formData.range;
        var mills = '';
        switch (range) {
            case '1w':
                mills = 24 * 60 * 60 * 1000 * 7;
                break;
            case '0.5m':
                mills = 24 * 60 * 60 * 1000 * 15;
                break;
            case '1m':
                mills = 24 * 60 * 60 * 1000 * 30;
                break;
            case '6m':
                mills = 24 * 60 * 60 * 1000 * 30 * 6;
                break;
            case '12m':
                mills = 24 * 60 * 60 * 1000 * 30 * 12;
                break;
            case 'forever':
                mills = 0;
                break;
        }
        return mills;
    },

    //点击取消按钮，跳转页面
    handleCancel: function(e) {
        Trace.traceEvent(e, '取消编辑配置用户类型');
        this.props.handleCancel();
        this.props.togglePageChange(false);
    },

    //修改时间周期后
    RangeModify: function(val) {
        var formData = this.state.formData;
        formData.range = val;
        this.setState({formData: formData});
    },

    //角色权限修改后
    rolesPermissionsChange: function(roles, permissions) {
        var formData = this.state.formData;
        formData.selectedRoles = roles.slice();
        formData.selectedPermissions = permissions.slice();
        this.setState({formData: formData});
    },

    //周期选择组件
    renderModifyTime: function() {
        return (
            <div className="modify-delay-time-style">
                <AntcSelect
                    value={this.state.formData.range}
                    onChange={this.RangeModify}
                    style={{'marginLeft': '1px'}}
                >
                    <Option value="1w">1周</Option>
                    <Option value="0.5m">半个月</Option>
                    <Option value="1m">1个月</Option>
                    <Option value="6m">6个月</Option>
                    <Option value="12m">12个月</Option>
                    <Option value="forever">永久</Option>
                </AntcSelect>
            </div>
        );
    },

    updateScrollBar: function() {
        this.refs.scrollbar.update();
    },

    //提交后的成功或者错误提示
    handleSubmitResult: function() {
        var hide = () => {
            this.setState({
                errorMessage: '',
                successMessage: ''
            });
            this.props.handleSaveAppConfig(this.props.appId);
        };
        if (this.state.errorMessage !== '') {
            return (
                <div>
                    <AlertTimer
                        time={2000}
                        message={this.state.errorMessage}
                        type="error"
                        showIcon
                        onHide={hide}
                    />
                </div>
            );
        }
        return (
            <div className="errTip">
                <AlertTimer
                    time={2000}
                    message={this.state.successMessage}
                    type="info"
                    showIcon
                    onHide={hide}
                />
            </div>
        );

    },

    render: function() {
        var item = this.props.item;
        var divHeight = $(window).height()
            - LAYOUT_CONSTANTS.RIGHT_PANEL_PADDING_TOP
            - LAYOUT_CONSTANTS.RIGHT_PANEL_PADDING_BOTTOM
        ;
        return (
            <div>
                <div className="appTitle">{this.props.appName}</div>
                <div className="grantinfo-form" style={{height: divHeight}}>
                    <GeminiScrollbar ref="scrollbar">
                        <div className="scroll-content">
                            <div className="app-property-content basic-data-form app-property-other-property">
                                <div className="form-item">
                                    <div className="form-item-label">用户类型</div>
                                    <div className="form-item-content">
                                        <div className="custom_radio_active">
                                            {item.user_type === '试用用户' && '试用'}
                                            {item.user_type === '正式用户' && '签约'}
                                            {item.user_type === 'special' && '赠送'}
                                            {item.user_type === 'training' && '培训'}
                                            {item.user_type === 'internal' && '员工'}
                                        </div>
                                    </div>
                                </div>
                                <div className="form-item">
                                    <div className="form-item-label">{Intl.get('user.expire.select', '到期可选')}</div>
                                    <div className="form-item-content">
                                        {this.renderUserOverDraftBlock()}
                                    </div>
                                </div>
                                <div className="form-item">
                                    <div className="form-item-label">多人登录</div>
                                    <div className="form-item-content">
                                        {this.renderMultiLoginRadioBlock()}
                                    </div>
                                </div>
                                <div className="form-item">
                                    <div className="form-item-label">开通周期</div>
                                    <div className="form-item-content">
                                        {this.renderModifyTime()}
                                    </div>
                                </div>
                            </div>
                            <AppRolePermission
                                app_id={this.props.appId}
                                selectedRoles={this.state.formData.selectedRoles}
                                selectedPermissions={this.state.formData.selectedPermissions}
                                onRolesPermissionSelect={this.rolesPermissionsChange}
                                updateScrollBar={this.updateScrollBar}
                            />

                            <div className="usertypeconfig-form-button">
                                <Button
                                    type="primary"
                                    onClick={this.handleSubmit}
                                    id="usertypeconfigsave"
                                >
                                    保存
                                    {this.state.isLoading ?
                                        <Icon type="loading"/> : <span></span>}
                                </Button>
                                <Button
                                    type="ghost"
                                    onClick={this.handleCancel}
                                >
                                    取消
                                </Button>
                                {this.state.errorMessage !== '' || this.state.successMessage !== '' ? this.handleSubmitResult() : null}
                            </div>
                        </div>
                    </GeminiScrollbar>
                </div>
            </div>
        );
    },
});

module.exports = UserTypeConfigForm;

