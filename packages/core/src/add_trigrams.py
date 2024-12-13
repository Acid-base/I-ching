from typing import Optional, Dict, List
from pathlib import Path
import json
from pydantic import BaseModel, Field

class Trigram(BaseModel):
    name: str
    attribute: str
    chinese: str
    element: str
    image: str

class Trigrams(BaseModel):
    upper: Trigram
    lower: Trigram

class Line(BaseModel):
    number: int
    value: int
    meaning: str
    explanation: Optional[str] = None
    transforms_to: Optional[int] = None

class Nuclear(BaseModel):
    upper: Optional[int] = None
    lower: Optional[int] = None

class Judgment(BaseModel):
    text: str
    explanation: str

class Image(BaseModel):
    text: str
    explanation: str

class Hexagram(BaseModel):
    number: int
    name: str
    chinese: str
    pinyin: Optional[str] = None
    description: str
    alternate_names: List[str]
    element: str
    attribute: str
    judgment: Judgment
    image: Image
    nuclear: Nuclear
    reversed: Optional[int] = None
    opposite: int
# Define the basic trigrams
TRIGRAMS: Dict[str, Trigram] = {
    "Heaven": {
        "name": "Ch'ien",
        "attribute": "Strong",
        "chinese": "乾",
        "element": "Heaven",
        "image": "Heaven"
    },
    "Earth": {
        "name": "K'un",
        "attribute": "Yielding",
        "chinese": "坤",
        "element": "Earth",
        "image": "Earth"
    },
    "Thunder": {
        "name": "Chen",
        "attribute": "Moving",
        "chinese": "震",
        "element": "Thunder",
        "image": "Thunder"
    },
    "Water": {
        "name": "K'an",
        "attribute": "Dangerous",
        "chinese": "坎",
        "element": "Water",
        "image": "Water"
    },
    "Mountain": {
        "name": "Ken",
        "attribute": "Still",
        "chinese": "艮",
        "element": "Mountain",
        "image": "Mountain"
    },
    "Wind": {
        "name": "Sun",
        "attribute": "Gentle",
        "chinese": "巽",
        "element": "Wind",
        "image": "Wind"
    },
    "Fire": {
        "name": "Li",
        "attribute": "Clinging",
        "chinese": "離",
        "element": "Fire",
        "image": "Fire"
    },
    "Lake": {
        "name": "Tui",
        "attribute": "Joyous",
        "chinese": "兌",
        "element": "Lake",
        "image": "Lake"
    }
}

def get_trigrams_from_element(element_str: str) -> Optional[Trigrams]:
    """Extract upper and lower trigrams from element string (e.g., 'Fire over Lake')"""
    try:
        parts = element_str.split(" over ")
        if len(parts) != 2:
            print(f"Invalid element format: {element_str}")
            return None
            
        upper, lower = parts
        if upper not in TRIGRAMS or lower not in TRIGRAMS:
            print(f"Unknown trigram in element: {element_str}")
            return None
            
        return {
            "upper": TRIGRAMS[upper],
            "lower": TRIGRAMS[lower]
        }
    except Exception as error:
        print(f"Error processing element '{element_str}': {str(error)}")
        return None

def main() -> None:
    """Add trigrams to all hexagrams in the readings.json file."""
    json_path = Path("packages/core/src/data/readings.json")
    
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            readings: list[dict[str, Any]] = json.load(f)
        
        # Add trigrams to each hexagram
        modified_count = 0
        for hexagram in readings:
            if "element" in hexagram:
                trigrams = get_trigrams_from_element(hexagram["element"])
                if trigrams:
                    hexagram["trigrams"] = trigrams
                    modified_count += 1
        
        # Write back the updated JSON
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(readings, f, ensure_ascii=False, indent=4)
        
        print(f"Successfully added trigrams to {modified_count} hexagrams.")
        
    except FileNotFoundError:
        print(f"Error: Could not find file at {json_path}")
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in readings file: {str(e)}")
    except Exception as e:
        print(f"Unexpected error: {str(e)}")

if __name__ == "__main__":
    main() 