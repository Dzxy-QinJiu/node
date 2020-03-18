/**
 * 添加汇报模板高价组件
 */

import { Steps, Button, message } from 'antd';
import { VIEW_TYPE } from './consts';
import { hideReportPanel, saveTpl, renderButtonZoneFunc } from './utils';

const { Step } = Steps;

export default function(WrappedComponent) {
    return class extends React.Component {
        render() {
            const { updateState, currentStep } = this.props;
            const renderButtonZone = renderButtonZoneFunc.bind(this);

            return (
                <div>
                    <Steps current={currentStep}>
                        <Step title="选择模板" />
                        <Step title="设置规则" />
                    </Steps>
                    <div className="add-tpl-content">
                        <WrappedComponent {...this.props} ref={elm => this.wrappedComponent = elm} />
                    </div>
                    {renderButtonZone([{
                        hide: currentStep !== 2,
                        func: () => { updateState({ currentView: VIEW_TYPE.ADD_TPL, currentStep: 1 }); },
                        name: '上一步',
                    }, {
                        hide: currentStep !== 2,
                        func: this.save.bind(this),
                        name: '保存',
                    }, {
                        hide: currentStep !== 1,
                        func: this.next.bind(this),
                        name: '下一步',
                    }])}
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
                    _.each(values, (value, key) => {
                        if (_.isUndefined(value)) delete values[key];
                    });

                    if (values.status === true) {
                        values.status = 'on';
                    } else if (values.status === false) {
                        values.status = 'off';
                    }

                    const { tplList, selectedTpl } = this.props;

                    const tplData = _.find(tplList, tpl => tpl.id === selectedTpl) || {};

                    const postData = _.extend({}, tplData, values);

                    saveTpl(postData, result => {});
                    //hideReportPanel()
                }
            });
        }
    };
}
