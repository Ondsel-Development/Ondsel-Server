export default {
  data: () => ({
    rules: {
      isRequired: v => !!v || 'This field is required',
    },
  })
}
