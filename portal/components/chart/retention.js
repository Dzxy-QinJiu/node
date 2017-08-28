/**
 * 用户留存
 */
require("./style.scss");
var Spinner = require("../spinner");
var immutable = require("immutable");
var Table = require("antd").Table;

//日期
const DATE_FORMAT_WITH_YEAR = oplateConsts.DATE_FORMAT;
const DATE_FORMAT_WITHOUT_YEAR = oplateConsts.DATE_MONTH_DAY_FORMAT;

var Retention = React.createClass({
    echartInstance : null,
    getDefaultProps : function() {
        return {
            chartData : [],
            title :Intl.get("oplate.user.analysis.9", "用户留存"),
            height:214,
            resultType : 'loading',
        };
    },
    getColumnName(index, diffDay) {
        let columnName;

        if (index === 0) {
            if (diffDay < 7) {
                columnName = Intl.get("oplate.user.analysis.23", "当天");
            } else if (diffDay >= 7 && diffDay < 31) {
                columnName = Intl.get("oplate.user.analysis.34", "当周");
            } else {
                columnName = Intl.get("oplate.user.analysis.37", "当月");
            }
        } else if (index === 1) {
            if (diffDay < 7) {
                columnName = Intl.get("oplate.user.analysis.24", "次日");
            } else if (diffDay >= 7 && diffDay < 31) {
                columnName = Intl.get("oplate.user.analysis.35", "次周");
            } else {
                columnName = Intl.get("oplate.user.analysis.38", "次月");
            }
        } else {
            if (diffDay < 7) {
                columnName = Intl.get("oplate.user.analysis.25", "{count}天后",{count: index});
            } else if (diffDay >= 7 && diffDay < 31) {
                columnName = Intl.get("oplate.user.analysis.36", "{count}周后",{count: index});
            } else {
                columnName = Intl.get("oplate.user.analysis.39", "{count}月后",{count: index});
            }
        }

        return columnName;
    },
    shouldComponentUpdate : function(nextProps) {
        if(immutable.is(this.props.chartData , nextProps.chartData) && this.props.resultType === nextProps.resultType) {
            return false;
        }
        return true;
    },
    renderTable : function() {
        if (!_.isArray(this.props.chartData) || !this.props.chartData.length) {
            return (<div className="nodata">{Intl.get("common.no.data","暂无数据")}</div>);
        }

        //表格列
        let columns = [];
        //表格数据
        const list = [];
        //当前选择的时间段内各点的时间戳
        const timestamps = [];
        //当前选择的时间段内各点的显示值，如 03-06，用于表格首列
        const dates = [];
        //时间相关列名，如“当天”、“次日”、“n天后”
        const dateColumns = [];
        //开始时间的moment表示，用于计算时间区间包含的天数及确定时间格式
        const startTimeMoment = moment(+this.props.startTime);
        //结束时间的moment表示，用于计算时间区间包含的天数及确定时间格式
        const endTimeMoment = moment(+this.props.endTime);
        //时间区间包含的天数
        const diffDay = endTimeMoment.diff(startTimeMoment, "days");
        //时间格式，分带年和不带年的两种格式
        const DATE_FORMAT = startTimeMoment.year() === endTimeMoment.year() ? DATE_FORMAT_WITHOUT_YEAR : DATE_FORMAT_WITH_YEAR;

        //填充表格数据
        _.each(this.props.chartData, (dataItem, dataIndex) => {
            const timestamp = dataItem.timestamp;
            //填充时间戳数组
            timestamps.push(timestamp);
            const date = moment(timestamp).format(DATE_FORMAT);
            //填充时间值数组
            dates.push(date);

            const columnName = this.getColumnName(dataIndex, diffDay);
            //填充时间列名数组
            dateColumns.push(columnName);

            //超出当前日期的数据不予显示
            if (dataItem.timestamp > moment().valueOf()) return;

            //列表项，相当于表格行
            const listItem = {};
            //将日期加入列表项
            listItem.date = date;
            //将新增数加入列表项
            listItem.added = dataItem.count;

            //将各天的活跃值加入列表项
            _.each(dataItem.actives, (active, index) => {
                const columnName = this.getColumnName(index, diffDay);
                //将该活跃点的数据加入列表项
                listItem[columnName] = active.active;
            });

            //将列表项加入列表数组
            list.push(listItem);
        });

        //用“时间”和“新增数”这两列加上时间相关列，构造表格列数组
        columns = ["date", "added"].concat(dateColumns);

        var tableColumns = columns.map((item) => {
            var title = item;
            if(item === 'date') {
                title = Intl.get("common.login.time", "时间");
            } else if(item === 'added') {
                title = Intl.get("oplate.user.analysis.32", "新增数");
            }
            return {
                title :title,
                dataIndex : item,
                render : function(data) {
                    if(item === 'date') {
                        return <b>{data}</b>
                    } else {
                        return <span>{data}</span>
                    }
                }
            };
        });
        return (
            <Table columns={tableColumns} dataSource={list} pagination={false}/>
        );
    },
    render : function() {
        return (
            <div className="analysis-chart">
                {this.props.resultType === 'loading'?
                    (
                        <div className="loadwrap" style={{height:this.props.height}}>
                            <Spinner/>
                        </div>
                    ) : (
                        <div>
                            <div ref="chart" style={{width:this.props.width,height:this.props.height}} className="chart" data-title={this.props.title}>
                                {this.renderTable()}
                            </div>
                        </div>
                    )
                }
            </div>
        );
    }
});

module.exports = Retention;
