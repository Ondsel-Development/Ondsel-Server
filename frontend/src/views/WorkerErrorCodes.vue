<template>
  <Main>
    <template #title>
      <v-btn icon="mdi-arrow-left" @click="$router.go(-1)"></v-btn>
      Code Details
    </template>
    <template #content>
      <v-table>
        <thead>
        <tr>
          <th class="text-center">
            Code
          </th>
          <th class="text-left">
            Detail
          </th>
        </tr>
        </thead>
        <tbody>
        <tr
          v-for="errorCode in errorCodes"
          :key="errorCode.error"
        >
          <td class="text-center">{{ errorCode.error }}</td>
          <td class="text-left">
            <span v-html="errorCode.desc" />
          </td>
        </tr>
        </tbody>
      </v-table>
    </template>
  </Main>
</template>

<script>
import Main from "@/layouts/default/Main.vue";
export default {
  name: "WorkerErrorCodes",
  components: { Main },
  computed: {
    errorCodes: () => [
      {
        error: 101,
        desc: 'Linked models weren\'t found in the parent directory, cannot render the assembly.'
      },
      {
        error: 102,
        desc: 'The rendering of linked documents requires a Peer tier subscription. Please consider <a href="/choose-tier">upgrading</a>',
      },
      {
        error: 999,
        desc: 'Internal Server error.'
      },
    ]
  }
}
</script>

<style scoped>

</style>
