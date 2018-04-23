/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/3/19.
 */
import {message} from "antd";
require("../css/contact-item.less");
import crmAjax from 'MOD_DIR/crm/public/ajax/index';
import Trace from "LIB_DIR/trace";
import {isEqualArray} from "LIB_DIR/func";
var phoneMsgEmitter = require("PUB_DIR/sources/utils/emitters").phoneMsgEmitter;
import classNames from "classnames";
class ContactItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contacts: this.props.contacts,//联系人信息
            customerData: this.props.customerData,//客户详情
            callNumber: this.props.callNumber,//座机号
            errMsg: this.props.errMsg//获取座机号失败的提示
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.contacts && !isEqualArray(nextProps.contacts, this.state.contacts)) {
            this.setState({
                contacts: nextProps.contacts
            });
        }
        if (nextProps.customerData.id && nextProps.customerData.id !== this.state.customerData.id) {
            this.setState({
                customerData: nextProps.customerData
            });
        }
        if (nextProps.callNumber !== this.state.callNumber) {
            this.setState({
                callNumber: nextProps.callNumber
            });
        }
    }

    // 自动拨号
    handleClickCallOut(phoneNumber, contactName, customerId) {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find(".column-contact-way"), "拨打电话");
        if (this.state.errMsg) {
            message.error(this.state.errMsg || Intl.get("crm.get.phone.failed", " 获取座机号失败!"));
        } else {
            if (this.state.callNumber) {
                phoneMsgEmitter.emit(phoneMsgEmitter.SEND_PHONE_NUMBER,
                    {
                        phoneNum: phoneNumber.replace('-', ''),
                        contact: contactName,
                        customerId: customerId,//客户基本信息
                    }
                );
                let reqData = {
                    from: this.state.callNumber,
                    to: phoneNumber.replace('-', '')
                };
                crmAjax.callOut(reqData).then((result) => {
                    if (result.code == 0) {
                        message.success(Intl.get("crm.call.phone.success", "拨打成功"));
                    }
                }, (errMsg) => {
                    message.error(errMsg || Intl.get("crm.call.phone.failed", "拨打失败"));
                });
            } else {
                message.error(Intl.get("crm.bind.phone", "请先绑定分机号！"));
            }
        }
    }

    renderContactsContent(contactDetail) {
        var customerId = "";
        if (this.props.itemType === "schedule") {
            customerId = this.state.customerData.customer_id;
        } else if (_.isArray(this.state.contacts) && this.state.contacts.length) {
            customerId = this.state.contacts[0].customer_id;
        }
        return (
            <div className="contact-content">
                <div className="pull-left contact-label">{Intl.get("call.record.contacts", "联系人")}:</div>
                {_.map(contactDetail, (contactItem, idx) => {
                    var contactName = $.trim(contactItem.name) || "";
                    return (
                        <div className="contact-container">
                            {_.isArray(contactItem.phone) && contactItem.phone.length ?
                                <span className="phone-num-container">
                                {_.map(contactItem.phone, (phoneItem, index) => {
                                    var cls = classNames({
                                        "contact-name": contactItem.name
                                    });
                                    var text = <span className="call-out-tip"><i
                                        className="iconfont icon-phone-call-out-tip"></i>{Intl.get("common.sales.frontpage.click.phone", "点击即可拨打。")}</span>;
                                    return (
                                        <span className="contact-item"
                                              onClick={this.handleClickCallOut.bind(this, phoneItem, contactName, customerId)}
                                              data-tracename="拨打电话">
                                            {index === 0 && contactName ? <span className={cls}>
                                                <i className="iconfont icon-phone-call-out"></i>{contactName}</span> :
                                                <i className="iconfont icon-phone-call-out"></i>}
                                            <span className="phone-num">
                                                {phoneItem}
                                            </span>
                                        </span>
                                    );
                                })}
                            </span> : null}
                        </div>
                    );
                })}
            </div>
        );

    }

    render() {
        var contactDetail = this.state.contacts;
        return (
            <div className="recent-contacter-detail">
                {_.isArray(contactDetail) && contactDetail.length ? this.renderContactsContent(contactDetail) : null}
            </div>
        );
    }

}
ContactItem.defaultProps = {
    contacts: [],//联系人信息
    customerData: {},//客户信息
    itemType: "",
    callNumber: "",//座机号
};
export default ContactItem;