const nock = require('nock');
const differentVersionService = require('../service/different-version-service');
var nockParser = require(require('path').join(portal_root_path, './lib/utils/nockParser'));

const data = {
    versionData: [
        {
            versionId: '1',
            versionName: '个人版',
            cost: 50,
            features: [
                {
                    featureName: 'CRM功能',
                    featureChildren: ['线索推荐','线索管理','线索池','客户管理','客户池','联系人','跟进记录','数据导入','订单管理','拜访跟进记录']
                },{
                    featureName: '日程',
                },{
                    featureName: '每月可从推荐线索中提取number条线索',
                    number: 4000
                }
            ],
            applyTry: false,
            connectSale: true
        },{
            versionId: '2',
            versionName: '基础版',
            features: [
                {
                    featureName: 'CRM功能',
                    featureChildren: ['线索推荐','线索管理','线索池','客户管理','客户池','联系人','跟进记录','数据导入','订单管理','拜访跟进记录']
                },{
                    featureName: '日程',
                },{
                    featureName: '系统设置',
                    featureChildren: ['成员管理','行业','竞品','产品'] 
                },{
                    featureName: '呼叫中心',
                    featureChildren: ['公共号码呼出','通话记录','客服和有效电话规则设置']
                },{
                    featureName: '每月赠送number分钟电话时长',
                    number: 300
                },{
                    featureName: '每月可从推荐线索中提取number条线索',
                    number: 10000
                }
            ],
            applyTry: true,
            connectSale: true
        },{
            versionId: '3',
            versionName: '专业版',
            features: [
                {
                    featureName: 'CRM功能',
                    featureChildren: ['线索推荐','线索管理','线索池','客户管理','客户池','联系人','跟进记录','数据导入','订单管理','拜访跟进记录']
                },{
                    featureName: '呼叫中心',
                    featureChildren: ['公共号码呼出','通话记录','客服和有效电话规则设置']
                },{
                    featureName: '系统设置',
                    featureChildren: ['成员管理','行业','竞品','产品'] 
                },{
                    featureName: '日程',
                },{
                    featureName: '营收中心',
                    featureChildren: ['数据仪表盘','销售费用','采购合同','发票管理','回款计划','回款管理','销售合同']
                },{
                    featureName: '每月赠送number分钟电话时长',
                    number: 1000
                },{
                    featureName: '每月可从推荐线索中提取number条线索',
                    number: 30000
                }
            ],
            applyTry: true,
            connectSale: true
        },{
            versionId: '4',
            versionName: '企业版',
            features: [
                {
                    featureName: 'CRM功能',
                    featureChildren: ['线索推荐','线索管理','线索池','客户管理','客户池','联系人','跟进记录','数据导入','订单管理','拜访跟进记录']
                },{
                    featureName: '呼叫中心',
                    featureChildren: ['公共号码呼出','通话记录','客服和有效电话规则设置']
                },{
                    featureName: '系统设置',
                    featureChildren: ['成员管理','行业','竞品','产品'] 
                },{
                    featureName: '日程',
                },{
                    featureName: '营收中心',
                    featureChildren: ['数据仪表盘','销售费用','采购合同','发票管理','回款计划','回款管理','销售合同']
                },{
                    featureName: '财务系统集成功能'
                },{
                    featureName: '每月赠送number分钟电话时长',
                    number: 3000
                },{
                    featureName: '每月可从推荐线索中提取number条线索',
                    number: 80000
                }
            ],
            applyTry: true,
            connectSale: true
        }

    ]
};


exports.init = function() {
    nock('http://localhost:9191')
        .get('/rest/versions/getall')
        .reply(200,{
            data
        });
};