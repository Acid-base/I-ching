"""Core implementation of the I Ching yarrow stalk divination method."""

import json
import os
import random
import traceback
from typing import Any, Dict, List, Optional, Tuple, cast

# Type aliases for better code readability
HexagramLines = List[int]
LineData = Dict[str, Any]
HexagramDataItem = Dict[str, Any]
HexagramData = Dict[int, HexagramDataItem]
CastResult = Dict[str, Any]
ReadingResult = Dict[str, Any]

# Constants
TOTAL_STALKS: int = 50
ASIDE_STALK: int = 1
WORKING_STALKS: int = TOTAL_STALKS - ASIDE_STALK
DEFAULT_JSON_PATH: str = os.path.join(os.path.dirname(__file__), "..", "data", "hexagrams.json")

# Trigram values and names
TRIGRAM_VALUES = {"Earth": 0, "Mountain": 1, "Water": 2, "Wind": 3, "Thunder": 4, "Fire": 5, "Lake": 6, "Heaven": 7}
TRIGRAM_NAMES = {v: k for k, v in TRIGRAM_VALUES.items()}

# King Wen sequence mapping
KING_WEN_MAP = {
    "7_7": 1,
    "0_0": 2,
    "2_4": 3,
    "1_2": 4,
    "2_7": 5,
    "7_2": 6,
    "0_2": 7,
    "2_0": 8,
    "3_7": 9,
    "7_6": 10,
    "0_7": 11,
    "7_0": 12,
    "7_5": 13,
    "5_7": 14,
    "0_1": 15,
    "4_0": 16,
    "6_4": 17,
    "1_3": 18,
    "0_6": 19,
    "3_0": 20,
    "5_4": 21,
    "1_5": 22,
    "1_0": 23,
    "0_4": 24,
    "7_4": 25,
    "1_7": 26,
    "1_4": 27,
    "6_3": 28,
    "2_2": 29,
    "5_5": 30,
    "6_1": 31,
    "4_3": 32,
    "7_1": 33,
    "4_7": 34,
    "5_0": 35,
    "0_5": 36,
    "3_5": 37,
    "5_3": 38,
    "2_1": 39,
    "4_2": 40,
    "1_6": 41,
    "3_4": 42,
    "6_7": 43,
    "7_3": 44,
    "6_0": 45,
    "0_3": 46,
    "6_2": 47,
    "2_6": 48,
    "6_5": 49,
    "5_6": 50,
    "4_4": 51,
    "1_1": 52,
    "3_1": 53,
    "4_6": 54,
    "4_5": 55,
    "5_1": 56,
    "3_3": 57,
    "6_6": 58,
    "3_2": 59,
    "2_3": 60,
    "3_6": 61,
    "4_1": 62,
    "2_5": 63,
    "5_2": 64,
}


def get_value_from_remainder(remainder_count: int) -> int:
    """Convert remainder count to numerical value."""
    if remainder_count in (4, 5):
        return 3
    if remainder_count in (8, 9):
        return 2
    raise ValueError(f"Invalid remainder count: {remainder_count}")


def perform_division(stalks_in: int) -> Tuple[int, int]:
    """Perform one division of the yarrow stalks."""
    if stalks_in < 4:
        raise ValueError(f"Not enough stalks for division: {stalks_in}")

    finger_stalk = 1
    remaining = stalks_in - finger_stalk

    right_pile = random.randint(1, remaining - 1)
    left_pile = remaining - right_pile

    remainder_left = left_pile % 4 or 4
    remainder_right = right_pile % 4 or 4

    total_remainder = remainder_left + remainder_right + finger_stalk
    stalks_for_next = left_pile - remainder_left + right_pile - remainder_right

    if total_remainder not in [4, 5, 8, 9]:
        raise ValueError(f"Invalid total remainder: {total_remainder}")

    return total_remainder, stalks_for_next


