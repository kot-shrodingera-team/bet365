import { getWorkerParameter, log } from '@kot-shrodingera-team/germes-utils';
import {
  JsFailError,
  NewUrlError,
} from '@kot-shrodingera-team/germes-utils/errors';
import { clearGermesData } from '../bookmakerApi';
import openBet from './openBet';
import openEvent from './openEvent';
import preOpenBet from './preOpenBet';
import preOpenEvent from './preOpenEvent';
import setBetAcceptMode from './setBetAcceptMode';

const showStake = async (): Promise<void> => {
  if (getWorkerParameter('fakeOpenStake')) {
    log('[fake] Ставка открыта', 'green');
    worker.JSStop();
    return;
  }
  localStorage.setItem('couponOpening', '1');
  clearGermesData();
  try {
    log(
      `Открываем ставку:\n${worker.TeamOne} vs ${worker.TeamTwo}\n${worker.BetName}`,
      'steelblue'
    );
    await preOpenEvent();
    await openEvent();
    await preOpenBet();
    await openBet();
    await setBetAcceptMode();
    log('Ставка успешно открыта', 'green');
    localStorage.setItem('couponOpening', '0');
    worker.JSStop();
  } catch (error) {
    if (error instanceof JsFailError) {
      log(error.message, 'red');
      localStorage.setItem('couponOpening', '0');
      worker.JSFail();
    } else if (error instanceof NewUrlError) {
      log(error.message, 'orange');
    } else {
      // Любая другая ошибка
      log(
        'Скрипт вызвал исключение. Если часто повторяется, обратитесь в ТП',
        'red'
      );
      log(error.message, 'red');
      localStorage.setItem('couponOpening', '0');
      worker.JSFail();
      throw error;
    }
  }
};

export default showStake;
