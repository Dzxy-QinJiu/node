/**
 * 最近联系客户统计
 */

import { argCallbackTimeToUnderlineTime, argCallbackMemberIdToMemberIds } from '../../utils';
import { listPanelEmitter } from 'PUB_DIR/sources/utils/emitters';

export function getRecentContactCustomerChart() {
    return {
        title: Intl.get('analysis.weekly.contact.customer.statistics', '周联系客户统计'),
        chartType: 'bar',
        layout: {sm: 24},
        url: '/rest/analysis/callrecord/v1/callrecord/statistics/recent/contact/customer',
        argCallback: arg => {
            argCallbackMemberIdToMemberIds(arg);
            argCallbackTimeToUnderlineTime(arg);

            let query = arg.query;

            //当前周的开始时间
            const startOfCurrentWeek = moment().startOf('week').valueOf();
            //选中周的开始时间
            //(选中周即查询参数中的结束时间所在的周)
            const startOfSelectedWeek = moment(query.end_time).startOf('week').valueOf();

            //如果选中周的开始时间小于当前周的开始时间
            //说明选中的时间不在本周
            //需要将查询参数的开始结束时间设为选中周的开始结束时间
            if (startOfSelectedWeek < startOfCurrentWeek) {
                query.start_time = startOfSelectedWeek;
                query.end_time = moment(query.end_time).endOf('week').valueOf();
            //否则，需要将查询参数的开始时间设为本周的开始时间
            } else {
                query.start_time = startOfCurrentWeek;
                query.end_time = moment().endOf('week').valueOf();
            }

            //返回值类型，默认按团队返回
            query.statistics_type = 'team';

            //团队Id
            const teamIds = query.team_ids;
            //子团队Id数组
            const childTeamIds = query.child_team_ids;
            //当前选择的团队是否有子团队，默认有
            let teamHasChild = true;

            //如果子团队Id数组里只有一项，并且该项的值和当前选择的团队的值相同，则认为当前选择的团队没有子团队
            if (childTeamIds.length === 1 && childTeamIds[0] === teamIds) {
                teamHasChild = false;
            }

            delete query.child_team_ids;

            //如果是按成员筛选，或当前选择的团队没有子团队
            if (query.member_ids || !teamHasChild) {
                //则按成员返回
                query.statistics_type = 'user';
            }
        },
        processData: (data, chart) => {
            let total = 0;
            let processedData = [];
            const list = _.get(data, 'list');

            _.each(list, item => {
                total += item.customer_ids_num;
                processedData.push({
                    name: item.team_name || item.nick_name,
                    value: item.customer_ids_num,
                    cache_key: item.cache_key
                });
            });

            chart.title = chart.title.replace(/（.*）/, '');
            chart.title += Intl.get('analysis.co.contact.count.customers', '共联系{count}个客户', { count: total });

            return processedData;
        },
        events: [{
            name: 'click',
            func: (name, params) => {
                const cacheKey = _.get(params, 'data.cache_key');
                const paramObj = {
                    listType: 'customer',
                    url: '/rest/analysis/callrecord/v1/callrecord/statistics/recent/contact/customer/detail',
                    type: 'get',
                    cache_key: cacheKey,
                    page_size: {
                        type: 'query'
                    },
                    page_num: {
                        type: 'query'
                    },
                };

                listPanelEmitter.emit(listPanelEmitter.SHOW, paramObj);
            }
        }]
    };
}
