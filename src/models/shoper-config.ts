export type ShoperConfig = {
  urls: {
    token: string;
    productStocks: string;
    products: string;
    productStocksUpdate: string;
  };
  userToken: string;
  delayTimeInMilisec: number;
  maxRetryAttempts: number;
};
