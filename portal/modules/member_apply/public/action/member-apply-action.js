/**
 * Created by hzl on 2019/3/5.
 */
import {APPLY_APPROVE_TYPES} from 'PUB_DIR/sources/utils/consts';
let userData = require('PUB_DIR/sources/user-data');
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
var scrollBarEmitter = require('PUB_DIR/sources/utils/emitters').scrollBarEmitter;
import {getAllApplyList,getWorklistApplyList} from 'PUB_DIR/sources/utils/apply-common-data-utils';
import applyPrivilegeConst from 'MOD_DIR/apply_approve_manage/public/privilege-const';

function MemberApplyActions() {
    this.generateActions(
        'setInitState',
        'setSelectedDetailItem',//点击某个申请
        'changeApplyListType',
        'changeApplyAgreeStatus',//审批完后改变出差申请的状态
        'afterAddApplySuccess',
        'updateAllApplyItemStatus',
        'afterTransferApplySuccess',
        'setLastApplyId',
        'setShowUpdateTip'
    );
    this.getAllMemberApplyList = function(queryObj,callback) {
        //需要先获取待审批列表，成功后获取全部列表 queryObj.status === 'ongoing'表示待我审批
        this.dispatch({loading: true, error: false});
        //如果是全部申请(!queryObj.status)，要先取一下待我审批的列表
        if (queryObj.status === 'ongoing' || !queryObj.status){
            getWorklistApplyList({type: APPLY_APPROVE_TYPES.MEMBER_INVITE}).then((workList) => {
                //如果是待我审批的列表，不需要在发获取全部列表的请求了
                if (queryObj.status){
                    let hasCancelPrivilege = userData.getUserData().user_id && hasPrivilege(applyPrivilegeConst.WORKFLOW_BASE_PERMISSION);
                    //需要对全部列表都加一个可以审批的属性
                    _.forEach(workList.list,(workItem) => {
                        workItem.showApproveBtn = true;
                        //如果是我申请的，除了可以审批之外，我也可以撤回
                        if (_.get(workItem,'applicant.user_id') === hasCancelPrivilege){
                            workItem.showCancelBtn = true;
                        }
                    });
                    this.dispatch({error: false, loading: false, data: workList});
                    _.isFunction(callback) && callback(workList.total);
                } else {
                    getDiffTypeApplyList(this,queryObj,workList.list);
                }
            }, (errorMsg) => {
                this.dispatch({
                    error: true,
                    loading: false,
                    errMsg: errorMsg || Intl.get('member.apply.failed.get.worklist', '获取由我审批的成员申请失败')
                });
            });
        }else{
            getDiffTypeApplyList(this,queryObj);
        }
    };

}
function getDiffTypeApplyList(that,queryObj,workListArr) {
    getAllApplyList(queryObj).then((data) => {
        scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
        //需要对全部列表进行一下处理，知道哪些是可以审批的
        if (_.isArray(workListArr) && workListArr.length){
            _.forEach(workListArr,(item) => {
                var targetObj = _.find(data.list,(dataItem) => {
                    return item.id === dataItem.id;
                });
                if (targetObj){
                    targetObj.showApproveBtn = true;
                }
            });
        }
        //给 自己申请的并且是未通过的审批加上可以撤销的标识
        _.forEach(data.list,(item) => {
            if (item.status === 'ongoing' && _.get(item,'applicant.user_id') === userData.getUserData().user_id && hasPrivilege(applyPrivilegeConst.WORKFLOW_BASE_PERMISSION)){
                item.showCancelBtn = true;
            }
        });
        that.dispatch({error: false, loading: false, data: data});
    },(errorMsg) => {
        that.dispatch({
            error: true,
            loading: false,
            errMsg: errorMsg || Intl.get('member.apply.failed.get.all.apply','获取全部成员申请失败')
        });});
}
module.exports = alt.createActions(MemberApplyActions);
