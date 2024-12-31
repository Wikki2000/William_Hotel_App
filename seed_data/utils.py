#!/usr/bin/python3
"""Defines helper function for populating data"""
import os
from typing import List, Dict
import json


def read_image_file(file_path: str) -> bytes:
    """
    Read binary of images file

    :file_path - The path to image file
    :rtype - The binary of the image file read.
    """
    with open(file_path, "rb") as f:
        binary_data = f.read()
    return binary_data


def get_file_names(directory_path: str) -> List[str]:
    """
    Get list of file name in a directory.

    :directory_path - The path to directory
    :rtype - The list of the files in the dircetory.
    """
    directory_files = os.listdir(directory)  # Get durectory files with path

    # Extract the base file name only excluding it full path
    file_names = [os.path.basename(file_name) for file_name in directory_files]
    return file_names


def read_json_file(file_path: str) -> Dict:
    """Read content of json file."""
    with open(file_path, 'r') as file:
        data = json.load(file)
    return data

def write_json(file_path: str, data: Dict[any, any]) -> Dict:
    """Write data to json file"""
    with open(file_path, "wb") as f:
        json.dump(data, f, indent=4)
        print(f"Data successfully written to {file_path}")
