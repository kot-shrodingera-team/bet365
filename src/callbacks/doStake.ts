import {
  betslipAcceptChangesButtonSelector,
  betslipPlaceBetButtonSelector,
  betslipBetCreditsCheckboxSelector,
  betslipBetCreditsCheckboxSelectedClass,
} from '../selectors';
import checkBet from '../checkBet';
import {
  clearSendMessageToTelegram,
  clearDoStakeCounter,
  setBetPlacing,
  setIsNewMax,
} from './checkCouponLoading';
import checkStakeEnabled from '../stakeInfo/checkStakeEnabled';
import getCoefficient from '../stakeInfo/getCoefficient';
import { clearDoStakeTime } from '../stakeInfo/getDoStakeTime';

const doStake = (): boolean => {
  if (!checkStakeEnabled()) {
    worker.Helper.WriteLine('Ошибка ставки: Ставка недоступна');
    return false;
  }

  const acceptButton = document.querySelector(
    betslipAcceptChangesButtonSelector
  ) as HTMLElement;
  if (acceptButton) {
    worker.Helper.WriteLine('Ошибка ставки: В купоне были изменения');
    return false;
  }

  if (worker.StakeInfo.Coef !== getCoefficient()) {
    worker.Helper.WriteLine('Ошибка ставки: Коэффициент изменился');
    return false;
  }
  if (worker.StakeInfo.Parametr !== checkBet().parameter) {
    worker.Helper.WriteLine('Ошибка ставки: Праметр изменился');
    return false;
  }

  const placeBetButton = document.querySelector(
    betslipPlaceBetButtonSelector
  ) as HTMLElement;
  if (!placeBetButton) {
    worker.Helper.WriteLine('Ошибка ставки: Нет кнопки принятия ставки');
    return false;
  }

  // bsFrame.bsApp.placeBet();

  setBetPlacing(true);
  clearDoStakeCounter();
  clearSendMessageToTelegram();
  setIsNewMax(false);

  window.request.clearAllRequestResponseSubscribes();
  window.request.subscribe(
    'betslip/?op=2&ck=bs&betsource=FlashInPLay&streaming=1&fulltext=1&betguid=',
    () => {
      console.log(`betslip place response`);
      setBetPlacing(false);
    }
  );

  const betslipBetCreditsCheckbox = document.querySelector(
    betslipBetCreditsCheckboxSelector
  ) as HTMLElement;
  if (
    betslipBetCreditsCheckbox &&
    ![...betslipBetCreditsCheckbox.classList].includes(
      betslipBetCreditsCheckboxSelectedClass
    )
  ) {
    betslipBetCreditsCheckbox.click();
  }

  placeBetButton.click();
  clearDoStakeTime();
  worker.Helper.WriteLine('Нажали на кнопку принятия ставки');

  // Вариант ждать пока
  // - Появится Accept Button
  // - Появится загрузка
  // - Ставка станет недоступной
  // - Ставка примется

  return true;
};

export default doStake;
