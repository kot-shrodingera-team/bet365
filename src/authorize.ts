import { getElement, awaiter } from '@kot-shrodingera-team/config/util';
import {
  memberHeaderSelector,
  logInModalButtonSelector,
  loginInputSelector,
  passwordInputSelector,
  logInButtonSelector,
  memberBalanceSelector,
} from './selectors';
import { checkCashOutEnabled, accountLimited } from './accountChecks';
import checkLogin from './stakeInfo/checkLogin';
import updateBalance from './stakeInfo/updateBalance';

const authorize = async (): Promise<void> => {
  worker.Helper.WriteLine('Проверка авторизации');
  await Promise.race([
    getElement(memberHeaderSelector, 10000),
    getElement(logInModalButtonSelector, 10000),
  ]);

  const logInModalButton = document.querySelector(
    logInModalButtonSelector
  ) as HTMLElement;
  if (logInModalButton) {
    worker.Helper.WriteLine('Авторизации нет. Авторизуемся');
    logInModalButton.click();

    const loginInput = (await getElement(
      loginInputSelector
    )) as HTMLInputElement;
    if (!loginInput) {
      worker.Helper.WriteLine(
        'Ошибка авторизации: Не найдено поле ввода логина'
      );
      worker.Islogin = false;
      worker.JSLogined();
      return;
    }

    const passwordInput = (await getElement(
      passwordInputSelector
    )) as HTMLInputElement;
    if (!passwordInput) {
      worker.Helper.WriteLine(
        'Ошибка авторизации: Не найдено поле ввода пароля'
      );
      worker.Islogin = false;
      worker.JSLogined();
      return;
    }

    const logInButton = (await getElement(logInButtonSelector)) as HTMLElement;
    if (!logInButton) {
      worker.Helper.WriteLine('Ошибка авторизации: Не найдена кнопка Log In');
      worker.Islogin = false;
      worker.JSLogined();
      return;
    }

    loginInput.value = worker.Login;
    // input ивенты не нужны с новым дизайном
    // fireEvent(loginInput, 'input');
    passwordInput.value = worker.Password;
    // fireEvent(passwordInput, 'input');
    logInButton.click();
    return;
  }
  if (checkLogin()) {
    worker.Helper.WriteLine('Уже авторизованы');
    worker.Islogin = true;
    worker.JSLogined();
    const memberBalance = await getElement(memberBalanceSelector);
    if (memberBalance) {
      await awaiter(() => memberBalance.textContent.length !== 0);
      console.log(memberBalance);
      console.log(memberBalance.textContent);
      updateBalance();
    } else {
      worker.Helper.WriteLine('Не удалось получить баланс');
    }
    const cashOutEnabled = await checkCashOutEnabled(10000);
    if (cashOutEnabled === 0) {
      worker.Helper.WriteLine('Не удалось определить порезку аккаунта');
      // if (!cashOutWaiterReloaded) {
      //     cashOutWaiterReloaded = true;
      //     worker.Helper.LoadUrl(window.location.href);
      // }
      return;
    }
    if (cashOutEnabled === -1) {
      accountLimited();
    }
    return;
  }
  worker.Helper.WriteLine(
    'Ошибка авторизации: Не найдено ни меню аккаунта, ни кнопка Log In'
  );
  worker.Islogin = false;
  worker.JSLogined();
};

export default authorize;
