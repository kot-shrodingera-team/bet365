import doStakeGenerator from '@kot-shrodingera-team/germes-generators/worker_callbacks/doStake';
import { log } from '@kot-shrodingera-team/germes-utils';
import getCoefficient from '../stake_info/getCoefficient';
import { clearDoStakeTime } from '../stake_info/doStakeTime';

const preCheck = (): boolean => {
  const betslipBetCreditsCheckbox = document.querySelector<HTMLElement>(
    '.bsc-BetCreditsHeader_CheckBox'
  );
  if (betslipBetCreditsCheckbox) {
    if (betslipBetCreditsCheckbox.childElementCount) {
      if (
        ![...betslipBetCreditsCheckbox.classList].includes(
          'bsc-BetCreditsHeader_CheckBox-selected'
        )
      ) {
        log('Включаем использование бонусов', 'orange');
        betslipBetCreditsCheckbox.click();
      } else {
        log('Используются бонусы', 'orange');
      }
    }
  }

  const acceptButton = document.querySelector<HTMLElement>('.bs-AcceptButton');
  if (acceptButton) {
    log('Ошибка ставки: в купоне были изменения', 'crimson');
    return false;
  }
  return true;
};

const postCheck = (): boolean => {
  window.germesData.betProcessingStep = 'beforeStart';
  return true;
};

const doStake = doStakeGenerator({
  preCheck,
  doStakeButtonSelector: '.bss-PlaceBetButton',
  // errorClasses: [
  //   {
  //     className: '',
  //     message: '',
  //   },
  // ],
  // disabledCheck: false,
  getCoefficient,
  postCheck,
  clearDoStakeTime,
  // context: () => document,
});

export default doStake;
