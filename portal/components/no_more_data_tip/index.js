var Alert = require('antd').Alert;
require('./index.less');
const CSS_ID_PREFIX = 'no_more_data_tip_';
var insertStyle = require('../insert-style');
var NoMoreDataTip = React.createClass({
    getInitialState: function() {
        return {
            id: _.uniqueId(CSS_ID_PREFIX),
            style: null
        };
    },
    componentDidMount: function() {
        var fontSize = (this.props.fontSize + '').replace('px$','');
        var cssText = `#${this.state.id} .ant-alert,
                     #${this.state.id} .ant-alert-icon{
                         font-size:${this.props.fontSize}px !important;
                     }`;
        this.state.style = insertStyle(cssText);
    },
    componentWillUnmount: function() {
        this.state.style && this.state.style.destroy();
        this.state.style = null;
    },
    getDefaultProps: function() {
        return {
            message: Intl.get('common.no.more.data','没有更多数据了'),
            fontSize: 14,
            show: function(){}
        };
    },
    render: function() {
        var showTip = this.props.show();
        if(!showTip) {
            return null;
        }
        return (<div className="no-more-data-tip" id={this.state.id}>
            <Alert message={this.props.message} type="info" showIcon/>
        </div>);
    }
});

module.exports = NoMoreDataTip;