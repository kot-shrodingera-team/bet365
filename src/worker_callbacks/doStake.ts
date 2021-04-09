import doStakeGenerator from '@kot-shrodingera-team/germes-generators/worker_callbacks/doStake';
import { getWorkerParameter, log } from '@kot-shrodingera-team/germes-utils';
import getCoefficient from '../stake_info/getCoefficient';

const preCheck = (): boolean => {
  const betslipBetCreditsCheckbox = document.querySelector<HTMLElement>(
    '.bsc-BetCreditsHeader_CheckBox'
  );
  // .bsc-BetCreditsHeader_CheckBox.bsc-BetCreditsHeader_CheckBox-selected
  // .bsc-BetCreditsHeader_CheckBox
  if (betslipBetCreditsCheckbox) {
    const betCreditsSelected = [
      ...betslipBetCreditsCheckbox.classList,
    ].includes('bsc-BetCreditsHeader_CheckBox-selected');
    if (getWorkerParameter('useBetBonuses')) {
      if (betCreditsSelected) {
        log('Используются бонусы', 'steelblue');
      } else {
        log('Включаем использование бонусов', 'orange');
        betslipBetCreditsCheckbox.click();
      }
    } else if (betCreditsSelected) {
      log('Отключаем использование бонусов', 'orange');
      betslipBetCreditsCheckbox.click();
    } else {
      log('Бонусы не используются', 'steelblue');
    }
  }

  const acceptButton = document.querySelector<HTMLElement>('.bs-AcceptButton');
  if (acceptButton) {
    log('Ошибка ставки: в купоне были изменения', 'crimson');
    return false;
  }
  return true;
};

// const postCheck = (): boolean => {
//   return true;
// };

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
  // postCheck,
  // context: () => document,
});

export default doStake;
