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
    toggleDefaultContact: function () {
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

    render: function () {
        var contact = this.props.contact;
        //默认联系人区域
        var defaultContactSection = contact.contact.def_contancts == "true" ? (
            <div className="crm-contact-default">
                <span><ReactIntl.FormattedMessage id="crm.119" defaultMessage="默认"/></span>
            </div>
        ) : null;
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
    }
});

module.exports = ContactItem;
