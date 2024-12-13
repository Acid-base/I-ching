# divination.py
"""
Core I Ching divination logic.

This module implements the traditional yarrow stalk method for I Ching divination.
It provides functions for generating hexagrams and interpreting readings.
"""

from __future__ import annotations

import json
import random
import sys
import logging
from pathlib import Path
from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    stream=sys.stderr
)
logger = logging.getLogger(__name__)

class Trigram(BaseModel):
    name: str
    chinese: str
    pinyin: str
    attribute: str
    element: str
    image: str

class Trigrams(BaseModel):
    upper: Trigram
    lower: Trigram

class Judgment(BaseModel):
    text: str
    explanation: str

class Image(BaseModel):
    text: str
    explanation: str

class Line(BaseModel):
    number: int
    value: int
    meaning: str
    explanation: Optional[str] = None
    transforms_to: Optional[int] = None

class HexagramData(BaseModel):
    number: int
    name: str
    chinese: str
    pinyin: str
    description: str
    alternate_names: List[str]
    element: str
    attribute: str
    judgment: Judgment
    image: Image
    lines: List[Line]
    trigrams: Optional[Trigrams] = None

class ReadingResponse(BaseModel):
    hexagram_number: int
    changing_lines: List[int]
    lines: List[int]
    reading: HexagramData
    relating_hexagram: Optional[HexagramData] = None
    ai_generated: bool = True

class DiviningOptions(BaseModel):
    mode: Literal['yarrow', 'coin'] = 'yarrow'

# Define the eight trigrams
TRIGRAMS: Dict[str, Dict] = {
    "heaven": {
        "name": "Heaven",
        "chinese": "乾",
        "pinyin": "qián",
        "attribute": "Strong, Creative",
        "element": "Metal",
        "image": "Heaven, Sky"
    },
    "earth": {
        "name": "Earth",
        "chinese": "坤",
        "pinyin": "kūn",
        "attribute": "Receptive, Yielding",
        "element": "Earth",
        "image": "Earth, Ground"
    },
    "thunder": {
        "name": "Thunder",
        "chinese": "震",
        "pinyin": "zhèn",
        "attribute": "Arousing, Shocking",
        "element": "Wood",
        "image": "Thunder, Lightning"
    },
    "water": {
        "name": "Water",
        "chinese": "坎",
        "pinyin": "kǎn",
        "attribute": "Dangerous, Flowing",
        "element": "Water",
        "image": "Water, Stream"
    },
    "mountain": {
        "name": "Mountain",
        "chinese": "艮",
        "pinyin": "gèn",
        "attribute": "Still, Stopping",
        "element": "Earth",
        "image": "Mountain"
    },
    "wind": {
        "name": "Wind",
        "chinese": "巽",
        "pinyin": "xùn",
        "attribute": "Gentle, Penetrating",
        "element": "Wood",
        "image": "Wind, Tree"
    },
    "fire": {
        "name": "Fire",
        "chinese": "離",
        "pinyin": "lí",
        "attribute": "Light-giving, Clinging",
        "element": "Fire",
        "image": "Fire, Sun"
    },
    "lake": {
        "name": "Lake",
        "chinese": "兌",
        "pinyin": "duì",
        "attribute": "Joyous, Open",
        "element": "Metal",
        "image": "Lake, Marsh"
    }
}

# Mapping from binary to trigram
BINARY_TO_TRIGRAM = {
    "111": "heaven",
    "000": "earth",
    "100": "thunder",
    "010": "water",
    "001": "mountain",
    "110": "wind",
    "101": "fire",
    "011": "lake"
}

def load_readings() -> Dict[str, HexagramData]:
    """Load I Ching readings from JSON file."""
    readings_file = Path(__file__).parent / "data" / "readings.json"
    with readings_file.open("r", encoding="utf-8") as f:
        data = json.load(f)
        # Convert to Pydantic models and validate
        return {str(h["number"]): HexagramData(**h) for h in data}

def generate_line(mode: str = 'yarrow') -> int:
    """Generate a single line using either yarrow stalk or coin method."""
    logger.info(f"Generating line using {mode} method")
    if mode == 'coin':
        coins = [random.choice([2, 3]) for _ in range(3)]
        total = sum(coins)
        return {6: 6, 7: 7, 8: 8, 9: 9}[total]
    else:
        return random.choice([6, 7, 8, 9])

def get_trigram_for_lines(lines: List[int]) -> str:
    """Convert three lines to a trigram key."""
    binary = ''.join('1' if line in (7, 9) else '0' for line in lines)
    return BINARY_TO_TRIGRAM.get(binary, "heaven")

def get_trigrams_for_hexagram(lines: List[int]) -> Trigrams:
    """Get upper and lower trigrams based on the six lines."""
    logger.info(f"Getting trigrams for lines: {lines}")
    
    lower_lines = lines[:3]
    upper_lines = lines[3:]
    
    lower_key = get_trigram_for_lines(lower_lines)
    upper_key = get_trigram_for_lines(upper_lines)
    
    logger.info(f"Upper trigram: {upper_key}, Lower trigram: {lower_key}")
    
    return Trigrams(
        upper=Trigram(**TRIGRAMS[upper_key]),
        lower=Trigram(**TRIGRAMS[lower_key])
    )

