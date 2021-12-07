import doStakeGenerator from '@kot-shrodingera-team/germes-generators/worker_callbacks/doStake';
import { getWorkerParameter, log } from '@kot-shrodingera-team/germes-utils';
import getCoefficient from '../stake_info/getCoefficient';

const preCheck = (): boolean => {
  window.germesData.prevLastBet = document.querySelector('.mbr-OpenBetItem');
  if (getWorkerParameter('resultCoefficientTest')) {
    if (window.germesData.prevLastBet) {
      log('Есть предыдущая ставка в истории', 'steelblue');
    } else {
      log('Нет предыдущей ставки в истории', 'steelblue');
    }
  }
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

const apiMethod = (): boolean => {
  // BetSlipLocator.betSlipManager.betslip.activeModule.slip.footer.model.placeBet();
  return true;
};

// const postCheck = (): boolean => {
//   return true;
// };

const doStake = doStakeGenerator({
  preCheck,
  doStakeButtonSelector: '.bss-PlaceBetButton',
  apiMethod,
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
