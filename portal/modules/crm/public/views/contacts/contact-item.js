import {Button, message} from 'antd';
import { AntcSelect } from 'antc';
const Option = AntcSelect.Option;
var ContactUtil = require('../../utils/contact-util');
var ContactAction = require('../../action/contact-action');
import Trace from 'LIB_DIR/trace';
import DetailCard from 'CMP_DIR/detail-card';
import classNames from 'classnames';
import BasicEditInputField from 'CMP_DIR/basic-edit-field-new/input';
import BasicEditSelectField from 'CMP_DIR/basic-edit-field-new/select';
import DynamicAddDelField from 'CMP_DIR/basic-edit-field-new/dynamic-add-delete-field';
import BasicEditDateField from 'CMP_DIR/basic-edit-field-new/date-picker';
import CrmAction from '../../action/crm-actions';
import contactAjax from '../../ajax/contact-ajax';
const hasPrivilege = require('CMP_DIR/privilege/checker').hasPrivilege;
import {emailRegex,qqRegex,checkWechat} from 'PUB_DIR/sources/utils/validate-util';
import {disabledAfterToday} from 'PUB_DIR/sources/utils/common-method-util';
import {clueNameContactRule} from 'PUB_DIR/sources/utils/validate-util';
import {addHyphenToPhoneNumber} from 'LIB_DIR/func';
import PhoneCallout from 'CMP_DIR/phone-callout';
import PhoneInput from 'CMP_DIR/phone-input';
import crmPrivilegeConst from 'MOD_DIR/crm/public/privilege-const';
class ContactItem extends React.Component {
    static defaultProps = {
        contact: ContactUtil.getEmptyViewContactObject()
    };

    state = {
        isLoading: false
    };

    showDeleteContactConfirm = (event) => {
        event.stopPropagation();
        Trace.traceEvent(ReactDOM.findDOMNode(this), '删除联系人');
        ContactAction.showDeleteContactConfirm(this.props.contact);
    };

    setDefaultContact = (contact, event) => {
        event.stopPropagation();
        //如果已经是默认联系人或者正在设置默认联系人
        if (contact.def_contancts === 'true' || this.state.isLoading) return;
        if (this.props.isMerge) {
            this.props.setMergeCustomerDefaultContact(this.props.contact.contact.id);
        } else {
            this.setState({isLoading: true});
            ContactAction.toggleDefaultContact(this.props.contact.contact, (result) => {
                this.setState({isLoading: false});
                if (_.isObject(result) && result.code === 0) {
                    message.success(Intl.get('crm.117', '修改默认联系人成功'));
                    //修改默认联系人的信息时，更新列表中的联系人数据
                    this.props.contact.contact.def_contancts = 'true';
                    if (_.isFunction(this.props.updateCustomerDefContact)) {
                        this.props.updateCustomerDefContact(this.props.contact.contact);
                    }
                } else {
                    message.error(Intl.get('crm.118', '修改默认联系人失败'));
                }
            });
        }
    };

    hideDeleteContactModal = (event) => {
        event.stopPropagation();
        Trace.traceEvent(ReactDOM.findDOMNode(this), '取消删除联系人');
        ContactAction.hideDeleteContactConfirm(this.props.contact);
    };

    deleteContact = (event) => {
        event.stopPropagation();
        if (this.props.isMerge) {
            this.props.delMergeCustomerContact(this.props.contact.contact.id);
            ContactAction.hideDeleteContactConfirm(this.props.contact.contact);
        } else {
            Trace.traceEvent(ReactDOM.findDOMNode(this), '确认删除联系人');
            let customerId = this.props.contact.contact.customer_id;
            ContactAction.deleteContact(this.props.contact, () => {
                //删的默认联系人
                if (_.get(this.props, 'contact.contact') && this.props.contact.contact.def_contancts === 'true') {
                    if (_.isFunction(this.props.updateCustomerDefContact)) {
                        //删除列表中的默认联系人
                        this.props.updateCustomerDefContact({
                            ...this.props.contact.contact,
                            isDelDefaultContact: true
                        });
                    }
                }
            });
        }
    };

    //展开、收起联系方式的处理
    toggleContactWay = (isExpanded) => {
        ContactAction.toggleContactWay({contact: this.props.contact, isExpanded});
    };