def calculate_hexagram_number(lines: List[int]) -> int:
    """Calculate hexagram number from line values."""
    binary = [1 if line in (7, 9) else 0 for line in lines]
    decimal = int(''.join(map(str, binary)), 2)
    logger.info(f"Binary: {binary}, Decimal: {decimal}")
    
    king_wen_map = {
        0: 2, 1: 24, 2: 7, 3: 19, 4: 15, 5: 36, 6: 46, 7: 11,
        8: 16, 9: 51, 10: 40, 11: 54, 12: 62, 13: 55, 14: 32, 15: 34,
        16: 8, 17: 3, 18: 29, 19: 60, 20: 39, 21: 63, 22: 48, 23: 5,
        24: 45, 25: 17, 26: 47, 27: 58, 28: 31, 29: 49, 30: 28, 31: 43,
        32: 23, 33: 27, 34: 4, 35: 41, 36: 52, 37: 22, 38: 18, 39: 26,
        40: 35, 41: 21, 42: 64, 43: 38, 44: 56, 45: 30, 46: 50, 47: 14,
        48: 20, 49: 42, 50: 59, 51: 61, 52: 53, 53: 37, 54: 57, 55: 9,
        56: 12, 57: 25, 58: 6, 59: 10, 60: 33, 61: 13, 62: 44, 63: 1
    }
    result = king_wen_map.get(decimal, 1)
    logger.info(f"Mapped to King Wen number: {result}")
    return result

def generate_reading(options: Optional[DiviningOptions] = None) -> ReadingResponse:
    try:
        logger.info("Starting reading generation")
        if options is None:
            options = DiviningOptions()
        logger.info(f"Using options: {options}")
        
        lines = [generate_line(options.mode) for _ in range(6)]
        logger.info(f"Generated lines: {lines}")
        
        hexagram_number = calculate_hexagram_number(lines)
        logger.info(f"Calculated hexagram number: {hexagram_number}")
        
        changing_lines = [i + 1 for i, line in enumerate(lines) if line in (6, 9)]
        logger.info(f"Changing lines: {changing_lines}")
        
        # Load hexagram data
        readings = load_readings()
        reading = readings.get(str(hexagram_number))
        if not reading:
            raise ValueError(f'Hexagram {hexagram_number} not found in readings data')
        logger.info(f"Found primary hexagram: {reading.name}")
            
        # Add trigrams based on the actual lines
        reading.trigrams = get_trigrams_for_hexagram(lines)
        
        # Get relating hexagram if there are changing lines
        relating_hexagram = None
        if changing_lines:
            transformed_lines = [8 if line == 9 else (7 if line == 6 else line) for line in lines]
            relating_number = calculate_hexagram_number(transformed_lines)
            logger.info(f"Calculated relating hexagram number: {relating_number}")
            relating_hexagram = readings.get(str(relating_number))
            if relating_hexagram:
                logger.info(f"Found relating hexagram: {relating_hexagram.name}")
                relating_hexagram.trigrams = get_trigrams_for_hexagram(transformed_lines)
        
        response = ReadingResponse(
            hexagram_number=hexagram_number,
            changing_lines=changing_lines,
            lines=lines,
            reading=reading,
            relating_hexagram=relating_hexagram
        )
        
        # Print the response as JSON to stdout
        print(json.dumps(response.dict()))
        logger.info("Successfully generated reading")
        return response
        
    except Exception as e:
        logger.error(f"Error generating reading: {str(e)}", exc_info=True)
        error_response = {
            "error": str(e),
            "type": type(e).__name__,
            "ai_generated": True
        }
        print(json.dumps(error_response), file=sys.stderr)
        sys.exit(1)

def get_hexagram_by_id(id_: int) -> HexagramData:
    """Get a specific hexagram by its number."""
    readings = load_readings()
    if str(id_) not in readings:
        raise ValueError(f"Invalid hexagram ID: {id_}")
    return readings[str(id_)]

def main() -> None:
    """Main entry point for command line usage."""
    try:
        logger.info("Starting divination.py")
        if len(sys.argv) > 1:
            try:
                logger.info(f"Received arguments: {sys.argv[1]}")
                options = DiviningOptions.parse_raw(sys.argv[1])
                generate_reading(options)
            except json.JSONDecodeError as e:
                logger.error(f"JSON decode error: {str(e)}")
                print(json.dumps({
                    "error": "Invalid JSON options provided",
                    "type": "JSONDecodeError",
                    "ai_generated": True
                }), file=sys.stderr)
                sys.exit(1)
        else:
            logger.info("No arguments provided, using defaults")
            generate_reading()
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main() 