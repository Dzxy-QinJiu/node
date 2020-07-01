const EventEmitter = require('events');

//线索客户相关事件
const filterEmitter = new EventEmitter();
filterEmitter.CLEAR_FILTERS = 'clearFilters';
filterEmitter.SELECT_FILTERS = 'selectFilters';
filterEmitter.ADD_COMMON = 'addCommon';
filterEmitter.SHOW_LIST = 'showList';
filterEmitter.CLOSE_LIST = 'closeList';
filterEmitter.ASK_FOR_CHANGE = 'askForChange';
filterEmitter.CHANGE_PERMITTED = 'changePermitted';
filterEmitter.CLEAR_COMMON_SELECT = 'clearCommonSelect';
export default filterEmitter;