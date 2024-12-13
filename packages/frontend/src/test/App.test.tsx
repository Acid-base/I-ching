import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ChakraProvider } from '@chakra-ui/react'
import App from '../App'
import theme from '../theme'
import { vi } from 'vitest'
import axios from 'axios'

// Mock axios
vi.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

// Mock reading data
const mockReading = {
  hexagram_number: 1,
  changing_lines: [1, 3],
  lines: [1, 1, 1, 1, 1, 1],
  reading: {
    name: "The Creative",
    chinese: "乾",
    description: "Test description",
    judgment: "Test judgment",
    image: "Test image",
    lines: {
      "1": "First line",
      "3": "Third line"
    }
  }
}

describe('App', () => {
  beforeEach(() => {
    mockedAxios.post.mockReset()
  })

  test('renders main heading', () => {
    render(
      <ChakraProvider theme={theme}>
        <App />
      </ChakraProvider>
    )
    expect(screen.getByText('I Ching Reading')).toBeInTheDocument()
  })

  test('generates reading on button click', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: mockReading })

    render(
      <ChakraProvider theme={theme}>
        <App />
      </ChakraProvider>
    )

    const button = screen.getByText('Generate Reading')
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('The Creative')).toBeInTheDocument()
      expect(screen.getByText('Test description')).toBeInTheDocument()
    })
  })

  test('shows error toast on API failure', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('API Error'))

    render(
      <ChakraProvider theme={theme}>
        <App />
      </ChakraProvider>
    )

    const button = screen.getByText('Generate Reading')
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument()
    })
  })

  test('switches between tabs', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: mockReading })

    render(
      <ChakraProvider theme={theme}>
        <App />
      </ChakraProvider>
    )

    // Generate a reading first
    const button = screen.getByText('Generate Reading')
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('The Creative')).toBeInTheDocument()
    })

    // Switch to AI Interpretation tab
    const aiTab = screen.getByText('AI Interpretation')
    fireEvent.click(aiTab)
    expect(screen.getByText('Get AI Interpretation')).toBeInTheDocument()

    // Switch to Chat tab
    const chatTab = screen.getByText('Chat')
    fireEvent.click(chatTab)
    expect(screen.getByText('Chat with I Ching Consultant')).toBeInTheDocument()
  })
}) 