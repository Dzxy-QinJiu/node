/**
 * 设置规则
 */

import { Form } from 'antd';
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
        const { tplList, currentTpl } = this.props;

        const formData = _.find(tplList, tpl => tpl.id === currentTpl) || {};

        const renderFormItem = renderFormItemFunc.bind(this, formData);

        return (
            <div>
                <Form>
                    {renderFormItem('谁可填写', 'sales_team_ids', {
                        type: 'select',
                        options: _.map(this.props.teamList, item => ({name: item.group_name, value: item.group_id})),
                        elementProps: {
                            mode: 'multiple',
                            placeholder: '请选择团队'
                        },
                        fieldDecoratorOption: {
                            rules: [{ required: true, message: '请选择团队' }]
                        }
                    })}

                    {renderFormItem.call(this, '是否开启', 'status', {
                        type: 'switch',
                        fieldDecoratorOption: {
                            valuePropName: 'checked',
                            initialValue: formData.status === 'on' ? true : false,
                        }
                    })}

                    {renderFormItem('统计周期', 'statistic_interval', {
                        type: 'select',
                        options: [{
                            name: '按日',
                            value: 'day'
                        }, {
                            name: '按周',
                            value: 'week'
                        }],
                    })}
                </Form>
            </div>
        );
    }
}

export default addTplHoc(Form.create()(SetRule));
