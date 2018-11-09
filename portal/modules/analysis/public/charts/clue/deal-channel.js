/**
 * 成交数渠道分布
 */

import { initialTime } from '../../consts';

export function getClueDealChannelChart() {
    return {
        title: '成交数渠道分布',
        chartType: 'pie',
        url: '/rest/clue/v1/statistical/access_channel/1000/1',
        reqType: 'post',
        dataField: 'result',
        conditions: [{
            type: 'data',
            value: '签约',
            callback: (data, name, value) => {
                if (value) {
                    _.set(data, 'query.customer_label', value);
                }
            }
        }, {
            type: 'data',
            value: 'source_time',
            callback: (data, name, value) => {
                _.set(data, 'rang_params[0].name', value);
            }
        }, {
            type: 'data',
            value: 'time',
            callback: (data, name, value) => {
                _.set(data, 'rang_params[0].type', value);
            }
        }, {
            name: 'starttime',
            value: initialTime.start,
            type: 'data',
            callback: (data, name, value) => {
                _.set(data, 'rang_params[0].from', value);
            }
        }, {
            name: 'endtime',
            value: initialTime.end,
            type: 'data',
            callback: (data, name, value) => {
                _.set(data, 'rang_params[0].to', value);
            }
        }, {
            name: 'team_ids',
            value: '',
            type: 'data',
            callback: (data, name, value) => {
                if (value) {
                    _.set(data, 'query.sales_team_id', value);
                }
            }
        }, {
            name: 'member_id',
            value: '',
            type: 'data',
            callback: (data, name, value) => {
                if (value) {
                    _.set(data, 'query.member_id', value);
                }
            }
        }],
        processData: data => {
            return _.map(data, dataItem => {
                let processedItem = {};
                _.each(dataItem, (value, key) => {
                    processedItem.name = key || '未知';
                    processedItem.value = value;
                });

                return processedItem;
            });
        },
    };
}
