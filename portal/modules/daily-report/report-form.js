/**
 * 报告表单
 */

import { Form } from 'antd';
import { renderFormItemFunc } from 'antc/lib/utils/form-utils';
import { VIEW_TYPE } from './consts';
import { renderButtonZoneFunc, hideReportPanel, getReportList, saveReport } from './utils';

class ReportForm extends React.Component {
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

                    {renderButtonZone([{
                        hide: !isPreview,
                        name: '返回',
                        func: () => { this.props.updateState({ currentView: VIEW_TYPE.ADD_TPL }); },
                    }, {
                        hide: isPreview,
                        func: hideReportPanel,
                        name: '取消',
                    }, {
                        hide: isPreview,
                        func: this.save.bind(this),
                        name: '保存',
                    }])}
                </Form>
            </div>
        );
    }

    save() {
        this.props.form.validateFields((err, values) => {
            console.log(values,3);
            if (!err) {
                let { tplValues } = this.props;
                let itemValues = _.get(tplValues, 'item_values');

                _.each(values, (value, key) => {
                    if (_.isUndefined(value)) {
                        delete values[key];
                    } else {
                        let field = _.find(itemValues, item => item.name === key);

                        if (field) field.value_str = value;
                    }
                });

                saveReport(tplValues, result => {});
                //hideReportPanel()
            }
        });
    }
}

export default Form.create()(ReportForm);
