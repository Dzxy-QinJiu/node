var PropTypes = require('prop-types');
var React = require('react');
/**
 * 详情中保存、取消按钮的组件（包括保存的等待、错误提示）
 * Created by wangliping on 2018/3/27.
 */
require('./index.less');
import {Button, Icon} from 'antd';
class SaveCancelButton extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="button-container">
                {this.props.hideCancelBtns ? null : <Button className="button-cancel" onClick={this.props.handleCancel.bind(this)}>
                    {this.props.cancelBtnText || Intl.get('common.cancel', '取消')}
                </Button> }
                <Button className="button-save" type="primary"
                    onClick={this.props.handleSubmit.bind(this)}
                    disabled={this.props.loading}
                >
                    {this.props.okBtnText || Intl.get('common.save', '保存')}
                </Button>
                {this.props.loading ? (
                    <Icon type="loading" className="save-loading"/>) : this.props.saveErrorMsg ? (
                    <span className="save-error">{this.props.saveErrorMsg}</span>
                ) : null}
            </div>
        );
    }
}
SaveCancelButton.defaultProps = {
    loading: false,//是否正在保存
    saveErrorMsg: '',//保存的错误提示
    okBtnText: '',//保存按钮上的描述
    cancelBtnText: '',//取消按钮上的描述
    handleSubmit: function() {
    },//保存的处理
    handleCancel: function() {
    },//取消的处理
    hideCancelBtns: false
};
SaveCancelButton.propTypes = {
    handleSubmit: PropTypes.func,
    loading: PropTypes.bool,
    okBtnText: PropTypes.string,
    handleCancel: PropTypes.func,
    cancelBtnText: PropTypes.string,
    saveErrorMsg: PropTypes.string,
    hideCancelBtns: PropTypes.bool,
};
export default SaveCancelButton;