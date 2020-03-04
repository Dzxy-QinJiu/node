/**
 * 报告表单
 */

import { Form } from 'antd';
import { renderFormItemFunc } from 'antc/lib/utils/form-utils';

class ReportForm extends React.Component {
    render() {
        const { tplList, clickedTpl } = this.props;
        const tpl = _.find(tplList, item => item.id === clickedTpl) || {};
        const renderFormItem = renderFormItemFunc.bind(this, {});

        return (
            <div>
                <Form>
                    {_.map(tpl.items, item => {
                        let type = 'inputNumber';
                        return renderFormItem(item.name, item.id, { type });
                    })}
                </Form>
            </div>
        );
    }
}

export default Form.create()(ReportForm);
