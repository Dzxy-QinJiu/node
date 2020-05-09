/**
 * 刷新按钮
 * */
import { Button} from 'antd';
import classnames from 'classnames';
require('./index.less');

class RefreshButton extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const refreshCls = classnames('refresh-btn', this.props.className);
        return (
            <Button
                className={refreshCls}
                title={Intl.get('common.refresh', '刷新')}
                onClick={this.props.handleRefresh}
                data-tracename="点击刷新按钮"
            >
                <i className="iconfont icon-refresh"></i>
            </Button>
        );
    }
}

RefreshButton.defaultProps = {
    handleRefresh: () => {},
    className: '',
};

RefreshButton.propTypes = {
    handleRefresh: PropTypes.func,
    className: PropTypes.string,
};

export default RefreshButton;