"""
Core implementation of the I Ching yarrow stalk divination method.
This module provides a correct implementation of the traditional yarrow stalk
algorithm with the verified probability distribution:

- Old Yin (6): 1/16 (6.25%)
- Young Yang (7): 5/16 (31.25%)
- Young Yin (8): 7/16 (43.75%)
- Old Yang (9): 3/16 (18.75%)
"""

import json
import os
import random
from typing import Any, Dict, List, Optional

# --- Constants ---
TOTAL_STALKS = 50
ASIDE_STALK = 1
WORKING_STALKS = TOTAL_STALKS - ASIDE_STALK  # 49
DEFAULT_JSON_PATH = "../data/hexagrams.json"


# --- Yarrow Stalk Casting Functions ---
def get_value_from_remainder(remainder_count: int) -> int:
    """Determines the numerical value (2 or 3) based on the remainder pile size."""
    if remainder_count == 5 or remainder_count == 4:
        return 3
    if remainder_count == 9 or remainder_count == 8:
        return 2
    raise ValueError(f"Invalid remainder count encountered: {remainder_count}")


def perform_division(stalks_in: int) -> tuple[int, int]:
    """
    Simulates one stage of dividing the yarrow stalks.

    Args:
        stalks_in: Number of stalks available for division

    Returns:
        Tuple of (remainder, remaining_stalks)
    """
    if stalks_in < 2:
        raise ValueError(f"Not enough stalks for division: {stalks_in}")

    # Ensure division results in at least one stalk per pile
    if stalks_in == 2:
        left_pile = 1
    else:
        left_pile = random.randint(1, stalks_in - 1)

    right_pile = stalks_in - left_pile

    # Take one stalk between fingers
    finger_stalk = 1
    right_pile -= 1

    if right_pile < 0:
        raise ValueError("Right pile count became invalid after taking finger stalk.")

    # Count stalks in groups of 4 and find remainders
    remainder_left = left_pile % 4
    if remainder_left == 0:
        remainder_left = 4
    counted_left = left_pile - remainder_left

    remainder_right = right_pile % 4
    if remainder_right == 0:
        remainder_right = 4
    counted_right = right_pile - remainder_right

    # Calculate totals
    total_remainder_this_stage = remainder_left + remainder_right + finger_stalk
    stalks_for_next_stage = counted_left + counted_right

    return total_remainder_this_stage, stalks_for_next_stage


def generate_one_line(seed: Optional[int] = None) -> int:
    """
    Performs the three division stages to generate a single I Ching line value.

    Args:
        seed: Optional random seed for reproducible results

    Returns:
        Line value: 6 (Old Yin), 7 (Young Yang), 8 (Young Yin), or 9 (Old Yang)
    """
    if seed is not None:
        random.seed(seed)

    current_stalks = WORKING_STALKS
    stage_values = []

    for stage in range(1, 4):
        total_remainder, stalks_for_next_stage = perform_division(current_stalks)
        stage_value = get_value_from_remainder(total_remainder)
        stage_values.append(stage_value)
        current_stalks = stalks_for_next_stage

        # Check if we have enough stalks for the next stage
        if stage < 3 and stalks_for_next_stage <= 0 and current_stalks != 0:
            raise ValueError(f"Ran out of stalks prematurely at stage {stage + 1} with {stalks_for_next_stage}")

    # Convert the three stage values to line value
    final_line_value = sum(stage_values)

    # Map sum to I Ching line values
    if final_line_value == 9:  # Sum is 9
        return 9  # Old Yang (changing)
    if final_line_value == 8:  # Sum is 8
        return 8  # Young Yin (non-changing)
    if final_line_value == 7:  # Sum is 7
        return 7  # Young Yang (non-changing)
    if final_line_value == 6:  # Sum is 6
        return 6  # Old Yin (changing)
    raise ValueError(f"Invalid line value: {final_line_value}")


