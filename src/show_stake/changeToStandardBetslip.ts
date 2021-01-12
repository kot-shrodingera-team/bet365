import { getElement, log, awaiter } from '@kot-shrodingera-team/germes-utils';
import getStakeCount from '../stake_info/getStakeCount';

const changeToStandardBetslip = async (): Promise<boolean> => {
  const anyBet = document.querySelector(
    '.ovm-ParticipantOddsOnly:not(.ovm-ParticipantOddsOnly_Highlighted)'
  ) as HTMLElement;
  if (!anyBet) {
    log('Не найдена любая ставка', 'crimson', true);
    return false;
  }
  anyBet.click();
  const minibizedBetslip = (await getElement(
    '.bss-BetslipStandardModule_Minimised .bss-DefaultContent'
  )) as HTMLElement;
  if (!minibizedBetslip) {
    log('Не найден свернутый купон', 'crimson', true);
    return false;
  }
  log('Разворачиваем свёрнутый купон', 'orange', true);
  minibizedBetslip.click();
  const expandedBetslip = await getElement(
    '.bss-BetslipStandardModule_Expanded'
  );
  if (!expandedBetslip) {
    log('Не найден развёрнутый купон', 'crimson', true);
    return false;
  }
  await awaiter(() => {
    return document.querySelectorAll('.bss-NormalBetItem_Remove').length === 2;
  });
  const deleteButtons = document.querySelectorAll(
    '.bss-NormalBetItem_Remove'
  ) as NodeListOf<HTMLElement>;
  if (deleteButtons.length !== 2) {
    log(
      `В купоне не 2 кнопки удаления ставки (${deleteButtons.length})`,
      'crimson',
      true
    );
    return false;
  }
  log('Удаляем вторую ставку', 'orange', true);
  deleteButtons[1].click();
  const betDeleted = await awaiter(() => {
    return getStakeCount() === 1;
  });
  if (!betDeleted) {
    log('Не дождались появления 1 ставки в купоне', 'crimson', true);
    return false;
  }
  return true;
};

export default changeToStandardBetslip;
