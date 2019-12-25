/**
* Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
* 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
* Created by xuning on 2018 
*/
import DetailCard from 'CMP_DIR/detail-card';
import { hasPrivilege } from 'CMP_DIR/privilege/checker';
import {isOplateUser} from 'PUB_DIR/sources/utils/common-method-util';
const CATEGORY_TYPE = oplateConsts.CATEGORY_TYPE;

class OrgCard extends React.Component {
    constructor(props) {
        super();
    }
   
    render() {
        const { groupsInfo } = this.props;
        const renderOrgCard = ({groupsData = null, departmentData = null, teamData = null }) => (
            <DetailCard
                titleBottomBorderNone={true}
                title={(
                    <div className="sales-team-show-block">
                        <div className="sales-team">
                            <span className="sales-team-label">
                                {Intl.get('user.detail.belongToOrg', '所属组织')}
                            </span>
                            <span className="sales-team-text">
                                {groupsData}
                            </span>
                        </div>
                    </div>
                )}
            />
        );
        // 有组织信息时，显示组织信息以及组织信息下的部门和团队信息
        let groups = null;
        let groupsData = null;
        groups = _.map(groupsInfo, (groupItem) => {
            if (groupItem.category === +CATEGORY_TYPE.ORGANIZATION) { // 组织
                groupsData = groupItem.group_name;
            }else{
                groupsData = null;
            }
            let departmentData = null;
            let teamData = null;
            // 组织下的部门或是团队信息
            if (groupItem.child_groups && _.isArray(groupItem.child_groups) && groupItem.child_groups.length) {
                let childGroups = groupItem.child_groups;
                _.map(childGroups, (childItem) => {
                    if (childItem.category === +CATEGORY_TYPE.DEPARTMENT) { // 部门
                        departmentData = <div className="sales-team">
                            <span className="sales-team-label">
                                {Intl.get('crm.113', '部门')}:
                            </span>
                            <span className="sales-team-text">
                                {_.isArray(groupItem.child_groups_names) ? groupItem.child_groups_names.join('/') : null}
                            </span>
                        </div>;
                    } else if (childItem.category === +CATEGORY_TYPE.TEAM) { // 团队
                        teamData = <div className="sales-team">
                            <span className="sales-team-label">
                                {Intl.get('user.user.team', '团队')}:
                            </span>
                            <span className="sales-team-text">{childItem.group_name}</span>
                        </div>;
                    }
                });
            }
            return (
                <div>
                    {groupsData || teamData || departmentData ? renderOrgCard({groupsData, teamData, departmentData}) : null}
                </div>
            );
        });
        return groups;
    }
}

OrgCard.defaultProps = {
    groupsInfo: {}
};

OrgCard.propTypes = {
    groupsInfo: PropTypes.object,
};
export default OrgCard;