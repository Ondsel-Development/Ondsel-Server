<template>
  <v-container>
    <h1 class="text-h5 font-weight-bold mb-2">Account History</h1>

    <v-card
      variant="flat"
      :border="true"
      class="mx-auto my-6"
    >
      <v-list
        lines="two"
      >
        <v-list-item
          v-for="item in user.userAccounting.journal"
          :key="item.transactionId"
        >
          <v-list-item-title>
            {{item.description}}
          </v-list-item-title>
<!--          <template v-slot:append>-->
<!--            <v-btn-->
<!--              size="small"-->
<!--              variant="text"-->
<!--              icon="mdi-menu-down"-->
<!--            ></v-btn>-->
<!--          </template>-->
          <v-list-item-subtitle>
            {{ new Date(item.time) }}
          </v-list-item-subtitle>
          <v-card>
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
          </v-card>
        </v-list-item>
      </v-list>
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
