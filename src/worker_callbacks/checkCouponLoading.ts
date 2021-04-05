import checkCouponLoadingGenerator from '@kot-shrodingera-team/germes-generators/worker_callbacks/checkCouponLoading';
import {
  log,
  getElement,
  awaiter,
  stakeInfoString,
  sleep,
} from '@kot-shrodingera-team/germes-utils';
import {
  accountRestricted,
  accountStep2,
  accountSurvey,
} from '../initialization/accountChecks';
// import { JsFailError } from '@kot-shrodingera-team/germes-utils/errors';
import getCouponError, {
  CouponError,
  getCouponErrorText,
  updateMaximumStake,
} from '../show_stake/helpers/getCouponError';
// import openBet from '../show_stake/openBet';
import { getDoStakeTime } from '../stake_info/doStakeTime';

const bookmakerName = 'Bet365';

const timeout = 50000;
const getRemainingTimeout = (maximum?: number) => {
  const result = timeout - (new Date().getTime() - getDoStakeTime().getTime());
  if (maximum !== undefined && timeout > maximum) {
    return maximum;
  }
  return result;
};

const asyncCheck = async () => {
  const error = (message?: string) => {
    if (message !== undefined) {
      log(message, 'crimson');
    }
    window.germesData.betProcessingStep = 'error';
  };
  const errorInform = (informedMessage: string, botMessage?: string) => {
    worker.Helper.SendInformedMessage(
      `В ${bookmakerName} произошла ошибка принятия ставки:\n${informedMessage}\n` +
        `Бот засчитал ставку как не принятую\n` +
        `${stakeInfoString()}`
    );
    if (botMessage) {
      log(botMessage, 'crimson');
    } else {
      log(informedMessage, 'crimson');
    }
    window.germesData.betProcessingStep = 'error';
  };
  const success = (message?: string) => {
    if (message !== undefined) {
      log(message, 'steelblue');
    }
    window.germesData.betProcessingStep = 'success';
  };
  // const reopen = async (message?: string) => {
  //   if (message !== undefined) {
  //     log(message, 'crimson');
  //   }
  //   window.germesData.betProcessingStep = 'reopen';
  //   log('Переоткрываем купон', 'orange');
  //   try {
  //     await openBet();
  //     log('Ставка успешно переоткрыта', 'green');
  //     window.germesData.betProcessingStep = 'reopened';
  //   } catch (reopenError) {
  //     if (reopenError instanceof JsFailError) {
  //       log(reopenError.message, 'red');
  //       window.germesData.betProcessingStep = 'error';
  //     } else {
  //       log(reopenError.message, 'red');
  //       window.germesData.betProcessingStep = 'error';
  //     }
  //   }
  // };

  const loaderSelector = '.bss-ProcessingButton';
  const referBetSelector = '.bss-ReferBetConfirmation';
  const errorSelector = '.bss-Footer_MessageBody';
  const placeBetErrorSelector = '.bs-PlaceBetErrorMessage_Contents';
  const acceptButtonSelector = '.bs-AcceptButton';
  const receiptTickSelector = '.bss-ReceiptContent_Tick';

  window.germesData.betProcessingStep = 'waitingForLoaderOrResult';

  await Promise.any([
    getElement(loaderSelector, getRemainingTimeout()),
    getElement(referBetSelector, getRemainingTimeout()),
    getElement(errorSelector, getRemainingTimeout()),
    getElement(placeBetErrorSelector, getRemainingTimeout()),
    getElement(acceptButtonSelector, getRemainingTimeout()),
    getElement(receiptTickSelector, getRemainingTimeout()),
  ]);

  const loaderElement = document.querySelector(loaderSelector);

  if (loaderElement) {
    log('Появился индикатор', 'steelblue');
    window.germesData.betProcessingAdditionalInfo = 'индикатор';
    awaiter(
      () => {
        return document.querySelector(loaderSelector) === null;
      },
      getRemainingTimeout(),
      100
    ).then((loaderDissappeared) => {
      if (loaderDissappeared) {
        log('Исчез индикатор', 'steelblue');
        window.germesData.betProcessingAdditionalInfo = null;
      }
    });

    window.germesData.betProcessingStep = 'waitingForResult';
    await Promise.any([
      getElement(referBetSelector, getRemainingTimeout()),
      getElement(errorSelector, getRemainingTimeout()),
      getElement(placeBetErrorSelector, getRemainingTimeout()),
      getElement(acceptButtonSelector, getRemainingTimeout()),
      getElement(receiptTickSelector, getRemainingTimeout()),
    ]);
  }

  const referBetElement = document.querySelector(referBetSelector);
  if (referBetElement) {
    log('Refer Bet Confirmation', 'steelblue');
    const placeNowValueSelector =
      '.bss-ReferBetConfirmation_PlaceNow .bss-ReferBetConfirmation_Referred-value';
    const referredValueSelector =
      '.bss-ReferBetConfirmation_Referred .bss-ReferBetConfirmation_Referred-value';
    const placeBetAndReferButtonSelector = '.bss-PlaceBetReferButton_Text';

    await Promise.all([
      getElement(placeNowValueSelector, getRemainingTimeout()),
      getElement(referredValueSelector, getRemainingTimeout()),
      getElement(placeBetAndReferButtonSelector, getRemainingTimeout()),
    ]);

    const placeNowValueElement = document.querySelector(placeNowValueSelector);
    const referredValueElement = document.querySelector(referredValueSelector);
    const placeBetAndReferButton = document.querySelector<HTMLElement>(
      placeBetAndReferButtonSelector
    );

    if (
      !placeNowValueElement ||
      !referredValueElement ||
      !placeBetAndReferButton
    ) {
      return errorInform(
        'Не дождались результата принятия ставки при Refer Bet Confirmation'
      );
    }

    const placeNowValueText = placeNowValueElement.textContent.trim();
    const referredValueText = referredValueElement.textContent.trim();
    const valueRegex = /(\d+(?:\.\d+)?)/;
    const placeNowValueMatch = placeNowValueText.match(valueRegex);
    if (!placeNowValueMatch) {
      return errorInform(
        `Не удалось определить значение placeNow: ${placeNowValueText}`
      );
    }
    const referredValueMatch = referredValueText.match(valueRegex);
    if (!referredValueMatch) {
      return errorInform(
        `Не удалось определить значение placeNow: ${referredValueText}`
      );
    }
    window.germesData.referredBetData.placeNowValue = Number(
      placeNowValueMatch[1]
    );
    window.germesData.referredBetData.referredValue = Number(
      referredValueMatch[1]
    );

    placeBetAndReferButton.click();
    log('Нажимаем на кнопку "Place Bet and Refer"', 'orange');

    await Promise.any([
      getElement(errorSelector, getRemainingTimeout()),
      getElement(placeBetErrorSelector, getRemainingTimeout()),
      getElement(acceptButtonSelector, getRemainingTimeout()),
      getElement(receiptTickSelector, getRemainingTimeout()),
    ]);
  }

  const errorElement = document.querySelector(errorSelector);
  if (errorElement) {
    const couponError = getCouponError();
    const acceptButton = document.querySelector<HTMLElement>(
      '.bs-AcceptButton'
    );

    if (couponError === CouponError.AccountRestricted) {
      accountRestricted();
      return error();
    }
    if (couponError === CouponError.AccountStep2) {
      accountStep2();
      return error();
    }
    if (couponError === CouponError.AccounSurvey) {
      accountSurvey();
      return error();
    }
    if (couponError === CouponError.OddsChanged) {
      const suspendedStake = document.querySelector(
        '.bss-NormalBetItem.bss-NormalBetItem_Suspended'
      );
      if (suspendedStake) {
        return error('Ставка недоступна');
      }
      if (!acceptButton) {
        log('Не найдена кнопка принятия изменений', 'crimson');
      } else {
        log('Принимаем изменения', 'orange');
        acceptButton.click();
      }
      return error('Изменение котировок');
    }
    if (
      couponError === CouponError.NewMaximum ||
      couponError === CouponError.NewMaximumShort ||
      couponError === CouponError.UnknownMaximum
    ) {
      updateMaximumStake();
      if (!acceptButton) {
        log('Не найдена кнопка принятия изменений', 'crimson');
      } else {
        log('Принимаем изменения', 'orange');
        acceptButton.click();
      }
      const delay =
        2 - new Date().getTime() - window.germesData.doStakeTime.getTime();
      if (delay > 0) {
        log('Задержка после появления максимума');
        await sleep(delay);
      }
      return error('Превышена максимальная ставка');
    }
    if (couponError === CouponError.Unknown) {
      const couponErrorText = getCouponErrorText();
      log(couponErrorText, 'tomato');
      return errorInform(
        `В купоне неизвестная ошибка:\n${couponErrorText}`,
        'В купоне неизвестная ошибка'
      );
    }
    return errorInform('В купоне неизвестная ошибка');
  }

  const placeBetErrorElement = document.querySelector(placeBetErrorSelector);
  if (placeBetErrorElement) {
    const placeBetErrorText = placeBetErrorElement.textContent.trim();

    const checkMyBetsRegex = /Please check My Bets for confirmation that your bet has been successfully placed./i;
    if (checkMyBetsRegex.test(placeBetErrorText)) {
      log('Обработка ставки завершена (check My Bets)', 'orange');
      const message =
        `В Bet365 появилось окно о необходимости проверки принятия ставки в "My Bets":\n${placeBetErrorText}` +
        `Бот засчитал ставку как проставленную\n` +
        `${stakeInfoString()}\n` +
        `Пожалуйста, проверьте самостоятельно. Если всё плохо - пишите в ТП`;
      worker.Helper.SendInformedMessage(message);
      return success('Ставка возможно принята (Check My Bets)');
    }
    log('В купоне неизвестная ошибка', 'crimson');
    log(placeBetErrorText, 'tomato');
    return errorInform(placeBetErrorText, 'В купоне ошибка ставки');
  }

  const acceptButtonElement = document.querySelector(acceptButtonSelector);
  if (acceptButtonElement) {
    return errorInform('Появилась кнопка принятия изменений, но нет сообщения');
  }

  const receiptTickElement = document.querySelector(receiptTickSelector);
  if (receiptTickElement) {
    if (referBetElement) {
      const referBetDeclined = document.querySelector(
        '.bss-ReferralInfo_Label-partialdecline'
      );

      if (referBetDeclined) {
        const message =
          `Bet365: Refer Bet Declined\n` +
          `${stakeInfoString()}\n` +
          `Place Now Value: ${window.germesData.referredBetData.placeNowValue}\n` +
          `Referred Value: ${window.germesData.referredBetData.referredValue}`;
        log('Refer Bet Declined', 'steelblue');
        worker.Helper.SendInformedMessage(message);
      } else {
        const message =
          `Bet365: Refer Bet Accepted\n` +
          `${stakeInfoString()}\n` +
          `Place Now Value: ${window.germesData.referredBetData.placeNowValue}\n` +
          `Referred Value: ${window.germesData.referredBetData.referredValue}`;
        log('Refer Bet Accepted', 'steelblue');
        worker.Helper.SendInformedMessage(message);
      }
    }
    return success('Появилась иконка успешной ставки');
  }

  return errorInform('Не дождались результата принятия ставки');
};

const check = () => {
  const step = window.germesData.betProcessingStep;
  const additionalInfo = window.germesData.betProcessingAdditionalInfo
    ? ` (${window.germesData.betProcessingAdditionalInfo})`
    : '';
  switch (step) {
    case 'beforeStart':
      asyncCheck();
      return true;
    case 'error':
    case 'success':
    case 'reopened':
      log(`Обработка ставки завершена (${step})${additionalInfo}`, 'orange');
      return false;
    default:
      log(`Обработка ставки (${step})${additionalInfo}`, 'tan');
      return true;
  }
};

const checkCouponLoading = checkCouponLoadingGenerator({
  getDoStakeTime,
  bookmakerName,
  timeout,
  check,
});

export default checkCouponLoading;
