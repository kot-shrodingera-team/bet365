import { sleep } from '@kot-shrodingera-team/config/util';
import {
  accountIconSelector,
  accountPreferencesButtonSelector,
  languageLabelSelector,
  languageOption,
} from './selectors';

const checkCurrentLanguage = async (): Promise<boolean> => {
  worker.Helper.WriteLine('Проверка языка');
  const accountIcon = document.querySelector(
    accountIconSelector
  ) as HTMLElement;
  if (!accountIcon) {
    worker.Helper.WriteLine(
      'Ошибка проверки языка: Не найдена кнопка аккаунта'
    );
    return false;
  }
  accountIcon.click();
  await sleep(0); // костыль
  const accountPreferencesButton = document.querySelector(
    accountPreferencesButtonSelector
  ) as HTMLElement;
  if (!accountPreferencesButton) {
    worker.Helper.WriteLine(
      'Ошибка проверки языка: Не найдена кнопка Preferences (шестерёнка)'
    );
    return false;
  }
  accountPreferencesButton.click();
  const languageLabel = document.querySelector(
    languageLabelSelector
  ) as HTMLElement;
  if (!languageLabel) {
    worker.Helper.WriteLine(
      'Ошибка проверки языка: Не найдено значение опции языка'
    );
    return false;
  }
  const currentLanguage = languageLabel.textContent;
  if (currentLanguage === 'English') {
    accountIcon.click();
    return true;
  }
  languageLabel.click();
  const languageOptions = [
    ...document.querySelectorAll(languageOption),
  ] as HTMLElement[];
  const englishLanguageOption = languageOptions.find(
    (option) => option.textContent === 'English'
  );
  if (!englishLanguageOption) {
    worker.Helper.WriteLine(
      'Ошибка проверки языка: Не найден английский язык в списке языков'
    );
    return false;
  }
  englishLanguageOption.click();
  return true;
};

export default checkCurrentLanguage;
