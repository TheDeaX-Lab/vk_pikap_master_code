<template lang="pug">
v-app
  v-card
    v-app-bar
      v-toolbar-title Тест людей
  
  v-content
    v-container
      MainComponent
  v-btn(fixed=true right fab bottom @click='$vuetify.goTo(0)')
    v-icon mdi-chevron-up

</template>

<script>
import MainComponent from "./components/MainComponent";

export default {
    name: "App",
    components: {
        MainComponent
    },
    data: () => ({
        //
    })
};
</script>
