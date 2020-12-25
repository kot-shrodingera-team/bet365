import { log, checkUrl } from '@kot-shrodingera-team/germes-utils';
import { version } from '../package.json';
import { clearMaximumStake } from './stake_info/getMaximumStake';
import showStake from './show_stake';

const fastLoad = async (): Promise<void> => {
  clearMaximumStake();
  log(`Быстрая загрузка (${version})`, 'steelblue');
  localStorage.setItem('reloadedBeforeShowStake', '0');

  if (!checkUrl()) {
    log('Открыт другой сайт. Возвращаемся на Bet365', 'steelblue');
    window.location.href = new URL('/#/IP/', worker.BookmakerMainUrl).href;
    return;
  }

  const selectedSectionElement = document.querySelector(
    '.hm-HeaderMenuItem_LinkSelected'
  );
  if (!selectedSectionElement) {
    log('Не найден текущий раздел сайта. Возвращаемся на Bet365', 'steelblue');
    window.location.href = new URL('/#/IP/', worker.BookmakerMainUrl).href;
    return;
  }
  const selectedSection = selectedSectionElement.textContent.trim();
  if (selectedSection !== 'In-Play') {
    log('Открыт другой раздел Bet365. Переходим на In-Play', 'steelblue');
    window.location.href = new URL('/#/IP/', worker.BookmakerMainUrl).href;
  }
  showStake();
};

export default fastLoad;
