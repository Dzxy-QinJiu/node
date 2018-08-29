'use strict';
var PropTypes = require('prop-types');
var React = require('react');
var scrollBarEmitter = require('../../public/sources/utils/emitters').scrollBarEmitter;
var _extends = Object.assign || function(target) {
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                target[key] = source[key];
            }
        }
    }
    return target;
};

function _objectWithoutProperties(obj, keys) {
    var target = {};
    for (var i in obj) {
        if (keys.indexOf(i) >= 0) continue;
        if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
        target[i] = obj[i];
    }
    return target;
}

require('./jquery.mousewheel.js');

var language = require('../../public/language/getLanguage');
if (language.lan() == 'es' || language.lan() == 'en') {
    require('./gemini-scrollbar-es_VE.less');
}else if (language.lan() == 'zh'){
    require('./gemini-scrollbar-zh_CN.less');
}
var GeminiScrollbar = require('./gemini-scrollbar');
var Icon = require('antd').Icon;

class ReactScrollBar extends React.Component {
    static displayName = 'GeminiScrollbar';

    static propTypes = {
        autoshow: PropTypes.bool,
        forceGemini: PropTypes.bool,
        enabled: PropTypes.bool,
        listenScrollBottom: PropTypes.bool,
        handleScrollBottom: PropTypes.func,
        itemCssSelector: PropTypes.string
    };

    static defaultProps = {
        autoshow: false,
        forceGemini: true,
        enabled: true,
        listenScrollBottom: false,
        handleScrollBottom: function() {},
        //用于大尺寸显示器下，加载完一页数据以后，自动判断是否加载下一页数据
        itemCssSelector: ''
    };

    state = {
        scrollBottomLoading: false
    };

    /**
     * Holds the reference to the GeminiScrollbar instance.
     * @property scrollbar <public> [Object]
     */
    scrollbar = null;

    hideBottomLoading = () => {
        this.setState({
            scrollBottomLoading: false
        }, function() {
            this.scrollbar.scrollBottomUnlock();
        });
    };

    /**
     * when scroll to bottom , this function occur
     */
    handleScrollBottom = () => {
        this.setState({
            scrollBottomLoading: true
        });

        var scrollBarObject = {
            hideBottomLoading: this.hideBottomLoading
        };

        this.props.handleScrollBottom(scrollBarObject);
    };

    componentWillReceiveProps(nextProps) {
        if (this.props.listenScrollBottom != nextProps.listenScrollBottom) {
            if (nextProps.listenScrollBottom === true) {
                this.scrollbar.bindScrollBottom();
                scrollBarEmitter.on(scrollBarEmitter.HIDE_BOTTOM_LOADING, this.hideBottomLoading);
                this.bindedEventEmitter = true;
            } else if (nextProps.listenScrollBottom === false) {
                this.scrollbar.unbindScrollBottom();
                scrollBarEmitter.removeListener(scrollBarEmitter.HIDE_BOTTOM_LOADING, this.hideBottomLoading);
                this.bindedEventEmitter = false;
                this.setState({
                    scrollBottomLoading: false
                });
            }
        }
    }

    initScrollbar = () => {
        this.scrollbar = new GeminiScrollbar({
            element: ReactDOM.findDOMNode(this),
            autoshow: this.props.autoshow,
            forceGemini: this.props.forceGemini,
            createElements: false,
            handleScrollBottom: this.handleScrollBottom,
            //用于大尺寸显示器下，加载完一页数据以后，自动判断是否加载下一页数据
            itemCssSelector: this.props.itemCssSelector
        }).create();
    };

    //更新滚动条位置，大小
    update = () => {
        if (this.scrollbar) {
            this.scrollbar.update();
        }
    };

    componentDidMount() {
        if (this.props.enabled) {
            this.initScrollbar();
            if (this.props.listenScrollBottom) {
                this.scrollbar.bindScrollBottom();
                scrollBarEmitter.on(scrollBarEmitter.HIDE_BOTTOM_LOADING, this.hideBottomLoading);
                this.bindedEventEmitter = true;
            }
            //滚动条更新的时候，检测，是否需要加载下一页的数据，用于下拉加载
            //如果没传itemCssSelector，则由业务逻辑自己保障，不再自动检测
            if(this.props.listenScrollBottom && this.props.itemCssSelector) {
                this.scrollbar._detectLoadNextPage();
            }
        }
    }

    componentWillUnmount() {
        if (this.scrollbar) {
            this.scrollbar.destroy();
            this.scrollbar = null;
        }
        if (this.bindedEventEmitter) {
            scrollBarEmitter.removeListener(scrollBarEmitter.HIDE_BOTTOM_LOADING, this.hideBottomLoading);
        }
    }

    componentDidUpdate() {
        if (this.props.enabled) {
            if (!this.scrollbar) {
                this.initScrollbar();
            } else {
                this.scrollbar.update();
                //滚动条更新的时候，检测，是否需要加载下一页的数据，用于下拉加载
                //如果没传itemCssSelector，则由业务逻辑自己保障，不再自动检测
                if(this.props.listenScrollBottom && this.props.itemCssSelector) {
                    this.scrollbar._detectLoadNextPage();
                }
            }
        } else {
            if (this.scrollbar) {
                this.scrollbar.destroy();
                this.scrollbar = null;
            }
        }
    }

    render() {
        var _props = this.props;
        var className = _props.className;
        var children = _props.children;
        var other = _objectWithoutProperties(_props, ['className', 'children']);
        var classes = '';

        if (className) {
            classes += ' ' + className;
        }

        var allProps = _extends({}, other, {className: classes});

        return (
            <div {...allProps}>
                <div className="gm-scrollbar -vertical">
                    <div className="thumb"></div>
                </div>
                <div className="gm-scrollbar -horizontal">
                    <div className="thumb"></div>
                </div>
                <div className="gm-scroll-view" ref="scroll-view">
                    {children}
                    {
                        this.props.listenScrollBottom ? (
                            <div className="gm-bottom-loading"
                                style={{opacity: this.state.scrollBottomLoading ? 1 : 0}}>
                                <Icon type="loading"/>
                            </div>
                        ) : null
                    }
                </div>
            </div>
        );
    }
}

ReactScrollBar.scrollTo = function(dom, px) {
    var $scrollbar = $(dom).find('.gm-scroll-view');
    if ($scrollbar[0]) {
        $scrollbar[0].scrollTop = px;
    }
};

module.exports = ReactScrollBar;
