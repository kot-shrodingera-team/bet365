type teamNames = { teamOne: string; teamTwo: string };

const getCurrentEventName = (): string => {
  const eventNameElement = document.querySelector(
    '.bss-NormalBetItem_FixtureDescription'
  );
  if (!eventNameElement) {
    console.log(
      'Ошибка получения заголовка события: Не найден заголовок события'
    );
    return null;
  }
  return eventNameElement.textContent;
};

export default getCurrentEventName;
