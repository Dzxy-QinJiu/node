/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/8/27.
 */
import userData from 'PUB_DIR/sources/user-data';
import {getTeamAllMembersList, getAllUserList} from 'PUB_DIR/sources/utils/common-data-util';
function FilterAction() {
    this.generateActions(
        'setInitialData',
        'setTimeType',
        'setTimeRange',
        'setFilterType',
        'setFilterClueSoure',
        'setFilterClueAccess',
        'setFilterClueClassify',
        'setFilterClueAvailbility',
        'setFilterClueProvince',
        'setExistedFiled',
        'setUnexistedFiled',
        'setFilterClueUsername',
        //获取负责人列表
        this.getTeamMemberList = function() {
        //运营或管理员，获取所有的成员列表
            if (userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN) || userData.hasRole(userData.ROLE_CONSTANS.OPERATION_PERSON)) {
            //获取所有的成员（不过滤停用的成员）
                getAllUserList(true).then(list => {
                    this.dispatch(_.map(list, item => {
                        return {
                            user_id: _.get(item, 'userId', ''),
                            nickname: _.get(item, 'nickName', '')
                        };
                    }));
                }, function(errorMsg) {
                    console.log(errorMsg);
                });
            } else {//销售获取我所在团队及下级团的成员列表
                getTeamAllMembersList().then(list => {
                    this.dispatch(_.map(list, item => {
                        return {
                            user_id: _.get(item, 'user_id'),
                            nickname: _.get(item, 'nick_name')
                        };
                    }));
                }, function(errorMsg) {
                    console.log(errorMsg);
                });
            }
        }
    );
}
module.exports = alt.createActions(FilterAction);
