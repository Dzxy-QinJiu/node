/**
 * 添加汇报模板
 */

import { Radio } from 'antd';
import { VIEW_TYPE } from './consts';
import { getTplList } from './utils';
import addTplHoc from './add-tpl-hoc';

class AddTpl extends React.Component {
    componentDidMount() {
        getTplList(result => {
            result = _.unionBy(result, 'name');
            result = _.filter(result, item => item.name);
            this.props.updateState({ tplList: result });
        });
    }

    render() {
        const { updateState, selectedTpl } = this.props;

        return (
            <div>
                <Radio.Group onChange={ e => { updateState({ selectedTpl: e.target.value }); } } value={selectedTpl}>
                    {_.map(this.props.tplList, tpl => (
                        <Radio value={tpl.id}>
                            <a href="javascript:void(0)" onClick={() => { updateState({ currentView: VIEW_TYPE.PREVIEW_TPL, clickedTpl: tpl.id }); }}>{tpl.name}</a>
                        </Radio>
                    ))}
                </Radio.Group>
            </div>
        );
    }
}

export default addTplHoc(AddTpl);
