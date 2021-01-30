/* eslint-disable no-underscore-dangle */
window._xx = {
  onDisconnect: {
    addListener: (ls) => {
      setTimeout(() => {
        ls();
      }, 1);
    },
  },
};

window.chrome = {
  runtime: {
    connect: () => {
      return window._xx;
    },
  },
};
