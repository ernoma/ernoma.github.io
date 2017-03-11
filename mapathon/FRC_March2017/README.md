
Mapathon statistics and visualization, and few scripts to create the data.

Basic data preparation via command line (assuming you have Python 3, ogr2ogr, and such installed):

1. wget http://tasks.hotosm.org/project/2261/tasks.json
2. ogr2ogr -f GeoJSON -explodecollections output.geojson tasks.json -dialect sqlite -sql "SELECT ST_Union(geometry) as geometry FROM OGRGeoJSON"
3. python get_poly.py output.geojson task_2261.poly
4. wget http://download.geofabrik.de/africa/tanzania-updates/000/001/415.osc.gz
5. gunzip 415.osc.gz
6. python create_mapathon_changes.py 415.osc task_2261.poly 2017-02-08 15 tanzania
7. wget http://download.geofabrik.de/africa/kenya-updates/000/000/860.osc.gz
8. gunzip 860.osc.gz
9. python create_mapathon_changes.py 860.osc task_2261.poly 2017-02-08 15 kenya
10. python create_users_list.py --dir tanzania kenya

Finally edit the index.html and mapathon.js according to the mapathon details.
