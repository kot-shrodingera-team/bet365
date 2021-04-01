import { log } from '@kot-shrodingera-team/germes-utils';
import getBalance from './getBalance';

export const setMaximumStake = (newMaximumStake: number): void => {
  window.germesData.maximumStake = newMaximumStake;
};
export const clearMaximumStake = (): void => {
  window.germesData.maximumStake = undefined;
};

export const updateMaximumStake = (): boolean => {
  const betErrorMessageElement = document.querySelector(
    '.bss-Footer_MessageBody'
  );
  if (betErrorMessageElement) {
    const betErrorMessage = betErrorMessageElement.textContent.trim();
    const maxErrorMatch = betErrorMessage.match(
      /^Stake\/risk entered on selection .* is above the available maximum of .*?(\d+\.\d+)\.$/i
    );
    if (maxErrorMatch) {
      log(`Обновлена максимальная ставка: "${maxErrorMatch[1]}"`, 'orange');
      window.germesData.maximumStake = Number(maxErrorMatch[1]);
      return true;
    }
    const newMaxError = /^Your stake exceeds the maximum allowed$/.test(
      betErrorMessage
    );
    if (newMaxError) {
      const newMaxStakeValueElement = document.querySelector(
        '.bss-NormalBetItem_MessageBody'
      );
      if (!newMaxStakeValueElement) {
        log('Есть ошибка о максе (новая), но нет самого макса', 'crimson');
        window.germesData.maximumStake = 0;
        return true;
      }
      const newMaxStakeValueText = newMaxStakeValueElement.textContent.trim();
      const newMaxErrorMatch = newMaxStakeValueText.match(
        /^Max Stake .*?(\d+\.\d+)$/i
      );
      if (!newMaxErrorMatch) {
        log(
          `Есть ошибка о максе (новая), но не понятен формат самого макса: "${newMaxStakeValueText}"`,
          'crimson'
        );
        window.germesData.maximumStake = 0;
        return true;
      }
      log(`Обновлена максимальная ставка: "${newMaxErrorMatch[1]}"`, 'orange');
      window.germesData.maximumStake = Number(newMaxErrorMatch[1]);
      return true;
    }
  }
  return false;
};

const getMaximumStake = (): number => {
  if (window.germesData.maximumStake !== undefined) {
    return window.germesData.maximumStake;
  }
  return getBalance();
};

export default getMaximumStake;
