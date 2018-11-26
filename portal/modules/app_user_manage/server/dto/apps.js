const CATEGORY_TYPE = oplateConsts.CATEGORY_TYPE;
const _ = require('lodash');
exports.toRestObject = function(list) {
    var result = [];
    list = list || [];
    list.forEach(function(item) {
        result.push({
            app_id: item.client_id,
            app_name: item.client_name,
            app_logo: item.client_logo
        });
    });
    return result;
};
// 获取子部门
function getChildDepartment(childGroup) {
    let childDepartName = [];
    let childGroups = [];
    const getChildDepartmentData = (childGroup) => {
        if (_.isArray(childGroup) && childGroup.length) {
            _.each(childGroup, (childItem) => {
                childDepartName.push(childItem.group_name);
                var childGroup = {
                    category: childItem.category,
                    group_name: childItem.group_name,
                    group_id: childItem.group_id
                };
                childGroups.push(childGroup);
                getChildDepartmentData(childItem.child_groups);
            });
        }
    };
    getChildDepartmentData(childGroup);
    return {childDepartName: childDepartName,childGroups: childGroups};
}
exports.toFrontUserDetail = function(userDetail) {
    var frontUserDetail = {};
    frontUserDetail.apps = userDetail.apps || {};
    frontUserDetail.customer = userDetail.customer || {};
    frontUserDetail.sales = userDetail.sales || {};
    frontUserDetail.sales_team = userDetail.sales_team || {};
    frontUserDetail.user = userDetail.user || {};
    frontUserDetail.groups = [];
    var groups = userDetail.groups || [];
    _.forEach(groups, (groupItem) => {
        var frontGroupItem = {};
        if (groupItem.category === +CATEGORY_TYPE.ORGANIZATION) { // 组织
            frontGroupItem.group_name = groupItem.group_name;
            frontGroupItem.group_id = groupItem.group_id;
            frontGroupItem.category = groupItem.category;
        }
        // 组织下的部门或是团队信息
        if (groupItem.child_groups && _.isArray(groupItem.child_groups) && groupItem.child_groups.length) {
            frontGroupItem.child_groups = [];
            let childGroups = groupItem.child_groups;
            _.map(childGroups, (childItem) => {
                if (childItem.category === +CATEGORY_TYPE.DEPARTMENT) { // 部门
                    frontGroupItem.child_groups_names = [];
                    var subChildGroup = {
                        category: childItem.category,
                        group_name: childItem.group_name,
                        group_id: childItem.group_id
                    };
                    var frontChildObj = getChildDepartment(childItem.child_groups);
                    if (_.isArray(childItem.child_groups) && childItem.child_groups.length){
                        subChildGroup.child_groups = frontChildObj.child_groups;
                    }
                    frontGroupItem.child_groups.push(subChildGroup);
                    frontGroupItem.child_groups_names.push(childItem.group_name);
                    if (_.get(frontChildObj,'childDepartName',[]).length){
                        frontGroupItem.child_groups_names = _.concat(frontGroupItem.child_groups_names,frontChildObj.childDepartName);
                    }
                } else if (childItem.category === +CATEGORY_TYPE.TEAM) { // 团队
                    frontGroupItem.child_groups.push({
                        category: childItem.category,
                        group_name: childItem.group_name,
                        group_id: childItem.group_id,
                    });
                }
            });
        }
        frontUserDetail.groups.push(frontGroupItem);
    });
    return frontUserDetail;
};