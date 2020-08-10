import { log, getElement } from '@kot-shrodingera-team/germes-utils';

const checkCurrentLanguage = async (): Promise<boolean> => {
  log('Проверка языка', 'steelblue');
  const accountIcon = document.querySelector(
    '.hm-MainHeaderMembersWide_MembersMenuIcon'
  ) as HTMLElement;
  if (!accountIcon) {
    log('Ошибка проверки языка: не найдена кнопка аккаунта', 'crimson');
    return false;
  }
  accountIcon.click();
  const accountPreferencesButton = (await getElement(
    '.um-PreferencesTabButton'
  )) as HTMLElement;
  if (!accountPreferencesButton) {
    log('Ошибка проверки языка: не найдена кнопка настроек', 'crimson');
    return false;
  }
  accountPreferencesButton.click();
  const languageLabel = document.querySelector(
    '.um-MembersInfoPreferences_Language .um-PreferenceDropDown_ButtonLabel'
  ) as HTMLElement;
  if (!languageLabel) {
    log('Ошибка проверки языка: не найдено значение опции языка', 'crimson');
    return false;
  }
  const currentLanguage = languageLabel.textContent.trim();
  if (currentLanguage === 'English') {
    accountIcon.click();
    return true;
  }
  languageLabel.click();
  const languageOptions = [
    ...document.querySelectorAll('.um-PreferenceDropDownContainer_ItemLabel'),
  ] as HTMLElement[];
  const englishLanguageOption = languageOptions.find(
    (option) => option.textContent.trim() === 'English'
  );
  if (!englishLanguageOption) {
    log(
      'Ошибка проверки языка: не найден английский язык в списке языков',
      'crimson'
    );
    return false;
  }
  englishLanguageOption.click();
  return true;
};

export default checkCurrentLanguage;
