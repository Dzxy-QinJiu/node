/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/3/16.
 */
require('../css/will-expire-customer.less');
import ContactItem from './contact-item';
class WillExpireItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            expireItem: this.props.expireItem,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.expireItem.customer_id && nextProps.expireItem.customer_id !== this.state.expireItem.customer_id) {
            this.setState({
                expireItem: nextProps.expireItem
            });
        }
    }

    openCustomerDetail = (customer_id) => {
        this.props.openCustomerDetail(customer_id);
    };

    render() {
        var expireItem = this.state.expireItem;
        return (
            <div className="will-expire-container customer-detail-item">
                <div className="will-customer-title">
                    <span className="sale-home-customer-name"
                        onClick={this.openCustomerDetail.bind(this, expireItem.customer_id)} data-tracename="打开客户详情">
                        {expireItem.customer_name}
                    </span>
                </div>
                <div className="will-customer-content">
                    {Intl.get('common.sales.fronpage.user.login', '{relativedata}有应用到期', {
                        relativedata: this.props.willExpiredTime
                    })}
                </div>
                {_.isArray(expireItem.contact_list) && expireItem.contact_list.length ? <ContactItem
                    contacts={expireItem.contact_list}
                    type='customer'
                    id={_.get(expireItem, 'customer_id','')}
                /> : null}
            </div>
        );
    }
}
WillExpireItem.defaultProps = {
    expireItem: {},
    openCustomerDetail: function() {

    },
    willExpiredTime: ''//即将到期的时间


};
export default WillExpireItem;