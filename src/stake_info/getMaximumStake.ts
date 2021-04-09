import getBalance from './getBalance';

const getMaximumStake = (): number => {
  if (window.germesData.maximumStake !== undefined) {
    return window.germesData.maximumStake;
  }
  return getBalance();
};

export default getMaximumStake;
