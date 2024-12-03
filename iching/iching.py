import random
import json
import requests
from bs4 import BeautifulSoup
from typing import List, Dict

def get_hexagram_links(url: str) -> List[str]:
    response = requests.get(url)
    response.raise_for_status()
    soup = BeautifulSoup(response.content, 'html.parser')
    return [a['href'] for a in soup.select('div.h3 a')

def extract_reading_from_page(url: str) -> Dict[str, str | List[str]]:
    response = requests.get(url)
    response.raise_for_status()
    soup = BeautifulSoup(response.content, 'html.parser')
    hexagram_number: int = int(soup.select_one('div.h3').text.split()[1])
    hexagram_name: str = soup.select_one('div.h3').text.split('Hexagram ')[1.strip()
    judgment: str = soup.select_one('div.judgment').text.strip()
    line_readings: List[str] = [line.text.strip() for line in soup.select('div.line')]
    return {
        "number": str(hexagram_number),
        "name": hexagram_name,
        "judgment": judgment,
        "line_readings": line_readings
    }

def generate_hexagram() -> List[int]:
    return [random.choice([6, 7, 8, 9]) for _ in range(6)]

def get_changing_lines(hexagram: List[int]) -> tuple[List[int], List[int]]:
    changing_lines = [i for i, line in enumerate(hexagram) if line in [6, 9]]
    transformed_hexagram = hexagram[:]
    for i in changing_lines:
        if transformed_hexagram[i] == 6:
            transformed_hexagram[i] = 7
        elif transformed_hexagram[i] == 9:
            transformed_hexagram[i] = 8
    return changing_lines, transformed_hexagram

def get_reading(hexagram_number: int, changing_lines: List[int]) -> Dict[str, str | List[str]]:
    try:
        with open('iching_readings.json', 'r', encoding='utf-8') as f:
            all_readings = json.load(f)
        reading = all_readings[str(hexagram_number)]
        if changing_lines:
            reading["changing_lines"] = [reading["line_readings"][i] for i in changing_lines]
        return reading
    except FileNotFoundError:
        return {"error": "Readings file not found."}
    except KeyError:
        return {"error": f"Reading for hexagram {hexagram_number} not found."}

if __name__ == "__main__":
    readings_file = 'iching_readings.json'
    base_url = "https://www.cafeausoul.com/iching/hexagrams/"
    try:
        with open(readings_file, 'r', encoding='utf-8') as f:
            all_readings = json.load(f)
    except FileNotFoundError:
        print("Readings file not found. Scraping readings...")
        hexagram_links = get_hexagram_links(base_url)
        all_readings = {}
        for link in hexagram_links:
            try:
            reading = extract_reading_from_page(base_url + link)
                all_readings[reading["number"]] = reading
            except ValueError as e:
                print(f"Error scraping {link}: {e}")
        with open(readings_file, 'w', encoding='utf-8') as f:
            json.dump(all_readings, f, indent=4)
        print("Scraping complete. Readings saved to file.")
    generated_hexagram = generate_hexagram()
    changing_lines, transformed_hexagram = get_changing_lines(generated_hexagram)
    hexagram_number = int("".join(map(str, generated_hexagram)))
    reading = get_reading(hexagram_number, changing_lines)
    print("\n--- I Ching Reading ---")
    print(f"Generated Hexagram: {generated_hexagram}")
    print(f"Changing Lines: {changing_lines}")
    print(f"Transformed Hexagram: {transformed_hexagram}")
    print(reading)