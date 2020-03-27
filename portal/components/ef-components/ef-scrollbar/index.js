/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2020/03/16.
 */
import './style.less';
import className from 'classnames';
import Ps from 'perfect-scrollbar';

class EfScrollbar extends React.Component {
    state = {
        maxHeight: 0
    };

    $el = null;

    componentDidMount() {
        this.$el = ReactDOM.findDOMNode(this);
        this.initialScrollBar();
        window.addEventListener('resize', this.handleResize);
    }

    componentWillMount() {
        window.removeEventListener('resize', this.handleResize);
        if(this.$el) {
            this.$el.removeEventListener('scroll', this.handleScroll);
            Ps.destroy(this.$el);
            this.$el = null;
        }
    }

    handleResize = () => {
        if (this.$el.clientHeight > 50) {
            this.setState({
                maxHeight: this.$el.clientHeight
            });
        }
        this.updated();
    };

    initialScrollBar() {
        let scrollSetting = {};
        let { maxHeight } = this.state;
        if (this.props.horizontal) {
            maxHeight = this.$el.clientHeight;
            scrollSetting.suppressScrollY = true;
            scrollSetting.wheelSpeed = 2;
            scrollSetting.wheelPropagation = false;
        } else {
            scrollSetting.minScrollbarLength = 20;
            scrollSetting.maxScrollbarLength = 200;
            scrollSetting.suppressScrollX = true;
        }
        this.setState({ maxHeight });
        Ps.initialize(this.$el, scrollSetting);
        this.$el.addEventListener('scroll', this.handleScroll);
    }

    handleScroll = (e) => {
        _.isFunction(this.props.onScroll) && this.props.onScroll(e);
    };

    scroll = (scrollDistance, callback) => {
        let scrollNum = parseInt(scrollDistance);
        if (!this.$el || scrollNum <= 0) {
            return;
        }
        $(this.$el).animate({scrollTop: scrollNum + 'px'}, 'fast', callback);
    };

    updated = () => {
        Ps.update(this.$el);
    };

    toBottom = (distance = 0) => {
        this.$el.scrollTop = this.$el.scrollHeight - distance;
    };

    render() {
        let cls = className('ef-scrollar-wrapper ef-scroll', {
            'ef-scroll-horizontal': this.props.horizontal
        });
        return (
            <div className={cls}>
                {this.props.horizontal ? (
                    <div className="ef-scrollar-horizontal-inner" style={{maxHeight: this.state.maxHeight + 'px'}}>
                        {this.props.children}
                    </div>
                ) : (
                    <div className="ef-scrollar-vertical-inner">
                        {this.props.children}
                    </div>
                )}
            </div>
        );
    }
}

EfScrollbar.defaultProps = {
    horizontal: false,
    noListener: false,
    classes: ''
};
EfScrollbar.propTypes = {
    horizontal: PropTypes.bool,
    noListener: PropTypes.bool,
    classes: PropTypes.string,
    children: PropTypes.element,
    onScroll: PropTypes.func,

};
export default EfScrollbar;