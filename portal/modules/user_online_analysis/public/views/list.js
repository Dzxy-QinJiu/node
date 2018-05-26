require("../css/list.less");
var AnalysisAction = require("../action/user-online-analysis-action");
var AnalysisStore = require("../store/user-online-analysis-store");
var Spinner = require("../../../../components/spinner");
var Alert = require("antd").Alert;
var AppLogoImg = require("../../../../components/appLogoImg");
var GeminiScrollbar = require("../../../../components/react-gemini-scrollbar");
var Pagination = require("antd").Pagination;
var classNames = require("classnames");
var Icon = require("antd").Icon;
var insertStyle = require("../../../../components/insert-style");
var numberFormatter = require("../utils/number-formatter");
var defaultIcon = require("../../../../components/default-image-base64").DefaultImageBase64;

//进行布局的对象
var LAYOUT = {
    //顶部导航高度
    TOPNAV_HEIGHT: 65,
    //列表上面的margin
    LIST_MARGIN_TOP: 44,
    //分页高度
    PAGINATION_HEIGHT: 28,
    //翻页上边距
    PAGINATION_PADDING_TOP: 16,
    //翻页下边距
    PAGINATION_PADDING_BOTTOM: 40
};

var AnalysisListView = React.createClass({
    displayName: 'AnalysisListView',
    //获取初始state
    getInitialState: function() {
        return AnalysisStore.getState();
    },
    //store数据变化的时候，重新渲染界面
    onStoreChange: function() {
        this.setState(AnalysisStore.getState());
    },
    //获取在线用户分析列表
    fetchAnalysisList: function(obj) {
        AnalysisAction.getUserOnlineAnalysisList({
            page: obj && 'page' in obj ? obj.page : this.state.analysisSummary.currentPage,
            page_size: 16
        });
    },
    //节点挂载完毕
    componentDidMount: function() {
        AnalysisStore.listen(this.onStoreChange);
        this.fetchAnalysisList();
        this.dynamicStyle = insertStyle(".app-logo-img-tooltip.tooltip{margin-left:7px}");
    },
    //节点将要被移除
    componentWillUnmount: function() {
        AnalysisStore.unlisten(this.onStoreChange);
        this.dynamicStyle.destroy();
    },
    //渲染loading效果
    renderLoadingBlock: function() {
        if(!this.state.analysisSummary.firstLoading || this.state.analysisSummary.resultType !== 'loading') {
            return null;
        }
        return (<Spinner className="first-loading"/>);
    },
    //查看一个应用的详情
    viewAppDetail: function(app_id,app_name) {
        AnalysisAction.viewUserOnlineAnalysisByAppId({
            app_id: app_id,
            app_name: app_name
        });
    },
    //渲染列表
    renderList: function() {
        if(this.state.analysisSummary.resultType !== '' && this.state.analysisSummary.firstLoading) {
            return null;
        }
        var list = this.state.analysisSummary.list;
        if(!list.length) {
            return (<Alert type="info" showIcon message="暂无在线用户统计数据"/>);
        }

        var listWrapHeight = $(window).height() -
            LAYOUT.TOPNAV_HEIGHT -
            LAYOUT.LIST_MARGIN_TOP -
            LAYOUT.PAGINATION_HEIGHT -
            LAYOUT.PAGINATION_PADDING_BOTTOM -
            LAYOUT.PAGINATION_PADDING_TOP;


        var _this = this;

        return (
            <div className="user_online_analysis_list_content" style={{height: listWrapHeight}}>
                <GeminiScrollbar>
                    <ul className="list list-unstyled">
                        {
                            list.map(function(obj , idx) {
                                return (
                                    <li key={obj.app_id}>
                                        <div className="list-item-content" onClick={_this.viewAppDetail.bind(_this,obj.app_id,obj.app_name)}>
                                            <div className="header">
                                                <div className="app-logo col-xs-4">
                                                    <AppLogoImg
                                                        id={obj.app_id}
                                                        title={obj.app_name}
                                                        size={78}
                                                        showTooltip={true}
                                                    />
                                                </div>
                                                <div className="app-desc col-xs-8">
                                                    <p>{numberFormatter.numberAddComma(obj.total)}</p>
                                                    <em>{obj.app_name}在线用户数</em>
                                                </div>
                                            </div>
                                            <div className="footer">
                                                <div className="clearfix">
                                                    <div className="col-xs-6">正式{numberFormatter.numberAddComma(obj.formal)}</div>
                                                    <div className="col-xs-6">试用{numberFormatter.numberAddComma(obj.trial)}</div>
                                                </div>
                                                <div className="clearfix">
                                                    <div className="col-xs-6">未过期{numberFormatter.numberAddComma(obj.not_expired)}</div>
                                                    <div className="col-xs-6">已过期{numberFormatter.numberAddComma(obj.expired)}</div>
                                                </div>
                                                <div className="more">
                                                    <Icon type="ellipsis" />
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })
                        }
                    </ul>
                </GeminiScrollbar>
            </div>
        );
    },
    //分页参数改变
    paginationChange: function(page) {
        AnalysisAction.analysisSummaryPaginationChange(page);
        //重新获取数据
        this.fetchAnalysisList({page: page});
    },
    //渲染分页
    renderPagination: function() {
        if(this.state.analysisSummary.resultType !== '' && this.state.analysisSummary.firstLoading) {
            return null;
        }
        var total = this.state.analysisSummary.total;
        var current = this.state.analysisSummary.currentPage;
        var loading = null;
        if(!this.state.analysisSummary.firstLoading && this.state.analysisSummary.resultType === 'loading') {
            loading = <Icon type="loading"/>;
        }
        return (
            <div className="ant-pagination-wrap">
                <div className="clearfix">
                    <Pagination
                        total={total}
                        current={current}
                        pageSize={16}
                        onChange={this.paginationChange}
                    />
                    {loading}
                </div>
            </div>
        );
    },
    render: function() {
        return (
            <div className="user_online_analysis_list">
                {this.renderLoadingBlock()}
                {this.renderList()}
                {this.renderPagination()}
            </div>
        );
    }
});

module.exports = AnalysisListView;