import checkCouponLoadingGenerator from '@kot-shrodingera-team/germes-generators/worker_callbacks/checkCouponLoading';
import {
  getWorkerParameter,
  getElement,
  getRemainingTimeout,
  sleep,
  log,
  awaiter,
  text,
  sendTGBotMessage,
} from '@kot-shrodingera-team/germes-utils';
import {
  sendErrorMessage,
  betProcessingError,
  betProcessingCompltete,
} from '@kot-shrodingera-team/germes-utils/betProcessing';
import { StateMachine } from '@kot-shrodingera-team/germes-utils/stateMachine';
import acceptChanges from '../helpers/acceptChanges';
import {
  accountRestricted,
  accountStep2,
  accountSurvey,
} from '../helpers/accountChecks';
import { updateMaximumStake } from '../stake_info/getMaximumStake';
import checkAuth from '../stake_info/checkAuth';

const loaderSelector = '.bss-ProcessingButton';
const referBetSelector = '.bss-ReferBetConfirmation';
export const errorSelector =
  '.bss-Footer_MessageBody, .bsi-FooterIT_MessageBody';
const placeBetErrorSelector = '.bs-PlaceBetErrorMessage_Contents';
const acceptButtonSelector = '.bs-AcceptButton';
const receiptTickSelector =
  '.bss-ReceiptContent_Tick, .bss-StandardBetslip-receipt';

const loaderNotAppearedTimeout =
  getWorkerParameter<number>('betProcessingStartDelay', 'number') || 1000;
const noResultAfterLoaderDisappearedTimeout =
  getWorkerParameter<number>(
    'betProcessingLoaderDissapearMaxDelay',
    'number'
  ) || 3000;

