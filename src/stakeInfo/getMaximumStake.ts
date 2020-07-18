import { betslipAlertMessage } from '../selectors';
import getBalance from './getBalance';

let tempMaximumStake = -1;

export const getTempMaximumStake = (): number => {
  return tempMaximumStake;
};
export const setTempMaximumStake = (newMaximumStake: number): void => {
  tempMaximumStake = newMaximumStake;
};
export const clearTempMaximumStake = (): void => {
  tempMaximumStake = -1;
};

export const updateMaximumStake = (): boolean => {
  const betErrorMessageElement = document.querySelector(betslipAlertMessage);
  if (betErrorMessageElement) {
    const betErrorMessage = betErrorMessageElement.textContent.trim();
    const matches = betErrorMessage.match(
      /^Stake\/risk entered on selection .* is above the available maximum of .*(\d+\.\d+)\.$/
    );
    if (matches) {
      worker.Helper.WriteLine(`Обновлена максимальная ставка: ${matches[1]}`);
      tempMaximumStake = Number(matches[1]);
      return true;
    }
  }
  return false;
};

const getMaximumStake = (): number => {
  if (tempMaximumStake !== -1) {
    return tempMaximumStake;
  }
  return getBalance();
};

export default getMaximumStake;
