<template>
  <v-container>
    <h1 class="text-h5 font-weight-bold mb-2">Account History</h1>

    <v-card
      variant="flat"
      :border="true"
      class="mx-auto my-6"
    >
      <v-expansion-panels
        multiple
      >
        <v-expansion-panel
          v-for="item in user.userAccounting.journal"
          :key="item.transactionId"
        >
          <v-expansion-panel-title>
            {{ new Date(item.time) }} &nbsp; &nbsp; &nbsp; &nbsp; {{item.description}}
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-table v-if="item.entries.length > 0">
              <thead>
                <th class="text-right">
                  amt
                </th>
                <th class="text-right">

                </th>
                <th class="text-left">
                  debit
                </th>
                <th class="text-left">
                  credit
                </th>
              </thead>
              <tbody>
                <tr
                  v-for="entry in item.entries"
                  :key="entry.ledger"
                >
                  <td class="text-right">
                    {{ (entry.amount / 100).toLocaleString("en-US", {style:"currency", currency:"USD"}) }}
                  </td>
                  <td>
                    {{ entry.currencyAmt ? "[ " + entry.currencyAmt + " " + entry.currency + " ]" : ""}}
                  </td>
                  <td class="text-left"> {{ entry.amount > 0 ? entry.ledger : "-"  }} </td>
                  <td class="text-left"> {{ entry.amount < 0 ? entry.ledger : "-"  }} </td>
                </tr>
              </tbody>
            </v-table>
            <div v-else>
              <i>not a financial transaction</i>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card>

  </v-container>
</template>

<script>

import {mapState} from "vuex";
import {models} from "@feathersjs/vuex";
import {SubscriptionTypeMap} from "@/store/services/users";

export default {
  name: 'AccountHistory',
  data() {
    return {
    }
  },
  computed: {
    ...mapState('auth', { loggedInUser: 'payload' }),
    ...mapState('auth', ['user']),
  },
  methods: {
    gotoChooseTier() {
      this.$router.push({name: 'ChooseTier'});
    },
  }
}
</script>

<style scoped>

</style>
