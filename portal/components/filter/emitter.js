const EventEmitter = require('events');

//线索客户相关事件
const filterEmitter = new EventEmitter();
filterEmitter.CLEAR_FILTERS = 'clearFilters';
filterEmitter.SELECT_FILTERS = 'selectFilters';
export default filterEmitter;