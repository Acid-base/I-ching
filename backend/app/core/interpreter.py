from typing import Dict, List, Optional
from .hexagram import HexagramReading

class ReadingInterpreter:
    def __init__(self, readings: Dict[int, HexagramReading]):
        self.readings = readings

    def get_reading(self, hexagram_number: int, changing_lines: Optional[List[int]] = None) -> HexagramReading:
        reading = self.readings.get(hexagram_number)
        if not reading:
            raise KeyError(f"Reading not found for hexagram number {hexagram_number}")

        if changing_lines:
            lines_dict = reading.get("lines", {})
            transformed_lines: Dict[str, str] = {}
            for line_number in changing_lines:
                line_meaning = lines_dict.get(str(line_number))
                if line_meaning:
                    transformed_lines[str(line_number)] = line_meaning
            reading["lines"] = transformed_lines

        return reading 