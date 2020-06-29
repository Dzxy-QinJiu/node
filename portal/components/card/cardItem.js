/**
 * Created by wangliping on 2015/12/23.
 */

import classNames from 'classnames';

const CardItem = (props) =>  {
    const { className, cardItem, noRihtValue} = props;
    const cardCls = classNames('card-item', className);
    const value = _.get(cardItem, 'value', '');
    return (
        <div className={cardCls}>
            <span className="card-item-left">{_.get(cardItem, 'label')}</span>
            {
                noRihtValue ? null : (
                    <span className="card-item-right" title={value}>
                        {value}
                    </span>
                )
            }
        </div>
    );
};

export default CardItem;