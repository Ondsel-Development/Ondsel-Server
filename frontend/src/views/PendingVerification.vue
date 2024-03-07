<template>
  <v-container fluid>
    <signup-progress-bar step="1" msg="a link was sent to your email"></signup-progress-bar>
    <v-card class="mx-auto mt-8" width="22em" border flat>
      <v-card-title>Pending Verification</v-card-title>
      <v-card-text>
        <p>
          Check your email for a confirmation message.
        </p>
        <p>
          Once confirmed, your account will be active and you will be sent to the Choose Tier step.
        </p>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>

import {mapState} from "vuex";
import SignupProgressBar from "@/components/SignupProgressBar.vue";

export default {
  name: 'PendingVerification',
  components: {SignupProgressBar},
  data() {
    return {
      result: {},
    }
  },
  mounted: function () {
    window.setInterval(() => {
      close();
    }, 30000)  // close this windows after 30 seconds
  },
  computed: {
    ...mapState('auth', { loggedInUser: 'payload' }),
  },
  methods: {
  },
  watch: {
  //   async '$route'(to) {
  //     console.log(to.name);
  //     if (to.name === 'ChooseTier') {
  //       this.$router.push({name: 'LensHome'});
  //     }
  //   }
  }
}
</script>

<style scoped>

</style>
