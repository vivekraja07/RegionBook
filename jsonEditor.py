import json

topo = ""
regionMap = ""
regions = ""

with open("topo.json") as json_file:
    topo = json.load(json_file)

with open("regionMap.json") as json_file:
    
    regionMap = json.load(json_file)
    

states = topo['objects']['regions']['geometries']

def stateAggregator():
    global regions
    regions = {}
    geometries = []
    
    for regionName, stateList in regionMap.items():
        region = {}
        completeArray = []

        for stateNum in stateList:
            arcArray = getArcs(stateNum)
            completeArray = completeArray + arcArray
        
        region['name'] = regionName
        region['type'] = "MultiPolygon"
        region['arcs'] = completeArray

        geometries.append(region)
    
    regions['type'] = 'GeometryCollection'
    regions['geometries'] = geometries
    




def getArcs(stateID):
    for state in states:
        if int(state['id']) == stateID:
            return state['arcs']



stateAggregator()
print(regions)

with open('regions.json', 'w') as fp:
    json.dump(regions, fp)