def generate_hexagram(seed: Optional[int] = None, verbose: bool = False) -> List[int]:
    """
    Generates a complete hexagram (6 lines) using the yarrow stalk method.

    Args:
        seed: Optional random seed for reproducible results
        verbose: Whether to print details during casting

    Returns:
        List of 6 line values (6, 7, 8, or 9) from bottom to top
    """
    if seed is not None:
        random.seed(seed)

    hexagram_lines = []

    if verbose:
        print("Casting Hexagram with Yarrow Stalk Method...")

    for line_number in range(1, 7):
        line_value = generate_one_line()
        hexagram_lines.append(line_value)

        if verbose:
            if line_value == 6:
                line_type = "---X--- (Old Yin)"
            elif line_value == 7:
                line_type = "------- (Young Yang)"
            elif line_value == 8:
                line_type = "--- --- (Young Yin)"
            elif line_value == 9:
                line_type = "---O--- (Old Yang)"
            print(f"Line {line_number}: {line_value} {line_type}")

    if verbose:
        print("\nCast Complete.")

    return hexagram_lines


# --- Hexagram Calculation Functions ---
def get_trigram_value(lines: List[int]) -> int:
    """
    Converts three lines into a trigram value (0-7).
    Follows the traditional binary convention: Yang=1, Yin=0.

    Args:
        lines: List of 3 line values (6, 7, 8, or 9)

    Returns:
        Integer value of the trigram (0-7)
    """
    value = 0
    for i, line in enumerate(lines):
        # Yang lines (7, 9) are represented as 1
        if line == 7 or line == 9:
            value |= 1 << i
    return value


def get_trigram_name(value: int) -> str:
    """
    Get the traditional name of a trigram based on its value.

    Args:
        value: Integer value of the trigram (0-7)

    Returns:
        Name of the trigram
    """
    trigram_names = {
        0: "Earth",  # ☷ K'un
        1: "Mountain",  # ☶ Ken
        2: "Water",  # ☵ K'an
        3: "Wind",  # ☴ Sun
        4: "Thunder",  # ☳ Chen
        5: "Fire",  # ☲ Li
        6: "Lake",  # ☱ Tui
        7: "Heaven",  # ☰ Ch'ien
    }
    return trigram_names.get(value, "Unknown")


