import { log, toFormData } from '@kot-shrodingera-team/germes-utils';
import { getConfig } from '../config';

const afterSuccesfulStake = (): void => {
  const lastStakeCoefficient = document.querySelector('.bs-OddsLabel');
  if (!lastStakeCoefficient) {
    log(
      'Ошибка обновления коэффициента после успешной ставки: не найден коэффициент',
      'crimson'
    );
    return;
  }
  const resultCoefficientText = lastStakeCoefficient.textContent.trim();
  const resultCoefficient = Number(resultCoefficientText);
  if (Number.isNaN(resultCoefficient)) {
    log(
      `Ошибка обновления коэффициента после успешной ставки: непонятный формат коэффициента: "${resultCoefficientText}"`,
      'crimson'
    );
    return;
  }
  if (resultCoefficient !== worker.StakeInfo.Coef) {
    log(
      `Коеффициент изменился: ${worker.StakeInfo.Coef} => ${resultCoefficient}`,
      'orange'
    );
    worker.StakeInfo.Coef = resultCoefficient;
    return;
  }
  log('Коеффициент не изменился', 'lightblue');
  if (getConfig().includes('send_bet_id')) {
    const betReferenceElement = document.querySelector(
      '.bss-ReceiptContent_BetRef'
    );
    if (!betReferenceElement) {
      log('Не найден Bet Reference', 'crimson');
      return;
    }
    const bodyData = toFormData({
      bot_api: worker.ApiKey,
      fork_id: worker.ForkId,
      bet365_bet_id: betReferenceElement.textContent
        .replace('Bet Ref', '')
        .trim(),
    });
    fetch('https://strike.ws/bet_365_bet_ids_to_our_server.php', {
      method: 'POST',
      body: bodyData,
    });
  }
};

export default afterSuccesfulStake;
