/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/3/19.
 */
require("../css/new-distribute-customer.less");
import {Tag} from "antd";
import crmUtil from "MOD_DIR/crm/public/utils/crm-util";
class NewDistributeCustomer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            newDistributeCustomer: this.props.newDistributeCustomer
        }
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.newDistributeCustomer.id && nextProps.newDistributeCustomer.id !== this.state.newDistributeCustomer.id) {
            this.setState({
                newDistributeCustomer: nextProps.newDistributeCustomer
            })
        }
    };

    render() {
        var expireItem = this.state.newDistributeCustomer;
        return (
            <div className="new-distribute-customer">
                <div className="new-distribute-customer-title">
                    {expireItem.customer_label ? (
                        <Tag
                            className={crmUtil.getCrmLabelCls(expireItem.customer_label)}>
                            {expireItem.customer_label}</Tag>) : null
                    }
                    {expireItem.qualify_label ? (
                        <Tag className={crmUtil.getCrmLabelCls(expireItem.qualify_label)}>
                            {expireItem.qualify_label == 1 ? crmUtil.CUSTOMER_TAGS.QUALIFIED :
                                expireItem.qualify_label == 2 ? crmUtil.CUSTOMER_TAGS.HISTORY_QUALIFIED : ""}</Tag>) : null}
                    {expireItem.name}
                </div>
            </div>
        )
    }
}
NewDistributeCustomer.defaultProps = {
    newDistributeCustomer: {}

};
export default NewDistributeCustomer;