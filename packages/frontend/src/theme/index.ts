import { extendTheme } from '@chakra-ui/react'
import { foundations } from './foundations'
import { components } from './components'
import { styles } from './styles'

export const theme = extendTheme({
  ...foundations,
  components,
  styles,
})

