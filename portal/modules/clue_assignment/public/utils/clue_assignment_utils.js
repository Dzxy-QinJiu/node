import {getClueSalesList, getLocalSalesClickCount} from 'MOD_DIR/clue_customer/public/utils/clue-customer-utils';
import {formatSalesmanList} from 'PUB_DIR/sources/utils/common-method-util';
/**
 * @param {Array} salesmanList  销售人员列表详细信息
 * 例：
 * [{
 *     user_groups: [{
 *         category: 1,
 *         client_id: 'id',
 *         creat_date: '1565227564087',
 *         group_id: 'id',
 *         group_name: '南部-平台部',
 *         owner_id: 'id',
 *         parent_group: 'id',
 *         root_group: 'id',
 *         user_ids: ['id1', 'id2', 'id3']
 *     }],
 *     user_info: {
 *         email: 'tips@qq.com',
 *         status: 1,
 *         user_client: [{
 *             client_id: 'id',
 *             is_two_factor: 0,
 *             login_count: 0,
 *             over_draft: 0,
 *             roles: ['roles'],
 *             status: 1,
 *             user_id: 'id'
 *         }],
 *         user_id: 'id',
 *         user_logo: 'https://',
 *         user_name: 'test_tips1'
 *     }
 * }]
 * @returns {Object}salesDataList
 * 例:
 * <Option key='1' value='销售id&&所属团队的id'>销售名称 - 团队名称</Option>
 * @desc 根据销售人员列表详细信息获取销售团队的下拉列表项
 */
exports.getSalesDataList = (salesmanList) => {
    let clueSalesIdList = getClueSalesList();
    //销售领导、域管理员,展示其所有（子）团队的成员列表
    let salesDataList = _.map(formatSalesmanList(salesmanList), salesman => {
        let clickCount = getLocalSalesClickCount(clueSalesIdList, _.get(salesman,'value'));
        return {
            ...salesman,
            clickCount
        };
    });
    //按点击的次数进行排序
    salesDataList = _.sortBy(salesDataList,(item) => {return -item.clickCount;});
    return (_.map(salesDataList, (source, idx) => {
        return (<Option key={idx} value={source.value}>{source.name}</Option>);
    }));
};

/**
 * @param {string} salesMan 通过下拉列表获取的value
 * 例：'销售id&&所属团队的id'
 * @param {Array} salesmanList 销售人员列表详细信息
 * 例：
 * [{
 *     user_groups: [{
 *         category: 1,
 *         client_id: 'id',
 *         creat_date: '1565227564087',
 *         group_id: 'id',
 *         group_name: '南部-平台部',
 *         owner_id: 'id',
 *         parent_group: 'id',
 *         root_group: 'id',
 *         user_ids: ['id1', 'id2', 'id3']
 *     }],
 *     user_info: {
 *         email: 'tips@qq.com',
 *         status: 1,
 *         user_client: [{
 *             client_id: 'id',
 *             is_two_factor: 0,
 *             login_count: 0,
 *             over_draft: 0,
 *             roles: ['roles'],
 *             status: 1,
 *             user_id: 'id'
 *         }],
 *         user_id: 'id',
 *         user_logo: 'https://',
 *         user_name: 'test_tips1'
 *     }
 * }]
 * @returns {Object}selectedSalesman
 * 例:
 * {
 *      user_name: 'sales04@curtao.text',
 *      member_id: 'id',
 *      sales_team_id: 'id',
 *      sales_team: '南部-平台部',
 *      selectedSalesName: 'sales04@curtao.text - 南部-平台部'
 *  }
 * @desc 根据下拉列表获取的value返回格式化的对象
 */
exports.getFormattedSalesMan = (salesMan, salesmanList) => {
    let user_name = '', member_id = '', sales_team = '', sales_team_id = '';
    //销售id和所属团队的id中间是用&&连接的，格式为“销售id&&所属团队的id”
    let idArray = _.split(salesMan, '&&');
    if (_.isArray(idArray) && idArray.length) {
        member_id = idArray[0];//销售的id
        sales_team_id = idArray[1] || '';//团队的id
    }
    //通过value获取销售的名字和团队的名字, 销售的名字和团队的名字格式是“销售名称 - 团队名称”
    let selectedSalesman = _.find(salesmanList, salesman => _.isEqual(_.get(salesman, 'user_info.user_id'), member_id));
    //销售的名字
    user_name = _.get(selectedSalesman, 'user_info.nick_name', '');
    //销售所在的团队
    let selectedTeam = _.find(selectedSalesman.user_groups, group => _.isEqual(_.get(group, 'group_id'), sales_team_id));
    sales_team = _.get(selectedTeam, 'group_name', '');
    let selectedSalesName = user_name;
    if(!_.isEmpty(sales_team)) {
        selectedSalesName += ` - ${sales_team}`;
    }

    return ({
        user_name,
        member_id,
        sales_team_id,
        sales_team,
        selectedSalesName
    });
};

/**
 * @param {Object} strategyInfo  线索分配策略信息
 * 例：
 * {
 *     condition: {
 *         province: ['山东']
 *     },
 *     description: '',
 *     id: 'id',
 *     member_id: 'id',
 *     name: '线索分配策略测试',
 *     sales_team: '北部1',
 *     sales_team_id: 'id',
 *     status: 'enable',
 *     user_name: 'ETARTZT'
 * }
 * @returns {string}selectedValue
 * 例: 'ETARTZT - 北部1'
 * @desc 根据线索分配策略转换成对应的'销售-团队'数据
 */
exports.getSelectedSaleManValue = (strategyInfo) => {
    let {sales_team, user_name} = strategyInfo;
    let selectedValue = user_name;
    if(!_.isEmpty(sales_team)) {
        selectedValue += ` - ${sales_team}`;
    }
    return selectedValue;
};

exports.getSelectedSaleManValueId = (strategyInfo) => {
    let {member_id, sales_team_id} = strategyInfo;
    let selectedSaleId = member_id;
    if(!_.isEmpty(sales_team_id)) {
        selectedSaleId += `&&${sales_team_id}`;
    }
    return selectedSaleId;
};