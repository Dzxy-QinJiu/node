var React = require('react');
/**
 * 拖动区域
 * options
 onRemove[fn] 点击删除图标 不传则没有删除图标
 items[array] 可拖动的item
 onChange[fn] 容器内部item数量发生变动时回调
 onClick[fn] 点击item回调
 *
 */
import uniqueId from 'lodash/uniqueId';
import PropTypes from 'prop-types';
import Sortable from 'react-sortablejs';
import {Icon} from 'antd';

// Functional Component
const SharedGroup = ({items, options, onChange, onRemove, onClick}) => {
    let sortable = null; // sortable instance
    let itemList = (
        <li></li>
    );
    if (items && items.length) {
        itemList = items.map((item, idx) => (
            <li
                className="drag-item"
                key={uniqueId()}
                data-id={item.value}
            >
                <span onClick={() => {
                    onClick && _.isFunction(onClick) && onClick(item, idx);
                }}>
                    {item.calcType ? item.text + '(' + item.calcType.text + ')' : item.text}
                </span>
                {
                    onRemove && _.isFunction(onRemove) ? <Icon
                        type="close-circle-o"
                        onClick={() => {
                            onRemove(item, idx);
                        }}
                    /> : null
                }
            </li>));
    }
    return (
        <Sortable
            // See all Sortable options at https://github.com/RubaXa/Sortable#options
            options={options}
            tag="ul"
            onChange={(order, sortable, evt) => {
                if (onChange && _.isFunction(onChange)) {
                    onChange(order, evt);
                }
            }}
            ref={(c) => {
                if (c) {
                    sortable = c.sortable;
                }
            }}
        >
            {itemList}
        </Sortable>
    );
};
SharedGroup.propTypes = {
    items: PropTypes.array,
    onChange: PropTypes.func,
    options: PropTypes.element,
    onRemove: PropTypes.func,
    onClick: PropTypes.func
};
export default SharedGroup;