def get_hexagram_number(lines: List[int]) -> int:
    """
    Converts a list of 6 lines into the traditional King Wen hexagram number (1-64).

    Args:
        lines: List of 6 line values (6, 7, 8, or 9), from bottom to top

    Returns:
        Hexagram number according to the King Wen sequence (1-64)
    """
    # Split into lower and upper trigrams
    lower_trigram = lines[:3]
    upper_trigram = lines[3:]

    # Get trigram values
    lower_value = get_trigram_value(lower_trigram)
    upper_value = get_trigram_value(upper_trigram)

    # Calculate hexagram number according to the King Wen sequence
    # The keys are formatted as "{upper_value}_{lower_value}"
    king_wen_map = {
        "7_7": 1,  # Heaven over Heaven (Ch'ien)
        "0_0": 2,  # Earth over Earth (K'un)
        "7_2": 3,  # Heaven over Water (Difficulty)
        "2_7": 4,  # Water over Heaven (Youthful Folly)
        "7_3": 5,  # Heaven over Wind/Wood (Waiting)
        "3_7": 6,  # Wind/Wood over Heaven (Conflict)
        "0_2": 7,  # Earth over Water (Army)
        "2_0": 8,  # Water over Earth (Holding Together)
        "3_7": 9,  # Wind over Heaven (Small Taming)
        "7_3": 10,  # Heaven over Wind/Wood (Treading)
        "0_7": 11,  # Earth over Heaven (Peace)
        "7_0": 12,  # Heaven over Earth (Standstill)
        "7_5": 13,  # Heaven over Fire (Fellowship)
        "5_7": 14,  # Fire over Heaven (Great Possession)
        "0_1": 15,  # Earth over Mountain (Modesty)
        "1_0": 16,  # Mountain over Earth (Enthusiasm)
        "3_6": 17,  # Wind/Wood over Lake (Following)
        "6_3": 18,  # Lake over Wind/Wood (Work on the Decayed)
        "0_5": 19,  # Earth over Fire (Approach)
        "5_0": 20,  # Fire over Earth (Contemplation)
        "5_6": 21,  # Fire over Lake (Biting Through)
        "6_5": 22,  # Lake over Fire (Grace)
        "1_0": 23,  # Mountain over Earth (Splitting Apart)
        "0_1": 24,  # Earth over Mountain (Return)
        "7_6": 25,  # Heaven over Lake (Innocence)
        "6_7": 26,  # Lake over Heaven (Great Taming)
        "1_0": 27,  # Mountain over Earth (Mouth Corners)
        "3_3": 28,  # Wind/Wood over Wind/Wood (Great Excess)
        "2_2": 29,  # Water over Water (The Abysmal)
        "5_5": 30,  # Fire over Fire (The Clinging)
        "6_1": 31,  # Lake over Mountain (Influence)
        "1_6": 32,  # Mountain over Lake (Duration)
        "7_1": 33,  # Heaven over Mountain (Retreat)
        "1_7": 34,  # Mountain over Heaven (Great Power)
        "5_0": 35,  # Fire over Earth (Progress)
        "0_5": 36,  # Earth over Fire (Darkening of the Light)
        "3_5": 37,  # Wind/Wood over Fire (The Family)
        "5_3": 38,  # Fire over Wind/Wood (Opposition)
        "2_1": 39,  # Water over Mountain (Obstruction)
        "1_2": 40,  # Mountain over Water (Deliverance)
        "6_1": 41,  # Lake over Mountain (Decrease)
        "1_6": 42,  # Mountain over Lake (Increase)
        "6_7": 43,  # Lake over Heaven (Breakthrough)
        "7_6": 44,  # Heaven over Lake (Coming to Meet)
        "0_6": 45,  # Earth over Lake (Gathering Together)
        "6_0": 46,  # Lake over Earth (Pushing Upward)
        "2_6": 47,  # Water over Lake (Oppression)
        "6_2": 48,  # Lake over Water (The Well)
        "6_5": 49,  # Lake over Fire (Revolution)
        "5_6": 50,  # Fire over Lake (The Cauldron)
        "1_4": 51,  # Mountain over Thunder (The Arousing)
        "4_1": 52,  # Thunder over Mountain (Keeping Still)
        "3_1": 53,  # Wind/Wood over Mountain (Development)
        "1_3": 54,  # Mountain over Wind/Wood (The Marrying Maiden)
        "4_5": 55,  # Thunder over Fire (Abundance)
        "5_4": 56,  # Fire over Thunder (The Wanderer)
        "3_3": 57,  # Wind/Wood over Wind/Wood (The Gentle)
        "6_6": 58,  # Lake over Lake (The Joyous)
        "3_2": 59,  # Wind/Wood over Water (Dispersion)
        "2_3": 60,  # Water over Wind/Wood (Limitation)
        "3_6": 61,  # Wind/Wood over Lake (Inner Truth)
        "1_4": 62,  # Mountain over Thunder (Small Excess)
        "2_5": 63,  # Water over Fire (After Completion)
        "5_2": 64,  # Fire over Water (Before Completion)
    }

    # Lookup the hexagram number
    key = f"{upper_value}_{lower_value}"

    # If not found in the map, calculate it based on binary position
    if key not in king_wen_map:
        # Fallback calculation method (less traditional)
        binary_value = 0
        for i, line in enumerate(lines):
            if line == 7 or line == 9:  # Yang lines
                binary_value |= 1 << i
        return binary_value + 1

    return king_wen_map[key]


def get_transformed_lines(lines: List[int]) -> List[int]:
    """
    Transforms lines with changing values (6 or 9) into their stable opposites.

    Args:
        lines: List of line values (6, 7, 8, 9)

    Returns:
        List of transformed line values
    """
    transformed = []
    for line in lines:
        if line == 6:  # Old Yin becomes Young Yang
            transformed.append(7)
        elif line == 9:  # Old Yang becomes Young Yin
            transformed.append(8)
        else:  # Stable lines remain unchanged
            transformed.append(line)
    return transformed


