import {
  balanceReadyGenerator,
  getBalanceGenerator,
} from '@kot-shrodingera-team/germes-generators/stake_info/getBalance';

// Locator.user._balance.refreshBalance();
// Locator.user._balance.totalBalance;

export const balanceReady = balanceReadyGenerator({
  balanceSelector: '.hm-Balance',
});

const getBalance = getBalanceGenerator({
  balanceSelector: '.hm-Balance',
});

export const updateBalance = (): void => {
  // eslint-disable-next-line no-underscore-dangle
  Locator.user._balance.refreshBalance();
  worker.JSBalanceChange(getBalance());
};

export default getBalance;
