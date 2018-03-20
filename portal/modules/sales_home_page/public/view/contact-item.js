/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/3/19.
 */
require("../css/contact-item.less");
var userData = require("PUB_DIR/sources/user-data");
import crmAjax from 'MOD_DIR/crm/public/ajax/index';
class ContactItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contacts: this.props.contacts,
        }
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.contacts.id && nextProps.contacts.id !== this.state.contacts.id) {
            this.setState({
                contacts: nextProps.contacts
            })
        }
    };

    // 获取拨打电话的座机号
    getUserPhoneNumber() {
        let member_id = userData.getUserData().user_id;
        crmAjax.getUserPhoneNumber(member_id).then((result) => {
            if (result.phone_order) {
                this.setState({
                    callNumber: result.phone_order
                });
            }
        }, (errMsg) => {
            this.setState({
                errMsg: errMsg || Intl.get("crm.get.phone.failed", " 获取座机号失败!")
            });
        })
    };

    renderContactsContent(contactDetail) {
        return (
            <div className="contact-content">
                {_.map(contactDetail, (contactItem) => {
                    return (
                        <div className="contact-container">
                            {_.isArray(contactItem.phone) && contactItem.phone.length ?
                                <span className="phone-num-container">
                                {_.map(contactItem.phone, (phoneItem, index) => {
                                    return (
                                        <span className="contact-item">
                                            <i className="iconfont icon-phone-busy"></i>
                                            {index === 0 ? <span className="contact-name">
                                            {Intl.get("call.record.contacts", "联系人")}:{contactItem.name}
                                            </span> : null}
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
        // var defContacts = _.filter(contacts, (item) => {
        //     return item.def_contacts;
        // });
        // var contactDetail = [];
        // if (defContacts.length) {
        //     contactDetail = defContacts;
        // } else if (contacts.length) {
        //     contactDetail = contacts[0];
        // }
        return (
            <div className="recent-contacter-detail">
                {_.isArray(contactDetail) && contactDetail.length ? this.renderContactsContent(contactDetail) : null}
            </div>
        )
    }

}
ContactItem.defaultProps = {
    contactDetail: {},//联系人信息

};
export default ContactItem;