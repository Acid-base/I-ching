import json
import random
import sys
from pathlib import Path
from typing import Dict, List, Literal, Optional, Union

from pydantic import BaseModel, ValidationError
from loguru import logger


class Trigram(BaseModel):
    name: str
    meaning: str
    image: str
    family: str
    attribute: str


class Trigrams(BaseModel):
    upper: Trigram
    lower: Trigram


class HexagramData(BaseModel):
    number: int
    chineseName: str
    englishName: str
    pinyin: str
    structure: List[str]
    judgment: str
    image: str
    lines: List[str]


class ReadingResponse(BaseModel):
    hexagram_number: int
    changing_lines: List[int]
    lines: List[str]
    reading: HexagramData
    trigrams: Trigrams
    relating_hexagram: Optional[HexagramData] = None
    opposite_hexagram: Optional[HexagramData] = None
    inverse_hexagram: Optional[HexagramData] = None
    nuclear_hexagrams: Optional[List[HexagramData]] = None
    mutual_hexagrams: Optional[List[HexagramData]] = None


class DiviningOptions(BaseModel):
    mode: Literal["yarrow", "coin"] = "yarrow"


TRIGRAMS: Dict[str, Dict] = {
    "heaven": {
        "name": "Heaven",
        "meaning": "Creative",
        "image": "Sky",
        "family": "Father",
        "attribute": "Strong",
    },
    "lake": {
        "name": "Lake",
        "meaning": "Joyful",
        "image": "Marsh",
        "family": "Youngest Daughter",
        "attribute": "Pleasing",
    },
    "fire": {
        "name": "Fire",
        "meaning": "Clinging",
        "image": "Flame",
        "family": "Middle Daughter",
        "attribute": "Radiant",
    },
    "thunder": {
        "name": "Thunder",
        "meaning": "Arousing",
        "image": "Thunder",
        "family": "Eldest Son",
        "attribute": "Moving",
    },
    "wind": {
        "name": "Wind",
        "meaning": "Gentle",
        "image": "Wind",
        "family": "Eldest Daughter",
        "attribute": "Penetrating",
    },
    "water": {
        "name": "Water",
        "meaning": "Abysmal",
        "image": "Water",
        "family": "Middle Son",
        "attribute": "Dangerous",
    },
    "mountain": {
        "name": "Mountain",
        "meaning": "Stillness",
        "image": "Mountain",
        "family": "Youngest Son",
        "attribute": "Resting",
    },
    "earth": {
        "name": "Earth",
        "meaning": "Receptive",
        "image": "Earth",
        "family": "Mother",
        "attribute": "Yielding",
    },
}

BINARY_TO_TRIGRAM = {
    "111": "heaven",
    "011": "lake",
    "101": "fire",
    "001": "thunder",
    "110": "wind",
    "010": "water",
    "100": "mountain",
    "000": "earth",
}


def load_readings() -> Dict[str, HexagramData]:
    """Load I Ching readings from JSON file."""
    readings_file = Path(__file__).parent / "data" / "readings.json"
    try:
        with readings_file.open("r", encoding="utf-8") as f:
            data = json.load(f)
            return {str(h["number"]): HexagramData(**h) for h in data}
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error in readings.json: {str(e)}")
        raise ValueError(f"Invalid JSON format in readings.json: {str(e)}")
    except Exception as e:
        logger.error(f"Error loading readings: {str(e)}")
        raise


def generate_line(mode: str = "yarrow") -> str:
    """Generate a single line using either yarrow stalk or coin method.
    Returns a string representation ('6','7','8','9') of the line value."""
    logger.info(f"Generating line using {mode} method")
    if mode == "coin":
        coins = [random.choice([2, 3]) for _ in range(3)]
        total = sum(coins)
        return str(total)  # Convert to string
    return str(random.choices([6,7,8,9], weights=[2,3,2,3])[0])  # Convert to string


def get_trigram_for_lines(lines: List[str]) -> str:
    binary = "".join("1" if line in ("7", "9") else "0" for line in lines)
    return BINARY_TO_TRIGRAM.get(binary, "heaven")


def get_trigrams_for_hexagram(lines: List[str]) -> Trigrams:
    logger.info(f"Getting trigrams for lines: {lines}")

    lower_lines = lines[:3]
    upper_lines = lines[3:]

    lower_key = get_trigram_for_lines(lower_lines)
    upper_key = get_trigram_for_lines(upper_lines)

    logger.info(f"Upper trigram: {upper_key}, Lower trigram: {lower_key}")

    return Trigrams(
        upper=Trigram(**TRIGRAMS[upper_key]), lower=Trigram(**TRIGRAMS[lower_key])
    )


def calculate_hexagram_number(lines: List[str]) -> int:
    """Calculate hexagram number from string line values."""
    binary = [1 if line in ("7", "9") else 0 for line in lines]
    decimal = int("".join(map(str, binary)), 2)
    logger.info(f"Binary: {binary}, Decimal: {decimal}")

    king_wen_map = {
        0: 2,
        1: 24,
        2: 7,
        3: 19,
        4: 15,
        5: 36,
        6: 46,
        7: 11,
        8: 16,
        9: 27,
        10: 23,
        11: 8,
        12: 3,
        13: 42,
        14: 20,
        15: 35,
        16: 4,
        17: 29,
        18: 39,
        19: 63,
        20: 51,
        21: 40,
        22: 21,
        23: 30,
        24: 25,
        25: 17,
        26: 2,
        27: 45,
        28: 37,
        29: 13,
        30: 31,
        31: 50,
        32: 9,
        33: 57,
        34: 5,
        35: 26,
        36: 62,
        37: 53,
        38: 38,
        39: 52,
        40: 14,
        41: 34,
        42: 43,
        43: 1,
        44: 44,
        45: 28,
        46: 48,
        47: 58,
        48: 59,
        49: 41,
        50: 60,
        51: 56,
        52: 47,
        53: 64,
        54: 49,
        55: 18,
        56: 12,
        57: 25,
        58: 6,
        59: 10,
        60: 33,
        61: 13,
        62: 44,
        63: 1,
    }
    result = king_wen_map.get(decimal, 1)
    logger.info(f"Mapped to King Wen number: {result}")
    return result


