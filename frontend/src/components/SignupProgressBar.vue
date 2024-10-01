<template>
  <v-card class="mb-2" flat>
    <v-timeline v-if="showProgressBar" direction="horizontal" class="overflow-y-auto" border>

      <v-timeline-item :dot-color="itemDotColor[0]">
        <v-card-title :class="itemTitleClass[0]">Sign Up</v-card-title>
        <v-card-subtitle>{{itemSubtitle[0]}}</v-card-subtitle>
      </v-timeline-item>

      <v-timeline-item :dot-color="itemDotColor[1]">
        <v-card-title :class="itemTitleClass[1]">Verify Email</v-card-title>
        <v-card-subtitle>{{itemSubtitle[1]}}</v-card-subtitle>
      </v-timeline-item>

      <v-timeline-item :dot-color="itemDotColor[2]">
        <v-card-title :class="itemTitleClass[2]">Download / Explore</v-card-title>
        <v-card-subtitle>{{itemSubtitle[2]}}</v-card-subtitle>
      </v-timeline-item>
    </v-timeline>
  </v-card>
</template>

<script>
export default {
  name: 'SignupProgressBar',
  props: {
    step: {
      Type: Number,
      default: 0,
    },
    msg: {
      Type: String,
      default: '',
    },
  },
  data() {
    return {
      showProgressBar: false,
      itemDotColor: ['white', 'white', 'white'],
      itemSubtitle: ['', '', ''],
      itemTitleClass: ['', '', ''],
      messageToDisplay: '',
    }
  },
  computed: {
  },
  async created() {
    this.messageToDisplay = this.msg;
    await this.updateElements();
  },
  methods: {
    async updateElements() {
      let step = parseInt(this.step);
      if (step < 2) {
        this.showProgressBar = true;
      } else {
        this.showProgressBar = this.$route.query.psu;
      }
      for (let i = 0; i < 3; i++) {
        if (i < step) {
          this.itemDotColor[i] = 'green';
          this.itemSubtitle[i] = '';
          this.itemTitleClass[i] = 'text-disabled';
        } else if (i === step) {
          this.itemDotColor[i] = 'orange';
          this.itemSubtitle[i] = this.messageToDisplay;
          this.itemTitleClass[i] = 'text-high-emphasis';
        } else {
          this.itemDotColor[i] = 'dark-grey';
          this.itemSubtitle[i] = '';
          this.itemTitleClass[i] = 'text-medium-emphasis';
        }
      }
    }
  },
  watch: {
    async messageToDisplay(to, from) {
      await this.updateElements();
    }
  }

}
</script>

<style scoped>

</style>

