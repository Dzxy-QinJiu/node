require('./css/index.less');
import React from 'react';
import rightPanelUtil from 'CMP_DIR/rightPanel/index';
const RightPanelClose = rightPanelUtil.RightPanelClose;
import TopNav from 'CMP_DIR/top-nav';
import {FilterInput} from 'CMP_DIR/filter';
import {SearchInput, AntcTable} from 'antc';
import userData from 'PUB_DIR/sources/user-data';

class ClueExtract extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showFilterList: userData.getUserData().isCommonSales ? true : false,//是否展示线索筛选区域
        };
    }
    // 关闭提取线索界面
    closeExtractCluePanel = () => {
        this.props.closeExtractCluePanel();
    }

    // 筛选
    toggleList = () => {
        this.setState({
            showFilterList: !this.state.showFilterList
        });
    };

    searchFullTextEvent = (keyword) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.search-container'), '根据关键字搜索');
    };

    render = () => {
        return (
            <div className="extract-clue-panel">
                <div className='extract-clue-top-nav-wrap date-picker-wrap'>
                    <div className="search-container">
                        <div className="search-input-wrapper">
                            <FilterInput
                                ref="filterinput"
                                toggleList={this.toggleList.bind(this)}
                            />
                        </div>
                        {false ? (
                            <div className="clue-list-selected-tip">
                                <span className="iconfont icon-sys-notice" />
                                {this.renderSelectClueTips()}
                            </div>
                        ) : <SearchInput
                            searchEvent={this.searchFullTextEvent}
                            searchPlaceHolder ={Intl.get('clue.search.full.text','全文搜索')}
                        />}
                    </div>
                    <RightPanelClose onClick={this.closeExtractCluePanel}/>
                </div>
                <div className='extract-clue-content-container'>

                </div>
            </div>
        );
    }
}

ClueExtract.propTypes = {
    closeExtractCluePanel: PropTypes.func,
};

export default ClueExtract;