    //获取联系人的角色、职位、部门信息
    getContactInfo = (contact) => {
        let contactInfo = '';
        if (contact.role) {
            contactInfo += contact.role;
        }
        if (contact.role && contact.department) {
            contactInfo += '-';
        }
        if (contact.department) {
            contactInfo += contact.department;
        }
        if (contact.department && contact.position || contact.role && contact.position) {
            contactInfo += '-';
        }
        if (contact.position) {
            contactInfo += contact.position;
        }
        return contactInfo;
    };
    renderItemSelfSettingContent = (item) => {
        return this.props.disableEdit ? addHyphenToPhoneNumber(item) : (
            <PhoneCallout phoneNumber={item}
                showPhoneNum={addHyphenToPhoneNumber(item)}
                showPhoneIcon={true}
                type='customer'
                id={_.get(this.props, 'contact.contact.customer_id', '')}
            />);
    };
    renderItemSelfSettingForm = (key, index, that) => {
        const fieldKey = `${that.props.field}[${key}]`;
        let initValue = _.get(that.state, `value[${key}]`, '');
        let validateRules = this.getPhoneInputValidateRules(that);
        if (index === 0) {//电话必填的验证
            validateRules = _.concat(validateRules, [{
                required: true,
                message: Intl.get('user.info.input.phone', '请输入电话'),
            }]);
        }
        return (
            <PhoneInput
                initialValue={initValue}
                placeholder={Intl.get('clue.add.phone.num', '电话号码')}
                validateRules={validateRules}
                id={fieldKey}
                labelCol={{span: 4}}
                wrapperCol={{span: 20}}
                colon={false}
                form={that.props.form}
                label={index === 0 ? Intl.get('common.phone', '电话') : ' '}
            />);
    };
    //渲染联系人标题区
    renderContactTitle = () => {
        let contact = this.props.contact.contact;
        //默认联系人
        const isDefaultContact = contact.def_contancts === 'true';
        const defaultClassName = classNames('iconfont icon-contact-default', {'is-default-contact': isDefaultContact});
        const defaultTitle = isDefaultContact ? Intl.get('crm.119', '默认') : Intl.get('crm.detail.contact.default.set', '设为默认联系人');
        return (
            <span className="contact-item-title">
                <span className={defaultClassName} data-tracename="点击设置默认联系人按钮"
                    title={defaultTitle} onClick={this.setDefaultContact.bind(this, contact)}/>
                <span className="contact-name" title={contact.name}>{contact.name}</span>
                {contact.role || contact.department || contact.position ? (
                    <span className="contact-info">
                        <span className="contact-info-content" title={this.getContactInfo(contact)}>
                            {this.getContactInfo(contact)}
                        </span>
                    </span>) : null}
                {this.props.contact.isShowDeleteContactConfirm ? (
                    <span className="contact-delete-buttons">
                        <Button className="contact-delete-cancel delete-button-style"
                            onClick={this.hideDeleteContactModal}>
                            {Intl.get('common.cancel', '取消')}
                        </Button>
                        <Button className="contact-delete-confirm delete-button-style" onClick={this.deleteContact}>
                            {Intl.get('crm.contact.delete.confirm', '确认删除')}
                        </Button>
                    </span>) : (
                    <span className="contact-item-buttons">
                        {
                            this.props.disableEdit || !hasPrivilege(crmPrivilegeConst.CRM_DELETE_CONTACT) ? null : (
                                <span
                                    className="iconfont icon-delete handle-btn-item"
                                    title={Intl.get('common.delete', '删除')}
                                    data-tracename="点击删除联系人按钮"
                                    onClick={this.showDeleteContactConfirm}
                                />
                            )
                        }
                    </span>)}
            </span>);
    };

    saveContactInfo(property, saveObj, successFunc, errorFunc) {
        saveObj.property = property;
        saveObj.customer_id = _.get(this.props, 'contact.contact.customer_id', '');
        if (this.props.isMerge) {
            //合并重复客户时的处理
            this.props.updateMergeCustomerContact(saveObj);
        } else {
            contactAjax.editContact(saveObj).then(data => {
                if (data) {
                    if (_.isFunction(successFunc)) successFunc();
                    ContactAction.afterEditContact(saveObj);
                    let def_contancts = _.get(this.props, 'contact.contact.def_contancts');
                    //修改默认联系人的姓名、电话时，更新列表中的联系人数据
                    if (def_contancts === 'true' && (property === 'name' || property === 'phone')) {
                        //只有在客户列表中才有更新列表中联系人的方法
                        if (_.isFunction(this.props.updateCustomerDefContact)) {
                            this.props.updateCustomerDefContact(saveObj);
                        }
                    }
                } else {
                    if (_.isFunction(errorFunc)) errorFunc(Intl.get('crm.180', '添加联系人失败'));
                }
            }, errorMsg => {
                if (_.isFunction(errorFunc)) errorFunc(errorMsg || Intl.get('crm.180', '添加联系人失败'));
            });
        }
    }

