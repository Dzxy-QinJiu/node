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
    errorTimer = null;

    componentWillUnmount() {
        this.isSetTimered = false;
        clearTimeout(this.successTimer);
        clearTimeout(this.errorTimer);
    }

    setTimer = () => {
        clearTimeout(this.successTimer);
        this.isSetTimered = true;
        this.successTimer = setTimeout(() => {
            this.isSetTimered = false;
            this.props.hideSaveTooltip();
        }, this.props.successShowTime);
    };
    //展示失败信息后，一定时间需要自动消失的定时器
    setErrorTimer = () => {
        clearTimeout(this.errorTimer);
        this.isSetTimered = true;
        this.errorTimer = setTimeout(() => {
            this.isSetTimered = false;
            this.props.hideSaveTooltip();
        }, this.props.errorShowTime);
    };

    renderMsgBlock() {
        if(this.props.saveResult === RESULT_TYPES.SUCCESS) {//显示成功提示信息
            if(!this.isSetTimered) {//设置成功后延时关闭的回调
                this.setTimer();
            }
            return (<span className="save-success">{this.props.saveSuccessMsg}</span>);
        }else {

            if(this.props.saveErrorMsg) {//显示失败信息
                if(this.props.errorShowTime && !this.isSetTimered){
                    this.setErrorTimer();
                }
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
                    disabled={this.props.loading || this.props.disabledBtn}
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
    saveSuccessMsg: '',//成功的提示信息(跟saveResult一起使用)
    errorShowTime: 0 ,//有失败提示，过多久要消失
    disabledBtn: false//保存按钮不可用
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
    saveSuccessMsg: PropTypes.string,
    errorShowTime: PropTypes.number,
    disabledBtn: false
};
//保存后的结果类型
SaveCancelButton.RESULT_TYPES = RESULT_TYPES;
export default SaveCancelButton;
