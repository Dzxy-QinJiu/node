var React = require('react');
/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/3/19.
 */
require('../css/contact-item.less');
import Trace from 'LIB_DIR/trace';
import {isEqualArray} from 'LIB_DIR/func';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import {handleCallOutResult} from 'PUB_DIR/sources/utils/get-common-data-util';
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
        handleCallOutResult({
            errorMsg: this.state.errMsg,//获取坐席号失败的错误提示
            callNumber: this.state.callNumber,//坐席号
            contactName: contactName,//联系人姓名
            phoneNumber: phoneNumber,//拨打的电话
        });
    }

    renderContactsContent(contactDetail) {
        var customerId = '';
        if (this.props.itemType === 'schedule') {
            customerId = this.state.customerData.customer_id;
        } else if (_.isArray(this.state.contacts) && this.state.contacts.length) {
            customerId = this.state.contacts[0].customer_id;
        }
        var clsname = classNames('contact-item',{
            'inability': !this.state.callNumber,
        });
        return (
            <div className="contact-content">
                {this.props.showContactLabel ?
                    <div className="pull-left contact-label">{Intl.get('call.record.contacts', '联系人')}:</div> : null}
                {_.map(contactDetail, (contactItem, idx) => {
                    var contactName = $.trim(contactItem.name) || '';
                    var cls = classNames({
                        'contact-name': contactName
                    });
                    return (
                        <div className="contact-container" key={idx}>
                            <span className={cls}>{contactName}</span>
                            {_.isArray(contactItem.phone) && contactItem.phone.length ?
                                <span className="phone-num-container">
                                    {_.map(contactItem.phone, (phoneItem, index) => {
                                        return (
                                            <span className={clsname}
                                                onClick={this.handleClickCallOut.bind(this, phoneItem, contactName, customerId)}
                                                data-tracename="拨打电话">

                                                <i className="iconfont icon-phone-call-out"></i>
                                                <span className="phone-num">
                                                    {phoneItem}
                                                </span>
                                            </span>

                                        );
                                    })}
                                </span> : null}
                            {_.isArray(contactItem.email) && contactItem.email.length ?
                                <span className="email-container">
                                    {_.map(contactItem.email, (emailItem, index) => {
                                        return (
                                            <span className="contact-item">
                                                <i className="iconfont icon-email"></i>
                                                {emailItem}
                                            </span>
                                        );
                                    })}
                                </span>
                                : null}
                            {_.isArray(contactItem.QQ) && contactItem.QQ.length || _.isArray(contactItem.qq) && contactItem.qq.length ?
                                <span className="qq-container">
                                    {_.map(contactItem.QQ || contactItem.qq , (qqItem,index) => {
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
                                    {_.map(contactItem.weChat,(weChatItem, index) => {
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
    contacts: PropTypes.object,//联系人信息
    customerData: PropTypes.object,//客户信息
    itemType: PropTypes.string,
    callNumber: PropTypes.string,//座机号
    showContactLabel: PropTypes.bool,//是否展示联系人这几个字
    errMsg: PropTypes.string
};
export default ContactItem;