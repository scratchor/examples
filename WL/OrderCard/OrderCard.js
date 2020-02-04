import React from 'react';
import clsx from 'clsx';
import * as PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Card, CardContent, IconButton} from '@material-ui/core';
// import Components
import {
  close_dlg,
  delivery,
  next3,
  pickup,
  shopping_bag,
  trush
} from '../../../../components/icons/icons';
import DefaultButton from '../../../../components/DefaultButton';
import TimeModal from '../../../../components/TimeModal/TimeModal';
// import Actions
import {
  change_delivery_fee,
  change_delivery_time,
  change_delivery_type,
  decrement_product_quantity,
  delete_order,
  DELIVERY,
  increment_product_quantity,
  isDeliveryAvailableNow,
  PICKUP
} from '../../HomeActions';
// import Styles
import styles from './OrderCard.css';
import {
  isDeliveryFeeProductExist,
  priceOfDeliveryFee
} from '../../../../util/deliveryFeeProduct';

class OrderCard extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      openTime: false,
      isMinAmountError: false
    };
  }

  static getDerivedStateFromProps(props) {
    // here will be minimum delivery value from BE API, hard-coded for now in number 10
    if (props.sub_total < 10 /*minimum delivery value*/) {
      return { isMinAmountError: true };
    }
    return { isMinAmountError: false };
  }

  handleClose = () => {
    this.setState({ openTime: false });
  };

  handleDelivery = () => {
    this.setState({ openTime: true });
  };

  handleSaveTime = (type, date, time, deliveryBool) => {
    const { dispatch } = this.props;
    this.setState({ openTime: false });
    dispatch(change_delivery_time({ type_time: type, date, time, deliveryBool }));
  };

  handleBuyType = type => {
    const { dispatch } = this.props;
    // For Delivery Fee product
    const { productsConvert, categories, branch } = this.props;
    const isDeliveryFeeProduct = isDeliveryFeeProductExist(branch.id, categories);
    const DeliveryFee = isDeliveryFeeProduct && priceOfDeliveryFee(productsConvert);
    if (type && isDeliveryFeeProduct) {
      dispatch(change_delivery_fee(DeliveryFee));
    }
    // End for Delivery Fee product
    dispatch(change_delivery_type(type));
    this.setState({});
  };

  renderDeliveryButton = active => {
    return (
      <button
        type="button"
        onClick={() => this.handleBuyType(DELIVERY)}
        className={clsx(styles['switch-item'], active && styles.active)}
      >
        <span className={styles.icon}>{delivery()}</span>
        Delivery
      </button>
    );
  };

  renderPickUpButton = active => {
    return (
      <button
        type="button"
        onClick={() => this.handleBuyType(PICKUP)}
        className={clsx(styles['switch-item'], active && styles.active)}
      >
        <span className={styles.icon}>{pickup()}</span>
        Pickup
      </button>
    );
  };

  handleProductQuantity = (order, type = true) => {
    const { dispatch } = this.props;
    if (!type) {
      if (order.count <= 1) {
        return dispatch(delete_order(order));
      }
      return dispatch(decrement_product_quantity(order, true));
    }
    return dispatch(increment_product_quantity(order, true));
  };

  render() {
    const {
      classes,
      className,
      branch,
      show,
      ordered,
      business,
      sub_total,
      delivery_data,
      onClose,
      onOpen,
      onNext,
      onDelete,
      dispatch,
      shake,
      categories,
      ...other
    } = this.props;
    const { openTime, isMinAmountError } = this.state;
    let desc_time;

    const deliveryAvailable = isDeliveryAvailableNow(branch);

    if (delivery_data.type_time === 'ASAP' && deliveryAvailable) {
      desc_time = 'ASAP (30-40m)';
    } else {
      desc_time = 'LATER';
    }

    if (!Object.keys(business).length) {
      return null;
    }

    return (
      <div className={clsx(styles.order, className || '', show === false ? styles['hidden-wrapper'] : '')}>
        {show === true && <div aria-hidden="true" className={styles.overlay} />}
        <Card
          className={`${clsx(styles.card, show === false ? styles.hidden : '')}${shake ? ' shakeShoppingCart' : ''}`}
          {...other}
        >
          <CardContent className={clsx(styles.content)}>
            <div className={styles.header}>
              <div className={styles.title}>Your Order</div>
              <div>
                <div className={styles.time}>
                  <button type="button" className={styles['time-show']} onClick={() => this.handleDelivery()}>
                    {desc_time}
                  </button>
                </div>
                <div className={styles['time-tablet']}>
                  <span className={styles['time-show']}>{desc_time}</span>
                  <button type="button" className={styles['time-btn']} onClick={() => this.handleDelivery()}>
                    Change Time
                  </button>
                </div>
              </div>
              <IconButton classes={{ root: styles.close }} aria-label="Close" onClick={onClose}>
                {close_dlg()}
              </IconButton>
            </div>
            <div className={styles['delivery-switch']}>
              {deliveryAvailable && this.renderDeliveryButton(delivery_data.type === DELIVERY)}
              {this.renderPickUpButton(delivery_data.type === PICKUP)}
            </div>
            <div className={styles.products}>
              {ordered.map((order, i) => {
                return order.addons.length === 0 ? (
                  <>
                    <div
                      style={{ paddingBottom: '0' }}
                      className={styles.product}
                      key={`${order.variantId + order.price}`}
                    >
                      <div>
                        <div>
                          {order.count}
                          {'x'}
                          {order.baseName}
                        </div>
                      </div>
                      <div className={styles.productButtonsBlock}>
                        <span className={styles.productButtons}>
                          <button
                            className={styles.delProduct}
                            onClick={() => this.handleProductQuantity(order, false)}
                          ></button>
                          <button
                            className={styles.addProduct}
                            onClick={() => this.handleProductQuantity(order)}
                          ></button>
                        </span>
                        <span style={{ paddingTop: '3px' }}>
                          {business.currency.symbol}
                          {order.price.toFixed(2)}
                          <button className={styles.iconbtn} onClick={() => onDelete(i)} type="button">
                            {trush()}
                          </button>
                        </span>
                      </div>
                    </div>
                    <div style={{ paddingBottom: '12px' }} className={styles.variant}>
                      {order.variantName}
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.product} key={`${order.variantId + order.price}`}>
                      <div className={styles.productInnerBlock}>
                        <div>
                          {order.count}
                          {'x'}
                          {order.baseName}
                        </div>
                        <div className={styles.variant}>{order.variantName}</div>
                        <div className={styles.addons_name}>ADDONS:</div>
                        {order.addons.map(addon => (
                          <div key={`${addon.id + order.variantId}`} className={styles.addons}>
                            <div className={styles.variant}>{addon.name}</div>
                            <div>
                              {business.currency.symbol}
                              {addon.price}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className={styles.productButtonsBlock}>
                        <span className={styles.productButtons}>
                          <button
                            className={styles.delProduct}
                            onClick={() => this.handleProductQuantity(order, false)}
                          ></button>
                          <button
                            className={styles.addProduct}
                            onClick={() => this.handleProductQuantity(order)}
                          ></button>
                        </span>
                        <span style={{ paddingTop: '3px' }}>
                          {business.currency.symbol}
                          {order.price.toFixed(2)}
                          <button className={styles.iconbtn} onClick={() => onDelete(i)} type="button">
                            {trush()}
                          </button>
                        </span>
                      </div>
                    </div>
                  </>
                );
              })}
            </div>
            <div className={styles.flexview}>
              <span>Subtotal</span>
              <span>
                {business.currency.symbol}
                {sub_total.toFixed(2)}
              </span>
            </div>
            {delivery_data.type && (
              <div className={styles.flexview}>
                <span>Delivery Fee</span>
                <span>
                  {business.currency.symbol}
                  {delivery_data.type === DELIVERY ? delivery_data.fee.toFixed(2) : '0.00'}
                </span>
              </div>
            )}
            <div className={clsx(styles.flexview, styles.total)}>
              <span>Total</span>
              <span>
                {business.currency.symbol}
                {((delivery_data.type === DELIVERY ? delivery_data.fee : 0) + sub_total).toFixed(2)}
              </span>
            </div>
            <div
              className={`${styles.min_amount_error} ${
                !delivery_data.type || !isMinAmountError ? styles.hide_min_amount_error : ''
              }`}
            >
              <p>
                Sorry, you can't order yet. Minimum order amount of {business.currency.symbol}10,00 (excl. delivery
                costs)
              </p>
            </div>
          </CardContent>
          <div className={styles.footer}>
            <DefaultButton
              className={clsx(styles['footer-btn'])}
              onClick={() => onNext()}
              disabled={isMinAmountError && delivery_data.type}
            >
              <span>Checkout</span>
              <span>
                <span className="mr-3">
                  {business.currency.symbol}
                  {((delivery_data.type === DELIVERY ? delivery_data.fee : 0) + sub_total).toFixed(2)}
                </span>
                {next3()}
              </span>
            </DefaultButton>
          </div>
        </Card>
        <DefaultButton
          className={`${clsx(styles['bag-btn'], show === true ? styles.hidden : '')}${
            shake ? ' shakeShoppingCart' : ''
          }`}
          onClick={onOpen}
        >
          <span>
            <span className="mr-3">{shopping_bag()}</span>
            <span>Shopping Bag</span>
          </span>
          <span>
            {business.currency.symbol}
            {((delivery_data.type === DELIVERY ? delivery_data.fee : 0) + sub_total).toFixed(2)}
          </span>
        </DefaultButton>

        <TimeModal
          openTime={openTime}
          handleClose={this.handleClose}
          handleSubmit={this.handleSaveTime}
          type={deliveryAvailable ? 'ASAP' : 'LATER'}
          time={delivery_data.time}
          date={delivery_data.date}
          delivery={delivery_data.delivery}
          disableASAP={deliveryAvailable}
        />
      </div>
    );
  }
}

