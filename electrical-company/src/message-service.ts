import { traceparent } from "tctx";

export enum PaymentType {
  CARD = "CARD",
  US_BANK_ACCOUNT = "US_BANK_ACCOUNT",
  EU_PAY_BY_BANK = "EU_PAY_BY_BANK",
}

export type Card = {
  type: PaymentType.CARD;
  brand: string;
  cardNumberLast4: string;
};

export type UsBankAccount = {
  type: PaymentType.US_BANK_ACCOUNT;
  bankName: string;
  accountType: string;
  accountNumberLast4: string;
};

export type EuPayByBank = {
  type: PaymentType.EU_PAY_BY_BANK;
  organizationName: string;
  countryCode: string;
  ibanLast4: string;
};

export type PaymentMethod = Card | UsBankAccount | EuPayByBank;

export type Customer = {
  id: number;
  name: string;
  email?: string;
  mobile?: string;
  mobileCarrier?: string;
  paymentMethods: PaymentMethod[];
  defaultPaymentMethod: PaymentType;
};

type Email = {
  from: string;
  to: string[];
  messageBody: string;
};

type ErrorResponse = {
  statusCode: number;
  statusMessage: string;
  unrecoverable: boolean;
};

const emailGateways: { [carrier: string]: string } = {
  "at&t": "@text.att.net",
  tmobile: "@tmomail.net",
  verizon: "@vtext.com",
};

const errorTexts = {
  401: "Authentication Error",
  403: "Authorization Error",
  404: "Not Found",
  409: "Conflict",
};

export const sendMessage = async <T>(
  customer: Customer,
  paymentType: PaymentType
): Promise<T | ErrorResponse> => {
  const emailPayload: Email = {
    from: "paymentprocessing@aep.com",
    to: getReceivers(customer),
    messageBody: getMessage(customer, paymentType),
  };

  try {
    const response = await fetchWithTimeout(
      "https://some-email-api",
      {
        method: "POST",
        headers: getRequestHeaders(),
        body: JSON.stringify(emailPayload),
      },
      5000
    );

    return response.ok
      ? ((await response.json()) as T)
      : parseErrorResponse(response);
  } catch (error) {
    console.warn("Error sending message to user");
    throw error;
  }
};

export const fetchWithTimeout = async (
  url: string,
  options = {},
  timeout = 5000
): Promise<Response> => {
  return Promise.race<Response>([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), timeout)
    ),
  ]);
};

export const getRequestHeaders = (): HeadersInit => {
  const traceId = traceparent.make().toString();
  return {
    Accept: "application/json, */*",
    "Content-Type": "application/json",
    Traceparent: traceId,
    Authorization: "Bearer " + process.env.API_KEY,
  };
};

const getMessage = (customer: Customer, paymentType: PaymentType): string => {
  const paymentMethod = customer.paymentMethods.find(
    ({ type }) => type === paymentType
  );

  if (!paymentMethod) {
    throw new Error(
      `Customer doesn't have payment method for type: ${paymentType}`
    );
  }

  const paymentMethodDescription = getPaymentMethodDescription(paymentMethod);
  return `Hello, ${customer.name},
		The scheduled payment for your electrical bill ending from your ${paymentMethodDescription} failed.		
		Please verify your payment details and try again.`;
};

const getReceivers = (customer: Customer): string[] => {
  let receivers: string[] = [];

  if (customer.email) {
    receivers = [customer.email];
  } else if (customer.mobile) {
    const mobileCarrier = customer.mobileCarrier?.toLowerCase();
    if (mobileCarrier && emailGateways[mobileCarrier]) {
      receivers.push(customer.mobile + emailGateways[mobileCarrier]);
    } else {
      receivers = Object.values(emailGateways).map(
        (gateway) => customer.mobile + gateway
      );
    }
  }
  return receivers;
};

const getPaymentMethodDescription = (paymentMethod: PaymentMethod): string => {
  switch (paymentMethod.type) {
    case PaymentType.CARD:
      return `${paymentMethod.brand} credit card ending in ${paymentMethod.cardNumberLast4}`;
    case PaymentType.EU_PAY_BY_BANK:
      return `${paymentMethod.organizationName} bank ending in ${paymentMethod.ibanLast4}`;
    case PaymentType.US_BANK_ACCOUNT:
      return `${paymentMethod.bankName} account ending in ${paymentMethod.accountNumberLast4}`;
    default:
      const _exhaustiveCheck: never = paymentMethod;
      return _exhaustiveCheck;
  }
};

export const parseErrorResponse = (res: Response): ErrorResponse => {
  const unrecoverable = res.status === 401;
  const statusText: string =
    errorTexts[res.status as keyof typeof errorTexts] ?? "Request Error";

  return {
    statusCode: res.status,
    statusMessage: res.status == 400 ? res.statusText : statusText,
    unrecoverable,
  };
};
