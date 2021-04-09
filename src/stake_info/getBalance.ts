// import {
//   balanceReadyGenerator,
//   getBalanceGenerator,
// } from '@kot-shrodingera-team/germes-generators/stake_info/getBalance';

import {
  awaiter,
  getWorkerParameter,
} from '@kot-shrodingera-team/germes-utils';

// Locator.user._balance.refreshBalance();
// Locator.user._balance.totalBalance;

export const balanceSelector = '.hm-Balance';
// const balanceRegex = /(\d+(?:\.\d+)?)/;
// const replaceDataArray = [
//   {
//     searchValue: '',
//     replaceValue: '',
//   },
// ];
// const removeRegex = /[\s,']/g;

// export const balanceReady = balanceReadyGenerator({
//   balanceSelector,
//   // balanceRegex,
//   // replaceDataArray,
//   // removeRegex,
//   // context: () => document,
// });

// const getBalance = getBalanceGenerator({
//   balanceSelector,
//   // balanceRegex,
//   // replaceDataArray,
//   // removeRegex,
//   // context: () => document,
// });

export const balanceReady = async (
  timeout = 5000,
  interval = 100
): Promise<boolean> => {
  if (getWorkerParameter('fakeBalance') || getWorkerParameter('fakeAuth')) {
    return true;
  }
  return awaiter(
    () => {
      // eslint-disable-next-line no-underscore-dangle
      return !Number.isNaN(Number(Locator.user._balance.totalBalance));
    },
    timeout,
    interval
  );
};

const getBalance = (): number => {
  if (getWorkerParameter('fakeBalance') || getWorkerParameter('fakeAuth')) {
    const fakeBalance = getWorkerParameter('fakeBalance');
    if (typeof fakeBalance === 'number') {
      return fakeBalance;
    }
    return 100000;
  }
  return (
    // eslint-disable-next-line no-underscore-dangle
    Number(Locator.user._balance.totalBalance) -
    // eslint-disable-next-line no-underscore-dangle
    Number(Locator.user._balance.bonusBalance)
  );
};

export const updateBalance = (): void => {
  if (getWorkerParameter('fakeBalance') || getWorkerParameter('fakeAuth')) {
    worker.JSBalanceChange(getBalance());
    return;
  }
  // eslint-disable-next-line no-underscore-dangle
  Locator.user._balance.refreshBalance();
  worker.JSBalanceChange(getBalance());
};

export default getBalance;
