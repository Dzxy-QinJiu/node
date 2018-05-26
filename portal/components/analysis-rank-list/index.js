require("./index.less");
var AnalysisRealmCount = require("../analysis-realm-count");
var AnalysisRankList = React.createClass({
    getDefaultProps : function() {
        return {
            dataList : [],
            total : 0,
            title : '当前安全域开通总数',
            //没数据的时候显示假数据
            noData : false,
            //单位
            unit : '个'
        };
    },
    render : function() {
        var total = this.props.total;
        var list = this.props.dataList;
        var _this = this;
        return (
            <div className="analysis-rank-list">
                <AnalysisRealmCount title={this.props.title} total={total}/>
                <ul className="list-unstyled">
                    {
                        this.props.noData ?
                            _.range(8).map(function(item , idx) {
                                return (
                                    <li key={idx}>
                                        <em data-rank={idx+1}></em>
                                        <span>-</span>
                                        <i>-</i>
                                        <b>-</b>
                                    </li>
                                );
                            }):
                            this.props.dataList.map(function(item , idx) {
                                return (
                                    <li key={idx}>
                                        <em data-rank={idx+1}></em>
                                        <span>{item.name}</span>
                                        <i>{item.value + (_this.props.unit || '')}</i>
                                        <b>{(100 * (item.value/total)).toFixed(1) + '%'}</b>
                                    </li>
                                );
                            })
                    }
                </ul>
            </div>
        );
    }
});

module.exports = AnalysisRankList;