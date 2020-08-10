import { log } from '@kot-shrodingera-team/germes-utils';
import getBalance from './getBalance';

let maximumStake = -1;

export const setMaximumStake = (newMaximumStake: number): void => {
  maximumStake = newMaximumStake;
};
export const clearMaximumStake = (): void => {
  maximumStake = -1;
};

export const updateMaximumStake = (): boolean => {
  const betErrorMessageElement = document.querySelector(
    '.bss-Footer_MessageBody'
  );
  if (betErrorMessageElement) {
    const betErrorMessage = betErrorMessageElement.textContent.trim();
    const maxErrorMatch = betErrorMessage.match(
      /^Stake\/risk entered on selection .* is above the available maximum of .*(\d+\.\d+)\.$/i
    );
    if (maxErrorMatch) {
      log(`Обновлена максимальная ставка: "${maxErrorMatch[1]}"`, 'orange');
      maximumStake = Number(maxErrorMatch[1]);
      return true;
    }
  }
  return false;
};

const getMaximumStake = (): number => {
  if (maximumStake !== -1) {
    return maximumStake;
  }
  return getBalance();
};

export default getMaximumStake;
