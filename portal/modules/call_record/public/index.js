import CallRecord from "./views/call-record";
import CrmRightPanel  from '../../crm/public/views/crm-right-panel';
import {RightPanel} from "../../../components/rightPanel";
import crmAjax from '../../crm/public/ajax'
var callReordEmitter = require("../../../public/sources/utils/emitters").callReordEmitter;
import { message } from 'antd';
import Trace from "LIB_DIR/trace";

const CallRecordList = React.createClass({
    // 通话记录，通过phone查看客户详情
    rightPanelCustomerPhone: '',
    // 标记显示右侧客户详情面板 false不显示 true显示
    showRightPanel: false,
    getInitialState: function () {
        return {
            rightPanelCustomerPhone: this.rightPanelCustomerPhone,
            showRightPanel: this.showRightPanel,
            clickCustomerData: '' // 点击客户的数据
        };
    },
    // 关闭客户详情面板
    closeRightPanel : function() {
        $(this.refs.wrap).find(".current_row").removeClass("current_row");
        this.rightPanelCustomerPhone = '';
        this.showRightPanel = false;
        this.setState({
            rightPanelCustomerPhone : '',
            showRightPanel : false
        });
    },
    componentWillMount: function () {
        callReordEmitter.on(callReordEmitter.CLOSE_RIGHT_PANEL , this.closeRightPanel);
    },

    componentDidMount : function() {
        var $wrap = $(this.refs.wrap);
        var _this = this;
        $wrap.on("click" , ".customer_column" , function() {
            $(this).closest("tr").siblings().removeClass("current_row");
            var $phone_hidden = $(this).find(".phone_hidden");
            var $customer_name_hidden = $(this).find('.customer_name_hidden');
            if($phone_hidden[0] && $customer_name_hidden.val() != '') {
                Trace.traceEvent($(_this.getDOMNode()).find(".customer_column"),"打开客户详情");
                $(this).parent().addClass("current_row");
                _this.rightPanelCustomerPhone =$phone_hidden.val();
                 let condition = {};
                // 通话记录，查看客户详情，传phoneNumber
                condition.contacts = [{phone: [_this.rightPanelCustomerPhone]}];
                condition.call_phone = true;
                _this.showRightPanel = true;
                crmAjax.queryCustomer(condition).then(resData => {
                    if (_.isArray(resData.result)) {
                        if (resData.result.length) {
                             _this.setState({
                                rightPanelCustomerPhone:  _this.rightPanelCustomerPhone,
                                showRightPanel: _this.showRightPanel,
                                clickCustomerData: resData.result[0]
                            });
                         } else {
                            message.warn(Intl.get("crm.37", "此客户不属于您，您无权查看客户详情"));
                         }
                    } else {
                         message.error(Intl.get("crm.208", "查看客户详情失败！"));
                    }
                }, () => {
                   message.error(Intl.get("crm.208", "查看客户详情失败！"));
                });
                
            }
        });
    },


    componentWillUnmount: function () {
        this.rightPanelCustomerPhone = '';
        this.showRightPanel = false;
        callReordEmitter.removeListener(callReordEmitter.CLOSE_RIGHT_PANEL , this.closeRightPanel);
    },
    
    render: function () {
        return (
            <div className='call-record-wrap' data-tracename="通话记录界面">
                <div ref="wrap">
                    <CallRecord />
                </div>
                <RightPanel showFlag={this.state.showRightPanel}>
                {
                     this.state.rightPanelCustomerPhone ? (
                        <CrmRightPanel
                                phoneNum={this.state.rightPanelCustomerPhone}
                                showFlag={true}
                                hideRightPanel={this.closeRightPanel}
                                refreshCustomerList={function() {}}
                                clickCustomerData={this.state.clickCustomerData}
                            /> 
                     ): null
                }
                </RightPanel>
            </div>
        );
    }
});
module.exports =  CallRecordList;
