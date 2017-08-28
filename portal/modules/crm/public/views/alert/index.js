require("../../scss/alert.scss");
var AlertStore = require("../../store/alert-store");
var AlertAction = require("../../action/alert-action");
var CrmAlertForm = require("./form");
import { Icon, message } from "antd";
var GeminiScrollbar = require("../../../../../components/react-gemini-scrollbar");
var TimeLine = require("../../../../../components/time-line");
import Trace from "LIB_DIR/trace";
//高度常量
var LAYOUT_CONSTANTS = {
    MERGE_SELECT_HEIGHT:30,//合并面板下拉框的高度
    RIGHT_PANEL_PADDING_TOP: 20,//右侧面板顶部padding
    RIGHT_PANEL_PADDING_BOTTOM: 40,//右侧面板底部padding
    DYNAMIC_LIST_MARGIN_BOTTOM: 30,//动态列表距离底部margin
    RIGHT_PANEL_TAB_HEIGHT: 36,//右侧面板tab高度
    RIGHT_PANEL_TAB_MARGIN_BOTTOM: 17,//右侧面板tab的margin
};

var CrmAlert = React.createClass({
    getInitialState: function() {
        return AlertStore.getState();
    },
    onStoreChange: function() {
        this.setState(AlertStore.getState());
    },
    componentDidMount: function() {
        AlertStore.listen(this.onStoreChange);
        this.getAlertList();
    },
    componentWillReceiveProps: function(nextProps) {
        this.getAlertList(nextProps.curCustomer.id);
    },
    componentWillUnmount: function() {
        AlertStore.unlisten(this.onStoreChange);
    },
    getAlertList: function(customerId) {
        customerId = customerId || this.props.curCustomer.id;

        AlertAction.getAlertList(customerId);
    },
    addAlert: function() {
        Trace.traceEvent(this.getDOMNode(),"点击添加一个提醒按钮");
        const _this = this;
        const newAlert = {
            customer_id: _this.props.curCustomer.id,
            customer_name: _this.props.curCustomer.name,
            alert_time: "",
            topic: "",
            edit: true
        }

        AlertAction.showAddForm(newAlert);

        //滚动条滚动到顶端以显示添加表单
        GeminiScrollbar.scrollTo(this.refs.alertWrap, 0);
    },
    editAlert: function(alert) {
        Trace.traceEvent(this.getDOMNode(),"点击编辑提醒按钮");
        AlertAction.showEditForm(alert);
    },
    deleteAlert: function(id) {
        const reqData = {id: id};
        const _this = this;
        Trace.traceEvent(this.getDOMNode(),"点击删除提醒按钮");
        AlertAction.deleteAlert(reqData, function (resData) {
            if (resData.code == 0) {
                message.success( Intl.get("crm.138", "删除成功"));
                _this.getAlertList();
            } else {
                message.error( Intl.get("crm.139", "删除失败"));
            }
        });
    },
    timeLineItemRender: function (item) {
        if (item.edit) {
            return (
                <div className="form-wrapper">
                    <CrmAlertForm
                        getAlertList={this.getAlertList}
                        currentAlert={item}
                    />
                </div>
            );
        } else {
            const topicClass = item.status == "deleted"? "deleted" : "";

            return (
                <dl>
                    <dd className={topicClass}>
                        {item.topic}
                    </dd>
                    <dt>
                        {moment(item.alert_time).format("HH:mm")}
                        {item.status == "deleted"?
                        <Icon type="check-circle" />
                        :this.props.isMerge?null:(<span>
                            <Icon type="edit" onClick={this.editAlert.bind(this, item)} />
                            <Icon type="delete" onClick={this.deleteAlert.bind(this, item.id)} />
                        </span>)
                        }
                    </dt>
                </dl>
            );
        }
    },
    render: function () {
        const _this = this;

        var divHeight = $(window).height()
            - LAYOUT_CONSTANTS.RIGHT_PANEL_PADDING_TOP //右侧面板顶部padding
            - LAYOUT_CONSTANTS.RIGHT_PANEL_PADDING_BOTTOM //右侧面板底部padding
            - LAYOUT_CONSTANTS.DYNAMIC_LIST_MARGIN_BOTTOM //动态列表距离底部margin
            - LAYOUT_CONSTANTS.RIGHT_PANEL_TAB_HEIGHT //右侧面板tab高度
            - LAYOUT_CONSTANTS.RIGHT_PANEL_TAB_MARGIN_BOTTOM //右侧面板tab的margin
            ;
        //合并面板，去掉客户选择框的高度
        //if(this.props.isMerge){
        //    divHeight = divHeight - LAYOUT_CONSTANTS.MERGE_SELECT_HEIGHT;
        //}
        return (
            <div ref="alertWrap" className="alert-list" style={{height: divHeight}} data-tracename="提醒页面">
                <GeminiScrollbar>
                    <TimeLine
                        list={this.state.alertList}
                        groupByDay={true}
                        timeField="alert_time"
                        render={this.timeLineItemRender}
                    />
                </GeminiScrollbar>
                {this.props.isMerge ? null : (<div className="crm-right-panel-addbtn" onClick={this.addAlert}>
                    <Icon type="plus"/><span><ReactIntl.FormattedMessage id="crm.178" defaultMessage="添加一个提醒" /></span>
                </div>)}
            </div>
        );
    }
});

module.exports = CrmAlert;
