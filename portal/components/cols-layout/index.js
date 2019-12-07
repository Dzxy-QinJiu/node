import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import './index.less';

export default class ColsLayout extends Component {
    static propTypes = {
        commonData: PropTypes.array.isRequired, //jsx集合（每个子元素集合）
        showWidth: PropTypes.number, //显示出来的最外层width,若showWidth小于width，则局部出现左右滚动条,若不传，则与width相同
        width: PropTypes.number.isRequired, //布局真实width
        itemWidth: PropTypes.number.isRequired, //每一个子组件的width
    }
    renderItem = () => {
        const data = this.props.commonData;
        const colsNum = this.props.commonData.length;
        const maxWidth = (this.props.width - (colsNum + 1) * 30) / colsNum;
        return _.isArray(data) && _.map(data, Ele => {
            if(this.props.itemWidth > maxWidth){
                if(!Ele.props.style){
                    Ele.props.style = {};
                }
                Ele.props.style.width = maxWidth + 'px';
            }
            return Ele;
        });
    }
    render() {
        let showWidth = this.props.showWidth || this.props.width;
        let scrollClass = showWidth === this.props.width ? 'cols-layout-out-wrapper' : 'cols-layout-out-wrapper cols-layout-out-wrapper-scroll';

        return (
            <div className={scrollClass} style={{width: showWidth + 'px'}} >
                <div className='cols-layout-wrapper' style={{width: this.props.width + 'px'}}>
                    {this.renderItem()}
                </div>
            </div>
            
        );
    }
}
