import { memberHeaderSelector } from '../selectors';

const checkLogin = (): boolean => {
  return Boolean(document.querySelector(memberHeaderSelector));
};

export default checkLogin;
