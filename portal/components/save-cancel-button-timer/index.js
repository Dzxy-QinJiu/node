/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2019/09/29.
 */
// 带有成功后的timer提示，提交保存按钮
require('./index.less');
import {Button, Icon} from 'antd';
import AlertTimer from 'CMP_DIR/alert-timer';
const RESULT_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
};

class SaveCancelBtnTimer extends React.Component{
    constructor(props) {
        super(props);
    }
    renderMsgBlock() {
        if(this.props.isUseTimerTip) {
            if(this.props.saveResult) {
                let saveResult = this.props.saveResult;
                return (
                    <div className="indicator">
                        <AlertTimer
                            showIcon
                            time={saveResult === RESULT_TYPES.ERROR ? this.props.errorShowTime : this.props.successShowTime}
                            message={this.props.saveMsg}
                            type={saveResult}
                            onHide={saveResult === RESULT_TYPES.ERROR ? function(){} : this.props.hideSaveTooltip.bind(this)}
                        />
                    </div>
                );
            }else { return null; }
        }else {
            if(this.props.saveMsg) {
                return (<span className="save-error">{this.props.saveMsg}</span>);
            }else { return null; }
        }
    }
    render() {
        return (
            <div className="button-timer-container">
                {this.props.loading ? (<Icon type="loading" className="save-loading"/>) : this.renderMsgBlock()}
                <Button
                    className="button-save" type="primary"
                    onClick={this.props.handleSubmit.bind(this)}
                    disabled={this.props.loading}
                >
                    {this.props.okBtnText || Intl.get('common.save', '保存')}
                </Button>
                {this.props.hideCancelBtns ? null : (
                    <Button className="button-cancel" onClick={this.props.handleCancel.bind(this)}>
                        {this.props.cancelBtnText || Intl.get('common.cancel', '取消')}
                    </Button>
                )}
            </div>
        );
    }
}
SaveCancelBtnTimer.defaultProps = {
    loading: false,//是否正在保存
    saveMsg: '',//保存后的提示信息
    okBtnText: '',//保存按钮上的描述
    cancelBtnText: '',//取消按钮上的描述
    handleSubmit: function() {
    },//保存的处理
    handleCancel: function() {
    },//取消的处理
    hideSaveTooltip: function() {
    },//去掉保存后提示信息
    hideCancelBtns: false,//是否显示取消按钮
    saveResult: '',//保存后的结果（success, error）
    isUseTimerTip: false,//是否使用带定时器的提示
    errorShowTime: 3000,//失败后，提示信息显示的时间
    successShowTime: 600,//成功后，提示信息显示的时间
};
SaveCancelBtnTimer.propTypes = {
    handleSubmit: PropTypes.func,
    loading: PropTypes.bool,
    okBtnText: PropTypes.string,
    handleCancel: PropTypes.func,
    hideSaveTooltip: PropTypes.func,
    cancelBtnText: PropTypes.string,
    saveMsg: PropTypes.string,
    hideCancelBtns: PropTypes.bool,
    saveResult: PropTypes.string,
    isUseTimerTip: PropTypes.bool,
    errorShowTime: PropTypes.number,
    successShowTime: PropTypes.number,
};
//保存后的结果类型
SaveCancelBtnTimer.RESULT_TYPES = RESULT_TYPES;

module.exports = SaveCancelBtnTimer;