def get_changing_line_indices(lines: List[int]) -> List[int]:
    """
    Gets the indices of changing lines (6 or 9).

    Args:
        lines: List of line values (6, 7, 8, 9)

    Returns:
        List of indices (0-based) for changing lines
    """
    return [i for i, line in enumerate(lines) if line == 6 or line == 9]


# --- JSON Loading and Reading Functions ---
def load_hexagram_data(filepath: str = DEFAULT_JSON_PATH) -> Dict[int, Dict[str, Any]]:
    """
    Loads hexagram data from a JSON file into a dictionary keyed by number.

    Args:
        filepath: Path to the JSON file containing hexagram data

    Returns:
        Dictionary of hexagram data indexed by hexagram number
    """
    # Try to find the JSON file in a few possible locations
    paths_to_try = [
        filepath,
        os.path.join(os.path.dirname(__file__), filepath),
        os.path.join(os.path.dirname(os.path.dirname(__file__)), filepath),
    ]

    for path in paths_to_try:
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)

                # Convert list of hexagrams into a dict keyed by 'number'
                hex_dict = {item["number"]: item for item in data}

                # Validation: Ensure we have all 64 hexagrams
                missing_numbers = set(range(1, 65)) - set(hex_dict.keys())
                if missing_numbers:
                    print(f"Warning: Missing hexagrams {sorted(missing_numbers)} in data")

                print(f"Successfully loaded data for {len(hex_dict)} hexagrams from {path}")
                return hex_dict

        except (FileNotFoundError, json.JSONDecodeError, KeyError):
            continue

    print(f"Error: Could not load hexagram data from any tried paths: {paths_to_try}")
    return {}


def print_reading(lines: List[int], hexagram_data: Dict[int, Dict[str, Any]]) -> None:
    """
    Prints a complete I Ching reading in a human-readable format.

    Args:
        lines: List of 6 line values (6, 7, 8, 9)
        hexagram_data: Dictionary of hexagram data indexed by hexagram number
    """
    if not hexagram_data:
        print("Error: Hexagram data not loaded")
        return

    # Get basic information
    changing_indices = get_changing_line_indices(lines)
    primary_hex_num = get_hexagram_number(lines)

    # Get primary hexagram data
    primary_hexagram = hexagram_data.get(primary_hex_num)
    if not primary_hexagram:
        print(f"Error: Primary hexagram number {primary_hex_num} not found in data")
        return

    # Split into trigrams
    lower_trigram = lines[:3]
    upper_trigram = lines[3:]
    lower_value = get_trigram_value(lower_trigram)
    upper_value = get_trigram_value(upper_trigram)

    # Print primary hexagram
    print("\n" + "=" * 60)
    print(f"HEXAGRAM {primary_hex_num}: {primary_hexagram['name']}")
    if "chineseName" in primary_hexagram:
        print(f"Chinese: {primary_hexagram['chineseName']}")
    print("=" * 60)

    # Print hexagram visually
    print("\nHexagram Structure (Top to Bottom):")
    for i in range(5, -1, -1):  # Print from top line (index 5) to bottom (index 0)
        line_val = lines[i]
        if line_val == 6:
            line_type = "---X--- (Old Yin)"
        elif line_val == 7:
            line_type = "------- (Young Yang)"
        elif line_val == 8:
            line_type = "--- --- (Young Yin)"
        elif line_val == 9:
            line_type = "---O--- (Old Yang)"
        print(f"Line {i + 1}: {line_type}")

    # Print trigram information
    print(f"\nUpper Trigram: {get_trigram_name(upper_value)}")
    print(f"Lower Trigram: {get_trigram_name(lower_value)}")

    # Print judgment and image
    print("\nJUDGMENT:")
    print(primary_hexagram.get("judgment", "Not available"))

    print("\nIMAGE:")
    print(primary_hexagram.get("image", "Not available"))

    # Print changing lines
    if changing_indices:
        print("\nCHANGING LINES:")
        for idx in changing_indices:
            line_number = idx + 1  # Convert 0-based index to 1-based line number

            # Find the line meaning in the primary hexagram
            line_meaning = "Meaning not found"
            if "lines" in primary_hexagram:
                for line_data in primary_hexagram["lines"]:
                    if line_data.get("lineNumber") == line_number:
                        line_meaning = line_data.get("meaning", "Meaning not found")
                        break

            print(f"\nLine {line_number}:")
            print(line_meaning)

        # Print transformed hexagram
        transformed_lines = get_transformed_lines(lines)
        transformed_hex_num = get_hexagram_number(transformed_lines)
        transformed_hexagram = hexagram_data.get(transformed_hex_num)

        if transformed_hexagram:
            print("\n" + "-" * 60)
            print(f"TRANSFORMED INTO HEXAGRAM {transformed_hex_num}: {transformed_hexagram['name']}")
            if "chineseName" in transformed_hexagram:
                print(f"Chinese: {transformed_hexagram['chineseName']}")
            print("-" * 60)

            print("\nJUDGMENT:")
            print(transformed_hexagram.get("judgment", "Not available"))

            print("\nIMAGE:")
            print(transformed_hexagram.get("image", "Not available"))
    else:
        print("\nNo changing lines.")

    print("\n" + "=" * 60)


