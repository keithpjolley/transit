# transit
by keith p jolley
copywrite 2015

### purpose
an exercise to show how to transition between multiple d3 coordinate systems, including force-directed.

### workflow

* download this project into a subdirectory of a running web server
* download **d3** and put here (or modify index.html): `../include/js/d3/d3.v3.min.js`
* download **topjson** and put here (or where-ever): `../include/js/d3/topo/topojson.v1.min.js`
* download **world-50m** and put here (or where-ever): `../include/js/d3/topo/world-50m.json`
* run a query on the enron dataset and copy the resulting json file into the local directory 
* run `morg.py` on the json file to add (fictional/arbitrary) city locations to each node
* data json file needs to be in "data2.json". copy data.large.json in for a bigger dataset.

### todo
- [x] create this document
- [x] insert community legends
- [ ] document code
