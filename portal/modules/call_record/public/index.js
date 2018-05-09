import CallRecord from "./views/call-record";
import CrmRightPanel  from '../../crm/public/views/crm-right-panel';
import {RightPanel} from "../../../components/rightPanel";
import crmAjax from '../../crm/public/ajax';
var callReordEmitter = require("../../../public/sources/utils/emitters").callReordEmitter;
import {message} from 'antd';
import Trace from "LIB_DIR/trace";
import AppUserManage from "MOD_DIR/app_user_manage/public";

const CallRecordList = React.createClass({
    getInitialState: function () {
        return {
            rightPanelCustomerId: '',//通话记录，通过客户id查看客户详情
            showRightPanel: false,// 标记显示右侧客户详情面板 false不显示 true显示
            clickCustomerData: '',// 点击客户的数据
            isShowCustomerUserListPanel: false,//是否展示该客户下的用户列表
            CustomerInfoOfCurrUser: {},//当前展示用户所属客户的详情
        };
    },
    // 关闭客户详情面板
    closeRightPanel: function () {
        this.setState({
            rightPanelCustomerId: '',
            showRightPanel: false
        });
    },
    componentWillMount: function () {
        callReordEmitter.on(callReordEmitter.CLOSE_RIGHT_PANEL, this.closeRightPanel);
    },

    componentDidMount: function () {
        var $wrap = $(this.refs.wrap);
        var _this = this;
        $wrap.on("click", ".customer_column", function () {
            var $customer_id_hidden = $(this).find(".customer_id_hidden");
            if ($customer_id_hidden[0]) {
                Trace.traceEvent($(_this.getDOMNode()).find(".customer_column"), "打开客户详情");
                _this.setState({
                    rightPanelCustomerId: $customer_id_hidden.val(),
                    showRightPanel: true
                });
            }
        });
    },


    componentWillUnmount: function () {
        this.setState({
            rightPanelCustomerId: '',
            showRightPanel: false,
        });
        callReordEmitter.removeListener(callReordEmitter.CLOSE_RIGHT_PANEL, this.closeRightPanel);
    },
    ShowCustomerUserListPanel: function (data) {
        this.setState({
            isShowCustomerUserListPanel: true,
            CustomerInfoOfCurrUser: data.customerObj
        });
    },
    closeCustomerUserListPanel: function () {
        this.setState({
            isShowCustomerUserListPanel: false
        });
    },
    render: function () {
        return (
            <div>
                <div className='call-record-wrap table-btn-fix' data-tracename="通话记录界面">
                    <div ref="wrap">
                        <CallRecord showRightPanel={this.state.showRightPanel}/>
                    </div>
                    {this.state.showRightPanel ? <CrmRightPanel
                        currentId={this.state.rightPanelCustomerId}
                        showFlag={this.state.showRightPanel}
                        hideRightPanel={this.closeRightPanel}
                        refreshCustomerList={function () {
                        }}
                        ShowCustomerUserListPanel={this.ShowCustomerUserListPanel}
                    /> : null}
                </div>
            </div>
        );
    }
});
module.exports = CallRecordList;
