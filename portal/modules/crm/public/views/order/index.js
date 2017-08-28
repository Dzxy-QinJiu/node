require("../../scss/order.scss");
import { Icon, Button } from "antd";
const GeminiScrollbar = require('../../../../../components/react-gemini-scrollbar');
const OrderStore = require("../../store/order-store");
const OrderAction = require("../../action/order-actions");
const OrderItem = require("./order-item");
const OrderForm = require("./order-form");
const history = require("../../../../../public/sources/history");
const userData = require("../../../../../public/sources/user-data");
import Trace from "LIB_DIR/trace";

//高度常量
var LAYOUT_CONSTANTS = {
    MERGE_SELECT_HEIGHT: 30,//合并面板下拉框的高度
    RIGHT_PANEL_PADDING_TOP: 20,//右侧面板顶部padding
    RIGHT_PANEL_PADDING_BOTTOM: 20,//右侧面板底部padding
    CONTACT_LIST_MARGIN_BOTTOM: 20,//列表距离底部margin
    RIGHT_PANEL_TAB_HEIGHT: 36,//右侧面板tab高度
    RIGHT_PANEL_TAB_MARGIN_BOTTOM: 17,//右侧面板tab的margin
    CONTACT_ADD_BUTTON_HEIGHT: 34  //添加按钮高度
};

var OrderIndex = React.createClass({
    getInitialState: function () {
        return OrderStore.getState();
    },

    onChange: function () {
        this.setState(OrderStore.getState());
    },

    componentDidMount: function () {
        OrderStore.listen(this.onChange);
        OrderAction.getAppList();
        OrderAction.getOrderList(this.props.curCustomer);
        OrderAction.getSysStageList();
    },

    componentWillReceiveProps: function (nextProps) {
        if (nextProps.curCustomer) {
            this.state.orderList = nextProps.curCustomer.sales_opportunities || [];
            setTimeout(() => {
                OrderAction.getOrderList(nextProps.curCustomer);
            });
        }
    },

    componentWillUnmount: function () {
        OrderStore.unlisten(this.onChange);
    },

    showForm: function (id) {
        Trace.traceEvent(this.getDOMNode(),"点击添加订单按钮/点击编辑某个订单按钮");
        OrderAction.showForm(id);
    },

    gotoUserList: function () {

        //获取客户基本信息
        var basicData = this.state.basicData || {};
        //跳转到用户列表
        history.pushState({
            //客户id
            customer_id: this.props.curCustomer.id || '',
        }, "/user/list", {});
    },

    render: function () {
        const _this = this;
        const appList = this.state.appList;
        const curCustomer = this.props.curCustomer;
        const userNum = curCustomer && curCustomer.app_user_ids && curCustomer.app_user_ids.length;
        let divHeight = $(window).height() -
            LAYOUT_CONSTANTS.RIGHT_PANEL_PADDING_TOP - //右侧面板顶部padding
            LAYOUT_CONSTANTS.RIGHT_PANEL_PADDING_BOTTOM - //右侧面板底部padding
            LAYOUT_CONSTANTS.CONTACT_LIST_MARGIN_BOTTOM -//列表距离底部margin
            LAYOUT_CONSTANTS.RIGHT_PANEL_TAB_HEIGHT -//右侧面板tab高度
            LAYOUT_CONSTANTS.RIGHT_PANEL_TAB_MARGIN_BOTTOM;//右侧面板tab的margin

        //合并面板，去掉客户选择框的高度
        if (this.props.isMerge) {
            divHeight -= LAYOUT_CONSTANTS.MERGE_SELECT_HEIGHT;
        } else {
            //添加按钮高度
            divHeight -= LAYOUT_CONSTANTS.CONTACT_ADD_BUTTON_HEIGHT;
        }
        let isApplyButtonShow = false;
        if ((userData.hasRole(userData.ROLE_CONSTANS.SALES) || userData.hasRole(userData.ROLE_CONSTANS.SALES_LEADER))) {
            isApplyButtonShow = true;
        }
        //查找是否有添加或编辑面板展示
        const hasFormShow = _.some(this.state.orderList, order=>order.isEdit);
        return (
            <div className="order-container" data-tracename="订单页面">
                <div className="order-container-scroll" style={{height: divHeight}} ref="scrollOrderList">
                    <GeminiScrollbar className="geminiScrollbar-vertical">
                        {this.state.orderList.map(function (order, i) {
                            return (
                                order.isEdit ?
                                    (<OrderForm key={i}
                                                order={order}
                                                stageList={_this.state.stageList}
                                                appList={appList}
                                                isMerge={_this.props.isMerge}
                                                customerId={_this.props.curCustomer.id}
                                                refreshCustomerList={_this.props.refreshCustomerList}
                                                updateMergeCustomerOrder={_this.props.updateMergeCustomerOrder}
                                    />) :
                                    (<OrderItem key={i}
                                                appList={appList}
                                                isMerge={_this.props.isMerge}
                                                stageList={_this.state.stageList}
                                                showApplyUserForm={_this.props.showApplyUserForm}
                                                closeRightPanel={_this.props.closeRightPanel}
                                                showForm={_this.showForm}
                                                refreshCustomerList={_this.props.refreshCustomerList}
                                                updateMergeCustomerOrder={_this.props.updateMergeCustomerOrder}
                                                delMergeCustomerOrder={_this.props.delMergeCustomerOrder}
                                                customerName={_this.props.curCustomer.name}
                                                isApplyButtonShow={isApplyButtonShow}
                                                onChange={_this.onChange}
                                                order={order}/>)
                            );
                        })}

                        {userNum ? (
                            <div className="user-number"><ReactIntl.FormattedMessage id="crm.158" defaultMessage="用户数" />：{userNum}
                                {isApplyButtonShow ? (
                                    <Button type="primary" onClick={this.gotoUserList}><ReactIntl.FormattedMessage id="crm.159" defaultMessage="申请正式/试用帐号" /></Button>
                                ) : null}
                            </div>
                        ) : null}
                    </GeminiScrollbar>
                </div>
                {this.props.isMerge || hasFormShow ? null : (
                    <div className={this.state.orderList.length? "crm-right-panel-addbtn" : "crm-right-panel-addbtn go-top"} onClick={this.showForm.bind(this, "")}>
                        <Icon type="plus"/><span><ReactIntl.FormattedMessage id="crm.161" defaultMessage="添加订单" /></span>
                    </div>)}
            </div>
        );
    }
});

module.exports = OrderIndex;