    getRoleSelectOptions() {
        return _.map(ContactUtil.roleArray, (role, index) => {
            return (<Option value={role} key={index}>{role}</Option>);
        });
    }

    getSexSelectOptions() {
        return _.map(ContactUtil.sexArray, (sex, index) => {
            return (<Option key={index} value={sex}>{sex}</Option>);
        });
    }

    //获取当前已添加的电话列表
    getCurPhoneArray(that) {
        let formData = that.props.form.getFieldsValue();
        let phoneArray = [];
        // 有多个电话输入框时，是phone[0],phone[1]...,所以得循环获取
        _.each(_.get(formData,'phone',[]), (val) => {
            if(val) phoneArray.push(_.trim(val.replace('-', '')));
        });
        return phoneArray;
    }

    //获取联系人电话验证规则
    getPhoneInputValidateRules(that) {
        return [{
            validator: (rule, value, callback) => {
                value = _.trim(value);
                if (value) {
                    let phone = value.replace('-', '');
                    let contact = this.props.contact.contact;
                    let phoneArray = contact && _.isArray(contact.phone) ? contact.phone : [];
                    //获取当前已添加的电话列表
                    let curPhoneArray = this.getCurPhoneArray(that);
                    // 判断当前添加的电话列表中是否已存在该电话
                    let phoneCount = _.filter(curPhoneArray, (curPhone) => curPhone === phone);
                    let contactId = _.get(contact, 'id', '');
                    //该联系人原电话列表中不存在该电话
                    if (phoneArray.indexOf(phone) === -1) {
                        if (phoneCount.length > 1) {
                            //当前添加的电话列表已存在该电话，再添加时（重复添加）
                            callback(Intl.get('crm.83', '该电话已存在'));
                        } else {
                            //新加、修改后的该联系人电话列表中不存在的电话，进行唯一性验证
                            CrmAction.checkOnlyContactPhone(phone, data => {
                                if (_.isString(data)) {
                                    //唯一性验证出错了
                                    callback(Intl.get('crm.82', '电话号码验证出错'));
                                } else {
                                    if (_.isObject(data) && data.result === 'true') {
                                        callback();
                                    } else {
                                        //已存在
                                        let customer_name = _.get(data, 'list[0].name', '');
                                        customer_name = _.isEmpty(customer_name) ? '' : `"${customer_name}"`;
                                        callback(Intl.get('crm.repeat.phone.user', '该电话已被客户{userName}使用',{userName: customer_name}));
                                    }
                                }
                            },{contactId});
                        }
                    } else {//该联系人员电话列表中已存在该电话
                        if (phoneCount.length > 1) {
                            //该联系人中的电话列表已存在该电话，再添加时（重复添加）
                            callback(Intl.get('crm.83', '该电话已存在'));
                        } else {
                            // 该联系人原本的电话未做修改时（删除原本的，再添加上时）
                            callback();
                        }
                    }
                } else {
                    callback();
                }
            }
        }];
    }

