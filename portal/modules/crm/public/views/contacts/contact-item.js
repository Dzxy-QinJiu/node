import {Button, message} from "antd";
var BootstrapButton = require("react-bootstrap").Button;
var ContactUtil = require("../../utils/contact-util");
var ContactAction = require("../../action/contact-action");
var Modal = require("react-bootstrap").Modal;
var Spinner = require('../../../../../components/spinner');
import {addHyphenToPhoneNumber} from "LIB_DIR/func";
import Trace from "LIB_DIR/trace";
import crmAjax from '../../ajax/index';
import CrmAction from "../../action/crm-actions";
var phoneMsgEmitter = require("PUB_DIR/sources/utils/emitters").phoneMsgEmitter;
import DetailCard from "CMP_DIR/detail-card";
import {DetailEditBtn} from "CMP_DIR/rightPanel";
import classNames from "classnames";
var ContactItem = React.createClass({
    getInitialState: function () {
        return {
            isLoading: false
        };
    },
    getDefaultProps: function () {
        return {
            contact: ContactUtil.getEmptyViewContactObject()
        };
    },
    showEditContactForm: function () {
        Trace.traceEvent(this.getDOMNode(), "编辑联系人");
        ContactAction.showEditContactForm(this.props.contact);
    },
    showDeleteContactConfirm: function () {
        Trace.traceEvent(this.getDOMNode(), "删除联系人");
        ContactAction.showDeleteContactConfirm(this.props.contact);
    },
    setDefaultContact: function (contact) {
        if (contact.def_contancts === "true") return;
        if (this.props.isMerge) {
            this.props.setMergeCustomerDefaultContact(this.props.contact.contact.id);
        } else {
            this.setState({isLoading: true});
            ContactAction.toggleDefaultContact(this.props.contact.contact, (result) => {
                this.setState({isLoading: false});
                if (_.isObject(result) && result.code === 0) {
                    message.success(Intl.get("crm.117", "修改默认联系人成功"));
                    //修改默认联系人的信息时，更新列表中的联系人数据
                    this.props.contact.contact.def_contancts = "true";
                    this.props.updateCustomerDefContact(this.props.contact.contact);
                } else {
                    message.error(Intl.get("crm.118", "修改默认联系人失败"));
                }
            });
        }
    },
    hideDeleteContactModal: function () {
        Trace.traceEvent(this.getDOMNode(), "取消删除联系人");
        ContactAction.hideDeleteContactConfirm(this.props.contact);
    },
    deleteContact: function () {
        if (this.props.isMerge) {
            this.props.delMergeCustomerContact(this.props.contact.contact.id);
            ContactAction.hideDeleteContactConfirm(this.props.contact.contact);
        } else {
            Trace.traceEvent(this.getDOMNode(), "确认删除联系人");
            let customerId = this.props.contact.contact.customer_id;
            ContactAction.deleteContact(this.props.contact, () => {
                this.props.refreshCustomerList(customerId);
            });
        }
    },

    // 自动拨号
    handleClickCallOut(phone) {
        Trace.traceEvent(this.getDOMNode(), "拨打电话");
        if (this.props.getCallNumberError) {
            message.error(this.props.getCallNumberError || Intl.get("crm.get.phone.failed", "获取座机号失败!"));
        } else {
            if (this.props.callNumber) {
                var contact = "";
                if (this.props.contact && this.props.contact.contact) {
                    contact = this.props.contact.contact.name;
                }
                var curCustomer = this.props.curCustomer;
                phoneMsgEmitter.emit(phoneMsgEmitter.SEND_PHONE_NUMBER,
                    {
                        phoneNum: phone.replace('-', ''),
                        contact: contact,
                        customerDetail: curCustomer,//客户基本信息
                    }
                );
                let reqData = {
                    from: this.props.callNumber,
                    to: phone
                };
                crmAjax.callOut(reqData).then((result) => {
                    if (result.code == 0) {
                        message.success('拨打成功！');
                    }
                }, (errMsg) => {
                    message.error(errMsg || '拨打失败！');
                });
            } else {
                message.error(Intl.get("crm.bind.phone", "请先绑定分机号！"));
            }
        }
    },

    renderItem: function () {
        var contact = this.props.contact;
        //联系方式-电话
        var contactWayPhone = contact.contact.phone && contact.contact.phone[0] ? contact.contact.phone.map((phone) => {
            return (
                <dl>
                    <dt><ReactIntl.FormattedMessage id="common.phone" defaultMessage="电话"/>：</dt>
                    <dd>
                        {addHyphenToPhoneNumber(phone)}
                        {this.props.callNumber ? <i className="iconfont icon-call-out call-out"
                                                    title={Intl.get("crm.click.call.phone", "点击拨打电话")}
                                                    onClick={this.handleClickCallOut.bind(this, phone)}></i> : null}
                    </dd>
                </dl>
            );
        }) : "";
        //联系方式-QQ
        var contactWayQQ = contact.contact.qq && contact.contact.qq[0] ? contact.contact.qq.map(function (qq) {
            return (
                <dl>
                    <dt>QQ：</dt>
                    <dd>{qq}</dd>
                </dl>
            );
        }) : "";
        //联系方式-微信
        var contactWayWeChat = contact.contact.weChat && contact.contact.weChat[0] ? contact.contact.weChat.map(function (weChat) {
            return (
                <dl>
                    <dt><ReactIntl.FormattedMessage id="crm.58" defaultMessage="微信"/>：</dt>
                    <dd>{weChat}</dd>
                </dl>
            );
        }) : "";
        //联系方式-邮箱
        var contactWayEmail = contact.contact.email && contact.contact.email[0] ? contact.contact.email.map(function (email) {
            return (
                <dl>
                    <dt><ReactIntl.FormattedMessage id="common.email" defaultMessage="邮箱"/>：</dt>
                    <dd>{email}</dd>
                </dl>
            );
        }) : "";

        return (
            <div className="contact-modal-container">
                {defaultContactSection}
                <div className="clearfix crm-contact-item">
                    <div className="crm-contact-operate">
                        <div className="iconfont circle-button icon-update" onClick={this.showEditContactForm}></div>
                        <div className="iconfont circle-button icon-delete"
                             onClick={this.showDeleteContactConfirm}></div>
                        {
                            contact.contact.def_contancts == "true" ? "" : (
                                <Button type="primary" size="small"
                                        onClick={this.toggleDefaultContact}
                                        data-tracename="点击设置默认联系人按钮"
                                >{Intl.get("crm.119", "默认")}</Button>
                            )
                        }
                    </div>
                    <div className="crm-contact-line"></div>
                    <div className="pull-left contact-left col-md-5">
                        <dl>
                            <dt><ReactIntl.FormattedMessage id="call.record.contacts" defaultMessage="联系人"/> :</dt>
                            <dd>{contact.contact.name}</dd>
                        </dl>
                        <dl>
                            <dt>{Intl.get("crm.113", "部门")} :</dt>
                            <dd>{contact.contact.department}</dd>
                        </dl>
                        <dl>
                            <dt>{Intl.get("crm.91", "职位")} :</dt>
                            <dd>{contact.contact.position}</dd>
                        </dl>
                        <dl>
                            <dt>{Intl.get("user.apply.detail.table.role", "角色")} :</dt>
                            <dd>{contact.contact.role}</dd>
                        </dl>
                    </div>
                    <div className="pull-right contact-right col-md-7">
                        {contactWayPhone}
                        {contactWayQQ}
                        {contactWayWeChat}
                        {contactWayEmail}
                    </div>
                    <Modal
                        show={contact.isShowDeleteContactConfirm}
                        onHide={this.hideDeleteContactModal}
                        container={this}
                        aria-labelledby="contained-modal-title"
                    >
                        <Modal.Header closeButton>
                            <Modal.Title />
                        </Modal.Header>
                        <Modal.Body>
                            <p><ReactIntl.FormattedMessage id="crm.120" defaultMessage="是否删除此联系人"/>？</p>
                        </Modal.Body>
                        <Modal.Footer>
                            <BootstrapButton className="btn-ok" onClick={this.deleteContact}><ReactIntl.FormattedMessage
                                id="common.sure" defaultMessage="确定"/></BootstrapButton>
                            <BootstrapButton className="btn-cancel"
                                             onClick={this.hideDeleteContactModal}><ReactIntl.FormattedMessage
                                id="common.cancel" defaultMessage="取消"/></BootstrapButton>
                        </Modal.Footer>
                    </Modal>

                    {
                        this.state.isLoading ?
                            (<Spinner className="isloading"/>) :
                            (null)
                    }

                </div>
            </div>
        );
    },
    //展开、收起联系方式的处理
    toggleContactWay(){
        ContactAction.toggleContactWay(this.props.contact);
    },
    //获取联系人的角色、职位、部门信息
    getContactInfo(contact){
        let contactInfo = "";
        if (contact.role) {
            contactInfo += contact.role;
        }
        if (contact.role && contact.department) {
            contactInfo += "-";
        }
        if (contact.department) {
            contactInfo += contact.department;
        }
        if (contact.department && contact.position || contact.role && contact.position) {
            contactInfo += "-";
        }
        if (contact.position) {
            contactInfo += contact.position;
        }
        return contactInfo;
    },
    //渲染联系人标题区
    renderContactTitle(){
        let contact = this.props.contact.contact;
        let isExpanded = this.props.contact.isExpanded;
        //默认联系人
        const isDefaultContact = contact.def_contancts === "true";
        const defaultClassName = classNames("iconfont icon-contact-default", {"is-default-contact": isDefaultContact});
        const defaultTitle = isDefaultContact ? Intl.get("crm.119", "默认") : Intl.get("crm.detail.contact.default.set", "设为默认联系人");
        //联系方式展开、收起
        const contactWayClassName = classNames("iconfont", {
            "icon-up-twoline": isExpanded,
            "icon-down-twoline": !isExpanded
        });
        return (
            <span className="contact-item-title">
                <span className={defaultClassName} data-tracename="点击设置默认联系人按钮"
                      title={defaultTitle} onClick={this.setDefaultContact.bind(this, contact)}/>
                <span className="contact-name" title={contact.name}>{contact.name}</span>
                {contact.role || contact.department || contact.position ? (
                    <span className="contact-info">
                        (
                        <span className="contact-info-content" title={this.getContactInfo(contact)}>
                            {this.getContactInfo(contact)}
                        </span>
                        )
                    </span>) : null}
                <span className="contact-item-buttons">
                    <span className="iconfont icon-delete" title={Intl.get("common.delete", "删除")}
                          data-tracename="点击删除联系人按钮"
                          onClick={this.showDeleteContactConfirm}/>
                    <DetailEditBtn title={Intl.get("common.edit", "编辑")} onClick={this.showEditContactForm}
                                   data-tracename="点击编辑联系人按钮"/>
                    <span className={contactWayClassName}
                          data-tracename={isExpanded ? "收起联系方式" : "展开联系方式"}
                          title={isExpanded ? Intl.get("crm.basic.detail.hide", "收起详情") : Intl.get("crm.basic.detail.show", "展开详情")}
                          onClick={this.toggleContactWay}/>
                </span>
            </span>);
    },
    //是否有某种联系方式（电话、qq、微信、邮箱）
    hasContactWay(contact, type){
        return contact[type] && _.isArray(contact[type]) && contact[type].length;
    },


    //渲染联系方式展示区
    renderContactWay(){
        let contact = this.props.contact.contact;
        return (<div className="contact-way-container">
            <div className="contact-way-phone contact-way-type">
                <div className="iconfont icon-phone-call-out contact-way-icon" title={Intl.get("common.phone", "电话")}/>
                <div className="contact-phone-content contact-way-content">
                    {this.hasContactWay(contact, "phone") ? _.map(contact.phone, phone => {
                        return ( <div className="contact-phone-item contact-way-item">
                            <span className="contact-phone contact-way-text">{addHyphenToPhoneNumber(phone)}</span>
                            {this.props.callNumber ? (
                                <span className="phone-call-button" onClick={this.handleClickCallOut.bind(this, phone)}>
                                    {Intl.get("schedule.call.out", "拨打")}
                                </span>) : null}
                        </div>);
                    }) : null}
                </div>
            </div>
            {this.props.contact.isExpanded ? ( <div className="contact-way-other">
                <div className="contact-way-qq contact-way-type">
                    <div className="iconfont icon-qq contact-way-icon" title="QQ"/>
                    <div className="contact-qq-content contact-way-content">
                        {this.hasContactWay(contact, "qq") ? _.map(contact.qq, qq => {
                            return ( <div className="contact-qq-item contact-way-item">
                                <span className="contact-qq contact-way-text">{qq}</span>
                            </div>);
                        }) : null}
                    </div>
                </div>
                <div className="contact-way-weChat contact-way-type">
                    <div className="iconfont icon-weChat contact-way-icon" title={Intl.get("crm.58", "微信")}/>
                    <div className="contact-weChat-content contact-way-content">
                        {this.hasContactWay(contact, "weChat") ? _.map(contact.weChat, weChat => {
                            return ( <div className="contact-weChat-item contact-way-item">
                                <span className="contact-weChat contact-way-text">{weChat}</span>
                            </div>);
                        }) : null}
                    </div>
                </div>
                <div className="contact-way-email contact-way-type">
                    <div className="iconfont icon-email contact-way-icon"
                         title={Intl.get("common.email", "邮箱")}/>
                    <div className="contact-email-content contact-way-content">
                        {this.hasContactWay(contact, "email") ? _.map(contact.email, email => {
                            return ( <div className="contact-email-item contact-way-item">
                                <span className="contact-email contact-way-text">{email}</span>
                            </div>);
                        }) : null}
                    </div>
                </div>
            </div>) : null}
        </div>);
    },
    render(){
        return (<DetailCard title={this.renderContactTitle()}
                            content={this.renderContactWay()}
                            className="contact-item-container"/>);
    }
});

module.exports = ContactItem;
