const Validation = require('rc-form-validation');
const Validator = Validation.Validator;
require('../css/index.less');
var Form = require('antd').Form;
var Input = require('antd').Input;
var Select = require('antd').Select;
var Col = require('antd').Col;
var Option = Select.Option;
var FormItem = Form.Item;
var rightPanelUtil = require('../../../../components/rightPanel');
var RightPanelClose = rightPanelUtil.RightPanelClose;
var RightPanelSubmit = rightPanelUtil.RightPanelSubmit;
var RightPanelCancel = rightPanelUtil.RightPanelCancel;
var RightPanelReturn = rightPanelUtil.RightPanelReturn;
var HeadIcon = require('../../../../components/headIcon');
var Spinner = require('../../../../components/spinner');
import { AntcAreaSelection } from 'antc';
var GeminiScrollbar = require('../../../../components/react-gemini-scrollbar');
var RealmFormStore = require('../store/realm-form-store');
var RealmFormAction = require('../action/realm-form-actions');
var AlertTimer = require('../../../../components/alert-timer');
var classNames = require('classnames');
var professionArray = [Intl.get('realm.select.industry1', '计算机/互联网/通信/电子'), Intl.get('realm.select.industry2', '贸易/消费/制造/营运'), Intl.get('realm.select.industry3', '制药/医疗'), Intl.get('realm.select.industry4', '广告/媒体'),
    Intl.get('realm.select.industry5', '房地产/建筑'), Intl.get('realm.select.industry6', '专业服务/教育/培训'), Intl.get('realm.select.industry7', '服务业'), Intl.get('realm.select.industry8', '物流/运输'), Intl.get('realm.select.industry9', '能源/原材料'), Intl.get('realm.select.industry10', '政府/非盈利机构/其他')];
var realmSuffix = '.com';//域名后缀
var batchOperate = require('../../../../public/sources/push/batch');
import Trace from 'LIB_DIR/trace';

function noop() {
}

