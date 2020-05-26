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
  worker.Helper.WriteLine('Ставка не принята');
  return false;
};

export default checkStakeStatus;
