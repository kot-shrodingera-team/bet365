import checkCouponLoadingGenerator from '@kot-shrodingera-team/germes-generators/worker_callbacks/checkCouponLoading';
import { log } from '@kot-shrodingera-team/germes-utils';
import { getConfig } from '../config';
import {
  checkRestriction,
  accountBlocked,
} from '../initialization/accountChecks';
import { getDoStakeTime } from '../stake_info/doStakeTime';
import { updateMaximumStake } from '../stake_info/getMaximumStake';

let isNewMax = false;

export const setIsNewMax = (newMax: boolean): void => {
  isNewMax = newMax;
};

const check = (): boolean => {
  if (checkRestriction()) {
    accountBlocked();
    return false;
  }
  const processingButton = document.querySelector('.bss-ProcessingButton');
  const betslipPlaceBetErrorMessageElement = document.querySelector(
    '.bs-PlaceBetErrorMessage_Contents'
  );
  if (betslipPlaceBetErrorMessageElement) {
    const errorText = betslipPlaceBetErrorMessageElement.textContent.trim();
    if (
      errorText ===
      'Please check My Bets for confirmation that your bet has been successfully placed.'
    ) {
      log('Обработка ставки завершена (check My Bets)', 'orange');
    } else {
      log('Обработка ставки завершена (ошибка ставки)', 'orange');
    }
    return false;
  }
  const acceptButton = document.querySelector('.bs-AcceptButton');
  const timePassedSinceDoStake =
    new Date().getTime() - getDoStakeTime().getTime();
  if (acceptButton) {
    if (isNewMax) {
      if (timePassedSinceDoStake < 2000) {
        log(
          'Обработка ставки (задержка в 2 секунды при появлении макса)',
          'tan'
        );
        return true;
      }
      log(
        'Обработка ставки завершена (задержка в 2 секунды при появлении макса)',
        'orange'
      );
      return false;
    }
    if (updateMaximumStake()) {
      log('Обработка ставки (появился новый макс)', 'tan');
      isNewMax = true;
      return true;
    }
    log('Обработка ставки завершена (в купоне были изменения)', 'orange');
    return false;
  }
  const betslipPlaceBetButtonText = document.querySelector(
    '.bss-PlaceBetButton_Text'
  );
  if (
    betslipPlaceBetButtonText &&
    betslipPlaceBetButtonText.textContent === 'Total Stake'
  ) {
    log('Обработка ставки завершена (Total Stake)', 'orange');
    return false;
  }
  const footerMessageElement = document.querySelector(
    '.bss-Footer_MessageBody'
  );
  if (footerMessageElement) {
    const footerMessage = footerMessageElement.textContent.trim();
    if (
      /In accordance with licensing conditions we are required to verify your age and identity. Certain restrictions may be applied to your account until we are able to verify your details. Please go to the Know Your Customer page in Members and provide the requested information./i.test(
        footerMessage
      )
    ) {
      log('Обработка ставки завершена (ошибка, не пройден Step 2)', 'orange');
      return false;
    }
    if (
      /As part of the ongoing management of your account we need you to answer a set of questions relating to Responsible Gambling. Certain restrictions may be applied to your account until you have successfully completed this. You can answer these questions now by going to the Self-Assessment page in Members./i.test(
        footerMessage
      )
    ) {
      log('Обработка ставки завершена (ошибка, не пройден опрос)', 'orange');
      return false;
    }
  }
  if (
    getConfig().includes('placing_indicator_strict_check') &&
    !processingButton
  ) {
    log('Обработка ставки завершена (нет индикатора)', 'orange');
    return false;
  }
  if (processingButton) {
    log('Обработка ставки (индикатор)', 'tan');
  } else {
    log('Обработка ставки (нет индикатора)', 'tan');
  }
  return true;
};

const checkCouponLoading = checkCouponLoadingGenerator({
  bookmakerName: 'bet365',
  getDoStakeTime,
  check,
});

export default checkCouponLoading;
