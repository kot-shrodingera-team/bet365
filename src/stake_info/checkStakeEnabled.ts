import checkStakeEnabledGenerator from '@kot-shrodingera-team/germes-generators/stake_info/checkStakeEnabled';
import { log } from '@kot-shrodingera-team/germes-utils';
import {
  accountRestricted,
  accountStep2,
  accountSurvey,
} from '../initialization/accountChecks';
import getCouponError, {
  CouponError,
  getCouponErrorText,
  updateMaximumStake,
} from '../show_stake/helpers/getCouponError';
import getStakeCount from './getStakeCount';

const preCheck = (): boolean => {
  const couponError = getCouponError();
  const acceptButton = document.querySelector<HTMLElement>('.bs-AcceptButton');

  if (couponError === CouponError.AccountRestricted) {
    accountRestricted();
    return false;
  }
  if (couponError === CouponError.AccountStep2) {
    accountStep2();
    return false;
  }
  if (couponError === CouponError.AccounSurvey) {
    accountSurvey();
    return false;
  }
  if (couponError === CouponError.OddsChanged) {
    if (!acceptButton) {
      log('Не найдена кнопка принятия изменений', 'crimson');
      return false;
    }
    log('Принимаем изменения', 'orange');
    acceptButton.click();

    return true;
  }
  if (
    couponError === CouponError.NewMaximum ||
    couponError === CouponError.NewMaximumShort ||
    couponError === CouponError.UnknownMaximum
  ) {
    updateMaximumStake();
    if (!acceptButton) {
      log('Не найдена кнопка принятия изменений', 'crimson');
      return false;
    }
    log('Принимаем изменения', 'orange');
    acceptButton.click();

    return true;
  }
  if (couponError === CouponError.Unknown) {
    log('В купоне неизвестная ошибка', 'crimson');
    const couponErrorText = getCouponErrorText();
    log(couponErrorText, 'tomato');
    return false;
  }
  const betslipModule = document.querySelector('.bsm-BetslipStandardModule');
  if (
    betslipModule &&
    ![...betslipModule.classList].includes('bsm-BetslipStandardModule_Expanded')
  ) {
    log('Купон не развёрнут', 'crimson');
    return false;
  }
  return true;
};

const checkStakeEnabled = checkStakeEnabledGenerator({
  preCheck,
  getStakeCount,
  betCheck: {
    selector: '.bss-NormalBetItem',
    errorClasses: [
      {
        className: 'bss-NormalBetItem_Suspended',
        message: 'Suspended',
      },
    ],
  },
  // errorsCheck: [
  //   {
  //     selector: '',
  //     message: '',
  //   },
  // ],
  // context: () => document,
});

export default checkStakeEnabled;
