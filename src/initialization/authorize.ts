import authorizeGenerator from '@kot-shrodingera-team/germes-generators/initialization/authorize';
import { domFullLoaded, log } from '@kot-shrodingera-team/germes-utils';
// import {
//   getElement,
//   log,
//   resolveRecaptcha,
// } from '@kot-shrodingera-team/germes-utils';
// import { authElementSelector } from '../stake_info/checkAuth';
// import { updateBalance, balanceReady } from '../stake_info/getBalance';
// import afterSuccesfulLogin from './afterSuccesfulLogin';

const preCheck = async (): Promise<boolean> => {
  log('Ожидаем загрузки DOM', 'cadetblue', true);
  await domFullLoaded();
  log('DOM загружен', 'cadetblue', true);
  return true;
};

// const preInputCheck = async (): Promise<boolean> => {
//   return true;
// };

// const beforeSubmitCheck = async (): Promise<boolean> => {
//   // const recaptchaIFrame = await getElement('iframe[title="reCAPTCHA"]', 1000);
//   // if (recaptchaIFrame) {
//   //   log('Есть капча. Пытаемся решить', 'orange');
//   //   try {
//   //     await resolveRecaptcha();
//   //   } catch (e) {
//   //     if (e instanceof Error) {
//   //       log(e.message, 'red');
//   //     }
//   //     return false;
//   //   }
//   // } else {
//   //   log('Нет капчи', 'steelblue');
//   // }
//   return true;
// };

// const afterSubmitCheck = async (): Promise<boolean> => {
//   return true;
// };

const authorize = authorizeGenerator({
  preCheck,
  openForm: {
    selector: '.hm-MainHeaderRHSLoggedOutWide_Login',
    openedSelector: '.lms-StandardLogin_Container',
    beforeOpenDelay: 5000,
    loopCount: 1,
    triesInterval: 3000,
    afterOpenDelay: 3000,
  },
  // preInputCheck,
  loginInputSelector: 'input.lms-StandardLogin_Username',
  passwordInputSelector: 'input.lms-StandardLogin_Password',
  beforePasswordInputDelay: 1000,
  submitButtonSelector: '.lms-LoginButton',
  // inputType: 'fireEvent',
  // fireEventNames: ['input'],
  beforeSubmitDelay: 2000,
  // beforeSubmitCheck,
  // afterSubmitCheck,
  // loginedWait: {
  //   loginedSelector: authElementSelector,
  //   timeout: 5000,
  //   balanceReady,
  //   updateBalance,
  //   afterSuccesfulLogin,
  // },
  // context: () => document,
});

export default authorize;
