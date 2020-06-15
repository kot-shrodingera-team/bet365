import {
  betslipAlertMessage,
  betslipAcceptChangesButtonSelector,
} from '../selectors';
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

const getMaximumStake = (): number => {
  if (tempMaximumStake !== -1) {
    return tempMaximumStake;
  }
  const betErrorMessageElement = document.querySelector(betslipAlertMessage);
  if (betErrorMessageElement) {
    const betErrorMessage = betErrorMessageElement.textContent.trim();
    const matches = betErrorMessage.match(
      /^Stake\/risk entered on selection .* is above the available maximum of .*(\d+\.\d+)\.$/
    );
    if (matches) {
      const acceptButton = document.querySelector(
        betslipAcceptChangesButtonSelector
      ) as HTMLElement;
      if (!acceptButton) {
        worker.Helper.WriteLine('Ошибка макса: Нет кнопки принятия изменений');
        return 0;
      }
      acceptButton.click();
      worker.Helper.WriteLine(`Есть макс: ${matches[1]}`);
      tempMaximumStake = Number(matches[1]);
      return Number(matches[1]);
    }
  }
  return getBalance();
};

export default getMaximumStake;
