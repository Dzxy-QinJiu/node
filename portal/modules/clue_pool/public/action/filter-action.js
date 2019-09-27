/**
 * Created by hzl on 2019/7/3.
 */
import {getMyTeamTreeAndFlattenList} from 'PUB_DIR/sources/utils/common-data-util';

class FilterAction {
    constructor() {
        this.generateActions(
            'setInitialData',
            'setTimeType',
            'setTimeRange',
            'setFilterType',
            'setFilterClueSoure',
            'setFilterClueAccess',
            'setFilterClueClassify',
            'setFilterSourceClassify',
            'setFilterClueProvince',
            'setFilterClueTeam',
            'setExistedFiled',
            'setUnexistedFiled',
            'setFilterClueUsername',
            'setFilterClueAvailability',
            'setSimilarFiled',
        );
    }
    getTeamList(cb) {
        getMyTeamTreeAndFlattenList(data => {
            let list = data.teamList || [];
            list.unshift({group_id: '', group_name: Intl.get('common.all', '全部')});
            this.dispatch({teamList: list, teamTreeList: data.teamTreeList});
            if (_.isFunction(cb)) cb(list);
        });
    }
}

export default alt.createActions(FilterAction);