def generate_line(seed: Optional[int] = None) -> int:
    """Generate a single line value using the yarrow stalk method."""
    if seed is not None:
        random.seed(seed)

    current_stalks = WORKING_STALKS
    values = []

    for _ in range(3):
        remainder, current_stalks = perform_division(current_stalks)
        values.append(get_value_from_remainder(remainder))

    return sum(values)


def generate_hexagram(seed: Optional[int] = None) -> List[int]:
    """Generate all six lines of a hexagram."""
    if seed is not None:
        random.seed(seed)
    return [generate_line() for _ in range(6)]


def get_changing_line_indices(lines: List[int]) -> List[int]:
    """Get indices of changing lines (6 or 9)."""
    return [i for i, line in enumerate(lines) if line in (6, 9)]


def get_trigram_value(lines: List[int]) -> int:
    """Convert three lines into a trigram value."""
    if len(lines) != 3:
        raise ValueError(f"Trigram must have 3 lines, got {len(lines)}")

    value = 0
    for i, line in enumerate(lines):
        if line in (7, 9):  # Yang lines
            value |= 1 << i
    return value


def get_hexagram_number(lines: List[int]) -> int:
    """Get the King Wen sequence number for a hexagram."""
    if len(lines) != 6:
        raise ValueError(f"Hexagram must have 6 lines, got {len(lines)}")

    lower = get_trigram_value(lines[:3])
    upper = get_trigram_value(lines[3:])
    key = f"{upper}_{lower}"

    number = KING_WEN_MAP.get(key)
    if number is None:
        raise ValueError(f"Invalid trigram combination: {key}")

    return number


def transform_lines(lines: List[int]) -> List[int]:
    """Transform changing lines (6->7, 9->8)."""
    return [7 if line == 6 else 8 if line == 9 else line for line in lines]


def load_hexagram_data(filepath: str = DEFAULT_JSON_PATH) -> Dict[int, Any]:
    """Load hexagram data from JSON file."""
    try:
        if not os.path.exists(filepath):
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            dummy_data = {str(i): {"number": i, "name": f"Hex_{i}"} for i in range(1, 65)}
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(dummy_data, f, indent=2)

        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            return {int(k): v for k, v in data.items()}
    except Exception as e:
        print(f"Error loading hexagram data: {e}")
        return {}


def get_reading(
    seed: Optional[int] = None,
    verbose: bool = False,
    print_result: bool = False,
    mode: Optional[str] = None,  # Ignored but accepted for API compatibility
) -> ReadingResult:
    """Generate a complete I Ching reading."""
    try:
        # Load hexagram data
        hexagram_data = load_hexagram_data()
        if not hexagram_data:
            return {"error": "Failed to load hexagram data"}

        # Generate hexagram
        lines = generate_hexagram(seed)
        changing_indices = get_changing_line_indices(lines)
        primary_number = get_hexagram_number(lines)

        # Build cast result
        cast_result = {
            "lines": lines,
            "changing_line_indices": changing_indices,
            "primary_hexagram_number": primary_number,
        }

        # Add transformed hexagram if there are changing lines
        if changing_lines:
            transformed = transform_lines(lines)
            transformed_number = get_hexagram_number(transformed)
            cast_result["transformed_hexagram_number"] = transformed_number
            cast_result["transformed_lines"] = transformed

        # Build final result
        result = {
            "cast_result": cast_result,
            "primary_hexagram": hexagram_data[primary_number],
        }

        if changing_lines:
            result["transformed_hexagram"] = hexagram_data[cast_result["transformed_hexagram_number"]]

        return result

    except Exception as e:
        return {"error": f"Error generating reading: {str(e)}"}


