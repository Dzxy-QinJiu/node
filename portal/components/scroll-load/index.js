/** 
 * name: ScrollLoad
 * description: 用于处理固定列table的下拉加载，需要将"div.ant-table-body" 作为selector传入
 * {
 *  loading [boolean] 
 *  listenScrollBottom [boolean] 是否监听滚动到底部事件 （true:监听）
 *  handleScrollBottom [function] 滚动到底部时执行的回调函数
 *  selector [string] 出现滚动条的容器标识
 *  showNoMoreDataTip [boolean] 是否显示 “没有更多数据了”
 *  width [num] 出现滚动条的容器宽度
 * }
 */
require("CMP_DIR/scroll-load/index.less");
import Spinner from 'CMP_DIR/spinner';
var NoMoreDataTip = require("CMP_DIR/no_more_data_tip");
//用于布局的高度
var LAYOUT_CONSTANTS = {
    TOP_DISTANCE: 150,
    BOTTOM_DISTANCE: 40,
    SCREEN_WIDTH: 1130//屏幕宽度小于1130时，右侧操作按钮变成图标
};

const spinnerDOM = `
    <button 
        id="spinner-bottom"
        type="button" 
        class="hide spin-bottom ant-btn ant-btn-circle ant-btn-loading"
    >
        <i class="anticon anticon-spin anticon-loading"></i>
    </button>
`;
const NoMoreDataWords = Intl.get("common.no.more.data", "没有更多数据了");
const NoMoreDataDOM = `
<div class="no-more-data-tip" id="no_more_data_tip_bottom" >
    <div data-show="true" class="ant-alert ant-alert-info">
        <i class="anticon anticon-info-circle ant-alert-icon">
        </i>
        <span class="ant-alert-message">${NoMoreDataWords}</span>
        <span class="ant-alert-description"></span>
    </div>
</div>
`;
class ScrollLoad extends React.Component {
    constructor(props) {
        super(props);
        this.scrollhandler = this.scrollhandler.bind(this);
        this.state = {
            isBottom: false
        };
    }
    componentDidMount() {
        this.getHeights().$container.on('scroll', this.scrollhandler);
        //组件加载数据完成后判断是否需要持续加载
        if (!this.props.loading) {
            setTimeout(() => this.loadUntilBottom());
        }
        $(this.props.selector).append(spinnerDOM).append(NoMoreDataDOM).append(`<span id="bottom-fix"></span>`);
        $("#bottom-fix").css("width", this.props.width + "px");
    }
    componentWillReceiveProps(newVal) {
        let { loading, listenScrollBottom, showNoMoreDataTip, width } = newVal;
        if (!loading) {
            setTimeout(() => this.loadUntilBottom());
        }
        //修正无数据提示容器宽度
        $("#bottom-fix").css("width", width + "px");
        const showLoading = loading && listenScrollBottom;   
        //首次加载时隐藏spinner     
        if (showLoading) {
            $("#spinner-bottom").removeClass("hide");
        }
        //不监听下拉加载时，再隐藏spinner，防止高度变动导致闪烁
        if (!listenScrollBottom) {
            $("#spinner-bottom").addClass("hide");
        }
        this.hideClassHandler(showNoMoreDataTip, "#no_more_data_tip_bottom, #bottom-fix");
    }
    componentWillUnmount() {
        this.getHeights().$container.off('scroll', this.scrollhandler);
    }

    getHeights() {
        const childrenDom = ReactDOM.findDOMNode(this);
        const $container = $(childrenDom).find(this.props.selector);
        const $table = $container.children("table");
        let tableHeight = 0;
        if (!$table.length) {
            tableHeight = 0;
        }
        else {
            tableHeight = $table.height();
        }
        return {
            //卷动距离                 
            scrollHeight: $container.scrollTop() + 20,
            containerHeight: $container.height(),
            windowHeight: $(window).height() - LAYOUT_CONSTANTS.BOTTOM_DISTANCE - LAYOUT_CONSTANTS.TOP_DISTANCE,
            tableHeight,
            $container
        };
    }
    //屏幕过长时，持续加载直到出现滚动条
    loadUntilBottom() {
        let tableHeight = this.getHeights().tableHeight;
        //高度为0无数据时不加载
        if (tableHeight) {
            let windowHeight = this.getHeights().windowHeight;
            if ((windowHeight >= tableHeight) && this.props.listenScrollBottom) {
                this.props.handleScrollBottom();
            }
        }
    }
    hideClassHandler(flag, selector) {
        if (flag) {
            $(selector).removeClass("hide");
        }
        else {
            $(selector).addClass("hide");
        }
    }
    scrollhandler() {
        clearTimeout(this.scrollTimer);
        var _this = this;
        this.scrollTimer = setTimeout(() => {
            this.handleTableScroll();
        }, 100);
    }
    //下拉加载
    handleTableScroll() {
        let scrollBottomHandler = _.isFunction(this.props.handleScrollBottom) ? this.props.handleScrollBottom : function() { };
        let $container = this.getHeights().$container;
        //卷动距离大于（table高度减去外层容器高度）时，触发滚动到底部事件
        let { scrollHeight, tableHeight, containerHeight } = this.getHeights();
        if (scrollHeight >= (tableHeight - containerHeight)) {
            if (this.props.listenScrollBottom) {
                scrollBottomHandler();
            }
        }
    }
    render() {
        const style = _.extend({}, this.props.style, {
            position: "relative"
        });
        return (
            <div id="scroll-container" style={style}>
                {this.props.children}
            </div>
        );
    }
}

export default ScrollLoad;
