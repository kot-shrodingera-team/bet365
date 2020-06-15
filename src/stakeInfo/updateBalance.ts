import getBalance from './getBalance';

const updateBalance = (): void => {
  const balance = getBalance();
  console.log(`balance = ${balance}`);
  worker.JSBalanceChange(balance);
};

export default updateBalance;
