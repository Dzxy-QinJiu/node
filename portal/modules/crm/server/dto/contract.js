/**
 * 将合同字段进行转换
 */
exports.toRestObject = (list) => {
    list = list || [];
    let result = [];
    list.forEach( (item) => {
        result.push({
            buyer: item.buyer,
            customer_name: item.customer_name,
            start_time: item.start_time,
            end_time: item.end_time,
            contract_amount: item.contract_amount,
            gross_profit: item.gross_profit,
            products: item.products,
            stage: item.stage,
            remarks: item.remarks || '',
            date: item.date,
            user_name: item.user_name
        });
    });

    return result;
};