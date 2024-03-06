<template>
  <v-card class="mb-2">
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
        <v-card-title :class="itemTitleClass[2]">Choose Tier</v-card-title>
        <v-card-subtitle>{{itemSubtitle[2]}}</v-card-subtitle>
      </v-timeline-item>

      <v-timeline-item :dot-color="itemDotColor[3]">
        <v-card-title :class="itemTitleClass[3]">Download / Explore</v-card-title>
        <v-card-subtitle>{{itemSubtitle[3]}}</v-card-subtitle>
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
      itemDotColor: ['white', 'white', 'white', 'white'],
      itemSubtitle: ['', '', '', ''],
      itemTitleClass: ['', '', '', ''],
    }
  },
  computed: {
  },
  async created() {
    let step = parseInt(this.step);
    if (step < 2) {
      this.showProgressBar = true;
    } else {
      this.showProgressBar = this.$route.query.psu;
    }
    for (let i = 0; i < 4; i++) {
      if (i < step) {
        this.itemDotColor[i] = 'green';
        this.itemSubtitle[i] = '';
        this.itemTitleClass[i] = 'text-disabled';
      } else if (i === step) {
        this.itemDotColor[i] = 'orange';
        this.itemSubtitle[i] = this.msg;
        this.itemTitleClass[i] = 'text-high-emphasis';
      } else {
        this.itemDotColor[i] = 'dark-grey';
        this.itemSubtitle[i] = '';
        this.itemTitleClass[i] = 'text-medium-emphasis';
      }
    }
  },
  methods: {
  }
}
</script>

<style scoped>

</style>

