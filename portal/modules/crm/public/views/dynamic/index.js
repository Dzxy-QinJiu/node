
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
    RIGHT_PANEL_PADDING_TOP: 20,//右侧面板顶部padding
    RIGHT_PANEL_PADDING_BOTTOM: 20,//右侧面板底部padding
    DYNAMIC_LIST_MARGIN_BOTTOM: 20,//动态列表距离底部margin
    RIGHT_PANEL_TAB_HEIGHT: 36,//右侧面板tab高度
    RIGHT_PANEL_TAB_MARGIN_BOTTOM: 17,//右侧面板tab的margin
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
        var divHeight = this.state.windowHeight
            - LAYOUT_CONSTANTS.RIGHT_PANEL_PADDING_TOP //右侧面板顶部padding
            - LAYOUT_CONSTANTS.RIGHT_PANEL_PADDING_BOTTOM //右侧面板底部padding
            - LAYOUT_CONSTANTS.DYNAMIC_LIST_MARGIN_BOTTOM //动态列表距离底部margin
            - LAYOUT_CONSTANTS.RIGHT_PANEL_TAB_HEIGHT //右侧面板tab高度
            - LAYOUT_CONSTANTS.RIGHT_PANEL_TAB_MARGIN_BOTTOM //右侧面板tab的margin
            ;
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
