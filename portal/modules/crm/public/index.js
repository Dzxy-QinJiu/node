var util = require('./utils/contact-util');
let CustomerRepeat = require('./views/customer-repeat');
let CrmList = require('./crm-list');
import Trace from 'LIB_DIR/trace';

var CrmIndex = React.createClass({
    getInitialState: function() {
        return {
            isRepeatCustomerShow: false//是否展示客户查重界面
        };
    },
    componentDidMount: function() {
        $('body').css('overflow', 'hidden');
    },
    componentWillUnmount: function() {
        $('body').css('overflow', 'auto');
    },
    //展示重复客户界面的设置
    showRepeatCustomer: function() {
        Trace.traceEvent($(this.getDOMNode()).find('.filter-block .customer-repeat-btn'),'点击客户查重按钮');
        this.setState({
            isRepeatCustomerShow: true
        });
    },
    //关闭重复客户界面的设置
    closeRepeatCustomer: function() {
        this.setState({
            isRepeatCustomerShow: false
        });
    },
    render: function() {
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
});

module.exports = CrmIndex;
