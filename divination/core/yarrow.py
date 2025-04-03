# Insert the corrected code here
import json
import os
import random
import traceback
from typing import Any, Dict, List, Optional, Tuple, Union, cast

# --- Type Aliases ---
HexagramLines = List[int]
LineData = Dict[str, Any  # Expecting 'lineNumber': int, 'meaning': str, etc.
HexagramDataItem = Dict[str, Any]  # Expecting 'number', 'name', 'judgment', 'image', 'lines': List[LineData]
HexagramData = Dict[int, HexagramDataItem]
CastResult = Dict[str, Any
ReadingResult = Dict[str, Any]

# --- Constants ---
TOTAL_STALKS: int = 50
ASIDE_STALK: int = 1
WORKING_STALKS: int = TOTAL_STALKS - ASIDE_STALK
DEFAULT_JSON_PATH: str = "data/hexagrams.json"  # Assuming relative to execution context

# --- Trigram Definitions ---
TRIGRAM_VALUES: Dict[str, int] = {
    "Earth": 0,
    "Mountain": 1,
    "Water": 2,
    "Wind": 3,
    "Thunder": 4,
    "Fire": 5,
    "Lake": 6,
    "Heaven": 7,
}
TRIGRAM_NAMES: Dict[int, str] = {v: k for k, v in TRIGRAM_VALUES.items()}

# --- King Wen Sequence Map (Corrected) ---
KING_WEN_MAP_CORRECTED: Dict[str, int] = {
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
    "5_3": 38,  # Corrected 38 to 5_3 (was 5_6)
    "2_1": 39,
    "4_2": 40,
    "1_6": 41,
    "3_4": 42,
    "6_7": 43,
    "7_3": 44,
    "6_0": 45,
    "0_3": 46,
    "6_2": 47,
    "2_6": 48,  # Corrected 48 to 2_6 (was 2_3)
    "6_5": 49,
    "5_6": 50,  # Corrected 50 to 5_6 (was 5_3)
    "4_4": 51,
    "1_1": 52,
    "3_1": 53,
    "4_6": 54,
    "4_5": 55,
    "5_1": 56,
    "3_3": 57,
    "6_6": 58,
    "3_2": 59,
    "2_3": 60,  # Corrected 60 to 2_3 (was 2_6)
    "3_6": 61,
    "4_1": 62,
    "2_5": 63,
    "5_2": 64,
}
assert len(KING_WEN_MAP_CORRECTED) == 64, (
    f"Expected 64 hexagrams, found {len(KING_WEN_MAP_CORRECTED)}"
)
assert set(KING_WEN_MAP_CORRECTED.values()) == set(range(1, 65)), (
    f"Hexagram numbers are not 1-64. Missing/Extra: {set(range(1, 65)) ^ set(KING_WEN_MAP_CORRECTED.values())}"
)


# --- Yarrow Stalk Casting Functions ---
def get_value_from_remainder(remainder_count: int) -> int:
    """Determines the numerical value (2 or 3) based on the remainder pile size."""
    if remainder_count in (4, 5):
        return 3
    if remainder_count in (8, 9):
        return 2
    raise ValueError(f"Invalid remainder count encountered: {remainder_count}")


def perform_division(stalks_in: int) -> Tuple[int, int]:
    """Simulates one stage of dividing the yarrow stalks."""
    if stalks_in < 4:
        raise ValueError(f"Not enough stalks for division: {stalks_in}")
    finger_stalk: int = 1
    remaining_after_finger: int = stalks_in - finger_stalk
    if remaining_after_finger < 1:
        raise ValueError(f"Cannot divide {stalks_in} stalks")

    if remaining_after_finger == 1:
        left_pile, right_pile = 1, 0
    else:
        right_pile = random.randint(1, remaining_after_finger - 1)
        left_pile = remaining_after_finger - right_pile

    if left_pile <= 0 or right_pile < 0:
        raise ValueError(f"Invalid pile split: L={left_pile}, R={right_pile}")

    remainder_left: int = left_pile % 4
    if remainder_left == 0 and left_pile > 0:
        remainder_left = 4
    counted_left: int = left_pile - remainder_left if left_pile > 0 else 0

    remainder_right: int = right_pile % 4
    if remainder_right == 0 and right_pile > 0:
        remainder_right = 4
    counted_right: int = right_pile - remainder_right if right_pile > 0 else 0

    total_remainder_this_stage: int = remainder_left + remainder_right + finger_stalk
    stalks_for_next_stage: int = counted_left + counted_right

    if total_remainder_this_stage not in [4, 5, 8, 9]:
        raise ValueError(
            f"Calculated invalid total remainder: {total_remainder_this_stage}"
        )

    return total_remainder_this_stage, stalks_for_next_stage


def generate_one_line(seed: Optional[int] = None) -> int:
    """Performs the three division stages to generate a single I Ching line value."""
    if seed is not None:
        random.seed(seed)
    current_stalks: int = WORKING_STALKS
    stage_values: List[int] = []
    for stage in range(1, 4):
        if current_stalks < 4:
            raise ValueError(f"Not enough stalks ({current_stalks}) at stage {stage}")
        total_remainder, stalks_for_next_stage = perform_division(current_stalks)
        stage_value: int = get_value_from_remainder(total_remainder)
        stage_values.append(stage_value)
        current_stalks = stalks_for_next_stage
    final_line_value: int = sum(stage_values)
    if final_line_value == 9:
        return 7
    if final_line_value == 8:
        return 8
    if final_line_value == 7:
        return 9
    if final_line_value == 6:
        return 6
    raise ValueError(f"Invalid line value sum: {final_line_value}")


def generate_hexagram(
    seed: Optional[int] = None, verbose: bool = False
) -> HexagramLines:
    """Generates a complete hexagram (6 lines)."""
    if seed is not None:
        random.seed(seed)
    hexagram_lines: HexagramLines = []
    if verbose:
        print("Casting Hexagram...")
    for line_number in range(1, 7):
        line_value: int = generate_one_line()
        hexagram_lines.append(line_value)
        if verbose:
            line_type: str
            if line_value == 6:
                line_type = "---X--- (Old Yin)"
            elif line_value == 7:
                line_type = "------- (Young Yang)"
            elif line_value == 8:
                line_type = "--- --- (Young Yin)"
            elif line_value == 9:
                line_type = "---O--- (Old Yang)"
            else:
                line_type = f"Invalid ({line_value})"
            print(f"Line {line_number}: {line_value} {line_type}")
    if verbose:
        print("\nCast Complete.")
    return hexagram_lines


# --- Hexagram Calculation Functions ---
def get_trigram_value(lines: List[int]) -> int:
    """Converts three lines into a trigram value (0-7)."""
    if len(lines) != 3:
        raise ValueError(f"Trigram must have 3 lines, got {len(lines)}")
    value: int = 0
    for i, line in enumerate(lines):
        if line in (7, 9):
            value |= 1 << i
        elif line not in (6, 8):
            raise ValueError(f"Invalid line value: {line}")
    return value


def get_trigram_name(value: int) -> str:
    """Gets the traditional name of a trigram based on its numerical value."""
    return TRIGRAM_NAMES.get(value, "Unknown")


def get_hexagram_number(lines: HexagramLines) -> int:
    """Converts 6 lines into the traditional King Wen hexagram number (1-64)."""
    if len(lines) != 6:
        raise ValueError(f"Hexagram must have 6 lines, got {len(lines)}")
    lower_trigram_lines: List[int] = lines[:3]
    upper_trigram_lines: List[int] = lines[3:]
    lower_value: int = get_trigram_value(lower_trigram_lines)
    upper_value: int = get_trigram_value(upper_trigram_lines)
    lower_name: str = get_trigram_name(lower_value)
    upper_name: str = get_trigram_name(upper_value)
    key: str = f"{upper_value}_{lower_value}"
    hex_num: Optional[int] = KING_WEN_MAP_CORRECTED.get(key)
    if hex_num is None:
        raise ValueError(f"Invalid key: {key} (U:{upper_name}, L:{lower_name})")
    return hex_num


def get_transformed_lines(lines: HexagramLines) -> HexagramLines:
    """Transforms changing lines (6->7, 9->8)."""
    transformed: HexagramLines = []
    for line in lines:
        if line == 6:
            transformed.append(7)
        elif line == 9:
            transformed.append(8)
        elif line in (7, 8):
            transformed.append(line)
        else:
            raise ValueError(f"Invalid line value during transformation: {line}")
    return transformed


def get_changing_line_indices(lines: HexagramLines) -> List[int:
    """Gets the 0-based indices of changing lines (6 or 9)."""
    return [i for i, line in enumerate(lines) if line in (6, 9)


# --- JSON Loading ---
def load_hexagram_data(filepath: str = DEFAULT_JSON_PATH) -> HexagramData:
    """Loads or creates dummy hexagram data."""
    tool_path = filepath
    try:
        if not os.path.exists(tool_path):
            os.makedirs(os.path.dirname(tool_path), exist_ok=True)
            # Define dummy data structure explicitly matching HexagramDataItem and LineData
            dummy_data_list: List[HexagramDataItem] = [
                {
                    "number": i,
                    "name": f"Hex_{i}_Dummy",
                    "judgment": "...",
                    "image": "...",
                    "lines": [
                        cast(LineData, {"lineNumber": j, "meaning": "..."})
                        for j in range(1, 7)
                    ],
                }
                for i in range(1, 65)
            ]
            with open(tool_path, "w", encoding="utf-8") as f:
                json.dump(dummy_data_list, f, indent=2)
        with open(tool_path, "r", encoding="utf-8") as f:
            # Load as Any first, then check type
            loaded_json: Any = json.load(f)
        hex_dict: HexagramData = {}
        if isinstance(loaded_json, list):
            # Assume list contains HexagramDataItem-like dictionaries
            data_list = cast(List[Any, loaded_json)
            for item in data_list:
                # Removed unnecessary isinstance(item, dict)
                if isinstance(item, dict) and "number" in item:
                    try:
                        num = int(item["number")
                        if 1 <= num <= 64:
                            # Ensure item conforms to HexagramDataItem structure as much as possible
                            hex_item: HexagramDataItem = {
                                "number": num,
                                "name": str(item.get("name", f"Hex_{num}_Unnamed")),
                                "judgment": str(item.get("judgment", "N/A")),
                                "image": str(item.get("image", "N/A")),
                                "lines": cast(List[LineData], item.get("lines", [])),
                                **{k: v for k, v in item.items() if k not in ["number", "name", "judgment", "image", "lines"]} # Add other potential keys
                            }
                            hex_dict[num] = hex_item
                        else:
                            print(f"Warning: Skip item with invalid num {item.get('number')}")
                    except (ValueError, TypeError):
                        print(f"Warning: Skip item non-int num {item.get('number')}")
                else:
                    print(f"Warning: Skipping invalid item in JSON list: {item}")
        elif isinstance(loaded_json, dict):
            # Assume dict maps string number keys to HexagramDataItem-like dictionaries
            data_dict = cast(Dict[str, Any], loaded_json)
            for k, v in data_dict.items():
                 # Removed unnecessary isinstance(k, str)
                if k.isdigit() and isinstance(v, dict):
                    num = int(k)
                    if 1 <= num <= 64:
                         # Ensure v conforms to HexagramDataItem
                        hex_item: HexagramDataItem = {
                            "number": num,
                            "name": str(v.get("name", f"Hex_{num}_Unnamed")),
                            "judgment": str(v.get("judgment", "N/A")),
                            "image": str(v.get("image", "N/A")),
                            "lines": cast(List[LineData], v.get("lines", [])),
                             **{vk: vv for vk, vv in v.items() if vk not in ["number", "name", "judgment", "image", "lines"]}
                        }
                        hex_dict[num] = hex_item
                    else:
                        print(f"Warning: Skip item with out-of-range key {k}")
                else:
                    print(f"Warning: Skip non-dict value or non-numeric key item {k}")
        else:
            print(f"Error: Loaded data is not a list or dict: {type(loaded_json)}")
            return {} # Return empty dict on format error

        # Ensure all 64 keys exist, adding dummy if needed
        if len(hex_dict) != 64:
            print(
                f"Warning: Loaded {len(hex_dict)}/64 hexagrams from {os.path.abspath(tool_path)}. Filling gaps."
            )
            full_hex_dict: HexagramData = {}
            for i in range(1, 65):
                full_hex_dict[i] = hex_dict.get(
                    i,
                    cast(HexagramDataItem, { # Cast the dummy data to the expected type
                        "number": i,
                        "name": f"Hex_{i}_Missing",
                "judgment": "N/A",
                "image": "N/A",
                "lines": [],
                    }),
        )
            return full_hex_dict
        return hex_dict

    except Exception as e:
        print(
            f"Error loading/creating hexagram data at {os.path.abspath(tool_path)}: {e}. Using full dummy data."
        )
        # traceback.print_exc() # Uncomment for detailed debug trace
        dummy_dict: HexagramData = {}
        for i in range(1, 65):
            dummy_dict[i] = cast(HexagramDataItem, { # Cast the dummy data to the expected type
                "number": i,
                "name": f"Hex_{i}_LoadError",
                "judgment": "Error",
                "image": "Error",
                "lines": [],
            })
        return dummy_dict


# --- Reading Presentation ---
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
        primary_hex_num: int = get_hexagram_number(lines)
        primary_hexagram: Optional[HexagramDataItem] = hexagram_data.get(primary_hex_num)
        if not primary_hexagram:
            # This case should be less likely now due to load_hexagram_data guarantees
            print(f"Error: Primary hex data {primary_hex_num} missing.")
            primary_hexagram = cast(HexagramDataItem, {
                "number": primary_hex_num,
                "name": f"Hex_{primary_hex_num}_Error",
                "judgment": "Error",
                "image": "Error",
                "lines": [],
            })

        lower_value: int = get_trigram_value(lines[:3)
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
            line_val: int = lines[i
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
                primary_lines_list = cast(List[LineData, primary_hexagram.get("lines", []))
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
                 transformed_hexagram = cast(HexagramDataItem, {
                    "number": transformed_hex_num,
                    "name": f"Hex_{transformed_hex_num}_Error",
                    "judgment": "N/A",
                    "image": "N/A",
                    "lines": [],
                 })

            print("\n" + "-" * 60)
            print(
                f"TRANSFORMED INTO HEXAGRAM {transformed_hex_num}: {transformed_hexagram.get('name', 'N/A')}"
            )
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


# --- Main Functions ---
def cast_hexagram(seed: Optional[int] = None, verbose: bool = False) -> CastResult:
    """Performs yarrow stalk casting, returning structured results."""
    lines: HexagramLines = generate_hexagram(seed=seed, verbose=verbose)
    changing_indices: List[int] = get_changing_line_indices(lines)
    primary_hex_num: int = get_hexagram_number(lines)
    lower_value: int = get_trigram_value(lines[:3)
    upper_value: int = get_trigram_value(lines[3:)
    lower_name: str = get_trigram_name(lower_value)
    upper_name: str = get_trigram_name(upper_value)
    result: CastResult = {
        "lines": lines,
        "changing_line_indices": changing_indices,
        "primary_hexagram_number": primary_hex_num,
        "trigrams": {
            "lower": {"value": lower_value, "name": lower_name},
            "upper": {"value": upper_value, "name": upper_name},
        },
        "transformed_hexagram_number": None,
        "transformed_lines": None,
    }
    if changing_indices:
        transformed_lines: HexagramLines = get_transformed_lines(lines)
        transformed_hex_num: int = get_hexagram_number(transformed_lines)
        result["transformed_hexagram_number"] = transformed_hex_num
        result["transformed_lines"] = transformed_lines
    return result


def get_reading(
    seed: Optional[int] = None, verbose: bool = False, print_result: bool = False
) -> ReadingResult:
    """Generates and optionally prints a complete I Ching reading."""
    hexagram_data: HexagramData = load_hexagram_data()
    if not hexagram_data:
        # This should ideally not be reached if load_hexagram_data always returns a dict
        return {"error": "Failed to load hexagram data"}

    try:
        cast_result: CastResult = cast_hexagram(seed=seed, verbose=verbose)
    except ValueError as e:
        print(f"Error during casting: {e}")
        return {"error": f"Casting failed: {e}"}

    primary_num: int = cast_result["primary_hexagram_number"]
    # hexagram_data is guaranteed to have all keys 1-64
    primary_data: HexagramDataItem = hexagram_data[primary_num]

    transformed_data: Optional[HexagramDataItem] = None
    transformed_num: Optional[int] = cast_result.get("transformed_hexagram_number")
    if transformed_num is not None:
        # hexagram_data is guaranteed to have all keys 1-64
        transformed_data = hexagram_data[transformed_num]

    result: ReadingResult = {
        "cast_result": cast_result,
        "primary_hexagram": primary_data,
        "transformed_hexagram": transformed_data, # Can be None if no changing lines
    }

    if print_result:
        # Pass data that is guaranteed to exist (even if dummy)
        print_reading(cast_result["lines"], hexagram_data)

    # Check if the loaded data was actually dummy/error data
    if "Error" in result["primary_hexagram"].get("name", ""):
        print(f"Warning: Primary data for {primary_num} seems to be error/missing data.")
    if transformed_data and "Error" in transformed_data.get("name", ""):
         print(f"Warning: Transformed data for {transformed_num} seems to be error/missing data.")

    return result


if __name__ == "__main__":
    print("Running Yarrow Stalk Divination Test...")
    TEST_SEED: int = 12345
    reading_result: ReadingResult = get_reading(
        seed=TEST_SEED, verbose=False, print_result=True
    )

    print("\nProgrammatic Access Example:")
    if "error" in reading_result:
        print(f"Error: {reading_result['error'}")
    else:
        cast_res = cast(CastResult, reading_result.get("cast_result", {}))
        primary_hex = cast(
            Optional[HexagramDataItem], reading_result.get("primary_hexagram")
        )
        transformed_hex = cast(
            Optional[HexagramDataItem], reading_result.get("transformed_hexagram")
        )
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
        test_lines_2 = [8, 8, 8, 8, 8, 8  # Hex 2
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
