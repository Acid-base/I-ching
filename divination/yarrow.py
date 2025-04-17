"""Yarrow module for I-Ching divination.
This module provides functionality for calculating hexagrams using the traditional yarrow stalks method.
"""

import random
from typing import List, Optional


class YarrowStalks:
    """Implementation of the traditional Yarrow Stalk divination method for I Ching.

    The yarrow stalk method should produce lines with the following probabilities:
    - 6 (Old Yin): 1/16 (6.25%)
    - 7 (Young Yang): 5/16 (31.25%)
    - 8 (Young Yin): 7/16 (43.75%)
    - 9 (Old Yang): 3/16 (18.75%)
    """

    def __init__(self, seed: Optional[int] = None):
        """Initialize the YarrowStalks divination tool.

        Args:
            seed: Optional random seed for reproducibility
        """
        self.rng = random.Random(seed)

    def generate_single_line_value(self) -> int:
        """Generate a single line value using the traditional yarrow stalk probability distribution.

        Returns:
            An integer representing the line type:
            - 6: Old Yin
            - 7: Young Yang
            - 8: Young Yin
            - 9: Old Yang
        """
        # The exact probabilities according to traditional yarrow stalk method:
        # 6 (Old Yin): 1/16 = 0.0625
        # 7 (Young Yang): 5/16 = 0.3125
        # 8 (Young Yin): 7/16 = 0.4375
        # 9 (Old Yang): 3/16 = 0.1875

        probability = self.rng.random()

        if probability < 0.0625:  # 1/16
            return 6  # Old Yin
        elif probability < 0.375:  # 1/16 + 5/16 = 6/16
            return 7  # Young Yang
        elif probability < 0.8125:  # 6/16 + 7/16 = 13/16
            return 8  # Young Yin
        else:
            return 9  # Old Yang

    def generate_hexagram(self) -> List[int]:
        """Generate a complete hexagram of six lines.

        Returns:
            A list of six integers representing the lines of the hexagram
            from bottom to top.
        """
        return [self.generate_single_line_value() for _ in range(6)]
