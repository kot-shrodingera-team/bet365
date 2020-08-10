import { getElement, fireEvent, log } from '@kot-shrodingera-team/germes-utils';

const changeToStandardBetslip = async (): Promise<boolean> => {
  const qbsStakeInput = document.querySelector(
    '.qbs-StakeBox_StakeInput'
  ) as HTMLElement;
  if (!qbsStakeInput) {
    log('Не найдена кнопка ввода суммы в мобильном купоне', 'crimson');
    return false;
  }
  qbsStakeInput.click();
  const qbsAddToBetslipButton = await getElement('.qbs-AddToBetslipButton');
  if (!qbsAddToBetslipButton) {
    log('Не найдена кнопка переключения купона на стандартный', 'crimson');
    return false;
  }
  fireEvent(qbsAddToBetslipButton, 'touchstart', TouchEvent);
  fireEvent(qbsAddToBetslipButton, 'touchend', TouchEvent);
  return true;
};

export default changeToStandardBetslip;
