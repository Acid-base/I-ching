import os
import sys
from collections import Counter

import numpy as np

# Add the current directory to the path so we can import the yarrow module
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from yarrow import YarrowStalks


def test_yarrow_stalk_probabilities():
    """Test that the yarrow stalk method produces the expected probability distribution:
    - 6 (Old Yin): 1/16 (6.25%)
    - 7 (Young Yang): 5/16 (31.25%)
    - 8 (Young Yin): 7/16 (43.75%)
    - 9 (Old Yang): 3/16 (18.75%)
    """
    # Setup
    NUM_TRIALS = 10000  # Large number for statistical significance
    EXPECTED_PROBABILITIES = {
        6: 1 / 16,  # Old Yin
        7: 5 / 16,  # Young Yang
        8: 7 / 16,  # Young Yin
        9: 3 / 16,  # Old Yang
    }

    # Use a fixed seed for reproducibility
    yarrow = YarrowStalks(seed=42)

    # Generate many line values
    line_values = [yarrow.generate_single_line_value() for _ in range(NUM_TRIALS)]

    # Count occurrences
    counts = Counter(line_values)

    # Calculate actual probabilities
    actual_probabilities = {line: count / NUM_TRIALS for line, count in counts.items()}

    # Print results for analysis
    print("\nYarrow Stalk Probability Test Results:")
    print("======================================")
    print(f"Number of trials: {NUM_TRIALS}")
    print("\nLine Type      Expected    Actual      Difference")
    print("-----------------------------------------------")

    for line in sorted(counts.keys()):
        expected_prob = EXPECTED_PROBABILITIES[line]
        actual_prob = actual_probabilities[line]
        diff = actual_prob - expected_prob
        line_name = ["Old Yin", "Young Yang", "Young Yin", "Old Yang"][line - 6]
        print(f"{line} ({line_name}):  {expected_prob:.6f}   {actual_prob:.6f}   {diff:+.6f}")

    # Statistical test - Chi-squared goodness of fit
    observed_counts = np.array([counts[line] for line in sorted(EXPECTED_PROBABILITIES.keys())])
    expected_counts = np.array(
        [
            EXPECTED_PROBABILITIES[line] * NUM_TRIALS
            for line in sorted(EXPECTED_PROBABILITIES.keys())
        ]
    )

    chi2 = np.sum((observed_counts - expected_counts) ** 2 / expected_counts)
    df = len(EXPECTED_PROBABILITIES) - 1  # degrees of freedom
    critical_value = 7.815  # chi-squared critical value for df=3, p=0.05

    print("\nStatistical Analysis:")
    print(f"Chi-squared value: {chi2:.4f}")
    print(f"Critical value (α=0.05, df={df}): {critical_value}")
    print(f"Test result: {'FAIL' if chi2 > critical_value else 'PASS'}")

    # Assert that probabilities are within acceptable range
    # Using a 1.5 percentage point tolerance for each probability
    for line, expected_prob in EXPECTED_PROBABILITIES.items():
        assert abs(actual_probabilities[line] - expected_prob) < 0.015, (
            f"Probability for line {line} is off by more than 1.5 percentage points"
        )


def test_multiple_seeds():
    """Test the distribution holds across multiple random seeds."""
    NUM_SEEDS = 10
    TRIALS_PER_SEED = 1000
    EXPECTED_PROBABILITIES = {
        6: 1 / 16,  # Old Yin
        7: 5 / 16,  # Young Yang
        8: 7 / 16,  # Young Yin
        9: 3 / 16,  # Old Yang
    }

    overall_counts = Counter()

    for seed in range(NUM_SEEDS):
        yarrow = YarrowStalks(seed=seed)
        lines = [yarrow.generate_single_line_value() for _ in range(TRIALS_PER_SEED)]
        overall_counts.update(lines)

    total_trials = NUM_SEEDS * TRIALS_PER_SEED
    actual_probabilities = {line: count / total_trials for line, count in overall_counts.items()}

    # Print results
    print("\nMultiple Seeds Probability Test:")
    print("===============================")
    print(f"Number of seeds: {NUM_SEEDS}")
    print(f"Trials per seed: {TRIALS_PER_SEED}")
    print(f"Total trials: {total_trials}")
    print("\nLine Type      Expected    Actual      Difference")
    print("-----------------------------------------------")

    for line in sorted(overall_counts.keys()):
        expected_prob = EXPECTED_PROBABILITIES[line]
        actual_prob = actual_probabilities[line]
        diff = actual_prob - expected_prob
        line_name = ["Old Yin", "Young Yang", "Young Yin", "Old Yang"][line - 6]
        print(f"{line} ({line_name}):  {expected_prob:.6f}   {actual_prob:.6f}   {diff:+.6f}")

    # Assert probabilities across all seeds
    for line, expected_prob in EXPECTED_PROBABILITIES.items():
        assert abs(actual_probabilities[line] - expected_prob) < 0.02, (
            f"Overall probability for line {line} across {NUM_SEEDS} seeds "
            f"differs by more than 2 percentage points"
        )


def test_sequence_independence():
    """Test that consecutive line generations are independent."""
    NUM_PAIRS = 5000
    yarrow = YarrowStalks(seed=42)

    # Generate pairs of consecutive lines
    pairs = [
        (yarrow.generate_single_line_value(), yarrow.generate_single_line_value())
        for _ in range(NUM_PAIRS)
    ]

    # Count transitions between line values
    transitions = {}
    for first, second in pairs:
        if first not in transitions:
            transitions[first] = Counter()
        transitions[first][second] += 1

    # Print transition probabilities
    print("\nSequence Independence Test:")
    print("==========================")
    print(f"Number of pairs analyzed: {NUM_PAIRS}")
    print("\nTransition Probabilities (from row to column):")
    print("--------------------------------------------")
    print("       | 6 (Old Yin) | 7 (Young Yang) | 8 (Young Yin) | 9 (Old Yang)")
    print("---------------------------------------------------------------")

    expected = {6: 1 / 16, 7: 5 / 16, 8: 7 / 16, 9: 3 / 16}

    for first in sorted(transitions.keys()):
        total = sum(transitions[first].values())
        probs = [transitions[first].get(second, 0) / total for second in [6, 7, 8, 9]]
        first_name = ["Old Yin", "Young Yang", "Young Yin", "Old Yang"][first - 6]
        print(
            f"{first} ({first_name}) | {probs[0]:.6f}    | {probs[1]:.6f}      | "
            f"{probs[2]:.6f}     | {probs[3]:.6f}"
        )

    # Check that second line probabilities are independent of first line
    for first_line in transitions:
        total_after_first = sum(transitions[first_line].values())
        second_probs = {
            line: count / total_after_first for line, count in transitions[first_line].items()
        }

        # Verify each second line probability is close to expected
        for line, expected_prob in expected.items():
            assert abs(second_probs.get(line, 0) - expected_prob) < 0.02, (
                f"Transition probability from {first_line} to {line} "
                f"differs by more than 2 percentage points"
            )


if __name__ == "__main__":
    # Run with pytest -xvs test_probability.py
    test_yarrow_stalk_probabilities()
    test_multiple_seeds()
    test_sequence_independence()
