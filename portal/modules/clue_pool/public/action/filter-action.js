/**
 * Created by hzl on 2019/7/3.
 */

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
            'setFilterClueAvailbility',
            'setFilterClueProvince',
            'setExistedFiled',
            'setUnexistedFiled',
            'setFilterClueUsername',
        );
    }
}

export default alt.createActions(FilterAction);