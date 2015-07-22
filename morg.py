#! /usr/bin/env python
# -*- coding: UTF8 -*-

import csv
import json
import os
import random
import sys
import numpy as np
import pandas as pd

bin = os.path.basename(sys.argv[0])
data = json.loads( open('data.json').read() ) # read our dataset as a json object

a = set()
kmax = -sys.maxint - 1
kmin = +sys.maxint
# create a set with each community represented (in this dataset, a list of ints from 1..n)
for k in data['nodes']:
  c = k['community']  # 'community' property of a node is an integer
  a.add(c)

kmin = min(a)
kmax = max(a)

maxs = {}
for i in a:
  maxs[i] = -sys.maxint - 1

# read in a list of cities and their coordinates as a dictionary
cityfile = open('cities.csv', 'r')
cities = list( csv.DictReader(cityfile) )

# input lat/lon is given in degrees and minutes. convert to decimal and add to record
for row in cities:
  row['lat'] = (float(row['lat_deg']) + float(row['lat_min'])/60.0) * (1.0 if (row['NS'] == 'N') else -1.0)
  row['lon'] = (float(row['lon_deg']) + float(row['lon_min'])/60.0) * (1.0 if (row['EW'] == 'E') else -1.0)

# randomize the cities each node is attached to
# do this with a function that makes it more likely (25% chance) that
# nodes at the front of the community list will choose a different city
# than the one they are already in.
# if a new city is chosen, chose one near it on the list (not 
# geographically). if we walk off an end of the list, choose
# an entirely new city at random.
c1 = -0.10/(kmax-kmin)     # y = c1*x + c2.  this is c1
c2 = 0.25
for k in data['nodes']:
  c = k['community']       # the node's 'community' is an integer
  y = ((c-kmin)*c1) + c2   # y is f(c)
  r = random.random()      # pick a number between 0 and 1
  if r < y:                # if rand below the function we chose a new city
    c = c + int(round(random.normalvariate(0, 2))) # walk this far up/down the list
    if c not in a:              # make sure we didn't walk off the list of cities
      c = random.choice(cities) # go crazy every once in a while
      #print ">", c['city']
    else:
      c = cities[c]
      #print "<", c['city']
  else:
    c = cities[c]
    #print "=", c['city']
  k['location'] = c

n = 1
for k in data['nodes']:
  # pick new "employee numbers". already have "index" so not sure if this is needed
  n = n + int(random.triangular(1, 100, 5))
  k['empno'] = n
  if k['pr'] > maxs[k['community']]:
    maxs[k['community']] = k['pr']

# loops in loops in loops, oh my. had done in dataframes but then couldn't get back to json correctly
for k in data['nodes']:
  k['prlead'] = False
  for i,v in maxs.iteritems():
    if i == k['community'] and k['pr'] == v:
      print i,v
      k['prlead'] = True
      maxs[i] = sys.maxint # make sure we will not see this community again
    

# i think i have all i needs
#print (json.dumps(data['nodes'], indent=2))

f = open('data2.json', 'w')
f.write(json.dumps(data, indent=2))

















