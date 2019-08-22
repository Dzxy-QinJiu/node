/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/3/19.
 */
require('../css/new-distribute-customer.less');
import {Tag} from 'antd';
import crmUtil from 'MOD_DIR/crm/public/utils/crm-util';
import CustomerLabel from 'CMP_DIR/customer_label';
class NewDistributeCustomer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            newDistributeCustomer: this.props.newDistributeCustomer
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.newDistributeCustomer.id && nextProps.newDistributeCustomer.id !== this.state.newDistributeCustomer.id) {
            this.setState({
                newDistributeCustomer: nextProps.newDistributeCustomer
            });
        }
    }

    openCustomerDetail(customer_id) {
        this.props.openCustomerDetail(customer_id);
    }

    render() {
        var newDistributeCustomer = this.state.newDistributeCustomer;
        return (
            <div className="new-distribute-customer customer-detail-item">
                <div className="new-distribute-customer-title">
                        <CustomerLabel className={newDistributeCustomer.qualify_label} 
                        content={newDistributeCustomer.qualify_label == 1 ? crmUtil.CUSTOMER_TAGS.QUALIFIED :
                            newDistributeCustomer.qualify_label == 2 ? crmUtil.CUSTOMER_TAGS.HISTORY_QUALIFIED : ''}/>
                        <CustomerLabel className={newDistributeCustomer.customer_label} content={newDistributeCustomer.customer_label}/>
                    }
                    <span className="sale-home-customer-name" onClick={this.openCustomerDetail.bind(this, newDistributeCustomer.id)} data-tracename="打开客户详情">{newDistributeCustomer.customer_name || newDistributeCustomer.name}</span>
                </div>
            </div>
        );
    }
}
NewDistributeCustomer.defaultProps = {
    newDistributeCustomer: {},
    openCustomerDetail: function() {

    }

};
export default NewDistributeCustomer;