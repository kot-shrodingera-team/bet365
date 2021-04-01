// import getCoefficientGenerator from '@kot-shrodingera-team/germes-generators/stake_info/getCoefficient';
import {
  getWorkerParameter,
  log,
  toFormData,
} from '@kot-shrodingera-team/germes-utils';
import getCoefficient from '../stake_info/getCoefficient';

// const getResultCoefficientText = (): string => {
//   return null;
// };

// const getResultCoefficient = getCoefficientGenerator({
//   coefficientSelector: '',
//   getCoefficientText: getResultCoefficientText,
//   replaceDataArray: [
//     {
//       searchValue: '',
//       replaceValue: '',
//     },
//   ],
//   removeRegex: /[\s,']/g,
//   coefficientRegex: /(\d+(?:\.\d+)?)/,
//   context: () => document,
// });

const getResultCoefficient = getCoefficient;

const afterSuccesfulStake = (): void => {
  log('Обновление итогового коэффициента', 'steelblue');
  const resultCoefficient = getResultCoefficient();
  if (resultCoefficient && resultCoefficient !== worker.StakeInfo.Coef) {
    log(
      `Коеффициент изменился: ${worker.StakeInfo.Coef} => ${resultCoefficient}`,
      'orange'
    );
    worker.StakeInfo.Coef = resultCoefficient;
    return;
  }
  log('Коеффициент не изменился', 'lightblue');
  if (getWorkerParameter('sendBetRef')) {
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
