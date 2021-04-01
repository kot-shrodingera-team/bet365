import { log } from '@kot-shrodingera-team/germes-utils';

export const enum CouponError {
  NoError,
  Unknown,
  AccountRestricted,
  AccountStep2,
  AccounSurvey,
  OddsChanged,
  NewMaximum,
  NewMaximumShort,
  UnknownMaximum,
}

const accountRestrictedRegex = /Certain restrictions may be applied to your account. If you have an account balance you can request to withdraw these funds now by going to the Withdrawal page in Members./i;
const accountStep2Regex = /In accordance with licensing conditions we are required to verify your age and identity. Certain restrictions may be applied to your account until we are able to verify your details. Please go to the Know Your Customer page in Members and provide the requested information./i;
const accountSurveyRegex = /As part of the ongoing management of your account we need you to answer a set of questions relating to Responsible Gambling. Certain restrictions may be applied to your account until you have successfully completed this. You can answer these questions now by going to the Self-Assessment page in Members./i;
const oddsChangedRegex = /The line, odds or availability of your selections has changed./i;

const newMaximumErrorRegex = /^Stake\/risk entered on selection .* is above the available maximum of .*?(\d+\.\d+)\.$/i;
const newMaximumShortErrorRegex = /^Max Stake .*?(\d+\.\d+)$/i;
const unknownMaximumErrorRegex = /^Your stake exceeds the maximum allowed$/i;

const getCouponError = (): CouponError => {
  const errorMessageElement = document.querySelector('.bss-Footer_MessageBody');
  if (!errorMessageElement) {
    return CouponError.NoError;
  }
  const betErrorMessage = errorMessageElement.textContent.trim();

  if (accountRestrictedRegex.test(betErrorMessage)) {
    return CouponError.AccountRestricted;
  }
  if (accountStep2Regex.test(betErrorMessage)) {
    return CouponError.AccountStep2;
  }
  if (accountSurveyRegex.test(betErrorMessage)) {
    return CouponError.AccounSurvey;
  }
  if (oddsChangedRegex.test(betErrorMessage)) {
    return CouponError.OddsChanged;
  }

  const newMaximumMatch = betErrorMessage.match(newMaximumErrorRegex);
  if (newMaximumMatch) {
    return CouponError.NewMaximum;
  }
  const newMaximumShortMatch = betErrorMessage.match(newMaximumShortErrorRegex);
  if (newMaximumShortMatch) {
    return CouponError.NewMaximumShort;
  }
  const unknownMaximumMatch = betErrorMessage.match(unknownMaximumErrorRegex);
  if (unknownMaximumMatch) {
    return CouponError.UnknownMaximum;
  }

  return CouponError.Unknown;
};

export const getCouponErrorText = (): string => {
  const errorMessageElement = document.querySelector('.bss-Footer_MessageBody');
  if (!errorMessageElement) {
    return null;
  }
  return errorMessageElement.textContent.trim();
};

export const updateMaximumStake = (): void => {
  const errorMessageElement = document.querySelector('.bss-Footer_MessageBody');
  if (!errorMessageElement) {
    log('Не найдена ошибка максимума в купоне', 'crimson');
    return;
  }
  const betErrorMessage = errorMessageElement.textContent.trim();

  const newMaximumMatch = betErrorMessage.match(newMaximumErrorRegex);
  if (newMaximumMatch) {
    const newMaximum = Number(newMaximumMatch[1]);
    log(`Новый максимум: "${newMaximum}"`, 'orange');
    window.germesData.maximumStake = newMaximum;
    return;
  }
  const newMaximumShortMatch = betErrorMessage.match(newMaximumShortErrorRegex);
  if (newMaximumShortMatch) {
    const newMaximum = Number(newMaximumShortMatch[1]);
    log(`Новый максимум: "${newMaximum}"`, 'orange');
    window.germesData.maximumStake = newMaximum;
    return;
  }
  const unknownMaximumMatch = betErrorMessage.match(unknownMaximumErrorRegex);
  if (unknownMaximumMatch) {
    log('Неизвестный максимум', 'orange');
    window.germesData.maximumStake = 0;
  }
  log('Неизвестный максимум', 'orange');
  window.germesData.maximumStake = 0;
};

export default getCouponError;
