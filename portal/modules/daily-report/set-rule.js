/**
 * 设置规则
 */

import { Button } from 'antd';
import { VIEW_TYPE } from './consts';
import { hideReportPanel } from './utils';

class SetRule extends React.Component {
    state = {
        currentView: VIEW_TYPE.ADD_TPL,
    }

    render() {
        return (
            <div>
                设置规则
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
            </div>
        );
    }
}

export default SetRule;
