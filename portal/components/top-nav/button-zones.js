import ReportLeftMenu from 'CMP_DIR/report-left-menu';

/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2018/12/10.
 */
require('./button-zones.less');
let topNavEmitter = require('../../public/sources/utils/emitters').topNavEmitter;

class ButtonZones extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        $(window).on('resize', this.resizeFunc);
        this.resizeFunc();
        //监听重新布局事件
        topNavEmitter.on(topNavEmitter.RELAYOUT, this.resizeFunc);
    }

    componentWillUnmount() {
        $(window).off('resize', this.resizeFunc);
        this.cleanUpStyle();
        topNavEmitter.removeListener(topNavEmitter.RELAYOUT, this.resizeFunc);
    }
    //清除样式
    cleanUpStyle = () => {
        //找到外层节点
        let $wrap = $('.rightContent .topNav').first();
        let $content = $('.rightContent .top-nav-module-content');
        //按钮区
        let $buttonZones = $(ReactDOM.findDOMNode(this));
        $wrap && $wrap.removeClass('fixed-position');
        $content && $content.removeClass('fixed-position');
        $buttonZones && $buttonZones.removeClass('fixed-position');
    };
    resizeFunc = () => {
        clearTimeout(this.resizeFunc.timeout);
        this.resizeFunc.timeout = setTimeout(this.resizeHandler, 100);
    };
    resizeHandler = () => {
        //找到外层节点
        let $wrap = $('.rightContent .topNav').first();
        let $content = $('.rightContent .top-nav-module-content');
        //找到菜单列表
        let $topLinks = $wrap.find('.topnav-links-wrap');
        if (!$wrap.length || !$content.length || !$topLinks.length) {
            return;
        }
        //获取菜单在页面中的位置
        let topLinksPosStart = $topLinks && $topLinks.offset() && $topLinks.offset().left || 0;
        let topLinksPosEnd = topLinksPosStart + ($topLinks.outerWidth() || 0);
        //按钮区
        let $buttonZones = $(ReactDOM.findDOMNode(this));
        this.cleanUpStyle();
        //找到所有显示出来的子节点
        let childNodes = $buttonZones.children().filter(':visible');
        //计算节点是否存在覆盖情况
        let intersect = _.some(childNodes, (dom) => {
            var $dom = $(dom);
            var domPosStart = $dom.offset().left;
            var domPosEnd = domPosStart + $dom.outerWidth();
            if (
                topLinksPosStart <= domPosEnd &&
                topLinksPosEnd >= domPosStart
            ) {
                return true;
            }
        });
        //如果有覆盖
        if (intersect) {
            $wrap.addClass('fixed-position');
            $content.addClass('fixed-position');
            $buttonZones.addClass('fixed-position');
        }
    };

    render() {
        return (
            <div className="button-zones">
                {this.props.children}
            </div>
        );
    }
}

ButtonZones.propTypes = {
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
};

export default ButtonZones;
