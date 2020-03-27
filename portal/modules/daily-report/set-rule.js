/**
 * 设置规则
 */

import { Form } from 'antd';
import { renderFormItemFunc } from 'antc/lib/utils/form-utils';
import { getMyTeamTreeAndFlattenList } from 'PUB_DIR/sources/utils/common-data-util';
import { VIEW_TYPE } from './consts';
import { hideReportPanel, saveReportConfig, renderButtonZoneFunc } from './utils';
import DetailCard from 'CMP_DIR/detail-card';

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
        const { reportConfig, isConfigReport } = this.props;

        const renderFormItem = renderFormItemFunc.bind(this, reportConfig);
        const renderButtonZone = renderButtonZoneFunc.bind(this);

        return (
            <div data-tracename="规则设置">
                <Form>
                    <DetailCard
                        title={Intl.get('sales.process.suitable.objects', '适用范围')}
                        content={(
                            <div>
                                {renderFormItem('', 'sales_team_ids', {
                                    type: 'select',
                                    options: _.map(this.props.teamList, item => ({name: item.group_name, value: item.group_id})),
                                    elementProps: {
                                        mode: 'multiple',
                                        placeholder: Intl.get('team.position.select.team', '请选择团队')
                                    },
                                    formItemLayout: {
                                        labelCol: { span: 0 },
                                        wrapperCol: { span: 24 },
                                    }
                                })}
                            </div>
                        )}
                    />

                    <DetailCard
                        title={Intl.get('analysis.statistical.cycle', '统计周期')}
                        content={(
                            <div>
                                {renderFormItem('', 'statistic_interval', {
                                    type: 'select',
                                    options: [{
                                        name: Intl.get('analysis.by.day', '按日'),
                                        value: 'day'
                                    }, {
                                        name: Intl.get('analysis.according.to.week', '按周'),
                                        value: 'week'
                                    }],
                                    formItemLayout: {
                                        labelCol: { span: 0 },
                                        wrapperCol: { span: 24 },
                                    }
                                })}
                            </div>
                        )}
                    />
                </Form>

                {renderButtonZone([{
                    func: this.save.bind(this, {status: 'on'}),
                    name: Intl.get('analysis.confirm.to.open', '确认开启'),
                    type: 'primary',
                    hide: isConfigReport
                }, {
                    func: this.save.bind(this, null),
                    name: Intl.get('common.save', '保存'),
                    type: 'primary',
                    hide: !isConfigReport
                }, {
                    func: isConfigReport ? hideReportPanel : () => { this.props.updateState({ currentView: VIEW_TYPE.OPEN_REPORT }); },
                    name: Intl.get('common.cancel', '取消'),
                }])}
            </div>
        );
    }

    save(paramObj) {
        this.props.form.validateFields((err, values) => {
            if (!err) {
                _.each(values, (value, key) => {
                    if (_.isUndefined(value)) delete values[key];
                });

                const { reportConfig } = this.props;

                const postData = _.extend({}, reportConfig, values, paramObj);

                if (paramObj) {
                    saveReportConfig(postData, { isChangeStatus: true });
                } else {
                    saveReportConfig(postData);
                }
            }
        });
    }
}

export default Form.create()(SetRule);
