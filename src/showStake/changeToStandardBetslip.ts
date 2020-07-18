import { fireEvent, getElement } from '@kot-shrodingera-team/config/util';

const changeToStandardBetslip = async (): Promise<boolean> => {
  const qbsStakeInput = document.querySelector(
    '.qbs-StakeBox_StakeInput'
  ) as HTMLElement;
  if (!qbsStakeInput) {
    worker.Helper.WriteLine('Не найдена кнопка ввода суммы в мобильном купоне');
    return false;
  }
  qbsStakeInput.click();
  const qbsAddToBetslipButton = await getElement('.qbs-AddToBetslipButton');
  if (!qbsAddToBetslipButton) {
    worker.Helper.WriteLine(
      'Не найдена кнопка переключения купона на стандартный'
    );
    return false;
  }
  fireEvent(qbsAddToBetslipButton, 'touchstart', TouchEvent);
  fireEvent(qbsAddToBetslipButton, 'touchend', TouchEvent);
  return true;
};

export default changeToStandardBetslip;
