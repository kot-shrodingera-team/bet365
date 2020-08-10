import authorizeGenerator from '@kot-shrodingera-team/germes-generators/initialization/authorize';
import afterSuccesfulLogin from './afterSuccesfulLogin';

const authorize = authorizeGenerator({
  openForm: {
    selector: '.hm-MainHeaderRHSLoggedOutWide_Login',
    openedSelector: '.lms-StandardLogin_Container',
  },
  loginInputSelector: 'input.lms-StandardLogin_Username',
  passwordInputSelector: 'input.lms-StandardLogin_Password',
  submitButtonSelector: '.lms-StandardLogin_LoginButtonText',
  afterSuccesfulLogin,
});

export default authorize;
