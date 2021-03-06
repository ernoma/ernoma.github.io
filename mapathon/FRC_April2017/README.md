
Mapathon statistics and visualization, and few scripts to create the data.

Basic process for data preparation via command line (assuming you have Python 3, ogr2ogr, and such installed):

1. wget http://tasks.hotosm.org/project/2261/tasks.json
2. ogr2ogr -f GeoJSON -explodecollections output.geojson tasks.json -dialect sqlite -sql "SELECT ST_Union(geometry) as geometry FROM OGRGeoJSON"
3. wget http://download.geofabrik.de/africa/tanzania-updates/000/001/415.osc.gz
4. gunzip 415.osc.gz
5. python create_mapathon_changes.py 415.osc output.geojson 2017-02-08 15 tanzania
6. wget http://download.geofabrik.de/africa/kenya-updates/000/000/860.osc.gz
7. gunzip 860.osc.gz
8. python create_mapathon_changes.py 860.osc output.geojson 2017-02-08 15 kenya
9. python create_users_list.py --dir tanzania kenya

Finally edit the index.html and mapathon.js according to the mapathon details.

Note that the timestamp date of the .osc file should be same as the date of the mapathon (and have later time than the time of the mapathon). You can check the timestamps from the .state.txt files. For example, for the 415.osc.gz file there is file http://download.geofabrik.de/africa/tanzania-updates/000/001/415.state.txt. Also the directory listing at the Geofabrik shows dates (for example: http://download.geofabrik.de/africa/tanzania-updates/000/001/).
