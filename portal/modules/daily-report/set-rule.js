/**
 * 设置规则
 */

import { Form, Button } from 'antd';
import { VIEW_TYPE } from './consts';
import { hideReportPanel } from './utils';
import { renderFormItemFunc } from 'antc/lib/utils/form-utils';
import { getMyTeamTreeAndFlattenList } from 'PUB_DIR/sources/utils/common-data-util';
import addTplHoc from './add-tpl-hoc';

class SetRule extends React.Component {
    componentDidMount() {
        getMyTeamTreeAndFlattenList(data => {
            if (!data.errorMsg) {
                this.props.updateState({
                    teamList: data.teamList
                });
            }
        });
    }

    render() {
        const renderFormItem = renderFormItemFunc.bind(this, {});

        return (
            <div>
                <Form onSubmit={this.handleSubmit}>
                    {renderFormItem('谁可填写', 'name', {
                        type: 'select',
                        options: _.map(this.props.teamList, item => ({name: item.group_name, value: item.group_id})),
                        elementProps: {
                            placeholder: '请选择团队'
                        },
                        fieldDecoratorOption: {
                            rules: [{ required: true, message: '请选择团队' }]
                        }
                    })}

                </Form>
            </div>
        );
    }
}

export default addTplHoc(Form.create()(SetRule));
