#!/usr/bin/env python3

import json
from os import listdir
import argparse
parser = argparse.ArgumentParser()
parser.add_argument("--dir", nargs="+", help="one or more directories that contain the json files that user names are extracted from")
args = parser.parse_args()

#print(args.dir)

users = []

for dirname in args.dir:
    files = [filename for filename in listdir(dirname) if filename.endswith('.json')]
    #print(files)

    for json_file in files:
        path = dirname + '/' + json_file
        #print(path)
        with open(path) as data_file:
            json_data = json.load(data_file)
            for element in json_data:
                #print(element['user'])
                if element['user'] not in users:
                    users.append(element['user'])

with open('usernames.json', 'w') as outfile:
    json.dump(users, outfile)
    
