<template>
  <section class="energy">
    <div class="container energy__wrapper">
      <div class="explorer__input-wrapper">
        <app-search
          ref="search"
          @searchValue="onSearchValue"
        />
      </div>
      <div
        v-if="isLoading"
        style="margin-top: 40px"
      >
        <app-spinner :is-visible="true"/>
      </div>
      <div v-else>
        <div class="explorer-energy">
          <h3 class="explorer-energy__indicator-text">Energy</h3>
        </div>
        <div class="enegry__screens">
          <app-energy
            :changed-energies="changedEnergies"
            :filters="filters"
            :users="users"
            @clearFilters="clearFilters"
            @filtered="onFiltered"
            @getTransferedEnergy="getUserData"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import AppSearch from '~/components/AppSearch.vue'
import AppSpinner from '~/components/AppSpinner.vue'
import AppEnergy from '~/components/energy/AppEnergy'
import transition from '~/mixins/transition'
import users from '~/mixins/users'
import {TOAST_ERROR} from "~/utils/constants";
import {toRoundedPercentage} from "~/utils/numbers";

const unsavedChangesConfirmation = () => window.confirm('You have unsaved changes.\nClick Cancel to go back to save\nClick OK to leave without saving');

const filterKey = 'energyFilters'
export default {
  components: {
    AppSearch,
    // EnergyIndicator,
    AppEnergy,
    AppSpinner,
  },
  mixins: [transition, users],

  beforeRouteLeave(_to, _from, next) {
    if (this.changedEnergies.length) {
      const answer = unsavedChangesConfirmation()
      if (answer) {
        window.onbeforeunload = null
        next()
      } else {
        next(false)
      }
    } else {
      window.onbeforeunload = null
      next()
    }
  },
  data() {
    return {
      filterKey,
      filters: [
        {
          name: 'Name',
          type: 'ordering',
          defaultAscending: true,
          active: false,
          reverse: true,
        },
        {
          name: 'Outbound',
          type: 'ordering',
          defaultAscending: false,
          active: false,
          reverse: false,
        },
        {
          name: 'Rated',
          type: 'ordering',
          defaultAscending: false,
          active: false,
          reverse: false,
        },
        {
          name: 'Recent',
          type: 'ordering',
          defaultAscending: false,
          active: false,
          reverse: false,
        },
        {
          name: 'Exclude Zeros',
          type: 'filter',
          active: false,
        }
      ],
    }
  },
  head() {
    return {
      title: `Aura | Energy`,
    }
  },

  computed: {
    transferedEnergy() {
      return this.$store.state.energy.transferedEnergy
    },
    changedEnergies() {
      const prev = this.$store.state.energy.prevTransferedEnergy
      if (!prev) return []
      const current = this.$store.state.energy.transferedEnergy
      return prev.filter(ep => {
        const cur = current.find(ec => ec.toBrightId === ep.toBrightId)
        return !cur || cur.amount !== ep.amount
      }).concat(current.filter(ec => {
        const p = prev.find(ep => ep.toBrightId === ec.toBrightId)
        return !p || p.amount !== ec.amount
      }))
    },
    availableEnergy() {
      return this.$store.state.energy.availableEnergy || 0
    },
  },

  mounted() {
    const vinst = this
    window.onbeforeunload = function () {
      if (vinst.changedEnergies.length) {
        return "You have unsaved changes.\nDo you want to leave without saving?";
      }
    }
    this.getTransferedEnergy()
  },
  methods: {
    async getUserData() {
      try {
        this.isLoading = true
        await this.loadUserProfile()

        const ratedUsers = this.$store.getters['profile/ratedUsers']
        await this.$store.dispatch('energy/getTransferedEnergy')
        await this.$store.dispatch('energy/getInboundEnergy')

        const finalUsers = this.connections.map(conn => {
          const ratingData = ratedUsers.find(
            user => user.toBrightId === conn.id
          )
          const inboundEnergyObject = this.inboundEnergy.find(
            en => en.fromBrightId === conn.id
          )
          const outboundEnergyObject = this.transferedEnergy.find(
            en => en.toBrightId === conn.id
          )
          return {
            ratingData,
            rating: ratingData ? +ratingData.rating : undefined,
            transferedEnergyPercentage: outboundEnergyObject
              ? toRoundedPercentage(
                outboundEnergyObject.amount,
                outboundEnergyObject.scale
              )
              : 0,
            transferedEnergy: outboundEnergyObject?.amount || 0,
            inboundEnergyAmount: inboundEnergyObject?.amount || 0,
            inboundEnergyPercentage: inboundEnergyObject
              ? toRoundedPercentage(
                inboundEnergyObject.amount,
                inboundEnergyObject.scale
              )
              : 0,
            ...conn,
          }
        })
        this.startUsers = finalUsers
        this.setInitialFilter()
      } catch (error) {
        console.log(error)
      } finally {
        this.isLoading = false
      }
    },
    getTransferedEnergy() {
      this.$store.dispatch('energy/getTransferedEnergy')
        .catch(error => {
          this.$store.commit('toast/addToast', {text: 'Error', color: TOAST_ERROR})
          console.log(error)
        })
    },
  },
}
</script>
