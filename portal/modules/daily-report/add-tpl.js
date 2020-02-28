/**
 * 添加汇报模板
 */

import { Button, Steps, Radio } from 'antd';
import { VIEW_TYPE } from './consts';

const { Step } = Steps;

class AddTpl extends React.Component {
    state = {
        currentView: VIEW_TYPE.ADD_TPL,
    }

    render() {
        return (
            <div>
                两步即可实现汇总和查看销售日常工作情况
                <Steps current={0}>
                    <Step title="1. 选择模板" />
                    <Step title="2. 设置规则" />
                </Steps>
                <Radio.Group onChange={this.onChange} value={this.state.value}>
                    <Radio value={1}>
                        <a href="javascript:void:0" onClick={() => { this.props.changeView(VIEW_TYPE.EDIT_TPL); }}>销售经理日报</a>
                    </Radio>
                </Radio.Group>
                <br/>
                <div
                    onClick={() => { this.props.changeView(VIEW_TYPE.ADD_NEW_TPL); }}
                >
                    添加新模板
                </div>
                <Button
                    onClick={() => { this.props.changeView(VIEW_TYPE.SET_RULE); }}
                >
                    下一步
                </Button>
            </div>
        );
    }
}

export default AddTpl;
