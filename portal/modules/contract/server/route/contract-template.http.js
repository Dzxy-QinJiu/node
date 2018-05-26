/**
 * * 请求路径
 */

require("../action/contract-template-controller");

module.exports = {
    module: "contract/server/action/contract-template-controller",
    routes: [
        {
            // 销售合同模板
            "method": "get",
            "path": "/rest/sale_contract/download_template",
            "handler": "getSaleContractTemplate",
            "passport": {
                "needLogin": true
            }
        }, {
            // 采购合同模板
            "method": "get",
            "path": "/rest/purchase_contract/download_template",
            "handler": "getPurchaseContractTemplate",
            "passport": {
                "needLogin": true
            }
        }
    ]
};