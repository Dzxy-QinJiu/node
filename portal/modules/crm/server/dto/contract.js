/**
 * 将合同字段进行转换
 */
exports.toRestObject = (list) => {
    list = list || [];
    let result = [];
    list.forEach( (item) => {
        result.push({
            num: item.num || '', // 合同号
            buyer: item.buyer || '', // 甲方
            customer_name: item.customer_name || '', // 客户名称
            start_time: item.start_time || '', // 有效期的开始时间
            end_time: item.end_time || '', // 有效期的结束时间
            contract_amount: item.contract_amount || 0, // 合同额
            gross_profit: item.gross_profit || 0, // 毛利
            products: item.products || [], // 产品信息
            stage: item.stage || '', // 合同状态（待审、审核、归档、报废）
            remarks: item.remarks || '', // 合同备注
            date: item.date || '', // 合同签订时间
            user_name: item.user_name || '' // 合同的签订人
        });
    });

    return result;
};