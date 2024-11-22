// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

export default {
  data: () => ({
    blurListener: null,
    checkingOndselEsIsInstalled: false,
  }),
  methods: {
    openModelInOndselEs(url) {
      this.checkingOndselEsIsInstalled = true;
      const timeoutDuration = 1500; // Time to wait to check if app opened
      let isAppOpened = false;

      // Create an iframe to attempt opening the app
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = url;
      document.body.appendChild(iframe);

      this.blurListener = () => {
        isAppOpened = true;
      }

      // Start timeout to check if the app opened
      setTimeout(() => {
        this.checkingOndselEsIsInstalled = false;
        if (!isAppOpened) {
          // if app not installed
        }
        document.body.removeChild(iframe);
        if (this.blurListener) {
          window.removeEventListener('blur', this.blurListener);
        }
      }, timeoutDuration);

      // Track whether the user accepted to open the app
      window.addEventListener('blur', this.blurListener);
    },
  },
}
