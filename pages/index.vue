<template>
  <main class="landing">
    <div class="container landing__wrapper">
      <landing-sphere />
      <div class="landing__h1-wrapper">
        <h1 class="landing__h1">Discover & grow your Aura...</h1>
      </div>
      <div class="landing__text-wrapper">
        <h3 class="landing__title">
          Your Aura represents power & influence upon the Auracle.
        </h3>
        <p class="landing__text">
          Smartly connect to and rate others to grow your Aura. Help those
          around you grow theirs.
        </p>
        <p class="landing__text">
          But take care, for making poor decisions will drain your power and
          harm those around you.
        </p>
        <p class="landing__simple-text"> Learn more about 
          <span class="landing__link" @click="visitLink('https://www.brightid.org/about-us/')">BrightID</span> 
          and 
          <span class="landing__link" @click="visitLink('https://brightid.gitbook.io/aura/')">Aura</span> 
        </p>
        <p class="landing__link" @click="visitLink('https://discord.gg/zFXKG77vq3')"> Join Aura's Discord community</p>
      </div>
      <div class="landing__input-form">
        <h3 class="landing__input-name">Early Access</h3>
        <login-form />
      </div>
    </div>
  </main>
</template>

<script>
import LandingSphere from '~/components/LandingSphere.vue'
import LoginForm from '~/components/LoginForm.vue'
import transition from '~/mixins/transition'

export default {
  components: { LoginForm, LandingSphere },
  mixins: [transition],
  head() {
    return {
      title: 'Aura | Login',
    }
  },
  methods: {
    visitLink(link) {
      window.open(link, '_blank');
    }
  }
}
</script>
