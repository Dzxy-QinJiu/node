/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/7/26.
 * 步骤条
 */
require('./index.less');
import classNames from 'classnames';
import {Steps} from 'antd';
const Step = Steps.Step;
class StepsBar extends React.Component {
    constructor(props) {
        super(props);
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
                        let stepClass = classNames('step-item', {
                            'step-finished-item': index < currentStep,//完成的步骤
                            'step-current-item': index === currentStep,//当前步骤
                            'step-waiting-item': index > currentStep//待运行的步骤
                        });
                        let stepIconClass = classNames('iconfont', 'step-icon', {
                            'icon-disc': index <= currentStep,//完成、当前的步骤图标是实心圆
                            'icon-circle': index > currentStep//待运行的步骤图标是空心圆
                        });
                        return (
                            <div className={stepClass} style={{width: stepWidth}}>
                                <div className="step-title">{data.title || ''}</div>
                                <div className="step-dot-line">
                                    <hr className={classNames('step-line', {
                                        'step-line-translate': index === 0,//第一个步骤左侧不展示横线
                                        'step-finished-line': index < currentStep || index - 1 < currentStep,//完成的线
                                        'step-waiting-line': index > currentStep//待运行的线
                                    })}/>
                                    <span className={stepIconClass}/>
                                    <hr className={classNames('step-line', {
                                        'step-line-translate': index === stepLength - 1,//最后一个步骤右侧不展示横线
                                        'step-finished-line': index < currentStep,//完成的线
                                        'step-waiting-line': index > currentStep || index + 1 > currentStep//待运行的线
                                    })}/>
                                </div>
                            </div>);
                    }) : null
                }
            </span>);
    }
}
const PropTypes = React.PropTypes;
StepsBar.propTypes = {
    stepDataList: PropTypes.array,
    currentStepIndex: PropTypes.string
};
StepsBar.defaultProps = {
    stepDataList: [],//步骤数据列表[{title,description}]
    currentStepIndex: 0,//当前的步骤
};
export default StepsBar;