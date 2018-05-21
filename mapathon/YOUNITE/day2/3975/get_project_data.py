#!/usr/bin/env python3

import json
import argparse
import requests

parser = argparse.ArgumentParser()
parser.add_argument("project_number", help="number of the HOT-OSM project")
args = parser.parse_args()

url = 'https://tasks.hotosm.org/api/v1/project/' + args.project_number

response = requests.get(url)
data = response.json()
tasks = data['tasks']
tasks['name'] = 'OGRGeoJSON' # Helps with GDAL 2.2 and later

with open('tasks.json', 'w') as outfile:
    json.dump(tasks, outfile)
    
