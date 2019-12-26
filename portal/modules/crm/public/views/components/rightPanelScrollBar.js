const PropTypes = require('prop-types');
var React = require('react');
/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/5/4.
 */
//滚动条
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import {getDetailLayoutHeight} from '../../utils/crm-util';
import {phoneMsgEmitter} from 'PUB_DIR/sources/utils/emitters';
//高度常量
const LAYOUT_CONSTANTS = {
    MERGE_SELECT_HEIGHT: 30,//合并面板下拉框的高度
};
class RightPanelScrollBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            layoutHeight: getDetailLayoutHeight(props.totalHeight)
        };
    }
    componentDidMount() {
        $(window).on('resize', this.resizeLayoutHeight);
        // 监听到拨打电话状态展示区高度改变后，重新计算高度
        phoneMsgEmitter.on(phoneMsgEmitter.RESIZE_DETAIL_HEIGHT, this.resizeLayoutHeight);
    }
    componentWillUnmount() {
        $(window).off('resize', this.resizeLayoutHeight);
        phoneMsgEmitter.removeListener(phoneMsgEmitter.RESIZE_DETAIL_HEIGHT, this.resizeLayoutHeight);
    }

    resizeLayoutHeight = () => {
        this.setState({ layoutHeight: getDetailLayoutHeight(this.props.totalHeight) });
    }

    handleScrollBarBottom() {
        if (_.isFunction(this.props.handleScrollBottom)) {
            this.props.handleScrollBottom();
        }
    }

    render() {
        let divHeight = this.state.layoutHeight;
        //合并面板，去掉客户选择框的高度
        if (this.props.isMerge) {
            divHeight = divHeight - LAYOUT_CONSTANTS.MERGE_SELECT_HEIGHT;
        }
        return (
            <div style={{height: divHeight}} className="right-pannel-scrollbar">
                <GeminiScrollbar className="srollbar-out-card-style"
                    handleScrollBottom={this.handleScrollBarBottom.bind(this)}
                    listenScrollBottom={this.props.listenScrollBottom}
                    ref={scrollBar => {
                        this.rightPanelScrollBarRef = scrollBar;
                    }}
                >
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