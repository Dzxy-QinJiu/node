/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/7/22.
 */
import userData from 'PUB_DIR/sources/user-data';
import {NavLink} from 'react-router-dom';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import applyPrivilegeConst from '../../apply_approve_manage/public/privilege-const';
require('./index.less');
class SettingWorkflowTip extends React.Component {
    state = {
    };
    renderNoSettingWorkFlowTip = () => {
        //如果是普通销售，请联系管理员，如果是管理员，需要点击跳转到配置页面
        let isCommonSales = userData.getUserData().isCommonSales;
        if (isCommonSales){
            return (
                <div className="no-settin-msg-tip">
                    {Intl.get('apply.approve.not.setting.workflow', '尚未配置流程，{tip}',{tip: Intl.get('apply.approve.contact.manager', '请联系管理员')})}
                </div>
            );
        }else{
            return (
                <div className="no-settin-msg-tip">
                    {
                        hasPrivilege(applyPrivilegeConst.USERAPPLY_BASE_PERMISSION) ?
                            <ReactIntl.FormattedMessage
                                id="apply.approve.not.setting.workflow"
                                defaultMessage={'尚未配置流程，{tip}'}
                                values={{

                                    tip: <span className="set-workflow">
                                        <NavLink to="/background_management/apply_approve" activeClassName="active" data-tracename="设置流程">
                                            {Intl.get('apply.approve.go.set.workflow','去设置？')}
                                        </NavLink>
                                    </span>
                                }}
                            /> : null
                    }

                </div>
            );
        }
    };

    render() {
        return (
            <div className="setting-workflow-tip">
                {this.renderNoSettingWorkFlowTip()}
            </div>
        );
    }
}

module.exports = SettingWorkflowTip;
