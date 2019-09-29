var PropTypes = require('prop-types');
var React = require('react');
/**
 * 详情中保存、取消按钮的组件（包括保存的等待、错误提示）
 * Created by wangliping on 2018/3/27.
 */
require('./index.less');
import {Button, Icon} from 'antd';
const RESULT_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
};
class SaveCancelButton extends React.Component {
    constructor(props) {
        super(props);
    }

    isSetTimered = false;

    successTimer = null;

    componentWillUnmount() {
        this.isSetTimered = false;
        clearTimeout(this.successTimer);
    }

    setTimer = () => {
        clearTimeout(this.successTimer);
        this.isSetTimered = true;
        this.successTimer = setTimeout(() => {
            this.isSetTimered = false;
            this.props.hideSaveTooltip();
        }, this.props.successShowTime);
    };

    renderMsgBlock() {
        if(this.props.saveResult === RESULT_TYPES.SUCCESS) {//显示成功提示信息
            if(!this.isSetTimered) {//设置成功后延时关闭的回调
                this.setTimer();
            }
            return (<span className="save-success">{this.props.saveErrorMsg}</span>);
        }else {
            if(this.props.saveErrorMsg) {//显示失败信息
                return (<span className="save-error">{this.props.saveErrorMsg}</span>);
            }else { return null; }
        }
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
                {this.props.loading ? (<Icon type="loading" className="save-loading"/>) : this.renderMsgBlock()}
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
    hideSaveTooltip: function() {
    },//去掉保存后提示信息
    hideCancelBtns: false,
    saveResult: '',//保存后的结果（success, error）
    successShowTime: 600,//成功后，提示信息显示的时间
};
SaveCancelButton.propTypes = {
    handleSubmit: PropTypes.func,
    loading: PropTypes.bool,
    okBtnText: PropTypes.string,
    handleCancel: PropTypes.func,
    hideSaveTooltip: PropTypes.func,
    cancelBtnText: PropTypes.string,
    saveErrorMsg: PropTypes.string,
    hideCancelBtns: PropTypes.bool,
    saveResult: PropTypes.string,
    successShowTime: PropTypes.number,
};
//保存后的结果类型
SaveCancelButton.RESULT_TYPES = RESULT_TYPES;
export default SaveCancelButton;