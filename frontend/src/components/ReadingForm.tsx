import { Box, Button, Heading, Text, useToast, VStack } from "@chakra-ui/react";
import React, { useState } from "react";
import { castHexagram, ReadingResponse } from "../api";
import { HexagramMode } from "../types";
import HexagramDisplay from "./HexagramDisplay";

const ReadingForm: React.FC = () => {
  const [reading, setReading] = useState<ReadingResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [method, setMethod] = useState<HexagramMode | null>(null);
  const toast = useToast();

  const handleSelectMethod = (selectedMethod: HexagramMode) => {
    setMethod(selectedMethod);
    getCasting(selectedMethod);
  };

  const getCasting = async (mode: HexagramMode) => {
    setIsLoading(true);
    try {
      const response = await castHexagram(mode);
      setReading(response);
    } catch (error) {
      console.error("Error getting casting:", error);
      toast({
        title: "Error",
        description: "Failed to generate I Ching reading. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setReading(null);
    } finally {
      setIsLoading(false);
    }
  };

  const resetReading = () => {
    setReading(null);
    setMethod(null);
  };

  return (
    <VStack
      spacing={8}
      align="stretch"
      width="100%"
      maxWidth="800px"
      mx="auto"
      p={4}
    >
      <Box textAlign="center">
        <Heading as="h1" size="2xl" mb={2}>
          I Ching Oracle
        </Heading>
        <Text fontSize="lg">Consult the Book of Changes</Text>
      </Box>

      {!reading && !isLoading ? (
        <VStack
          spacing={4}
          p={6}
          borderWidth={1}
          borderRadius="lg"
          bg="white"
          boxShadow="md"
        >
          <Heading as="h2" size="lg" mb={4}>
            Select Your Divination Method
          </Heading>
          <Button
            colorScheme="purple"
            size="lg"
            width="100%"
            onClick={() => handleSelectMethod("yarrow")}
          >
            <Text fontWeight="bold">Yarrow Stalk Method</Text>
          </Button>
          <Text fontSize="sm">
            The traditional method with actual probabilities (9:1:3:3)
          </Text>

          <Button
            colorScheme="teal"
            size="lg"
            width="100%"
            onClick={() => handleSelectMethod("coins")}
          >
            <Text fontWeight="bold">Three Coins Method</Text>
          </Button>
          <Text fontSize="sm">
            Modern method with equal probabilities (1:1:1:1)
          </Text>
        </VStack>
      ) : (
        <>
          <HexagramDisplay reading={reading} isLoading={isLoading} />
          <Button colorScheme="gray" onClick={resetReading} alignSelf="center">
            New Reading
          </Button>
        </>
      )}
    </VStack>
  );
};

export default ReadingForm;
