import checkCouponLoadingGenerator from '@kot-shrodingera-team/germes-generators/worker_callbacks/checkCouponLoading';
import {
  log,
  getElement,
  awaiter,
  getRemainingTimeout,
  checkCouponLoadingError,
  checkCouponLoadingSuccess,
  text,
  sleep,
  getWorkerParameter,
  sendTGBotMessage,
} from '@kot-shrodingera-team/germes-utils';
import { StateMachine } from '@kot-shrodingera-team/germes-utils/stateMachine';
import {
  accountRestricted,
  accountStep2,
  accountSurvey,
} from '../show_stake/helpers/accountChecks';
import getCouponError, {
  CouponError,
  updateMaximumStake,
} from '../show_stake/helpers/getCouponError';
// import getCouponError, {
//   CouponError,
// } from '../show_stake/helpers/getCouponError';
import openBet from '../show_stake/openBet';

const loaderSelector = '.bss-ProcessingButton';
const referBetSelector = '.bss-ReferBetConfirmation';
export const errorSelector =
  '.bss-Footer_MessageBody, .bsi-FooterIT_MessageBody';
const placeBetErrorSelector = '.bs-PlaceBetErrorMessage_Contents';
const acceptButtonSelector = '.bs-AcceptButton';
const receiptTickSelector =
  '.bss-ReceiptContent_Tick, .bss-StandardBetslip-receipt';

