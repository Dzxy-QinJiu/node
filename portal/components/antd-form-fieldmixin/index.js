import classNames from 'classnames';

function merge(obj1,obj2) {
    obj1 = obj1 || {};
    obj2 = obj2 || {};
    for(var key in obj2) {
        obj1[key] = obj2[key];
    }
}

const FieldMixin = {
    renderValidateStyle(item) {
        var formData = this.state.formData;
        var status = this.state.status;

        var classes = classNames({
            'error': status[item].errors,
            'validating': status[item].isValidating,
            'success': formData[item] && !status[item].errors && !status[item].isValidating
        });

        return classes;
    },
    setField(field, e) {
        let v = e;
        const target = e && e.target;
        if (target) {
            // no radio
            if ((target.nodeName + '').toLowerCase() === 'input' &&
                target.type === 'checkbox') {
                v = target.checked;
            } else {
                v = e.target.value;
            }
        }
        const newFormData = {};
        newFormData[field] = v;
        merge(this.state.formData, newFormData);
        this.setState({
            formData: this.state.formData,
        });
    },

    handleValidate(status, formData) {
        this.onValidate(status, formData);
    },
    onValidate(status, formData) {
        merge(this.state.status, status);
        merge(this.state.formData, formData);
        this.setState({
            status: this.state.status,
            formData: this.state.formData,
        });
    },
};

export default FieldMixin;