import getStakeInfoValueGenerator, {
  stakeInfoValueReadyGenerator,
} from '@kot-shrodingera-team/germes-generators/stake_info/getStakeInfoValue';
import { StakeInfoValueOptions } from '@kot-shrodingera-team/germes-generators/stake_info/types';
import { log } from '@kot-shrodingera-team/germes-utils';
import getBalance from './getBalance';

// export const maximumStakeSelector = '';

const maximumStakeOptions: StakeInfoValueOptions = {
  name: 'maximumStake',
  fixedValue: () => getBalance(),
  // valueFromText: {
  //   text: {
  //     // getText: () => '',
  //     selector: maximumStakeSelector,
  //     context: () => document,
  //   },
  //   replaceDataArray: [
  //     {
  //       searchValue: '',
  //       replaceValue: '',
  //     },
  //   ],
  //   removeRegex: /[\s,']/g,
  //   matchRegex: /(\d+(?:\.\d+)?)/,
  //   errorValue: 0,
  // },
  // zeroValues: [],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // modifyValue: (value: number, extractType: string) => value,
  // disableLog: false,
};

const getMaximumStake = getStakeInfoValueGenerator(maximumStakeOptions);

export const maximumStakeReady =
  stakeInfoValueReadyGenerator(maximumStakeOptions);

export const updateMaximumStake = (): void => {
  const newMaximumErrorRegex =
    /^Stake\/risk entered on selection .* is above the available maximum of .*?(\d+\.\d+).*?$/i;
  const newMaximumShortErrorRegex = /^Max Stake .*?(\d+\.\d+).*?$/i;
  const unknownMaximumErrorRegex = /^Your stake exceeds the maximum allowed$/i;

  const errorMessageElement = document.querySelector(
    '.bss-Footer_MessageBody, .bsi-FooterIT_MessageBody'
  );
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
    log('Нет максимума в тексте ошибки', 'steelblue');
    const maximumMessageElement = document.querySelector(
      '.bss-NormalBetItem_MessageBody'
    );
    if (!maximumMessageElement) {
      log(
        'Нет ни максимума в тексте ошибки, ни отдельного элемента с максимумом',
        'crimson'
      );
      window.germesData.maximumStake = 0;
      return;
    }
    log('Есть отдельный элемент с максимумом', 'steelblue');
    const maximumMessage = maximumMessageElement.textContent.trim();

    log(maximumMessage, 'tomato');

    const maximumMath = maximumMessage.match(newMaximumShortErrorRegex);

    if (maximumMath) {
      const newMaximum = Number(maximumMath[1]);
      log(`Новый максимум: "${newMaximum}"`, 'orange');
      window.germesData.maximumStake = newMaximum;
      return;
    }
    log(
      `Не удалось получить максимум из сообщения: "${maximumMessage}"`,
      'crimson'
    );
    window.germesData.maximumStake = 0;
    return;
  }
  log('Неизвестный максимум', 'crimson');
  window.germesData.maximumStake = 0;
};

export default getMaximumStake;
