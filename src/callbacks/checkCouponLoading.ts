import {
  betslipAcceptChangesButtonSelector,
  betslipHeaderTextSelector,
  betslipPlaceBetButtonTextSelector,
} from '../selectors';
import showStake from '../showStake';
import { getStakeCount } from '../getInfo';

let sendMessageToTelegram = false;
let doStakeCounter = 0;
let isBetPlacing = false;

export const clearDoStakeCounter = (): void => {
  doStakeCounter = 0;
};

export const clearSendMessageToTelegram = (): void => {
  sendMessageToTelegram = false;
};

export const setBetPlacing = (status: boolean): void => {
  isBetPlacing = status;
};

const checkCouponLoading = (): boolean => {
  // worker.TakeScreenShot(true);
  const acceptButton = document.querySelector(
    betslipAcceptChangesButtonSelector
  );
  if (acceptButton) {
    worker.Helper.WriteLine('В купоне были изменения');
    return false;
  }
  const betslipHeaderText = document.querySelector(betslipHeaderTextSelector);
  if (betslipHeaderText && betslipHeaderText.textContent === 'Bet Placed') {
    worker.Helper.WriteLine('Обработка ставки завершена (Bet Placed)');
    isBetPlacing = false;
    return false;
  }
  const betslipPlaceBetButtonText = document.querySelector(
    betslipPlaceBetButtonTextSelector
  );
  if (
    betslipPlaceBetButtonText &&
    betslipPlaceBetButtonText.textContent === 'Total Stake'
  ) {
    worker.Helper.WriteLine('Обработка ставки завершена (Total Stake)');
    isBetPlacing = false;
    return false;
  }
  if (isBetPlacing) {
    if (getStakeCount() !== 1) {
      worker.Helper.WriteLine(
        `Ошибка проверки обработки купона: Нет ставок в купоне`
      );
      showStake();
      return false;
    }
    doStakeCounter += 1;
    if (doStakeCounter > 20 && !sendMessageToTelegram) {
      worker.Helper.SendInformedMessage(
        `Купон в Bet365 долго не принимается более 20 секунд, возможно завис`
      );
      sendMessageToTelegram = true;
    }
    worker.Helper.WriteLine(`Обработка ставки`);
  } else {
    worker.Helper.WriteLine(`Обработка ставки завершена`);
  }
  return isBetPlacing;
};

export default checkCouponLoading;
