from typing import Dict, List, Optional, Union, cast

class ReadingInterpreter:
    def __init__(self) -> None:
        self.readings: Dict[int, Dict[str, Union[str, Dict[str, str]]]] = {}
        self._load_readings()
        
    def _load_readings(self) -> None:
        """Load readings from online source or local cache"""
        # Implementation using BeautifulSoup to scrape cafeausoul.com
        # Store in self.readings
        pass
        
    def get_reading(self, hexagram_number: int, changing_lines: Optional[List[int]] = None) -> str:
        """Get interpretation for hexagram and changing lines"""
        if hexagram_number not in self.readings:
            return "Invalid hexagram number"
            
        reading = self.readings[hexagram_number]
        
        if not changing_lines:
            judgment = reading.get("judgment", "")
            return str(judgment)
            
        # Return specific line readings for changing lines
        line_readings: List[str] = []
        lines_dict = cast(Dict[str, str], reading.get("lines", {}))
        
        for line in changing_lines:
            line_key = str(line)
            if line_key in lines_dict:
                line_readings.append(lines_dict[line_key])
                
        return "\n".join(line_readings) 