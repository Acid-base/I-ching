import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'system',
  useSystemColorMode: true,
}

const theme = extendTheme({
  config,
  colors: {
    brand: {
      50: '#f5f0ff',
      100: '#e9e3ff',
      200: '#d4c5ff',
      300: '#b69aff',
      400: '#9161ff',
      500: '#6b28ff',
      600: '#5a0fff',
      700: '#4d00e6',
      800: '#4000bf',
      900: '#36009c',
    },
  },
  fonts: {
    heading: 'var(--font-heading)',
    body: 'var(--font-body)',
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.900',
        _dark: {
          bg: 'gray.900',
          color: 'gray.50',
        },
      },
    },
  },
})

export default theme 