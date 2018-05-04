/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/5/4.
 */
//滚动条
import GeminiScrollbar from "CMP_DIR/react-gemini-scrollbar";

//高度常量
const LAYOUT_CONSTANTS = {
    MERGE_SELECT_HEIGHT: 30,//合并面板下拉框的高度
    TOP_NAV_HEIGHT: 36 + 8,//36：头部导航的高度，8：导航的下边距
    MARGIN_BOTTOM: 8 //面板的下边距
};
class RightPanelScrollBar extends React.Component {
    constructor(props) {
        super(props);
    }

    handleScrollBarBottom() {
        if (_.isArray(this.props.handleScrollBarBottom)) {
            this.props.handleScrollBarBottom();
        }
    }

    render() {
        let divHeight = $(window).height() - LAYOUT_CONSTANTS.TOP_NAV_HEIGHT - LAYOUT_CONSTANTS.MARGIN_BOTTOM;
        //减头部的客户基本信息高度
        divHeight -= parseInt($(".basic-info-contianer").outerHeight(true));
        //合并面板，去掉客户选择框的高度
        if (this.props.isMerge) {
            divHeight = divHeight - LAYOUT_CONSTANTS.MERGE_SELECT_HEIGHT;
        }
        return (
            <div style={{height: divHeight}} className="right-pannel-scrollbar">
                <GeminiScrollbar handleScrollBottom={this.handleScrollBarBottom}
                                 listenScrollBottom={this.props.listenScrollBottom}>
                    {this.props.children}
                </GeminiScrollbar>
            </div>);
    }
}
RightPanelScrollBar.defaultProps = {
    children: null,
    listenScrollBottom: false,
    handleScrollBottom: function () {
    }
};
export default RightPanelScrollBar;