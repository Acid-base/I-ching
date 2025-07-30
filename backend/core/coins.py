"""Core implementation of the I Ching three coins divination method."""

import os
import random
import traceback
from typing import List, Optional, TypedDict

# Import required functions from yarrow.py
from .yarrow import (
    get_changing_line_indices,
    get_hexagram_number,
    load_hexagram_data,
    transform_lines,
)


# Type definitions
class HexagramData(TypedDict):
    name: str
    number: int
    description: str
    judgment: str
    image: str


class CastResult(TypedDict):
    lines: List[int]
    changing_line_indices: List[int]
    primary_hexagram_number: int
    transformed_hexagram_number: Optional[int]
    transformed_lines: Optional[List[int]]


class ReadingResult(TypedDict, total=False):
    cast_result: CastResult
    primary_hexagram: HexagramData
    transformed_hexagram: HexagramData
    error: str


# Constants
DEFAULT_JSON_PATH: str = os.path.join(os.path.dirname(__file__), "..", "data", "hexagrams.json")


def toss_three_coins(seed: Optional[int] = None) -> int:
    """Generate a single line value using three coins."""
    try:
        if seed is not None:
            random.seed(seed)

        coins = [random.choice([2, 3]) for _ in range(3)]
        total = sum(coins)

        # Map totals to line values
        value_map = {6: 8, 7: 7, 8: 9, 9: 6}
        return value_map[total]
    except Exception as e:
        raise ValueError(f"Error in toss_three_coins: {str(e)}") from e


def generate_hexagram(seed: Optional[int] = None, verbose: bool = False) -> List[int]:
    """Generate a complete hexagram using the three coins method."""
    try:
        if seed is not None:
            random.seed(seed)

        lines: List[int] = []
        for line_num in range(6):
            line_value = toss_three_coins()
            lines.append(line_value)

            if verbose:
                line_type = ""
                if line_value == 6:
                    line_type = "---X--- (Old Yin)"
                elif line_value == 7:
                    line_type = "------- (Young Yang)"
                elif line_value == 8:
                    line_type = "--- --- (Young Yin)"
                elif line_value == 9:
                    line_type = "---O--- (Old Yang)"
                print(f"Line {line_num + 1}: {line_type}")

        return lines
    except Exception as e:
        raise ValueError(f"Error in generate_hexagram: {str(e)}") from e


def get_reading(
    seed: Optional[int] = None,
    verbose: bool = False,
    print_result: bool = False,
    mode: Optional[str] = None,  # mode parameter is ignored but accepted for API compatibility
) -> ReadingResult:
    """Generate a complete I Ching reading using the three coins method."""
    try:
        # Load hexagram data
        hexagram_data = load_hexagram_data()
        if not hexagram_data:
            return {"error": "Failed to load hexagram data"}

        # Generate hexagram
        lines = generate_hexagram(seed=seed, verbose=verbose)
        changing_lines = get_changing_line_indices(lines)
        primary_number = int(get_hexagram_number(lines))

        # Verify we can find the primary hexagram
        if primary_number not in hexagram_data:
            return {"error": f"Invalid hexagram number: {primary_number}"}

        # Build cast result
        cast_result: CastResult = {
            "lines": lines,
            "changing_line_indices": changing_lines,
            "primary_hexagram_number": primary_number,
            "transformed_hexagram_number": None,
            "transformed_lines": None,
        }

        # Initialize the reading result
        result: ReadingResult = {
            "cast_result": cast_result,
            "primary_hexagram": hexagram_data[primary_number],
        }

        # Add transformed hexagram if there are changing lines
        if changing_lines:
            transformed = transform_lines(lines)
            transformed_number = int(get_hexagram_number(transformed))
            # Verify we can find the transformed hexagram
            if transformed_number in hexagram_data:
                cast_result["transformed_hexagram_number"] = transformed_number
                cast_result["transformed_lines"] = transformed
                result["transformed_hexagram"] = hexagram_data[transformed_number]
                if print_result:
                    print("\nReading Result:")
                    print(f"Primary Hexagram: {result['primary_hexagram']['name']} (#{primary_number})")
                    print(f"Changing Lines: {changing_lines}")
                    print(f"Transformed Hexagram: {result['transformed_hexagram']['name']} (#{transformed_number})")
            else:
                if print_result:
                    print("\nReading Result:")
                    print(f"Primary Hexagram: {result['primary_hexagram']['name']} (#{primary_number})")
                    print(f"Changing Lines: {changing_lines}")
                    print("Transformed Hexagram not found.")

        return result

    except Exception as e:
        traceback.print_exc()  # Print the full stacktrace for debugging
        return {"error": f"Error generating reading: {str(e)}"}
