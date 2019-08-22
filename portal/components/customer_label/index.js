import './customerLabel.less'
import {Tag} from 'antd'
import classNames from 'classnames';
class CustomerLabel extends React.Component{
    getCrmLabelCls = function(customer_label) {
        const LABEL_TYPES = {
            INFO_TAG: '信息',
            INTENT_TAG: '意向',
            TRIAL_TAG: '试用',
            SIGN_TAG: '签约',
            LOSS_TAG: '流失',
            RE_CONTRACT: '续约'
        };
        let customerLabelCls = 'customer-label';
        if (customer_label) {
            customerLabelCls = classNames(customerLabelCls, {
                'info-tag-style': customer_label === LABEL_TYPES.INFO_TAG,
                'intent-tag-style': customer_label === LABEL_TYPES.INTENT_TAG,
                'trial-tag-style': customer_label === LABEL_TYPES.TRIAL_TAG,
                'sign-tag-style': customer_label === LABEL_TYPES.SIGN_TAG,
                'qualified-tag-style': customer_label === 1,//合格
                'history-qualified-tag-style': customer_label === 2,//曾经合格
                'loss-tag-style': customer_label === LABEL_TYPES.LOSS_TAG,
                're-contract-tag-style': customer_label === LABEL_TYPES.RE_CONTRACT,
            });
        }
        return customerLabelCls;
    };

    render(){
        return(
            this.props.className?<Tag className={this.getCrmLabelCls(this.props.className)}>{this.props.content}</Tag>:null
        );
    }
}
module.exports = CustomerLabel;
//客户阶段标签组件(className content)
//import CustomerLabel from 'CMP_DIR/customer_label';