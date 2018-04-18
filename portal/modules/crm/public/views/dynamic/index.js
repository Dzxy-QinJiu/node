
require('../../css/dynamic.less');
//动态store
var DynamicStore = require("../../store/dynamic-store");
//动态action
var DynamicAction = require("../../action/dynamic-action");
//滚动条
var GeminiScrollbar = require("../../../../../components/react-gemini-scrollbar");
var TimeLine = require("../../../../../components/time-line");

//高度常量
var LAYOUT_CONSTANTS = {
    MERGE_SELECT_HEIGHT:30,//合并面板下拉框的高度
    TOP_NAV_HEIGHT: 36 + 8,//36：头部导航的高度，8：导航的下边距
    MARGIN_BOTTOM: 8 //动态面板的下边距
};

var Dynamic = React.createClass({
    getInitialState : function() {
        return this.getStateFromStore();
    },
    getStateFromStore : function() {
        return {
            dynamicList : DynamicStore.getDynamicListFromView(),
            windowHeight : $(window).height()
        };
    },
    onStoreChange : function() {
        this.setState(this.getStateFromStore());
    },
    componentDidMount : function() {
        DynamicStore.listen(this.onStoreChange);
        DynamicAction.getDynamicList(this.props.currentId);
        $(window).on("resize" , this.onStoreChange);
    },
    componentWillReceiveProps: function (nextProps) {
        if (nextProps.currentId !== this.props.currentId) {
            setTimeout(() => {
                DynamicAction.getDynamicList(nextProps.currentId);
            });
        }
    },
    componentWillUnmount : function() {
        DynamicStore.unlisten(this.onStoreChange);
        $(window).off("resize" , this.onStoreChange);
    },
    timeLineItemRender: function (item) {
        const call_time = Intl.get("crm.199",
            "在{time}拨打了号码{phone} ，通话时长{duration} 秒",
            {
                time: moment(item.call_date).format(oplateConsts.TIME_FORMAT),
                phone: item.dst,
                duration: item.billsec
            }
        );
        return (
            <dl>
                <dd>
                    {item.message}
                    {item.call_date?
                        <p>{call_time}</p>
                    : null}
                </dd>
                <dt>{moment(item.date).format(oplateConsts.TIME_FORMAT)}</dt>
            </dl>
        );
    },
    render: function () {
        let divHeight = this.state.windowHeight - LAYOUT_CONSTANTS.TOP_NAV_HEIGHT - LAYOUT_CONSTANTS.MARGIN_BOTTOM;
        //减头部的客户基本信息高度
        divHeight -= parseInt($(".basic-info-contianer").outerHeight(true));
        //合并面板，去掉客户选择框的高度
        if(this.props.isMerge){
            divHeight = divHeight - LAYOUT_CONSTANTS.MERGE_SELECT_HEIGHT;
        }
        return (
            <div style={{height: divHeight}} className="dynamicList">
                <GeminiScrollbar>
                    <TimeLine
                        list={this.state.dynamicList}
                        groupByDay={true}
                        timeField="date"
                        render={this.timeLineItemRender}
                    />
                </GeminiScrollbar>
            </div>
        );
    }
});

module.exports = Dynamic;
