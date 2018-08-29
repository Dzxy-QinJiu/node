var React = require('react');
const Validation = require('rc-form-validation');
const Validator = Validation.Validator;
/**
 * Created by wangliping on 2016/5/19.
 */
import { Radio, Form, Input, Select, Icon} from 'antd';
const RadioGroup = Radio.Group;
var classNames = require('classnames');
var FormItem = Form.Item;
var AlertTimer = require('../../../../components/alert-timer');
var rightPanelUtil = require('../../../../components/rightPanel/index');
var RightPanelSubmit = rightPanelUtil.RightPanelSubmit;
var RightPanelCancel = rightPanelUtil.RightPanelCancel;
var userData = require('../../../../public/sources/user-data');
var AuthorityFormAction = require('../action/authority-form-actions');
var AuthorityFormStore = require('../store/authority-form-store');
var language = require('../../../../public/language/getLanguage');
import Trace from 'LIB_DIR/trace';
function noop() {
}

var AuthorityEditForm = React.createClass({
    mixins: [Validation.FieldMixin],
    getDefaultProps: function() {
        return {
            authority: {
                permissionId: '',
                permissionName: '',
                permissionDefine: '',
                permissionApis: '',
                permissionApisKey: '',
                permissionApisVal: 'PUT',
                permissionType: 'REST',
                classifyName: ''
            }
        };
    },
    getInitialState: function() {
        var saveFlags = AuthorityFormStore.getState();
        return {
            status: {
                permissionId: {},
                permissionName: {},
                permissionDefine: {},
                permissionApis: {},
                permissionApisKey: {},
                permissionApisVal: {},
                classifyName: {}
            },
            formData: $.extend(true, {}, this.props.authority),
            isAuthoritySaving: saveFlags.isAuthoritySaving,//是否正在保存
            saveAuthorityMsg: saveFlags.saveAuthorityMsg,//保存失败的提示信息
            permissionList: this.props.permissionList || []
        };
    },
    onChange: function() {
        var saveFlags = AuthorityFormStore.getState();
        this.setState({
            isAuthoritySaving: saveFlags.isAuthoritySaving,
            saveAuthorityMsg: saveFlags.saveAuthorityMsg
        });
    },
    componentDidMount: function() {
        AuthorityFormStore.listen(this.onChange);
    },
    componentWillUnmount: function() {
        AuthorityFormStore.unlisten(this.onChange);
    },

    componentWillReceiveProps: function(nextProps) {
        this.refs.validation.reset();
        var stateData = this.getInitialState();
        stateData.formData = $.extend(true, {}, nextProps.authority);
        this.setState(stateData);
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

    handleSubmit: function(e) {
        e.preventDefault();
        Trace.traceEvent(e,'保存编辑权限详情');
        var _this = this;
        if (_this.state.isAuthoritySaving) {
            return;
        }
        var validation = this.refs.validation;
        validation.validate(function(valid) {
            if (!valid) {
                return;
            } else {
                var formData = $.extend(true, {}, _this.state.formData);
                var permissionApis = {};
                if (formData.permissionType == 'DATA') {//data类型只保存数据权限
                    //判断formData，去掉空值，无论如何，都传过去，因为存在删除操作，传null的话，郑鹏飞java端不做操作
                    formData.permissionDatas = _.filter(formData.permissionDatas || [], function(str) {
                        return str.trim() !== '';
                    });
                    if (formData.permissionDatas.length == 0) {
                        //必填一项的验证提示
                        _this.state.formData.permissionDataNull = true;
                        _this.setState({
                            formData: _this.state.formData
                        });
                        return;
                    }
                } else {//rest类型只保存服务地址
                    formData.permissionDatas = [];
                    var hasPermissionApi = false;
                    //遍历权限服务地址 [{url:‘urlVal’，method：‘methodVal’},..]数组,转成后台接口参数所需{urlVal:methodVal,..}对象
                    formData.permissionApiArray.forEach(function(permission, index) {
                        if (permission.permissionApiUrl) {
                            hasPermissionApi = true;
                            //同一地址不同方法的处理
                            if (permissionApis[permission.permissionApiUrl]) {
                                //如果已有该路径，该路径对应的value中没有当前方法名，则value+=,method
                                if (permissionApis[permission.permissionApiUrl].indexOf(permission.permissionApiMethod) < 0) {
                                    permissionApis[permission.permissionApiUrl] += ',' + permission.permissionApiMethod;
                                }
                            } else {
                                //不存在改路径时，该路径对应的value就是其方法名
                                permissionApis[permission.permissionApiUrl] = permission.permissionApiMethod;
                            }
                        } else if (index == 0) {
                            //服务地址url为空时，必填一项的验证
                            permission.isNull = true;
                        }
                    });
                    //如果没有权限地址则提示必填的验证
                    if (!hasPermissionApi) {
                        _this.state.formData = formData;
                        _this.setState({
                            formData: formData
                        });
                        return;
                    } else {
                        //如果有权限地址，则去掉必填一项的验证
                        delete formData.permissionApiArray[0].isNull;
                    }
                }
                delete formData.permissionApiArray;
                //删除数据权限是否为空的标识
                delete formData.permissionDataNull;
                formData.classifyName = _this.props.classifyName;//权限组名
                AuthorityFormAction.setAuthoritySavingFlag(true);
                if (_this.props.curAppId) {
                    formData.clientId = _this.props.curAppId;//我的应用的应用id
                } else {
                    formData.clientId = userData.getUserData().auth.client_id;//登录用户的应用id
                }
                if (_this.props.formType == 'edit') {
                    delete formData.showEditFormFlag;
                    delete formData.showInfoFlag;
                    formData.permissionApis = JSON.stringify(permissionApis);
                    formData.permissionDatas = JSON.stringify(formData.permissionDatas);
                    //修改单个权限信息,authorityType=myApp
                    AuthorityFormAction.editAuthority(formData, _this.props.authorityType);
                } else {
                    //添加权限
                    formData.permissionApis = permissionApis;
                    formData.realmId = userData.getUserData().auth.realm_id;//安全域的id
                    AuthorityFormAction.addAuthority([formData], _this.props.authorityType);
                }
            }
        });
    },
    hideSaveTooltip: function() {
        AuthorityFormAction.clearSaveAuthorityFlags();
    },

    //更新服务地址,i:当前修改的是第几个地址，newVal:修改后的url/method,type:当前修改的是url还是method
    updatePermissionApiObj: function(i, newVal, type) {
        var permissionApiArray = this.state.formData.permissionApiArray || [];
        //找到数组中对应的对象，更新method/url
        if (permissionApiArray[i] && _.isObject(permissionApiArray[i])) {
            if (type == 'url') {
                if (newVal) {
                    delete permissionApiArray[i].isNull;
                } else if (i == 0) {
                    //服务地址url为空时，必填一项的验证
                    permissionApiArray[i].isNull = true;
                }
                permissionApiArray[i].permissionApiUrl = newVal;
            } else {
                permissionApiArray[i].permissionApiMethod = newVal || 'PUT';
            }
            this.state.formData.permissionApiArray = permissionApiArray;
            this.setState({
                formData: this.state.formData
            });
        }
    },
    //选择服务地址的请求方式的处理
    onPermissionSelect: function(index, selectVal) {
        this.updatePermissionApiObj(index, selectVal, 'method');
    },
    //服务地址输入的处理
    onPermissionInputChange: function(index, event) {
        var newKey = event.target.value;
        this.updatePermissionApiObj(index, newKey, 'url');
    },
    //添加一个服务地址的处理
    addPermissionApi: function() {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.permission-inputgroup-btns-div'),'添加服务地址');
        var permissionApiArray = this.state.formData.permissionApiArray || [];
        permissionApiArray.push({
            permissionApiUrl: '',
            permissionApiMethod: 'PUT'
        });
        this.state.formData.permissionApiArray = permissionApiArray;
        this.setState({
            formData: this.state.formData
        });
    },
    //删除服务地址
    delPermissionApi: function(index, event) {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.permission-inputgroup-btns-div'),'删除服务地址');
        var value = event.target.value;
        if (value) {
            return;
        }
        var permissionApiArray = this.state.formData.permissionApiArray || [];
        if (permissionApiArray[index]) {
            permissionApiArray.splice(index, 1);
            this.state.formData.permissionApiArray = permissionApiArray;
            this.setState({
                formData: this.state.formData
            });
        }
    },
    //验证服务地址是否为空
    validatePermissionApi: function(index, event) {
        var permissionUrl = event.target.value;
        var permissionApiArray = this.state.formData.permissionApiArray || [];
        if (permissionApiArray[index]) {
            if (permissionUrl) {
                //服务地址url不为空时，则删除是否为空的标志
                delete permissionApiArray[index].isNull;
            } else if (index == 0) {
                //服务地址url为空时，必填一项的验证
                permissionApiArray[index].isNull = true;
            }
            this.state.formData.permissionApiArray = permissionApiArray;
            this.setState({
                formData: this.state.formData
            });
        }
    },
    renderPermissionApiItem: function(permissionApi, index, permissionApiLen) {
        var onlyOneItem = index == 0 && index == permissionApiLen - 1;//只有一条服务地址
        return (<div className="permission-api-item" key={index}>
            <Select size="large"
                name="permissionApisVal" onChange={this.onPermissionSelect.bind(this,index)}
                value={permissionApi.permissionApiMethod}>
                <Option value="PUT">PUT</Option>
                <Option value="GET">GET</Option>
                <Option value="POST">POST</Option>
                <Option value="DELETE">DELETE</Option>
            </Select>
            <Input name="permissionApisKey" id="permissionApisKey"
                className={permissionApi.isNull ? 'auth-validate-error' : ''}
                value={permissionApi.permissionApiUrl}
                placeholder={index == 0 ? Intl.get('authority.need.write.one', '必填一项*') : ''}
                onBlur={index == 0 ? this.validatePermissionApi.bind(this,index) : noop}
                onChange={this.onPermissionInputChange.bind(this,index)}
            />
            <div className="permission-inputgroup-btns-div">
                {onlyOneItem ? null : (
                    <Icon type="minus" className="del-permission-inputgroup-btn permission-inputgroup-btn"
                        onClick={this.delPermissionApi.bind(this,index)}/>)}
                {(index == permissionApiLen - 1) ? (
                    <Icon type="plus" className="add-permission-inputgroup-btn permission-inputgroup-btn"
                        onClick={this.addPermissionApi}/>) : null}
            </div>
            {permissionApi.isNull ? (
                <div className="auth-validate-error-tip permissionApi-validate">
                    <ReactIntl.FormattedMessage
                        id="authority.need.write.one.api"
                        defaultMessage="必填一项服务地址"/>
                </div>) : null}
        </div>);
    },
    //数据权限输入框发生改变
    onPermissionDataChange: function(idx, event) {
        var permissionDatas = this.state.formData.permissionDatas;
        var value = event.target.value;
        permissionDatas[idx] = value;
        this.setState({
            formData: this.state.formData
        });
        this.validatePermissionData(idx, event);
    },
    //验证数据权限是否为空
    validatePermissionData: function(index, event) {
        var value = event.target.value;
        if (value) {
            //数据权限不为空时，则删除是否为空的标志(只要有一个即可)
            delete this.state.formData.permissionDataNull;
        } else if (index == 0) {
            //数据权限为空时，必填一项的验证
            this.state.formData.permissionDataNull = true;
        }
        this.setState({
            formData: this.state.formData
        });
    },
    //渲染数据权限
    renderPermissionDatas: function() {
        var permissionDatas = this.state.formData.permissionDatas;
        if (!_.isArray(permissionDatas) || permissionDatas.length === 0) {
            permissionDatas = this.state.formData.permissionDatas = [''];
        }
        var _this = this;
        var onlyOneItem = permissionDatas.length === 1;
        var permissionDatasLen = permissionDatas.length;
        //数据权限是否为空的标识（只要有一个就不为空）
        let permissionDataNull = this.state.formData.permissionDataNull;
        return (
            <div className="permissionDatas-content">
                {
                    permissionDatas.map(function(str, index) {
                        return <div className="permissionData-item" key={index}>
                            <Input name="permissionData" id="permissionData"
                                className={permissionDataNull && index == 0 ? 'auth-validate-error' : ''}
                                placeholder={index == 0 ? Intl.get('authority.need.write.one', '必填一项*') : ''}
                                value={permissionDatas[index]}
                                onBlur={index == 0 ? _this.validatePermissionData.bind(this,index) : noop}
                                onChange={_this.onPermissionDataChange.bind(_this , index)}
                            />
                            <div className="permission-inputgroup-btns-div">
                                {onlyOneItem ? null : (
                                    <Icon type="minus"
                                        className="del-permission-inputgroup-btn permission-inputgroup-btn"
                                        onClick={_this.removePermissionData.bind(_this , index)}/>)}
                                {(index == permissionDatasLen - 1) ? (
                                    <Icon type="plus"
                                        className="add-permission-inputgroup-btn permission-inputgroup-btn"
                                        onClick={_this.addPermissionData.bind(_this , index)}/>) : null}
                            </div>
                            {permissionDataNull && index == 0 ? (
                                <div className="auth-validate-error-tip"><ReactIntl.FormattedMessage
                                    id="authority.need.write.one.data"
                                    defaultMessage="必填一项数据权限"/>
                                </div>) : null}
                        </div>;
                    })
                }
            </div>
        );
    },
    //添加一个数据权限
    addPermissionData: function() {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.permission-inputgroup-btns-div'),'添加一个数据权限');
        var permissionDatas = this.state.formData.permissionDatas;
        permissionDatas.push('');
        this.setState({
            formData: this.state.formData
        });
    },
    //移除一个数据权限
    removePermissionData: function(index) {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.permission-inputgroup-btns-div'),'移除一个数据权限');
        var permissionDatas = this.state.formData.permissionDatas;
        permissionDatas.splice(index, 1);
        this.setState({
            formData: this.state.formData
        });
    },
    checkPermissionNameExist: function(rule, value, callback) {
        value = $.trim(value);
        const authority = this.props.authority;
        const origName = _.isObject(authority) ? authority.permissionName : '';
        if (value === origName) {
            callback();
        } else {
            const isExist = _.find(this.state.permissionList, item => {
                return item.permissionName === value;
            });
            if (isExist) {
                callback(new Error(Intl.get('authority.permission.exist', '该权限名已存在')));
            } else {
                callback();
            }
        }
    },
    renderPermissionApis: function() {
        var permissionApiArray = this.state.formData.permissionApiArray;
        var permissionApiLen = _.isArray(permissionApiArray) ? permissionApiArray.length : 0;
        var permissionApisEle = [];
        var _this = this;
        if (permissionApiLen > 0) {
            //如果权限服务地址数组有数据，则遍历数组中的服务地址对象进行渲染展示
            permissionApisEle = permissionApiArray.map(function(permissionApi, index) {
                if (_.isObject(permissionApi)) {
                    return _this.renderPermissionApiItem(permissionApi, index, permissionApiLen);
                }
            });
        } else {
            //如果权限服务地址数组没有数据
            var permissionApi = {permissionApiUrl: '', permissionApiMethod: 'PUT'};
            //权限服务地址数组中默认加入一个服务地址对象
            this.state.formData.permissionApiArray = [permissionApi];
            //默认渲染一个空的服务地址url输入框和method选择框
            permissionApisEle.push(_this.renderPermissionApiItem(permissionApi, 0, 1));
        }
        return permissionApisEle;
    },

    render: function() {
        var _this = this;
        var formData = _this.state.formData;
        var status = _this.state.status;
        let labelCol = (language.lan() == 'zh' ? 4 : 8);
        let wrapperCol = (language.lan() == 'zh' ? 18 : 12);
        let authWrapperCol = (language.lan() == 'zh' ? 18 : 12);
        let addressWrapperCol = (language.lan() == 'zh' ? 18 : 24);
        return (
            <div className="authority-formItem-group-container">
                <div className="default-authority-formItem-group">
                    <Form horizontal className="form"
                    >
                        <Validation ref="validation"
                            onValidate={this.handleValidate}
                        >
                            <FormItem
                                label={Intl.get('authority.auth.name', '权限名称')}
                                id="permissionName"
                                labelCol={{span: labelCol}}
                                wrapperCol={{span: 18}}
                                validateStatus={_this.renderValidateStyle('permissionName')}
                                help={status.permissionName.isValidating ? Intl.get('common.is.validiting', '正在校验中..') : (status.permissionName.errors && status.permissionName.errors.join(','))}
                            >
                                <Validator
                                    rules={[{required: true, min: 1, max: 200, message: Intl.get('authority.input.length.tip', '最少1个字符,最多200个字符')},{validator: this.checkPermissionNameExist}]}>
                                    <Input name="permissionName" id="permissionName"
                                        value={formData.permissionName}
                                        placeholder={Intl.get('common.required.tip', '必填项*')}
                                        onChange={_this.setField.bind(_this, 'permissionName')}
                                    />
                                </Validator>
                            </FormItem>
                            <FormItem
                                label={Intl.get('authority.auth.type', '权限类型')}
                                labelCol={{span: labelCol}}
                                wrapperCol={{span: wrapperCol}}
                            >
                                <RadioGroup onChange={_this.setField.bind(_this, 'permissionType')}
                                    value={formData.permissionType || 'REST'}>
                                    <Radio value="REST">REST</Radio>
                                    <Radio value="DATA">DATA</Radio>
                                </RadioGroup>
                            </FormItem>
                            {formData.permissionType === 'DATA' ? (<FormItem
                                label={Intl.get('authority.data.auth', '数据权限')}
                                labelCol={{span: labelCol}}
                                wrapperCol={{span: addressWrapperCol}}
                            >
                                {this.renderPermissionDatas()}
                            </FormItem>) : (<FormItem
                                label={Intl.get('authority.auth.api', '服务地址')}
                                id="permissionApis"
                                labelCol={{span: labelCol}}
                                wrapperCol={{span: addressWrapperCol}}
                            >
                                <div className="permissionApis-content">
                                    {this.renderPermissionApis()}
                                </div>
                            </FormItem>)}

                            <FormItem
                                label={Intl.get('authority.auth.flag', '权限标识')}
                                id="permissionDefine"
                                labelCol={{span: labelCol}}
                                wrapperCol={{span: authWrapperCol}}
                                validateStatus={_this.renderValidateStyle('permissionDefine')}
                                help={status.permissionDefine.isValidating ? Intl.get('common.is.validiting', '正在校验中..') : (status.permissionDefine.errors && status.permissionDefine.errors.join(','))}
                            >
                                <Validator
                                    rules={[{required: true, min: 1, max: 200, message: Intl.get('authority.input.length.tip', '最少1个字符,最多200个字符')}]}>
                                    <Input name="permissionDefine" id="permissionDefine"
                                        value={formData.permissionDefine}
                                        onChange={_this.setField.bind(_this, 'permissionDefine')}
                                        placeholder={Intl.get('common.required.tip', '必填项*')}
                                    />
                                </Validator>
                            </FormItem>

                            <FormItem
                                wrapperCol={{span: 22}}>
                                {this.state.isAuthoritySaving ? (<Icon type="loading"/>) : (
                                    this.state.saveAuthorityMsg ? (<div className="indicator">
                                        <AlertTimer time={3000}
                                            message={this.state.saveAuthorityMsg}
                                            type="error" showIcon
                                            onHide={this.hideSaveTooltip}/>
                                    </div>) : null)
                                }
                                <RightPanelCancel onClick={this.props.closeAuthorityForm}>
                                    <ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消"/>
                                </RightPanelCancel>
                                &nbsp;&nbsp;&nbsp;
                                <RightPanelSubmit onClick={this.handleSubmit}>
                                    <ReactIntl.FormattedMessage id="common.save" defaultMessage="保存"/>
                                </RightPanelSubmit>
                            </FormItem>
                        </Validation>
                    </Form>
                </div>
            </div>
        );

    }
})
    ;
module.exports = AuthorityEditForm;

