import { log, stakeInfoString } from '@kot-shrodingera-team/germes-utils';
import { updateBalance } from '../stake_info/getBalance';

const checkStakeStatus = (): boolean => {
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
  log('Ставка не принята (текст ошибки не найден)', 'tomato');
  return false;
};

export default checkStakeStatus;
