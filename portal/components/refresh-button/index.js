/**
 * 刷新按钮
 * */
import { Button} from 'antd';
require('./index.less');

class RefreshButton extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <Button
                className="refresh-btn btn-item"
                onClick={this.props.handleRefresh}
                title={Intl.get('common.refresh', '刷新')}
            >
                <i className="iconfont icon-refresh"></i>
            </Button>
        );
    }
}

RefreshButton.propTypes = {
    handleRefresh: PropTypes.func,
};

export default RefreshButton;