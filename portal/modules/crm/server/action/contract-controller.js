const contractService = require('../service/contract-service');

// 根据客户id获取合同信息
exports.getContractByCustomerId = (req, res) => {
    contractService.getContractByCustomerId(req, res)
        .on('success', (data) => {
            res.status(200).json(data);
        }).on('error', (err) => {
            res.status(500).json(err && err.message);
        });
};

// 添加合同
exports.addContract = (req, res) => {
    contractService.addContract(req, res)
        .on('success', (data) => {
            res.status(200).json(data);
        }).on('error', (err) => {
            res.status(500).json(err && err.message);
        });
};

// 删除待审合同
exports.deletePendingContract = (req, res) => {
    contractService.deletePendingContract(req, res)
        .on('success', (data) => {
            res.status(200).json(data);
        }).on('error', (err) => {
            res.status(500).json(err && err.message);
        });
};