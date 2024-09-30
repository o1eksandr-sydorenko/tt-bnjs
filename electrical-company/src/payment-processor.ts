import customers from "./customer-list.json";

import {
  Customer,
  sendMessage,
  parseErrorResponse,
  fetchWithTimeout,
  getRequestHeaders,
} from "./message-service";

const processPayment = async (customer: Customer): Promise<unknown> => {
  try {
    const response = await fetchWithTimeout(
      "https://api.stripe.com/some-payment-endpoint",
      {
        method: "POST",
        headers: getRequestHeaders(),
        body: JSON.stringify({
          customerId: customer.id,
          paymentMethod: customer.paymentMethods.find(
            ({ type }) => type === customer.defaultPaymentMethod
          ),
          amount: getCustomerPaymentAmount(customer.id),
        }),
      },
      5000
    );

    return response.ok ? response.json() : parseErrorResponse(response);
  } catch (error) {
    console.error("Error calling Stripe payment API:", error);
    throw error;
  }
};

const getCustomerPaymentAmount = (customerId: number): number => {
  return parseFloat(Math.floor(Math.random() * (100 - 50) + 50).toFixed(2));
};

(async () => {
  for (const customer of customers as Customer[]) {
    try {
      await processPayment(customer);
      console.log("Successfully processed payment for customer", customer.id);
    } catch (error) {
      console.error("The payment failed to process:", error);
      sendMessage(customer, customer.defaultPaymentMethod);
    }
  }
})();
