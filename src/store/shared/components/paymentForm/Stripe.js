import React from 'react'
import text from '../../text'
import { formatCurrency } from '../../lib/helper'

import {
  CardElement,
  StripeProvider,
  Elements,
  injectStripe,
  InjectedCheckoutForm,
} from 'react-stripe-elements';

let scriptAdded = false;
export default class StripeButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {stripe: null};
  }

  addScript = () => {
    if (scriptAdded) {
      this.executeScript();
      return;
    }

    const SCRIPT_URL = 'https://js.stripe.com/v3/';
    const container = document.body || document.head;
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.onload = () => {
      this.executeScript();
    };
    container.appendChild(script);
    scriptAdded = true;
  }

  executeScript = () => {
    const { formSettings, shopSettings, onPayment } = this.props;


    // Create Stripe instance in componentDidMount
    // (componentDidMount only fires in browser/DOM environment)
    this.setState({stripe: window.Stripe(formSettings.apiKey)});
  }

  componentDidMount() {
    this.addScript();
  }

  componentDidUpdate() {
    this.executeScript();
  }

  render() {
    const { formSettings, shopSettings, onPayment } = this.props;

    return (
      <StripeProvider stripe={this.state.stripe}>
        <Elements>
          <InjectedCheckoutForm />
        </Elements>
      </StripeProvider>
    );
  }
}
