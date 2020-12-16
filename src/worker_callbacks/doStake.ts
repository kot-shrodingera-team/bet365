import doStakeGenerator from '@kot-shrodingera-team/germes-generators/worker_callbacks/doStake';
import { log } from '@kot-shrodingera-team/germes-utils';
import getCoefficient from '../stake_info/getCoefficient';
import { clearDoStakeTime } from '../stake_info/doStakeTime';
import { resetReferBetConfirmation, setIsNewMax } from './checkCouponLoading';

const preCheck = (): boolean => {
  const betslipBetCreditsCheckbox = document.querySelector(
    '.bsc-BetCreditsHeader_CheckBox'
  ) as HTMLElement;
  if (
    betslipBetCreditsCheckbox &&
    ![...betslipBetCreditsCheckbox.classList].includes(
      'bsc-BetCreditsHeader_CheckBox-selected'
    )
  ) {
    betslipBetCreditsCheckbox.click();
  }
  const acceptButton = document.querySelector(
    '.bs-AcceptButton'
  ) as HTMLElement;
  if (acceptButton) {
    log('Ошибка ставки: в купоне были изменения', 'crimson');
    return false;
  }
  setIsNewMax(false);
  return true;
};

const postCheck = (): boolean => {
  resetReferBetConfirmation();
  return true;
};

const doStake = doStakeGenerator({
  preCheck,
  doStakeButtonSelector: '.bss-PlaceBetButton',
  getCoefficient,
  clearDoStakeTime,
  postCheck,
});

export default doStake;
