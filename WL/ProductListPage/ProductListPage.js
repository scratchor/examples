import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import clsx from 'clsx';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';

import { Modal } from '@material-ui/core';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
// Import Actions
import Tooltip from '@material-ui/core/Tooltip';
import {
  add_order,
  delete_order,
  getOpeningHoursMap,
  increment_product_quantity,
  isBranchNowOpened,
  startAddToCartInfo,
  startShakeShoppingCart,
  stopAddToCartInfo,
  stopShakeShoppingCart
} from '../../HomeActions';
import CookieRead from '../../../../util/cookieRead';
// Import Components
import OrderCard from '../../components/OrderCard/OrderCard';
import ProductList from '../../components/ProductList/ProductList';
import AddOrder from '../../components/AddOrder/AddOrder';
import CategoryMenu from '../../components/CategoryMenu/CategoryMenu';
import { close_dlg, info } from '../../../../components/icons/icons';
// Import Style
import styles from './ProductListPage.css';
import style from './ProductListPageBanner.css';
import BranchDetails from '../../components/BranchDetails/BranchDetails';
import { WeekDays } from '../../../../util/date';

class ProductListPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      opened_product: {},
      show: false,
      err_show: false,
      err_show_closed: false,
      openingHoursModalVisible: false,
      highlight: 0,
      variants_selval: {},
      relatedCnt: 0
    };
    this.Ref = [];
    this.RefCoordinates = [];
    this.shakeTimer = null;
    this.addToCartTimer = null;
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
  }

  handleScroll = () => {
    const { highlight } = this.state;
    let number = this.RefCoordinates.find((e, index, arr) => {
      return window.scrollY >= arr[index] && window.scrollY <= arr[index + 1];
    });
    number = this.RefCoordinates.indexOf(number);
    if (number !== -1 && number !== highlight) {
      this.setState({
        highlight: number
      });
    }
  };

  // OrderCard component handler
  handleShow = () => {
    this.setState({ show: true });
  };

  handleHide = () => {
    this.setState({ show: false });
  };

  handleNext = () => {
    const { history, branch } = this.props;
    const token = CookieRead('token');
    if (token === '' || token === undefined) {
      this.setState({ err_show: true });
    } else if (!isBranchNowOpened(branch)) {
      this.setState({ err_show_closed: true });
    } else history.push('/checkout');
  };

  handleErrDlgClose = () => {
    this.setState({ err_show: false, err_show_closed: false });
  };

  handleDelete = order_id => {
    const { dispatch } = this.props;
    dispatch(delete_order(order_id));
  };

  // AddOrder component handler
  handleAddOrder = order => {
    console.log(order);
    const { dispatch, order_bag } = this.props;
    if (
      order_bag.find(dish => {
        console.log(dish.variantId === order.variantId);
        if (dish.variantId === order.variantId) {
          if (dish.addons.length > 0) {
            console.log('dish.addons.length > 0');
            return dish.addons.every(e => {
              return order.addons.some(elem => elem.id === e.id);
            });
          }
          if (dish.baseId === order.baseId) {
            console.log(dish.baseId === order.baseId);
            return true;
          }
          return false;
        }
      })
    ) {
      dispatch(startAddToCartInfo());
      dispatch(startShakeShoppingCart());
      dispatch(increment_product_quantity(order));
      this.callStopAddToCartInfo();
      this.callStopShakingShoppingCart();
    } else {
      dispatch(startAddToCartInfo());
      dispatch(startShakeShoppingCart());
      dispatch(add_order(order));
      this.callStopAddToCartInfo();
      this.callStopShakingShoppingCart();
    }
  };

  callStopShakingShoppingCart = e => {
    const { dispatch } = this.props;
    if (this.shakeTimer) {
      clearTimeout(this.shakeTimer);
    }
    this.shakeTimer = setTimeout(() => {
      dispatch(stopShakeShoppingCart());
    }, 500);
  };

  callStopAddToCartInfo = e => {
    const { dispatch } = this.props;
    if (this.addToCartTimer) {
      clearTimeout(this.addToCartTimer);
    }
    this.addToCartTimer = setTimeout(() => {
      dispatch(stopAddToCartInfo());
    }, 900);
  };

  handleOpen = product => {
    this.setState({ open: true, opened_product: product, variants_selval: {}, relatedCnt: 0 });
  };

  handleClose = () => {
    this.setState({ open: false, opened_product: {}, variants_selval: {}, relatedCnt: 0 });
  };

  // CategoryMenu component handler
  handleCategory = c_i => {
    const { categories } = this.props;
    window.scrollTo({
      left: 0,
      // top: this.Ref[categories.categoriesList[c_i]].offsetTop - 300,
      top:
        this.Ref[categories.categoriesList[c_i]].offsetTop -
        window.innerHeight * (window.innerHeight / document.body.offsetHeight),
      behavior: 'smooth'
    });
  };

  getRef = (ref, index, i) => {
    const { categories } = this.props;
    this.Ref[index] = ref;
    if (this.Ref[index]) {
      this.RefCoordinates[i] =
        this.Ref[index].offsetTop -
        window.innerHeight * (window.innerHeight / document.body.offsetHeight);
    } else {
      this.RefCoordinates[i] = this.RefCoordinates[i - 1];
    }
    if (i === categories.categoriesList.length - 1) {
      this.checkGetRef();
    }
  };

  checkGetRef = () => {
    this.RefCoordinates.forEach((e, index, arr) => {
      if (e === undefined) {
        this.RefCoordinates[index] = this.RefCoordinates[index - 1];
      }
    });
  };

  handleOpeningHoursInModalOpen = () => {
    this.setState({
      openingHoursModalVisible: true
    });
  };

  handleOpeningHoursInModalClose = () => {
    this.setState({
      openingHoursModalVisible: false
    });
  };

  // show when restaurant is closed
  renderOpeningHoursInfoButton_ErrorMessage = () => {
    return (
      <React.Fragment>
        <div className={styles.openingHoursButtonDesktop}>
          {this.renderOpeningHoursInfoForDesktopButton_ErrorMessage()}
        </div>
        <div className={styles.openingHoursButtonMobile}>
          {this.renderOpeningHoursInfoForMobileButton_ErrorMessage()}
        </div>
      </React.Fragment>
    );
  };

  renderOpeningHoursInfoForDesktopButton_ErrorMessage = () => {
    return (
      <Tooltip title={this.renderOpeningHoursList()}>
        <button className={styles.moreInfo} type="button">
          {info()}
          <span>Opening Hours</span>
          <ChevronRightIcon style={{ color: '#00A697', position: 'relative', top: '-1px' }} />
        </button>
      </Tooltip>
    );
  };

  renderOpeningHoursInfoForMobileButton_ErrorMessage = () => {
    return (
      <button
        className={styles.moreInfo}
        type="button"
        onClick={this.handleOpeningHoursInModalOpen}
      >
        {info()}
        <span>Opening Hours</span>
        <ChevronRightIcon style={{ color: '#00A697', position: 'relative', top: '-1px' }} />
      </button>
    );
  };

  // show near the branch name
  renderOpeningHoursInfoButton = () => {
    // There are two buttons which looks the same but behaves a bit differently.
    // For more details, please read the issue: https://practi.atlassian.net/browse/WHL-103
    return (
      <React.Fragment>
        <div className={styles.openingHoursButtonDesktop}>
          {this.renderOpeningHoursInfoForDesktopButton()}
        </div>
        <div className={styles.openingHoursButtonMobile}>
          {this.renderOpeningHoursInfoForMobileButton()}
        </div>
      </React.Fragment>
    );
  };

  renderOpeningHoursInfoForDesktopButton = () => {
    return (
      <Tooltip title={this.renderOpeningHoursList()}>
        <button className={styles.moreInfo} type="button">
          {info()}
        </button>
      </Tooltip>
    );
  };

  renderOpeningHoursInfoForMobileButton = () => {
    return (
      <button
        className={styles.moreInfo}
        type="button"
        onClick={this.handleOpeningHoursInModalOpen}
      >
        {info()}
      </button>
    );
  };

  renderBranchHeader = () => {
    const { branch, business } = this.props;
    return (
      <div className={clsx(styles.header, styles.wrapper)}>
        <div
          className={styles.logo}
          style={{
            backgroundImage: `url(${business.logoUrl})`
          }}
        />
        <div className={styles.info}>
          <div className={styles.title}>
            {branch.name || business.name}
            {this.renderOpeningHoursInfoButton()}
          </div>
          <BranchDetails branch={branch} />
        </div>
      </div>
    );
  };

  renderCategoryMenu = () => {
    const { categories, branch } = this.props;
    const { highlight } = this.state;
    const categoriesForBranch = categories.categoriesList.filter(e => {
      return categories.categoriesObj.find(elem => {
        if (elem.name === e) {
          return elem.destinationBranches.find(
            destinationBranch => destinationBranch === branch.id
          );
        }
        return false;
      });
    });
    return (
      <div className={styles['category-menu']}>
        <CategoryMenu
          categories={categoriesForBranch}
          onCategoryChange={this.handleCategory}
          highlight={highlight}
        />
      </div>
    );
  };

  renderOpeningHoursModal = () => {
    const { openingHoursModalVisible } = this.state;
    return (
      <Modal open={openingHoursModalVisible}>
        <div className={styles['modal-container']}>
          <div onClick={this.handleOpeningHoursInModalClose} className={styles['btn-close']}>
            {close_dlg()}
          </div>
          {this.renderOpeningHoursList()}
        </div>
      </Modal>
    );
  };

  renderOpeningHoursList = () => {
    const { branch } = this.props;
    const map = getOpeningHoursMap(branch);

    let content = <div>Please contact the restaurant for information on opening hours.</div>;

    // map is null only if the opening hours are not set at all
    if (map) {
      // TODO Try to generate the week days in the columns automatically
      content = (
        <div className={styles.openingHoursList}>
          <div className={styles.openingHoursInnerContainer}>
            <div className={styles.left}>
              <div>Monday</div>
              <div>Tuesday</div>
              <div>Wednesday</div>
              <div>Thursday</div>
              <div>Friday</div>
              <div>Saturday</div>
              <div>Sunday</div>
            </div>
            <div className={styles.column}>
              {Object.values(WeekDays).map(shortName => (
                <div key={shortName}>
                  {map[shortName] && map[shortName].from ? `${map[shortName].from}` : '\u00A0'}
                </div>
              ))}
            </div>
            <div className={styles.column}>
              {Object.values(WeekDays).map(shortName => (
                <div key={shortName}>-</div>
              ))}
            </div>
            <div className={styles.right}>
              {Object.values(WeekDays).map(shortName => (
                <div key={shortName}>
                  {map[shortName] && map[shortName].to ? `${map[shortName].to}` : '\u00A0'}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.openingHoursContainer}>
        <p>Opening hours</p>
        {content}
      </div>
    );
  };

  render() {
    const {
      open,
      show,
      opened_product,
      err_show,
      err_show_closed,
      variants_selval,
      relatedCnt
    } = this.state;
    const {
      business,
      order_bag,
      sub_total,
      addToCart,
      categories,
      productsConvert,
      addonsConvert,
      branch
    } = this.props;
    return (
      <React.Fragment>
        <Helmet title="Products" />
        <div className={style['container-head']} />
        <div className={styles['container-body']}>
          {this.renderBranchHeader()}
          <div className={clsx(styles.content, styles.wrapper)}>
            <div>
              {this.renderCategoryMenu()}
              <div className={styles.products}>
                {categories.categoriesList.map((e, i) => {
                  return (
                    <ProductList
                      products={productsConvert.filter(product => {
                        return product.categories.some(elem => {
                          return elem === e;
                        });
                      })}
                      getRef={this.getRef}
                      index={e}
                      i={i}
                      business={business}
                      groupname={e}
                      handleOpen={this.handleOpen}
                      key={e}
                    />
                  );
                })}
              </div>
            </div>
            <OrderCard
              className={styles.order}
              ordered={order_bag}
              business={business}
              branch={branch}
              sub_total={sub_total}
              onDelete={this.handleDelete}
              onNext={this.handleNext}
              onClose={this.handleHide}
              onOpen={this.handleShow}
              show={show}
            />
          </div>
        </div>
        <AddOrder
          open={open}
          opened_product={opened_product}
          business={business}
          addons={addonsConvert}
          onAdd={this.handleAddOrder}
          onClose={this.handleClose}
        />
        <Modal open={err_show} onClose={this.handleErrDlgClose} aria-labelledby="modal-errcheckout">
          <div className={styles['modal-container']}>
            <div onClick={this.handleErrDlgClose} className={styles['btn-close']}>
              {close_dlg()}
              {/**/}
            </div>
            <p>Warning!</p>
            <p>Please log in first!</p>
          </div>
        </Modal>
        <Modal
          open={err_show_closed}
          onClose={this.handleErrDlgClose}
          aria-labelledby="modal-errcheckout"
        >
          <div className={styles['modal-container']}>
            <div onClick={this.handleErrDlgClose} className={styles['btn-close']}>
              {close_dlg()}
            </div>
            <div className={styles.modal_closed} />
            <p>Sorry, we are closed</p>
            <p>Restaurant is currently closed</p>
            <p>Please check the opening hours underneath.</p>
            <p>Come back soon!</p>
            <div className={styles['modal-container_opening_hours']}>
              {this.renderOpeningHoursInfoButton_ErrorMessage()}
            </div>
          </div>
        </Modal>
        {this.renderOpeningHoursModal()}
        <div className={`addToCart  + ${addToCart ? ' show' : ' hide'}`} />
      </React.Fragment>
    );
  }
}

// Retrieve data from store as props
function mapStateToProps(state, props) {
  let sub_total = 0;
  state.order_bag.forEach(order => {
    sub_total += order.price;
  });

  return {
    branch: state.app.branch,
    productsNew: state.home.productsMultiMenu.productsNew,
    productsConvert: state.home.productsMultiMenu.productsConvert,
    addonsConvert: state.home.productsMultiMenu.addonsConvert,
    order_bag: state.order_bag,
    sub_total,
    business: state.home.business,
    categories: state.home.categories,
    addToCart: state.delivery.addToCart
  };
}

ProductListPage.propTypes = {
  branch: PropTypes.object.isRequired,
  business: PropTypes.object.isRequired,
  order_bag: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired,
  categories: PropTypes.func.isRequired,
  addToCart: PropTypes.bool,
  history: PropTypes.object.isRequired
};

ProductListPage.defaultProps = {
  addToCart: false
};

export default {
  component: withRouter(connect(mapStateToProps)(ProductListPage))
};
