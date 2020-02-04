import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import clsx from 'clsx';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import uuidv4 from 'uuid/v4';
import { injectStripe } from 'react-stripe-elements';
import { Modal } from '@material-ui/core';
// Import Utils
import { callApi } from '../../../../util/apiCaller';
// Import Actions
import {
  change_delivery_fee,
  change_delivery_time,
  change_delivery_type,
  DELIVERY,
  isDeliveryAvailableNow,
  PICKUP
} from '../../HomeActions';
import { ordered_product } from '../../../OrderStatus/OrderStatusAction';
import { loading_end, loading_start, setStripeAccount, setStripeApiKey } from '../../../App/AppActions';
import { GetUserInfo } from '../../../Profile/ProfileActions';
// Import Components
import DefaultButton from '../../../../components/DefaultButton';
import TimeModal from '../../../../components/TimeModal/TimeModal';
import {
  close_dlg,
  delivery,
  fa_address,
  fa_back,
  next3,
  pickup,
  plus,
  shopping_bag
} from '../../../../components/icons/icons';
import OrderSummary from '../../components/OrderSummary/OrderSummary';
import LocationSearchInput from '../../../../components/FormControl/LocationSearchInput/LocationSearchInput';
import PayForm from '../../../Profile/components/PayForm/PayForm';
import CCModal from '../../../../components/CCModal/CCModal';
// Import Style
import styles from './CheckoutPage.css';
import * as PractiNet from '../../../../../serverSrc/apis/practi.net';
import { isDeliveryFeeProductExist, priceOfDeliveryFee } from '../../../../util/deliveryFeeProduct';
import { calcDistance } from '../../../../util/calcDistance';

class CheckoutPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      open: false,
      add_open: false,
      delivery_err: false,
      delivery_address: {
        street: {
          location: {
            lat: 0.0,
            lng: 0.0
          },
          address: '',
          seperate_address: [],
          postalCode: ''
        },
        flatNo: '',
        buildingNo: ''
      },
      special_instructions: '',
      openTime: false,
      selected_card: null
    };
    this.addressRef = React.createRef();
  }

  handleChange = event => {
    const { delivery_address } = this.state;
    if (event.target.name === 'postalCode') {
      this.setState({
        delivery_address: {
          flatNo: delivery_address.flatNo,
          buildingNo: delivery_address.buildingNo,
          street: {
            ...delivery_address.street,
            postalCode: event.target.value
          }
        }
      });
      return;
    }
    if (event.target.name === 'special_instructions') {
      this.setState({ special_instructions: event.target.value });
      return;
    }
    this.setState({
      delivery_address: {
        ...delivery_address,
        [event.target.name]: event.target.value
      }
    });
  };

  selectAddrTemplate = id => {
    console.log(id);
    const { accounts } = this.props;
    const { address } = accounts;
    if (id === '') {
      this.setState({
        delivery_address: {
          street: {
            seperate_address: [],
            location: {
              lat: 0.0,
              lng: 0.0
            },
            address: '',
            postalCode: ''
          },
          flatNo: '',
          buildingNo: ''
        }
      });
    } else {
      const addr = address.filter(a => a.id === id);
      if (addr.length !== 1) {
        return;
      }
      this.setState({
        delivery_address: {
          street: addr[0].street,
          flatNo: addr[0].flatNo,
          buildingNo: addr[0].buildingNo
        }
      });
    }
  };

  handleChangeAddress = address => {
    const { delivery_address } = this.state;
    this.setState({
      delivery_address: { ...delivery_address, street: { address } }
    });
  };

  handleSelectAddress = obj => {
    const { delivery_address } = this.state;
    console.dir(this.addressRef.current);
    this.addressRef.current.value = '';
    this.setState({ delivery_address: { ...delivery_address, flatNo: '', buildingNo: '', street: obj } });
  };

  // OrderCard component handler
  handleShow = () => {
    this.setState({ show: true });
  };

  handleHide = () => {
    this.setState({ show: false });
  };

  // Onsubmit after push "Confirm and Pay"
  handleOpen = async event => {
    const { delivery_address, selected_card } = this.state;
    const { delivery_data, branch } = this.props;
    event.preventDefault();

    if (branch.id === undefined) {
      console.log('select the branch');
      return;
    }

    if (delivery_data.type === DELIVERY) {
      // calculate distance between restaurant and delivery address
      const distance = await calcDistance(
        delivery_address.street.location.lat,
        delivery_address.street.location.lat,
        branch.latitude,
        branch.longitude
      );

      if (
        delivery_address.street.location.lat === 0.0 &&
        delivery_address.street.location.lng === 0.0 &&
        delivery_address.street.postalCode === ''
      ) {
        console.log('invalid delivery address!!! input location again.');
        return;
      }

      // check for delivery distance
      if (distance > branch.deliveryRadius) {
        this.setState({ delivery_err: true });
        return;
      }
    }
    if (selected_card) {
      this.handleSubmit({ token: selected_card.token });
    } else {
      this.setState({ open: true });
    }
  };

  handleClose = () => {
    this.setState({ open: false, openTime: false });
  };

  handleSubmit = (data, e) => {
    if (e) {
      e.preventDefault();
    }
    const { stripe, dispatch, accounts } = this.props;
    const { selected_card } = this.state;

    console.log('handleSubmit');

    console.log(data);
    console.log(accounts.token);

    dispatch(loading_start());

    // in case handleSubmit fired from handleOpen - checkoutPage submit handler
    if (data.token) {
      console.log('data.token');
      callApi('payment/createOrder', 'post', {
        ...this.getItems(),
        phoneNumber: accounts.phonenumber
      })
        .then(resp => {
          console.log(resp);
          console.log(data.token);
          const uuid = uuidv4();
          PractiNet.createPaymentIntent(uuid, resp.amount, resp.orderID, data.token, accounts.token, (err, res) => {
            if (err) {
              console.log(err);
            } else {
              console.log(res);
              console.log(res.data.clientSecret);
              console.log(data.token);
              dispatch(setStripeApiKey(res.data.publishableKey));
              dispatch(setStripeAccount(res.data.stripeAccount));
              stripe
                .handleCardPayment(`${res.data.clientSecret}`, {
                  payment_method: `${data.token}`
                })
                .then(result => {
                  console.log(result);
                  if (result.paymentIntent) {
                    setTimeout(() => {
                      PractiNet.confirmPaymentResult(uuid, (error, response) => {
                        if (error) {
                          console.log(error);
                        } else {
                          console.log(response);

                          // check if we need to attach card to the stripe object
                          if (!selected_card.stored) {
                            PractiNet.storedCardToken(data.token, accounts.token, (er, respon) => {
                              if (er) {
                                console.log(er);
                              } else {
                                console.log(respon);
                                callApi('user/store-stripe-card', 'post', {
                                  id: selected_card.id,
                                  phoneNumber: accounts.phonenumber
                                }).then(r => {
                                  if (r.status === 'success') {
                                    console.log(r);
                                    this.setState({
                                      selected_card: {
                                        stored: r.data.stored
                                      }
                                    });
                                    this.handleServerResponse(response, resp.WLOrderId, resp.version);
                                  }
                                });
                              }
                            });

                            // not attach card to the stripe object
                          } else {
                            this.handleServerResponse(response, resp.WLOrderId, resp.version);
                          }
                        }
                      });
                    }, 2000);
                  }
                });
              // }, 1000);
            }
          });
        })
        .catch(err => console.log(err));

      // in case handleSubmit fired from CCModal
    } else if (stripe) {
      stripe
        .createPaymentMethod('card', { billing_details: { name: `${data}` } })
        .then(paymentMethod => {
          console.log('Received Stripe PaymentMethod:', paymentMethod);
          this.setState({
            selected_card: {
              last4digit: `${paymentMethod.paymentMethod.card.last4}`
            }
          });

          callApi('payment/createOrder', 'post', {
            ...this.getItems(),
            phoneNumber: accounts.phonenumber
          }).then(resp => {
            console.log(resp);
            const uuid = uuidv4();
            PractiNet.createPaymentIntent(
              uuid,
              resp.amount,
              resp.orderID,
              paymentMethod.paymentMethod.id,
              accounts.token,
              (err, res) => {
                if (err) {
                  console.log(err);
                } else {
                  console.log(res);
                  console.log(res.data.clientSecret);
                  console.log(paymentMethod.paymentMethod.id);
                  dispatch(setStripeApiKey(res.data.publishableKey));
                  dispatch(setStripeAccount(res.data.stripeAccount));
                  stripe
                    .handleCardPayment(res.data.clientSecret, {
                      payment_method_data: {
                        billing_details: {
                          name: data
                        }
                      }
                    })
                    .then(result => {
                      console.log(result);
                      if (result.paymentIntent) {
                        setTimeout(() => {
                          PractiNet.confirmPaymentResult(uuid, (er, respon) => {
                            if (er) {
                              console.log(er);
                            } else {
                              console.log(respon);
                              this.handleServerResponse(respon, resp.WLOrderId, resp.version);
                            }
                          });
                        }, 2000);
                      }
                    });
                }
              }
            );
          });
        })
        .catch(err => console.log(err));
    } else {
      console.log("Stripe.js hasn't loaded yet.");
    }
  };

  handleServerResponse = (response, WLOrderId, version) => {
    const { dispatch } = this.props;
    console.log(response);
    console.log(WLOrderId);

    // if error
    if (response.status !== 200) {
      console.log(response.error, 'Error in server response');
      this.setState({ open: false });
      dispatch(loading_end());

      //  else if success {
    } else if (response.status === 200) {
      if (response.data.status === 'approved') {
        const { delivery_data, accounts, history } = this.props;
        const { delivery_address, special_instructions, selected_card } = this.state;

        let time;
        let order_delivery_data;

        if (delivery_data.type_time === 'ASAP') {
          const date = new Date();
          const timeInMillis = date.getTime();
          time = new Date(40 * 60 * 1000 + timeInMillis).toISOString();
        } else time = new Date(`${delivery_data.date}T${delivery_data.time}`).toISOString();

        if (delivery_data.type === DELIVERY) {
          order_delivery_data = {
            type: 'delivery',
            time
          };
        } else {
          order_delivery_data = {
            type: 'take-away',
            time: null
          };
        }

        console.log('Delivery Time', time);
        dispatch(
          ordered_product(
            {
              last4digit: selected_card.last4digit,
              order_id: WLOrderId,
              version,
              orderIdBe: response.data.orderId,
              delivery_data: order_delivery_data,
              delivery_address,
              note: special_instructions,
              phoneNumber: accounts.phonenumber,
              uuid: response.data.id
            },
            history
          )
        );

        this.setState({ open: false });
        dispatch(loading_end());

        // if payment status not "approved" repeat confirm
      } else {
        console.log('payment status not "approved');
        PractiNet.confirmPaymentResult(response.data.id, (er, respon) => {
          if (er) {
            console.log(er);
          } else {
            console.log(respon);
            this.handleServerResponse(respon, WLOrderId, version);
          }
        });
      }

      // in other cases
    } else {
      console.log(response, 'in server response');
      this.setState({ open: false });
      dispatch(loading_end());
    }
  };

  getItems = () => {
    const { order_bag, accounts, branch, delivery_data } = this.props;
    const items = [];
    let deliveryFee;
    order_bag.forEach(item => {
      let addonsAmount = 0;
      item.addons.forEach(addon => {
        addonsAmount += addon.price * item.count;
        items.push({
          quantity: item.count,
          productId: addon.id,
          label: `${addon.name}`,
          amount: addon.price * item.count
        });
      });
      console.log(addonsAmount);
      items.push({
        quantity: item.count,
        productId: item.variantId,
        label: `${item.baseName} ${item.variantName}`,
        amount: item.price - addonsAmount
      });
    });
    if (delivery_data.type) {
      deliveryFee = delivery_data.fee;
    }
    console.log(items);
    return {
      products: items,
      deliveryFee,
      phoneNumber: accounts.phonenumber,
      branch: { b_ID: branch.id, b_Name: branch.name }
    };
  };

  // add credit card
  handleOpenCC = () => {
    this.setState({ add_open: true });
  };

  handleCloseCC = () => {
    this.setState({ add_open: false });
  };

  handleCloseDeliveryErr = () => {
    this.setState({ delivery_err: false });
  };

  // submit on ADD credit card button
  handleSubmitCC = (name, e) => {
    e.preventDefault();
    const { stripe, accounts, dispatch } = this.props;

    console.log('handleSubmitCC');

    if (stripe) {
      stripe
        .createPaymentMethod('card', { billing_details: { name: `${name}` } })
        .then(paymentMethod => {
          console.log('Received Stripe PaymentMethod:', paymentMethod);

          if (paymentMethod) {
            callApi('user/add-card', 'post', {
              pmId: `${paymentMethod.paymentMethod.id}`,
              expiry: `${
                paymentMethod.paymentMethod.card.exp_month
              }/${paymentMethod.paymentMethod.card.exp_year.toString().slice(2, 4)}`,
              name: `${paymentMethod.paymentMethod.billing_details.name}`,
              issuer: `${paymentMethod.paymentMethod.card.brand}`,
              last4digit: `${paymentMethod.paymentMethod.card.last4}`,
              phoneNumber: accounts.phonenumber
            }).then(res => {
              if (res.status === 'success') {
                dispatch(GetUserInfo(accounts.token));
                this.setState({
                  add_open: false,
                  selected_card: {
                    token: res.data.token,
                    id: res.data.id,
                    last4digit: res.data.last4digit
                  }
                });
              }
            });
          } else {
            console.log('[token]', paymentMethod);
          }
        })
        .catch(err => console.log(err));
    } else {
      console.log("Stripe.js hasn't loaded yet.");
    }
  };

  handleSelectCCData = card => {
    const { accounts } = this.props;
    callApi('user/get-card', 'post', {
      id: card.id,
      phoneNumber: accounts.phonenumber
    }).then(res => {
      if (res.status === 'success') {
        console.log(res);
        this.setState({
          selected_card: {
            id: card.id,
            token: res.data.token,
            last4digit: card.last4digit,
            stored: res.data.stored
          }
        });
      }
    });
  };

  handleOpenTime = () => {
    console.log(' I am delivery time');
    this.setState({ openTime: true });
  };

  handleSaveTime = (type_time, date, time, deliveryBool) => {
    const { dispatch } = this.props;
    dispatch(change_delivery_time({ type_time, date, time, deliveryBool }));
    this.setState({ openTime: false });
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
  };

  render() {
    const { show, delivery_address, open, add_open, openTime, selected_card, delivery_err } = this.state;
    const { business, accounts, order_bag, sub_total, delivery_data, history, branch } = this.props;
    let desc_time;
    const delivery_type = delivery_data.type;
    if (order_bag.length === 0) history.push('/products');
    if (delivery_data.type_time === 'ASAP') desc_time = 'ASAP(30-40m)';
    else desc_time = 'LATER';

    const deliveryAvailable = isDeliveryAvailableNow(branch);
    // here will be minimum delivery value from BE API, hard-coded for now in number 10
    const isMinAmountError = sub_total < 10; /*minimum delivery value*/

    return (
      <div className={styles.container}>
        <Helmet title="Checkout" />
        <div className={styles['container-wrapper']}>
          <div className={styles['container-header']}>
            <Link to="/products" className={styles.back}>
              <span className="mx-2">{fa_back()}</span>
              <span>Back</span>
            </Link>
            <h3 className={styles.header}>Checkout</h3>
          </div>
          <form className={styles['container-body']} onSubmit={this.handleOpen}>
            <div className={clsx(styles.content)}>
              <div className={styles.form}>
                <h4 className={clsx(styles['form-header'], styles['hidden-tablet'])}>Order Details</h4>
                <div className={clsx(delivery_type === PICKUP ? styles.hideTime : '', styles.time)}>
                  <span className={styles['time-show']}>{desc_time}</span>
                  <button type="button" className={styles['time-btn']} onClick={() => this.handleOpenTime()}>
                    Change Time
                  </button>
                </div>
                <div className={styles['delivery-switch']}>
                  {deliveryAvailable && (
                    <button
                      type="button"
                      onClick={() => this.handleBuyType(DELIVERY)}
                      className={clsx(styles['switch-item'], delivery_data.type === DELIVERY && styles.active)}
                    >
                      <span className={styles.icon}>{delivery()}</span>
                      Delivery
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => this.handleBuyType(PICKUP)}
                    className={clsx(styles['switch-item'], delivery_data.type === PICKUP && styles.active)}
                  >
                    <span className={styles.icon}>{pickup()}</span>
                    Pickup
                  </button>
                </div>
              </div>
              <div className={clsx(styles.form, delivery_data.type === false ? styles['hidden-form'] : '')}>
                <h4 className={styles['form-header']}>Delivery Address</h4>
                {accounts.address && (
                  <div className={styles['form-group']}>
                    <label className={styles.label}>Select from profile</label>
                    <select
                      ref={this.addressRef}
                      className={styles['form-control']}
                      onChange={e => this.selectAddrTemplate(e.target.value)}
                    >
                      <option value="" />
                      {accounts.address.map((addr, id) => (
                        <option key={id} value={`${addr.id}`}>
                          {addr.type}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className={styles['form-group']}>
                  <label className={styles.label}>Location</label>
                  <div className={styles['input-group']}>
                    <LocationSearchInput
                      className={clsx(styles['form-control'], styles.street)}
                      onChange={this.handleChangeAddress}
                      onSelect={this.handleSelectAddress}
                      value={delivery_address.street.address}
                      required={!!delivery_data.type}
                    />
                    <div className={styles.icon}>{fa_address()}</div>
                  </div>
                </div>
                <div className={clsx(styles['form-group'])}>
                  <label className={styles.label}>Post Code</label>
                  <input
                    className={styles['form-control']}
                    placeholder="E16JE"
                    value={delivery_address.street.postalCode}
                    onChange={this.handleChange}
                    style={{ textTransform: 'uppercase' }}
                    name="postalCode"
                    required={!!delivery_data.type}
                  />
                </div>
                <div className={styles['form-group']}>
                  <label className={styles.label}>Flat or House Number</label>
                  <input
                    className={styles['form-control']}
                    placeholder="Flat 4"
                    value={delivery_address.flatNo}
                    onChange={this.handleChange}
                    name="flatNo"
                    required={!!delivery_data.type}
                  />
                </div>
                <div className={styles['form-group']}>
                  <label className={styles.label}>Business or Building Name</label>
                  <input
                    className={styles['form-control']}
                    placeholder="Building"
                    value={delivery_address.buildingNo}
                    onChange={this.handleChange}
                    name="buildingNo"
                    required={!!delivery_data.type}
                  />
                </div>
              </div>
              <div className={styles.form}>
                <h4 className={styles['form-header']}>Special Instructions</h4>
                <textarea
                  className={styles['form-control']}
                  rows={4}
                  value={delivery_address.special_instructions}
                  onChange={this.handleChange}
                  name="special_instructions"
                />
                {/* {Math.round(this.state.storyHeight)} */}
              </div>
              <div className={styles.form}>
                <h4 className={styles['form-header']}>Payment Method</h4>
                {accounts.cards.map((card, index) => (
                  <PayForm
                    key={index}
                    issuer={card.issuer}
                    last4digit={card.last4digit}
                    selected={!!(selected_card && card.id === selected_card.id)}
                    onSelect={e => this.handleSelectCCData(card)}
                  />
                ))}
                <button type="button" className={styles.addmore} onClick={e => this.handleOpenCC()}>
                  <div className={styles.icon}>{plus()}</div>
                  Add Credit Card
                </button>
              </div>
              <DefaultButton
                className={styles['confirm-btn']}
                type="submit"
                disabled={isMinAmountError && delivery_data.type}
              >
                <span>Confirm and Pay</span>
                <span>
                  {business.currency.symbol}
                  {((delivery_data.type === DELIVERY ? delivery_data.fee : 0) + sub_total).toFixed(2)}
                  <span className="ml-3">{next3()}</span>
                </span>
              </DefaultButton>
            </div>
            <div className={styles.order}>
              <OrderSummary
                ordered={order_bag}
                business={business}
                sub_total={sub_total}
                onClose={this.handleHide}
                show={show}
                header="Your Order Total"
              />
              <DefaultButton type="button" className={styles['bag-btn']} onClick={this.handleShow}>
                <span>
                  <span className="mr-3">{shopping_bag()}</span>
                  <span>Shopping Bag</span>
                </span>
                <span>
                  {business.currency.symbol}
                  {((delivery_data.type === DELIVERY ? delivery_data.fee : 0) + sub_total).toFixed(2)}
                </span>
              </DefaultButton>
            </div>
          </form>
        </div>
        <CCModal open={add_open} onClose={this.handleCloseCC} onSubmit={this.handleSubmitCC} />
        <CCModal open={open} onClose={this.handleClose} onSubmit={this.handleSubmit} />
        <TimeModal
          openTime={openTime}
          handleClose={this.handleClose}
          handleSubmit={this.handleSaveTime}
          type={delivery_data.type_time}
          time={delivery_data.time}
          date={delivery_data.date}
          delivery={delivery_data.delivery}
        />
        <Modal open={delivery_err} onClose={this.handleCloseDeliveryErr} aria-labelledby="modal-errcheckout">
          <div className={styles['modal-container']}>
            <div onClick={this.handleCloseDeliveryErr} className={styles['btn-close']}>
              {close_dlg()}
            </div>
            <div className={styles.modal_closed} />
            <p>Sorry, we don't deliver to your address</p>
            <p>Your postcode isn't in our delivery area yet.</p>
          </div>
        </Modal>
      </div>
    );
  }
}

CheckoutPage.propTypes = {
  branch: PropTypes.object.isRequired,
  business: PropTypes.object.isRequired,
  order_bag: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired,
  delivery_data: PropTypes.object.isRequired,
  stripe: PropTypes.object.isRequired,
  accounts: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  sub_total: PropTypes.object.isRequired,
  productsConvert: PropTypes.array.isRequired,
  categories: PropTypes.array.isRequired
};

// Retrieve data from store as props
function mapStateToProps(state, props) {
  let sub_total = 0;
  state.order_bag.forEach(order => {
    sub_total += order.price;
  });

  return {
    branch: state.app.branch,
    order_bag: state.order_bag,
    sub_total,
    delivery_data: state.delivery,
    business: state.home.business,
    accounts: state.accounts,
    productsConvert: state.home.productsMultiMenu.productsConvert,
    categories: state.home.categories
  };
}

export default {
  component: injectStripe(withRouter(connect(mapStateToProps)(CheckoutPage)))
};
