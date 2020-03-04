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
        const { tplList, clickedTpl } = this.props;
        const tpl = _.find(tplList, item => item.id === selectedTpl) || {};

        return (
            <div>
                预览模板
                <div>
                    <Button
                        onClick={() => { this.props.updateState({ currentView: VIEW_TYPE.ADD_TPL }); }}
                    >
                        返回
                    </Button>
                </div>
            </div>
        );
    }
}

export default PreviewTpl;
