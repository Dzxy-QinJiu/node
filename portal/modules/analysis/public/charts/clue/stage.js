/**
 * 线索阶段统计
 */

import { getFunnelWithConvertRateProcessDataFunc, funnelWithConvertRateProcessCsvData } from '../../utils';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import {listPanelEmitter, phoneMsgEmitter} from 'PUB_DIR/sources/utils/emitters';

export function getStageChart() {
    //集客方式的选项
    let sourceClassifyOptionItems = [{
        value: 'inbound',
        name: Intl.get('crm.clue.client.source.inbound', '市场')
    },{
        value: 'outbound',
        name: Intl.get('crm.clue.client.source.outbound', '自拓')
    },{
        value: 'other',
        name: Intl.get('crm.clue.client.source.other', '未知')
    }];
    //储存当前的key值
    let cacheKey = '';
    return {
        title: Intl.get('clue.stage.statics', '线索阶段统计'),
        chartType: 'funnel',
        url: [
            '/rest/analysis/customer/v2/clue/:data_type/realtime/stage',
            '/rest/analysis/customer/v2/clue/:data_type/statistical/field/access_channel',
            '/rest/analysis/customer/v2/clue/:data_type/statistical/field/clue_source',
            '/rest/analysis/customer/v2/clue/:data_type/statistical/field/source_classify'
        ],
        conditions: [{
            name: 'access_channel',
            value: '',
        }, {
            name: 'clue_source',
            value: '',
        },{
            name: 'source_classify',
            value: '',
        }],
        processData: (data, chart) => {
            //保存cache_key
            cacheKey = data[0].cache_key;
            //设置集客方式筛选器
            setSelector(data, 3, chart, Intl.get( 'clue.analysis.all.source.classify','全部集客方式'), 'source_classify', sourceClassifyOptionItems);

            //设置渠道筛选器
            setSelector(data, 1, chart, '全部渠道', 'access_channel');

            //设置来源筛选器
            setSelector(data, 2, chart, '全部来源', 'clue_source');

            const stageData = data[0];

            const func = getFunnelWithConvertRateProcessDataFunc([
                {
                    key: 'total',
                    name: Intl.get('common.all', '全部')
                },
                {
                    key: 'vailid',
                    name: Intl.get('clue.analysis.ability', '有效')
                },
                {
                    key: 'information',
                    name: Intl.get('sales.stage.message', '信息')
                },
                {
                    key: 'intention',
                    name: Intl.get('sales.stage.intention', '意向')
                },
                {
                    key: 'trial',
                    name: Intl.get('common.trial', '试用')
                },
                {
                    key: 'sign',
                    name: Intl.get('common.official', '签约')
                }
            ], '', 'STAGE_NAME');

            return func(stageData);
        },
        processCsvData: funnelWithConvertRateProcessCsvData,
        customOption: {
            valueField: 'showValue',
            showConvertRate: true,
        },
        events: [{
            name: 'click',
            func: (name, params) => {
                let label = getName(params);
                let type = hasPrivilege('CRM_CLUE_ANALYSIS_STATISTICAL_MANAGER') ? 'all' : 'self';
                //全部和有效下没有对应的客户
                if(_.isEqual(label, Intl.get('common.all', '全部')) || _.isEqual(label, Intl.get('clue.analysis.ability', '有效'))){
                    return false;
                } else {
                    const paramObj = {
                        listType: 'customer',
                        url: '/rest/analysis/customer/v3/lead/:type/realtime/stage/detail/:page_size/:page_num',
                        type: 'get',
                        conditions: [{
                            name: 'label',
                            value: label
                        }, {
                            name: 'cache_key',
                            value: cacheKey
                        }, {
                            type: 'params',
                            name: 'page_size',
                            value: 9999 //分页用前端实现，所以目前只能向后端请求一个很大的page_size
                        }, {
                            type: 'params',
                            name: 'page_num',
                            value: 1
                        }, {
                            type: 'params',
                            name: 'type',
                            value: type
                        }],
                        columns: [
                            {
                                title: Intl.get('clue.customer.clue.name.abbrev', '线索名'),
                                dataIndex: 'name',
                                width: '40%'
                            },
                            {
                                title: Intl.get('crm.41', '客户名'),
                                dataIndex: 'customer_name',
                                width: '40%'
                            },
                            {
                                title: Intl.get('deal.stage', '阶段'),
                                dataIndex: 'customer_label',
                                width: '20%'
                            }
                        ],
                        onRowClick: record => {
                            phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
                                customer_params: {
                                    currentId: record.customer_id
                                }
                            });
                        }
                    };
                    listPanelEmitter.emit(listPanelEmitter.SHOW, paramObj);
                }
            }
        }]
    };

    function getName(param) {
        return _.get(param, 'data.csvName');
    }

    function setSelector(data, dataIndex, chart, itemAllName, conditionName, optionItem) {
        if (!chart.cardContainer) chart.cardContainer = {selectors: []};

        const selector = _.find(chart.cardContainer.selectors, item => item.conditionName === conditionName);

        if (!selector) {
            //选项数据
            let optionData = _.get(data, `[${dataIndex}].result`);
            //将选项数据按值从小到大排序，以和相应统计中的图例顺序保持一致
            optionData = _.sortBy(optionData, item => _.values(item)[0]);
            //名称列表
            let list = [];
        
            _.each(optionData, item => {
                list = _.concat(list, _.keys(item));
            });

            chart.cardContainer.selectors.push({
                optionsCallback: () => {
                    let options = [{
                        name: itemAllName,
                        value: '',
                    }];

                    //如果是从外部传进来的下拉选项键值对，则使用外部传来的
                    if(optionItem) {
                        _.map(optionItem, item => {
                            options.push({
                                name: item.name,
                                value: item.value
                            });
                        });
                    } else {
                        _.map(list, item => {
                            options.push({
                                name: item,
                                value: item
                            });
                        });
                    }
        
                    return options;
                },
                activeOption: '',
                conditionName,
            });
        }
    }
}
