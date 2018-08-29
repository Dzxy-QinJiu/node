/**
 * 用户留存
 */
var React = require('react');
require('./index.less');
var Spinner = require('../../../../../components/spinner');
var immutable = require('immutable');
var Table = require('antd').Table;

var Retention = React.createClass({
    echartInstance: null,
    getDefaultProps: function() {
        return {
            data: [],
            title: Intl.get('oplate.user.analysis.9', '用户留存'),
            height: 214,
            resultType: 'loading',
        };
    },
    shouldComponentUpdate: function(nextProps) {
        if(immutable.is(this.props.data , nextProps.data) && this.props.resultType === nextProps.resultType) {
            return false;
        }
        return true;
    },
    renderTable: function() {
        var tableColumns = this.props.data.columns.map((item) => {
            var title = item;
            if(item === 'date') {
                title = Intl.get('common.login.time', '时间');
            } else if(item === 'added') {
                title = Intl.get('oplate.user.analysis.32', '新增数');
            }
            return {
                title: title,
                dataIndex: item,
                render: function(data) {
                    if(item === 'date') {
                        return <b>{data}</b>;
                    } else {
                        return <span>{data}</span>;
                    }
                }
            };
        });
        return (
            <Table columns={tableColumns} dataSource={this.props.data.tableJsonList} pagination={false}/>
        );
    },
    render: function() {
        var _this = this;
        return (
            <div className="retention_table" ref="wrap">
                {this.props.resultType === 'loading' ?
                    (
                        <div className="loadwrap" style={{height: this.props.height}}>
                            <Spinner/>
                        </div>
                    ) :
                    this.renderTable()
                }
            </div>
        );
    }
});

module.exports = Retention;

