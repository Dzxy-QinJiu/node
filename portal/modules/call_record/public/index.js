var React = require('react');
import CallRecord from './views/call-record';
import {phoneMsgEmitter} from 'PUB_DIR/sources/utils/emitters';
import {RightPanel} from '../../../components/rightPanel';
import crmAjax from '../../crm/public/ajax';
var callReordEmitter = require('../../../public/sources/utils/emitters').callReordEmitter;
import Trace from 'LIB_DIR/trace';
import AppUserManage from 'MOD_DIR/app_user_manage/public';

class CallRecordList extends React.Component {
    state = {
        rightPanelCustomerId: '',//通话记录，通过客户id查看客户详情
        showRightPanel: false,// 标记显示右侧客户详情面板 false不显示 true显示
        clickCustomerData: '',// 点击客户的数据
        isShowCustomerUserListPanel: false,//是否展示该客户下的用户列表
        customerOfCurUser: {},//当前展示用户所属客户的详情
    };

    // 关闭客户详情面板
    closeRightPanel = () => {
        this.setState({
            rightPanelCustomerId: '',
            showRightPanel: false
        });
    };

    componentWillMount() {
        callReordEmitter.on(callReordEmitter.CLOSE_RIGHT_PANEL, this.closeRightPanel);
    }

    componentDidMount() {
        var $wrap = $(this.refs.wrap);
        var _this = this;
        $wrap.on('click', '.customer_column', function() {
            var $customer_id_hidden = $(this).find('.customer_id_hidden');
            if ($customer_id_hidden[0]) {
                Trace.traceEvent($(ReactDOM.findDOMNode(_this)).find('.customer_column'), '打开客户详情');
                _this.showRightPanel($customer_id_hidden.val());
            }
        });
    }

    componentWillUnmount() {
        this.closeRightPanel();
        callReordEmitter.removeListener(callReordEmitter.CLOSE_RIGHT_PANEL, this.closeRightPanel);
    }

    showRightPanel = (customerId) => {
        this.setState({
            rightPanelCustomerId: customerId,
            showRightPanel: true
        });
        //触发打开带拨打电话状态的客户详情面板
        phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
            customer_params: {
                currentId: customerId,
                ShowCustomerUserListPanel: this.ShowCustomerUserListPanel,
                hideRightPanel: this.closeRightPanel
            }
        });
    };

    ShowCustomerUserListPanel = (data) => {
        this.setState({
            isShowCustomerUserListPanel: true,
            customerOfCurUser: data.customerObj
        });
    };

    closeCustomerUserListPanel = () => {
        this.setState({
            isShowCustomerUserListPanel: false,
            customerOfCurUser: {},
        });
    };

    render() {
        let customerOfCurUser = this.state.customerOfCurUser || {};
        return (
            <div>
                <div className='call-record-wrap table-btn-fix' data-tracename="通话记录界面">
                    <div ref="wrap">
                        <CallRecord showRightPanel={this.state.showRightPanel}
                            ShowCustomerUserListPanel={this.ShowCustomerUserListPanel}/>
                    </div>
                </div>
                {/*该客户下的用户列表*/}
                <RightPanel
                    className="customer-user-list-panel"
                    showFlag={this.state.isShowCustomerUserListPanel}
                >
                    {this.state.isShowCustomerUserListPanel ?
                        <AppUserManage
                            customer_id={customerOfCurUser.id}
                            hideCustomerUserList={this.closeCustomerUserListPanel}
                            customer_name={customerOfCurUser.name}
                        /> : null
                    }
                </RightPanel>
            </div>
        );
    }
}

module.exports = CallRecordList;

