
import TestUtils from 'react-addons-test-utils';
var expect = require('expect.js');
var Crm = require('../public');

describe('客户关系管理模块测试', function() {
    var div = document.createElement('div');
    document.body.appendChild(div);

    var node = $(div);

    beforeEach(function() {
        ReactDOM.render(
            <Crm />,
            div
        );
    });

    afterEach(function() {
        ReactDOM.unmountComponentAtNode(div);
    });

    it('显示客户列表', function() {
        expect(node.find('table').length).to.be.equal(1);
    });

    it('添加客户', function() {
        expect(node.find('table').length).to.be.equal(1);
    });
});
