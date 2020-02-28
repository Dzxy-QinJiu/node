/**
 * 添加汇报模板
 */

import { Radio } from 'antd';
import { VIEW_TYPE } from './consts';
import addTplHoc from './add-tpl-hoc';

class AddTpl extends React.Component {
    render() {
        const { updateState, selectedTpl } = this.props;

        return (
            <div>
                <Radio.Group onChange={ e => { updateState({ selectedTpl: e.target.value }); } } value={selectedTpl}>
                    <Radio value={1}>
                        <a href="javascript:void:0" onClick={() => { updateState({ currentView: VIEW_TYPE.EDIT_TPL }); }}>销售经理日报</a>
                    </Radio>
                </Radio.Group>
                <div
                    onClick={() => { this.props.updateState({ currentView: VIEW_TYPE.ADD_NEW_TPL }); }}
                >
                    添加新模板
                </div>
            </div>
        );
    }
}

export default addTplHoc(AddTpl);
