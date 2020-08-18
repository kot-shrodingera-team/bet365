import { log, checkUrl } from '@kot-shrodingera-team/germes-utils';
import { version } from '../package.json';
import { clearMaximumStake } from './stake_info/getMaximumStake';
import showStake from './show_stake';

const fastLoad = async (): Promise<void> => {
  clearMaximumStake();
  log(`Быстрая загрузка (${version})`, 'steelblue');

  if (!document.querySelector('.ip-ControlBar_ButtonBar')) {
    if (checkUrl()) {
      log('Открыта другая страница Bet365. Переходим на In-Play', 'steelblue');
      window.location.href = new URL('/#/IP/', worker.BookmakerMainUrl).href;
    } else {
      log('Открыт другой сайт. Возвращаемся на Bet365', 'steelblue');
      window.location.href = new URL('/#/IP/', worker.BookmakerMainUrl).href;
      return;
    }
  }
  showStake();
};

export default fastLoad;
