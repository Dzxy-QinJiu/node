const salesCommissionService = require('../service/sales-commission-service');

// 销售提成列表
exports.getSalesCommissionList = (req, res) => {
    salesCommissionService.getSalesCommissionList(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 更新销售提成
exports.updateSaleCommission = (req, res) => {
    salesCommissionService.updateSaleCommission(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 重新计算提成
exports.recalculateSaleCommission = (req, res) => {
    salesCommissionService.recalculateSaleCommission(req, res).on('success', (data) => {
        res.status(200).json(true);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 销售提成明细
exports.getSaleCommissionDetail = (req, res) => {
    salesCommissionService.getSaleCommissionDetail(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 合同详情
exports.getContractDetail = (req, res) => {
    salesCommissionService.getContractDetail(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};