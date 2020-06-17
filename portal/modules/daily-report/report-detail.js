/**
 * 报告详情
 */

import { Form } from 'antd';
import { renderFormItemFunc } from 'antc/lib/utils/form-utils';
import { VIEW_TYPE } from './consts';
import { renderButtonZoneFunc, hideReportPanel, getReportList, saveReport, saveReportConfig, numberRender } from './utils';
import DetailCard from 'CMP_DIR/detail-card';

class ReportDetail extends React.Component {
    componentDidMount() {
        if (_.isEmpty(this.props.reportDetail)) {
            const reportConfigId = _.get(this.props, 'reportConfig.id');

            getReportList({
                callback: list => {
                    const reportDetail = _.find(list, item => item.template_id === reportConfigId);
                    if (reportDetail) this.props.updateState({ reportDetail });
                },
                reportConfigId
            });
        }
    }

    render() {
        const renderFormItem = renderFormItemFunc.bind(this, {});
        const renderButtonZone = renderButtonZoneFunc.bind(this);

        const { updateState, reportConfig, reportDetail, isPreviewReport, isConfigReport, isOpenReport } = this.props;

        let items;

        if (isOpenReport || isConfigReport) {
            //通过解构赋值的方式为items赋值，相当于：items = reportConfig.items
            //这样写可以避免写重复属性名，便于维护，另外可扩展性好一些
            ({ items } = reportConfig);
        } else {
            items = reportDetail.item_values;
        }

        const editableFields = [Intl.get('user.login.analysis.customer.other', '其他')];
        const editableItems = _.filter(items, item => _.includes(editableFields, item.name));
        const unEditableItems = _.filter(items, item => !_.includes(editableFields, item.name));

        return (
            <div data-tracename={Intl.get('analysis.report.details.view', '报告详情视图')}>
                <Form>
                    <DetailCard
                        title={Intl.get('analysis.daily.work', '日常工作')}
                        content={(
                            <div>
                                {_.map(unEditableItems, item => {
                                    return (
                                        <div>
                                            {item.name}:
                                            &nbsp;
                                            {numberRender(item.name, item.value, reportDetail)}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    />

                    <DetailCard
                        title={Intl.get('analysis.the.other.work', '其他工作')}
                        content={(
                            <div>
                                {_.map(editableItems, item => {
                                    return renderFormItem('', item.name, {
                                        type: isPreviewReport ? 'text' : 'textarea',
                                        initialValue: item.value_str,
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
                        hide: !isOpenReport,
                        name: Intl.get('common.app.status.open', '开启'),
                        type: 'primary',
                        func: () => {
                            updateState({ currentView: VIEW_TYPE.SET_RULE });
                        }
                    }, {
                        hide: !isOpenReport,
                        name: Intl.get('common.cancel', '取消'),
                        func: () => { this.props.updateState({ currentView: VIEW_TYPE.OPEN_REPORT }); },
                    }, {
                        hide: isPreviewReport || isOpenReport || isConfigReport,
                        func: hideReportPanel,
                        name: Intl.get('common.cancel', '取消'),
                    }, {
                        hide: isPreviewReport || isOpenReport || isConfigReport,
                        func: this.save.bind(this),
                        name: Intl.get('common.save', '保存'),
                    }])}
                </Form>
            </div>
        );
    }

    save() {
        this.props.form.validateFields((err, values) => {
            if (!err) {
                let { reportDetail } = this.props;
                let itemValues = _.get(reportDetail, 'item_values');

                _.each(values, (value, key) => {
                    if (_.isUndefined(value)) {
                        delete values[key];
                    } else {
                        let field = _.find(itemValues, item => item.name === key);

                        if (field) field.value_str = value;
                    }
                });

                saveReport(reportDetail, result => {});
            }
        });
    }
}

export default Form.create()(ReportDetail);
