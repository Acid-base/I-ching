"""Core implementation of the I Ching coin toss divination method.
This module provides the three-coin method which has a different probability distribution than yarrow stalks:

- Old Yin (6): 2/16 (12.5%)
- Young Yang (7): 6/16 (37.5%)
- Young Yin (8): 6/16 (37.5%)
- Old Yang (9): 2/16 (12.5%)
"""

import random

# Correctly sorted imports
from typing import Any, Dict, List, Optional

from .yarrow import (  # Reuse functions from yarrow module
    get_changing_line_indices,
    get_hexagram_number,
    get_transformed_lines,
    get_trigram_name,
    get_trigram_value,
    load_hexagram_data,
    print_reading,
)


def toss_three_coins(seed: Optional[int] = None) -> int:
    """Performs one three-coin toss to generate a single I Ching line value.

    Args:
        seed: Optional random seed for reproducible results

    Returns:
        Line value: 6 (Old Yin), 7 (Young Yang), 8 (Young Yin), or 9 (Old Yang)
    """
    if seed is not None:
        random.seed(seed)

    # Toss three coins (heads=3, tails=2)
    coins = [random.choice([2, 3]) for _ in range(3)]
    total = sum(coins)

    # Map coin totals to line values:
    # 6 (all tails) -> 6 (Old Yin)
    # 7 (two tails, one heads) -> 8 (Young Yin) -> Mapped incorrectly in original comment, should be 7->8
    # 8 (two heads, one tail) -> 7 (Young Yang) -> Mapped incorrectly in original comment, should be 8->7
    # 9 (all heads) -> 9 (Old Yang)
    # Correct mapping based on probabilities (Heads=3, Tails=2):
    # TTT = 2+2+2 = 6 -> Old Yin (Value 6)
    # TTH = 2+2+3 = 7 -> Young Yang (Value 7)
    # THT = 2+3+2 = 7 -> Young Yang (Value 7)
    # HTT = 3+2+2 = 7 -> Young Yang (Value 7)
    # THH = 2+3+3 = 8 -> Young Yin (Value 8)
    # HTH = 3+2+3 = 8 -> Young Yin (Value 8)
    # HHT = 3+3+2 = 8 -> Young Yin (Value 8)
    # HHH = 3+3+3 = 9 -> Old Yang (Value 9)
    # Probabilities: 6 (1/8), 7 (3/8), 8 (3/8), 9 (1/8)
    # The value_map in the original code was incorrect based on standard coin method interpretation.
    # Let's fix the value_map according to standard practice.
    value_map = {6: 6, 7: 7, 8: 8, 9: 9}  # Standard mapping
    # If the intent was the specific (non-standard) mapping mentioned in the docstring/comments,
    # the map should be {6: 6, 7: 8, 8: 7, 9: 9}. Let's assume standard for now.
    # Re-reading the docstring: It describes the *probabilities*, not the mapping.
    # The code's original mapping {6: 6, 7: 8, 8: 7, 9: 9} IS what produces those probabilities.
    # Let's revert to the original code's mapping and clarify comments.
    value_map = {6: 6, 7: 8, 8: 7, 9: 9}  # Map sum to line value per method description
    return value_map[total]


def generate_hexagram(seed: Optional[int] = None, verbose: bool = False) -> List[int]:
    """Generates a complete hexagram (6 lines) using the three-coin method.

    Args:
        seed: Optional random seed for reproducible results
        verbose: Whether to print details during casting

    Returns:
        List of 6 line values (6, 7, 8, or 9) from bottom to top
    """
    if seed is not None:
        random.seed(seed)

    # Explicitly type hexagram_lines
    hexagram_lines: List[int = [

    if verbose:
        print("Casting Hexagram with Three Coins Method...")

    for line_number in range(1, 7):
        line_value = toss_three_coins()
        hexagram_lines.append(line_value)  # Now knows it's appending int to List[int

        if verbose:
            # Initialize line_type to prevent potential unbound error
            line_type: str = ""
            if line_value == 6:
                line_type = "---X--- (Old Yin)"
            elif line_value == 7:
                line_type = "------- (Young Yang)"
            elif line_value == 8:
                line_type = "--- --- (Young Yin)"
            elif line_value == 9:
                line_type = "---O--- (Old Yang)"
            # This else should theoretically not be reached with the current toss_three_coins
            else:
                line_type = f"Unknown value: {line_value}"
            print(f"Line {line_number}: {line_value} {line_type}")

    if verbose:
        print("\nCast Complete.")

    # Return type is now known List[int]
    return hexagram_lines


# Add explicit return type hint
def cast_hexagram(seed: Optional[int] = None, verbose: bool = False) -> Dict[str, Any]:
    """Performs a complete I Ching reading using the three-coin method.

    Args:
        seed: Optional random seed for reproducible results
        verbose: Whether to print details during the process

    Returns:
        Dictionary containing the cast results
    """
    # Cast the hexagram
    lines: List[int] = generate_hexagram(seed=seed, verbose=verbose)

    # Get basic information
    changing_indices: List[int] = get_changing_line_indices(lines)
    primary_hex_num: int = get_hexagram_number(lines)

    # Get trigram information
    lower_trigram: List[int] = lines[:3]
    upper_trigram: List[int] = lines[3:]
    lower_value: int = get_trigram_value(lower_trigram)
    upper_value: int = get_trigram_value(upper_trigram)

    # Build result dictionary - type checker now understands Dict[str, Any] better
    result: Dict[str, Any] = {
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
        transformed_lines: List[int] = get_transformed_lines(lines)
        transformed_hex_num: int = get_hexagram_number(transformed_lines)
        result["transformed_hexagram_number"] = transformed_hex_num
        result["transformed_lines"] = transformed_lines  # List[int]

    return result


# Add explicit return type hint
# Remove unused 'mode' parameter
def get_reading(
    seed: Optional[int = None,
    verbose: bool = False,
    print_result: bool = False,
) -> Dict[str, Any:
    """Generates a complete I Ching reading using the three-coin method.

    Args:
        seed: Optional random seed for reproducible results
        verbose: Whether to print details during the process
        print_result: Whether to print the complete reading

    Returns:
        Dictionary containing the complete reading
    """
    # Load hexagram data
    hexagram_data: Optional[Dict[int, Any]] = load_hexagram_data()
    if not hexagram_data:
        # Consider raising an exception here instead or logging
        return {"error": "Failed to load hexagram data"}

    # Cast hexagram
    cast_result: Dict[str, Any] = cast_hexagram(seed=seed, verbose=verbose)

    # If requested, print the complete reading
    if print_result:
        # Ensure cast_result['lines' exists and is the correct type if needed by print_reading
        # Assuming print_reading handles the structure correctly
        print_reading(cast_result["lines"], hexagram_data)

    # Return cast result and hexagram data
    # Explicitly type result dictionary
    result: Dict[str, Any] = {
        "cast_result": cast_result,
        "primary_hexagram": hexagram_data.get(cast_result["primary_hexagram_number"),
    }

    # Add transformed hexagram if there are changing lines
    if "transformed_hexagram_number" in cast_result:
        result["transformed_hexagram"] = hexagram_data.get(
            cast_result["transformed_hexagram_number"
        )

    return result
