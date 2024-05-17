<template>
  <v-dialog
    v-if="dialog"
    v-model="dialog"
    width="auto"
  >
    <v-card max-width="40em" min-width="22em">
      <template v-slot:title>
        <div class="text-center">Edit Tags</div>
      </template>
      <v-progress-linear
        :active="isPatchPending"
        indeterminate
        absolute
        bottom
      ></v-progress-linear>
      <v-form ref="editTagsDialogForm" @submit.prevent="doSaveTags">
        <v-card-text>
          <p>Press enter to add a new tag. To delete a tag, use arrow keys to highlight and press Delete on keyboard.</p>
          <v-combobox
            v-model="newTags"
            chips
            multiple
            filled
            append-icon=""
          >
              <v-chip
                small
                close
              >
                {{ item }}
              </v-chip>
          </v-combobox>
        </v-card-text>
      </v-form>
      <v-snackbar
        :timeout="2000"
        v-model="showSnacker"
      >
        {{ snackerMsg }}
      </v-snackbar>
      <v-card-actions class="justify-center">
        <v-btn
          color="cancel"
          variant="elevated"
          @click="dialog = false"
        >Cancel</v-btn>
        <v-btn
          @click="doSaveTags()"
          color="primary"
          variant="elevated"
          :disabled="isPatchPending"
          :loading="isPatchPending"
        >Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>

export default {
  name: 'EditTagsDialog',
  props: {
    tagList: {
      Type: Array,
      default: [],
    }
  },
  emits: ['saveTags'],
  created() {
    this.newTags = this.tagList;
  },
  data: () => ({
    dialog: false,
    snackerMsg: '',
    showSnacker: false,
    newTags: [],
    isPatchPending: false,
  }),
  computed: {
  },
  methods: {
    async doSaveTags() {
      this.$emit('saveTags');
    },
  },
}
</script>
<style scoped>
</style>
