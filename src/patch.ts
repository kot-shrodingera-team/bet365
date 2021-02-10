window.chrome.runtime = {
  connect: () => ({
    onDisconnect: {
      addListener: (ls: () => void) => {
        ls();
      },
    },
  }),
};
