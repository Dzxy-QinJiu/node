const commissionPaymentService = require('../service/commission-payment-service');
// 提成发放列表
exports.getCommissionPaymentList = (req, res) => {
    commissionPaymentService.getCommissionPaymentList(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};