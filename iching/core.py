import random
from typing import List, Tuple, Union

class Hexagram:
    """A class representing an I Ching hexagram using the Yarrow stalk method."""
    
    def __init__(self) -> None:
        self.lines: List[int] = []
        self.number: Union[int, None] = None
        self.changing_lines: List[int] = []
        
    def _divide_stalks(self) -> Tuple[int, int, int]:
        """Simulates one division of yarrow stalks.
        
        Returns:
            Tuple of three numbers representing the remainders from the division process.
        """
        # Start with 49 stalks (50 - 1 set aside)
        stalks = 49
        
        # First division
        east = random.randint(1, stalks)
        west = stalks - east
        
        # Take one from west pile
        west -= 1
        right_hand = 1
        
        # Count by fours from east
        east_remainder = east % 4
        if east_remainder == 0:
            east_remainder = 4
            
        # Count by fours from west
        west_remainder = west % 4
        if west_remainder == 0:
            west_remainder = 4
            
        return right_hand, east_remainder, west_remainder
        
    def _get_line_value(self) -> Tuple[int, bool]:
        """Performs the yarrow stalk division three times to generate one line.
        
        Returns:
            Tuple of (line_value, is_changing) where:
            - line_value: 0 for yin, 1 for yang
            - is_changing: True if the line is changing
        """
        # First count
        r1, e1, w1 = self._divide_stalks()
        first_sum = r1 + e1 + w1
        first_value = 2 if first_sum == 9 else 3
        
        # Remove counted stalks
        remaining = 49 - (first_sum - 1)
        
        # Second count
        r2, e2, w2 = self._divide_stalks()
        second_sum = r2 + e2 + w2
        second_value = 2 if second_sum == 8 else 3
        
        # Remove counted stalks
        remaining = remaining - (second_sum - 1)
        
        # Third count
        r3, e3, w3 = self._divide_stalks()
        third_sum = r3 + e3 + w3
        third_value = 2 if third_sum == 8 else 3
        
        # Calculate total
        total = first_value + second_value + third_value
        
        # Map totals to line values according to traditional rules
        if total == 6:    # Old Yin (changing)
            return 0, True
        elif total == 7:  # Young Yang
            return 1, False
        elif total == 8:  # Young Yin
            return 0, False
        else:  # total == 9, Old Yang (changing)
            return 1, True
    
    def generate(self) -> None:
        """Generates a hexagram using the traditional Yarrow stalk method."""
        self.lines = []
        self.changing_lines = []
        
        for line_position in range(6):
            value, is_changing = self._get_line_value()
            self.lines.append(value)
            if is_changing:
                self.changing_lines.append(line_position + 1)
                
        self.number = self._calculate_hexagram_number()
        
    def _calculate_hexagram_number(self) -> int:
        """Converts line pattern to hexagram number (1-64)."""
        # Convert binary to decimal (lines read from bottom to top)
        binary = "".join(str(line) for line in reversed(self.lines))
        decimal = int(binary, 2)
        
        # Map to traditional hexagram ordering
        # This is a simplified mapping - you would need a complete lookup table
        # for accurate traditional hexagram numbers
        return decimal + 1