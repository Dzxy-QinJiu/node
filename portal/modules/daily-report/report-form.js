/**
 * 报告表单
 */

import { Form } from 'antd';
import { renderFormItemFunc } from 'antc/lib/utils/form-utils';
import { VIEW_TYPE } from './consts';
import { renderButtonZoneFunc, hideReportPanel, getReportList, saveReport, saveTpl } from './utils';
import DetailCard from 'CMP_DIR/detail-card';

class ReportForm extends React.Component {
    state = {
        currentReport: this.props.currentReport || {},
    }

    componentDidMount() {
        if (_.isEmpty(this.state.currentReport)) {
            getReportList(list => {
                const currentReport = _.first(list) || {};
                this.setState({ currentReport });
            });
        }
    }

    render() {
        const renderFormItem = renderFormItemFunc.bind(this, {});
        const renderButtonZone = renderButtonZoneFunc.bind(this);

        const { updateState, currentTpl, isPreview, isManageTpl, isOpenTpl } = this.props;
        const { currentReport } = this.state;

        let items;

        if (isOpenTpl || isManageTpl) {
            ({ items } = currentTpl);
        } else {
            items = currentReport.item_values;
        }

        const editableFields = ['其他'];
        const editableItems = _.filter(items, item => _.includes(editableFields, item.name));
        const unEditableItems = _.filter(items, item => !_.includes(editableFields, item.name));

        return (
            <div>
                <Form>
                    <DetailCard
                        title="日常工作"
                        content={(
                            <div>
                                {_.map(unEditableItems, item => {
                                    return <div>{item.name}: {item.value || 0}</div>;
                                })}
                            </div>
                        )}
                    />

                    <DetailCard
                        title="其他工作"
                        content={(
                            <div>
                                {_.map(editableItems, item => {
                                    return renderFormItem('', item.name, {
                                        type: isPreview ? 'text' : 'textarea',
                                        fieldDecoratorOption: { initialValue: item.value_str },
                                        formItemLayout: {
                                            labelCol: { span: 0 },
                                            wrapperCol: { span: 24 },
                                        }
                                    });
                                })}
                            </div>
                        )}
                    />

                    {renderButtonZone([{
                        hide: !isOpenTpl,
                        name: '开启',
                        type: 'primary',
                        func: () => {
                            let tplData = _.cloneDeep(currentTpl);
                            saveTpl(tplData, () => {});
                        }
                    }, {
                        hide: !isOpenTpl,
                        name: '取消',
                        func: () => { this.props.updateState({ currentView: VIEW_TYPE.ADD_TPL }); },
                    }, {
                        hide: isPreview || isOpenTpl || isManageTpl,
                        func: hideReportPanel,
                        name: '取消',
                    }, {
                        hide: isPreview || isOpenTpl || isManageTpl,
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
                let { currentReport } = this.state;
                let itemValues = _.get(currentReport, 'item_values');

                _.each(values, (value, key) => {
                    if (_.isUndefined(value)) {
                        delete values[key];
                    } else {
                        let field = _.find(itemValues, item => item.name === key);

                        if (field) field.value_str = value;
                    }
                });

                saveReport(currentReport, result => {});
            }
        });
    }
}

export default Form.create()(ReportForm);
