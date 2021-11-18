import { JsFailError } from '@kot-shrodingera-team/germes-utils/errors';

const acceptChanges = (): void => {
  const acceptButton = document.querySelector('.bs-AcceptButton');
  if (acceptButton) {
    try {
      BetSlipLocator.betSlipManager.betslip.activeModule.slip.footer.model.acceptChanges();
    } catch (e) {
      throw new JsFailError(`Ошибка принятия изменений: ${e.message}`);
    }
  }
};

export default acceptChanges;
