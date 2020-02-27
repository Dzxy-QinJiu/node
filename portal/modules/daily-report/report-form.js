/**
 * 填写报告
 */

import { Button } from 'antd';
import { VIEW_TYPE } from './consts';

class ReportForm extends React.Component {
    state = {
        currentView: VIEW_TYPE.ADD_TPL,
    }

    render() {
        return (
            <div>
                填写报告
                <Button
                    onClick={() => { this.props.changeView(VIEW_TYPE.ADD_TPL); }}
                >
                    取消
                </Button>
                <Button
                    onClick={() => { this.props.changeView(VIEW_TYPE.PREVIEW_TPL); }}
                >
                    预览
                </Button>
                <Button
                    onClick={() => { this.props.changeView(VIEW_TYPE.ADD_TPL); }}
                >
                    保存
                </Button>
            </div>
        );
    }
}

export default ReportForm;
