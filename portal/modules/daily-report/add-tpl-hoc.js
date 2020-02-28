/**
 * 添加汇报模板高价组件
 */

import { Steps, Button } from 'antd';
import { VIEW_TYPE } from './consts';

const { Step } = Steps;

export default function(WrappedComponent) {
    return class extends React.Component {
        render() {
            return (
                <div>
                    <Steps current={this.props.currentStep}>
                        <Step title="1. 选择模板" />
                        <Step title="2. 设置规则" />
                    </Steps>
                    <div>
                        <WrappedComponent {...this.props} />
                    </div>
                    <div>
                        <Button
                            onClick={() => { this.props.updateState({ currentView: VIEW_TYPE.ADD_TPL, currentStep: 1 }); }}
                        >
                            上一步
                        </Button>
                        <Button
                            onClick={() => { hideReportPanel(); }}
                        >
                            保存
                        </Button>
                        <Button
                            onClick={() => { this.props.updateState({ currentView: VIEW_TYPE.SET_RULE, currentStep: 2 }); }}
                        >
                            下一步
                        </Button>
                    </div>
                </div>
            );
        }
    };
}
