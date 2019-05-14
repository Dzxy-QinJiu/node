/**
 * 确认修改用户状态组件
 * */

import { Switch, Popconfirm } from 'antd';

class ConfirmSwitchStatus extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false // 是否弹出修改状态的确认框，默认false
        };
    }

    handleConfirm = () => {
        this.setState({
            visible: false
        }, () => {
            this.props.handleConfirm();
        });
    };

    handleCancel = () => {
        this.setState({
            visible: false
        });
    };

    handleClick = () => {
        this.setState({
            visible: true
        });
    };

    render = () => {
        return (
            <div>
                <Popconfirm
                    visible={this.state.visible}
                    placement={this.props.placement}
                    okText={this.props.okText}
                    cancelText={this.props.cancelText}
                    onConfirm={this.handleConfirm}
                    onCancel={this.handleCancel}
                    title={this.props.title}
                >
                    <Switch
                        checked={this.props.status}
                        checkedChildren={this.props.checkedContent}
                        unCheckedChildren={this.props.unCheckedContent}
                        onClick={this.handleClick}
                    />
                </Popconfirm>
            </div>
        );
    };
}

ConfirmSwitchStatus.defaultProps = {
    placement: 'bottomRight', // 弹出位置
    okText: Intl.get('common.confirm', '确认'), // 气泡确认框确认按钮文字
    cancelText: Intl.get('common.cancel', '取消'), // 气泡确认框取消按钮文字
    title: '', // 气泡确认框的描述
    handleConfirm: function() {}, // 气泡点击确认的处理
    handleCancel: function() {}, // 气泡点击取消的处理
    checkedContent: Intl.get('common.enabled', '启用'), // switch选中时的内容
    unCheckedContent: Intl.get('common.stop', '停用'), // switch未选中时的内容
    handleClick: function() {}, // switch点击时的处理
    status: true, // 用户状态
};

ConfirmSwitchStatus.propTypes = {
    placement: PropTypes.string,
    okText: PropTypes.string,
    cancelText: PropTypes.string,
    title: PropTypes.string,
    handleConfirm: PropTypes.func,
    handleCancel: PropTypes.func,
    checkedContent: PropTypes.string,
    unCheckedContent: PropTypes.string,
    handleClick: PropTypes.func,
    status: PropTypes.bool,
};

export default ConfirmSwitchStatus;