import { Box, Icon, useToken } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FaYinYang } from 'react-icons/fa';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export const YinYangSpinner = () => {
  const purple = useToken('colors', 'purple.500');
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      animation={`${spin} 20s linear infinite`}
    >
      <Icon as={FaYinYang} w={20} h={20} color={purple} />
    </Box>
  );
};

export default YinYangSpinner;
