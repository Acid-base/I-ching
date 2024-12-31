import random
import sys

class IChingLineGenerator:
    @staticmethod
    def get_yarrow_stalk_line() -> str:
        def manipulate_stalks(num_stalks: int) -> int:
            """
            Divides the stalks into two piles, removes one from the second pile,
            and returns the combined remainder of both piles when divided by 4.
            """
            if num_stalks == 0:
                raise ValueError("Cannot manipulate 0 stalks")

            # Split the stalks into two random piles
            split_point = random.randint(1, num_stalks - 1)
            pile1_size = split_point
            pile2_size = num_stalks - split_point

            # Remove one stalk from the second pile
            pile2_size -= 1

            # Calculate remainders when dividing by 4, replacing 0 with 4
            rem1 = pile1_size % 4
            rem1 = 4 if rem1 == 0 else rem1
            rem2 = pile2_size % 4
            rem2 = 4 if rem2 == 0 else rem2

            # Assertions to validate the results
            assert 1 <= rem1 <= 4
            assert 1 <= rem2 <= 4
            set_aside = rem1 + rem2 + 1
            assert 5 <= set_aside <= 9  # Set aside should be between 5 and 9

            return set_aside

        # Initial number of stalks
        num_stalks = 49
        total_set_aside = 0

        # Perform three phases of stalk manipulation
        for i in range(3):
            set_aside = manipulate_stalks(num_stalks)
            total_set_aside += set_aside
            num_stalks -= set_aside  # Update the number of stalks for the next phase
            print(f"Phase {i+1}: Set aside = {set_aside}, Total set aside = {total_set_aside}")

        # Determine the I Ching line value based on the total set aside
        if total_set_aside == 9:
            return "9"
        elif total_set_aside == 13:
            return "8"
        elif total_set_aside == 17:
            return "7"
        elif total_set_aside == 21:
            return "6"
        else:
            raise ValueError(
                f"Unexpected number of stalks set aside: {total_set_aside}"
            )

    @staticmethod
    def get_three_coins_line() -> str:
        coin1 = random.choice(["H", "T"])
        coin2 = random.choice(["H", "T"])
        coin3 = random.choice(["H", "T"])

        heads = sum(1 for coin in [coin1, coin2, coin3] if coin == "H")

        if heads == 0:
            return "8"
        elif heads == 1:
            return "7"
        elif heads == 2:
            return "9"
        elif heads == 3:
            return "6"

    @staticmethod
    def get_random_line() -> str:
        return str(
            random.choice(
                [
                    IChingLineGenerator.get_yarrow_stalk_line(),
                    IChingLineGenerator.get_three_coins_line(),
                ]
            )
        )

print(IChingLineGenerator.get_yarrow_stalk_line())