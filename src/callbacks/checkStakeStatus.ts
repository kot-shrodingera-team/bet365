import {
  betslipHeaderTextSelector,
  // betslipDoneSelector,
  betslipPlaceBetButtonTextSelector,
  standardBetslipSelector,
} from '../selectors';
import { checkRestriction, accountBlocked } from '../accountChecks';
import { updateBalance } from '../getInfo';

const checkStakeStatus = (): boolean => {
  if (checkRestriction()) {
    accountBlocked();
    return false;
  }
  const betslipHeaderText = document.querySelector(betslipHeaderTextSelector);
  if (betslipHeaderText && betslipHeaderText.textContent === 'Bet Placed') {
    const standardBetslip = document.querySelector(standardBetslipSelector);
    if (
      standardBetslip &&
      ![...standardBetslip.classList].includes('bss-StandardBetslip-receipt')
    ) {
      worker.Helper.WriteLine('Ставка не принята (невидимая иконка)');
      return false;
    }
    worker.Helper.WriteLine('Ставка принята (Bet Placed)');
    // const betslipDone = document.querySelector(
    //   betslipDoneSelector
    // ) as HTMLElement;
    // if (betslipDone) {
    //   betslipDone.click();
    // }
    updateBalance();
    return true;
  }
  const betslipPlaceBetButtonText = document.querySelector(
    betslipPlaceBetButtonTextSelector
  );
  if (
    betslipPlaceBetButtonText &&
    betslipPlaceBetButtonText.textContent === 'Total Stake'
  ) {
    worker.Helper.WriteLine('Ставка принята (без иконки)');
    updateBalance();
    return true;
  }
  const betslipPlaceBetErrorMessageElement = document.querySelector(
    '.bs-PlaceBetErrorMessage'
  );
  if (
    betslipPlaceBetErrorMessageElement &&
    betslipPlaceBetErrorMessageElement.textContent.trim() ===
      'Please check My Bets for confirmation that your bet has been successfully placed.'
  ) {
    const message =
      `В Bet365 появилось окно о необходимости проверки принятия ставки в "My Bets"\n` +
      `Бот засчитал ставку как проставленную\n` +
      `Событие: ${worker.TeamOne} - ${worker.TeamTwo}\n` +
      `Ставка: ${worker.BetName}\n` +
      `Сумма: ${worker.StakeInfo.Summ}\n` +
      `Пожалуйста, проверьте самостоятельно. Если всё плохо - пишите в ТП`;
    worker.Helper.WriteLine(message);
    worker.Helper.SendInformedMessage(message);
    const betslipPlaceBetErrorMessageButton = document.querySelector(
      '.bs-PlaceBetErrorMessage_Button'
    ) as HTMLElement;
    if (betslipPlaceBetErrorMessageButton) {
      betslipPlaceBetErrorMessageButton.click();
    }
    return true;
  }
  worker.Helper.WriteLine('Ставка не принята');
  return false;
};

export default checkStakeStatus;
