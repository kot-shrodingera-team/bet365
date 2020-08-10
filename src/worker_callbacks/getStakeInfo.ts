import getStakeInfoGenerator from '@kot-shrodingera-team/germes-generators/worker_callbacks/getStakeInfo';
import { log } from '@kot-shrodingera-team/germes-utils';
import checkAuth from '../stake_info/checkAuth';
import getStakeCount from '../stake_info/getStakeCount';
import getBalance from '../stake_info/getBalance';
import checkStakeEnabled from '../stake_info/checkStakeEnabled';
import getCoefficient from '../stake_info/getCoefficient';
import getParameter from '../stake_info/getParameter';
import getMinimumStake from '../stake_info/getMinimumStake';
import getMaximumStake from '../stake_info/getMaximumStake';
import getCurrentSum from '../stake_info/getCurrentSum';
import showStake, { isCouponOpenning } from '../show_stake';

const preAction = (): void => {
  const acceptButton = document.querySelector(
    '.bs-AcceptButton'
  ) as HTMLElement;
  if (acceptButton) {
    const footerMessage = document.querySelector('.bss-Footer_MessageBody');

    // The line, odds or availability of your selections has changed.
    if (footerMessage) {
      const footerMessageText = footerMessage.textContent.trim();
      if (
        /^The line, odds or availability of your selections has changed.$/i.test(
          footerMessageText
        )
      ) {
        log(`Принимаем изменения`, 'orange');
      } else {
        log(`Принимаем изменения (${footerMessageText})`, 'orange');
      }
    } else {
      log(`Принимаем изменения (текст изменений не найден)`, 'orange');
    }
    acceptButton.click();
  }
};

const getStakeInfo = getStakeInfoGenerator({
  preAction,
  isCouponOpenning,
  showStake,
  checkAuth,
  getStakeCount,
  getBalance,
  getMinimumStake,
  getMaximumStake,
  getCurrentSum,
  checkStakeEnabled,
  getCoefficient,
  getParameter,
});

export default getStakeInfo;
