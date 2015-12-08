define({ "api": [
  {
    "type": "put",
    "url": "/changeset/create",
    "title": "Create a changeset",
    "group": "Changeset",
    "name": "CreateChangeset",
    "description": "<p>Given a user and a user ID, create a new changeset and return the newly created changeset ID.</p> ",
    "version": "0.1.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "uid",
            "description": "<p>User ID</p> "
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "user",
            "description": "<p>User name</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>Created changeset ID</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\"id\":\"1194\"}",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Example Usage: ",
        "content": "curl -X PUT --data \"uid=1&user=openroads\" http://localhost:4000/changeset/create",
        "type": "curl"
      }
    ],
    "filename": "routes/changeset-create.js",
    "groupTitle": "Changeset"
  },
  {
    "type": "POST",
    "url": "/upload/[changesetId]",
    "title": "Bulk Upload",
    "group": "Changeset",
    "name": "UploadBulk",
    "description": "<p>Upload OSM Changeset Data to a given changeset. Return the changeset and a bounding box that covers the location of its edits.</p> ",
    "version": "0.1.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "changesetID",
            "description": "<p>Changeset ID</p> "
          },
          {
            "group": "Parameter",
            "type": "File",
            "optional": false,
            "field": "file",
            "description": "<p>OSM XML File</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "changeset",
            "description": "<p>Changeset object</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "changeset.id",
            "description": "<p>Changeset ID.</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "changeset.user_id",
            "description": "<p>Changeset User ID.</p> "
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "changeset.created_at",
            "description": "<p>Changeset Date of creation.</p> "
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "changeset.min_lat",
            "description": "<p>Min Latitude of bounding box.</p> "
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "changeset.max_lat",
            "description": "<p>Max Latitude of bounding box.</p> "
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "changeset.min_lon",
            "description": "<p>Min Longitude of bounding box.</p> "
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "changeset.max_lon",
            "description": "<p>Max Longitude of bounding box.</p> "
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "changeset.closed_at",
            "description": "<p>Changeset Date of creation.</p> "
          },
          {
            "group": "Success 200",
            "type": "number",
            "optional": false,
            "field": "changeset.num_changes",
            "description": "<p>Number of edits in this changeset.</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\"changeset\":\n  {\n   \"id\":\"1\",\n   \"user_id\":\"2254600\",\n   \"created_at\":\"2015-03-13T03:51:39.000Z\",\n   \"min_lat\":97923478,\n   \"max_lat\":97923478,\n   \"min_lon\":1239780018,\n   \"max_lon\":1239780018,\n   \"closed_at\":\"2015-04-21T18:44:51.858Z\",\n   \"num_changes\":31076\n   }\n}",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Example Usage: ",
        "content": "curl -d @road.osm http://localhost:4000/upload",
        "type": "curl"
      }
    ],
    "filename": "routes/osc-upload.js",
    "groupTitle": "Changeset"
  },
  {
    "type": "POST",
    "url": "/changeset/:id/upload",
    "title": "Upload changeset data",
    "group": "Changeset",
    "name": "UploadChangeset",
    "description": "<p>Upload JSON Changeset Data to given changeset Return the changeset and a bounding box that covers the location of its edits.</p> <p>The OSM Change JSON Format is the of the form</p> <pre><code> {  <br>   \"version\": 0.1, <br>   \"generator\": \"iD\", <br>   \"create\": {},  <br>   \"modify\": {},  <br>   \"delete\": {}, <br> } </code></pre>  <p>Each of the create, modify and delete blocks can contain entities such as Node, Way or Relation. Check the API Usage Example for more detail.</p> ",
    "version": "0.1.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>Changeset ID</p> "
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "osmChange",
            "description": "<p>OSM Changeset Data in JSON</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "changeset",
            "description": "<p>Changeset object</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "changeset.id",
            "description": "<p>Changeset ID.</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "changeset.user_id",
            "description": "<p>Changeset User ID.</p> "
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "changeset.created_at",
            "description": "<p>Changeset Date of creation.</p> "
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "changeset.min_lat",
            "description": "<p>Min Latitude of bounding box.</p> "
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "changeset.max_lat",
            "description": "<p>Max Latitude of bounding box.</p> "
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "changeset.min_lon",
            "description": "<p>Min Longitude of bounding box.</p> "
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "changeset.max_lon",
            "description": "<p>Max Longitude of bounding box.</p> "
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "changeset.closed_at",
            "description": "<p>Changeset Date of creation.</p> "
          },
          {
            "group": "Success 200",
            "type": "number",
            "optional": false,
            "field": "changeset.num_changes",
            "description": "<p>Number of edits in this changeset.</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n\"changeset\":\n  {\n   \"id\":\"1\",\n   \"user_id\":\"2254600\",\n   \"created_at\":\"2015-03-13T03:51:39.000Z\",\n   \"min_lat\":97923478,\n   \"max_lat\":97923478,\n   \"min_lon\":1239780018,\n   \"max_lon\":1239780018,\n   \"closed_at\":\"2015-04-21T18:44:51.858Z\",\n   \"num_changes\":31076\n   },\n\"created\":\n  {\n   \"node\":{\n     \"-1\":\"743049\",\n     \"-2\":\"743050\",\n     \"-3\":\"743051\"\n     },\n   \"way\":{\n     \"-1\":\"168483\"\n     }\n   }\n }",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Example Usage:",
        "content": "curl -d '{\n \"osmChange\": {\n   \"version\":0.1,\n   \"generator\":\"openroads-iD\",\n   \"create\":{ },\n   \"modify\":{\n     \"node\":[\n       {\"id\":\"21851\",\n        \"lon\":123.9780018,\n        \"lat\":9.7923478,\"version\":\"1\", \"tag\":[],\n        \"changeset\":1 }]\n   },\n   \"delete\": {}\n }\n}' -H 'Content-Type: application/json' http://localhost:4000/changeset/1/upload",
        "type": "curl"
      }
    ],
    "filename": "routes/changeset-upload.js",
    "groupTitle": "Changeset"
  },
  {
    "type": "get",
    "url": "/relations/:id",
    "title": "Get relation by ID",
    "group": "Features",
    "name": "GetRelation",
    "version": "0.1.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>Relation ID.</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "relation",
            "description": "<p>Relation</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "relation.id",
            "description": "<p>Relation id.</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "relation.timestamp",
            "description": "<p>Relation creation date.</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "relation.visible",
            "description": "<p>Whether entity can be rendered.</p> "
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "relation.tags",
            "description": "<p>Tags associated to this relation.</p> "
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "relation.members",
            "description": "<p>List of members belonging to this relation</p> "
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "relation.members.relation_id",
            "description": "<p>ID of relation</p> "
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "relation.members.relation_type",
            "description": "<p>Type of member (Way or Node)</p> "
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "relation.members.member_id",
            "description": "<p>ID of member</p> "
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "relation.members.member_role",
            "description": "<p>Member role</p> "
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "relation.members.sequence_id",
            "description": "<p>Order of member within relation</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "[\n  {\n  \"id\": \"260\",\n  \"changeset_id\": \"1\",\n  \"timestamp\": \"2015-04-21T17:31:51.105Z\",\n  \"visible\": true,\n  \"version\": \"1\",\n  \"tags\": [{\n    \"relation_id\": \"260\",\n    \"k\": \"test\",\n    \"v\": \"relation_endpoint\"\n    }],\n  \"members\": [\n  {\n    \"relation_id\": \"260\",\n    \"member_type\": \"Node\",\n    \"member_id\": \"698236\",\n    \"member_role\": \" \",\n    \"sequence_id\": 0\n   },\n  ...\n  ]\n}]",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Example Usage: ",
        "content": "curl http://localhost:4000/relations/260",
        "type": "curl"
      }
    ],
    "filename": "routes/relations.js",
    "groupTitle": "Features"
  },
  {
    "type": "get",
    "url": "/relations?key1=value1&key2=value2",
    "title": "Query relations by tag",
    "group": "Features",
    "name": "GetRelations",
    "description": "<p>Get relations that either belong to a way, or are tagged with an attribute.</p> ",
    "version": "0.1.0",
    "parameter": {
      "fields": {
        "Querying by way ID": [
          {
            "group": "Querying by way ID",
            "type": "String",
            "optional": false,
            "field": "member",
            "description": "<p>member=WayID eg. member=32</p> "
          }
        ],
        "Querying by tag": [
          {
            "group": "Querying by tag",
            "type": "String",
            "optional": false,
            "field": "tag_name",
            "description": "<p>tag=value eg. road_condition=poor</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "relations",
            "description": "<p>List of relations</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "relations.id",
            "description": "<p>Relation id.</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "relations.timestamp",
            "description": "<p>Relation creation date.</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "relations.visible",
            "description": "<p>Whether entity can be rendered.</p> "
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "relations.tags",
            "description": "<p>Tags associated to this relation.</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "[\n  {\n    \"id\": \"260\",\n    \"changeset_id\": \"1\",\n    \"timestamp\": \"2015-04-21T17:31:51.105Z\",\n    \"visible\": true,\n    \"version\": \"1\",\n    \"tags\": [\n    {\n      \"relation_id\": \"260\",\n      \"k\": \"test\",\n      \"v\": \"relation_endpoint\"\n    }]\n  }\n]",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Querying by member: ",
        "content": "curl http://localhost:4000/relations?member=168329",
        "type": "curl"
      },
      {
        "title": "Querying by tag: ",
        "content": "curl http://localhost:4000/relations?test=relation_endpoint",
        "type": "curl"
      }
    ],
    "filename": "routes/relations.js",
    "groupTitle": "Features"
  },
  {
    "type": "get",
    "url": "/xml/node/:id",
    "title": "Get node by Id",
    "group": "Features",
    "name": "XmlNode",
    "description": "<p>Returns OSM XML of requested Node.</p> ",
    "version": "0.1.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "nodeId",
            "description": "<p>Node ID.</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "XML",
            "optional": false,
            "field": "node",
            "description": "<p>Node</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "node.id",
            "description": "<p>Entity ID</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "node.visible",
            "description": "<p>Whether entity can be rendered</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "node.version",
            "description": "<p>Number of edits made to this entity</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "node.changeset",
            "description": "<p>Most recent changeset</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "node.timestamp",
            "description": "<p>Most recent edit</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "node.user",
            "description": "<p>User that created entity</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "node.uid",
            "description": "<p>User ID that created entity</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "node.lat",
            "description": "<p>Entity latitude</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "node.lon",
            "description": "<p>Entity longitude</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "<osm version=\"6\" generator=\"OpenRoads\">\n  <node id=\"74038\" visible=\"true\" \n    version=\"1\" changeset=\"0\" \n    timestamp=\"Wed Mar 11 2015 09:38:41 GMT+0000 (UTC)\" \n    user=\"OpenRoads\" uid=\"1\" \n    lat=\"9.5820416\" lon=\"123.8162931\"/>\n</osm>",
          "type": "xml"
        }
      ]
    },
    "examples": [
      {
        "title": "Example Usage: ",
        "content": "curl http://localhost:4000/xml/node/74038",
        "type": "curl"
      }
    ],
    "filename": "routes/nodes.js",
    "groupTitle": "Features"
  },
  {
    "type": "get",
    "url": "/xml/way/:wayId/[full]",
    "title": "Get way by ID",
    "group": "Features",
    "name": "XmlWay",
    "description": "<p>Returns OSM XML of requested Way along with full  representation of nodes in that way. Appending <code>/full</code> to the endpoint  returns the same result.</p> ",
    "version": "0.1.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>Way ID.</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "XML",
            "optional": false,
            "field": "way",
            "description": "<p>Relation</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "way.id",
            "description": "<p>Entity ID</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "way.visible",
            "description": "<p>Whether entity can be rendered</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "way.version",
            "description": "<p>Number of edits made to this entity</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "way.changeset",
            "description": "<p>Most recent changeset</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "way.timestamp",
            "description": "<p>Most recent edit</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "way.user",
            "description": "<p>User that created entity</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "way.uid",
            "description": "<p>User ID that created entity</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "way.lat",
            "description": "<p>Entity latitude</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "way.lon",
            "description": "<p>Entity longitude</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "<osm version=\"6\" generator=\"OpenRoads\">\n  <node id=\"27\" visible=\"true\" version=\"1\" changeset=\"0\" timestamp=\"Wed Mar 11 2015 09:38:41 GMT+0000 (UTC)\" user=\"OpenRoads\" uid=\"1\" lat=\"9.787903\" lon=\"123.939617\"/>\n  <node id=\"28\" visible=\"true\" version=\"1\" changeset=\"0\" timestamp=\"Wed Mar 11 2015 09:38:41 GMT+0000 (UTC)\" user=\"OpenRoads\" uid=\"1\" lat=\"9.788083\" lon=\"123.939679\"/>\n  <way id=\"26\" visible=\"true\" version=\"1\" changeset=\"0\" timestamp=\"Wed Mar 11 2015 09:38:41 GMT+0000 (UTC)\" user=\"OpenRoads\" uid=\"1\">\n    <nd ref=\"27\"/>\n    <nd ref=\"28\"/>\n    <tag k=\"highway\" v=\"unclassified\"/>\n    <tag k=\"or_rdclass\" v=\"barangay\"/>\n  </way>\n</osm>",
          "type": "xml"
        }
      ]
    },
    "examples": [
      {
        "title": "Example Usage: ",
        "content": "curl http://localhost:4000/xml/way/26",
        "type": "curl"
      }
    ],
    "filename": "routes/way.js",
    "groupTitle": "Features"
  },
  {
    "type": "get",
    "url": "/map",
    "title": "GeoJSON - Get entities in bounding box",
    "group": "bbox",
    "name": "Map",
    "version": "0.1.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number[4]",
            "optional": false,
            "field": "bbox",
            "description": "<p>[min_lon, min_lat, max_lon, max_lat]</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "GeoJSON",
            "optional": false,
            "field": "FeatureCollection",
            "description": "<p>List of OSM Roads</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n  \"type\": \"FeatureCollection\",\n  \"properties\": {},\n  \"features\": [\n    {\n      \"type\": \"Feature\",\n      \"properties\": {\n        \"highway\": \"secondary\",\n        \"or_rdclass\": \"provincial\",\n        \"or_brgy\": \"Dao\",\n        \"name\": \"TINAGO_DAO ROAD\",\n        \"or_mun\": \"Dauis\",\n        \"rd_cond\": \"poor\",\n        \"source\": \"OpenRoads\"\n       },\n      \"geometry\": {\n        \"type\": \"LineString\",\n        \"coordinates\": [[123.8149137,9.5920337],\n          ...\n        ]}\n    }, \n  ...]\n}",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Example Usage: ",
        "content": "curl http://localhost:4000/map?bbox=123.81042480468751,9.584500864717155,123.81591796875,9.58991730708743",
        "type": "curl"
      }
    ],
    "filename": "routes/map-json.js",
    "groupTitle": "bbox"
  },
  {
    "type": "get",
    "url": "/xml/map",
    "title": "OSM XML - Get entities in bounding box",
    "group": "bbox",
    "name": "XmlMap",
    "description": "<p>Returns an OSM XML list of entities within the  provided bounding box</p> ",
    "version": "0.1.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number[4]",
            "optional": false,
            "field": "bbox",
            "description": "<p>[min_lon, min_lat, max_lon, max_lat]</p> "
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Example Usage: ",
        "content": "curl http://localhost:4000/xml/map?bbox=123.81042480468751,9.584500864717155,123.81591796875,9.58991730708743",
        "type": "curl"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "<osm version=\"6\" generator=\"OpenRoads\">\n<bounds minlat=\"9.584500864717155\" minlon=\"123.81042480468\" maxlat=\"9.58991730708\" maxlon=\"123.81591796875\"/>\n  <node id=\"74038\" changeset=\"1\" timestamp=\"Wed Mar 11 2015 09:38:41 GMT+0000\" lat=\"9.5820416\" lon=\"123.81629\"/>\n  <node id=\"77930\" changeset=\"1\" timestamp=\"Wed Mar 11 2015 09:38:41 GMT+0000\" lat=\"9.5920337\" lon=\"123.81491\"/>\n  ...\n  <way id=\"77931\" visible=\"true\" version=\"1\" changeset=\"0\" timestamp=\"Wed Mar 11 2015 09:38:41 GMT+0000\">\n    <nd ref=\"77930\"/>\n    <nd ref=\"77932\"/>\n    ...\n    <tag k=\"highway\" v=\"secondary\"/>\n    <tag k=\"or_rdclass\" v=\"provincial\"/>\n    <tag k=\"or_brgy\" v=\"Dao\"/>\n  </way>\n</osm>",
          "type": "xml"
        }
      ]
    },
    "filename": "routes/map.js",
    "groupTitle": "bbox"
  }
] });