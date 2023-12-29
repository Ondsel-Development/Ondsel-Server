export default {
  data: () => ({
    loading: false,
    scrollListener: null,
  }),
  methods: {
    setupScrollListener() {
      this.scrollListener = async () => {
        if (this.loading) {
          return;
        }

        if (document.documentElement.scrollHeight <= window.scrollY + window.innerHeight + 1) {
          this.loading = true;
          await this.fetchDataOnScroll();
          this.loading = false;
        }
      };
      window.addEventListener('scroll', this.scrollListener);
    },

    removeScrollListener() {
      if (this.scrollListener) {
        window.removeEventListener('scroll', this.scrollListener);
      }
    }
  },
}