def print_reading(lines: HexagramLines, hexagram_data: HexagramData) -> None:
    """Prints a complete I Ching reading."""
    if not hexagram_data:
        print("Error: Hexagram data empty.")
        return
    if not lines or len(lines) != 6:
        print(f"Error: Invalid lines: {lines}")
        return

    try:
        changing_indices: List[int] = get_changing_line_indices(lines)
        transformed_lines = transform_lines(lines)
        primary_hex_num: int = get_hexagram_number(lines)
        primary_hexagram: Optional[HexagramDataItem] = hexagram_data.get(primary_hex_num)
        if not primary_hexagram:
            # This case should be less likely now due to load_hexagram_data guarantees
            print(f"Error: Primary hex data {primary_hex_num} missing.")
            primary_hexagram = cast(
                HexagramDataItem,
                {
                    "number": primary_hex_num,
                    "name": f"Hex_{primary_hex_num}_Error",
                    "judgment": "Error",
                    "image": "Error",
                    "lines": [],
                },
            )

        lower_value: int = get_trigram_value(lines[:3])
        upper_value: int = get_trigram_value(lines[3:])
        lower_name: str = get_trigram_name(lower_value)
        upper_name: str = get_trigram_name(upper_value)

        print("\n" + "=" * 60)
        print(f"HEXAGRAM {primary_hex_num}: {primary_hexagram.get('name', 'N/A')}")
        if "chineseName" in primary_hexagram:
            print(f"Chinese: {primary_hexagram.get('chineseName')}")
        print("=" * 60)
        print("\nHexagram Structure (Top to Bottom):")
        for i in range(5, -1, -1):
            line_val: int = lines[i]
            line_type: str
            if line_val == 6:
                line_type = "---X--- (Old Yin)"
            elif line_val == 7:
                line_type = "------- (Young Yang)"
            elif line_val == 8:
                line_type = "--- --- (Young Yin)"
            elif line_val == 9:
                line_type = "---O--- (Old Yang)"
            else:
                line_type = f"Invalid ({line_val})"
            print(f"Line {i + 1}: {line_type}")
        print(f"\nUpper Trigram: {upper_name} ({upper_value})")
        print(f"Lower Trigram: {lower_name} ({lower_value})")
        print("\nJUDGMENT:")
        print(primary_hexagram.get("judgment", "N/A"))
        print("\nIMAGE:")
        print(primary_hexagram.get("image", "N/A"))

        if changing_indices:
            print("\nCHANGING LINES:")
            for idx in sorted(changing_indices):
                line_number: int = idx + 1
                line_meaning: str = "Meaning not found"
                # primary_hexagram is guaranteed to be a dict here (even if dummy)
                primary_lines_list = cast(List[LineData], primary_hexagram.get("lines", []))
                if isinstance(primary_lines_list, list):
                    for line_data in primary_lines_list:
                        # Removed unnecessary isinstance(line_data, dict) check
                        if line_data.get("lineNumber") == line_number:
                            line_meaning = cast(str, line_data.get("meaning", "Meaning not found"))
                            break
                print(f"\nLine {line_number}:\n{line_meaning}")

            transformed_lines: HexagramLines = get_transformed_lines(lines)
            transformed_hex_num: int = get_hexagram_number(transformed_lines)
            transformed_hexagram: Optional[HexagramDataItem] = hexagram_data.get(transformed_hex_num)
            # transformed_hexagram should also exist due to load_hexagram_data guarantees
            if not transformed_hexagram:
                print(f"\nWarning: Transformed hex data {transformed_hex_num} missing despite load guarantees.")
                transformed_hexagram = cast(
                    HexagramDataItem,
                    {
                        "number": transformed_hex_num,
                        "name": f"Hex_{transformed_hex_num}_Error",
                        "judgment": "N/A",
                        "image": "N/A",
                        "lines": [],
                    },
                )

            print("\n" + "-" * 60)
            print(f"TRANSFORMED INTO HEXAGRAM {transformed_hex_num}: {transformed_hexagram.get('name', 'N/A')}")
            if "chineseName" in transformed_hexagram:
                print(f"Chinese: {transformed_hexagram.get('chineseName')}")
            print("-" * 60)
            print("\nJUDGMENT:")
            print(transformed_hexagram.get("judgment", "N/A"))
            print("\nIMAGE:")
            print(transformed_hexagram.get("image", "N/A"))

        else:
            print("\nNo changing lines.")
        print("\n" + "=" * 60)
    except ValueError as ve:
        print(f"\nError calculating hex details: {ve}")
        traceback.print_exc()
    except Exception as e:
        print(f"\nUnexpected error printing reading: {e}")
        traceback.print_exc()


