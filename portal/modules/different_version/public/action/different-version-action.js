import differentVersionAjax from '../ajax/different-version-ajax';

const data = {
    versionData: [
        // {
        //     versionId: '1',
        //     versionName: '个人版',
        //     cost: 50,
        //     recommendClues: 4000,
        //     type: '个人',
        //     features: [
        //         {
        //             featureName: 'CRM功能',
        //             featureChildren: [
        //                 {featureChildName: '线索管理', type: 'have'},
        //                 {featureChildName: '线索池', type: 'have'},
        //                 {featureChildName: '客户管理', type: 'have'},
        //                 {featureChildName: '客户池', type: 'have'},
        //                 {featureChildName: '联系人', type: 'have'},
        //                 {featureChildName: '跟进记录', type: 'have'},
        //                 {featureChildName: '数据导入', type: 'have'},
        //                 {featureChildName: '订单管理', type: 'have'},
        //                 {featureChildName: '销售阶段管理', type: 'have'},
        //                 {featureChildName: '拜访跟进记录', type: 'have'},
        //                 {featureChildName: '查重', type: 'have'}
        //             ]
        //         },{
        //             featureName: '基础功能',
        //             featureChildren: [
        //                 {featureChildName: '职务管理', type: 'have'},
        //                 {featureChildName: '行业管理', type: 'have'},
        //                 {featureChildName: '竞品管理', type: 'have'},
        //                 {featureChildName: '日程', type: 'have'},
        //                 {featureChildName: '产品管理', type: 'have'}
        //             ]
        //         }
        //     ],

        // },
        {
            versionId: '2',
            versionName: '基础版',
            recommendClues: 10000,
            beginSale: 5,
            applyTry: true,
            type: '企业',
            version_kind: 'starter',
            features: [
                {
                    featureName: '呼叫中心',
                    featureChildren: [
                        {featureChildName: '成员管理', type: 'add'},
                        {featureChildName: '1个公共号码', type: 'add'},
                        {featureChildName: '呼出', type: 'add'},
                        {featureChildName: '话费赠送300分钟/月/公司', type: 'add'},
                        {featureChildName: '通话记录', type: 'add'},
                        {featureChildName: '录音保存7天', type: 'add'},
                        {featureChildName: '客服电话管理', type: 'add'},
                        {featureChildName: '有效电话规则配置', type: 'add'}
                    ]
                },{
                    featureName: 'CRM功能',
                    featureChildren: [
                        {featureChildName: '销售目标', type: 'add'}
                    ]
                },{
                    featureName: '基础功能',
                    featureChildren: [
                        {featureChildName: '部门/组织架构', type: 'add'},

                    ]
                }
            ]
        },{ 
            versionId: '3',
            versionName: '专业版',
            recommendClues: 30000,
            beginSale: 10,
            type: '企业',
            version_kind: 'professional',
            features: [
                {
                    featureName: '用户管理',
                    featureChildren: [
                        {featureChildName: '账号申请审批', type: 'add'},
                        {featureChildName: '产品接入', type: 'add'},
                        {featureChildName: '用户管理', type: 'add'},
                        {featureChildName: '用户行为跟踪', type: 'add'},
                        {featureChildName: '用户行为分析', type: 'add'},
                        {featureChildName: '活跃分析', type: 'add'},
                        {featureChildName: '用户评分', type: 'add'}
                    ]
                },
                {
                    featureName: '营收中心',
                    featureChildren: [
                        {featureChildName: '数据看板', type: 'add'},
                        {featureChildName: '销售费用', type: 'add'},
                        {featureChildName: '采购合同', type: 'add'},
                        {featureChildName: '发票管理', type: 'add'},
                        {featureChildName: '回款计划', type: 'add'},
                        {featureChildName: '回款管理', type: 'add'},
                        {featureChildName: '销售合同', type: 'add'}
                    ]
                },
                {
                    featureName: '呼叫中心',
                    featureChildren: [
                        {featureChildName: '1个专有号码', type: 'add'},
                        {featureChildName: '话费赠送1000分钟/月/公司', type: 'add'},
                        {featureChildName: '录音保存15天', type: 'add'},
                    ]
                },
                {
                    featureName: 'CRM功能',
                    featureChildren: [
                        {featureChildName: '客户评分', type: 'add'},
                        {featureChildName: '统计分析', type: 'add'}
                    ]
                },
                {
                    featureName: '基础功能',
                    featureChildren: [
                        {featureChildName: '申请审批', type: 'add'},
                    ]
                }
            ],
            applyTry: true
        },{
            versionId: '4',
            versionName: '企业版',
            recommendClues: 80000,
            beginSale: 20,
            type: '企业',
            version_kind: 'enterprise',
            features: [
                {
                    featureName: '用户管理',
                    featureChildren: [

                        {featureChildName: '用户管理系统集成', type: 'add'}
                    ]
                },
                {
                    featureName: '营收中心',
                    featureChildren: [
                        {featureChildName: '提成计算', type: 'add'},
                        {featureChildName: '薪酬计算', type: 'add'},
                        {featureChildName: '财务系统集成', type: 'add'}
                    ]
                },
                {
                    featureName: '呼叫中心',
                    featureChildren: [
                        {featureChildName: '呼入：1个号码可接听', type: 'add'},
                        {featureChildName: '话费赠送3000分钟/月/公司', type: 'add'},
                        {featureChildName: '录音保存30天', type: 'add'},
                    ]
                },
                {
                    featureName: 'CRM功能',
                    featureChildren: [
                        {featureChildName: '客户评分', type: 'add'},
                        {featureChildName: '统计分析', type: 'add'}
                    ]
                },
            ],
            applyTry: true
        }
    ]
};

function differentVersionAction() {
    //获取所有版本信息
    this.getAllVersions = function(callback) {
        this.dispatch({loading: false,error: false,result: data});
        // differentVersionAjax.getDifferentVersions().then(data => {
        //     let idArr = _.map(data.list, ele => {
        //         return ele.id;
        //     });
        //     callback(idArr);
        //     // this.dispatch({loading: false,error: false,result: data});
        // }, errData => {
        //     // this.dispatch({loading: false,error: true,result: errData});
        // });
    };
    // this.getVersionFunctionsById = function(id) {
    //     differentVersionAjax.getVersionFunctionsById(id).then(data => {
    //         console.log(data);
    //         this.dispatch({data});
    //     }, errData => {
    //         this.dispatch({errData});
    //     });
    // };
}

export default alt.createActions(differentVersionAction);