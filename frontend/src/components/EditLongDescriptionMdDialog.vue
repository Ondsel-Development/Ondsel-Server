<template>
  <v-dialog
    v-if="dialog"
    v-model="dialog"
    width="auto"
  >
    <v-card width="600" max-height="800">
      <template v-slot:title>
        <div class="text-center">Edit Long Description (Markdown)</div>
      </template>
      <v-progress-linear
        :active="isPatchPending"
        indeterminate
        absolute
        bottom
      ></v-progress-linear>
      <v-form ref="editLongDescriptionMdDialogForm" @submit.prevent="isPatchPending">
        <v-card-text>
          <p>Enter a longer description. You can use Markdown formatting and multiple lines. Limited to 4096 characters.</p>
          <v-textarea
            counter
            flat
            size="4096"
            v-model="newLongDescriptionMd"
          ></v-textarea>
        </v-card-text>
      </v-form>
      <v-snackbar
        :timeout="2000"
        v-model="showSnacker"
      >
        {{ snackerMsg }}
      </v-snackbar>
      <v-card-actions class="justify-center">
        <v-btn @click="dialog = false">Cancel</v-btn>
        <v-btn @click="doSaveLongDescriptionMd()" color="primary" :disabled="isPatchPending">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>

export default {
  name: 'EditLongDescriptionMdDialog',
  props: {
    longDescriptionMd: {
      Type: Text,
      default: '',
    }
  },
  emits: ['saveLongDescriptionMd'],
  created() {
    this.newLongDescriptionMd = this.longDescriptionMd;
  },
  data: () => ({
    dialog: false,
    snackerMsg: '',
    showSnacker: false,
    newLongDescriptionMd: '',
    isPatchPending: false,
  }),
  computed: {
  },
  methods: {
    async doSaveLongDescriptionMd() {
      this.$emit('saveLongDescriptionMd');
    },
  },
}
</script>
<style scoped>
</style>