# --- Main Functions ---
def cast_hexagram(seed: Optional[int] = None, verbose: bool = False) -> Dict[str, Any]:
    """
    Performs a complete I Ching reading using the yarrow stalk method.

    Args:
        seed: Optional random seed for reproducible results
        verbose: Whether to print details during the process

    Returns:
        Dictionary containing the cast results
    """
    # Cast the hexagram
    lines = generate_hexagram(seed=seed, verbose=verbose)

    # Get basic information
    changing_indices = get_changing_line_indices(lines)
    primary_hex_num = get_hexagram_number(lines)

    # Get trigram information
    lower_trigram = lines[:3]
    upper_trigram = lines[3:]
    lower_value = get_trigram_value(lower_trigram)
    upper_value = get_trigram_value(upper_trigram)

    # Build result dictionary
    result = {
        "lines": lines,
        "changing_line_indices": changing_indices,
        "primary_hexagram_number": primary_hex_num,
        "trigrams": {
            "lower": {"value": lower_value, "name": get_trigram_name(lower_value)},
            "upper": {"value": upper_value, "name": get_trigram_name(upper_value)},
        },
    }

    # Add transformed hexagram if there are changing lines
    if changing_indices:
        transformed_lines = get_transformed_lines(lines)
        transformed_hex_num = get_hexagram_number(transformed_lines)
        result["transformed_hexagram_number"] = transformed_hex_num
        result["transformed_lines"] = transformed_lines

    return result


def get_reading(
    mode: str = "yarrow", seed: Optional[int] = None, verbose: bool = False, print_result: bool = False
) -> Dict[str, Any]:
    """
    Generates a complete I Ching reading.

    Args:
        mode: The divination method ('yarrow' only for now)
        seed: Optional random seed for reproducible results
        verbose: Whether to print details during the process
        print_result: Whether to print the complete reading

    Returns:
        Dictionary containing the complete reading
    """
    # Load hexagram data
    hexagram_data = load_hexagram_data()
    if not hexagram_data:
        return {"error": "Failed to load hexagram data"}

    # Cast hexagram
    cast_result = cast_hexagram(seed=seed, verbose=verbose)

    # If requested, print the complete reading
    if print_result:
        print_reading(cast_result["lines"], hexagram_data)

    # Return cast result and hexagram data
    result = {"cast_result": cast_result, "primary_hexagram": hexagram_data.get(cast_result["primary_hexagram_number"])}

    # Add transformed hexagram if there are changing lines
    if "transformed_hexagram_number" in cast_result:
        result["transformed_hexagram"] = hexagram_data.get(cast_result["transformed_hexagram_number"])

    return result


if __name__ == "__main__":
    # Basic test - cast a hexagram and print the reading
    get_reading(verbose=True, print_result=True)