    renderContactContent() {
        let contact = this.props.contact.contact;
        let isExpanded = this.props.contact.isExpanded;
        const EDIT_FEILD_WIDTH = 350;
        let hasEditPrivilege = hasPrivilege(crmPrivilegeConst.CRM_EDIT_CONTACT) && !this.props.disableEdit;
        return (
            <div className="contact-item-wrap">
                {isExpanded ? (
                    <div>
                        <div className="contact-item-content">
                            <span className="contact-label">{Intl.get('common.name', '姓名')}:</span>
                            <BasicEditInputField
                                width={EDIT_FEILD_WIDTH}
                                id={contact.id}
                                type="input"
                                field="name"
                                value={contact.name}
                                placeholder={Intl.get('crm.90', '请输入姓名')}
                                hasEditPrivilege={hasEditPrivilege}
                                saveEditInput={this.saveContactInfo.bind(this, 'name')}
                                noDataTip={Intl.get('crm.contact.name.none', '未添加姓名')}
                                addDataTip={Intl.get('crm.contact.name.add', '添加姓名')}
                                validators={[clueNameContactRule]}
                            />
                        </div>
                        <div className="contact-item-content">
                            <span className="contact-label">{Intl.get('crm.113', '部门')}:</span>
                            <BasicEditInputField
                                width={EDIT_FEILD_WIDTH}
                                id={contact.id}
                                type="input"
                                field="department"
                                value={contact.department}
                                placeholder={Intl.get('crm.contact.deparment.input', '请输入部门')}
                                hasEditPrivilege={hasEditPrivilege}
                                saveEditInput={this.saveContactInfo.bind(this, 'department')}
                                noDataTip={Intl.get('contract.68', '暂无部门')}
                                addDataTip={Intl.get('organization.add.department', '添加部门')}
                            />
                        </div>
                        <div className="contact-item-content">
                            <span className="contact-label">{Intl.get('crm.91', '职位')}:</span>
                            <BasicEditInputField
                                width={EDIT_FEILD_WIDTH}
                                id={contact.id}
                                type="input"
                                field="position"
                                value={contact.position}
                                placeholder={Intl.get('crm.114', '请输入职位')}
                                hasEditPrivilege={hasEditPrivilege}
                                saveEditInput={this.saveContactInfo.bind(this, 'position')}
                                noDataTip={Intl.get('crm.contact.positon.none', '未设置职位')}
                                addDataTip={Intl.get('crm.contact.positon.add', '设置职位')}
                            />
                        </div>
                        <div className="contact-item-content">
                            <span className="contact-label">{Intl.get('common.role', '角色')}:</span>
                            <BasicEditSelectField
                                width={EDIT_FEILD_WIDTH}
                                id={contact.id}
                                field="role"
                                displayText={contact.role}
                                value={contact.role}
                                placeholder={Intl.get('member.select.role', '请选择角色')}
                                hasEditPrivilege={hasEditPrivilege}
                                selectOptions={this.getRoleSelectOptions()}
                                validators={[{
                                    required: true,
                                    message: Intl.get('member.select.role', '请选择角色'),
                                }]}
                                saveEditSelect={this.saveContactInfo.bind(this, 'role')}
                                noDataTip={Intl.get('member.no.role', '暂无角色')}
                                addDataTip={Intl.get('user.setting.roles', '设置角色')}
                            />
                        </div>
                    </div>) : null}
                {this.props.hideContactWay ? null : (<div className="contact-item-content">
                    <DynamicAddDelField
                        id={contact.id}
                        field='phone'
                        value={contact.phone}
                        type='phone'
                        label={Intl.get('common.phone', '电话')}
                        hasEditPrivilege={hasEditPrivilege}
                        placeholder={Intl.get('crm.95', '请输入联系人电话')}
                        saveEditData={this.saveContactInfo.bind(this, 'phone')}
                        noDataTip={Intl.get('crm.contact.phone.none', '暂无电话')}
                        addDataTip={Intl.get('crm.contact.phone.add', '添加电话')}
                        contactName={contact.name}
                        renderItemSelfSettingContent={this.renderItemSelfSettingContent}
                        renderItemSelfSettingForm={this.renderItemSelfSettingForm}

                    />
                </div>)}
                {isExpanded ? (
                    <div>
                        {this.props.hideContactWay ? null : (<React.Fragment>
                            <div className="contact-item-content">
                                <DynamicAddDelField
                                    id={contact.id}
                                    field='qq'
                                    value={contact.qq}
                                    type='input'
                                    label={'QQ'}
                                    hasEditPrivilege={hasEditPrivilege}
                                    validateRules={[{
                                        message: Intl.get('common.correct.qq', '请输入正确的QQ号'),
                                        pattern: qqRegex,
                                    }]}
                                    placeholder={Intl.get('member.input.qq', '请输入QQ号')}
                                    saveEditData={this.saveContactInfo.bind(this, 'qq')}
                                    noDataTip={Intl.get('crm.contact.qq.none', '暂无QQ')}
                                    addDataTip={Intl.get('crm.contact.qq.add', '添加QQ')}
                                />
                            </div>
                            <div className="contact-item-content">
                                <DynamicAddDelField
                                    id={contact.id}
                                    field='weChat'
                                    value={contact.weChat}
                                    type='input'
                                    label={Intl.get('crm.58', '微信')}
                                    hasEditPrivilege={hasEditPrivilege}
                                    validateRules={[{validator: checkWechat}]}
                                    placeholder={Intl.get('member.input.wechat', '请输入微信号')}
                                    saveEditData={this.saveContactInfo.bind(this, 'weChat')}
                                    noDataTip={Intl.get('crm.contact.wechat.none', '暂无微信')}
                                    addDataTip={Intl.get('crm.contact.wechat.add', '添加微信')}
                                />
                            </div>
                            <div className="contact-item-content">
                                <DynamicAddDelField
                                    id={contact.id}
                                    field='email'
                                    value={contact.email}
                                    type='input'
                                    label={Intl.get('common.email', '邮箱')}
                                    validateRules={[{
                                        message: Intl.get('user.email.validate.tip', '请输入正确格式的邮箱'),
                                        pattern: emailRegex
                                    }]}
                                    hasEditPrivilege={hasEditPrivilege}
                                    placeholder={Intl.get('member.input.email', '请输入邮箱')}
                                    saveEditData={this.saveContactInfo.bind(this, 'email')}
                                    noDataTip={Intl.get('crm.contact.email.none', '暂无邮箱')}
                                    addDataTip={Intl.get('crm.contact.email.add', '添加邮箱')}
                                />
                            </div>
                        </React.Fragment>)}
                        <div className="contact-item-content">
                            <span className="contact-label">{Intl.get('crm.contact.sex', '性别')}:</span>
                            <BasicEditSelectField
                                width={EDIT_FEILD_WIDTH}
                                id={contact.id}
                                field="sex"
                                displayText={contact.sex}
                                value={contact.sex}
                                placeholder={Intl.get('crm.contact.sex.placeholder', '请选择性别')}
                                hasEditPrivilege={hasEditPrivilege}
                                selectOptions={this.getSexSelectOptions()}
                                validators={[{
                                    required: true,
                                    message: Intl.get('crm.contact.sex.placeholder', '请选择性别'),
                                }]}
                                saveEditSelect={this.saveContactInfo.bind(this, 'sex')}
                                noDataTip={Intl.get('crm.contact.sex.none', '未设置性别')}
                                addDataTip={Intl.get('crm.contact.sex.set', '设置性别')}
                            />
                        </div>
                        <div className="contact-item-content">
                            <span className="contact-label">{Intl.get('crm.contact.birthday', '生日')}:</span>
                            <BasicEditDateField
                                width={EDIT_FEILD_WIDTH}
                                id={contact.id}
                                field="birthday"
                                value={contact.birthday}
                                hasEditPrivilege={hasEditPrivilege}
                                saveEditDateInput={this.saveContactInfo.bind(this, 'birthday')}
                                disabledDate={disabledAfterToday}
                                noDataTip={Intl.get('crm.contact.birthday.none', '未设置生日')}
                                addDataTip={Intl.get('crm.contact.birthday.set', '设置生日')}
                            />
                        </div>
                        <div className="contact-item-content">
                            <span className="contact-label">{Intl.get('crm.contact.hobby', '爱好')}:</span>
                            <BasicEditInputField
                                width={EDIT_FEILD_WIDTH}
                                id={contact.id}
                                type="input"
                                field="hobby"
                                value={contact.hobby}
                                placeholder={Intl.get('crm.contact.hobby.placeholder', '请输入联系人的兴趣爱好')}
                                hasEditPrivilege={hasEditPrivilege}
                                saveEditInput={this.saveContactInfo.bind(this, 'hobby')}
                                noDataTip={Intl.get('crm.contact.hobby.none', '未添加爱好')}
                                addDataTip={Intl.get('crm.contact.hobby.add', '添加爱好')}
                            />
                        </div>
                        <div className="contact-item-content">
                            <span className="contact-label">{Intl.get('common.remark', '备注')}:</span>
                            <BasicEditInputField
                                width={EDIT_FEILD_WIDTH}
                                id={contact.id}
                                type="textarea"
                                field="remark"
                                value={contact.remark}
                                placeholder={Intl.get('user.input.remark', '请输入备注')}
                                hasEditPrivilege={hasEditPrivilege}
                                saveEditInput={this.saveContactInfo.bind(this, 'remark')}
                                noDataTip={Intl.get('crm.basic.no.remark', '暂无备注')}
                                addDataTip={Intl.get('crm.basic.add.remark', '添加备注')}
                            />
                        </div>
                    </div>
                ) : null}
            </div>
        );
    }

    render() {
        let containerClassName = classNames('contact-item-container', {
            'contact-delete-border': this.props.contact.isShowDeleteContactConfirm
        });
        return (
            <DetailCard
                title={this.renderContactTitle()}
                content={this.renderContactContent()}
                className={containerClassName}
                isShowToggleBtn={true}
                handleToggleDetail={this.toggleContactWay.bind(this)}
            />
        );
    }
}
ContactItem.propTypes = {
    customerId: PropTypes.string,
    contact: PropTypes.object,
    isMerge: PropTypes.bool,
    delMergeCustomerContact: PropTypes.func,
    updateCustomerDefContact: PropTypes.func,
    updateMergeCustomerContact: PropTypes.func,
    setMergeCustomerDefaultContact: PropTypes.func,
    disableEdit: PropTypes.bool,
    hideContactWay: PropTypes.bool,
};
export default ContactItem;