def calculate_opposite_hexagram(structure: List[str, readings: Dict[str, HexagramData) -> Optional[HexagramData]:
    """Calculate the opposite hexagram based on the structure."""
    inverted_structure = ["1" if line == "0" else "0" for line in structure]
    hexagram_number = calculate_hexagram_number(inverted_structure)
    return readings.get(str(hexagram_number))


def calculate_inverse_hexagram(structure: List[str], readings: Dict[str, HexagramData]) -> Optional[HexagramData]:
    """Calculate the inverse hexagram based on the structure."""
    reversed_structure = structure[::-1]
    hexagram_number = calculate_hexagram_number(reversed_structure)
    return readings.get(str(hexagram_number))


def calculate_nuclear_hexagrams(structure: List[str], readings: Dict[str, HexagramData]) -> List[HexagramData]:
    """Calculate the nuclear hexagrams based on the structure."""
    lower_nuclear = structure[1:4]
    upper_nuclear = structure[2:5]
    lower_number = calculate_hexagram_number(lower_nuclear)
    upper_number = calculate_hexagram_number(upper_nuclear)
    return [readings.get(str(lower_number)), readings.get(str(upper_number))]


def calculate_mutual_hexagrams(structure: List[str], readings: Dict[str, HexagramData]) -> List[HexagramData]:
    """Calculate the mutual hexagrams based on the structure."""
    first_three = structure[0:3]
    last_three = structure[3:6]
    first_number = calculate_hexagram_number(first_three)
    last_number = calculate_hexagram_number(last_three)
    return [readings.get(str(first_number)), readings.get(str(last_number))]


def generate_reading(options: Optional[DiviningOptions] = None) -> ReadingResponse:
    try:
        logger.info("Starting reading generation")
        if options is None:
            options = DiviningOptions()
        logger.info(f"Using options: {options}")

        # Generate six lines as strings
        lines = [generate_line(options.mode) for _ in range(6)]
        logger.info(f"Generated lines: {lines}")

        # Calculate hexagram number from string lines
        hexagram_number = calculate_hexagram_number(lines)
        logger.info(f"Calculated hexagram number: {hexagram_number}")

        # Find changing lines (6 or 9)
        changing_lines = [i + 1 for i, line in enumerate(lines) if line in ("6", "9")]
        logger.info(f"Changing lines: {changing_lines}")

        readings = load_readings()
        reading = readings.get(str(hexagram_number))
        if not reading:
            raise ValueError(f"Hexagram {hexagram_number} not found in readings data")
        logger.info(f"Found primary hexagram: {reading.englishName}")

        trigrams = get_trigrams_for_hexagram(lines)

        relating_hexagram = None
        if changing_lines:
            transformed_lines = [
                "8" if line == "9" else ("7" if line == "6" else line) for line in lines
            ]
            relating_number = calculate_hexagram_number(transformed_lines)
            logger.info(f"Calculated relating hexagram number: {relating_number}")
            relating_hexagram = readings.get(str(relating_number))
            if relating_hexagram:
                logger.info(f"Found relating hexagram: {relating_hexagram.englishName}")

        opposite_hexagram = calculate_opposite_hexagram(reading.structure, readings)
        inverse_hexagram = calculate_inverse_hexagram(reading.structure, readings)
        nuclear_hexagrams = calculate_nuclear_hexagrams(reading.structure, readings)
        mutual_hexagrams = calculate_mutual_hexagrams(reading.structure, readings)

        response = ReadingResponse(
            hexagram_number=hexagram_number,
            changing_lines=changing_lines,
            lines=lines,
            reading=reading,
            trigrams=trigrams,
            relating_hexagram=relating_hexagram,
            opposite_hexagram=opposite_hexagram,
            inverse_hexagram=inverse_hexagram,
            nuclear_hexagrams=nuclear_hexagrams,
            mutual_hexagrams=mutual_hexagrams,
        )

        # Use model_dump() instead of dict()
        print(json.dumps(response.model_dump()))
        logger.info("Successfully generated reading")
        return response

    except Exception as e:
        logger.error(f"Error generating reading: {str(e)}", exc_info=True)
        error_response = {"error": str(e), "ai_generated": True}
        print(json.dumps(error_response), file=sys.stderr)
        sys.exit(1)


def get_hexagram_by_id(id_: int) -> HexagramData:
    readings = load_readings()
    if str(id_) not in readings:
        raise ValueError(f"Invalid hexagram ID: {id_}")
    return readings[str(id_)]


def main() -> None:
    try:
        logger.info("Starting divination.py")
        if len(sys.argv) > 1:
            try:
                logger.info(f"Received arguments: {sys.argv[1]}")
                options_dict = json.loads(sys.argv[1])
                options = DiviningOptions(**options_dict)
                generate_reading(options)
            except (json.JSONDecodeError, ValidationError) as e:
                logger.error(f"JSON decode error: {str(e)}")
                print(
                    json.dumps({"error": "Invalid JSON options provided"}),
                    file=sys.stderr,
                )
                sys.exit(1)
        else:
            logger.info("No arguments provided, using defaults")
            generate_reading()

    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()