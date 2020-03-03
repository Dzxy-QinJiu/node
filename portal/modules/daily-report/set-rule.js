/**
 * 设置规则
 */

import { Form, Button } from 'antd';
import { VIEW_TYPE } from './consts';
import { hideReportPanel } from './utils';
import { renderFormItemFunc } from 'antc/lib/utils/form-utils';
import addTplHoc from './add-tpl-hoc';

class SetRule extends React.Component {
    state = {
        currentView: VIEW_TYPE.ADD_TPL,
    }

    render() {
        const renderFormItem = renderFormItemFunc.bind(this, {});

        return (
            <div>
                <Form onSubmit={this.handleSubmit}>
                    {renderFormItem('谁可填写', 'name', {})}
                </Form>
            </div>
        );
    }
}

export default addTplHoc(Form.create()(SetRule));
