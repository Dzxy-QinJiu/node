import CallRecord from "./views/call-record";
import CrmRightPanel  from '../../crm/public/views/crm-right-panel';
import {RightPanel} from "../../../components/rightPanel";
import crmAjax from '../../crm/public/ajax'
var callReordEmitter = require("../../../public/sources/utils/emitters").callReordEmitter;
import {message} from 'antd';
import Trace from "LIB_DIR/trace";
import AppUserManage from "MOD_DIR/app_user_manage/public";

const CallRecordList = React.createClass({
    // 通话记录，通过phone查看客户详情
    rightPanelCustomerPhone: '',
    // 标记显示右侧客户详情面板 false不显示 true显示
    showRightPanel: false,
    getInitialState: function () {
        return {
            rightPanelCustomerPhone: this.rightPanelCustomerPhone,
            showRightPanel: this.showRightPanel,
            clickCustomerData: '',// 点击客户的数据
            isShowCustomerUserListPanel: false,//是否展示该客户下的用户列表
            CustomerInfoOfCurrUser: {},//当前展示用户所属客户的详情
        };
    },
    // 关闭客户详情面板
    closeRightPanel: function () {
        this.rightPanelCustomerPhone = '';
        this.showRightPanel = false;
        this.setState({
            rightPanelCustomerPhone: '',
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
            var $phone_hidden = $(this).find(".phone_hidden");
            var $customer_name_hidden = $(this).find('.customer_name_hidden');
            if ($phone_hidden[0] && $customer_name_hidden.val() != '') {
                Trace.traceEvent($(_this.getDOMNode()).find(".customer_column"), "打开客户详情");
                _this.rightPanelCustomerPhone = $phone_hidden.val();
                let condition = {};
                // 通话记录，查看客户详情，传phoneNumber
                condition.contacts = [{phone: [_this.rightPanelCustomerPhone]}];
                condition.call_phone = true;
                _this.showRightPanel = true;
                crmAjax.queryCustomer(condition).then(resData => {
                    if (_.isArray(resData.result)) {
                        if (resData.result.length) {
                            _this.setState({
                                rightPanelCustomerPhone: _this.rightPanelCustomerPhone,
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
        })
    },
    render: function () {
        return (
            <div className='call-record-wrap table-btn-fix' data-tracename="通话记录界面">
                <div ref="wrap">
                    <CallRecord showRightPanel={this.state.showRightPanel}/>
                </div>
                {
                    this.state.rightPanelCustomerPhone ? (
                        <CrmRightPanel
                            phoneNum={this.state.rightPanelCustomerPhone}
                            showFlag={true}
                            hideRightPanel={this.closeRightPanel}
                            refreshCustomerList={function () {
                            }}
                            clickCustomerData={this.state.clickCustomerData}
                            ShowCustomerUserListPanel={this.ShowCustomerUserListPanel}
                        />
                    ) : null
                }
            </div>
        );
    }
});
module.exports = CallRecordList;
