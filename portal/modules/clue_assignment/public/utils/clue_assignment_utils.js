import {getClueSalesList, getLocalSalesClickCount} from 'MOD_DIR/clue_customer/public/utils/clue-customer-utils';
import {formatSalesmanList} from 'PUB_DIR/sources/utils/common-method-util';

// 获取待分配人员列表
exports.getSalesDataList = (salesManList) => {
    let clueSalesIdList = getClueSalesList();
    //销售领导、域管理员,展示其所有（子）团队的成员列表
    let dataList = _.map(formatSalesmanList(salesManList), salesman => {
        let clickCount = getLocalSalesClickCount(clueSalesIdList, _.get(salesman,'value'));
        return {
            ...salesman,
            clickCount
        };
    });
    //按点击的次数进行排序
    dataList = _.sortBy(dataList,(item) => {return -item.clickCount;});
    return (
        _.isArray(dataList) ?
            dataList.map((source, idx) => {
                return (<Option key={idx} value={`${source.value}^${source.name}`}>{source.name}</Option>);
            }) : null
    );
};

//将获取到的销售人员格式化输出
exports.getFormattedSalesMan = (salesMan) => {
    let user_name = '', member_id = '', sales_team = '', sales_team_id = '';
    //select的value为"销售id&&所属团队id^销售名称 - 团队名称"的格式
    let salesInfo = salesMan.split('^');
    //被选择的“销售名称 - 团队名称“
    let selectedSalesName = salesInfo[1];
    //销售id和所属团队的id中间是用&&连接的，格式为“销售id&&所属团队的id”
    let idArray = _.split(salesInfo[0], '&&');
    if (_.isArray(idArray) && idArray.length) {
        member_id = idArray[0];//销售的id
        sales_team_id = idArray[1] || '';//团队的id
    }
    //销售的名字和团队的名字格式是“销售名称 - 团队名称”
    let nameArray = _.split(salesInfo[1], '-');
    if (_.isArray(nameArray) && nameArray.length) {
        user_name = nameArray[0];//销售的名字
        sales_team = _.trim(nameArray[1]) || '';//团队的名字
    }
    return ({
        user_name,
        member_id,
        sales_team_id,
        sales_team,
        selectedSalesName
    });
};

//获取格式化后的销售人员select的value
exports.getSelectedSaleManValue = (salesMan) => {
    let {sales_team, user_name} = salesMan;
    let selectedValue = user_name;
    if(!_.isEmpty(sales_team)) {
        selectedValue += ` - ${sales_team}`;
    }
    return selectedValue;
};