/**
 * 报告表单
 */

import { Form } from 'antd';
import { renderFormItemFunc } from 'antc/lib/utils/form-utils';
import { VIEW_TYPE } from './consts';
import { renderButtonZoneFunc, hideReportPanel, getTplValues, saveReport } from './utils';

class ReportForm extends React.Component {
    componentDidMount() {
        getTplValues(result => {
            this.props.updateState({ tplValues: result });
        });
    }

    render() {
        const renderFormItem = renderFormItemFunc.bind(this, {});
        const renderButtonZone = renderButtonZoneFunc.bind(this);

        const { updateState, clickedTpl, isPreview } = this.props;
        const items = clickedTpl.items;
        const editableFields = ['other'];
        const editableItems = _.filter(items, item => _.includes(editableFields, item.id));
        const unEditableItems = _.filter(items, item => !_.includes(editableFields, item.id));

        return (
            <div>
                <Form>
                    {_.map(unEditableItems, item => {
                        return renderFormItem(item.name, item.id, { type: 'text' });
                    })}

                    {_.map(editableItems, item => {
                        return renderFormItem(item.name, item.id, { type: 'textarea' });
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
            if (!err) {
                _.each(values, (value, key) => {
                    if (_.isUndefined(value)) delete values[key];
                });

                const { clickedTpl } = this.props;

                const postData = _.extend({}, clickedTpl, values);

                console.log(postData);//return
                saveReport(postData, result => {});
                //hideReportPanel()
            }
        });
    }
}

export default Form.create()(ReportForm);
