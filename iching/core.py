import random
from typing import List, Optional, Dict, Union, TypedDict, Mapping

class HexagramReading(TypedDict):
    name: str
    chinese: str
    description: str
    judgment: str
    image: str
    lines: Dict[str, str]

class Hexagram:
    def __init__(self) -> None:
        self.lines: List[int] = []
        self.changing_lines: List[int] = []
        self.number: Optional[int] = None

    def _divide_stalks(self) -> int:
        total = 0
        for _ in range(3):
            total += random.choice([2, 3])
        return total

    def generate(self) -> None:
        self.lines = []
        self.changing_lines = []

        for _ in range(6):
            total = self._divide_stalks()
            if total == 6:
                self.lines.append(0)
                self.changing_lines.append(len(self.lines))
            elif total == 9:
                self.lines.append(1)
                self.changing_lines.append(len(self.lines))
            elif total == 7:
                self.lines.append(1)
            elif total == 8:
                self.lines.append(0)

        self.number = self._calculate_hexagram_number()

    def _calculate_hexagram_number(self) -> int:
        binary = "".join(str(line) for line in reversed(self.lines))
        decimal = int(binary, 2)
        return decimal + 1

    def get_relating_hexagram(self) -> Optional["Hexagram"]:
        if not self.changing_lines:
            return None

        relating_lines = list(self.lines)

        for changing_line_index in self.changing_lines:
            relating_lines[changing_line_index - 1] = 1 - relating_lines[changing_line_index - 1]

        relating_hexagram = Hexagram()
        relating_hexagram.lines = relating_lines
        relating_hexagram.number = relating_hexagram._calculate_hexagram_number()

        return relating_hexagram

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