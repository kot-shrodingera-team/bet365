import checkCouponLoadingGenerator from '@kot-shrodingera-team/germes-generators/worker_callbacks/checkCouponLoading';
import { log } from '@kot-shrodingera-team/germes-utils';
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
  log(`Обработка ставки`, 'tan');
  return true;
};

const checkCouponLoading = checkCouponLoadingGenerator({
  bookmakerName: 'bet365',
  getDoStakeTime,
  check,
});

export default checkCouponLoading;
