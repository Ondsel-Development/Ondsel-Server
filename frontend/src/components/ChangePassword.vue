<template>
  <v-dialog
    v-if="dialog"
    v-model="dialog"
    width="auto"
  >
    <v-card
      min-width="40em"
    >
      <v-card-title>
        Change Password
      </v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field
            v-model="oldPassword"
            type="password"
            label="Old Password"
            :rules="[]"
            :disabled="isChangePending"
          ></v-text-field>

          <v-text-field
            v-model="newPassword"
            type="password"
            label="New Password"
            :rules="[]"
            :disabled="isChangePending"
          ></v-text-field>

          <v-text-field
            v-model="confirmPassword"
            type="password"
            label="Confirm New Password"
            :rules="[]"
            :disabled="isChangePending"
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn @click="dialog = false">Cancel</v-btn>
        <v-btn
          color="primary"
          :disabled="isChangePending"
        >Update</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'ChangePassword',
  data() {
    return {
      dialog: false,
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
      isChangePending: false,
    }
  },
  async mounted() {
  },
  methods: {
  },
}
</script>

<style scoped>
</style>
