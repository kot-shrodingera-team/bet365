import {
  betslipHeaderTextSelector,
  // betslipDoneSelector,
  betslipPlaceBetButtonTextSelector,
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
    worker.Helper.WriteLine('Ставка принята');
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
