const PropTypes = require('prop-types');
var React = require('react');


var language = require('../../../public/language/getLanguage');
if (language.lan() === 'es' || language.lan() === 'en') {
    require('./index-es_VE.less');
}else if (language.lan() === 'zh'){
    require('./index-zh_CN.less');
}
import Button from 'antd';
import {RightPanelSubmit,RightPanelCancel} from '../../rightPanel';
import classNames from 'classnames';
/**
 * 上一步、下一步的节点和样式
 */

class OperationStepsFooter extends React.Component {
    constructor(props) {
        super(props);
    }

    turnStep(action) {
        switch (action) {
            case 'prev':
            case 'next':
                this.props.onStepChange(action);
                break;
            case 'finish':
                this.props.onFinish();
                break;
        }
    }

    renderPrevBtn() {
        if (this.props.currentStep === 0) {
            return null;
        }
        return (
            <RightPanelCancel onClick={this.turnStep.bind(this,'prev')}>{this.props.prevText}</RightPanelCancel>
        );
    }

    renderNextBtn() {
        if (this.props.currentStep === (this.props.totalStep - 1)) {
            return null;
        }
        return (
            <RightPanelSubmit onClick={this.turnStep.bind(this,'next')}>{this.props.nextText}</RightPanelSubmit>
        );
    }

    renderFinishBtn() {
        if (this.props.currentStep !== (this.props.totalStep - 1)) {
            return null;
        }
        return (
            <RightPanelSubmit onClick={this.turnStep.bind(this,'finish')}
                disabled={this.props.isSubmiting}>{this.props.finishText}</RightPanelSubmit>
        );
    }

    render() {
        const props = this.props;
        const {currentStep,totalStep,prevText,nextText,finishText,onStepChange,onFinish,children,className,...restProps} = props;
        const cls = classNames('operation-steps-footer', className);
        return (
            <div className={cls} {...restProps}>
                <div className="pull-left">{props.children}</div>
                <div className="btns">
                    {this.renderFinishBtn()}
                    {this.renderNextBtn()}
                    {this.renderPrevBtn()}
                </div>
            </div>
        );
    }
}

function noop() {
}
//默认属性
OperationStepsFooter.defaultProps = {
    currentStep: 0,
    totalStep: 3,
    prevText: Intl.get('user.user.add.back', '上一步'),
    nextText: Intl.get('user.user.add.next', '下一步'),
    finishText: Intl.get('user.user.add.finish', '完成'),
    onStepChange: noop,
    onFinish: noop,
    className: ''
};
//属性类型配置
OperationStepsFooter.propTypes = {
    currentStep: PropTypes.number,
    totalStep: PropTypes.number,
    onStepChange: PropTypes.func,
    onFinish: PropTypes.func,
    prevText: PropTypes.string,
    nextText: PropTypes.string,
    finishText: PropTypes.string,
    className: PropTypes.string
};

//高度恒定。54
OperationStepsFooter.height = 54;

export default OperationStepsFooter;