const asyncCheck = async () => {
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
        log('Задержка перед попыткой ставки', 'cadetblue', true);
        await sleep(500);
        log('Делаем ставку', 'darksalmon');
        try {
          BetSlipLocator.betSlipManager.betslip.activeModule.slip.footer.model.placeBet();
        } catch (e) {
          log(`ошибка попытки ставки: ${e.message}`, 'crimson');
          betProcessingError(machine);
          return;
        }
        log('Начало обработки ставки', 'steelblue');
      },
    },
    loaderNotAppeared: {
      entry: async () => {
        const message = `Индикатор или результат не появился в течении ${loaderNotAppearedTimeout} мс`;
        log(message, 'crimson');
        sendErrorMessage(message);
        betProcessingError(machine);
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
        if (!checkAuth()) {
          window.germesData.stakeDisabled = true;
          const message = `Результат не появился в течении ${noResultAfterLoaderDisappearedTimeout} мс после исчезания индикатора и пропала авторизация`;
          log(message, 'crimson');
          sendErrorMessage(message);
          betProcessingError(machine);
          return;
        }
        const message = `Результат не появился в течении ${noResultAfterLoaderDisappearedTimeout} мс после исчезания индикатора`;
        log(message, 'crimson');
        sendErrorMessage(message);
        betProcessingError(machine);
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
          const message =
            'Не дождались результата принятия ставки при Refer Bet Confirmation';
          log(message, 'crimson');
          sendErrorMessage(message);
          betProcessingError(machine);
          return;
        }

        const placeNowValueText = text(placeNowValueElement);
        const referredValueText = text(referredValueElement);
        const valueRegex = /(\d+(?:\.\d+)?)/;
        const placeNowValueMatch = placeNowValueText.match(valueRegex);
        if (!placeNowValueMatch) {
          const message = `Не удалось определить значение Place Now: ${placeNowValueText}`;
          log(message, 'crimson');
          sendErrorMessage(message);
          betProcessingError(machine);
          return;
        }
        const referredValueMatch = referredValueText.match(valueRegex);
        if (!referredValueMatch) {
          const message = `Не удалось определить значение Referred: ${referredValueText}`;
          log(message, 'crimson');
          sendErrorMessage(message);
          betProcessingError(machine);
          return;
        }
        window.germesData.referredBetData.placeNowValue = Number(
          placeNowValueMatch[1]
        );
        window.germesData.referredBetData.referredValue = Number(
          referredValueMatch[1]
        );

        placeBetAndReferButton.click(); // TODO: поменять на API версию
        log('Нажимаем на кнопку "Place Bet and Refer"', 'orange');
        delete machine.promises.referBet;
        delete machine.promises.loaderNotAppeared;
        delete machine.promises.loaderDissappeared;
        delete machine.promises.noResultAfterLoaderDisappeared;
        machine.promises.loader = () =>
          getElement(loaderSelector, getRemainingTimeout());
      },
    },
    error: {
      entry: async () => {
        log('Появилась ошибка', 'steelblue');
        window.germesData.betProcessingAdditionalInfo = null;

        let errorText = text(<HTMLElement>machine.data.result);

        if (errorText === '') {
          log('Текст ошибки пустой. Ждём появления', 'orange');
          errorText = await awaiter(() =>
            text(<HTMLElement>machine.data.result)
          );
          if (!errorText) {
            const message = 'Не появился текст ошибки принятия ставки';
            log(message, 'crimson');
            sendErrorMessage(message);
            betProcessingError(machine);
            return;
          }
        }

        log(errorText, 'tomato');

        const acceptButton = document.querySelector('.bs-AcceptButton');

        const accountRestrictedRegex =
          /Certain restrictions may be applied to your account. If you have an account balance you can request to withdraw these funds now by going to the Withdrawal page in Members./i;
        const accountStep2Regex =
          /In accordance with licensing conditions we are required to verify your age and identity. Certain restrictions may be applied to your account until we are able to verify your details. Please go to the Know Your Customer page in Members and provide the requested information./i;
        const accountSurveyRegex =
          /As part of the ongoing management of your account we need you to answer a set of questions relating to Responsible Gambling. Certain restrictions may be applied to your account until you have successfully completed this. You can answer these questions now by going to the Self-Assessment page in Members./i;
        const oddsChangedRegex =
          /The line, odds or availability of your selections has changed.|The line, odds or availability of selections on your betslip has changed. Please review your betslip|La linea, le quote o la disponibilità delle tue selezioni è cambiata./i;

        const newMaximumErrorRegex =
          /^Stake\/risk entered on selection .* is above the available maximum of .*?(\d+\.\d+).*?$/i;
        const newMaximumShortErrorRegex = /^Max Stake .*?(\d+\.\d+).*?$/i;
        const unknownMaximumErrorRegex =
          /^Your stake exceeds the maximum allowed$/i;

        const pleaseEnterAStakeErrorRegex = /^Please enter a stake$/i;

        if (accountRestrictedRegex.test(errorText)) {
          accountRestricted();
          betProcessingError(machine);
          return;
        }
        if (accountStep2Regex.test(errorText)) {
          accountStep2();
          betProcessingError(machine);
          return;
        }
        if (accountSurveyRegex.test(errorText)) {
          accountSurvey();
          betProcessingError(machine);
          return;
        }
        if (oddsChangedRegex.test(errorText)) {
          const suspendedStake = document.querySelector(
            '.bss-NormalBetItem.bss-NormalBetItem_Suspended'
          );
          if (suspendedStake) {
            log('Ставка недоступна', 'crimson');
            betProcessingError(machine);
            return;
          }
          log('Изменение котировок', 'crimson');
          if (!acceptButton) {
            log('Не найдена кнопка принятия изменений', 'crimson');
          } else {
            log('Принимаем изменения', 'orange');
            acceptChanges();
            const acceptButtonDisappeared = await awaiter(
              () => !document.querySelector(acceptButtonSelector)
            );
            if (!acceptButtonDisappeared) {
              log('Кнопка принятия изменений не исчезла', 'crimson');
              betProcessingError(machine);
              return;
            }
            log('Кнопка принятия изменения исчезла', 'cadetblue', true);
          }
          betProcessingError(machine);
          return;
        }
        if (
          newMaximumErrorRegex.test(errorText) ||
          newMaximumShortErrorRegex.test(errorText) ||
          unknownMaximumErrorRegex.test(errorText)
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
            acceptChanges();
          }
          betProcessingError(machine);
          return;
        }
        if (pleaseEnterAStakeErrorRegex.test(errorText)) {
          betProcessingError(machine);
          return;
        }
        log('Непонятная ошибка', 'crimson');
        sendTGBotMessage(
          '1786981726:AAE35XkwJRsuReonfh1X2b8E7k9X4vknC_s',
          126302051,
          errorText
        );
        sendErrorMessage(errorText);
        betProcessingError(machine);
      },
    },
    placeBetError: {
      entry: async () => {
        log('Появилась ошибка ставки', 'steelblue');
        window.germesData.betProcessingAdditionalInfo = null;
        const placeBetErrorText = text(machine.data.result as HTMLElement);
        log(placeBetErrorText, 'tomato');

        const checkMyBetsRegex =
          /Please check My Bets for confirmation that your bet has been successfully placed./i;

        if (checkMyBetsRegex.test(placeBetErrorText)) {
          const dontInformCheckMyBetsError = getWorkerParameter(
            'DontInformCheckMyBetsError'
          );
          const message = 'Неизвестный результат. Check My Bets';
          log(message, 'crimson');
          if (!dontInformCheckMyBetsError) {
            sendErrorMessage(message);
          }
          betProcessingError(machine);
          return;
        }

        log('В купоне непонятная ошибка ставки', 'crimson');
        sendErrorMessage(placeBetErrorText);
        betProcessingError(machine);
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
        const message =
          'Не появилось сообщение после появления кнопки принятия изменений';
        log(message, 'crimson');
        sendErrorMessage(message);
        betProcessingError(machine);
      },
    },
    betPlaced: {
      entry: async () => {
        window.germesData.betProcessingAdditionalInfo = null;
        betProcessingCompltete(machine);
      },
    },
    timeout: {
      entry: async () => {
        window.germesData.betProcessingAdditionalInfo = undefined;
        const message = 'Не дождались результата ставки';
        log(message, 'crimson');
        sendErrorMessage(message);
        betProcessingError(machine);
      },
    },
  });

  machine.start('start');
};

const checkCouponLoading = checkCouponLoadingGenerator({
  asyncCheck,
  // disableLog: false,
});

export default checkCouponLoading;
