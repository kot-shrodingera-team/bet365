import doStakeGenerator from '@kot-shrodingera-team/germes-generators/worker_callbacks/doStake';
import { log } from '@kot-shrodingera-team/germes-utils';
import getCoefficient from '../stake_info/getCoefficient';
import { clearDoStakeTime } from '../stake_info/doStakeTime';
import { setIsNewMax } from './checkCouponLoading';

const preAction = (): boolean => {
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

const doStake = doStakeGenerator({
  preAction,
  doStakeButtonSelector: '.bss-PlaceBetButton',
  getCoefficient,
  clearDoStakeTime,
});

export default doStake;
