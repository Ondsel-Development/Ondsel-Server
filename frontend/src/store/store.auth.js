import { makeAuthPlugin } from '@/plugins/feathers-client'

export default makeAuthPlugin({ userService: 'users' })
