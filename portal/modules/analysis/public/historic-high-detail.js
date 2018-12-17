/**
 * 试用合格客户统计历史最高值明细
 */

import ajax from 'ant-ajax';
import { AntcTable } from 'antc';
import GeminiScrollBar from 'CMP_DIR/react-gemini-scrollbar';

class HistoricHighDetail extends React.Component {
    static defaultProps = {
        data: {}
    };

    static propTypes = {
        data: PropTypes.object
    };

    constructor(props) {
        super(props);

        this.state = {
            //数据
            data: this.processData(props.data),
            //加载状态
            loading: true,
            //是否显示出错信息
            isShowError: false,
        };
    }

    componentDidMount() {
        //补全客户名
        this.replenishCustomerName();
    }

    //处理数据
    processData(data) {
        const customerIds = data.customer_ids;

        //合格客户数组
        const qualifyCustomers = _.map(customerIds, customer_id => {
            return {
                customer_id,
                time: data.highest_date,
            };
        });

        //转入客户数组
        let turnInCustomers = _.map(data.turn_in, turnInItem => {
            return {
                customer_id: turnInItem.customer_id,
                time: moment(turnInItem.time).format(oplateConsts.DATE_FORMAT)
            };
        });

        //如果存在分配入的客户
        if (data.allot_ids) {
            const turnInCustomerIds = _.map(turnInCustomers, 'customer_id');

            _.each(data.allot_ids, allot_id => {
                //若分配入的客户不在转入的客户列表中，则将其加入转入的客户列表
                if (!turnInCustomerIds.includes(allot_id)) {
                    turnInCustomers.push({
                        customer_id: allot_id,
                    });
                }
            });
        }

        //转出客户数组
        const turnOutCustomers = _.map(data.turn_out, turnOutItem => {
            return {
                customer_id: turnOutItem.customer_id,
                time: moment(turnOutItem.time).format(oplateConsts.DATE_FORMAT)
            };
        });

        return {
            qualifyCustomers,
            turnInCustomers,
            turnOutCustomers,
        };
    }

    //补全客户名
    replenishCustomerName() {
        const qulifyCustomerIds = _.map(this.state.data.qualifyCustomers, 'customer_id');
        const turnInCustomerIds = _.map(this.state.data.turnInCustomers, 'customer_id');
        const turnOutCustomerIds = _.map(this.state.data.turnOutCustomers, 'customer_id');
        const allIds = _.chain(qulifyCustomerIds).concat(turnInCustomerIds, turnOutCustomerIds).uniq().value();
        const count = allIds.length;
        const customerIds = allIds.join(',');

        ajax.send({
            url: `/rest/customer/range/${count}/1/id/asc/force_use_common_rest`,
            type: 'post',
            data: {
                query: {
                    id: customerIds
                }
            }
        }).done(result => {
            const resultData = _.get(result, 'result');

            if (_.isArray(resultData)) {
                const processedData = _.cloneDeep(this.state.data);

                _.each(processedData, (value, key) => {
                    _.each(value, dataItem => {
                        const matchedResultDataItem = _.find(resultData, resultDataItem => resultDataItem.id === dataItem.customer_id);

                        if (matchedResultDataItem) {
                            dataItem.customer_name = matchedResultDataItem.name;
                        }
                    });
                });

                this.setState({
                    data: processedData,
                    loading: false
                });
            }
        }).fail(() => {
            this.setState({
                isShowError: true,
                loading: false
            });
        });
    }

    //获取表格列定义
    getColumns(type) {
        let timeTitle = Intl.get('common.qualified.time', '合格时间');

        if (type === 'turnIn') {
            timeTitle = Intl.get('common.turn.in.time', '转入时间');
        } else if (type === 'turnOut') {
            timeTitle = Intl.get('common.turn.out.time', '转出时间');
        }

        return [{
            title: Intl.get('crm.41', '客户名'),
            dataIndex: 'customer_name',
            width: '50%',
        }, {
            title: timeTitle,
            dataIndex: 'time',
            width: '50%',
        }];
    }

    //获取分页器定义
    getPagination(total) {
        return {
            total,
            pageSize: 10,
            showTotal: total => Intl.get('crm.207', '共{count}个客户', { count: total }),
        };
    }

    render() {
        //顶部栏高度
        const topNavHeight = 64;
        //底边距
        const bottomMargin = 16;
        //内容高度
        const contentHeight = $(window).height() - topNavHeight - bottomMargin;

        return (
            <div className='historic-high-detail' style={{height: contentHeight}}>
                <GeminiScrollBar>
                    {this.state.isShowError ? (
                        <div className='error-info'>
                            {Intl.get('common.data.request.error', '数据请求出错')}, <span className="retry-btn" onClick={this.replenishCustomerName.bind(this)}>{Intl.get('user.info.retry', '请重试')}</span>
                        </div>
                    ) : (
                        <div>
                            <dl>
                                <dt>
                                    {Intl.get('common.qualified.customer', '合格客户')}
                                </dt>
                                <dd>
                                    <AntcTable
                                        columns={this.getColumns()}
                                        dataSource={this.state.data.qualifyCustomers}
                                        loading={this.state.loading}
                                        pagination={this.getPagination(this.state.data.qualifyCustomers.length)}
                                    />
                                </dd>
                            </dl>

                            {this.state.data.turnInCustomers.length ? (
                                <dl>
                                    <dt>
                                        {Intl.get('common.turn.in.customer', '转入客户')}
                                    </dt>
                                    <dd>
                                        <AntcTable
                                            columns={this.getColumns('turnIn')}
                                            dataSource={this.state.data.turnInCustomers}
                                            loading={this.state.loading}
                                            pagination={this.getPagination(this.state.data.turnInCustomers.length)}
                                        />
                                    </dd>
                                </dl>
                            ) : null}

                            {this.state.data.turnOutCustomers.length ? (
                                <dl>
                                    <dt>
                                        {Intl.get('crm.customer.transfer', '转出客户')}
                                    </dt>
                                    <dd>
                                        <AntcTable
                                            columns={this.getColumns('turnOut')}
                                            dataSource={this.state.data.turnOutCustomers}
                                            loading={this.state.loading}
                                            pagination={this.getPagination(this.state.data.turnOutCustomers.length)}
                                        />
                                    </dd>
                                </dl>
                            ) : null}
                        </div>
                    )}
                </GeminiScrollBar>
            </div>
        );
    }
}

export default HistoricHighDetail;
