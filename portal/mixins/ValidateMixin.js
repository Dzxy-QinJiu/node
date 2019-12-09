import { removeCommaFromNum, parseAmount } from 'LIB_DIR/func';

function merge() {
    var ret = {};
    var args = [].slice.call(arguments, 0);
    args.forEach(function(a) {
        if(a){
            Object.keys(a).forEach(function(k) {
                ret[k] = a[k];
            });
        }
    });
    return ret;
}

export default {
    getInitialState: function() {
        return {
            status: {},
        };
    },

    //清空state
    clearState: function() {
        const blankState = {};
        Object.keys(this.state).forEach(stateKey => {
            if (_.isObject(this.state[stateKey])) {
                blankState[stateKey] = {};
            } else {
                blankState[stateKey] = undefined;
            }
        });
        this.setState(blankState);
    },

    //设置字段值的方法
    //参数说明：field为字段名，index为表单索引（用于多表单的场景），e为事件对象，cb为回调函数
    setField: function(field, index, e, cb) {
        //如果索引不是整数，则认为是单表单的场景
        //此时index参数所传的值应该是e的值，index应视为没有
        if (!_.isInteger(index)) {
            cb = e;
            e = index;
            index = undefined;
        }

        let value;

        //如果是日期选择组件，则需要用valueOf方法取值
        if (e._isAMomentObject) {
            value = e.valueOf();
        } else {
            //如果e为dom事件对象，则取其target属性下的值，否则认为e本身即为值
            value = e;
            const target = e && e.target;
            if (target) {
                if (target.type === 'checkbox') {
                    value = target.checked;
                } else {
                    value = target.value;
                }
            }
        }

        value = removeCommaFromNum(value);

        //如果index不是数字，则认为是单表单场景，只需给formData下的对应字段赋值
        if (!_.isInteger(index)) {
            this.state.formData[field] = value;
        } else {
            //如果index是数字，但e不是对象，也认为是单表单场景，只需给formData下的对应字段赋值
            if (!_.isObject(e)) {
                this.state.formData[field] = value;
            //否则就是多表单场景，需要给索引为index的表单的formData下的对应字段赋值
            } else {
                this.state['formData' + index][field] = value;
            }
        }

        this.setState(this.state, () => {
            //若传了回调函数则执行该函数
            if (_.isFunction(cb)) cb();
        });
    },

    getValidateStatus: function(field) {
        const status = this.state.status;
        let validateStatus = '';
        if (status[field] && status[field].errors) {
            validateStatus = 'error';
        }
        return validateStatus;
    },

    getHelpMessage: function(field) {
        const status = this.state.status;
        let helpMessage = '';
        if (status[field] && status[field].errors) {
            helpMessage = status[field].errors.join(',');
        }
        return helpMessage;
    },

    handleValidate: function handleValidate(status, formData) {
        this.onValidate(status, formData);
    },
  
    onValidate: function onValidate(status, formData) {
        for (let key in formData) {
            formData[key] = removeCommaFromNum(formData[key]);
        }

        this.setState({
            status: merge(this.state.status, status),
            formData: merge(this.state.formData, formData)
        });
    },
  
    //处理金额，未定义时赋空值及转成千分位格式等
    parseAmount: parseAmount,
  
    //获取数字验证规则
    getNumberValidateRule() {
        return {pattern: /^(\d|,)+(\.\d{1,2})?$/, message: Intl.get('common.fill.num', '请填写数字')};
    },
};
