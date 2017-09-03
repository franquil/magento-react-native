import { magento } from '../magento';
import { magentoOptions } from '../config/magento';
import {
	MAGENTO_INIT,
	MAGENTO_GET_CATEGORY_TREE,
	MAGENTO_CURRENT_CATEGORY,
	MAGENTO_GET_CATEGORY_PRODUCTS,
	MAGENTO_UPDATE_CONF_PRODUCT,
	MAGENTO_LOAD_MORE_CATEGORY_PRODUCTS,
	MAGENTO_CURRENT_PRODUCT,
	MAGENTO_GET_PRODUCT_MEDIA
} from './types';

export const initMagento = () => {
	magento.setOptions(magentoOptions);

  return (dispatch) => {
    magento.init()
      .then(() => {
        dispatch({ type: MAGENTO_INIT, payload: magento });
				magento.getStoreConfig();
      })
      .catch(error => {
        console.log(error);
      });
  };
};

export const getCategoryTree = () => {
  return (dispatch) => {
    magento.getCategoriesTree()
      .then(payload => {
        dispatch({ type: MAGENTO_GET_CATEGORY_TREE, payload });
      })
      .catch(error => {
        console.log(error);
      });
  };
};

export const getProductsForCategory = ({ id, offset }) => {
  return (dispatch) => {
		if (offset) {
			dispatch({ type: MAGENTO_LOAD_MORE_CATEGORY_PRODUCTS, payload: true });
		}
    magento.getProducts(id, 10, offset)
        .then(payload => {
					dispatch({ type: MAGENTO_GET_CATEGORY_PRODUCTS, payload });
					dispatch({ type: MAGENTO_LOAD_MORE_CATEGORY_PRODUCTS, payload: false });
					updateConfigurableProductsPrices(payload.items, dispatch);
				})
        .catch(error => {
					console.log(error);
				});
  };
};

const updateConfigurableProductsPrices = (products, dispatch) => {
  products.forEach(product => {
    if (product.type_id === 'configurable') {
			updateConfigurableProductPrice(product, dispatch);
    }
  });
};

const updateConfigurableProductPrice = (product, dispatch) => {
  const { sku } = product;
	magento.getConfigurableChildren(sku)
			.then(data => {
				dispatch({
          type: MAGENTO_UPDATE_CONF_PRODUCT,
          payload: {
            sku,
						children: data
          }
				});
			})
			.catch(error => {
				console.log(error);
			});
};

export const getProductMedia = ({ sku }) => {
	return dispatch => {
		magento.getProductMedia(sku)
				.then(data => {
					dispatch({ type: MAGENTO_GET_PRODUCT_MEDIA, payload: data });
				})
				.catch(error => {
					console.log(error);
				});
	};
};

export const setCurrentCategory = category => {
  return {
    type: MAGENTO_CURRENT_CATEGORY,
    payload: category
  };
};

export const setCurrentProduct = product => {
  return {
    type: MAGENTO_CURRENT_PRODUCT,
    payload: product
  };
};