/**
 * 编辑模板
 */

import { Button } from 'antd';
import { VIEW_TYPE } from './consts';

class EditTpl extends React.Component {
    state = {
        currentView: VIEW_TYPE.ADD_TPL,
    }

    render() {
        return (
            <div>
                编辑模板
                <Button
                    onClick={() => { this.props.changeView(VIEW_TYPE.EDIT_TPL); }}
                >
                    下一步
                </Button>
            </div>
        );
    }
}

export default EditTpl;
