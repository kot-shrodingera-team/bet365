import checkAuthGenerator, {
  authStateReadyGenerator,
} from '@kot-shrodingera-team/germes-generators/stake_info/checkAuth';
import { getWorkerParameter, log } from '@kot-shrodingera-team/germes-utils';

export const noAuthElementSelector = '.hm-MainHeaderRHSLoggedOutWide_Login';
export const authElementSelector = '.hm-MainHeaderMembersWide';

export const authStateReady = authStateReadyGenerator({
  noAuthElementSelector,
  authElementSelector,
  // maxDelayAfterNoAuthElementAppeared: 0,
  // context: () => document,
});

// const checkAuth = checkAuthGenerator({
//   authElementSelector,
//   // context: () => document,
// });

const checkAuth = (): boolean => {
  if (getWorkerParameter('fakeAuth')) {
    return true;
  }
  const authElement = document.querySelector(authElementSelector);
  const loginForm = document.querySelector('.lms-StandardLogin_Container');
  if (loginForm) {
    log('Есть форма логина', 'orange');
    return false;
  }
  return Boolean(authElement);
};

export default checkAuth;