def get_trigram_name(value: int) -> str:
    """Get the traditional name of a trigram based on its value."""
    return TRIGRAM_NAMES.get(value, "Unknown")


if __name__ == "__main__":
    print("Running Yarrow Stalk Divination Test...")
    TEST_SEED: int = 12345
    reading_result: ReadingResult = get_reading(seed=TEST_SEED, verbose=False, print_result=True)

    print("\nProgrammatic Access Example:")
    if "error" in reading_result:
        print(f"Error: {reading_result['error']}")
    else:
        cast_res = cast(CastResult, reading_result.get("cast_result", {}))
        primary_hex = cast(Optional[HexagramDataItem], reading_result.get("primary_hexagram"))
        transformed_hex = cast(Optional[HexagramDataItem], reading_result.get("transformed_hexagram"))
        if not cast_res:
            print("Error: Cast result missing.")
        elif not primary_hex:
            print("Error: Primary hexagram data missing in result.")
        else:
            primary_num = cast_res.get("primary_hexagram_number")
            primary_name = primary_hex.get("name", "N/A")
            print(f"Primary Hexagram: {primary_num} ({primary_name})")
            print(f"Lines: {cast_res.get('lines')}")
            print(f"Changing Indices: {cast_res.get('changing_line_indices')}")
            transformed_num = cast_res.get("transformed_hexagram_number")
            if transformed_num is not None:
                if transformed_hex:
                    transformed_name = transformed_hex.get("name", "N/A")
                    print(f"Transformed Hexagram: {transformed_num} ({transformed_name})")
                else:
                    # This case should be less likely now
                    print(f"Transformed Hexagram: {transformed_num} (Data Missing!)")
            elif cast_res.get("changing_line_indices"):
                # This case implies changing lines but no transformed number, which shouldn't happen
                print("Error: Changing lines present but no transformed hexagram number.")
            else:
                print("No changing lines.")

    print("\nTesting get_hexagram_number slice logic...")
    try:
        test_lines_1 = [7, 7, 7, 7, 7, 7]  # Hex 1
        num_1 = get_hexagram_number(test_lines_1)
        print(f"Lines {test_lines_1} -> Hexagram {num_1} (Expected 1)")
        assert num_1 == 1
        test_lines_2 = [8, 8, 8, 8, 8, 8]  # Hex 2
        num_2 = get_hexagram_number(test_lines_2)
        print(f"Lines {test_lines_2} -> Hexagram {num_2} (Expected 2)")
        assert num_2 == 2
        test_lines_3 = [
            7,
            7,
            7,
            8,
            8,
            8,
        ]  # Hex 12 (Heaven over Earth) - Lower 777, Upper 888
        num_3 = get_hexagram_number(test_lines_3)
        print(f"Lines {test_lines_3} -> Hexagram {num_3} (Expected 12)")
        assert num_3 == 12
        test_lines_4 = [
            8,
            8,
            8,
            7,
            7,
            7,
        ]  # Hex 11 (Earth over Heaven) - Lower 888, Upper 777
        num_4 = get_hexagram_number(test_lines_4)
        print(f"Lines {test_lines_4} -> Hexagram {num_4} (Expected 11)")
        assert num_4 == 11
        print("Slice logic test passed.")
    except Exception as e:
        print(f"Slice logic test failed: {e}")
        traceback.print_exc()
