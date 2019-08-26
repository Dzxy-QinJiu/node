import './customerLabel.less'
import {Tag} from 'antd'
import classNames from 'classnames';
const QUALIFIED = 1;
const HISTORY_QUALIFIED = 2;
class CustomerLabel extends React.Component{

//客户阶段标签组件
//import CustomerLabel from 'CMP_DIR/customer_label';
    
    getClassName(customer_label) {//根据传入label获取className
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
                'info-tag-style': customer_label === LABEL_TYPES.INFO_TAG,//信息
                'intent-tag-style': customer_label === LABEL_TYPES.INTENT_TAG,//意向
                'trial-tag-style': customer_label === LABEL_TYPES.TRIAL_TAG,//试用
                'sign-tag-style': customer_label === LABEL_TYPES.SIGN_TAG,//签约
                'qualified-tag-style': customer_label === QUALIFIED,//合格
                'history-qualified-tag-style': customer_label === HISTORY_QUALIFIED,//曾经合格
                'loss-tag-style': customer_label === LABEL_TYPES.LOSS_TAG,//流失
                're-contract-tag-style': customer_label === LABEL_TYPES.RE_CONTRACT,//续约
            });
        }
        return customerLabelCls;
    };

    getContent(customer_label){//根据label获取内容
        const  CUSTOMER_TAGS = {
            QUALIFIED: Intl.get('common.qualified', '合格'),
            HISTORY_QUALIFIED: Intl.get('common.history.qualified', '曾经合格'),
        };
        if(customer_label === QUALIFIED){
            return CUSTOMER_TAGS.QUALIFIED;
        }else if(customer_label === HISTORY_QUALIFIED){
            return CUSTOMER_TAGS.HISTORY_QUALIFIED;
        }else{
            return customer_label;
        }
    }


    render(){
        return(
            this.props.label?<Tag className={this.getClassName(this.props.label)}>{this.getContent(this.props.label)}</Tag>:null
        );
    }
}
CustomerLabel.propTypes = {
    label: PropTypes.string,//传入用户标签描述
}
export default CustomerLabel;