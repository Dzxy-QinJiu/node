/**
 * 刷新按钮
 * */
require('./index.less');

class RefreshButton extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <span className="refresh-btn">
                <i className="iconfont  icon-refresh refresh" title={Intl.get('common.refresh', '刷新')}
                    onClick={this.props.handleRefresh} data-tracename="点击刷新按钮"></i>
            </span>
        );
    }
}

export default RefreshButton;