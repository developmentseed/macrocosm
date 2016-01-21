'use strict';

var builder = require('xmlbuilder');

var generator = require('../package.json').name;

var rsp = {
  osm: {
    '@version': '0.6',
    '@generator': generator,
    user: {
      '@id': 113624,
      '@display_name': 'mojodna',
      '@account_created': '2009-04-04T18:13:05Z',
      description: '',
      'contributor-terms': {
        '@agreed': true,
        '@pd': true
      },
      img: {
        '@href': 'https://www.gravatar.com/avatar/a0b49382b6dcd9dd4602c3088717724e.jpg?s=256&amp;d=https%3A%2F%2Fwww.openstreetmap.org%2Fassets%2Fusers%2Fimages%2Flarge-afe7442b856c223cca92b1a16d96a3266ec0c86cac8031269e90ef93562adb72.png'
      },
      roles: {},
      changesets: {
        '@count': 360
      },
      traces: {
        '@count': 14
      },
      blocks: {
        received: {
          '@count': 0,
          '@active': 0
        }
      },
      home: {
        '@lat': '40.011994269846',
        '@lon': '-105.29108771854',
        '@zoom': 3
      },
      languages: {
        lang: ['en-US', 'en']
      },
      messages: {
        received: {
          '@count': 6,
          '@unread': 0
        },
        sent: {
          '@count': 6
        }
      }
    }
  }
};

module.exports = [
  {
    /**
     * @api {GET} /api/0.6/user/details Current User Details
     * @apiGroup Misc
     * @apiName UserDetails06
     * @apiDescription Return metadata about the currently authenticated user.
     * Required by the iD editor. Because authentication is unimplemented, stub
     * data is returned.
     *
     * @apiExample {curl} Example Usage:
     *  curl http://localhost:4000/api/0.6/user/details
     *
     * @apiSuccessExample {xml} Success-Response:
     *  <?xml version="1.0"?>
     *  <osm version="0.6" generator="macrocosm">
     *    <user id="113624" display_name="mojodna" account_created="2009-04-04T18:13:05Z">
     *      <description/>
     *      <contributor-terms agreed="true" pd="true"/>
     *      <img href="https://www.gravatar.com/avatar/a0b49382b6dcd9dd4602c3088717724e.jpg?s=256&amp;amp;d=https%3A%2F%2Fwww.openstreetmap.org%2Fassets%2Fusers%2Fimages%2Flarge-afe7442b856c223cca92b1a16d96a3266ec0c86cac8031269e90ef93562adb72.png"/>
     *      <roles/>
     *      <changesets count="360"/>
     *      <traces count="14"/>
     *      <blocks>
     *        <received count="0" active="0"/>
     *      </blocks>
     *      <home lat="40.011994269846" lon="-105.29108771854" zoom="3"/>
     *      <languages>
     *        <lang>en-US</lang>
     *        <lang>en</lang>
     *      </languages>
     *      <messages>
     *        <received count="6" unread="0"/>
     *        <sent count="6"/>
     *      </messages>
     *    </user>
     *  </osm>
     */
    method: 'GET',
    path: '/api/0.6/user/details',
    handler: function(req, res) {
      var response = res(builder.create(rsp).end({
        pretty: true
      }));

      response.type('text/xml');
    }
  }
];
