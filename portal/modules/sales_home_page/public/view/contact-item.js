/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/3/19.
 */
import {message} from "antd";
require("../css/contact-item.less");
import crmAjax from 'MOD_DIR/crm/public/ajax/index';
import Trace from "LIB_DIR/trace";
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
        }
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.contacts.id && nextProps.contacts.id !== this.state.contacts.id) {
            this.setState({
                contacts: nextProps.contacts
            })
        }
        if (nextProps.customerData.id && nextProps.customerData.id !== this.state.customerData.id) {
            this.setState({
                customerData: nextProps.customerData
            })
        }
        if (nextProps.callNumber !== this.state.callNumber) {
            this.setState({
                callNumber: nextProps.callNumber
            })
        }
    };

    // 自动拨号
    handleClickCallOut(phoneNumber, record) {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find(".column-contact-way"), "拨打电话");
        if (this.state.errMsg) {
            message.error(this.state.errMsg || Intl.get("crm.get.phone.failed", " 获取座机号失败!"));
        } else {
            if (this.state.callNumber) {
                phoneMsgEmitter.emit(phoneMsgEmitter.SEND_PHONE_NUMBER,
                    {
                        phoneNum: phoneNumber.replace('-', ''),
                        contact: record.contact,
                        customerDetail: record,//客户基本信息
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
    };

    renderContactsContent(contactDetail) {
        var record = this.state.customerData;
        if (this.props.itemType === "schedule") {
            record.name = record.customer_name;
            record.id = record.customer_id;
        }

        return (
            <div className="contact-content">
                <div className="pull-left contact-label">{Intl.get("call.record.contacts", "联系人")}:</div>
                {_.map(contactDetail, (contactItem, idx) => {
                    return (
                        <div className="contact-container">
                            {_.isArray(contactItem.phone) && contactItem.phone.length ?
                                <span className="phone-num-container">
                                {_.map(contactItem.phone, (phoneItem, index) => {
                                    var cls = classNames({
                                        "contact-name": contactItem.name
                                    });
                                    return (
                                        <span className="contact-item">
                                            {index === 0 ? <span className={cls}>
                                                <i className="iconfont icon-phone-busy"
                                                   title={Intl.get("crm.click.call.phone", "点击拨打电话")}
                                                   onClick={this.handleClickCallOut.bind(this, phoneItem, record)}
                                                   data-tracename="拨打电话"></i> {contactItem.name}
                                            </span> : null}
                                            {index !== 0 ? <i className="iconfont icon-phone-busy"></i> : null}
                                            <span className="phone-num">
                                                {phoneItem}
                                            </span>
                                        </span>
                                    )
                                })}
                            </span> : null}
                        </div>
                    )
                })}
            </div>
        )

    };

    render() {
        var contactDetail = this.state.contacts;
        return (
            <div className="recent-contacter-detail">
                {_.isArray(contactDetail) && contactDetail.length ? this.renderContactsContent(contactDetail) : null}
            </div>
        )
    }

}
ContactItem.defaultProps = {
    contacts: [],//联系人信息
    customerData: {},//客户信息
    itemType: "",
    callNumber: "",//座机号
};
export default ContactItem;