/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/3/19.
 */
import {message} from 'antd';
require('../css/contact-item.less');
import crmAjax from 'MOD_DIR/crm/public/ajax/index';
import Trace from 'LIB_DIR/trace';
import {isEqualArray} from 'LIB_DIR/func';
var phoneMsgEmitter = require('PUB_DIR/sources/utils/emitters').phoneMsgEmitter;
import classNames from 'classnames';
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
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.column-contact-way'), '拨打电话');
        if (this.state.errMsg) {
            message.error(this.state.errMsg || Intl.get('crm.get.phone.failed', ' 获取座机号失败!'));
        } else {
            if (this.state.callNumber) {
                phoneMsgEmitter.emit(phoneMsgEmitter.SEND_PHONE_NUMBER,
                    {
                        contact: contactName,
                    }
                );
                let reqData = {
                    from: this.state.callNumber,
                    to: phoneNumber.replace('-', '')
                };
                crmAjax.callOut(reqData).then((result) => {
                    if (result.code === 0) {
                        message.success(Intl.get('crm.call.phone.success', '拨打成功'));
                    }
                }, (errMsg) => {
                    message.error(errMsg || Intl.get('crm.call.phone.failed', '拨打失败'));
                });
            } else {
                message.error(Intl.get('crm.bind.phone', '请先绑定分机号！'));
            }
        }
    }

    renderContactsContent(contactDetail) {
        var customerId = '';
        if (this.props.itemType === 'schedule') {
            customerId = this.state.customerData.customer_id;
        } else if (_.isArray(this.state.contacts) && this.state.contacts.length) {
            customerId = this.state.contacts[0].customer_id;
        }
        return (
            <div className="contact-content">
                {this.props.showContactLabel ? <div className="pull-left contact-label">{Intl.get('call.record.contacts', '联系人')}:</div> : null}
                {_.map(contactDetail, (contactItem, idx) => {
                    var contactName = $.trim(contactItem.name) || '';
                    return (
                        <div className="contact-container" key={idx}>
                            {_.isArray(contactItem.phone) && contactItem.phone.length ?
                                <span className="phone-num-container">
                                    {_.map(contactItem.phone, (phoneItem, index) => {
                                        var cls = classNames({
                                            'contact-name': contactItem.name
                                        });
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
                            {_.isArray(contactItem.email) && contactItem.email.length ?
                                <span className="email-container">
                                    {_.map(contactItem.email,(emailItem) => {
                                        return (
                                            <span className="contact-item">
                                                <i className="iconfont icon-email"></i>
                                                {emailItem}
                                            </span>
                                        );
                                    })}
                                </span>
                                : null}
                            {_.isArray(contactItem.QQ) && contactItem.QQ.length ?
                                <span className="qq-container">
                                    {_.map(contactItem.QQ,(qqItem) => {
                                        return (
                                            <span className="contact-item">
                                                <i className="iconfont icon-qq"></i>
                                                {qqItem}
                                            </span>
                                        );
                                    })}
                                </span>
                                : null}
                            {_.isArray(contactItem.weChat) && contactItem.weChat.length ?
                                <span className="weChat-container">
                                    {_.map(contactItem.weChat,(weChatItem) => {
                                        return (
                                            <span className="contact-item">
                                                <i className="iconfont icon-weChat"></i>
                                                {weChatItem}
                                            </span>
                                        );
                                    })}
                                </span>
                                : null}
                        </div>
                    );
                })}
            </div>
        );

    }

    render() {
        var contactDetail = this.state.contacts;
        return (
            _.isArray(contactDetail) && contactDetail.length ?
                <div className="recent-contacter-detail">
                    {this.renderContactsContent(contactDetail)}
                </div> : null
        );
    }

}
ContactItem.defaultProps = {
    contacts: [],//联系人信息
    customerData: {},//客户信息
    itemType: '',
    callNumber: '',//座机号
    showContactLabel: true,//是否展示联系人这几个字
    errMsg: ''
};
ContactItem.propTypes = {
    contacts: React.PropTypes.object,//联系人信息
    customerData: React.PropTypes.object,//客户信息
    itemType: React.PropTypes.string,
    callNumber: React.PropTypes.string,//座机号
    showContactLabel: React.PropTypes.bool,//是否展示联系人这几个字
    errMsg: React.PropTypes.string
};
export default ContactItem;