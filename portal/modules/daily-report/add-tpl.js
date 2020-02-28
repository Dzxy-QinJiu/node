/**
 * 添加汇报模板
 */

import { Button, Steps, Radio } from 'antd';
import { VIEW_TYPE } from './consts';
import addTplHoc from './add-tpl-hoc';

const { Step } = Steps;

class AddTpl extends React.Component {
    state = {
        currentStep: 1,
    }

    render() {
        return (
            <div>
                <Radio.Group onChange={this.onChange} value={this.state.value}>
                    <Radio value={1}>
                        <a href="javascript:void:0" onClick={() => { this.props.updateState({ currentView: VIEW_TYPE.EDIT_TPL }); }}>销售经理日报</a>
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
