/**
 * 设置规则
 */

import { Button } from 'antd';
import { VIEW_TYPE } from './consts';
import { hideReportPanel } from './utils';
import addTplHoc from './add-tpl-hoc';

class SetRule extends React.Component {
    state = {
        currentView: VIEW_TYPE.ADD_TPL,
    }

    render() {
        return (
            <div>
                设置规则
            </div>
        );
    }
}

export default addTplHoc(SetRule);
