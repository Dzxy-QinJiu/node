const PropTypes = require('prop-types');
var React = require('react');
/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/7/26.
 * 步骤条
 */
require('./index.less');
import classNames from 'classnames';
import {Steps, Popover} from 'antd';
const Step = Steps.Step;
class StepsBar extends React.Component {
    constructor(props) {
        super(props);
    }

    onClickStep(target) {
        this.props.onClickStep(target);
    }
    //渲染步骤条上的描述
    renderStepTitle(stepTitle, isCurrentStep){
        //当前执行的步骤，展示当前步骤的描述
        if (isCurrentStep) {
            return (<div className="step-title" title={stepTitle}> {stepTitle}</div>);
        }
        //不是当前执行的步骤，不展示对应的描述，但需要占位
        return (<div className="step-title"/>);
    }
    //渲染某个步骤的点与连线, index: 该条步骤的索引，stepLength:步骤数, stepHandleElement:该步骤的处理元素
    renderStepDotLine(index, stepLength, stepHandleElement){
        let currentStep = this.props.currentStepIndex;
        //步骤点前连接线的样式类
        let prefixLineCls = classNames('step-line', {
            'step-line-translate': index === 0,//第一个步骤左侧不展示横线
            'step-finished-line': index < currentStep || index - 1 < currentStep,//完成的线
            'step-waiting-line': index > currentStep//待运行的线
        });
        //步骤点的样式类
        let stepIconClass = classNames('iconfont', 'step-icon', {
            'icon-disc': index <= currentStep,//完成、当前的步骤图标是实心圆
            'icon-circle': index > currentStep//待运行的步骤图标是空心圆
        });
        //步骤点后连接线的样式类
        let suffixLineCls = classNames('step-line', {
            'step-line-translate': index === stepLength - 1,//最后一个步骤右侧不展示横线
            'step-finished-line': index < currentStep,//完成的线
            'step-waiting-line': index > currentStep || index + 1 > currentStep//待运行的线
        });
        return (
            <div className="step-dot-line">
                <hr className={prefixLineCls}/>
                <span className={stepIconClass} onClick={this.onClickStep.bind(this)}>{stepHandleElement || ''}</span>
                <hr className={suffixLineCls}/>
            </div>);
    }
    render() {
        let currentStep = this.props.currentStepIndex;
        let stepDataList = this.props.stepDataList;
        let stepLength = _.get(stepDataList, '[0]') ? stepDataList.length : 0;
        let stepWidth = 0;
        if (stepLength) {
            stepWidth = (100 / stepLength) + '%';
        }
        return (
            <span className='step-bar-component'>
                {_.get(stepDataList, '[0]') ?
                    _.map(stepDataList, (data, index) => {
                        //当前执行的步骤
                        let isCurrentStep = index === currentStep;
                        //步骤条的样式类
                        let stepClass = classNames('step-item', {
                            'step-finished-item': index < currentStep,//完成的步骤
                            'step-current-item': isCurrentStep,//当前步骤
                            'step-waiting-item': index > currentStep//待运行的步骤
                        });
                        let stepTitle = _.get(data, 'title', '');
                        return (
                            <div className={stepClass} style={{width: stepWidth}}>
                                {/* 当前执行的步骤展示步骤的描述及步骤条，不是当前执行的步骤只展示步骤条，鼠标移上时展示步骤描述*/}
                                {this.renderStepTitle(stepTitle, isCurrentStep)}
                                { isCurrentStep ? this.renderStepDotLine(index, stepLength, data.stepHandleElement) : (
                                    <Popover placement="top" content={stepTitle}>
                                        {this.renderStepDotLine(index, stepLength, data.stepHandleElement)}
                                    </Popover>)}
                            </div>);
                    }) : null
                }
            </span>);
    }
}
StepsBar.propTypes = {
    stepDataList: PropTypes.array,
    currentStepIndex: PropTypes.string,
    onClickStep: PropTypes.func
};
StepsBar.defaultProps = {
    stepDataList: [],//步骤数据列表[{title,stepHandleElement}],title:该步骤的描述，stepHandleElement:该步骤的处理元素
    currentStepIndex: 0,//当前的步骤
    onClickStep: function() {//点击圆点的触发事件
    }
};
export default StepsBar;