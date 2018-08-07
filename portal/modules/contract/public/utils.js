import { CONTRACT_LABEL, PURCHASE_TYPE } from '../consts';

//根据id获取团队名
export const getTeamName = function(list, id) {
    const team = _.find(list, item => item.groupId === id);
    const teamName = team ? team.groupName : '';
    return teamName;
};

//根据签约类型值获得签约类型名
export const getLabelName = function(value) {
    const label = _.find(CONTRACT_LABEL, item => item.value === value);
    const labelName = label ? label.name : '';
    return labelName;
};

// 根据dataIndex获取采购合同分类名
export const getPurchaseContractTypeName = function(dataIndex) {
    const type = _.find(PURCHASE_TYPE, item => item.dataIndex === dataIndex.toString());
    const typeName = type ? type.name : '';
    return typeName;
};
