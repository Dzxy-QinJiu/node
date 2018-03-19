/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/3/19.
 */
require("../css/contact-item.less");
import {Popover,Button} from "antd";
class ContactItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contactDetail: this.props.contactDetail,
        }
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.contactDetail.id && nextProps.contactDetail.id !== this.state.contactDetail.id) {
            this.setState({
                contactDetail: nextProps.contactDetail
            })
        }
    };
    render(){
        var contacts = this.state.contactDetail;
        var defContacts = _.filter(contacts, (item) => {
            return item.def_contacts;
        });
        var contactDetail = [];
        if (defContacts.length) {
            contactDetail = defContacts;
        } else if (contacts.length) {
            contactDetail = contacts[0];
        }
        var content = (
            <div>
                <Button>{Intl.get("schedule.call.out", "拨打")}</Button>
            </div>
        );
        return (
            <div className="recent-contacter-detail">
                {Intl.get("call.record.contacts", "联系人")}:{contactDetail.name}
                {/*<Popover content={content}>*/}
                {_.isArray(contactDetail.phone) && contactDetail.phone.length ? contactDetail.phone.join(" ") : null}
                {/*</Popover>*/}
            </div>
        )
    }

}
ContactItem.defaultProps = {
    contactDetail: {},//联系人信息

};
export default ContactItem;