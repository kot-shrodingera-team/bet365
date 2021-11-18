import { log, getElement } from '@kot-shrodingera-team/germes-utils';

const expandAllMarkets = async (): Promise<void> => {
  // const marketHeaderButtons = [
  //   ...gameElement.querySelectorAll<HTMLElement>('.bet-title.min'),
  // ];
  // // eslint-disable-next-line no-restricted-syntax
  // for (const button of marketHeaderButtons) {
  //   button.click();
  //   // eslint-disable-next-line no-await-in-loop
  //   await sleep(0);
  // }
  const expandAllButton = await getElement<HTMLElement>(
    'button.scoreboard-nav__view-item'
  );
  if (!expandAllButton) {
    log('Не найдена кнопка разворачивания всех маркетов', 'steelblue');
    return;
  }
  if (expandAllButton.classList.contains('scoreboard-nav__btn--is-active')) {
    log('Разворачиваем все маркеты', 'orange');
    expandAllButton.click();
  } else {
    log('Маркеты уже развёрнуты', 'steelblue');
  }
};

export default expandAllMarkets;
