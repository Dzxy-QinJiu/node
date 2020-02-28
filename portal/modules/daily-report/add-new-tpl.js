/**
 * 添加模板
 */

import { Button } from 'antd';
import { VIEW_TYPE } from './consts';

class AddNewTpl extends React.Component {
    state = {
        currentView: VIEW_TYPE.ADD_TPL,
    }

    render() {
        return (
            <div>
                添加模板
                <Button
                    onClick={() => { this.props.updateState({ currentView: VIEW_TYPE.ADD_TPL }); }}
                >
                    取消
                </Button>
                <Button
                    onClick={() => { this.props.updateState({ currentView: VIEW_TYPE.PREVIEW_TPL }); }}
                >
                    预览
                </Button>
                <Button
                    onClick={() => { this.props.updateState({ currentView: VIEW_TYPE.ADD_TPL }); }}
                >
                    保存
                </Button>
            </div>
        );
    }
}

export default AddNewTpl;
