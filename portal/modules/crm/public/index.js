var React = require('react');
var util = require('./utils/contact-util');
let CustomerRepeat = require('./views/customer-repeat');
let CrmList = require('./crm-list');
import Trace from 'LIB_DIR/trace';

class CrmIndex extends React.Component {
    state = {
        isRepeatCustomerShow: false//是否展示客户查重界面
    };

    componentDidMount() {
        $('body').css('overflow', 'hidden');
    }

    componentWillUnmount() {
        $('body').css('overflow', 'auto');
    }

    //展示重复客户界面的设置
    showRepeatCustomer = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.filter-block .customer-repeat-btn'),'点击客户查重按钮');
        this.setState({
            isRepeatCustomerShow: true
        });
    };

    //关闭重复客户界面的设置
    closeRepeatCustomer = () => {
        this.setState({
            isRepeatCustomerShow: false
        });
    };

    render() {
        if (this.state.isRepeatCustomerShow) {
            return (
                <div data-tracename="重复客户列表">
                    <CustomerRepeat closeRepeatCustomer={this.closeRepeatCustomer}/>
                </div> );
        } else {
            return (
                <div data-tracename="客户管理">
                    <CrmList {...this.props} showRepeatCustomer={this.showRepeatCustomer}/>
                </div> );
        }

    }
}

module.exports = CrmIndex;

