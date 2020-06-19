/**
 * Created by hzl on 2020/6/9.
 */
    
class DealFilterAction {
    constructor() {
        this.generateActions(
            'setFilterCustomField', // 筛选自定义字段
        );
    }
}

export default alt.createActions(DealFilterAction);
