import MemberManageAjax from '../ajax';
import MemberManageAction from './index';
import {getMyTeamTreeAndFlattenList} from 'PUB_DIR/sources/utils/common-data-util';

class MemberFormActions {
    constructor() {
        this.generateActions(
            'setSaveFlag', //设置是否正在保存
            'resetNickNameFlags', // 重置昵称（对应的是姓名）验证的标志
            'resetEmailFlags', //重置邮箱验证的标志
            'setPositionListLoading',//正在获取职务列表
            'setTeamListLoading', //是否正在获取销售团队列表的标志
            'setAddGroupForm', // 是否展示添加部门
            'cancelAddGroup',// 取消添加部门的展示
            'updatePositionList', // 更新职务列表
        );
    }

    //获取团队列表
    getUserTeamList(isReload) {
        getMyTeamTreeAndFlattenList(data => {
            if(data.errorMsg) {
                this.dispatch(data.errorMsg || Intl.get('common.get.team.list.failed', '获取团队列表失败'));
            } else {
                this.dispatch(data.teamList);
            }
        }, isReload);
    }

    // 获取职务列表
    getSalesPosition() {
        MemberManageAjax.getSalesPosition().then( (positionList) => {
            this.dispatch(positionList);
        }, (errMsg) => {
            this.dispatch(errMsg);
        } );
    }

    //获取角色列表
    getRoleList() {
        MemberManageAjax.getRoleList().then((roleList) => {
            this.dispatch(roleList);
        });
    }

    //保存成员
    addUser(user) {
        MemberManageAjax.addUser(user).then( (savedUser) => {
            //保存成功后的处理
            let saveMsg = Intl.get('user.user.add.success', '添加成功');
            const email = _.get(savedUser, 'email');
            if (email) {
                saveMsg = Intl.get('user.info.active.email', '激活邮件已发送至{email}',{email});
            }
            this.dispatch({saveResult: 'success', saveMsg: saveMsg , savedUser: savedUser});

        }, (errorMsg) => {
            //保存失败后的处理
            this.dispatch({saveResult: 'error', saveMsg: errorMsg || Intl.get('member.add.failed', '添加失败！') });
        });
    }
    //编辑成员
    editUser(user) {
        MemberManageAjax.editUser(user).then((data) => {
            //修改成功data=true，false:修改失败
            if (data) {
                //保存成功后的处理
                this.dispatch({saveResult: 'success', saveMsg: Intl.get('common.save.success', '保存成功！')});
                //修改成功后刷新左侧列表对应成员卡片及其详情的数据
                MemberManageAction.afterEditMember(user);
            } else {
                this.dispatch({saveResult: 'error', saveMsg: Intl.get('common.save.failed', '保存失败!')});
            }
        }, (errorMsg) => {
            //保存失败后的处理
            this.dispatch({saveResult: 'error', saveMsg: errorMsg || Intl.get('common.save.failed', '保存失败!')});
        });
    }

    //清空提示
    resetSaveResult(formType, saveResult) {
        if (saveResult === 'success') {
            if (formType === 'add') {
                //清空搜索内容
                MemberManageAction.updateSearchContent('');
            } else if (formType === 'edit') {
                //修改成功后返回详情
                MemberManageAction.returnInfoPanel();
            }
        }
        this.dispatch();
    }

    //昵称（对应的是姓名）唯一性的验证
    checkOnlyNickName(nickName) {
        MemberManageAjax.checkOnlyNickName(nickName).then((result) => {
            this.dispatch(result);
        }, (errorMsg) => {
            this.dispatch(errorMsg || Intl.get('common.name.is.unique', '姓名唯一性校验出错！'));
        });
    }

    //电话唯一性的验证
    checkOnlyPhone(phone, callback) {
        MemberManageAjax.checkOnlyPhone(phone).then((result) => {
            _.isFunction(callback) && callback(result);
        }, (errorMsg) => {
            _.isFunction(callback) && callback(errorMsg || Intl.get('common.phone.is.unique', '电话唯一性校验出错！'));
        });
    }
    //用户名唯一性的验证
    checkOnlyUserName(userName, callback) {
        MemberManageAjax.checkOnlyUserName(userName).then( (result) => {
            _.isFunction(callback) && callback(result);
        }, (errorMsg) => {
            _.isFunction(callback) && callback(errorMsg || Intl.get('common.username.is.unique', '用户名唯一性校验出错！'));
        });
    }

    //邮箱唯一性的验证
    checkOnlyEmail(email) {
        MemberManageAjax.checkOnlyEmail(email).then((result) => {
            this.dispatch(result);
        }, (errorMsg) => {
            this.dispatch(errorMsg || Intl.get('user.email.only.error', '邮箱唯一性验证失败'));
        });
    }
     
}

export default alt.createActions(MemberFormActions);
