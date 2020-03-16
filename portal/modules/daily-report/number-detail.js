/**
 * 数字详情
 */

import { Form } from 'antd';
import { renderFormItemFunc } from 'antc/lib/utils/form-utils';
import { VIEW_TYPE } from './consts';
import { renderButtonZoneFunc, hideReportPanel, getReportList, saveReport } from './utils';

class NumberDetail extends React.Component {
    componentDidMount() {
        if (!this.props.isPreview) {
            getReportList(list => {
                const tplValues = _.first(list) || {};
                this.props.updateState({ tplValues });
            });
        }
    }

    render() {
        const renderFormItem = renderFormItemFunc.bind(this, {});
        const renderButtonZone = renderButtonZoneFunc.bind(this);

        const { updateState, clickedTpl, isPreview, tplValues } = this.props;
        const items = isPreview ? clickedTpl.items : tplValues.item_values;
        const editableFields = ['其他'];
        const editableItems = _.filter(items, item => _.includes(editableFields, item.name));
        const unEditableItems = _.filter(items, item => !_.includes(editableFields, item.name));

        return (
            <div>
                <Form>
                    {_.map(unEditableItems, item => {
                        return renderFormItem(item.name, item.name, { type: 'text', initialValue: item.value });
                    })}

                    {_.map(editableItems, item => {
                        return renderFormItem(item.name, item.name, { type: 'textarea', fieldDecoratorOption: { initialValue: item.value_str } });
                    })}
                </Form>
            </div>
        );
    }
}

export default NumberDetail;
