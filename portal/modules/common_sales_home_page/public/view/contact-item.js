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
import PhoneCallout from 'CMP_DIR/phone-callout';
class ContactItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contacts: this.props.contacts,//联系人信息
            customerData: this.props.customerData,//客户详情
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
    }

    renderContactsContent(contactDetail) {
        return (
            <div className="contact-content">
                {this.props.showContactLabel ?
                    <div className="pull-left contact-label">{Intl.get('call.record.contacts', '联系人')}:</div> : null}
                {_.map(contactDetail, (contactItem, idx) => {
                    var contactName = _.trim(contactItem.name) || '';
                    var cls = classNames({
                        'contact-name': contactName
                    });
                    return (
                        <div className="contact-container" key={idx}>
                            {
                                this.props.isHideContactName ? null : (
                                    <span className={cls} title={contactName}>{contactName}</span>
                                )
                            }

                            {_.isArray(contactItem.phone) && contactItem.phone.length ?
                                <span className="phone-num-container">
                                    {_.map(contactItem.phone, (phoneItem, index) => {
                                        return (
                                            <PhoneCallout
                                                phoneNumber={phoneItem}
                                                contactName={contactName}
                                                showClueDetailPanel={this.props.showClueDetailPanel}
                                                hidePhoneIcon={this.props.hidePhoneIcon}
                                                id={this.props.id}
                                                type={this.props.type}
                                            />
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
        var cls = classNames('recent-contacter-detail',{'has-more-icon': this.props.hasMoreIcon});
        return (
            _.isArray(contactDetail) && contactDetail.length ?
                <div className={cls}>
                    {this.renderContactsContent(contactDetail)}
                </div> : null
        );
    }

}
ContactItem.defaultProps = {
    id: '',//日程对应线索id或客户id
    type: '',//客户还是线索的日程'customer'或lead
    contacts: [],//联系人信息
    customerData: {},//客户信息
    itemType: '',
    showContactLabel: true,//是否展示联系人这几个字
    hasMoreIcon: false,
    hidePhoneIcon: false,
    isHideContactName: false, // 默认不隐藏联系人信息
    showClueDetailPanel: function() {

    }
};
ContactItem.propTypes = {
    id: PropTypes.string,
    type: PropTypes.string,
    contacts: PropTypes.object,//联系人信息
    customerData: PropTypes.object,//客户信息
    itemType: PropTypes.string,
    showContactLabel: PropTypes.bool,//是否展示联系人这几个字
    hasMoreIcon: PropTypes.bool,
    showClueDetailPanel: PropTypes.func,
    hidePhoneIcon: PropTypes.bool,//是否展示电话图标
    isHideContactName: PropTypes.bool,
};
export default ContactItem;