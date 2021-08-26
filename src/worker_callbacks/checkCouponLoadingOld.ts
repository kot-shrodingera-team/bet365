import checkCouponLoadingGenerator from '@kot-shrodingera-team/germes-generators/worker_callbacks/checkCouponLoading';
import {
  log,
  getElement,
  awaiter,
  stakeInfoString,
  sleep,
  getRemainingTimeout,
  checkCouponLoadingError,
  checkCouponLoadingSuccess,
  getWorkerParameter,
} from '@kot-shrodingera-team/germes-utils';
import {
  accountRestricted,
  accountStep2,
  accountSurvey,
} from '../show_stake/helpers/accountChecks';
// import { JsFailError } from '@kot-shrodingera-team/germes-utils/errors';
import getCouponError, {
  CouponError,
  getCouponErrorText,
  updateMaximumStake,
} from '../show_stake/helpers/getCouponError';
import openBet from '../show_stake/openBet';
import getPlacedBetCoefficient from './helpers/getPlacedBetCoefficient';

const loaderSelector = '.bss-ProcessingButton';
const referBetSelector = '.bss-ReferBetConfirmation';
// const errorSelector = '.bss-Footer_MessageBody';
const placeBetErrorSelector = '.bs-PlaceBetErrorMessage_Contents';
const acceptButtonSelector = '.bs-AcceptButton';
const receiptTickSelector = '.bss-ReceiptContent_Tick';

const errorAwaiter = () => {
  return awaiter(
    () => getCouponError() !== CouponError.NoError,
    getRemainingTimeout()
  );
};

