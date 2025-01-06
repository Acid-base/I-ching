import json
import random
import os
from typing import List, Optional, Tuple
from pydantic import BaseModel, Field


# Pydantic Models for Data Validation
class Trigrams(BaseModel):
    upper: str
    lower: str


class Relationships(BaseModel):
    opposite: int
    inverse: int
    nuclear: List[int]
    mutual: List[int]


class Hexagram(BaseModel):
    number: int
    chineseName: str
    englishName: str
    pinyin: str
    structure: List[str]
    trigrams: Trigrams
    relationships: Relationships
    judgment: str
    image: str
    lines: List[str] = Field(default_factory=list)


# Load Hexagram Data
def load_hexagrams(json_string: str) -> List[Hexagram]:
    """
    Loads a JSON string representing an array of I Ching hexagrams
    into a list of Hexagram objects.

    Args:
        json_string: A string containing a JSON array of hexagram objects.

    Returns:
        A list of Hexagram objects, where each object represents a hexagram.
    """
    try:
        hexagram_data = json.loads(json_string)
        return [Hexagram(**item) for item in hexagram_data]
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        return []


# I Ching Line Generator
class IChingLineGenerator:
    @staticmethod
    def get_yarrow_stalk_line() -> str:
        """
        Generates a single I Ching line using a probability-based method that matches
        the traditional yarrow stalk probabilities:
        6 (old yin) - 1/16
        7 (young yang) - 5/16
        8 (young yin) - 7/16
        9 (old yang) - 3/16

        Returns:
            A string representing the line value ('6', '7', '8', or '9').
        """
        # Generate a random number between 1 and 16
        r = random.randint(1, 16)

        # Map the random number to line values according to traditional probabilities
        if r == 1:  # 1/16 probability
            return "6"  # Old Yin
        elif 2 <= r <= 6:  # 5/16 probability
            return "7"  # Young Yang
        elif 7 <= r <= 13:  # 7/16 probability
            return "8"  # Young Yin
        else:  # 3/16 probability (r == 14, 15, or 16)
            return "9"  # Old Yang

    @staticmethod
    def get_three_coins_line() -> str:
        """
        Generates a single I Ching line using the three coins method.

        Returns:
            A string representing the line value ('6', '7', '8', or '9').
        """
        coin1 = random.choice(["H", "T"])
        coin2 = random.choice(["H", "T"])
        coin3 = random.choice(["H", "T"])
        heads = sum(1 for coin in [coin1, coin2, coin3] if coin == "H")
        if heads == 0:
            return "8"
        elif heads == 1:
            return "7"
        elif heads == 2:
            return "9"
        elif heads == 3:
            return "6"

    @staticmethod
    def get_random_line() -> str:
        """
        Generates a single I Ching line using a random method (either yarrow or coins).

        Returns:
            A string representing the line value ('6', '7', '8', or '9').
        """
        return random.choice(
            [
                IChingLineGenerator.get_yarrow_stalk_line(),
                IChingLineGenerator.get_three_coins_line(),
            ]
        )


# Hexagram Generation
def get_hexagram() -> List[str]:
    """
    Generates a hexagram by producing six random I Ching lines.

    Returns:
        A list of strings, each representing a line in the hexagram.
    """
    hexagram_lines = [IChingLineGenerator.get_yarrow_stalk_line() for _ in range(6)]
    return hexagram_lines


# Hexagram Lookup
def lookup_hexagram(
    hexagram_data: List[Hexagram],
    hexagram: List[str],
) -> Optional[Tuple[Hexagram, List[str]]]:
    """
    Looks up a hexagram in the provided data based on its structure.

    Args:
        hexagram_data: A list of Hexagram objects.
        hexagram: A list of strings representing the lines of the hexagram.

    Returns:
        A tuple containing the Hexagram object and the original hexagram lines if found, otherwise None.
    """
    # Convert moving lines to stable lines for lookup
    structure = []
    for line in hexagram:
        if line == "6":
            structure.append("8")  # Old Yin changes to Young Yin
        elif line == "7":
            structure.append("7")  # Young Yang remains Young Yang
        elif line == "8":
            structure.append("8")  # Young Yin remains Young Yin
        elif line == "9":
            structure.append("7")  # Old Yang changes to Young Yang
    for data in hexagram_data:
        if data.structure == structure:
            return data, hexagram
    return None


# Load hexagram data from JSON file
def load_hexagram_data() -> List[Hexagram]:
    """
    Loads hexagram data from the JSON file in the data subdirectory.

    Returns:
        List[Hexagram]: List of Hexagram objects
    """
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        json_path = os.path.join(script_dir, "data", "hexagrams.json")
        with open(json_path, "r", encoding="utf-8") as f:
            hexagram_data = json.load(f)
            return [Hexagram(**item) for item in hexagram_data]
    except Exception as e:
        print(f"Error loading hexagram data: {e}")
        return []


def simulate_iching_reading(hexagram_data: List[Hexagram]) -> None:
    """
    Simulates an I Ching reading, generates a hexagram, and prints its information.

    Args:
        hexagram_data: A list of Hexagram objects.
    """
    generated_hexagram = get_hexagram()
    print("Generated Hexagram:", generated_hexagram)  # Added logging here
    hexagram_info = lookup_hexagram(hexagram_data, generated_hexagram)

    print("\n=== I Ching Reading ===")
    print("\nGenerated Lines (bottom to top):")
    for i, line in enumerate(generated_hexagram, 1):
        line_type = {
            "6": "Old Yin (changing)",
            "7": "Young Yang (stable)",
            "8": "Young Yin (stable)",
            "9": "Old Yang (changing)",
        }
        print(f"Line {i}: {line_type[line]}")

    if hexagram_info:
        hexagram_data, original_hexagram = hexagram_info
        print(
            f"\nHexagram {hexagram_data.number}: {hexagram_data.englishName} ({hexagram_data.chineseName} - {hexagram_data.pinyin})"
        )
        print(f"\nJudgment:\n{hexagram_data.judgment}")
        print(f"\nImage:\n{hexagram_data.image}")

        print("\nLine Meanings (bottom to top):")
        for i, (line, meaning) in enumerate(
            zip(original_hexagram, hexagram_data.lines), 1
        ):
            if line in ["6", "9"]:  # Changing lines
                print(f"Line {i} (Changing): {meaning}")
    else:
        print(
            f"Error: Could not find information for the generated hexagram: {generated_hexagram}"
        )


# Example Usage:
if __name__ == "__main__":
    hexagram_data = load_hexagram_data()
    simulate_iching_reading(hexagram_data)
