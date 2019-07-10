/**
 * 销售开通账号统计
 */

import { argCallbackUnderlineTimeToTime } from '../../utils';

export function getAccountSalesOpenAccountChart() {
    return {
        title: '销售开通账号统计',
        url: '/rest/customer/v2/customer/:data_type/app/user/count',
        argCallback: argCallbackUnderlineTimeToTime,
        chartType: 'table',
        layout: { sm: 24 },
        height: 600,
        noShowCondition: {
            app_id: '!all',
        },
        option: {
            columns: [
                {
                    title: Intl.get('sales.home.sales', '销售'),
                    dataIndex: 'member_name',
                    width: 100
                }, {
                    title: Intl.get('user.user.team', '团队'),
                    dataIndex: 'sales_team_name',
                    isSetCsvValueBlank: true,
                    width: 100
                },
            ],
        },
        processChart: chartProps => {
            let data = chartProps.data;
            let option = chartProps.option;
            let columns = option.columns;

            //合计行
            let summaryRow = {};
            //获取合计行第一列的键
            const summaryRowTitleKey = columns[0].dataIndex;
            //设置合计行第一列
            summaryRow[summaryRowTitleKey] = Intl.get('sales.home.total.compute', '总计');

            //存储解析出来的列的数组
            let extractedColumns = [];
            //遍历数据
            _.each(data, dataItem => {
                const subData = dataItem['app_map'];
                //将行合计设置为0
                let rowTotal = 0;
                //遍历子数据
                _.each(subData, (value, key) => {
                    //将子数据对象的键名存入解析列数组
                    extractedColumns.push(key);
                    //将行合计的值增加当前键对应的值
                    rowTotal += value;
                    //在当前数据项里增加该键值对，相当于把子数据对象的内容拷贝到父对象下面
                    dataItem[key] = value;

                    //如果合计行中已存在该列
                    if (_.has(summaryRow, key)) {
                        //则将该列的值增加当前项值
                        summaryRow[key] += value;
                    } else {
                        //否则增加该列
                        summaryRow[key] = value;
                    }
                });

                //数据项中增加合计列数据
                dataItem['total'] = rowTotal;

                //如果合计行中存在合计列
                if (_.has(summaryRow, 'total')) {
                    //则需要将当前行里的合计列的值加到合计行合计列里
                    summaryRow['total'] += rowTotal;
                } else {
                    //否则设置合计行合计列
                    summaryRow['total'] = rowTotal;
                }
            });

            //对提取出来的列名进行去重
            extractedColumns = _.uniq (extractedColumns);

            //将提取出来的列加到总的列定义里面
            _.each(extractedColumns, column => {
                columns.push({
                    title: column,
                    dataIndex: column,
                    key: column,
                    render: text => {
                        if (!text) text = '0';
                        return <span>{text}</span>;
                    }
                });
            });

            columns.push({
                title: Intl.get('sales.home.total.compute', '总计'),
                dataIndex: 'total',
                key: 'total',
            });

            //合计行
            data.push(summaryRow);

            option.dataSource = data;

            _.each(option.columns, (column, index) => {
                //产品列
                if (index > 1) {
                    //设置列宽
                    column.width = 200;
                    //统计数据右对齐
                    column.align = 'right';
                }
            });
        }
    };
}
