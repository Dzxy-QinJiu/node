/**
 * Created by hzl on 2020/6/9.
 */
import DealFilterAction from '../action/deal-filter-actions';

class DealFilterStore {
    constructor() {
        this.custom_variables = {}; // 自定义类型筛选
        this.bindActions(DealFilterAction);
    }
    setFilterCustomField(customItem) {
        this.custom_variables = _.extend(this.custom_variables, customItem);
    }
}

export default alt.createStore(DealFilterStore, 'DealFilterStore');

