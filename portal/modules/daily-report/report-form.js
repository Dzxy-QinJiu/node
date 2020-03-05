/**
 * 报告表单
 */

import { Form } from 'antd';
import { renderFormItemFunc } from 'antc/lib/utils/form-utils';
import { VIEW_TYPE } from './consts';
import { renderButtonZoneFunc } from './utils';

class ReportForm extends React.Component {
    render() {
        const tpl = this.props.clickedTpl;
        const renderFormItem = renderFormItemFunc.bind(this, {});
        const renderButtonZone = renderButtonZoneFunc.bind(this);

        return (
            <div>
                <Form>
                    {_.map(tpl.items, item => {
                        let type = 'inputNumber';
                        return renderFormItem(item.name, item.id, { type });
                    })}

                    {renderButtonZone([{
                        name: '返回',
                        func: () => { this.props.updateState({ currentView: VIEW_TYPE.ADD_TPL }); },
                    }])}
                </Form>
            </div>
        );
    }
}

export default Form.create()(ReportForm);
