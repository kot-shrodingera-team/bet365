import { log, stakeInfoString } from '@kot-shrodingera-team/germes-utils';
import { updateBalance } from '../stake_info/getBalance';
import { getReferBetConfirmation } from './checkCouponLoading';

const checkStakeStatus = (): boolean => {
  if (getReferBetConfirmation()) {
    const betslip = document.querySelector('.bss-StandardBetslip');
    if (betslip) {
      // eslint-disable-next-line no-console
      console.log(betslip.innerHTML);
    }
    const referBetDeclined = document.querySelector(
      '.bss-ReferralInfo_Label-partialdecline'
    );
    if (referBetDeclined) {
      log('Refer Bet Declined', 'steelblue');
      worker.Helper.SendInformedMessage('Refer Bet Declined');
    } else {
      log('[Скорее всего] Refer Bet Accepted', 'steelblue');
      worker.Helper.SendInformedMessage('[Скорее всего] Refer Bet Accepted');
    }
  }
  const acceptButton = document.querySelector(
    '.bs-AcceptButton'
  ) as HTMLElement;
  if (acceptButton) {
    const footerMessage = document.querySelector('.bss-Footer_MessageBody');
    if (footerMessage) {
      const footerMessageText = footerMessage.textContent.trim();
      if (
        /^The line, odds or availability of your selections has changed.$/i.test(
          footerMessageText
        )
      ) {
        log(`Ставка не принята: в купоне были изменения`, 'tomato');
      } else {
        log(
          `Ставка не принята: в купоне были изменения (${footerMessageText})`,
          'tomato'
        );
      }
    } else {
      log(
        `Ставка не принята: в купоне были изменения (текст изменений не найден)`,
        'tomato'
      );
    }
    return false;
  }
  // const betslipHeaderText = document.querySelector('.bs-ReceiptContent_Title');
  // if (
  //   betslipHeaderText &&
  //   betslipHeaderText.textContent.trim() === 'Bet Placed'
  // ) {
  //   const standardBetslip = document.querySelector('.bss-StandardBetslip');
  //   if (
  //     standardBetslip &&
  //     ![...standardBetslip.classList].includes('bss-StandardBetslip-receipt')
  //   ) {
  //     log('Ставка не принята (невидимая иконка)', 'tomato');
  //     return false;
  //   }
  //   log('Ставка принята (Bet Placed)', 'green');
  //   updateBalance();
  //   return true;
  // }
  const betslipPlaceBetButtonText = document.querySelector(
    '.bss-PlaceBetButton_Text'
  );
  if (
    betslipPlaceBetButtonText &&
    betslipPlaceBetButtonText.textContent.trim() === 'Total Stake'
  ) {
    log('Ставка принята (Total Stake)', 'green');
    updateBalance();
    return true;
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
      const message =
        `В Bet365 появилось окно о необходимости проверки принятия ставки в "My Bets"\n` +
        `Бот засчитал ставку как проставленную\n` +
        `${stakeInfoString()}\n` +
        `Пожалуйста, проверьте самостоятельно. Если всё плохо - пишите в ТП`;
      log(message, 'green');
      worker.Helper.SendInformedMessage(message);
      const betslipPlaceBetErrorMessageButton = document.querySelector(
        '.bs-PlaceBetErrorMessage_Button'
      ) as HTMLElement;
      if (betslipPlaceBetErrorMessageButton) {
        betslipPlaceBetErrorMessageButton.click();
      }
      return true;
    }
    log(`Ошибка ставки: ${errorText}`, 'tomato');
    const betslipPlaceBetErrorMessageButton = document.querySelector(
      '.bs-PlaceBetErrorMessage_Button'
    ) as HTMLElement;
    if (betslipPlaceBetErrorMessageButton) {
      betslipPlaceBetErrorMessageButton.click();
    }
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
      log('Ставка не принята (ошибка, не пройден Step 2)', 'orange');
      const paused = worker.SetBookmakerPaused(true);
      const message = `В Bet365 ограничение аккаунта (не пройден Step 2). ${
        paused
          ? 'БК поставлена на паузу'
          : 'Не удалось поставить БК на паузу, поставьте самостоятельно'
      }`;
      worker.Helper.SendInformedMessage(message);
      return false;
    }
    if (
      /As part of the ongoing management of your account we need you to answer a set of questions relating to Responsible Gambling. Certain restrictions may be applied to your account until you have successfully completed this. You can answer these questions now by going to the Self-Assessment page in Members./i.test(
        footerMessage
      )
    ) {
      log('Ставка не принята (ошибка, не пройден опрос)', 'orange');
      const paused = worker.SetBookmakerPaused(true);
      const message = `В Bet365 ограничение аккаунта (не пройден опрос). ${
        paused
          ? 'БК поставлена на паузу'
          : 'Не удалось поставить БК на паузу, поставьте самостоятельно'
      }`;
      worker.Helper.SendInformedMessage(message);
      return false;
    }
  }
  log('Ставка не принята (текст ошибки не найден)', 'tomato');
  return false;
};

export default checkStakeStatus;