const asyncCheck = async () => {
  // todo: переименовать
  const loaderNotAppearedTimeout =
    (getWorkerParameter('betProcessingStartDelay', 'number') as number) || 1000;

  // todo: переименовать
  const noResultAfterLoaderDisappearedTimeout =
    (getWorkerParameter(
      'betProcessingLoaderDissapearMaxDelay',
      'number'
    ) as number) || 3000;
  const machine = new StateMachine();

  machine.promises = {
    loaderNotAppeared: () => sleep(loaderNotAppearedTimeout),
    loader: () => getElement(loaderSelector, getRemainingTimeout()),
    referBet: () => getElement(referBetSelector, getRemainingTimeout()),
    error: () => getElement(errorSelector, getRemainingTimeout()),
    placeBetError: () =>
      getElement(placeBetErrorSelector, getRemainingTimeout()),
    acceptButton: () => getElement(acceptButtonSelector, getRemainingTimeout()),
    betPlaced: () => getElement(receiptTickSelector, getRemainingTimeout()),
  };

  machine.setStates({
    start: {
      entry: async () => {
        log('Начало обработки ставки', 'steelblue');
      },
    },
    loaderNotAppeared: {
      entry: async () => {
        checkCouponLoadingError({
          // reopen: {
          //   openBet,
          // },
          informMessage: `Индикатор или результат не появился в течении ${loaderNotAppearedTimeout} мс`,
        });
      },
    },
    loader: {
      entry: async () => {
        log('Появился индикатор', 'steelblue');
        window.germesData.betProcessingAdditionalInfo = 'индикатор';
        delete machine.promises.loader;
        delete machine.promises.loaderNotAppeared;
        machine.promises.loaderDissappeared = () =>
          awaiter(
            () => document.querySelector(loaderSelector) === null,
            getRemainingTimeout()
          );
      },
    },
    loaderDissappeared: {
      entry: async () => {
        log('Исчез индикатор', 'steelblue');
        window.germesData.betProcessingAdditionalInfo = null;
        delete machine.promises.loaderDissappeared;
        machine.promises.noResultAfterLoaderDisappeared = () =>
          sleep(noResultAfterLoaderDisappearedTimeout);
      },
    },
    noResultAfterLoaderDisappeared: {
      entry: async () => {
        log(
          `Результат не появился в течении ${noResultAfterLoaderDisappearedTimeout} мс после исчезания индикатора`,
          'steelblue'
        );
        window.germesData.betProcessingAdditionalInfo = null;
        checkCouponLoadingError({
          // reopen: {
          //   openBet,
          // },
          informMessage: `Результат не появился в течении ${noResultAfterLoaderDisappearedTimeout} мс после исчезания индикатора`,
        });
        machine.end = true;
      },
    },
    referBet: {
      entry: async (): Promise<void> => {
        log('Refer Bet Confirmation', 'steelblue');
        const placeNowValueSelector =
          '.bss-ReferBetConfirmation_PlaceNow .bss-ReferBetConfirmation_Referred:nth-child(1) .bss-ReferBetConfirmation_Referred-value';
        const referredValueSelector =
          '.bss-ReferBetConfirmation_PlaceNow .bss-ReferBetConfirmation_Referred:nth-child(2) .bss-ReferBetConfirmation_Referred-value';
        const placeBetAndReferButtonSelector = '.bss-PlaceBetReferButton_Text';

        log('Ждём появления данных', 'steelblue');
        sendTGBotMessage(
          '1786981726:AAE35XkwJRsuReonfh1X2b8E7k9X4vknC_s',
          126302051,
          'ReferBerError Test'
        );

        await Promise.all([
          getElement(placeNowValueSelector, getRemainingTimeout()),
          getElement(referredValueSelector, getRemainingTimeout()),
          getElement(placeBetAndReferButtonSelector, getRemainingTimeout()),
        ]);

        const placeNowValueElement = document.querySelector(
          placeNowValueSelector
        );
        const referredValueElement = document.querySelector(
          referredValueSelector
        );
        const placeBetAndReferButton = document.querySelector<HTMLElement>(
          placeBetAndReferButtonSelector
        );
        if (!placeNowValueElement) {
          log('placeNowValueElement not found', 'crimson');
        } else {
          log(`placeNowValueElement text: "${text(placeNowValueElement)}"`);
        }
        if (!referredValueElement) {
          log('referredValueElement not found', 'crimson');
        } else {
          log(`referredValueElement text: "${text(referredValueElement)}"`);
        }
        if (!placeBetAndReferButton) {
          log('placeBetAndReferButton not found', 'crimson');
        } else {
          log(`placeBetAndReferButton text: "${text(placeBetAndReferButton)}"`);
        }

        if (
          !placeNowValueElement ||
          !referredValueElement ||
          !placeBetAndReferButton
        ) {
          checkCouponLoadingError({
            botMessage:
              'Не дождались результата принятия ставки при Refer Bet Confirmation',
            informMessage:
              'Не дождались результата принятия ставки при Refer Bet Confirmation',
          });
          machine.end = true;
          return;
        }

        const placeNowValueText = text(placeNowValueElement);
        const referredValueText = text(referredValueElement);
        const valueRegex = /(\d+(?:\.\d+)?)/;
        const placeNowValueMatch = placeNowValueText.match(valueRegex);
        if (!placeNowValueMatch) {
          checkCouponLoadingError({
            botMessage: `Не удалось определить значение Place Now: ${placeNowValueText}`,
            informMessage: `Не удалось определить значение Place Now: ${placeNowValueText}`,
          });
          machine.end = true;
          return;
        }
        const referredValueMatch = referredValueText.match(valueRegex);
        if (!referredValueMatch) {
          checkCouponLoadingError({
            botMessage: `Не удалось определить значение Referred: ${referredValueText}`,
            informMessage: `Не удалось определить значение Referred: ${referredValueText}`,
          });
          machine.end = true;
          return;
        }
        window.germesData.referredBetData.placeNowValue = Number(
          placeNowValueMatch[1]
        );
        window.germesData.referredBetData.referredValue = Number(
          referredValueMatch[1]
        );

        placeBetAndReferButton.click();
        log('Нажимаем на кнопку "Place Bet and Refer"', 'orange');
      },
    },
    error: {
      entry: async () => {
        log('Появилась ошибка', 'steelblue');
        window.germesData.betProcessingAdditionalInfo = null;
        const couponError = getCouponError();

        const errorText = text(machine.data.result as HTMLElement);
        log(errorText, 'tomato');

        const acceptButton =
          document.querySelector<HTMLElement>('.bs-AcceptButton');

        if (couponError === CouponError.AccountRestricted) {
          accountRestricted();
          machine.end = true;
          checkCouponLoadingError({});
          return;
        }
        if (couponError === CouponError.AccountStep2) {
          accountStep2();
          machine.end = true;
          checkCouponLoadingError({});
          return;
        }
        if (couponError === CouponError.AccounSurvey) {
          accountSurvey();
          machine.end = true;
          checkCouponLoadingError({});
          return;
        }
        if (couponError === CouponError.OddsChanged) {
          const suspendedStake = document.querySelector(
            '.bss-NormalBetItem.bss-NormalBetItem_Suspended'
          );
          if (suspendedStake) {
            machine.end = true;
            checkCouponLoadingError({
              botMessage: 'Ставка недоступна',
            });
            return;
          }
          log('Изменение котировок', 'crimson');
          if (!acceptButton) {
            log('Не найдена кнопка принятия изменений', 'crimson');
          } else {
            log('Принимаем изменения', 'orange');
            acceptButton.click();
          }
          machine.end = true;
          checkCouponLoadingError({});
          return;
        }
        if (
          couponError === CouponError.NewMaximum ||
          couponError === CouponError.NewMaximumShort ||
          couponError === CouponError.UnknownMaximum
        ) {
          log('Превышена максимальная ставка', 'crimson');
          updateMaximumStake();
          const delay =
            2000 -
            (new Date().getTime() - window.germesData.doStakeTime.getTime());
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
          machine.end = true;
          checkCouponLoadingError({});
          return;
        }
        if (couponError === CouponError.PleaseEnterAStake) {
          machine.end = true;
          checkCouponLoadingError({});
          return;
        }
        if (couponError === CouponError.Unknown) {
          sendTGBotMessage(
            '1786981726:AAE35XkwJRsuReonfh1X2b8E7k9X4vknC_s',
            126302051,
            `unknownError:\n${errorText}`
          );
          machine.end = true;
          checkCouponLoadingError({
            informMessage: errorText,
          });
          return;
        }
        machine.end = true;
        checkCouponLoadingError({
          botMessage: 'В купоне неизвестный тип ошибки',
          informMessage: 'В купоне неизвестный тип ошибки',
        });
      },
    },
    placeBetError: {
      entry: async () => {
        log('Появилась ошибка ставки', 'steelblue');
        window.germesData.betProcessingAdditionalInfo = null;
        const placeBetErrorText = text(machine.data.result as HTMLElement);
        const checkMyBetsRegex =
          /Please check My Bets for confirmation that your bet has been successfully placed./i;
        if (checkMyBetsRegex.test(placeBetErrorText)) {
          machine.end = true;
          checkCouponLoadingError({
            botMessage: 'Check My Bets',
            informMessage: placeBetErrorText,
            reopen: {
              openBet,
            },
          });
          return;
        }
        log('В купоне непонятная ошибка ставки', 'crimson');
        log(placeBetErrorText, 'tomato');
        machine.end = true;
        checkCouponLoadingError({
          botMessage: 'В купоне непонятная ошибка ставки',
          informMessage: placeBetErrorText,
          reopen: {
            openBet,
          },
        });
      },
    },
    acceptButton: {
      entry: async () => {
        log(
          'Появилась кнопка принятия изменений, но нет сообщения',
          'steelblue'
        );
        machine.promises = {
          error: () => getElement(errorSelector, getRemainingTimeout()),
          placeBetError: () =>
            getElement(placeBetErrorSelector, getRemainingTimeout()),
          errorNotAppeared: () => sleep(5000),
        };
      },
    },
    errorNotAppeared: {
      entry: async () => {
        machine.end = true;
        checkCouponLoadingError({
          botMessage:
            'Не появилось сообщение после появления кнопки принятия изменений',
          informMessage:
            'Не появилось сообщение после появления кнопки принятия изменений',
        });
      },
    },
    betPlaced: {
      entry: async () => {
        window.germesData.betProcessingAdditionalInfo = null;
        machine.end = true;
        checkCouponLoadingSuccess('Ставка принята');
      },
    },
    timeout: {
      entry: async () => {
        window.germesData.betProcessingAdditionalInfo = null;
        machine.end = true;
        checkCouponLoadingError({
          botMessage: 'Не дождались результата ставки',
          informMessage: 'Не дождались результата ставки',
        });
      },
    },
  });

  machine.start('start');
};

const checkCouponLoading = checkCouponLoadingGenerator({
  asyncCheck,
});

export default checkCouponLoading;
