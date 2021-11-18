import { log, getElement } from '@kot-shrodingera-team/germes-utils';

const checkCurrentLanguage = async (): Promise<number> => {
  log('Проверка языка', 'steelblue');
  const accountIcon = document.querySelector<HTMLElement>(
    '.hm-MainHeaderMembersWide_MembersMenuIcon'
  );
  if (!accountIcon) {
    log('Ошибка проверки языка: не найдена кнопка аккаунта', 'crimson');
    return 0;
  }
  accountIcon.click();
  const accountPreferencesButton = await getElement<HTMLElement>(
    '.um-PreferencesTabButton'
  );
  if (!accountPreferencesButton) {
    log('Ошибка проверки языка: не найдена кнопка настроек', 'crimson');
    return 0;
  }
  accountPreferencesButton.click();
  const languageLabel = document.querySelector(
    '.um-MembersInfoPreferences_Language .um-PreferenceDropDown_ButtonLabel'
  ) as HTMLElement;
  if (!languageLabel) {
    log('Ошибка проверки языка: не найдено значение опции языка', 'crimson');
    return 0;
  }
  const currentLanguage = languageLabel.textContent.trim();
  if (currentLanguage === 'English') {
    accountIcon.click();
    return 1;
  }
  languageLabel.click();
  const languageOptions = [
    ...document.querySelectorAll<HTMLElement>('.um-PreferenceDropDownItem'),
  ];
  const englishLanguageOption = languageOptions.find(
    (option) => option.textContent.trim() === 'English'
  );
  if (!englishLanguageOption) {
    log(
      'Ошибка проверки языка: не найден английский язык в списке языков',
      'crimson'
    );
    return 0;
  }
  englishLanguageOption.click();
  return -1;
};

export default checkCurrentLanguage;
