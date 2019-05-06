export type ShoperConfig = {
  urls: {
    token: string;
    productStocks: string;
    products: string;
  };
  userToken: string;
  delayTimeInMilisec: number;
  maxRetryAttempts: number;
};
