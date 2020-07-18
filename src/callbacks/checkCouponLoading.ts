import { minVersion } from '@kot-shrodingera-team/config/util';
import {
  betslipAcceptChangesButtonSelector,
  // betslipHeaderTextSelector,
  betslipPlaceBetButtonTextSelector,
} from '../selectors';
// import showStake from '../showStake';
import { checkRestriction, accountBlocked } from '../accountChecks';
import getStakeCount from '../stakeInfo/getStakeCount';
import { updateMaximumStake } from '../stakeInfo/getMaximumStake';
import { getDoStakeTime } from '../stakeInfo/getDoStakeTime';

let sendMessageToTelegram = false;
let doStakeCounter = 0;
let isBetPlacing = false;
let isNewMax = false;

export const clearDoStakeCounter = (): void => {
  doStakeCounter = 0;
};

export const clearSendMessageToTelegram = (): void => {
  sendMessageToTelegram = false;
};

export const setBetPlacing = (status: boolean): void => {
  isBetPlacing = status;
};

export const setIsNewMax = (newMax: boolean): void => {
  isNewMax = newMax;
};

const checkCouponLoading = (): boolean => {
  if (checkRestriction()) {
    accountBlocked();
    isBetPlacing = false;
    return false;
  }
  const betslipPlaceBetErrorMessageElement = document.querySelector(
    '.bs-PlaceBetErrorMessage_Contents'
  );
  if (betslipPlaceBetErrorMessageElement) {
    const errorText = betslipPlaceBetErrorMessageElement.textContent.trim();
    if (
      errorText ===
      'Please check My Bets for confirmation that your bet has been successfully placed.'
    ) {
      worker.Helper.WriteLine('Обработка ставки завершена (check My Bets)');
    } else {
      worker.Helper.WriteLine('Обработка ставки завершена (ошибка ставки)');
    }
    isBetPlacing = false;
    return false;
  }
  const acceptButton = document.querySelector(
    betslipAcceptChangesButtonSelector
  );
  if (acceptButton) {
    if (isNewMax) {
      const timePassedSinceDoStake =
        new Date().getTime() - getDoStakeTime().getTime();
      if (timePassedSinceDoStake < 2000) {
        worker.Helper.WriteLine(
          'Обработка ставки (задержка в 2 секунды при появлении макса)'
        );
        return true;
      }
      worker.Helper.WriteLine(
        'Обработка ставки завершена (задержка в 2 секунды при появлении макса)'
      );
      return false;
    }
    if (updateMaximumStake()) {
      worker.Helper.WriteLine('Обработка ставки (появился новый макс)');
      isNewMax = true;
      return true;
    }
    worker.Helper.WriteLine(
      'Обработка ставки завершена (в купоне были изменения)'
    );
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
    doStakeCounter += 1;
    if (
      doStakeCounter > (minVersion('0.1.813.6') ? 200 : 20) &&
      !sendMessageToTelegram
    ) {
      worker.Helper.SendInformedMessage(
        `Купон в Bet365 долго не принимается, возможно завис`
      );
      sendMessageToTelegram = true;
    }
    if (getStakeCount() !== 1) {
      const message =
        `В Bet365 количество ставок в купоне не равно 1 при обработке ставки\n` +
        `Бот засчитал ставку как НЕ принятую\n` +
        `Событие: ${worker.TeamOne} - ${worker.TeamTwo}\n` +
        `Ставка: ${worker.BetName}\n` +
        `Сумма: ${worker.StakeInfo.Summ}\n` +
        `Коэффициент: ${worker.StakeInfo.Coef}\n` +
        `Пожалуйста, проверьте самостоятельно. Если всё плохо - пишите в ТП`;
      worker.Helper.SendInformedMessage(message);
      worker.Helper.WriteLine(message);
      return false;
    }
    worker.Helper.WriteLine(`Обработка ставки`);
  } else {
    worker.Helper.WriteLine(`Обработка ставки завершена`);
  }
  return isBetPlacing;
};

export default checkCouponLoading;
