const crypto  = require('crypto');
const OrdersService = require('../services/orders/orders');
const OrdertTansactionsService = require('../services/orders/orderTransactions');

const getPaymentFormSettings = (options) => {
  const { gateway, gatewaySettings, order, amount, currency } = options;
  const params = {
    api_key: gatewaySettings.api_key,
    amount: amount,
    currency: currency,
    description: 'Order: ' + order.number,
    order_id: order.id
  };

  const formSettings = {
    language: gatewaySettings.api_key
  };

  return Promise.resolve(formSettings);
}

const paymentNotification = (options) => {
  const { gateway, gatewaySettings, req, res } = options;
  const params = req.body;
  const dataStr = Buffer.from(params.data, 'base64').toString();
  const data = JSON.parse(dataStr);

  res.status(200).end();

  const sign = getHashFromString(gatewaySettings.private_key + params.data + gatewaySettings.private_key);
  const signatureValid = sign === params.signature;
  const paymentSuccess = data.status === 'success';
  const orderId = data.order_id;

  if(signatureValid && paymentSuccess){
    OrdersService.updateOrder(orderId, { paid: true, date_paid: new Date() }).then(() => {
      OrdertTansactionsService.addTransaction(orderId, {
        transaction_id: data.transaction_id,
        amount: data.amount,
        currency: data.currency,
        status: data.status,
        details: `${data.paytype}, ${data.sender_card_mask2}`,
        success: true
      });
    });
  } else {
    // log
  }
}


module.exports = {
  getPaymentFormSettings: getPaymentFormSettings,
  paymentNotification: paymentNotification
}
