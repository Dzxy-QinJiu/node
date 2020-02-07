var React = require('react');
var util = require('./utils/contact-util');
let CustomerRepeat = require('./views/customer-repeat');
let CrmList = require('./crm-list');
import Trace from 'LIB_DIR/trace';
import CustomerRecycleBin from './views/customer-recycle-bin';
import CustomerPool from './views/customer-pool';
import {crmManagementEmitter} from 'OPLATE_EMITTER';
//各视图类型常量
const VIEW_TYPE = {
    CUSTOMER: 'customer',//客户列表视图
    REPEAT_CUSTOMER: 'repeat_customer',//重复客户视图
    RECYCLE_BIN_CUSTOMER: 'recycle_bin_customer',//回收站视图
    CUSTOMER_POOL: 'customer_pool'//客户池
};
class CrmIndex extends React.Component {
    state = {
        customerViewType: VIEW_TYPE.CUSTOMER,//客户展示的视图
        crmSearchCondition: {},//客户列表中搜索的筛选条件
    };

    componentDidMount() {
        crmManagementEmitter.on(crmManagementEmitter.OPEN_VIEW_PANEL, this.historyJumpCrm);
        if(_.get(this.props, 'history.action') === 'PUSH') {
            let paramsObj = _.get(this.props, 'location.state.paramsObj');
            if (paramsObj) {
                this.historyJumpCrm(paramsObj);
            }
        }
        $('body').css('overflow', 'hidden');
    }

    componentWillUnmount() {
        crmManagementEmitter.removeListener(crmManagementEmitter.OPEN_VIEW_PANEL, this.historyJumpCrm);
        $('body').css('overflow', 'auto');
    }
    historyJumpCrm = (paramsObj) => {
        //跳转到客户池
        if (_.get(paramsObj,'showCustomerPool')){
            this.showCustomerPool(_.get(paramsObj,'condition'));
        }
        //跳转到客户回收站
        if (_.get(paramsObj,'showCustomerRecycle')){
            this.showCustomerRecycleBin(_.get(paramsObj,'condition'));
        }
    }

    //展示重复客户界面的设置
    showRepeatCustomer = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.filter-block .customer-repeat-btn'), '点击客户查重按钮');
        this.setState({
            customerViewType: VIEW_TYPE.REPEAT_CUSTOMER
        });
    };
    //展示客户回收站
    showCustomerRecycleBin = (searchCondition) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.filter-block .customer-recycle-btn'), '点击客户回收站');
        this.setState({
            customerViewType: VIEW_TYPE.RECYCLE_BIN_CUSTOMER,
            crmSearchCondition: searchCondition
        });
    };
    //展示客户池
    showCustomerPool = (searchCondition) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.filter-block .customer-pool-btn'), '点击客户池');
        this.setState({
            customerViewType: VIEW_TYPE.CUSTOMER_POOL,
            crmSearchCondition: searchCondition
        });
    };

    //返回客户列表视图
    returnCustomerView = (isExtractSuccess = false) => {
        this.setState({
            customerViewType: VIEW_TYPE.CUSTOMER,
            searchCondition: {},
            isExtractSuccess
        });
    };

    render() {
        let currView = null;
        switch (this.state.customerViewType) {
            case VIEW_TYPE.CUSTOMER:
                currView = (
                    <div data-tracename="客户管理">
                        <CrmList {...this.props} showRepeatCustomer={this.showRepeatCustomer}
                            isExtractSuccess={this.state.isExtractSuccess}
                            showCustomerPool={this.showCustomerPool}
                            showCustomerRecycleBin={this.showCustomerRecycleBin}/>
                    </div>);
                break;
            case VIEW_TYPE.REPEAT_CUSTOMER:
                currView = (
                    <div data-tracename="重复客户列表">
                        <CustomerRepeat closeRepeatCustomer={this.returnCustomerView}/>
                    </div>);
                break;
            case VIEW_TYPE.RECYCLE_BIN_CUSTOMER:
                currView = (
                    <div data-tracename="客户回收站">
                        <CustomerRecycleBin crmSearchCondition={this.state.crmSearchCondition} closeRecycleBin={this.returnCustomerView}/>
                    </div>);
                break;
            case VIEW_TYPE.CUSTOMER_POOL:
                currView = (
                    <div data-tracename="客户池">
                        <CustomerPool crmSearchCondition={this.state.crmSearchCondition} closeCustomerPool={this.returnCustomerView}/>
                    </div>);
                break;
        }
        return currView;
    }
}

module.exports = CrmIndex;

