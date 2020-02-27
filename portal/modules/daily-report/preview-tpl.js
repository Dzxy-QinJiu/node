/**
 * 预览模板
 */

import { Button } from 'antd';
import { VIEW_TYPE } from './consts';

class PreviewTpl extends React.Component {
    state = {
        currentView: VIEW_TYPE.ADD_TPL,
    }

    render() {
        return (
            <div>
                预览模板
                <Button
                    onClick={() => { this.props.changeView(VIEW_TYPE.EDIT_TPL); }}
                >
                    返回
                </Button>
            </div>
        );
    }
}

export default PreviewTpl;
