import { log } from '@kot-shrodingera-team/germes-utils';

// type TeamNames = { teamOne: string; teamTwo: string };

const getCurrentEventName = (): string => {
  const eventNameElement = document.querySelector(
    '.lbs-NormalBetItem_FixtureDescription'
  );
  if (!eventNameElement) {
    log(
      'Ошибка получения заголовка события: не найден заголовок события',
      'crimson'
    );
    return null;
  }
  return eventNameElement.textContent.trim();
};

export default getCurrentEventName;
