/**
 * 设置规则
 */

import { Form } from 'antd';
import { renderFormItemFunc } from 'antc/lib/utils/form-utils';
import { getMyTeamTreeAndFlattenList } from 'PUB_DIR/sources/utils/common-data-util';
import { VIEW_TYPE } from './consts';
import { hideReportPanel, saveTpl, renderButtonZoneFunc } from './utils';
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
        const { currentTpl, isManageTpl } = this.props;

        const renderFormItem = renderFormItemFunc.bind(this, currentTpl);
        const renderButtonZone = renderButtonZoneFunc.bind(this);

        return (
            <div>
                <Form>
                    <DetailCard
                        title="适用范围"
                        content={(
                            <div>
                                {renderFormItem('谁可填写', 'sales_team_ids', {
                                    type: 'select',
                                    options: _.map(this.props.teamList, item => ({name: item.group_name, value: item.group_id})),
                                    elementProps: {
                                        mode: 'multiple',
                                        placeholder: '请选择团队'
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
                        title="统计周期"
                        content={(
                            <div>
                                {renderFormItem('', 'statistic_interval', {
                                    type: 'select',
                                    options: [{
                                        name: '按日',
                                        value: 'day'
                                    }, {
                                        name: '按周',
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
                    name: '确认开启',
                    type: 'primary',
                    hide: isManageTpl
                }, {
                    func: this.save.bind(this, null),
                    name: '保存',
                    type: 'primary',
                    hide: !isManageTpl
                }, {
                    func: isManageTpl ? hideReportPanel : () => { this.props.updateState({ currentView: VIEW_TYPE.ADD_TPL }); },
                    name: '取消',
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

                const { currentTpl } = this.props;

                const postData = _.extend({}, currentTpl, values, paramObj);

                if (paramObj) {
                    saveTpl(postData, { isChangeStatus: true });
                } else {
                    saveTpl(postData);
                }
            }
        });
    }
}

export default Form.create()(SetRule);
