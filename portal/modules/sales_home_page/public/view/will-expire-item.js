/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/3/16.
 */
require("../css/will-expire-customer.less");
import contactItem from "./contact-item";
class WillExpireItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            expireItem: this.props.expireItem
        }
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.expireItem.customer_id && nextProps.expireItem.customer_id !== this.state.expireItem.customer_id) {
            this.setState({
                expireItem: nextProps.expireItem
            })
        }
    };

    render() {
        var expireItem = this.state.expireItem;
        return (
            <div className="will-expire-container">
                <div className="will-customer-title">
                    {expireItem.customer_name}
                </div>
                <div className="will-customer-content">
                    {_.map(expireItem.app_list, (item) => {
                        return (
                            <div className="app-item">
                                <div className="pull-left customer-name">
                                    {item.app_name}
                                </div>
                                <div className="pull-left delay-time">
                                    {moment(expireItem.end_time).format(oplateConsts.DATE_TIME_FORMAT)}试用到期停用
                                </div>
                            </div>
                        )
                    })}
                </div>
                <contactItem
                    contactDetail= {"yyy"}
                />
            </div>
        )
    }
}
WillExpireItem.defaultProps = {
    expireItem: {}

};
export default WillExpireItem;