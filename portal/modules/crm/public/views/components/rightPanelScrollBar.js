const PropTypes = require('prop-types');
var React = require('react');
/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/5/4.
 */
//滚动条
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';

//高度常量
const LAYOUT_CONSTANTS = {
    MERGE_SELECT_HEIGHT: 30,//合并面板下拉框的高度
    TOP_NAV_HEIGHT: 36 + 8,//36：头部导航的高度，8：导航的下边距
    MARGIN_BOTTOM: 8 ,//面板的下边距
    TOP_TOTAL_HEIGHT: 30 //共xxx条的高度
};
class RightPanelScrollBar extends React.Component {
    constructor(props) {
        super(props);
    }

    handleScrollBarBottom() {
        if (_.isFunction(this.props.handleScrollBottom)) {
            this.props.handleScrollBottom();
        }
    }

    render() {
        let divHeight = $(window).height() - LAYOUT_CONSTANTS.TOP_NAV_HEIGHT - LAYOUT_CONSTANTS.MARGIN_BOTTOM;
        if (parseInt($('.basic-info-contianer').outerHeight(true))){
            //减头部的客户基本信息高度
            divHeight -= parseInt($('.basic-info-contianer').outerHeight(true));
        }
        if ($('.phone-alert-modal-title').size()) {
            divHeight -= $('.phone-alert-modal-title').outerHeight(true);
        }
        // 减去条数的高度
        if (this.props.totalHeight) {
            divHeight -= LAYOUT_CONSTANTS.TOP_TOTAL_HEIGHT;
        }
      
        //合并面板，去掉客户选择框的高度
        if (this.props.isMerge) {
            divHeight = divHeight - LAYOUT_CONSTANTS.MERGE_SELECT_HEIGHT;
        }
        return (
            <div style={{height: divHeight}} className="right-pannel-scrollbar">
                <GeminiScrollbar className="srollbar-out-card-style"
                    handleScrollBottom={this.handleScrollBarBottom.bind(this)}
                    listenScrollBottom={this.props.listenScrollBottom}>
                    {this.props.children}
                </GeminiScrollbar>
            </div>);
    }
}
RightPanelScrollBar.defaultProps = {
    children: null,
    listenScrollBottom: false,
    handleScrollBottom: function() {
    }
};
RightPanelScrollBar.propTypes = {
    handleScrollBottom: PropTypes.func,
    isMerge: PropTypes.bool,
    listenScrollBottom: PropTypes.bool,
    children: PropTypes.element,
    totalHeight: PropTypes.number
};
export default RightPanelScrollBar;