/**
 * Copyright (c) 2018-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by tangmaoqin on 2020/5/31.
 */
import {SearchInput} from 'antc';
import {Icon} from 'antd';
import {getCompanyListByName} from 'MOD_DIR/leads-recommend/public/ajax/leads-recommend-ajax';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import Trace from 'LIB_DIR/trace';

const KEYCODE = {
    ENTER: 13
};

class SearchInputPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            keyword: this.props.keyword,
            keywordList: []
        };
    }

    componentDidMount() {
        let input = '.search-input-container .search-input';
        //添加keydown事件
        $(input).on('keydown', this.onKeyDown);
        this.getCompanyListByName(this.state.keyword);
        if(this.searchInputRef) {
            this.searchInputRef.state.keyword = this.state.keyword;
        }
        $(input).focus();
    }

    componentWillUnmount() {
        let input = '.search-input-container .search-input';
        $(input).off('keydown', this.onKeyDown);
    }

    onKeyDown = (e) => {
        if(e.keyCode === KEYCODE.ENTER) {
            Trace.traceEvent(ReactDOM.findDOMNode(this), '使用enter搜索关键词：' + e.target.value);
            this.props.handleShowSearchPanel(false);
            _.isFunction(this.props.onSearchButtonClick) && this.props.onSearchButtonClick(e.target.value);
        }
    };

    getKeyWordPlaceholder() {
        return [Intl.get('register.company.nickname', '公司名称'), Intl.get('clue.recommend.industry.name', '行业名称'), Intl.get('common.product.name', '产品名称')].join('/');
    }

    searchChange = (value) => {
        let keyword = _.trim(value || '');
        this.getCompanyListByName(keyword);
        this.setState({keyword});
    };

    //根据关键词获取推荐信息
    getCompanyListByName = (value) => {
        getCompanyListByName({
            name: value
        }).then((result) => {
            let list = _.isArray(result.list) ? result.list : [];
            this.setState({keywordList: list});
        }, () => {
            this.setState({keywordList: []});
        });
    };

    closeSearchInput = () => {
        this.setState({keyword: '', keywordList: []});
    };

    onKeywordListClick = (item) => {
        this.props.handleShowSearchPanel(false);
        _.isFunction(this.props.onKeywordListClick) && this.props.onKeywordListClick(item);
    };

    onSearchButtonClick = () => {
        this.props.handleShowSearchPanel(false);
        _.isFunction(this.props.onSearchButtonClick) && this.props.onSearchButtonClick(this.state.keyword);
    };

    handleShowSearchPanel = () => {
        this.props.handleShowSearchPanel(false);
    }

    renderSearchInput = () => {
        return (
            <div className="clue-recommend-filter-search-wrapper mobile-search-input-container search-input-container">
                <SearchInput
                    key="search-input"
                    ref={ref => this.searchInputRef = ref}
                    searchEvent={this.searchChange}
                    searchPlaceHolder ={this.getKeyWordPlaceholder()}
                    closeSearchInput={this.closeSearchInput}
                />
                <span className="ant-input-group-addon" data-tracename="点击搜索关键词按钮" onClick={this.onSearchButtonClick}>
                    <Icon type="search" className="search-icon search-confirm-btn"/>
                </span>
            </div>
        );
    };

    renderSearchList() {
        let {keywordList} = this.state;
        let divHeight = $(window).height();
        let contentEl = $('.recommend-clue-search-list');
        if(contentEl.length) {
            divHeight -= contentEl.offset().top;
        }
        return (
            <div className='recommend-clue-search-list' style={{height: divHeight}}>
                <GeminiScrollbar>
                    <div className="recommend-clue-search-list-content">
                        {_.map(keywordList, item => {
                            return (<div className="recommend-clue-search-list-item" key={item.id} onClick={this.onKeywordListClick.bind(this, item)}>{item.name}</div>);
                        })}
                    </div>
                </GeminiScrollbar>
            </div>
        );
    }

    render() {
        return (
            <RightPanelModal
                className="search-panel-modal"
                isShowCloseBtn
                title={this.renderSearchInput()}
                content={this.renderSearchList()}
                onClosePanel={this.handleShowSearchPanel}
            />
        );
    }
}

SearchInputPanel.propTypes = {
    keyword: PropTypes.string,
    onSearchButtonClick: PropTypes.func,
    onKeywordListClick: PropTypes.func,
    handleShowSearchPanel: PropTypes.func,
};
export default SearchInputPanel;