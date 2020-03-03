/**
 * 添加汇报模板高价组件
 */

import { Steps, Button, message } from 'antd';
import { VIEW_TYPE } from './consts';
import { hideReportPanel } from './utils';

const { Step } = Steps;

export default function(WrappedComponent) {
    return class extends React.Component {
        render() {
            const { updateState, currentStep } = this.props;

            return (
                <div>
                    <Steps current={currentStep}>
                        <Step title="1. 选择模板" />
                        <Step title="2. 设置规则" />
                    </Steps>
                    <div>
                        <WrappedComponent {...this.props} ref={elm => this.wrappedComponent = elm} />
                    </div>
                    <div>
                        {currentStep === 2 ? (
                            <Button
                                onClick={() => { updateState({ currentView: VIEW_TYPE.ADD_TPL, currentStep: 1 }); }}
                            >
                            上一步
                            </Button>
                        ) : null}

                        {currentStep === 2 ? (
                            <Button
                                onClick={this.save.bind(this)}
                            >
                            保存
                            </Button>
                        ) : null}

                        {currentStep === 1 ? (
                            <Button
                                onClick={this.next.bind(this)}
                            >
                            下一步
                            </Button>
                        ) : null}
                    </div>
                </div>
            );
        }

        next() {
            if (!this.props.selectedTpl) {
                message.warning('请选择模板');
                return;
            }

            this.props.updateState({ currentView: VIEW_TYPE.SET_RULE, currentStep: 2 });
        }

        save() {
            this.wrappedComponent.validateFields((err, values) => {
                if (!err) {
                    console.log(values);
                    //hideReportPanel()
                }
            });
        }
    };
}
