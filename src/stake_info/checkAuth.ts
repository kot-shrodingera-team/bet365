import checkAuthGenerator, {
  authStateReadyGenerator,
} from '@kot-shrodingera-team/germes-generators/stake_info/checkAuth';

export const authCheckReady = authStateReadyGenerator({
  noAuthElementSelector: '.hm-MainHeaderRHSLoggedOutWide_Login',
  authElementSelector: '.hm-MainHeaderMembersWide',
});

const checkAuth = checkAuthGenerator({
  authElementSelector: '.hm-MainHeaderMembersWide',
});

export default checkAuth;