OrderCard.propTypes = {
  business: PropTypes.shape({
    currency: PropTypes.shape({
      code: PropTypes.string.isRequired,
      symbol: PropTypes.string.isRequired
    }).isRequired
  }).isRequired,
  ordered: PropTypes.arrayOf(
    PropTypes.shape({
      baseId: PropTypes.string.isRequired,
      baseName: PropTypes.string.isRequired,
      variantId: PropTypes.string.isRequired,
      variantName: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
      price: PropTypes.number.isRequired, // price of total
      addons: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string,
          name: PropTypes.string,
          price: PropTypes.number
        })
      )
    })
  ).isRequired,
  branch: PropTypes.object.isRequired,
  sub_total: PropTypes.number.isRequired,
  delivery_data: PropTypes.object.isRequired,
  show: PropTypes.bool.isRequired,
  onNext: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onOpen: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  className: PropTypes.func.isRequired,
  classes: PropTypes.func.isRequired,
  shake: PropTypes.func.isRequired,
  categories: PropTypes.array.isRequired,
  productsConvert: PropTypes.array.isRequired
};

// Retrieve data from store as props
function mapStateToProps(state) {
  return {
    delivery_data: state.delivery,
    shake: state.delivery.shake,
    categories: state.home.categories,
    productsConvert: state.home.productsMultiMenu.productsConvert
  };
}

export default connect(mapStateToProps)(OrderCard);
