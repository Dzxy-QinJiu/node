/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2020/03/16.
 */
import './style.less';
import EfScrollBar from 'CMP_DIR/ef-components/ef-scrollbar';
import EfLoading from 'CMP_DIR/ef-components/ef-loading';

class LoadMore extends React.Component {
    constructor(props) {
        super(props);

        this.state = this.getInitialState();
    }

    getInitialState() {
        return {
            isTopLoading: false,
            isTopComplete: false,
            isBottomLoading: false,
            isBottomComplete: false,
            isNoMoreData: false,
            isBottomLoadingError: false,
            isReturnTop: false
        };
    }

    //监听滚动
    handleScroll = (e) => {
        let newState = {};
        let el = e.target;
        let scrollHeight = el.scrollHeight;
        const scrollTop = isNaN(el.scrollTop) ? el.pageYOffset || 0 : el.scrollTop;
        let clientHeight = el.clientHeight;

        this.toBottomistance = scrollHeight - (scrollTop + clientHeight);

        if (this._isPrcessingToTop) {
            return;
        }

        let isToTop = el.scrollTop === 0;

        newState.isReturnTop = scrollTop > clientHeight;

        if (this.props.onTopLoad && isToTop && !this.isTopLoading) {
            newState.isNoMoreData = false;
            newState.isTopLoading = true;
            newState.isTopComplete = false;
            _.isFunction(this.props.onTopLoad) && this.props.onTopLoad();
        }
        this.setState(newState);
        _.isFunction(this.props.onScroll) && this.props.onScroll(el);
    };

    //上拉加载完成
    topComplete() {
        this.setState({
            isTopLoading: false,
            isTopComplete: true
        }, () => {
            this.updateScroll();
        });
    }

    //回到顶部
    returnTop = () => {
        let self = this;
        let scrollerEl = ReactDOM.findDOMNode(this.refs.srcoller);
        this.setState({_isPrcessingToTop: true});

        this.refs.srcoller.scroll(null, function() {
            if (scrollerEl) {
                scrollerEl.scrollTop = 0;
            }
            self.setState({
                isReturnTop: false,
                _isPrcessingToTop: false
            });
        });
        _.isFunction(this.props.afterReturnTop) && this.props.afterReturnTop();
    };

    /**
     * 获取滚动条距离底部距离
     */
    getToBottomDistance() {
        return this.toBottomistance;
    }

    //更新滚动条
    updateScroll = () => {
        this.refs.srcoller.updated();
    };

    //移动到底部
    toBottom = (distance) => {
        this.refs.srcoller.toBottom(distance);
    };

    //重置状态
    reset() {
        this.setState(this.getInitialState(), () => {
            this.returnTop();
            this.updateScroll();
        });
    }

    render() {
        const isShowLoading = this.state.isTopLoading && !this.state.isTopComplete;
        return (
            <div className="ef-loadmore">
                <EfScrollBar onScroll={this.handleScroll} ref="srcoller">
                    {this.props.onTopLoad ? (
                        <div className="ef-loadmore-top" style={{display: isShowLoading ? 'block' : 'none'}}>
                            <div className="ef-loadmore-top-loading">
                                <EfLoading
                                    isShow={isShowLoading}
                                    size="small"
                                    tip={this.props.topLoadingText}>
                                </EfLoading>
                            </div>
                        </div>
                    ) : null}
                    {this.props.children}
                </EfScrollBar>
                {this.state.isReturnTop && this.props.isReturnBtnShow ? <div className="returnTop" onClick={this.returnTop}/> : null}
            </div>
        );
    }
}

LoadMore.defaultProps = {
    //偏移量
    distance: 100,
    noDataText: Intl.get('common.empty.content', '^_^ ...   没有内容'),
    topLoadingText: Intl.get('common.top.loading.text', '正在获取最新数据'),
    bottomLoadingText: Intl.get('common.bottom.loading.text', '正在获取更早的数据'),
    isReturnBtnShow: false
};
LoadMore.propTypes = {
    //是否支持上拉刷新
    onTopLoad: PropTypes.func,
    //是否支持下拉加载
    onBottomLoad: PropTypes.func,
    distance: PropTypes.number,
    noDataText: PropTypes.string,
    topLoadingText: PropTypes.string,
    bottomLoadingText: PropTypes.string,
    isReturnBtnShow: PropTypes.bool,
    children: PropTypes.element,
    onScroll: PropTypes.func,
    afterReturnTop: PropTypes.func,
};
export default LoadMore;