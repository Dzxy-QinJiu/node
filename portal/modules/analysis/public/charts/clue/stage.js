/**
 * 线索阶段统计
 */

import { getFunnelWithConvertRateProcessDataFunc, funnelWithConvertRateProcessCsvData } from '../../utils';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import crmPrivilegeConst from 'MOD_DIR/crm/public/privilege-const';
import {listPanelEmitter, phoneMsgEmitter} from 'PUB_DIR/sources/utils/emitters';

export function getStageChart() {
    //获客方式的选项
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

    //查询参数缓存
    let queryArgCache = [];

    return {
        title: Intl.get('clue.funnel.statics', '线索漏斗统计'),
        chartType: 'funnel',
        url: [
            '/rest/analysis/customer/v3/lead/:data_type/realtime/stage/new',
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
        argCallback: arg => {
            queryArgCache = _.map(arg.query, (value, name) => ({name, value}));
        },
        processData: (data, chart) => {
            //设置获客方式筛选器
            setSelector(data, 3, chart, Intl.get( 'clue.analysis.all.source.classify','全部获客方式'), 'source_classify', sourceClassifyOptionItems);

            //设置渠道筛选器
            setSelector(data, 1, chart, Intl.get( 'analysis.all.channels','全部渠道'), 'access_channel');

            //设置来源筛选器
            setSelector(data, 2, chart, Intl.get( 'analysis.all.sources','全部来源'), 'clue_source');

            const stageData = data[0];
            const stageIndex = _.get(stageData, 'stage_index', []);
            const stageResult = _.get(stageData, 'stage_result', {});

            const stages = _.map(stageIndex, item => ({
                name: item.name,
                key: item.en_name
            }));

            const func = getFunnelWithConvertRateProcessDataFunc(stages, '', 'STAGE_NAME');

            return func(stageResult);
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

                //后端暂时不支持查看总数和有效阶段的详情
                //总数, 有效为后端返回数据，无需国际化
                if (['总数', '有效'].includs(label)) {
                    //临时信息，暂不做国际化
                    message.info('暂不支持查看该阶段的数据详情');
                    return;
                }

                let type = hasPrivilege('CURTAO_CRM_CUSTOMER_ANALYSIS_ALL') ? 'all' : 'self';
                const paramObj = {
                    listType: 'customer',
                    url: '/rest/analysis/customer/v3/lead/:type/realtime/stage/detail/new/:page_size/:page_num',
                    type: 'get',
                    conditions: _.concat(queryArgCache, [{
                        name: 'label',
                        value: label
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
                    }]),
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
                        if(!_.isEmpty(record.customer_id)) {
                            phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
                                customer_params: {
                                    currentId: record.customer_id
                                }
                            });
                        }
                    }
                };
                listPanelEmitter.emit(listPanelEmitter.SHOW, paramObj);
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
