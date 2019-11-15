/**
 * Created by wangliping on 2016/4/18.
 */
import MemberFormActions from '../action/member-form-actions';

class MemberFormStore {
    constructor() {
        this.isSaving = false; //是否正在保存成员
        this.saveResult = ''; //是否保存成功,error:失败，success:成功
        this.saveMsg = ''; //保存后的提示信息
        this.nickNameExist = false; // 昵称是否已存在
        this.nickNameError = false; // 昵称唯一性验证出错
        this.emailExist = false;//邮箱是否已存在
        this.emailError = false;//邮件唯一性验证出错
        this.savedUser = {};//添加用户成功后返回的用户信息
        this.userTeamList = []; //团队列表
        this.isLoadingTeamList = false; //正在获取部门列表
        this.isLoadingPosition = false; // 正在获取职务列表
        this.positionList = []; // 职务列表
        this.showAddGroupForm = false; //是否显示添加部门
        
        this.bindActions(MemberFormActions);
    }
    //获取团队列表
    getUserTeamList(teamList) {
        this.isLoadingTeamList = false;
        if (_.isArray(teamList) && teamList.length) {
            teamList.unshift({group_id: '', group_name: ''});
        }
        this.userTeamList = teamList || [];
    }
    //设置是否正在获取团队列表
    setTeamListLoading(flag) {
        this.isLoadingTeamList = flag;
    }
    //设置是否正在获取职务列表
    setPositionListLoading(flag) {
        this.isLoadingPosition = flag;
    }

    // 获取职务列表
    getSalesPosition(positionList) {
        this.isLoadingPosition = false;
        this.positionList = _.isArray(positionList) ? positionList : [];
    }

    updatePositionList(newAddPosition) {
        this.positionList = this.positionList.unshift(newAddPosition);
    }

    //正在保存的属性设置
    setSaveFlag(flag) {
        this.isSaving = flag;
    }

    //保存后的处理
    afterSave(resultObj) {
        //去掉正在保存的效果
        this.isSaving = false;
        this.saveResult = resultObj.saveResult;
        this.saveMsg = resultObj.saveMsg;
    }

    //保存后的处理
    addUser(resultObj) {
        if (resultObj.savedUser) {
            this.savedUser = resultObj.savedUser;
        }

        this.afterSave(resultObj);
    }

    //保存后的处理
    editUser(resultObj) {
        this.afterSave(resultObj);
    }

    //清空保存的提示信息
    resetSaveResult() {
        this.saveMsg = '';
        this.saveResult = '';
    }

    // 昵称（对应的是姓名）唯一性的验证
    checkOnlyNickName(result) {
        if (_.isString(result)) {
            //验证出错！
            this.nickNameError = true;
        } else {
            this.nickNameExist = result;
        }
    }


    //邮箱唯一性的验证
    checkOnlyEmail(result) {
        if (_.isString(result)) {
            //验证出错！
            this.emailError = true;
        } else {
            //该邮箱存不存在！
            this.emailExist = result;
        }
    }

    // 重置昵称（对应的是姓名）验证的标志
    resetNickNameFlags() {
        this.nickNameError = false;
        this.nickNameExist = false;
    }

    //重置邮箱验证的标志
    resetEmailFlags() {
        this.emailExist = false;
        this.emailError = false;
    }

    // 改变添加部门的展示
    setAddGroupForm(type) {
        this.showAddGroupForm = type;
    }

    // 取消添加部门的展示
    cancelAddGroup(addTeam) {
        this.showAddGroupForm = false;
        this.userTeamList.push(addTeam);
    }
}

export default alt.createStore(MemberFormStore, 'MemberFormStore');

