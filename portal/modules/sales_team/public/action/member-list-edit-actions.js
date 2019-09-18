/**
 * Created by xiaojinfeng on 2016/04/08.
 */
//联系人的ajax
const SalesTeamAjax = require('../ajax/sales-team-ajax');
const SalesTeamActions = require('./sales-team-actions');
const SalesTeamAction = require('../action/sales-team-actions');
import {getOrganization} from 'PUB_DIR/sources/utils/common-method-util';

function SalesTeamMemberAction() {

    this.generateActions(
        'setMemberListSaving'
    );

    this.addMember = function(obj) {
        SalesTeamAjax.addMember(obj).then( (data) => {
            if (data) {
                this.dispatch({saveResult: 'success', saveMsg: Intl.get('common.save.success', '保存成功')});

            } else {
                this.dispatch({saveResult: 'error', saveMsg: Intl.get('common.save.failed', '保存失败')});
            }

        }, (errorMsg) => {
            //保存失败后的处理
            this.dispatch({saveResult: 'error', saveMsg: errorMsg || Intl.get('common.save.failed', '保存失败')});
        });
    };

    this.editMember = function(obj) {
        SalesTeamAjax.editMember(obj).then( (data) => {
            if (data) {
                this.dispatch({saveResult: 'success', saveMsg: Intl.get('common.save.success', '保存成功')});
            } else {
                this.dispatch({saveResult: 'error', saveMsg: Intl.get('common.save.failed', '保存失败')});
            }

        }, (errorMsg) => {
            //保存失败后的处理
            this.dispatch({saveResult: 'error', saveMsg: errorMsg || Intl.get('common.save.failed', '保存失败')});
        });
    };

    this.clearSaveFlags = function(type, saveResult, obj) {
        if (saveResult === 'success') {
            //刷新左侧树中该团队的人数
            if (type === 'add') {
                SalesTeamActions.afterAddMember(obj);
            } else if (type === 'edit') {
                SalesTeamActions.afterEditMember(obj);
            }
            let groupId = obj.groupId || obj.group_id;
            let organizationId = _.get(getOrganization(), 'id', '');
            if (groupId !== organizationId) {
                //刷新团队成员列表
                SalesTeamActions.setTeamMemberLoading(true);
                SalesTeamActions.getSalesTeamMemberList(groupId);
                //刷新添加时展示的不属于任何团队的成员列表
                SalesTeamActions.getMemberList();
            }
        }
        this.dispatch();
    };
}

module.exports = alt.createActions(SalesTeamMemberAction);