var RealmForm = React.createClass({
    mixins: [Validation.FieldMixin],
    getDefaultProps: function() {
        return {
            submitRealmForm: noop,
            realm: {
                realmName: '',
                company: '',
                phone: '',
                email: '',
                location: '',
                detailAddress: '',
                profession: '',
                comment: ''
            }
        };
    },
    clone: function(obj) {
        if (typeof (obj) != 'object')
            return obj;

        var re = {};
        if (obj.constructor == Array)
            re = [];

        for (var i in obj) {
            re[i] = this.clone(obj[i]);
        }

        return re;

    },
    getInitialState: function() {
        var realmInfo = this.clone(this.props.realm);
        delete realmInfo.status;
        return {
            status: {
                realmName: {},
                company: {},
                phone: {},
                email: {},
                location: {},
                detailAddress: {},
                profession: {},
                comment: {},
            },
            formData: realmInfo,
            realmPhoneEmailCheck: true,//安全域的电话邮箱必填一项的验证
            saveFlags: RealmFormStore.getState()//保存数据时的标志
        };
    },
    componentWillReceiveProps: function(nextProps) {
        var realmInfo = this.clone(nextProps.realm);
        delete realmInfo.status;
        this.refs.validation.reset();
        var stateData = this.getInitialState();
        stateData.formData = realmInfo;
        this.setState(stateData);
    },
    onChange: function() {
        this.setState({saveFlags: RealmFormStore.getState()});
    },
    componentWillUnmount: function() {
        RealmFormStore.unlisten(this.onChange);
    },
    componentDidMount: function() {
        var _this = this;
        RealmFormStore.listen(_this.onChange);
        _this.layout();
        $(window).resize(function(e) {
            e.stopPropagation();
            _this.layout();
        });
    },
    layout: function() {
        var bHeight = $('body').height();
        var formHeight = bHeight - $('form .head-image-container').outerHeight(true);
        $('.realm-form-scroll').height(formHeight);
    },
    componentDidUpdate: function() {
        if (this.state.formData.id) {
            this.refs.validation.validate(noop);
        }
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

    handleCancel: function(e) {
        e.preventDefault();
        if (this.props.formType == 'edit') {
            Trace.traceEvent(e, '返回安全域详情界面');
            this.props.returnInfoPanel();
        } else {
            Trace.traceEvent(e, '点击取消按钮');
            this.props.closeRightPanel();
        }
    },
    handleSubmit: function(e) {
        e.preventDefault();
        Trace.traceEvent(e, '点击保存按钮');
        if (this.state.isSaving) {
            return;
        }
        var validation = this.refs.validation;
        var _this = this;
        //必填一项的验证
        this.checkPhoneEmail('realm');
        validation.validate(function(valid) {
            if (!valid) {
                return;
            } else if (_this.state.realmPhoneEmailCheck) {
                var newRealm = _this.clone(_this.state.formData);
                _this.setState({
                    formData: _this.state.formData
                });
                if (!newRealm.company) {
                    newRealm.company = _this.props.realm.company;
                    delete newRealm.name;
                }
                newRealm.realmName = newRealm.realmName + realmSuffix;
                if (newRealm.phone) {
                    newRealm.phone = $.trim(newRealm.phone);
                }
                if (newRealm.email) {
                    newRealm.email = $.trim(newRealm.email);
                }
                if (_this.props.formType == 'add') {
                    //设置正在保存中
                    RealmFormAction.setSaveFlag(true);
                    RealmFormAction.addRealm(newRealm,(result) => {
                        //保存失败的情况在form组件中已有处理
                        if (result.saveResult == 'success'){
                            var realmParams = {};
                            batchOperate.addTaskIdToList(result.taskId);
                            batchOperate.saveTaskParamByTaskId(result.taskId, realmParams, {
                                showPop: true,
                                urlPath: '/realm'
                            });
                        }

                    });
                } else {
                    Trace.traceEvent(e, '返回安全域详情界面');
                    //设置正在保存中
                    RealmFormAction.setSaveFlag(true);
                    RealmFormAction.editRealm(newRealm);
                }
            }
        });
    },
    checkPhone: function(rule, value, callback) {
        if (this.state.saveFlags.phoneExit || this.state.saveFlags.phoneError) {
            RealmFormAction.resetPhoneFlags();
        }
        value = $.trim(value);
        if (value) {
            if ((/^1[3|4|5|7|8][0-9]\d{8}$/.test(value)) ||
                    (/^\d{3,4}\-\d{7,8}$/.test(value)) ||
                    (/^400\-?\d{3}\-?\d{4}$/.test(value))) {
                callback();
            } else {
                callback(new Error( Intl.get('common.input.correct.phone', '请输入正确的电话号码')));
            }
        } else {
            callback();
        }
    },
    checkEmail: function(rule, value, callback) {
        if (this.state.saveFlags.emailExit || this.state.saveFlags.emailError) {
            RealmFormAction.resetEmailFlags();
        }
        value = $.trim(value);
        if (value) {
            if (!/^(((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(,((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)*$/i
                .test(value)) {
                callback(new Error( Intl.get('common.correct.email', '请输入正确的邮箱')));
            } else {
                callback();
            }
        } else {
            callback();
        }
    },
    uploadImg: function(src) {
        Trace.traceEvent($(this.getDOMNode()).find('.head-image-container'),'上传头像');
        var formData = this.state.formData;
        formData.image = src;
        this.setState({formData: formData});
    },
    //关闭
    closePanel: function(e) {
        e.stopPropagation();
        Trace.traceEvent(e, '点击关闭按钮');
        this.props.closeRightPanel(e);
    },
    //返回详细信息展示页
    returnInfoPanel: function(e) {
        Trace.traceEvent(e, '返回安全域详情界面');
        this.props.returnInfoPanel(e);
    },
    //更新地址
    updateLocation: function(location) {
        this.state.formData.location = location;
    },

    //去掉保存后提示信息
    hideSaveTooltip: function() {
        RealmFormAction.resetSaveResult(this.props.formType, this.state.saveFlags.saveResult, this.state.saveFlags.savedRealm);
    },
    //域名只能由字母、数字或减号组成
    checkRealmName: function(rule, value, callback) {
        if (value) {
            if (!(/^[A-Za-z0-9][-a-zA-Z0-9.]+$/).test(value)) {
                callback(new Error( Intl.get('realm.check.realm.name.message', '请输入数字、字母或连接符，首字母不能是连接符')));
            } else {
                callback();
            }
        } else {
            callback();
        }
    },
    //获取焦点后去必填一项的验证提示
    resetPhoneEmailCheck: function(type) {
        if (type == 'realm') {
            this.setState({
                realmPhoneEmailCheck: true
            });
        }
    },
    //电话、邮箱必填一项的验证
    checkPhoneEmail: function(type) {
        if (type == 'realm') {
            //安全域的
            if (!this.state.formData.phone && !this.state.formData.email) {
                //电话邮箱都为空
                this.state.realmPhoneEmailCheck = false;
                this.setState({realmPhoneEmailCheck: this.state.realmPhoneEmailCheck});
            }
        }
    },

    // 选择行业
    handleSelect() {
        Trace.traceEvent($(this.getDOMNode()).find('.realm-form-scroll'),'选择行业');
    },

    render: function() {
        var formData = this.state.formData;
        var status = this.state.status;
        var location = this.state.formData.location;
        if (location instanceof Object) {
            location = location.value;
        }
        var profession = this.state.formData.profession;
        if (profession instanceof Object) {
            profession = profession.value;
        }
        let traceName = '';
        var className = 'right-panel-content';
        if (this.props.realmFormShow) {
            if (this.props.formType == 'add') {
                className += ' right-form-add';
                traceName = '添加安全域界面';
            } else {
                className += ' right-panel-content-slide';
                traceName = '编辑安全域界面';
            }
        }
        //地址的拆分
        var prov = '', city = '', county = '';
        if (formData.location) {
            var arrayL = formData.location.split('/');
            prov = arrayL[0] ? arrayL[0] : '';
            city = arrayL[1] ? arrayL[1] : '';
            county = arrayL[2] ? arrayL[2] : '';
        }
        var saveResult = this.state.saveFlags.saveResult;
        var headDescr = 'Logo';
        return (
            <div className={className} data-tracename={traceName}>
                <RightPanelClose onClick={this.closePanel}/>
                {(this.props.formType == 'add' || !this.props.realmFormShow) ? null : (
                    <RightPanelReturn onClick={this.returnInfoPanel}/>)}
                <Form horizontal className="form" autoComplete="off">
                    <HeadIcon headIcon={formData.image}
                        iconDescr={formData.company || headDescr}
                        upLoadDescr={headDescr}
                        isEdit={true}
                        isUserHeadIcon={true}
                        onChange={this.uploadImg}/>
                    <Input type="hidden" name="image" id="image" value={formData.image}/>
                    <div className="realm-form-scroll" style={{width: '420px'}}>
                        <GeminiScrollbar className="geminiScrollbar-vertical">
                            <Validation ref="validation" onValidate={this.handleValidate}>
                                <FormItem
                                    label={Intl.get('realm.name', '域名')}
                                    id="realm-name"
                                    labelCol={{span: 3}}
                                    wrapperCol={{span: 18}}
                                    validateStatus={this.renderValidateStyle('realmName')}
                                    help={status.realmName.isValidating ? Intl.get('common.is.validiting', '正在校验中..') : (status.realmName.errors && status.realmName.errors.join(','))}
                                >
                                    <Validator
                                        rules={[{required: true, min: 1, max: 20 , message: Intl.get('common.input.character.prompt', '最少1个字符,最多20个字符')},{validator: this.checkRealmName}]}>
                                        <Input name="realmName" id="realmName" placeholder="必填项*"
                                            value={formData.realmName ? formData.realmName.split(realmSuffix)[0] : ''}
                                            onChange={this.setField.bind(this, 'realmName')}/>
                                    </Validator>
                                    <label className="realm-name-suffix">{realmSuffix}</label>
                                </FormItem>
                                {this.props.formType == 'add' ? (<FormItem
                                    label={Intl.get('realm.company', '公司')}
                                    id="company"
                                    labelCol={{span: 3}}
                                    wrapperCol={{span: 18}}
                                    validateStatus={this.renderValidateStyle('company')}
                                >
                                    <Input name="company" id="company" value={formData.company}
                                        onChange={this.setField.bind(this, 'company')}/>
                                </FormItem>) : (null)}

                                <FormItem
                                    label={Intl.get('common.phone', '电话')}
                                    id="phone"
                                    labelCol={{span: 3}}
                                    wrapperCol={{span: 18}}
                                    validateStatus={this.renderValidateStyle('phone')}
                                    help={status.phone.isValidating ? Intl.get('common.is.validiting', '正在校验中..') : (status.phone.errors && status.phone.errors.join(','))}
                                >
                                    <Validator rules={[{validator: this.checkPhone}]}>
                                        <Input name="phone" id="phone" value={formData.phone} placeholder={Intl.get('common.phone.email.tip', '电话、邮箱必填其中一项')}
                                            className={this.state.realmPhoneEmailCheck ? '' : 'input-red-border'}
                                            onChange={this.setField.bind(this, 'phone')}
                                            onBlur={this.checkPhoneEmail.bind(this,'realm')}
                                            onFocus={this.resetPhoneEmailCheck.bind(this,'realm')}/>
                                    </Validator>
                                </FormItem>
                                {this.state.realmPhoneEmailCheck ? '' : (
                                    <div className="phone-email-check"><ReactIntl.FormattedMessage id="realm.change.owner.phone.tip" defaultMessage="电话、邮箱必填一项！" /></div>)}
                                <FormItem
                                    label={Intl.get('common.email', '邮箱')}
                                    id="email"
                                    labelCol={{span: 3}}
                                    wrapperCol={{span: 18}}
                                    validateStatus={this.renderValidateStyle('email')}
                                    help={status.email.isValidating ? Intl.get('common.is.validiting', '正在校验中..') : (status.email.errors && status.email.errors.join(','))}
                                >
                                    <Validator rules={[{validator: this.checkEmail}]}>
                                        <Input name="email" id="email" type="text" value={formData.email}
                                            className={this.state.realmPhoneEmailCheck ? '' : 'input-red-border'}
                                            placeholder={Intl.get('common.phone.email.tip', '电话、邮箱必填其中一项')}
                                            onChange={this.setField.bind(this, 'email')}
                                            onBlur={this.checkPhoneEmail.bind(this,'realm')}
                                            onFocus={this.resetPhoneEmailCheck.bind(this,'realm')}/>
                                    </Validator>
                                </FormItem>
                                {this.state.realmPhoneEmailCheck ? '' : (
                                    <div className="phone-email-check"><ReactIntl.FormattedMessage id="realm.change.owner.phone.tip" defaultMessage="电话、邮箱必填一项！" /></div>)}
                                <AntcAreaSelection labelCol="3" wrapperCol="18" width="500px" prov={prov} city={city}
                                    county={county} updateLocation={this.updateLocation}/>

                                <FormItem
                                    label="   "
                                    id="detailAddress"
                                    labelCol={{span: 3}}
                                    wrapperCol={{span: 18}}
                                    validateStatus={this.renderValidateStyle('detailAddress')}
                                    help={status.detailAddress.isValidating ? Intl.get('common.is.validiting', '正在校验中..') : (status.detailAddress.errors && status.detailAddress.errors.join(','))}
                                >
                                    <Input type="textarea" id="detailAddress" placeholder={Intl.get('realm.edit.address.detail.placeholder', '详细地址，例如街道名称，门牌号码等信息')} rows="3"
                                        value={formData.detailAddress}
                                        onChange={this.setField.bind(this, 'detailAddress')}/>
                                </FormItem>

                                <FormItem
                                    label={Intl.get('realm.industry', '行业')}
                                    id="profession"
                                    labelCol={{span: 3}}
                                    wrapperCol={{span: 18}}
                                    validateStatus={this.renderValidateStyle('profession')}
                                    help={status.profession.isValidating ? Intl.get('common.is.validiting', '正在校验中..') : (status.profession.errors && status.profession.errors.join(','))}
                                >
                                    <Select placeholder="请选择行业" name="select"
                                        value={profession}
                                        onChange={this.setField.bind(this, 'profession')}
                                        onSelect={this.handleSelect}
                                    >
                                        <Option value={professionArray[0]}>{professionArray[0]}</Option>
                                        <Option value={professionArray[1]}>{professionArray[1]}</Option>
                                        <Option value={professionArray[2]}>{professionArray[2]}</Option>
                                        <Option value={professionArray[3]}>{professionArray[3]}</Option>
                                        <Option value={professionArray[4]}>{professionArray[4]}</Option>
                                        <Option value={professionArray[5]}>{professionArray[5]}</Option>
                                        <Option value={professionArray[6]}>{professionArray[6]}</Option>
                                        <Option value={professionArray[7]}>{professionArray[7]}</Option>
                                        <Option value={professionArray[8]}>{professionArray[8]}</Option>
                                        <Option value={professionArray[9]}>{professionArray[9]}</Option>
                                        <Option value={professionArray[10]}>{professionArray[10]}</Option>
                                    </Select>
                                </FormItem>

                                <FormItem
                                    label={Intl.get('common.remark', '备注')}
                                    id="comment"
                                    labelCol={{span: 3}}
                                    wrapperCol={{span: 18}}
                                    validateStatus={this.renderValidateStyle('comment')}
                                >
                                    <Input type="textarea" id="comment" rows="3" value={formData.comment}
                                        onChange={this.setField.bind(this, 'comment')}/>
                                </FormItem>

                                <FormItem>
                                    <div className="indicator">
                                        {saveResult ?
                                            (
                                                <AlertTimer time={saveResult == 'error' ? 3000 : 600}
                                                    message={this.state.saveFlags.saveMsg}
                                                    type={this.state.saveFlags.saveResult} showIcon
                                                    onHide={this.hideSaveTooltip}/>
                                            ) : ''
                                        }
                                    </div>
                                    <RightPanelCancel onClick={this.handleCancel}>
                                        <ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消" />
                                    </RightPanelCancel>
                                    <RightPanelSubmit onClick={this.handleSubmit}>
                                        <ReactIntl.FormattedMessage id="common.save" defaultMessage="保存" />
                                    </RightPanelSubmit>
                                </FormItem>
                            </Validation>
                        </GeminiScrollbar>
                    </div>
                    {this.state.saveFlags.isSaving ? (<div className="right-pannel-block">
                        <Spinner className="right-panel-saving"/>
                    </div>) : ''}
                </Form>
            </div>
        );
    }
})
    ;

module.exports = RealmForm;