const asyncCheck = async () => {
  const betProcessingStartDelay = getWorkerParameter(
    'betProcessingStartDelay',
    'number'
  ) as number;

  const betProcessingLoaderDissapearMaxDelay = getWorkerParameter(
    'betProcessingLoaderDissapearMaxDelay',
    'number'
  ) as number;

  window.germesData.betProcessingStep = 'waitingForLoaderOrResult';

  await Promise.race([
    ...(betProcessingStartDelay !== undefined
      ? [sleep(betProcessingStartDelay)]
      : []),
    getElement(loaderSelector, getRemainingTimeout()),
    getElement(referBetSelector, getRemainingTimeout()),
    errorAwaiter(),
    getElement(placeBetErrorSelector, getRemainingTimeout()),
    getElement(acceptButtonSelector, getRemainingTimeout()),
    getElement(receiptTickSelector, getRemainingTimeout()),
  ]);

  // if (
  //   new Date().getTime() - window.germesData.doStakeTime.getTime() >
  //   betProcessingStartDelay
  // ) {
  //   return checkCouponLoadingError({
  //     botMessage: `Не дождались появления индикатора за ${betProcessingStartDelay} мс`,
  //   });
  // }

  // const loaderElement = document.querySelector(loaderSelector);

  // if (loaderElement) {
  //   log('Появился индикатор', 'steelblue');
  //   window.germesData.betProcessingAdditionalInfo = 'индикатор';
  //   window.germesData.betProcessingStep = 'waitingForResult';

  //   await Promise.race([
  //     awaiter(
  //       () => {
  //         return document.querySelector(loaderSelector) === null;
  //       },
  //       getRemainingTimeout(),
  //       100
  //     ),
  //     getElement(referBetSelector, getRemainingTimeout()),
  //     errorAwaiter(),
  //     getElement(placeBetErrorSelector, getRemainingTimeout()),
  //     getElement(acceptButtonSelector, getRemainingTimeout()),
  //     getElement(receiptTickSelector, getRemainingTimeout()),
  //   ]);

  //   if (document.querySelector(loaderSelector) === null) {
  //     log('Исчез индикатор', 'steelblue');
  //     window.germesData.betProcessingAdditionalInfo = null;
  //   }

  //   await Promise.race([
  //     ...(betProcessingLoaderDissapearMaxDelay !== undefined
  //       ? [sleep(betProcessingLoaderDissapearMaxDelay)]
  //       : []),
  //     getElement(referBetSelector, getRemainingTimeout()),
  //     errorAwaiter(),
  //     getElement(placeBetErrorSelector, getRemainingTimeout()),
  //     getElement(acceptButtonSelector, getRemainingTimeout()),
  //     getElement(receiptTickSelector, getRemainingTimeout()),
  //   ]);
  // }

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
      return checkCouponLoadingError({
        botMessage:
          'Не дождались результата принятия ставки при Refer Bet Confirmation',
        informMessage:
          'Не дождались результата принятия ставки при Refer Bet Confirmation',
      });
    }

    const placeNowValueText = placeNowValueElement.textContent.trim();
    const referredValueText = referredValueElement.textContent.trim();
    const valueRegex = /(\d+(?:\.\d+)?)/;
    const placeNowValueMatch = placeNowValueText.match(valueRegex);
    if (!placeNowValueMatch) {
      return checkCouponLoadingError({
        botMessage: `Не удалось определить значение Place Now: ${placeNowValueText}`,
        informMessage: `Не удалось определить значение Place Now: ${placeNowValueText}`,
      });
    }
    const referredValueMatch = referredValueText.match(valueRegex);
    if (!referredValueMatch) {
      return checkCouponLoadingError({
        botMessage: `Не удалось определить значение Referred: ${referredValueText}`,
        informMessage: `Не удалось определить значение Referred: ${referredValueText}`,
      });
    }
    window.germesData.referredBetData.placeNowValue = Number(
      placeNowValueMatch[1]
    );
    window.germesData.referredBetData.referredValue = Number(
      referredValueMatch[1]
    );

    placeBetAndReferButton.click();
    log('Нажимаем на кнопку "Place Bet and Refer"', 'orange');

    await Promise.race([
      errorAwaiter(),
      getElement(placeBetErrorSelector, getRemainingTimeout()),
      getElement(acceptButtonSelector, getRemainingTimeout()),
      getElement(receiptTickSelector, getRemainingTimeout()),
    ]);
  }

  let couponError = getCouponError();

  const acceptButtonElement = document.querySelector(acceptButtonSelector);
  if (acceptButtonElement) {
    if (couponError === CouponError.NoError) {
      log('Появилась кнопка принятия изменений, но нет сообщения', 'steelblue');
      const errorAppeared = await awaiter(
        () => {
          couponError = getCouponError();
          return couponError !== CouponError.NoError;
        },
        5000,
        50
      );
      if (!errorAppeared) {
        return checkCouponLoadingError({
          botMessage:
            'Не появилось сообщение после появления кнопки принятия изменений',
          informMessage:
            'Не появилось сообщение после появления кнопки принятия изменений',
        });
      }
    }
  }

  if (couponError !== CouponError.NoError) {
    const couponErrorText = getCouponErrorText();
    log(couponErrorText, 'tomato');

    const acceptButton =
      document.querySelector<HTMLElement>('.bs-AcceptButton');

    if (couponError === CouponError.AccountRestricted) {
      accountRestricted();
      return checkCouponLoadingError({});
    }
    if (couponError === CouponError.AccountStep2) {
      accountStep2();
      return checkCouponLoadingError({});
    }
    if (couponError === CouponError.AccounSurvey) {
      accountSurvey();
      return checkCouponLoadingError({});
    }
    if (couponError === CouponError.OddsChanged) {
      const suspendedStake = document.querySelector(
        '.bss-NormalBetItem.bss-NormalBetItem_Suspended'
      );
      if (suspendedStake) {
        return checkCouponLoadingError({
          botMessage: 'Ставка недоступна',
        });
      }
      log('Изменение котировок', 'crimson');
      if (!acceptButton) {
        log('Не найдена кнопка принятия изменений', 'crimson');
      } else {
        log('Принимаем изменения', 'orange');
        acceptButton.click();
      }
      return checkCouponLoadingError({});
    }
    if (
      couponError === CouponError.NewMaximum ||
      couponError === CouponError.NewMaximumShort ||
      couponError === CouponError.UnknownMaximum
    ) {
      log('Превышена максимальная ставка', 'crimson');
      updateMaximumStake();
      const delay =
        2000 - (new Date().getTime() - window.germesData.doStakeTime.getTime());
      if (delay > 0) {
        log('Задержка после появления максимума');
        await sleep(delay);
      }
      if (!acceptButton) {
        log('Не найдена кнопка принятия изменений', 'crimson');
      } else {
        log('Принимаем изменения', 'orange');
        acceptButton.click();
      }
      return checkCouponLoadingError({});
    }
    if (couponError === CouponError.Unknown) {
      return checkCouponLoadingError({
        informMessage: couponErrorText,
      });
    }
    return checkCouponLoadingError({
      botMessage: 'В купоне неизвестный тип ошибки',
      informMessage: 'В купоне неизвестный тип ошибки',
    });
  }

  const placeBetErrorElement = document.querySelector(placeBetErrorSelector);
  if (placeBetErrorElement) {
    const placeBetErrorText = placeBetErrorElement.textContent.trim();

    const checkMyBetsRegex =
      /Please check My Bets for confirmation that your bet has been successfully placed./i;
    if (checkMyBetsRegex.test(placeBetErrorText)) {
      return checkCouponLoadingError({
        botMessage: 'Check My Bets',
        informMessage: placeBetErrorText,
        reopen: {
          openBet,
        },
      });
    }
    log('В купоне неизвестная ошибка', 'crimson');
    log(placeBetErrorText, 'tomato');
    return checkCouponLoadingError({
      botMessage: 'В купоне ошибка ставки',
      informMessage: placeBetErrorText,
      reopen: {
        openBet,
      },
    });
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

    log('Появилась иконка успешной ставки', 'steelblue');

    if (getWorkerParameter('resultCoefficientTest')) {
      await getPlacedBetCoefficient();
    }

    return checkCouponLoadingSuccess();
  }

  // Если появлялся лоадер, но прошло время betProcessingLoaderDissapearMaxDelay
  // if (loaderElement && betProcessingLoaderDissapearMaxDelay !== undefined) {
  //   return checkCouponLoadingError({
  //     botMessage: `Результат не появился в течении ${betProcessingLoaderDissapearMaxDelay} мс после пропадания индикатора`,
  //   });
  // }

  // return checkCouponLoadingError({
  //   botMessage: 'Не дождались результата принятия ставки',
  //   informMessage: 'Не дождались результата принятия ставки',
  // });
};

// const check = () => {
//   const step = window.germesData.betProcessingStep;
//   const additionalInfo = window.germesData.betProcessingAdditionalInfo
//     ? ` (${window.germesData.betProcessingAdditionalInfo})`
//     : '';
//   switch (step) {
//     case 'beforeStart':
//       asyncCheck();
//       return true;
//     case 'error':
//     case 'success':
//     case 'reopened':
//       log(`Обработка ставки завершена${additionalInfo}`, 'orange');
//       // log(step, 'orange', true);
//       return false;
//     default:
//       log(`Обработка ставки${additionalInfo}`, 'tan');
//       // log(step, 'tan', true);
//       return true;
//   }
// };

const checkCouponLoading = checkCouponLoadingGenerator({
  asyncCheck,
});

export default checkCouponLoading;
