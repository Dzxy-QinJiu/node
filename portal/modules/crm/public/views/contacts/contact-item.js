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
                    if (_.isFunction(this.props.updateCustomerDefContact)) {
                        this.props.updateCustomerDefContact(this.props.contact.contact);
                    }
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
                // phoneMsgEmitter.emit(phoneMsgEmitter.SEND_PHONE_NUMBER,
                //     {
                //         phoneNum: phone.replace('-', ''),
                //         contact: contact,
                //         customerDetail: curCustomer,//客户基本信息
                //     }
                // );
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
                {this.props.contact.isShowDeleteContactConfirm ? (
                    <span className="contact-delete-buttons">
                        <Button className="contact-delete-cancel delete-button-style"
                                onClick={this.hideDeleteContactModal}>
                            {Intl.get("common.cancel", "取消")}
                        </Button>
                        <Button className="contact-delete-confirm delete-button-style" onClick={this.deleteContact}>
                            {Intl.get("crm.contact.delete.confirm", "确认删除")}
                        </Button>
                    </span>) : (
                    <span className="contact-item-buttons">
                        <span className="iconfont icon-delete" title={Intl.get("common.delete", "删除")}
                              data-tracename="点击删除联系人按钮"
                              onClick={this.showDeleteContactConfirm}/>
                        <DetailEditBtn title={Intl.get("common.edit", "编辑")} onClick={this.showEditContactForm}
                                       data-tracename="点击编辑联系人按钮"/>
                        <span className={contactWayClassName}
                              data-tracename={isExpanded ? "收起联系方式" : "展开其他联系方式"}
                              title={isExpanded ? Intl.get("crm.contact.way.hide", "收起") : Intl.get("crm.contact.way.show", "展开其他联系方式")}
                              onClick={this.toggleContactWay}/>
                    </span>)}
            </span>);
    },
    //是否有某种联系方式（电话、qq、微信、邮箱）
    hasContactWay(contact, type){
        return contact[type] && _.isArray(contact[type]) && contact[type].length;
    },

    renderContactWayContent (contact, type) {
        return this.hasContactWay(contact, type) ? _.map(contact[type], item => {
            return ( <div className="contact-way-item">
                <span className="contact-way-text">{addHyphenToPhoneNumber(item)}</span>
                {type === "phone" && this.props.callNumber ? (
                    <span className="phone-call-button" onClick={this.handleClickCallOut.bind(this, item)}>
                                    {Intl.get("schedule.call.out", "拨打")}
                                </span>) : null}
            </div>);
        }) : null;
    },

    //渲染联系方式展示区
    renderContactWay(){
        let contact = this.props.contact.contact;
        return (<div className="contact-way-container">
            <div className="contact-way-type">
                <div className="iconfont icon-phone-call-out contact-way-icon" title={Intl.get("common.phone", "电话")}/>
                <div className="contact-phone-content contact-way-content">
                    {this.renderContactWayContent(contact, "phone")}
                </div>
            </div>
            {this.props.contact.isExpanded ? ( <div className="contact-way-other">
                <div className="contact-way-type">
                    <div className="iconfont icon-qq contact-way-icon" title="QQ"/>
                    <div className="contact-way-content">
                        {this.renderContactWayContent(contact, "qq")}
                    </div>
                </div>
                <div className="contact-way-type">
                    <div className="iconfont icon-weChat contact-way-icon" title={Intl.get("crm.58", "微信")}/>
                    <div className="contact-way-content">
                        {this.renderContactWayContent(contact, "weChat")}
                    </div>
                </div>
                <div className="contact-way-type">
                    <div className="iconfont icon-email contact-way-icon"
                         title={Intl.get("common.email", "邮箱")}/>
                    <div className="contact-way-content">
                        {this.renderContactWayContent(contact, "email")}
                    </div>
                </div>
            </div>) : null}
        </div>);
    },
    render(){
        let containerClassName = classNames("contact-item-container", {
            "contact-delete-border": this.props.contact.isShowDeleteContactConfirm
        });
        return (<DetailCard title={this.renderContactTitle()}
                            content={this.renderContactWay()}
                            className={containerClassName}/>);
    }
});

module.exports = ContactItem;
